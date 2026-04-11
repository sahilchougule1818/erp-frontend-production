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
  CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp,
} from 'lucide-react';
import { PAYMENT_METHODS } from '../../constants/EventTypes';

interface ManageInstantSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSale: any;
  payments: any[];
  accounts: any[];
  onAddPayment: (data: any) => Promise<void>;
  onDeletePayment: (transactionNumber: string) => Promise<void>;
  onCancelSale: (reason?: string) => Promise<void>;
  onDeleteSale?: () => Promise<void>;
}

export const ManageInstantSaleDialog: React.FC<ManageInstantSaleDialogProps> = ({
  open, onOpenChange, selectedSale, payments, accounts,
  onAddPayment, onDeletePayment, onCancelSale, onDeleteSale,
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    payment_type: 'REGULAR',
    payment_method: 'Cash',
    payment_date: new Date().toISOString().split('T')[0],
    bank_account_id: '',
    payment_reference: '',
  });
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isPaymentHistoryExpanded, setIsPaymentHistoryExpanded] = useState(false);

  useEffect(() => {
    if (selectedSale && open) {
      setPaymentError(null);
      setShowCancelConfirm(false);
      setCancellationReason('');
      setIsPaymentHistoryExpanded(false);
      setFormData({
        amount: '',
        payment_type: 'REGULAR',
        payment_method: 'Cash',
        payment_date: new Date().toISOString().split('T')[0],
        bank_account_id: accounts[0]?.id?.toString() || '',
        payment_reference: '',
      });
    }
  }, [selectedSale, open, accounts]);

  if (!open || !selectedSale) return null;

  const isFirstPayment = payments.length === 0 && Number(selectedSale.paid_amount) <= 0;
  const mostRecent = payments[payments.length - 1];
  const hasPaymentToSave = Number(formData.amount) > 0 && Number(selectedSale.remaining_amount) > 0;
  const isCancelled = selectedSale.delivery_status === 'Cancelled';

  const handleSavePayment = async () => {
    setPaymentError(null);
    try {
      if (hasPaymentToSave) {
        const paymentPayload = { ...formData };
        if (paymentPayload.payment_method === 'Cash') {
          paymentPayload.bank_account_id = '';
        }
        await onAddPayment(paymentPayload);
        onOpenChange(false);
      }
    } catch (err: any) {
      setPaymentError(
        err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to record payment',
      );
    }
  };

  const handleUndoPayment = async () => {
    if (!mostRecent) return;
    if (!confirm('Undo this payment? This will restore the bill balance.')) return;
    try {
      await onDeletePayment(mostRecent.transaction_number);
    } catch (err: any) {
      setPaymentError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to undo payment');
    }
  };

  const handleCancelSale = async () => {
    try {
      await onCancelSale(cancellationReason || undefined);
      onOpenChange(false);
    } catch (err: any) {
      setPaymentError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to cancel sale');
    }
  };

  const handleDeleteSale = async () => {
    if (!onDeleteSale) return;
    if (!confirm('Permanently delete this sale? This action cannot be undone.')) return;
    try {
      await onDeleteSale();
      onOpenChange(false);
    } catch (err: any) {
      setPaymentError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to delete sale');
    }
  };


  // Show cancel confirmation panel
  if (showCancelConfirm && !isCancelled) {
    return (
      <ModalLayout title="Cancel Instant Sale" width="w-[600px]">
        <div className="px-6 py-4 space-y-4" style={{ flex: 1, overflowY: 'auto' }}>
          <div className="space-y-3 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-base text-red-700">Cancel Sale {selectedSale.booking_id}?</h3>
            </div>
            <div className="space-y-2">
              <p className="text-base bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium inline-block">
                {selectedSale.booking_id}
              </p>
              <span className="text-base text-gray-600 ml-2">{selectedSale.customer_name}</span>
            </div>
            {Number(selectedSale.paid_amount) > 0 && (
              <p className="text-base text-red-600">
                A refund of <span className="font-bold">₹{Number(selectedSale.paid_amount).toLocaleString()}</span> will be created automatically.
              </p>
            )}
            <div className="space-y-2">
              <Label>Cancellation Reason (Optional)</Label>
              <Textarea
                placeholder="Why is this sale being cancelled?"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="text-base border-red-200 focus:border-red-400 min-h-[80px]"
              />
            </div>
            {paymentError && (
              <div className="bg-red-100 border border-red-300 rounded p-2 text-base text-red-700">
                <AlertTriangle className="h-3 w-3 inline mr-1" />{paymentError}
              </div>
            )}
          </div>
        </div>
        <div className="border-t px-6 py-4 bg-gray-50" style={{ flexShrink: 0 }}>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setShowCancelConfirm(false); setCancellationReason(''); setPaymentError(null); }}>Go Back</Button>
            <Button onClick={handleCancelSale} className="bg-red-600 hover:bg-red-700">Confirm Cancellation</Button>
          </div>
        </div>
      </ModalLayout>
    );
  }

  return (
    <ModalLayout title="Manage Instant Sale" width="w-[600px]">
      <div className="px-6 py-4 space-y-4" style={{ flex: 1, overflowY: 'auto' }}>
        {/* Header: Booking ID + Customer */}
        <div className="flex items-center gap-2 -mt-2">
          <span className="text-base bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
            {selectedSale.booking_id}
          </span>
          <span className="text-base text-gray-500">{selectedSale.customer_name}</span>
        </div>
      {/* Financial Summary */}
      <div className="space-y-2">
        <h3 className="font-medium text-base">Financial Summary</h3>
        <div className="border rounded-md p-4 bg-white shadow-sm">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Payable', val: selectedSale.total_amount, cls: 'text-gray-900' },
              { label: 'Total Paid', val: selectedSale.paid_amount, cls: 'text-green-600' },
              { label: 'Balance Due', val: selectedSale.remaining_amount, cls: 'text-red-600' },
            ].map(({ label, val, cls }, i) => (
              <div key={label} className={i > 0 ? 'border-l pl-4' : ''}>
                <p className="text-base text-gray-500 mb-1 font-medium">{label}</p>
                <p className={`text-xl font-bold ${cls}`}>₹{Number(val).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sale Details */}
      <div className="space-y-2">
        <h3 className="font-medium text-base text-slate-900 mt-2">Sale Details</h3>
        <div className="border rounded-md p-4 shadow-sm bg-white">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-base text-gray-500 mb-1 font-medium">Plant Name</p>
              <p className="text-base font-semibold text-gray-900">{selectedSale.plant_name || '—'}</p>
            </div>
            <div className="border-l pl-4">
              <p className="text-base text-gray-500 mb-1 font-medium">Quantity</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-base font-semibold text-gray-900">
                  {selectedSale.quantity} <span className="text-gray-600 font-normal">{selectedSale.fulfillment_type === 'STOCK_FROM_INDOOR' ? 'bottles' : 'plants'}</span>
                </p>
              </div>
            </div>
            <div className="border-l pl-4">
              <p className="text-base text-gray-500 mb-1 font-medium">Batch</p>
              <p className="text-base font-semibold text-gray-900">
                {selectedSale.batch_code || '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      {/* Payment History */}
      <div className="space-y-2">
        <Label>Payment History</Label>
        <div className="border rounded-md p-3 space-y-2">
          <Button type="button" variant="outline" onClick={() => setIsPaymentHistoryExpanded(!isPaymentHistoryExpanded)} className="w-full justify-between h-8 text-base">
            <div className="flex items-center gap-2">
              <HistoryIcon className="w-4 h-4" />
              <span>{payments.length === 0 ? 'No transactions yet' : `${payments.length} transaction${payments.length > 1 ? 's' : ''}`}</span>
              {payments.length > 0 && <span className="text-base text-slate-500">· ₹{Number(selectedSale.paid_amount).toLocaleString()} paid</span>}
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
                      <Badge variant="secondary" className="text-base font-medium">{payment.payment_method}</Badge>
                      {idx === 0 && <Badge variant="outline" className="text-base text-emerald-700 border-emerald-200">Latest</Badge>}
                    </div>
                    <p className="text-base text-slate-500 mt-1">
                      {format(new Date(payment.payment_date), 'do MMM yyyy')}
                      {payment.transaction_number && <span className="text-slate-400"> • {payment.transaction_number}</span>}
                    </p>
                  </div>
                  {idx === 0 && !isCancelled && (
                    <Button
                      variant="ghost" size="sm"
                      className="h-7 px-2 text-red-600 hover:bg-red-50 text-base"
                      onClick={handleUndoPayment}
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> Undo
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment form / status banners */}
      {isCancelled ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center space-y-1">
          <XCircle className="h-6 w-6 text-red-400 mx-auto" />
          <p className="font-semibold text-base text-red-700">Sale Cancelled</p>
          {selectedSale.cancellation_reason && (
            <p className="text-base text-red-500">Reason: {selectedSale.cancellation_reason}</p>
          )}
        </div>
      ) : Number(selectedSale.remaining_amount) <= 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-5 text-center space-y-2">
          <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto" />
          <p className="font-semibold text-base text-green-800">Payment Complete</p>
          <p className="text-base text-green-600">This sale has been fully paid.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 mt-5">Record New Payment</p>

          {paymentError && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-base text-red-700 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{paymentError}</span>
            </div>
          )}

          {isFirstPayment && (
            <div className="space-y-2">
              <Label>Payment Type</Label>
              <div className="flex rounded-lg overflow-hidden border border-gray-200">
                {[{ val: 'ADVANCE', label: 'Advance Payment', color: 'bg-green-600' }, { val: 'REGULAR', label: 'Regular Payment', color: 'bg-green-600' }].map(({ val, label, color }, i) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFormData({ ...formData, payment_type: val })}
                    className={`flex-1 px-4 py-2 text-base font-medium transition-colors ${i > 0 ? 'border-l border-gray-200' : ''} ${formData.payment_type === val ? `${color} text-white` : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
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
            {onDeleteSale && !isCancelled && (
              <Button
                variant="outline" size="sm"
                className="text-slate-600 border-slate-300 hover:bg-slate-50 text-base"
                onClick={handleDeleteSale}
              >
                <Trash2 className="h-3 w-3 mr-1" /> Delete
              </Button>
            )}
            {!isCancelled && (
              <Button
                variant="outline" size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 text-base"
                onClick={() => setShowCancelConfirm(true)}
              >
                <XCircle className="h-3 w-3 mr-1" /> Cancel Sale
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Dismiss</Button>
            {!isCancelled && (
              <Button 
                onClick={handleSavePayment} 
                disabled={!hasPaymentToSave}
                className="bg-green-600 hover:bg-green-700"
              >
                Save Payment
              </Button>
            )}
          </div>
        </div>
      </div>
    </ModalLayout>
  );
};
