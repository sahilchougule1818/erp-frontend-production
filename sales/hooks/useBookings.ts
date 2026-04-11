import { useState, useEffect, useCallback } from 'react';
import { customerBookingsApi, bookingPaymentsApi } from '../services/salesApi';
import type { Booking, BookingPayment } from '../types';

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const fetchBookings = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await customerBookingsApi.getAll({ page });
      if (response.data) {
        setBookings(Array.isArray(response.data) ? response.data : []);
        const backendPage = response.pagination.currentPage || response.pagination.page || page;
        setPagination({
          ...response.pagination,
          page: backendPage,
          currentPage: backendPage
        });
      } else {
        setBookings(Array.isArray(response) ? response : []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  return {
    bookings, loading, error, pagination,
    refetch: fetchBookings,
    createBooking: customerBookingsApi.create,
    updateBooking: customerBookingsApi.update,
    updateStatus: customerBookingsApi.updateStatus,
    cancelBooking: customerBookingsApi.cancel,
    deleteBooking: customerBookingsApi.delete,
  };
};

export const useCustomerBookings = useBookings;

export const useBookingPayments = (bookingId: string | null | undefined) => {
  const [payments, setPayments] = useState<BookingPayment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPayments = useCallback(async () => {
    if (!bookingId) { setPayments([]); return; }
    try {
      setLoading(true);
      const data = await bookingPaymentsApi.getByBooking(bookingId);
      setPayments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  return {
    payments,
    loading,
    createPayment: bookingPaymentsApi.create,
    deletePayment: bookingPaymentsApi.delete,
    refetch: fetchPayments
  };
};
