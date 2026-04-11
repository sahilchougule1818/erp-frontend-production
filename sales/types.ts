export type BankAccount = {
  id: number;
  account_name: string;
  account_number: string;
  bank_name: string;
  branch: string;
  ifsc_code: string;
  is_active: boolean;
  total_credits: number;
  total_debits: number;
  created_at?: string;
  updated_at?: string;
};

export type Booking = {
  id?: number;
  booking_id: string;
  customer_name: string;
  phone_number: string;
  address: string;
  plant_name: string;
  quantity: number;
  total_amount: number;
  amount_paid_at_booking: number;
  paid_amount: number;
  remaining_amount: number;
  booking_date: string;
  expected_delivery_date?: string | null;
  fulfillment_type: 'STOCK_FROM_OUTDOOR' | 'STOCK_FROM_INDOOR';
  batch_code?: string;
  payment_status: 'Paid' | 'Partially Paid' | 'Pending';
  delivery_status: 'Pending' | 'Ready' | 'Delivered' | 'Cancelled';
  notes?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  is_instant_sell?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type BookingPayment = {
  id: number;
  transaction_number: string;
  booking_id: string;
  payment_date: string;
  amount: number;
  payment_method: 'Cash' | 'Card' | 'NEFT' | 'UPI' | 'Cheque';
  bank_account_id?: number | null;
  bank_account_name?: string | null;
  payment_reference?: string;
  notes?: string;
  entry_type: string;
  customer_name?: string;
};

export type LedgerEntry = {
  id: number;
  transaction_number: string;
  entry_date: string;
  entry_type: string;
  particulars: string;
  debit_amount: number;
  credit_amount: number;
  running_balance: number;
  bank_account_id?: number;
  bank_account_name?: string;
  customer_name?: string;
  payment_method?: string;
  payment_reference?: string;
  booking_id?: string;
  purchase_id?: string;
  term_number?: number;
};

export type WithdrawEntry = {
  id?: number;
  purchase_id: string;
  withdraw_date: string;
  amount: number;
  quantity?: number | null;
  bank_account_id: number;
  item_id: number;
  item_name?: string;
  item_unit?: string;
  supplier_id?: number;
  supplier_name?: string;
  payment_method: string;
  transaction_number?: string;
  payment_reference?: string;
  purpose: string;
  notes?: string;
  is_locked?: boolean;
};

export type Refund = {
  refund_id: string;
  booking_id: string;
  customer_name?: string;
  phone_number?: string;
  product_type?: string;
  cancelled_quantity?: number;
  refund_amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: 'Pending' | 'In Progress' | 'Completed';
  total_terms: number;
  refund_reason?: string;
  created_at?: string;
  updated_at?: string;
};

export type RefundPayment = {
  transaction_number: string;
  term_number: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  bank_account_id?: number;
  bank_account_name?: string;
  payment_reference?: string;
  notes?: string;
  created_at?: string;
};

export type RefundDetail = Refund & {
  payments: RefundPayment[];
};

export type InventoryItem = {
  id: number;
  name: string;
  unit: string;
  category: string;
};

export type Supplier = {
  id: number;
  name: string;
  contact?: string;
};

export type DashboardStats = {
  net_inflow: number;
  net_outflow: number;
  net_pending: number;
  total_indoor_bottles: number;
  total_outdoor_plants: number;
};

export type UpcomingDelivery = {
  booking_id: string;
  customer_id: string;
  customer_name: string;
  plant_name: string;
  quantity: number;
  expected_delivery_date: string;
  fulfillment_type: string;
};

export type Customer = {
  customer_id: string;
  name: string;
  phone_number: string | null;
  address: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
};
