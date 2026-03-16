from django.core.management.base import BaseCommand
from apps.products.models import Product


class Command(BaseCommand):
    help = 'Seed initial products'

    def handle(self, *args, **kwargs):
        products = [
            {'name': 'Rice (1kg)', 'product_id': 'RICE-001', 'available_stocks': 100, 'price': 55.00, 'tax_percentage': 0},
            {'name': 'Sugar (1kg)', 'product_id': 'SUGR-001', 'available_stocks': 80, 'price': 45.00, 'tax_percentage': 5},
            {'name': 'Cooking Oil (1L)', 'product_id': 'OIL-001', 'available_stocks': 60, 'price': 130.00, 'tax_percentage': 5},
            {'name': 'Wheat Flour (1kg)', 'product_id': 'FLUR-001', 'available_stocks': 90, 'price': 38.00, 'tax_percentage': 0},
            {'name': 'Milk (500ml)', 'product_id': 'MILK-001', 'available_stocks': 200, 'price': 28.00, 'tax_percentage': 0},
            {'name': 'Detergent Powder', 'product_id': 'DET-001', 'available_stocks': 50, 'price': 85.00, 'tax_percentage': 18},
            {'name': 'Shampoo (200ml)', 'product_id': 'SHMP-001', 'available_stocks': 40, 'price': 120.00, 'tax_percentage': 18},
        ]
        created = 0
        for p in products:
            _, was_created = Product.objects.get_or_create(product_id=p['product_id'], defaults=p)
            if was_created:
                created += 1
        self.stdout.write(self.style.SUCCESS(f'Seeded {created} products'))
