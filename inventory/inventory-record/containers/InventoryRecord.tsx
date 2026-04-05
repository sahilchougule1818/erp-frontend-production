import { useState, useEffect } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { inventoryApi } from '../../shared/services/inventoryApi';
import { InventoryUpdateTab } from '../components/InventoryUpdateTab';

type ItemWithLastWithdrawal = {
  id: number;
  name: string;
  unit: string;
  min_stock: number;
  current_stock: number;
  last_withdrawal_id: number | null;
  last_withdrawal_quantity: number | null;
  last_withdrawal_date: string | null;
  last_withdrawal_notes: string | null;
};

export function InventoryRecord() {
  const [items, setItems] = useState<ItemWithLastWithdrawal[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchItems();
  }, [currentPage]);

  const fetchItems = async () => {
    try {
      const res = await inventoryApi.stockUsage.getItemsWithLastWithdrawal(currentPage, limit);
      const data = res?.data || res;
      setItems(Array.isArray(data) ? data : []);
      if (res?.pagination) {
        const backendPage = res.pagination.currentPage || res.pagination.page || currentPage;
        setCurrentPage(backendPage);
        setTotalPages(res.pagination.totalPages);
        setTotal(res.pagination.total);
      }
    } catch (e) {
      console.error(e);
      setItems([]);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6">
      <InventoryUpdateTab
        items={items}
        onStockAdded={fetchItems}
        onItemAdded={fetchItems}
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
