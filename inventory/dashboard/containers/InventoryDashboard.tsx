import { useState, useEffect } from 'react';
import { Box, Trash2, LayoutDashboard } from 'lucide-react';
import { Badge } from '../../shared/ui/badge';
import { DataTable } from '../../shared/components/DataTable';
import { inventoryApi } from '../../shared/services/inventoryApi';

export function InventoryDashboard() {
  const [items, setItems] = useState<any[]>([]);
  const [stockLevels, setStockLevels] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    try {
      const [itemRes, stockRes] = await Promise.all([
        inventoryApi.items.getAll(),
        inventoryApi.stockUsage.getStockLevels(currentPage, limit)
      ]);
      setItems(Array.isArray(itemRes) ? itemRes : []);
      const stockData = stockRes?.data || stockRes;
      setStockLevels(Array.isArray(stockData) ? stockData : []);
      if (stockRes?.pagination) {
        const backendPage = stockRes.pagination.currentPage || stockRes.pagination.page || currentPage;
        setCurrentPage(backendPage);
        setTotalPages(stockRes.pagination.totalPages);
        setTotal(stockRes.pagination.total);
      }
    } catch (e) {
      console.error('Failed to fetch dashboard data:', e);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const stockColumns = [
    { label: 'Item Name', key: 'item_name' },
    { label: 'Current Stock', key: 'current_stock' },
    { label: 'Min Stock', key: 'min_stock' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
        <div style={{ padding: '20px', backgroundColor: '#ecfdf5', borderRadius: '12px', borderBottom: '4px solid #10b981', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#047857' }} className="uppercase tracking-wider">Total Items</span>
            <Box style={{ color: '#059669', width: '20px', height: '20px' }} />
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: '900', color: '#064e3b', marginTop: '8px' }}>{(items || []).length}</div>
        </div>
        
        <div style={{ padding: '20px', backgroundColor: '#fff1f2', borderRadius: '12px', borderBottom: '4px solid #f43f5e', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#be123c' }} className="uppercase tracking-wider">Low Stock Items</span>
            <Trash2 style={{ color: '#e11d48', width: '20px', height: '20px' }} />
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: '900', color: '#881337', marginTop: '8px' }}>
            {(stockLevels || []).filter(s => parseFloat(s.current_stock) <= parseFloat(s.min_stock)).length}
          </div>
        </div>
      </div>

      <DataTable 
        title="Live Stock Inventory" 
        columns={stockColumns} 
        records={stockLevels}
        pagination={{
          currentPage,
          totalPages,
          total,
          limit,
          onPageChange: handlePageChange
        }}
      />
    </div>
  );
}
