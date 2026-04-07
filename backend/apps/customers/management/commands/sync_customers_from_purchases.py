from django.core.management.base import BaseCommand
from apps.customers.models import Customer
from apps.billing.models import Purchase


class Command(BaseCommand):
    help = 'Creates Customer records for every unique email found in existing purchases.'

    def handle(self, *args, **kwargs):
        emails = (
            Purchase.objects
            .values_list('customer_email', flat=True)
            .distinct()
        )

        created_count = 0
        existing_count = 0

        for email in emails:
            _, created = Customer.objects.get_or_create(
                email__iexact=email,
                defaults={
                    'name': email.split('@')[0],
                    'email': email,
                }
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created customer: {email}'))
            else:
                existing_count += 1

        self.stdout.write(self.style.SUCCESS(
            f'\nDone! Created: {created_count}, Already existed: {existing_count}'
        ))
