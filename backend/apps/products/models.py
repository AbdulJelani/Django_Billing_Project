from django.db import models
import uuid


class Product(models.Model):
    """
    Core product entity.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, db_index=True)
    product_id = models.CharField(
        max_length=50, unique=True, db_index=True,
        help_text="Human-readable product code e.g. PROD-001"
    )
    available_stocks = models.PositiveIntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    tax_percentage = models.DecimalField(
        max_digits=5, decimal_places=2,
        help_text="Tax as percentage e.g. 18.00 for 18%"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['product_id']),
            models.Index(fields=['is_active', 'available_stocks']),
        ]

    def __str__(self):
        return f"{self.product_id} - {self.name}"

    @property
    def tax_amount_per_unit(self):
        return (self.price * self.tax_percentage) / 100

    @property
    def price_with_tax(self):
        return self.price + self.tax_amount_per_unit
