import React, { useState, useEffect } from 'react';
import { ModalLayout } from '../../../shared/components/ModalLayout';
import { Badge } from '../../../shared/ui/badge';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Textarea } from '../../../shared/ui/textarea';
import { format } from 'date-fns';
import {
  History as HistoryIcon, Trash2,
  CheckCircle2, Truck, AlertTriangle, XCircle,
  ChevronDown, ChevronUp, PenSquare, X,
} from 'lucide-react';
import { PAYMENT_METHODS } from '../../constants/EventTypes';
import { cn } from '../../../shared/ui/utils';

const DELIVERY_STATUS_OPTIONS = ['Pending', 'Delivered'] as const;

interface ManagePreBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBooking: any;
  payments: any[];
  accounts: any[];
  indoorBatches?: any[];
  outdoorBatches?: any[];
  onAddPayment: (data: any) => Promise<void>;
  onDeletePayment: (transactionNumber: string) => Promise<void>;
  onDeleteBooking: () => Promise<void>;
  onStatusChange: (booking: any, newStatus: string, batchCode?: string) => Promise<void>;
  onCancelBooking: (reason?: string) => Promise<void>;
}

export const ManagePreBookingDialog: React.FC<ManagePreBookingDialogProps> = ({
  open, onOpenChange, selectedBooking, payments, accounts,
  indoorBatches = [], outdoorBatches = [],
  onAddPayment, onDeletePayment, onDeleteBooking, onStatusChange, onCancelBooking,
}) => {
  const [formData, setFormData] = useState({
    amount: '', payment_type: 'REGULAR', payment_method: 'Cash',
    payment_date: new Date().toISOString().split('T')[0],
    bank_account_id: '', payment_reference: '',
  });
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [newQuantity, setNewQuantity] = useState('');
  const [localDeliveryStatus, setLocalDeliveryStatus] = useState(selectedBooking?.delivery_status ?? 'Pending');
  const [selectedBatchCode, setSelectedBatchCode] = useState(selectedBooking?.batch_code || '');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPaymentHistoryExpanded, setIsPaymentHistoryExpanded] = useState(false);

  useEffect(() => {
    if (open && selectedBooking) {
      setLocalDeliveryStatus(selectedBooking.delivery_status ?? 'Pending');
      setSelectedBatchCode(selectedBooking.batch_code || '');
      setErrorMessage(null);
      setShowCancelConfirm(false);
      setCancellationReason('');
      setIsEditingQuantity(false);
      setNewQuantity('');
      setIsPaymentHistoryExpanded(false);
      setFormData({
        amount: '', payment_type: 'REGULAR', payment_method: 'Cash',
        payment_date: new Date().toISOString().split('T')[0],
        bank_account_id: accounts[0]?.id?.toString() || '', payment_reference: '',
      });
    }
  }, [open, selectedBooking, accounts]);

  if (!open || !selectedBooking) return null;

  const isFirstPayment = payments.length === 0 && Number(selectedBooking.paid_amount) <= 0;
  const mostRecent = payments[payments.length - 1];
  const deliveryStatusChanged = localDeliveryStatus !== selectedBooking.delivery_status;
  const needsBatchSelection = deliveryStatusChanged && localDeliveryStatus === 'Delivered' && !selectedBooking.batch_code && !selectedBatchCode;
  const hasPaymentToSave = Number(formData.amount) > 0 && Number(selectedBooking.remaining_amount) > 0;
  const hasQuantityChange = newQuantity && Number(newQuantity) !== Number(selectedBooking.quantity);
  const canEditQuantity = ['STOCK_FROM_OUTDOOR', 'STOCK_FROM_INDOOR'].includes(selectedBooking.fulfillment_type) && selectedBooking.delivery_status === 'Pending';
  const isCancelled = selectedBooking.delivery_status === 'Cancelled';

  const handleSave = async () => {
    setErrorMessage(null);
    try {
      // Save quantity change if edited
      if (hasQuantityChange) {
        await onAddPayment({ quantity: Number(newQuantity) });
      }
      // Save delivery status change if changed
      if (deliveryStatusChanged) {
        await onStatusChange(selectedBooking, localDeliveryStatus, selectedBatchCode || undefined);
      }
      // Save payment if entered
      if (hasPaymentToSave) {
        const paymentPayload = { ...formData };
        if (paymentPayload.payment_method === 'Cash') {
          paymentPayload.bank_account_id = '';
        }
        await onAddPayment(paymentPayload);
      }
      onOpenChange(false);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to update');
    }
  };

  const handleUndoPayment = async () => {
    if (!mostRecent) return;
    if (!confirm('Undo this payment? This will restore the bill balance.')) return;
    try {
      await onDeletePayment(mostRecent.transaction_number);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to undo payment');
    }
  };

  const handleCancelBooking = async () => {
    try {
      await onCancelBooking(cancellationReason || undefined);
      onOpenChange(false);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to cancel booking');
    }
  };

  const handleDeleteBooking = async () => {
    if (!confirm('Permanently delete this booking? This action cannot be undone.')) return;
    try {
      await onDeleteBooking();
      onOpenChange(false);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to delete booking');
    }
  };

  // Show cancel confirmation panel
  if (showCancelConfirm && !isCancelled) {
    return (
      <ModalLayout title="Cancel Pre-booking" width="w-[700px]">
        <div className="px-6 py-4 space-y-4" style={{ flex: 1, overflowY: 'auto' }}>
          <div className="space-y-3 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-base text-red-700">Cancel Booking {selectedBooking.booking_id}?</h3>
            </div>
            <div className="space-y-2">
              <Badge variant="outline" className="text-base font-medium border-slate-300 text-slate-600">{selectedBooking.booking_id}</Badge>
              <span className="text-base text-slate-600 font-medium ml-2">{selectedBooking.customer_name}</span>
            </div>
            {Number(selectedBooking.paid_amount) > 0 && (
              <p className="text-base text-red-600">
                A refund of <span className="font-bold">₹{Number(selectedBooking.paid_amount).toLocaleString()}</span> will be created automatically.
              </p>
            )}
            <div className="space-y-2">
              <Label>Cancellation Reason (Optional)</Label>
              <Textarea
                placeholder="Why is this booking being cancelled?"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="text-base border-red-200 focus:border-red-400 min-h-[80px]"
              />
            </div>
            {errorMessage && (
              <div className="bg-red-100 border border-red-300 rounded p-2 text-base text-red-700 flex items-start gap-1">
                <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                <span className="flex-1">{errorMessage}</span>
                <button type="button" onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-700 ml-1 shrink-0">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="border-t px-6 py-4 bg-gray-50" style={{ flexShrink: 0 }}>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setShowCancelConfirm(false); setCancellationReason(''); setErrorMessage(null); }}>Go Back</Button>
            <Button onClick={handleCancelBooking} className="bg-red-600 hover:bg-red-700">Confirm Cancellation</Button>
          </div>
        </div>
      </ModalLayout>
    );
  }

  return (
    <ModalLayout title="Manage Pre-booking" width="w-[700px]">
      <div className="px-6 py-4 space-y-4" style={{ flex: 1, overflowY: 'auto' }}>
        {/* Header: Booking ID + Customer */}
        <div className="flex items-center gap-2 -mt-2">
          <Badge variant="outline" className="text-base font-medium border-slate-300 text-slate-600">{selectedBooking.booking_id}</Badge>
          <span className="text-base text-slate-600 font-medium">{selectedBooking.customer_name}</span>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-base text-red-700 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <span className="flex-1">{errorMessage}</span>
            <button type="button" onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-700 shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

      {/* Financial Summary */}
      <div className="space-y-2">
        <h3 className="font-medium text-base">Financial Summary</h3>
        <div className="border rounded-md p-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Payable', val: selectedBooking.total_amount, cls: 'text-gray-900' },
              { label: 'Total Paid', val: selectedBooking.paid_amount, cls: 'text-green-600' },
              { label: 'Balance Due', val: selectedBooking.remaining_amount, cls: 'text-red-600' },
            ].map(({ label, val, cls }, i) => (
              <div key={label} className={i > 0 ? 'border-l pl-4' : ''}>
                <p className="text-base text-gray-600 mb-1">{label}</p>
                <p className={`text-xl font-bold ${cls}`}>₹{Number(val).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Details */}
      <div className="space-y-2">
        <h3 className="font-medium text-base text-slate-900 mt-2">Booking Details</h3>
        <div className="border rounded-md p-4 shadow-sm bg-white">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-base text-gray-500 mb-1 font-medium">Plant Name</p>
              <p className="text-base font-semibold text-gray-900">{selectedBooking.plant_name || '—'}</p>
            </div>
            <div className="border-l pl-4">
              <p className="text-base text-gray-500 mb-1 font-medium">Quantity</p>
              <div className="flex items-center gap-2 mt-0.5">
                {isEditingQuantity ? (
                  <>
                    <Input
                      type="number"
                      min="1"
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(e.target.value)}
                      className="h-7 w-20 text-base border-gray-300"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => { setIsEditingQuantity(false); setNewQuantity(''); }}
                      className="text-gray-400 hover:text-gray-700 p-1"
                      title="Cancel edit"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {hasQuantityChange && (
                      <span className="text-base font-medium text-blue-600">
                        {Number(newQuantity) > Number(selectedBooking.quantity)
                          ? `+${Number(newQuantity) - Number(selectedBooking.quantity)}`
                          : `−${Number(selectedBooking.quantity) - Number(newQuantity)}`}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-base font-semibold text-gray-900">
                      {selectedBooking.quantity} <span className="text-gray-600 font-normal">{selectedBooking.fulfillment_type === 'STOCK_FROM_INDOOR' ? 'bottles' : 'plants'}</span>
                    </p>
                    {canEditQuantity && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-1 text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                        onClick={() => { setIsEditingQuantity(true); setNewQuantity(String(selectedBooking.quantity)); }}
                        title="Edit quantity"
                      >
                        <PenSquare className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="border-l pl-4">
              <p className="text-base text-gray-500 mb-1 font-medium">Batch</p>
              <p className="text-base font-semibold text-gray-900">
                {selectedBooking.delivery_status === 'Delivered' ? (selectedBooking.batch_code || '—') : '—'}
              </p>
            </div>
          </div>
        </div>
        {selectedBooking.delivery_status === 'Delivered' && !canEditQuantity && (
          <p className="text-base text-amber-600">Quantity cannot be edited after delivery.</p>
        )}
      </div>

      {/* Payment History */}
      <div className="space-y-2">
        <Label>Payment History</Label>
        <div className="border rounded-md p-3 space-y-2">
          <Button type="button" variant="outline" onClick={() => setIsPaymentHistoryExpanded(!isPaymentHistoryExpanded)} className="w-full justify-between h-8 text-base">
            <div className="flex items-center gap-2">
              <HistoryIcon className="w-4 h-4" />
              <span>{payments.length === 0 ? 'No transactions yet' : `${payments.length} transaction${payments.length > 1 ? 's' : ''}`}</span>
              {payments.length > 0 && <span className="text-base text-slate-500">· ₹{Number(selectedBooking.paid_amount).toLocaleString()} paid</span>}
            </div>
            {isPaymentHistoryExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>

          {isPaymentHistoryExpanded && payments.length > 0 && (
            <div className="border-t pt-2 max-h-48 overflow-y-auto space-y-2">
              {[...payments].reverse().map((payment, idx) => (
                <div key={payment.transaction_number} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base">₹{Number(payment.amount).toLocaleString()}</span>
                      <Badge variant="secondary" className="text-base">{payment.payment_method}</Badge>
                      {payment.entry_type === 'ADVANCE_RECEIVED' && (
                        <Badge variant="outline" className="text-base text-purple-700 border-purple-200">Advance</Badge>
                      )}
                      {idx === 0 && payment.entry_type !== 'ADVANCE_RECEIVED' && (
                        <Badge variant="outline" className="text-base text-emerald-700 border-emerald-200">Latest</Badge>
                      )}
                    </div>
                    <p className="text-base text-slate-500 mt-1">
                      {format(new Date(payment.payment_date), 'do MMM yyyy')}
                      {payment.transaction_number && <span className="text-slate-400"> • {payment.transaction_number}</span>}
                    </p>
                  </div>
                  {idx === 0 && !isCancelled && (
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-red-600 hover:bg-red-50 text-base"
                      onClick={handleUndoPayment}>
                      <Trash2 className="h-3 w-3 mr-1" /> Undo
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Error: delete */}

      {/* Delivery Status */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2"><Truck className="h-4 w-4" /> Delivery Status</Label>
        {!isCancelled && (
          <>
            <div className="flex rounded-md overflow-hidden border">
              {DELIVERY_STATUS_OPTIONS.map((status, i) => {
                const isActive = localDeliveryStatus === status;
                const activeStyles = status === 'Delivered' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800';
                return (
                  <button key={status} type="button" onClick={() => setLocalDeliveryStatus(status)}
                    className={cn('flex-1 py-2 text-base font-medium transition-colors', i > 0 && 'border-l', isActive ? activeStyles : 'bg-white text-gray-500 hover:bg-gray-50')}>
                    {status}
                  </button>
                );
              })}
            </div>
            {localDeliveryStatus === 'Delivered' && selectedBooking.delivery_status === 'Pending' && !selectedBooking.batch_code && (
              <div className="space-y-2 bg-blue-50 border border-blue-200 rounded-md p-3">
                <Label className="text-base text-blue-700 font-semibold">Select Batch for Delivery *</Label>
                <Select value={selectedBatchCode} onValueChange={setSelectedBatchCode}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="Choose batch to fulfill this order" /></SelectTrigger>
                  <SelectContent>
                    {selectedBooking.fulfillment_type === 'STOCK_FROM_OUTDOOR'
                      ? outdoorBatches.map((b) => {
                        const available = Number(b.available_plants ?? b.bookable_plants);
                        return <SelectItem key={b.batch_code} value={b.batch_code}>{b.batch_code} — {b.plant_name} ({available.toLocaleString()} available)</SelectItem>;
                      })
                      : indoorBatches.map((b) => {
                        const available = Number(b.available_bottles ?? b.bookable_bottles);
                        return <SelectItem key={b.batch_code} value={b.batch_code}>{b.batch_code} — {b.plant_name} — {b.stage} ({available.toLocaleString()} available)</SelectItem>;
                      })}
                  </SelectContent>
                </Select>
                {!selectedBatchCode && <p className="text-base text-blue-600">⚠️ Batch selection required to mark as delivered</p>}
              </div>
            )}
          </>
        )}
      </div>

      {/* Payment form / status banners */}
      {isCancelled ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center space-y-1">
          <XCircle className="h-6 w-6 text-red-400 mx-auto" />
          <p className="font-semibold text-base text-red-700">Booking Cancelled</p>
          {selectedBooking.cancellation_reason && <p className="text-base text-red-500">Reason: {selectedBooking.cancellation_reason}</p>}
        </div>
      ) : Number(selectedBooking.remaining_amount) <= 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-md p-5 text-center space-y-2">
          <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto" />
          <p className="font-semibold text-base text-green-800">Payment Complete</p>
          <p className="text-base text-green-600">This bill has been fully paid.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <Label>Record New Payment</Label>
          {isFirstPayment && (
            <div className="space-y-2">
              <Label>Payment Type</Label>
              <div className="flex rounded-md overflow-hidden border">
                {[{ val: 'ADVANCE', label: 'Advance Payment', color: 'bg-green-600' }, { val: 'REGULAR', label: 'Regular Payment', color: 'bg-green-600' }].map(({ val, label, color }, i) => (
                  <button key={val} type="button" onClick={() => setFormData({ ...formData, payment_type: val })}
                    className={cn('flex-1 px-4 py-2 text-base font-medium transition-colors', i > 0 && 'border-l', formData.payment_type === val ? `${color} text-white` : 'bg-white text-gray-600 hover:bg-gray-50')}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Payment Amount (₹) *</Label>
              <Input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required placeholder="0.00" className="text-base font-semibold" />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={formData.payment_date} onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={formData.payment_method} onValueChange={(val: string) => setFormData({ ...formData, payment_method: val, bank_account_id: val === 'Cash' ? '' : formData.bank_account_id })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {formData.payment_method !== 'Cash' && (
              <>
                <div className="space-y-2">
                  <Label>Bank Account</Label>
                  <Select value={formData.bank_account_id} onValueChange={(val: string) => setFormData({ ...formData, bank_account_id: val })}>
                    <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                    <SelectContent>{accounts.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.bank_name} · {a.account_name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>TXN / Reference</Label>
                  <Input placeholder="Ref ID" value={formData.payment_reference} onChange={(e) => setFormData({ ...formData, payment_reference: e.target.value })} />
                </div>
              </>
            )}
          </div>
        </div>
      )}
      </div>

      <div className="border-t px-6 py-4 bg-gray-50" style={{ flexShrink: 0 }}>
        <div className="flex justify-between gap-3">
          <div className="flex gap-2">
            {!isCancelled && (
              <Button
                variant="outline" size="sm"
                className="text-slate-600 border-slate-300 hover:bg-slate-50 text-base"
                onClick={handleDeleteBooking}
              >
                <Trash2 className="h-3 w-3 mr-1" /> Delete
              </Button>
            )}
            {!isCancelled && (
              <Button
                variant="outline" size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 text-base"
                onClick={() => { setErrorMessage(null); setShowCancelConfirm(true); }}
              >
                <XCircle className="h-3 w-3 mr-1" /> Cancel
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Dismiss</Button>
            {!isCancelled && (
              <Button 
                onClick={handleSave} 
                disabled={(!hasPaymentToSave && !deliveryStatusChanged && !hasQuantityChange) || needsBatchSelection}
                className="bg-green-600 hover:bg-green-700"
              >
                Confirm & Save
              </Button>
            )}
          </div>
        </div>
      </div>
    </ModalLayout>
  );
};
