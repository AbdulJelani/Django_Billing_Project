from rest_framework import serializers
from .models import Purchase, PurchaseItem
from apps.products.models import Product


class BillingItemInputSerializer(serializers.Serializer):
    product_id = serializers.CharField()
    quantity = serializers.IntegerField(min_value=1)


class CreateBillSerializer(serializers.Serializer):
    customer_email = serializers.EmailField()
    items = BillingItemInputSerializer(many=True, min_length=1)
    denominations = serializers.DictField(
        child=serializers.IntegerField(min_value=0),
        required=False,
        default=dict
    )
    cash_paid = serializers.DecimalField(max_digits=12, decimal_places=2)

    def validate_cash_paid(self, value):
        if value <= 0:
            raise serializers.ValidationError("Cash paid must be positive.")
        return value

    def validate_denominations(self, value):
        valid_denoms = {'500', '50', '20', '10', '5', '2', '1'}
        for key in value:
            if key not in valid_denoms:
                raise serializers.ValidationError(f"Invalid denomination: {key}")
        return value


class PurchaseItemOutputSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseItem
        fields = [
            'product_code', 'unit_price_snapshot', 'quantity',
            'purchase_price', 'tax_percentage_snapshot',
            'tax_amount', 'total_price'
        ]


class PurchaseOutputSerializer(serializers.ModelSerializer):
    items = PurchaseItemOutputSerializer(many=True, read_only=True)

    class Meta:
        model = Purchase
        fields = [
            'id', 'customer_email', 'items',
            'total_price_without_tax', 'total_tax',
            'net_price', 'rounded_net_price',
            'cash_paid', 'balance',
            'denominations_given', 'balance_denomination',
            'invoice_sent', 'created_at',
        ]


class PurchaseListSerializer(serializers.ModelSerializer):
    """Serializer for purchase list view."""
    class Meta:
        model = Purchase
        fields = ['id', 'customer_email', 'rounded_net_price', 'created_at', 'invoice_sent']
