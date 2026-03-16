from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    price_with_tax = serializers.ReadOnlyField()
    tax_amount_per_unit = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'product_id', 'available_stocks',
            'price', 'tax_percentage', 'price_with_tax',
            'tax_amount_per_unit', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be positive.")
        return value

    def validate_tax_percentage(self, value):
        if not (0 <= value <= 100):
            raise serializers.ValidationError("Tax must be between 0 and 100.")
        return value
