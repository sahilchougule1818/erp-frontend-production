import React from 'react';
import { SharedForm, FieldConfig } from '../../shared/components/SharedForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../shared/ui/select';
import { Input } from '../../shared/ui/input';
import { FULFILLMENT_TYPES } from '../../shared/constants/EventTypes';
import { cn } from '../../shared/ui/utils';
import { Customer } from '../../shared/services/salesApi';

type BookingFormValues = {
  customer_id: string;
  product_type: string;
  quantity: string;
  total_amount: string;
  fulfillment_type: string;
  batch_code: string;
  expected_delivery_date: string;
  is_instant_sell: boolean;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: Customer[];
  indoorBatches: any[];
  outdoorBatches: any[];
  onSubmit: (payload: any) => Promise<void>;
}

export const CreateBookingDialog: React.FC<Props> = ({
  open, onOpenChange, customers, indoorBatches, outdoorBatches, onSubmit,
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  // Track form values for submitDisabled computation
  const [formValues, setFormValues] = React.useState<any>({});

  // Compute derived state from tracked form values
  const fType = formValues.fulfillment_type || FULFILLMENT_TYPES.STOCK_FROM_INDOOR;
  const isStockFulfillment =
    fType === FULFILLMENT_TYPES.STOCK_FROM_OUTDOOR ||
    fType === FULFILLMENT_TYPES.STOCK_FROM_INDOOR;
  const bCode = formValues.batch_code || '';
  const isInstantSell = Boolean(formValues.is_instant_sell);
  const selectedOB = outdoorBatches.find((b) => b.batch_code === bCode);
  const selectedIB = indoorBatches.find((b) => b.batch_code === bCode);
  const availableStock =
    fType === FULFILLMENT_TYPES.STOCK_FROM_OUTDOOR && selectedOB
      ? Number(selectedOB.bookable_plants ?? selectedOB.available_plants)
      : fType === FULFILLMENT_TYPES.STOCK_FROM_INDOOR && selectedIB
      ? Number(selectedIB.bookable_bottles ?? selectedIB.available_bottles)
      : null;
  const quantityNum = parseFloat(formValues.quantity) || 0;
  const hasStockError =
    isInstantSell && isStockFulfillment && bCode && availableStock !== null && quantityNum > availableStock;
  const missingDeliveryDate = !isInstantSell && !formValues.expected_delivery_date;

  const fields: FieldConfig[] = [
    // ── Customer ─────────────────────────────────────────────────────────────
    {
      name: 'customer_id',
      label: 'Customer',
      type: 'custom',
      required: true,
      gridColumn: 'col-span-2',
      render: (field, _fv) => (
        <Select onValueChange={field.onChange} value={field.value}>
          <SelectTrigger>
            <SelectValue placeholder="Select customer..." />
          </SelectTrigger>
          <SelectContent>
            {customers.filter((c) => !c.is_deleted).map((c) => (
              <SelectItem key={c.customer_id} value={c.customer_id}>
                {c.name} ({c.customer_id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    // ── Product Type ─────────────────────────────────────────────────────────
    {
      name: 'product_type',
      label: 'Product Type',
      type: 'text',
    },
    // ── Quantity (with stock validation) ─────────────────────────────────────
    {
      name: 'quantity',
      label: 'Quantity',
      type: 'custom',
      required: true,
      render: (field, fv) => {
        const isInstant = Boolean(fv.is_instant_sell);
        const ft = fv.fulfillment_type || FULFILLMENT_TYPES.STOCK_FROM_INDOOR;
        const isStock = ft === FULFILLMENT_TYPES.STOCK_FROM_OUTDOOR || ft === FULFILLMENT_TYPES.STOCK_FROM_INDOOR;
        const bc = fv.batch_code || '';
        const sob = outdoorBatches.find((b) => b.batch_code === bc);
        const sib = indoorBatches.find((b) => b.batch_code === bc);
        let avail: number | null = null;
        if (ft === FULFILLMENT_TYPES.STOCK_FROM_OUTDOOR && sob) avail = Number(sob.bookable_plants ?? sob.available_plants);
        if (ft === FULFILLMENT_TYPES.STOCK_FROM_INDOOR && sib) avail = Number(sib.bookable_bottles ?? sib.available_bottles);
        const qty = parseFloat(fv.quantity) || 0;
        const err = isInstant && isStock && bc && avail !== null && qty > avail;
        const unit = ft === FULFILLMENT_TYPES.STOCK_FROM_OUTDOOR ? 'plants' : 'bottles';
        return (
          <>
            <Input type="number" step="0.01" {...field} className={cn(err && 'border-red-400 focus-visible:ring-red-400')} />
            {err && <p className="text-xs text-red-600 font-medium mt-1">Only {avail?.toLocaleString()} {unit} available</p>}
          </>
        );
      },
    },
    // ── Total Amount ─────────────────────────────────────────────────────────
    {
      name: 'total_amount',
      label: 'Total Amount (₹)',
      type: 'number',
      step: 0.01,
      placeholder: '0',
      required: true,
    },
    // ── Fulfillment Type ─────────────────────────────────────────────────────
    {
      name: 'fulfillment_type',
      label: 'Fulfillment Type',
      type: 'custom',
      defaultValue: FULFILLMENT_TYPES.STOCK_FROM_INDOOR,
      gridColumn: 'col-span-2',
      render: (field, _fv) => (
        <Select
          value={field.value}
          onValueChange={(val: string) => {
            field.onChange(val);
            // batch_code reset is handled via showWhen hiding the field
          }}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={FULFILLMENT_TYPES.STOCK_FROM_OUTDOOR}>Stock from Outdoor Batch</SelectItem>
            <SelectItem value={FULFILLMENT_TYPES.STOCK_FROM_INDOOR}>Stock from Indoor</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    // ── Booking Mode toggle ───────────────────────────────────────────────────
    {
      name: 'is_instant_sell',
      label: 'Booking Mode',
      type: 'custom',
      defaultValue: false,
      gridColumn: 'col-span-2',
      render: (field, fv) => {
        const ft = fv.fulfillment_type || FULFILLMENT_TYPES.STOCK_FROM_INDOOR;
        const isStock = ft === FULFILLMENT_TYPES.STOCK_FROM_OUTDOOR || ft === FULFILLMENT_TYPES.STOCK_FROM_INDOOR;
        const isInstant = Boolean(fv.is_instant_sell);
        return (
          <>
            <div className="flex rounded-lg overflow-hidden border border-gray-200">
              <button
                type="button"
                onClick={() => field.onChange(false)}
                className={cn(
                  'flex-1 px-4 py-2 text-sm font-medium transition-colors',
                  !isInstant ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50',
                )}
              >
                📦 Pre-booking
              </button>
              <button
                type="button"
                onClick={() => isStock && field.onChange(true)}
                disabled={!isStock}
                className={cn(
                  'flex-1 px-4 py-2 text-sm font-medium border-l border-gray-200 transition-colors',
                  isInstant ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50',
                  !isStock && 'cursor-not-allowed opacity-50',
                )}
              >
                ⚡ Instant Delivery
              </button>
            </div>
            {!isStock && <p className="text-xs text-gray-500 mt-1">Stock fulfillment required for instant delivery</p>}
          </>
        );
      },
    },
    // ── Batch Selector — shown only for instant stock sales ───────────────────
    {
      name: 'batch_code',
      label: 'Batch',
      type: 'custom',
      required: true,
      gridColumn: 'col-span-2',
      showWhen: (fv) => {
        const ft = fv.fulfillment_type;
        const isStock = ft === FULFILLMENT_TYPES.STOCK_FROM_OUTDOOR || ft === FULFILLMENT_TYPES.STOCK_FROM_INDOOR;
        return Boolean(fv.is_instant_sell) && isStock;
      },
      render: (field, fv) => {
        const ft = fv.fulfillment_type || FULFILLMENT_TYPES.STOCK_FROM_INDOOR;
        return (
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
            <SelectContent>
              {ft === FULFILLMENT_TYPES.STOCK_FROM_OUTDOOR
                ? outdoorBatches.map((b) => {
                    const bookable = Number(b.bookable_plants ?? b.available_plants);
                    return (
                      <SelectItem key={b.batch_code} value={b.batch_code}>
                        {b.batch_code} — {b.plant_name} ({bookable.toLocaleString()} bookable of {Number(b.total_plants).toLocaleString()})
                      </SelectItem>
                    );
                  })
                : indoorBatches.map((b) => {
                    const bookable = Number(b.bookable_bottles ?? b.available_bottles);
                    return (
                      <SelectItem key={b.batch_code} value={b.batch_code}>
                        {b.batch_code} — {b.plant_name} — {b.stage} ({bookable.toLocaleString()} bookable)
                      </SelectItem>
                    );
                  })}
            </SelectContent>
          </Select>
        );
      },
    },
    // ── Expected Delivery Date — required for pre-bookings ────────────────────
    {
      name: 'expected_delivery_date',
      label: 'Expected Delivery Date',
      type: 'date',
      required: true,
      gridColumn: 'col-span-2',
      showWhen: (fv) => !Boolean(fv.is_instant_sell),
    },
  ];

  const handleSubmit = async (data: BookingFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const payload: any = {
        customer_id: data.customer_id,
        plant_name: data.product_type,
        quantity: parseFloat(data.quantity),
        total_amount: parseFloat(data.total_amount),
        fulfillment_type: data.fulfillment_type,
        is_instant_sell: isStockFulfillment ? data.is_instant_sell : false,
        booking_date: new Date().toISOString().split('T')[0],
      };
      if (isStockFulfillment && data.is_instant_sell) {
        payload.batch_code = data.batch_code;
      }
      if (!data.is_instant_sell) {
        payload.expected_delivery_date = data.expected_delivery_date || null;
      }
      await onSubmit(payload);
      onOpenChange(false);
    } catch (error: any) {
      setErrorMessage(error?.message || 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SharedForm
      open={open}
      title="Create New Booking"
      fields={fields}
      onSubmit={handleSubmit}
      onClose={() => { setErrorMessage(null); onOpenChange(false); }}
      onFormChange={setFormValues}
      submitLabel={isSubmitting ? 'Creating...' : 'Complete Booking'}
      submitDisabled={Boolean(hasStockError) || Boolean(missingDeliveryDate) || isSubmitting}
      maxWidth="max-w-2xl"
      bodyPrefix={
        errorMessage ? (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <span className="text-red-600 text-sm font-medium flex-1">{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-red-600 text-lg leading-none"
            >
              ×
            </button>
          </div>
        ) : undefined
      }
    />
  );
};
