import { useState, useEffect } from 'react';
import { DataTable } from '../../shared/components/DataTable';
import apiClient from '../../shared/services/apiClient';
import { Badge } from '../../shared/ui/badge';

export function BookingLifecycle() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  useEffect(() => {
    fetchRecords(pagination.page);
  }, []);

  const fetchRecords = async (page: number) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/sales/booking-lifecycle?page=${page}`);
      setRecords(response.data || []);
      const backendPage = response.pagination.currentPage || response.pagination.page || page;
      setPagination({
        ...response.pagination,
        page: backendPage,
        currentPage: backendPage
      });
    } catch (err) {
      console.error('Failed to fetch booking lifecycle:', err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchRecords(page);
  };

  const columns = [
    { key: 'booking_id', label: 'Booking ID' },
    { key: 'customer_name', label: 'Customer' },
    {
      key: 'created_at',
      label: 'Created Date',
      render: (val: string) => val
        ? new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : '-'
    },
    { key: 'batch_code', label: 'Batch' },
    { key: 'quantity', label: 'Qty' },
    {
      key: 'expected_delivery_date',
      label: 'Expected Delivery',
      render: (val: string) => val
        ? new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : '-'
    },
    {
      key: 'days_until_delivery',
      label: 'Days Left',
      render: (val: number, row: any) => {
        if (row.delivery_status === 'Delivered') return '-';
        if (val === null || val === undefined) return '-';
        
        const daysNum = Number(val);
        let colorClass = 'bg-gray-100 text-gray-700';
        let prefix = '';
        
        if (daysNum < 0) {
          colorClass = 'bg-red-100 text-red-700';
          prefix = 'Overdue by ';
        } else if (daysNum === 0) {
          colorClass = 'bg-orange-100 text-orange-700';
          return <Badge className={colorClass}>Today</Badge>;
        } else if (daysNum <= 3) {
          colorClass = 'bg-yellow-100 text-yellow-700';
        } else if (daysNum <= 7) {
          colorClass = 'bg-blue-100 text-blue-700';
        } else {
          colorClass = 'bg-green-100 text-green-700';
        }
        
        return (
          <Badge className={colorClass}>
            {prefix}{Math.abs(daysNum)} day{Math.abs(daysNum) !== 1 ? 's' : ''}
          </Badge>
        );
      }
    },
    {
      key: 'delivered_at_stage',
      label: 'Delivered Stage',
      render: (val: string) => val ? <Badge variant="outline">{val}</Badge> : '-'
    },
    {
      key: 'delivery_status',
      label: 'Delivery',
      render: (val: string) => {
        const config = {
          'Pending': { cls: 'bg-yellow-100 text-yellow-800' },
          'Delivered': { cls: 'bg-green-100 text-green-800' },
          'Cancelled': { cls: 'bg-red-100 text-red-800' }
        }[val] || { cls: 'bg-gray-100 text-gray-800' };
        return <Badge className={config.cls}>{val}</Badge>;
      }
    },
    {
      key: 'payment_status',
      label: 'Payment',
      render: (val: string) => {
        const config = {
          'Pending': { cls: 'bg-yellow-100 text-yellow-800' },
          'Paid': { cls: 'bg-green-100 text-green-800' }
        }[val] || { cls: 'bg-gray-100 text-gray-800' };
        return <Badge className={config.cls}>{val}</Badge>;
      }
    }
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Booking Lifecycle Tracker</h1>
        <p className="text-sm text-gray-600 mt-1">
          Track booking creation stage, delivery stage, and batch progression
        </p>
      </div>

      <DataTable
        title="Booking Lifecycle"
        columns={columns}
        records={records}
        filterConfig={{
          filter1Key: 'customer_name',
          filter1Label: 'Customer Name',
          filter2Key: 'batch_code',
          filter2Label: 'Batch Code'
        }}
        exportFileName="booking_lifecycle"
        pagination={{
          currentPage: pagination.page,
          totalPages: pagination.totalPages,
          total: pagination.total,
          limit: pagination.limit,
          onPageChange: handlePageChange
        }}
      />
    </div>
  );
}
