from django.core.management.base import BaseCommand
from apps.customers.models import Customer
from django.core.exceptions import ValidationError
from django.core.validators import validate_email

class Command(BaseCommand):
    help = 'Add customers to the database using their email addresses.'

    def add_arguments(self, parser):
        parser.add_argument('emails', nargs='+', type=str, help='List of customer email addresses to add.')

    def handle(self, *args, **kwargs):
        emails = kwargs['emails']
        for email in emails:
            try:
                validate_email(email)
                customer, created = Customer.objects.get_or_create(email=email, defaults={'name': email.split('@')[0]})
                if created:
                    self.stdout.write(self.style.SUCCESS(f'Successfully added customer: {email}'))
                else:
                    self.stdout.write(self.style.WARNING(f'Customer with email {email} already exists.'))
            except ValidationError:
                self.stdout.write(self.style.ERROR(f'Invalid email address: {email}'))