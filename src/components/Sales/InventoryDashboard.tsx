import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Package,
  ArrowUp,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

export function InventoryDashboard() {
  const [selectedCrop, setSelectedCrop] = React.useState<string>('all');

  const batchData = [
    { batch: 'BTH-2024-001', crop: 'Banana', quantity: 2305, location: 'Holding Area', status: 'Ready', age: 10, health: 'Excellent' },
    { batch: 'BTH-2024-002', crop: 'Bamboo', quantity: 1850, location: 'Holding Area', status: 'Ready', age: 12, health: 'Good' },
    { batch: 'BTH-2024-003', crop: 'Teak', quantity: 1750, location: 'Holding Area', status: 'Ready', age: 18, health: 'Good' },
    { batch: 'BTH-2024-004', crop: 'Ornamental Plants', quantity: 1200, location: 'Holding Area', status: 'Ready', age: 8, health: 'Excellent' },
    { batch: 'BTH-2024-006', crop: 'Banana', quantity: 3100, location: 'Holding Area', status: 'Ageing', age: 26, health: 'Fair' },
    { batch: 'BTH-2024-009', crop: 'Bamboo', quantity: 1500, location: 'Holding Area', status: 'Ready', age: 5, health: 'Excellent' },
    { batch: 'BTH-2024-012', crop: 'Teak', quantity: 2800, location: 'Holding Area', status: 'Damaged', age: 31, health: 'Poor' },
  ];

  const filteredBatchData = selectedCrop === 'all' 
    ? batchData 
    : batchData.filter(item => item.crop === selectedCrop);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Ready': return 'bg-green-100 text-green-700 font-semibold hover:bg-green-100';
      case 'Ageing': return 'bg-yellow-100 text-yellow-700 font-semibold hover:bg-yellow-100';
      case 'Damaged': return 'bg-red-100 text-red-700 font-semibold hover:bg-red-100';
      default: return 'bg-gray-100 text-gray-700 font-semibold hover:bg-gray-100';
    }
  };

  const getHealthBadgeClass = (health: string) => {
    switch (health) {
      case 'Excellent': return 'bg-green-100 text-green-700 font-semibold hover:bg-green-100';
      case 'Good': return 'bg-blue-100 text-blue-700 font-semibold hover:bg-blue-100';
      case 'Fair': return 'bg-yellow-100 text-yellow-700 font-semibold hover:bg-yellow-100';
      case 'Poor': return 'bg-red-100 text-red-700 font-semibold hover:bg-red-100';
      default: return 'bg-gray-100 text-gray-700 font-semibold hover:bg-gray-100';
    }
  };

  const totalStock = filteredBatchData.reduce((acc, item) => acc + item.quantity, 0);
  const readyToDispatch = filteredBatchData.filter(item => item.status === 'Ready' && (item.health === 'Excellent' || item.health === 'Good')).reduce((acc, item) => acc + item.quantity, 0);
  const damagedStock = filteredBatchData.filter(item => item.status === 'Damaged' || item.health === 'Poor').reduce((acc, item) => acc + item.quantity, 0);
  const ageingStock = filteredBatchData.filter(item => item.status === 'Ageing' || item.health === 'Fair').reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Sales Dashboard</h1>
        <p className="text-sm text-gray-500">Live sales funnel, inventory readiness, and dispatch KPIs</p>
      </div>
      
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Crop Name</label>
          <Select value={selectedCrop} onValueChange={setSelectedCrop}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Crop" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Crops</SelectItem>
              <SelectItem value="Banana">Banana</SelectItem>
              <SelectItem value="Bamboo">Bamboo</SelectItem>
              <SelectItem value="Teak">Teak</SelectItem>
              <SelectItem value="Ornamental Plants">Ornamental Plants</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search batches, orders, reports..."
            className="pl-9 pr-3 py-2 border rounded-md w-full text-sm shadow-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap justify-between gap-2 mb-6">
        <Card className="flex flex-col justify-between p-4 border rounded-lg shadow-sm w-full sm:w-[calc(50%-theme(spacing.2)/2)] lg:w-[calc(25%-theme(spacing.2)*3/4)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 mb-3">
            <CardTitle className="text-sm font-normal text-gray-500">Total Stock</CardTitle>
            <div className="bg-blue-500/10 rounded-full p-2">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold text-gray-900">{totalStock.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">plants available</p>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between p-4 border rounded-lg shadow-sm w-full sm:w-[calc(50%-theme(spacing.2)/2)] lg:w-[calc(25%-theme(spacing.2)*3/4)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 mb-3">
            <CardTitle className="text-sm font-normal text-gray-500">Ready to Dispatch</CardTitle>
            <div className="bg-green-500/10 rounded-full p-2">
              <ArrowUp className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold text-gray-900">{readyToDispatch.toLocaleString()}</div>
            <p className="mt-1 text-xs text-green-600 font-semibold">excellent quality</p>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between p-4 border rounded-lg shadow-sm w-full sm:w-[calc(50%-theme(spacing.2)/2)] lg:w-[calc(25%-theme(spacing.2)*3/4)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 mb-3">
            <CardTitle className="text-sm font-normal text-gray-500">Damaged Stock</CardTitle>
            <div className="bg-red-500/10 rounded-full p-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold text-gray-900">{damagedStock.toLocaleString()}</div>
            <p className="mt-1 text-xs text-red-600 font-semibold">poor health</p>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between p-4 border rounded-lg shadow-sm w-full sm:w-[calc(50%-theme(spacing.2)/2)] lg:w-[calc(25%-theme(spacing.2)*3/4)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 mb-3">
            <CardTitle className="text-sm font-normal text-gray-500">Ageing Stock</CardTitle>
            <div className="bg-yellow-500/10 rounded-full p-2">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-bold text-gray-900">{ageingStock.toLocaleString()}</div>
            <p className="mt-1 text-xs text-yellow-600 font-semibold">priority dispatch</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg shadow-sm border">
        <CardHeader className="p-6 pb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className="font-semibold text-gray-900">Sales & Inventory</span>
            <span className="text-gray-400">{'>'}</span>
            <span className="text-green-600 font-semibold">Inventory</span>
          </div>
          <CardTitle className="text-xl font-bold mt-2 text-gray-900">Batch-wise Inventory</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50 rounded-t-lg">
                <TableRow>
                  <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider rounded-tl-lg">Batch</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Crop</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Quantity</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Location</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Age (days)</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider rounded-tr-lg">Health</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white divide-y divide-gray-200">
                {filteredBatchData.map((item) => (
                  <TableRow key={item.batch}>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                      <Button variant="link" className="p-0 h-auto text-blue-600 font-semibold">{item.batch}</Button>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.crop}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.quantity.toLocaleString()}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.location}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                      <Badge className={getStatusBadgeClass(item.status)}>{item.status}</Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">{item.age}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                      <Badge className={getHealthBadgeClass(item.health)}>{item.health}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredBatchData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                      No batches found for the selected crop.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
