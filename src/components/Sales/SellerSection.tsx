import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { loadPayments, PaymentRecord, SALES_EVENTS, createPaymentRecord, appendLedgerEntry } from './salesData';

type PaymentFormValues = {
  supplierName: string;
  invoiceNumber: string;
  productType: string;
  totalAmount: number;
  advancePaid: number;
  paymentDate: string;
  paymentMode: string;
  transactionNumber: string;
  notes?: string;
};

const defaultValues: PaymentFormValues = {
  supplierName: '',
  invoiceNumber: '',
  productType: '',
  totalAmount: 0,
  advancePaid: 0,
  paymentDate: '',
  paymentMode: '',
  transactionNumber: '',
  notes: '',
};

const statusVariant: Record<PaymentRecord['paymentStatus'], string> = {
  Paid: 'bg-green-100 text-green-700 border-green-200',
  'Partially Paid': 'bg-amber-100 text-amber-700 border-amber-200',
  Pending: 'bg-red-100 text-red-700 border-red-200',
};

export const SellerSection: React.FC = () => {
  const [payments, setPayments] = React.useState<PaymentRecord[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const form = useForm<PaymentFormValues>({ defaultValues });

  const watchTotal = form.watch('totalAmount') || 0;
  const watchAdvance = form.watch('advancePaid') || 0;
  const projectedRemaining = Math.max(Number(watchTotal) - Number(watchAdvance), 0);
  const projectedStatus: PaymentRecord['paymentStatus'] =
    Number(watchAdvance) === 0 ? 'Pending' : projectedRemaining > 0 ? 'Partially Paid' : 'Paid';

  React.useEffect(() => {
    setPayments(loadPayments());

    if (typeof window === 'undefined') {
      return;
    }

    const handleRefresh = () => setPayments(loadPayments());
    window.addEventListener(SALES_EVENTS.payments, handleRefresh);
    return () => window.removeEventListener(SALES_EVENTS.payments, handleRefresh);
  }, []);

  const onSubmit = (values: PaymentFormValues) => {
    const payment = createPaymentRecord({
      customerName: values.supplierName,
      totalAmount: Number(values.totalAmount),
      advancePaid: Number(values.advancePaid),
      paymentDate: values.paymentDate,
      notes: values.notes,
      supplierName: values.supplierName,
      invoiceNumber: values.invoiceNumber,
      productType: values.productType,
      paymentMode: values.paymentMode,
      transactionNumber: values.transactionNumber,
    });

    if (payment.advancePaid > 0) {
      appendLedgerEntry({
        date: values.paymentDate,
        particulars: `Seller Payment - ${values.supplierName}`,
        credit: payment.advancePaid,
        referenceId: payment.id,
        entryType: 'Seller',
        partyName: values.supplierName,
      });
    }

    if (Number(values.totalAmount) > 0) {
      appendLedgerEntry({
        date: values.paymentDate,
        particulars: `Seller Purchase Expense - ${values.supplierName} (${values.productType})`,
        debit: Number(values.totalAmount),
        referenceId: payment.id,
        entryType: 'Seller',
        partyName: values.supplierName,
      });
    }

    setPayments((prev) => [...prev, payment]);
    setIsDialogOpen(false);
    form.reset(defaultValues);
  };

  const totalAdvanced = payments.reduce((acc, payment) => acc + payment.advancePaid, 0);
  const totalOutstanding = payments.reduce((acc, payment) => acc + payment.remainingAmount, 0);

  const paidCount = payments.filter(p => p.paymentStatus === 'Paid').length;
  const partiallyPaidCount = payments.filter(p => p.paymentStatus === 'Partially Paid').length;
  const pendingCount = payments.filter(p => p.paymentStatus === 'Pending').length;

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <p className="text-xs text-green-700">Paid</p>
            <p className="text-2xl text-green-900 mt-1">{paidCount}</p>
            <p className="text-xs text-green-600 mt-1">suppliers</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <p className="text-xs text-yellow-700">Partially Paid</p>
            <p className="text-2xl text-yellow-900 mt-1">{partiallyPaidCount}</p>
            <p className="text-xs text-yellow-600 mt-1">suppliers</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <p className="text-xs text-red-700">Pending</p>
            <p className="text-2xl text-red-900 mt-1">{pendingCount}</p>
            <p className="text-xs text-red-600 mt-1">suppliers</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-xs text-blue-700">Amount Paid</p>
            <p className="text-2xl text-blue-900 mt-1">₹{totalAdvanced.toLocaleString()}</p>
            <p className="text-xs text-blue-600 mt-1">amount paid</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <p className="text-xs text-purple-700">Outstanding</p>
            <p className="text-2xl text-purple-900 mt-1">₹{totalOutstanding.toLocaleString()}</p>
            <p className="text-xs text-purple-600 mt-1">pending amount</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Seller Payments</CardTitle>
              <CardDescription>Manage supplier payments, outstanding balances, and payment status.</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                  Add Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Record Payment</DialogTitle>
                  <DialogDescription>Capture supplier payment and auto-post a ledger entry.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="supplierName"
                        rules={{ required: 'Supplier name is required' }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Supplier Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., ABC Suppliers Pvt Ltd" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="invoiceNumber"
                        rules={{ required: 'Invoice/Bill number is required' }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Invoice Number / Bill Number</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., INV-2024-001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="productType"
                        rules={{ required: 'Product/Material type is required' }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product / Material Type</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Cocopeat, Fertilizer, Pots" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="paymentDate"
                        rules={{ required: 'Payment date is required' }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="totalAmount"
                        rules={{ required: 'Total amount is required', min: { value: 1, message: 'Amount must be positive' } }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Amount (₹)</FormLabel>
                            <FormControl>
                              <Input 
                                type="text" 
                                inputMode="decimal"
                                placeholder="Enter total amount (e.g., 6000.00)" 
                                {...field} 
                                value={field.value || ''}
                                onChange={(event) => {
                                  const value = event.target.value.replace(/[^0-9.]/g, '');
                                  field.onChange(value ? parseFloat(value) : 0);
                                }} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="advancePaid"
                        rules={{ min: { value: 0, message: 'Amount cannot be negative' } }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Amount (₹)</FormLabel>
                            <FormControl>
                              <Input 
                                type="text" 
                                inputMode="decimal"
                                placeholder="Enter payment amount (e.g., 3000.00)" 
                                {...field} 
                                value={field.value || ''}
                                onChange={(event) => {
                                  const value = event.target.value.replace(/[^0-9.]/g, '');
                                  field.onChange(value ? parseFloat(value) : 0);
                                }} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="paymentMode"
                        rules={{ required: 'Payment mode is required' }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Mode</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select payment mode" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Cash">Cash</SelectItem>
                                <SelectItem value="Card">Card</SelectItem>
                                <SelectItem value="NEFT">NEFT</SelectItem>
                                <SelectItem value="UPI">UPI</SelectItem>
                                <SelectItem value="Cheque">Cheque</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="transactionNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Transaction Number</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., TXN123456789" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Input placeholder="Optional remarks" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="rounded-lg border p-4 space-y-1 text-sm">
                      <p className="flex items-center justify-between">
                        <span>Remaining Amount</span>
                        <span className="font-semibold">₹{projectedRemaining.toLocaleString()}</span>
                      </p>
                      <p className="flex items-center justify-between">
                        <span>Payment Status</span>
                        <Badge className={statusVariant[projectedStatus]}>{projectedStatus}</Badge>
                      </p>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                        Save Payment
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supplier Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs text-gray-600">Supplier Name</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-600">Total Amount</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-600">Amount Paid</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-600">Remaining</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-600">Notes</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {payment.supplierName || payment.customerName}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">{payment.paymentDate}</td>
                    <td className="px-4 py-3 text-sm">₹{payment.totalAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-emerald-600">₹{payment.advancePaid.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-red-600">₹{payment.remainingAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant="outline" className={statusVariant[payment.paymentStatus]}>
                        {payment.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{payment.notes || '—'}</td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                      No payment records yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
