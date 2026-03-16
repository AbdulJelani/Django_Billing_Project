from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.core.cache import cache
from .serializers import CreateBillSerializer, PurchaseOutputSerializer, PurchaseListSerializer
from .services import BillingService
from .tasks import send_invoice_email
from .models import Purchase
import logging

logger = logging.getLogger(__name__)


class GenerateBillView(APIView):
    """
    POST /api/billing/generate/
    """
    permission_classes = [AllowAny]  # Public endpoint for billing

    def post(self, request):
        serializer = CreateBillSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        # Validate products
        validated_items, errors = BillingService.validate_products(data['items'])
        if errors:
            return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

        # Step 2: Calculate bill
        bill = BillingService.calculate_bill(validated_items)

        # Step 3: Validate cash >= rounded_net_price
        if data['cash_paid'] < bill['rounded_net_price']:
            return Response(
                {'error': f"Insufficient cash. Bill total: ₹{bill['rounded_net_price']}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Step 4: Create purchase atomically
        try:
            purchase, balance_denom = BillingService.create_purchase({
                'customer_email': data['customer_email'],
                'bill': bill,
                'cash_paid': data['cash_paid'],
                'denominations': data.get('denominations', {}),
            })
        except Exception as e:
            logger.error(f"Purchase creation failed: {e}")
            return Response(
                {'error': 'Failed to create purchase. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        send_invoice_email.delay(str(purchase.id))

        # Invalidate customer's purchase cache
        cache.delete(f"purchases_{data['customer_email']}")

        return Response(
            PurchaseOutputSerializer(purchase).data,
            status=status.HTTP_201_CREATED
        )


class CustomerPurchaseHistoryView(generics.ListAPIView):
    """
    GET /api/billing/history/?email=customer@example.com
    Lists all purchases by a customer.
    """
    serializer_class = PurchaseListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        email = self.request.query_params.get('email', '').strip()
        if not email:
            return Purchase.objects.none()
        return Purchase.objects.filter(
            customer_email__iexact=email
        ).only('id', 'customer_email', 'rounded_net_price', 'created_at', 'invoice_sent')

    def list(self, request, *args, **kwargs):
        email = request.query_params.get('email', '').strip()
        if not email:
            return Response({'error': 'Email is required.'}, status=400)

        # Cache per customer email
        cache_key = f"purchases_{email}"
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        response = super().list(request, *args, **kwargs)
        cache.set(cache_key, response.data, timeout=300)  # Cache 5 mins
        return response


class PurchaseDetailView(generics.RetrieveAPIView):
    """
    GET /api/billing/purchases/<uuid>/
    Full detail of one purchase including all items.
    """
    serializer_class = PurchaseOutputSerializer
    permission_classes = [AllowAny]
    queryset = Purchase.objects.prefetch_related('items__product')
    lookup_field = 'id'
