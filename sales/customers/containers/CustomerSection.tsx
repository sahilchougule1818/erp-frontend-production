import React, { useState } from 'react';
import { Button } from '../../shared/ui/button';
import { Badge } from '../../shared/ui/badge';
import {
  useCustomerBookings,
  useBankAccounts,
  useAvailableIndoorBatches,
  useAvailableOutdoorBatches,
  useBookingPayments,
  useCustomers
} from '../../shared/hooks/useSalesApi';
import { Plus as PlusIcon } from 'lucide-react';
import { cn } from '../../shared/ui/utils';
import { DataTable } from '../../shared/components/DataTable';
import { useNotify } from '../../shared/hooks/useNotify';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../shared/ui/tabs';
import { ManageInstantSaleDialog } from '../../bookings/components/ManageInstantSaleDialog';
import { ManagePreBookingDialog } from '../../bookings/components/ManagePreBookingDialog';
import { CreateBookingDialog } from '../../bookings/components/CreateBookingDialog';

const CustomerSection: React.FC = () => {
  const { bookings, pagination, refetch, createBooking, updateBooking, updateStatus, cancelBooking, deleteBooking } = useCustomerBookings();
  const { accounts } = useBankAccounts(true);
  const { customers } = useCustomers();
  const { batches: indoorBatches, refetch: refetchIndoor } = useAvailableIndoorBatches();
  const { batches: outdoorBatches, refetch: refetchOutdoor } = useAvailableOutdoorBatches();

  const refetchStock = () => { refetchIndoor(); refetchOutdoor(); };
  const notify = useNotify();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { payments: bookingPayments, createPayment, deletePayment, refetch: refetchPayments } =
    useBookingPayments(selectedBooking?.booking_id);

  const handlePageChange = (page: number) => {
    refetch(page);
  };

  const handleCreate = async (payload: any) => {
    try {
      const result = await createBooking(payload);
      const billNo = result?.booking_id;
      notify.success(billNo ? `Booking created — ${billNo}` : 'Booking created successfully');
      refetch();
      refetchStock();
    } catch (err: any) {
      console.error('handleCreate error:', err);
      const errorMessage = err?.message || err?.error || 'Failed to create booking';
      notify.error(errorMessage);
      throw err; // Re-throw so dialog can catch it
    }
  };

  const handleStatusChange = async (booking: any, newStatus: string, batchCode?: string) => {
    try {
      const payload: any = { delivery_status: newStatus };
      if (batchCode) {
        payload.batch_code = batchCode;
      }
      const updated = await updateStatus(booking.booking_id, payload);
      if (newStatus === 'Cancelled') {
        notify.success('Booking cancelled successfully');
        if ((updated as any).warning) {
          setTimeout(() => notify.warn((updated as any).warning), 500);
        }
      } else {
        notify.success(`Delivery status updated to ${newStatus}`);
      }
      // Strip the warning field before setting as selected booking
      const { warning: _w, ...bookingData } = updated as any;
      setSelectedBooking(bookingData);
      refetch();
      refetchStock();
    } catch (err: any) {
      notify.error(err.message || 'Failed to update status');
      throw err; // Re-throw so dialog can catch it
    }
  };

  const handleAddPayment = async (data: any) => {
    try {
      // Handle quantity update if present
      if (data.quantity !== undefined) {
        await updateBooking(selectedBooking.booking_id, { quantity: data.quantity });
        notify.success('Quantity updated successfully');
        refetch();
        return;
      }
      
      // Handle payment
      await createPayment({
        booking_id: selectedBooking.booking_id,
        amount: parseFloat(data.amount),
        payment_type: data.payment_type || 'REGULAR',
        payment_method: data.payment_method,
        bank_account_id: data.bank_account_id ? parseInt(data.bank_account_id) : undefined,
        payment_date: data.payment_date || new Date().toISOString().split('T')[0],
        payment_reference: data.payment_reference
      });
      notify.success('Payment recorded successfully');
      refetch();
      refetchStock();
      refetchPayments();
    } catch (err: any) {
      notify.error(err.message || 'Failed to process request');
      throw err; // Re-throw so dialog can catch it
    }
  };

  const handleDeleteBooking = async () => {
    if (!selectedBooking) return;
    
    const confirmMsg = selectedBooking.is_instant_sell
      ? `Delete instant sale #${selectedBooking.booking_id}? This will remove the sale record and restore stock. This action cannot be undone.`
      : `Delete booking #${selectedBooking.booking_id}? This action cannot be undone.`;
    
    if (!confirm(confirmMsg)) {
      return;
    }

    try {
      await deleteBooking(selectedBooking.booking_id);
      notify.success(selectedBooking.is_instant_sell ? 'Instant sale deleted successfully' : 'Booking deleted successfully');
      setIsEditOpen(false);
      setSelectedBooking(null);
      refetch();
      refetchStock();
    } catch (err: any) {
      // Error will be displayed in the dialog, don't close it
      throw err; // Re-throw so dialog can catch it
    }
  };

  const isFrozen = (b: any) => b.delivery_status === 'Cancelled';
  
  const columns = [
    { key: 'booking_id', label: 'Booking ID' },
    {
      key: 'created_at',
      label: 'Created Date',
      render: (val: string) => <span className="text-base">{val
        ? new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—'}</span>
    },
    { key: 'customer_id', label: 'Customer ID' },
    { key: 'customer_name', label: 'Customer Name' },
    { key: 'plant_name', label: 'Plant' },
    { key: 'quantity', label: 'Qty' },
    {
      key: 'amount_paid_at_booking',
      label: 'Amt. at Booking',
      render: (val: number) => <span className="text-base">{`₹${Number(val).toLocaleString()}`}</span>
    },
    {
      key: 'total_amount',
      label: 'Total Amount',
      render: (val: number) => <span className="text-base">{`₹${Number(val).toLocaleString()}`}</span>
    },
    {
      key: 'paid_amount',
      label: 'Total Paid',
      render: (val: number) => <span className="text-base">{`₹${Number(val).toLocaleString()}`}</span>
    },
    {
      key: 'remaining_amount',
      label: 'Remaining',
      render: (val: number) => <span className="text-base">{`₹${Number(val).toLocaleString()}`}</span>
    },
    {
      key: 'fulfillment_type',
      label: 'Fulfilment',
      render: (val: string) => {
        const labels: any = {
          STOCK_FROM_OUTDOOR: 'Outdoor Batch',
          STOCK_FROM_INDOOR: 'Indoor Batch'
        };
        return <span className="text-base">{labels[val] || val}</span>;
      }
    },
    {
      key: 'batch_code',
      label: 'Batch',
      render: (val: string) => <span className="text-base">{val || '—'}</span>
    },
    {
      key: 'expected_delivery_date',
      label: 'Exp. Delivery',
      render: (val: string) => <span className="text-base">{val
        ? new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—'}</span>
    },
    {
      key: 'payment_status',
      label: 'Payment',
      render: (val: string) => {
        const styles: any = {
          'Paid': 'bg-green-50 text-green-700 border-green-200',
          'Partially Paid': 'bg-blue-50 text-blue-700 border-blue-200',
          'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
        };
        return <Badge className={cn(styles[val] || 'bg-slate-50 text-slate-500 border-slate-200', 'border text-base')}>{val}</Badge>;
      }
    },
    {
      key: 'delivery_status',
      label: 'Delivery',
      render: (val: string) => {
        const styles: any = {
          'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
          'Ready': 'bg-blue-50 text-blue-700 border-blue-200',
          'Delivered': 'bg-green-50 text-green-700 border-green-200',
          'Cancelled': 'bg-red-50 text-red-700 border-red-200',
        };
        return <Badge className={cn(styles[val] || 'bg-slate-50 text-slate-500 border-slate-200', 'border text-base')}>{val || 'Pending'}</Badge>;
      }
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="bookings">Customer Bookings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bookings">
          <DataTable
            title=""

            columns={columns}
            records={bookings}
            onEdit={(r) => { setSelectedBooking(r); setIsEditOpen(true); }}
            addButton={
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setIsCreateOpen(true)}
              >
                <PlusIcon className="w-4 h-4 mr-2" /> New Booking
              </Button>
            }
            filterConfig={{
              filter1Key: 'customer_name',
              filter1Label: 'Search customer...',
              filter2Key: 'booking_id',
              filter2Label: 'Booking ID'
            }}
            exportFileName="bookings_export"
            pagination={{
              currentPage: pagination.page,
              totalPages: pagination.totalPages,
              total: pagination.total,
              limit: pagination.limit,
              onPageChange: handlePageChange
            }}
          />
        </TabsContent>
      </Tabs>

      <CreateBookingDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        customers={customers}
        accounts={accounts}
        indoorBatches={indoorBatches}
        outdoorBatches={outdoorBatches}
        onSubmit={handleCreate}
      />

      {/* Route to appropriate dialog based on booking type */}
      {selectedBooking?.is_instant_sell === true ? (
        <ManageInstantSaleDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          selectedSale={selectedBooking}
          payments={bookingPayments}
          accounts={accounts}
          onAddPayment={handleAddPayment}
          onDeletePayment={async (transactionNumber) => {
            await deletePayment(transactionNumber);
            notify.success('Payment reversed');
            refetch();
            refetchPayments();
          }}
          onDeleteSale={handleDeleteBooking}
          onCancelSale={async (reason?: string) => {
            if (!selectedBooking) return;
            await cancelBooking(selectedBooking.booking_id, { cancellation_reason: reason });
            setIsEditOpen(false);
            setSelectedBooking(null);
            refetch();
            refetchStock();
            notify.success('Instant sale cancelled');
          }}
        />
      ) : (
        <ManagePreBookingDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          selectedBooking={selectedBooking}
          payments={bookingPayments}
          accounts={accounts}
          indoorBatches={indoorBatches}
          outdoorBatches={outdoorBatches}
          onAddPayment={handleAddPayment}
          onDeletePayment={async (transactionNumber) => {
            await deletePayment(transactionNumber);
            notify.success('Payment reversed');
            refetch();
            refetchPayments();
          }}
          onDeleteBooking={handleDeleteBooking}
          onStatusChange={handleStatusChange}
          onCancelBooking={async (reason?: string) => {
            if (!selectedBooking) return;
            await cancelBooking(selectedBooking.booking_id, { cancellation_reason: reason });
            setIsEditOpen(false);
            setSelectedBooking(null);
            refetch();
            refetchStock();
            notify.success('Pre-booking cancelled');
          }}
        />
      )}
    </div>
  );
};

export default CustomerSection;
export { CustomerSection };
