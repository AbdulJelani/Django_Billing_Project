from celery import shared_task
from django.core.mail import send_mail
from django.template.loader import render_to_string
from .models import Purchase
import logging

logger = logging.getLogger(__name__)


@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,   # Retry after 60s
    autoretry_for=(Exception,),
)
def send_invoice_email(self, purchase_id: str):
    """
    Async Celery task — sends invoice email after purchase.
    Retries automatically on failure up to 3 times.
    """
    try:
        purchase = Purchase.objects.prefetch_related(
            'items__product'
        ).get(id=purchase_id)

        subject = f"Your Invoice - Purchase #{str(purchase.id)[:8].upper()}"
        
        items_text = "\n".join([
            f"  {item.product_code} | Qty: {item.quantity} | "
            f"Price: ₹{item.purchase_price} | Tax: ₹{item.tax_amount} | "
            f"Total: ₹{item.total_price}"
            for item in purchase.items.all()
        ])
        
        message = f"""
Dear Customer,

Thank you for your purchase!

─────────────────────────────────────
INVOICE DETAILS
─────────────────────────────────────
{items_text}

Total (excl. tax):     ₹{purchase.total_price_without_tax}
Total Tax:             ₹{purchase.total_tax}
Net Price:             ₹{purchase.net_price}
Rounded Net Price:     ₹{purchase.rounded_net_price}
Cash Paid:             ₹{purchase.cash_paid}
Balance Returned:      ₹{purchase.balance}
─────────────────────────────────────

Regards,
Billing System
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=None,  
            recipient_list=[purchase.customer_email],
            fail_silently=False,
        )
        
        # Mark as sent
        Purchase.objects.filter(id=purchase_id).update(invoice_sent=True)
        logger.info(f"Invoice sent for purchase {purchase_id}")
        
    except Purchase.DoesNotExist:
        logger.error(f"Purchase {purchase_id} not found")
        raise
    except Exception as exc:
        logger.error(f"Failed to send invoice {purchase_id}: {exc}")
        raise self.retry(exc=exc)
