from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['product_id', 'name', 'price', 'tax_percentage', 'available_stocks', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'product_id']
    list_editable = ['available_stocks', 'is_active']
