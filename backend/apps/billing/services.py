from decimal import Decimal, ROUND_HALF_UP
from typing import List, Dict, Tuple
from django.db import transaction
from apps.products.models import Product
from apps.customers.models import Customer
from .models import Purchase, PurchaseItem


DENOMINATIONS = [500, 50, 20, 10, 5, 2, 1]  # Descending order for greedy algorithm


class BillingService:
    """
    Business logic for billing.
    """

    @staticmethod
    def validate_products(items: List[Dict]) -> Tuple[List[Dict], List[str]]:
        """
        Validates products.
        """
        product_ids = [item['product_id'] for item in items]
        
        # Query products
        products = Product.objects.filter(
            product_id__in=product_ids,
            is_active=True
        ).only('id', 'product_id', 'name', 'price', 'tax_percentage', 'available_stocks')
        
        product_map = {p.product_id: p for p in products}
       
        errors = []
        validated = []

        for item in items:
            pid = item['product_id']
            qty = item['quantity']
           
            
            if pid not in product_map:
                errors.append(f"Product '{pid}' not found or inactive.")
                continue
            
            product = product_map[pid]
            if product.available_stocks < qty:
                errors.append(
                    f"Insufficient stock for '{pid}'. "
                    f"Available: {product.available_stocks}, Requested: {qty}"
                )
                continue
            
            validated.append({'product': product, 'quantity': qty})

        return validated, errors

    @staticmethod
    def calculate_bill(validated_items: List[Dict]) -> Dict:
        """
        Calculate bill.
        """
        line_items = []
        total_without_tax = Decimal('0')
        total_tax = Decimal('0')

        for item in validated_items:
            product = item['product']
            qty = item['quantity']
            
            unit_price = Decimal(str(product.price))
            tax_pct = Decimal(str(product.tax_percentage))
            
            purchase_price = unit_price * qty
            tax_amount = (purchase_price * tax_pct) / Decimal('100')
            total_price = purchase_price + tax_amount

            total_without_tax += purchase_price
            total_tax += tax_amount

            line_items.append({
                'product': product,
                'quantity': qty,
                'unit_price': unit_price,
                'tax_percentage': tax_pct,
                'purchase_price': purchase_price,
                'tax_amount': tax_amount,
                'total_price': total_price,
            })

        net_price = total_without_tax + total_tax
        # Round to nearest integer
        rounded_net = net_price.quantize(Decimal('1'), rounding=ROUND_HALF_UP)

        return {
            'line_items': line_items,
            'total_without_tax': total_without_tax,
            'total_tax': total_tax,
            'net_price': net_price,
            'rounded_net_price': rounded_net,
        }

    @staticmethod
    def calculate_balance_denomination(balance: Decimal, available_denoms: Dict) -> Dict:
        """
        Calculate change denomination.
        """
        balance_int = int(balance)
        result = {}
        
        for denom in DENOMINATIONS:
            if balance_int <= 0:
                break
            denom_str = str(denom)
            available = int(available_denoms.get(denom_str, 0))
            if available <= 0:
                continue
            
            count = min(balance_int // denom, available)
            if count > 0:
                result[denom_str] = count
                balance_int -= count * denom
        
        return result

    @classmethod
    @transaction.atomic  #  stock deduction + purchase creation
    def create_purchase(cls, validated_data: Dict) -> Purchase:
        """
        Creates purchase.
        """
        bill = validated_data['bill']
        cash_paid = Decimal(str(validated_data['cash_paid']))
        balance = cash_paid - bill['rounded_net_price']
        denoms_given = validated_data.get('denominations', {})
        balance_denom = cls.calculate_balance_denomination(balance, denoms_given)

        # Ensure a Customer record exists
        email = validated_data['customer_email']
        Customer.objects.get_or_create(
            email__iexact=email,
            defaults={
                'name': email.split('@')[0],
                'email': email,
            }
        )

        # Create purchase
        purchase = Purchase.objects.create(
            customer_email=validated_data['customer_email'],
            total_price_without_tax=bill['total_without_tax'],
            total_tax=bill['total_tax'],
            net_price=bill['net_price'],
            rounded_net_price=bill['rounded_net_price'],
            cash_paid=cash_paid,
            balance=balance,
            denominations_given=denoms_given,
            balance_denomination=balance_denom,
        )

        # Bulk create line items
        purchase_items = [
            PurchaseItem(
                purchase=purchase,
                product=item['product'],
                product_code=item['product'].product_id,
                unit_price_snapshot=item['unit_price'],
                tax_percentage_snapshot=item['tax_percentage'],
                quantity=item['quantity'],
                purchase_price=item['purchase_price'],
                tax_amount=item['tax_amount'],
                total_price=item['total_price'],
            )
            for item in bill['line_items']
        ]
        PurchaseItem.objects.bulk_create(purchase_items)

        # Deduct stock
        from django.db.models import F
        for item in bill['line_items']:
            Product.objects.filter(id=item['product'].id).update(
                available_stocks=F('available_stocks') - item['quantity']
            )

        return purchase, balance_denom
