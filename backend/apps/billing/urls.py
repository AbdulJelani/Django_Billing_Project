from django.urls import path
from .views import GenerateBillView, CustomerPurchaseHistoryView, PurchaseDetailView

urlpatterns = [
    path('generate/', GenerateBillView.as_view(), name='generate-bill'),
    path('history/', CustomerPurchaseHistoryView.as_view(), name='purchase-history'),
    path('purchases/<uuid:id>/', PurchaseDetailView.as_view(), name='purchase-detail'),
]
