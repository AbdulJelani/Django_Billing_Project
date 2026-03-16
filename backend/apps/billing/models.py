from django.db import models
import uuid
from decimal import Decimal


class Purchase(models.Model):
    """
    Purchase record.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer_email = models.EmailField(db_index=True)
    
    # Totals
    total_price_without_tax = models.DecimalField(max_digits=12, decimal_places=2)
    total_tax = models.DecimalField(max_digits=12, decimal_places=2)
    net_price = models.DecimalField(max_digits=12, decimal_places=2)
    rounded_net_price = models.DecimalField(max_digits=12, decimal_places=2)
    cash_paid = models.DecimalField(max_digits=12, decimal_places=2)
    balance = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Denomination input snapshot
    denominations_given = models.JSONField(default=dict)
    balance_denomination = models.JSONField(default=dict)
    
    invoice_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['customer_email', '-created_at']),
        ]

    def __str__(self):
        return f"Purchase {self.id} - {self.customer_email}"


class PurchaseItem(models.Model):
    """
    Individual items in a purchase.
    """
    purchase = models.ForeignKey(
        Purchase, on_delete=models.CASCADE, related_name='items'
    )
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.PROTECT,
        related_name='purchase_items'
    )
    # Snapshot at time of purchase
    product_code = models.CharField(max_length=50)
    unit_price_snapshot = models.DecimalField(max_digits=10, decimal_places=2)
    tax_percentage_snapshot = models.DecimalField(max_digits=5, decimal_places=2)
    quantity = models.PositiveIntegerField()
    
    # Computed
    purchase_price = models.DecimalField(max_digits=12, decimal_places=2)   # qty * unit_price
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)      # with tax

    class Meta:
        indexes = [
            models.Index(fields=['purchase', 'product']),
        ]
