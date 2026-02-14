import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Separator } from '../ui/separator';
import { loadBookings, Booking, SALES_EVENTS, appendLedgerEntry, saveBookings } from './salesData';

type BookingFormValues = {
  customerName: string;
  bookingDate: string;
  deliveryDate: string;
  productType: string;
  quantity: number;
  rate: number;
  advanceAmount: number;
  billNumber: string;
  phoneNumber: string;
  address: string;
  paymentMethod: string;
};

const generateBookingId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `BKG-${year}${month}${day}-${random}`;
};

const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getNextBillNumber = (bookings: Booking[]) => {
  const existingBillNumbers = bookings
    .map((b: any) => parseInt(b.billNumber || '0', 10))
    .filter((n: number) => !isNaN(n));
  const maxBillNumber = existingBillNumbers.length > 0 ? Math.max(...existingBillNumbers) : 0;
  return String(maxBillNumber + 1);
};

export const BuyerSection: React.FC = () => {
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [currentBookingId, setCurrentBookingId] = React.useState('');

  const form = useForm<BookingFormValues>({
    defaultValues: {
      customerName: '',
      bookingDate: getTodayDate(),
      deliveryDate: '',
      productType: '',
      quantity: 0,
      rate: 0,
      advanceAmount: 0,
      billNumber: '1',
      phoneNumber: '',
      address: '',
      paymentMethod: '',
    },
  });

  const watchQuantity = form.watch('quantity') || 0;
  const watchRate = form.watch('rate') || 0;
  const estimatedTotal = Number(watchQuantity) * Number(watchRate);

  React.useEffect(() => {
    setBookings(loadBookings());

    if (typeof window === 'undefined') {
      return;
    }

    const handleRefresh = () => setBookings(loadBookings());
    window.addEventListener(SALES_EVENTS.bookings, handleRefresh);
    return () => window.removeEventListener(SALES_EVENTS.bookings, handleRefresh);
  }, []);

  const handleOpenDialog = () => {
    const newBookingId = generateBookingId();
    const nextBillNumber = getNextBillNumber(bookings);
    setCurrentBookingId(newBookingId);
    form.reset({
      customerName: '',
      bookingDate: getTodayDate(),
      deliveryDate: '',
      productType: '',
      quantity: 0,
      rate: 0,
      advanceAmount: 0,
      billNumber: nextBillNumber,
      phoneNumber: '',
      address: '',
      paymentMethod: '',
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (values: BookingFormValues) => {
    const totalAmount = Number(values.quantity) * Number(values.rate);
    const record: any = {
      id: currentBookingId,
      customerName: values.customerName,
      bookingDate: values.bookingDate,
      deliveryDate: values.deliveryDate,
      productType: values.productType,
      quantity: Number(values.quantity),
      rate: Number(values.rate),
      totalAmount,
      advanceAmount: Number(values.advanceAmount),
      billNumber: values.billNumber,
      phoneNumber: values.phoneNumber,
      address: values.address,
      paymentMethod: values.paymentMethod,
    };

    appendLedgerEntry({
      date: values.bookingDate,
      particulars: `Buyer Booking - ${values.customerName}`,
      debit: totalAmount,
      referenceId: record.id,
      entryType: 'Buyer',
      partyName: values.customerName,
    });

    if (Number(values.advanceAmount) > 0) {
      appendLedgerEntry({
        date: values.bookingDate,
        particulars: `Buyer Payment (Advance) - ${values.customerName}`,
        credit: Number(values.advanceAmount),
        referenceId: record.id,
        entryType: 'Buyer',
        partyName: values.customerName,
      });
    }

    const updatedBookings = [...bookings, record];
    saveBookings(updatedBookings);
    setBookings(updatedBookings);
    setIsDialogOpen(false);
    form.reset();
  };

  const today = new Date().toISOString().slice(0, 10);
  const activeBookings = bookings.filter(
    (booking) => booking.bookingDate <= today && booking.deliveryDate >= today
  );
  const pendingDeliveries = activeBookings.length;
  const totalValue = bookings.reduce((acc, booking) => acc + booking.totalAmount, 0);
  const totalQuantity = bookings.reduce((acc, booking) => acc + booking.quantity, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <p className="text-xs text-green-700">Active Bookings</p>
            <p className="text-2xl text-green-900 mt-1">{pendingDeliveries}</p>
            <p className="text-xs text-green-600 mt-1">scheduled</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-xs text-blue-700">Total Quantity</p>
            <p className="text-2xl text-blue-900 mt-1">{totalQuantity.toLocaleString()}</p>
            <p className="text-xs text-blue-600 mt-1">plants booked</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <p className="text-xs text-purple-700">Order Value</p>
            <p className="text-2xl text-purple-900 mt-1">₹{totalValue.toLocaleString()}</p>
            <p className="text-xs text-purple-600 mt-1">total amount</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Buyer Bookings</CardTitle>
              <CardDescription>Capture new plant bookings and monitor delivery commitments.</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleOpenDialog}
                >
                  Create Booking
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>New Booking</DialogTitle>
                  <DialogDescription>Record booking details and automatically update the ledger.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Booking ID</label>
                        <Input value={currentBookingId} disabled className="bg-gray-100" />
                      </div>
                      <FormField
                        control={form.control}
                        name="billNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bill Number</FormLabel>
                            <FormControl>
                              <Input {...field} disabled className="bg-gray-100" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="customerName"
                        rules={{ required: 'Customer name is required' }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Green Valley Farms" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        rules={{ required: 'Phone number is required' }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., +91 98765 43210" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="productType"
                        rules={{ required: 'Product is required' }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Banana G9" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="bookingDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Booking Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} disabled className="bg-gray-100" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="deliveryDate"
                        rules={{ required: 'Delivery date is required' }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="quantity"
                        rules={{
                          required: 'Quantity is required',
                          min: { value: 1, message: 'Quantity must be greater than zero' },
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input 
                                type="text" 
                                inputMode="numeric"
                                placeholder="Enter quantity (e.g., 500)" 
                                {...field} 
                                value={field.value || ''}
                                onChange={(event) => {
                                  const value = event.target.value.replace(/[^0-9]/g, '');
                                  field.onChange(value ? parseInt(value, 10) : 0);
                                }} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="rate"
                        rules={{
                          required: 'Rate is required',
                          min: { value: 1, message: 'Rate must be greater than zero' },
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rate (₹)</FormLabel>
                            <FormControl>
                              <Input 
                                type="text" 
                                inputMode="decimal"
                                placeholder="Enter rate (e.g., 12.50)" 
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
                        name="advanceAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Advance Amount (₹)</FormLabel>
                            <FormControl>
                              <Input 
                                type="text" 
                                inputMode="decimal"
                                placeholder="Enter advance amount (e.g., 1000)" 
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
                        name="paymentMethod"
                        rules={{ required: 'Payment method is required' }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Method</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select payment method" />
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
                    </div>
                    <FormField
                      control={form.control}
                      name="address"
                      rules={{ required: 'Address is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter complete address" 
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Estimated Amount</p>
                        <p className="text-2xl font-semibold">₹{estimatedTotal.toLocaleString()}</p>
                      </div>
                      <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                          Save Booking
                        </Button>
                      </DialogFooter>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};
