import { generateId } from '../../data/utility';

export type Booking = {
  id: string;
  customerName: string;
  bookingDate: string;
  deliveryDate: string;
  productType: string;
  quantity: number;
  rate: number;
  totalAmount: number;
  advanceAmount?: number;
  billNumber?: string;
  phoneNumber?: string;
  address?: string;
  paymentMethod?: string;
};

export type PaymentRecord = {
  id: string;
  customerName: string;
  totalAmount: number;
  advancePaid: number;
  remainingAmount: number;
  paymentStatus: 'Paid' | 'Partially Paid' | 'Pending';
  paymentDate: string;
  notes?: string;
  supplierName?: string;
  invoiceNumber?: string;
  productType?: string;
  paymentMode?: string;
  transactionNumber?: string;
};

export type LedgerEntry = {
  id: string;
  date: string;
  particulars: string;
  debit: number;
  credit: number;
  balance: number;
  referenceId?: string;
  entryType?: 'Buyer' | 'Seller' | 'Opening' | 'Other';
  partyName?: string;
};

const STORAGE_KEYS = {
  bookings: 'erp.sales.bookings',
  payments: 'erp.sales.payments',
  ledger: 'erp.sales.ledger',
} as const;

export const SALES_EVENTS = {
  bookings: 'sales:bookings',
  payments: 'sales:payments',
  ledger: 'sales:ledger',
} as const;

const isBrowser = typeof window !== 'undefined';

const safeParse = <T>(value: string | null, fallback: T): T => {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const getStoredData = <T>(key: string, fallback: T): T => {
  if (!isBrowser) {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);

  if (!raw) {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }

  return safeParse<T>(raw, fallback);
};

const saveStoredData = <T>(key: string, value: T, eventName: string) => {
  if (!isBrowser) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(eventName));
};

const now = new Date();
const formatDate = (date: Date) =>
  date.toISOString().slice(0, 10); // yyyy-mm-dd

const sampleBookings: Booking[] = [
  {
    id: 'BKG-001',
    customerName: 'Green Valley Farms',
    bookingDate: formatDate(now),
    deliveryDate: formatDate(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)),
    productType: 'Banana G9',
    quantity: 500,
    rate: 12,
    totalAmount: 6000,
  },
];

const samplePayments: PaymentRecord[] = [
  {
    id: 'PAY-001',
    customerName: 'Green Valley Farms',
    totalAmount: 6000,
    advancePaid: 3000,
    remainingAmount: 3000,
    paymentStatus: 'Partially Paid',
    paymentDate: formatDate(now),
    notes: 'Initial advance received',
  },
];

const sampleLedger: LedgerEntry[] = [
  {
    id: 'LDG-001',
    date: formatDate(now),
    particulars: 'Opening Balance',
    debit: 0,
    credit: 0,
    balance: 0,
  },
];

export const loadBookings = () => getStoredData(STORAGE_KEYS.bookings, sampleBookings);

export const saveBookings = (bookings: Booking[]) =>
  saveStoredData(STORAGE_KEYS.bookings, bookings, SALES_EVENTS.bookings);

export const loadPayments = () => getStoredData(STORAGE_KEYS.payments, samplePayments);

export const savePayments = (payments: PaymentRecord[]) =>
  saveStoredData(STORAGE_KEYS.payments, payments, SALES_EVENTS.payments);

export const loadLedger = () => getStoredData(STORAGE_KEYS.ledger, sampleLedger);

export const saveLedger = (ledger: LedgerEntry[]) =>
  saveStoredData(STORAGE_KEYS.ledger, ledger, SALES_EVENTS.ledger);

const createId = (prefix: string, existingIds: string[]) => generateId(prefix, existingIds);

export const appendLedgerEntry = (entry: {
  date: string;
  particulars: string;
  debit?: number;
  credit?: number;
  referenceId?: string;
  entryType?: 'Buyer' | 'Seller' | 'Opening' | 'Other';
  partyName?: string;
}) => {
  const ledger = loadLedger();
  const debit = entry.debit ?? 0;
  const credit = entry.credit ?? 0;
  const lastBalance = ledger[ledger.length - 1]?.balance ?? 0;
  const nextEntry: LedgerEntry = {
    id: createId('LDG-', ledger.map((item) => item.id)),
    date: entry.date,
    particulars: entry.particulars,
    debit,
    credit,
    balance: lastBalance + debit - credit,
    referenceId: entry.referenceId,
    entryType: entry.entryType,
    partyName: entry.partyName,
  };

  const nextLedger = [...ledger, nextEntry];
  saveLedger(nextLedger);
  return nextLedger;
};

export const createBookingRecord = (
  booking: Omit<Booking, 'id' | 'totalAmount'> & { totalAmount?: number },
) => {
  const bookings = loadBookings();
  const totalAmount = booking.totalAmount ?? booking.quantity * booking.rate;
  const record: Booking = {
    ...booking,
    id: createId('BKG-', bookings.map((item) => item.id)),
    totalAmount,
  };

  const nextBookings = [...bookings, record];
  saveBookings(nextBookings);
  return record;
};

export const createPaymentRecord = (payment: Omit<PaymentRecord, 'id' | 'remainingAmount' | 'paymentStatus'>) => {
  const payments = loadPayments();
  const remainingAmount = payment.totalAmount - payment.advancePaid;

  const paymentStatus: PaymentRecord['paymentStatus'] =
    payment.advancePaid === 0
      ? 'Pending'
      : remainingAmount > 0
        ? 'Partially Paid'
        : 'Paid';

  const record: PaymentRecord = {
    ...payment,
    id: createId('PAY-', payments.map((item) => item.id)),
    remainingAmount: Math.max(remainingAmount, 0),
    paymentStatus,
  };

  const nextPayments = [...payments, record];
  savePayments(nextPayments);
  return record;
};

