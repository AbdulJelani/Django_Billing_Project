from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.cache import cache
from .models import Product
from .serializers import ProductSerializer


class ProductViewSet(viewsets.ModelViewSet):
    """
    CRUD for products.
    """
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    filterset_fields = ['is_active']
    search_fields = ['name', 'product_id']

    def get_queryset(self):
        return Product.objects.filter(is_active=True).order_by('name')

    def list(self, request, *args, **kwargs):
        # Cache product list
        cache_key = "product_list"
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)
        response = super().list(request, *args, **kwargs)
        cache.set(cache_key, response.data, timeout=600)
        return response

    def perform_create(self, serializer):
        cache.delete("product_list")
        serializer.save()

    def perform_update(self, serializer):
        cache.delete("product_list")
        serializer.save()
