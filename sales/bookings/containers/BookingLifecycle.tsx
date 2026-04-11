import { useState, useEffect } from 'react';
import { DataTable } from '../../../shared/components/DataTable';
import apiClient from '../../../shared/services/apiClient';
import { Badge } from '../../../shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';

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
      render: (val: string) => <span className="text-base">{val
        ? new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : '-'}</span>
    },
    { key: 'batch_code', label: 'Batch' },
    { key: 'quantity', label: 'Qty' },
    {
      key: 'expected_delivery_date',
      label: 'Expected Delivery',
      render: (val: string) => <span className="text-base">{val
        ? new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : '-'}</span>
    },
    {
      key: 'days_until_delivery',
      label: 'Days Left',
      render: (val: number, row: any) => {
        if (row.delivery_status === 'Delivered') return <span className="text-base">-</span>;
        if (val === null || val === undefined) return <span className="text-base">-</span>;
        
        const daysNum = Number(val);
        let colorClass = 'bg-gray-50 text-gray-700 border-gray-200';
        let prefix = '';
        
        if (daysNum < 0) {
          colorClass = 'bg-red-50 text-red-700 border-red-200';
          prefix = 'Overdue by ';
        } else if (daysNum === 0) {
          colorClass = 'bg-orange-50 text-orange-700 border-orange-200';
          return <Badge className={`${colorClass} border text-base`}>Today</Badge>;
        } else if (daysNum <= 3) {
          colorClass = 'bg-yellow-50 text-yellow-700 border-yellow-200';
        } else if (daysNum <= 7) {
          colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
        } else {
          colorClass = 'bg-green-50 text-green-700 border-green-200';
        }
        
        return (
          <Badge className={`${colorClass} border text-base`}>
            {prefix}{Math.abs(daysNum)} day{Math.abs(daysNum) !== 1 ? 's' : ''}
          </Badge>
        );
      }
    },
    {
      key: 'delivered_at_stage',
      label: 'Delivered Stage',
      render: (val: string) => val ? <Badge variant="outline" className="text-base border">{val}</Badge> : <span className="text-base">-</span>
    },
    {
      key: 'delivery_status',
      label: 'Delivery',
      render: (val: string) => {
        const config = {
          'Pending': { cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
          'Delivered': { cls: 'bg-green-50 text-green-700 border-green-200' },
          'Cancelled': { cls: 'bg-red-50 text-red-700 border-red-200' }
        }[val] || { cls: 'bg-gray-50 text-gray-700 border-gray-200' };
        return <Badge className={`${config.cls} border text-base`}>{val}</Badge>;
      }
    },
    {
      key: 'payment_status',
      label: 'Payment',
      render: (val: string) => {
        const config = {
          'Pending': { cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
          'Paid': { cls: 'bg-green-50 text-green-700 border-green-200' }
        }[val] || { cls: 'bg-gray-50 text-gray-700 border-gray-200' };
        return <Badge className={`${config.cls} border text-base`}>{val}</Badge>;
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
      <Tabs defaultValue="lifecycle" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="lifecycle">Booking Lifecycle</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lifecycle">
          <DataTable
            title=""
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
