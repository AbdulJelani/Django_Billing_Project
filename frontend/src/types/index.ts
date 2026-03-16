export interface Product {
  id: string;
  name: string;
  product_id: string;
  available_stocks: number;
  price: string;
  tax_percentage: string;
  price_with_tax: string;
  is_active: boolean;
}

export interface BillingItem {
  product_id: string;
  quantity: number;
}

export interface Denominations {
  [key: string]: number;
}

export interface CreateBillPayload {
  customer_email: string;
  items: BillingItem[];
  denominations: Denominations;
  cash_paid: number;
}

export interface PurchaseItem {
  product_code: string;
  unit_price_snapshot: string;
  quantity: number;
  purchase_price: string;
  tax_percentage_snapshot: string;
  tax_amount: string;
  total_price: string;
}

export interface Purchase {
  id: string;
  customer_email: string;
  items: PurchaseItem[];
  total_price_without_tax: string;
  total_tax: string;
  net_price: string;
  rounded_net_price: string;
  cash_paid: string;
  balance: string;
  denominations_given: Denominations;
  balance_denomination: Denominations;
  invoice_sent: boolean;
  created_at: string;
}

export interface PurchaseListItem {
  id: string;
  customer_email: string;
  rounded_net_price: string;
  created_at: string;
  invoice_sent: boolean;
}
