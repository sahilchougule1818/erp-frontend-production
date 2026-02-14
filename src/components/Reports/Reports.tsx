import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Download, FileText, TrendingUp, Package, Bug } from 'lucide-react';
import { BarChart, Bar, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const weeklyProductionData = [
  { week: 'Week 1', indoor: 2400, outdoor: 4200, total: 6600 },
  { week: 'Week 2', indoor: 2800, outdoor: 4800, total: 7600 },
  { week: 'Week 3', indoor: 2600, outdoor: 4500, total: 7100 },
  { week: 'Week 4', indoor: 3200, outdoor: 5200, total: 8400 }
];

const indoorMonthlyData = [
  { stage: 'Stage 1', count: 4200 },
  { stage: 'Stage 2', count: 3850 },
  { stage: 'Stage 3', count: 3520 },
  { stage: 'Stage 4', count: 3180 },
  { stage: 'Stage 5', count: 2950 },
  { stage: 'Stage 6', count: 2720 },
  { stage: 'Stage 7', count: 2480 },
  { stage: 'Stage 8', count: 2280 }
];

const outdoorMovementData = [
  { month: 'Jan', monthlyTransfers: 3680, primaryHardening: 1180, secondaryHardening: 960, holdingArea: 420, mortality: 32 },
  { month: 'Feb', monthlyTransfers: 3920, primaryHardening: 1260, secondaryHardening: 1010, holdingArea: 450, mortality: 28 },
  { month: 'Mar', monthlyTransfers: 4015, primaryHardening: 1305, secondaryHardening: 1040, holdingArea: 470, mortality: 24 },
  { month: 'Apr', monthlyTransfers: 4160, primaryHardening: 1340, secondaryHardening: 1095, holdingArea: 495, mortality: 22 },
  { month: 'May', monthlyTransfers: 4290, primaryHardening: 1390, secondaryHardening: 1130, holdingArea: 520, mortality: 18 }
];

const inventorySupplierSummary = [
  { item: 'Cocopeat', inventory: 450, supplier: 100 },
  { item: 'Peatmoss', inventory: 800, supplier: 200 },
  { item: 'Pots', inventory: 270, supplier: 80 },
  { item: 'Trays', inventory: 320, supplier: 65 },
  { item: 'Nutrients', inventory: 190, supplier: 55 }
];

const salesSummary = [
  { customer: 'Green Valley Nursery', orders: 8, quantity: 12000, revenue: 600000, status: 'Active' },
  { customer: 'Sunrise Farms', orders: 5, quantity: 8500, revenue: 425000, status: 'Active' },
  { customer: 'Botanical Gardens Ltd', orders: 6, quantity: 9200, revenue: 480000, status: 'Pending' },
  { customer: 'Flora Exports', orders: 12, quantity: 18500, revenue: 950000, status: 'Active' }
];

export function Reports() {
  return (
    <div className="p-6 space-y-6">
      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date From</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>Date To</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>Crop</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All Crops" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Crops</SelectItem>
                  <SelectItem value="banana">Banana</SelectItem>
                  <SelectItem value="strawberry">Strawberry</SelectItem>
                  <SelectItem value="rose">Rose</SelectItem>
                  <SelectItem value="gerbera">Gerbera</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline">Reset</Button>
            <Button className="bg-green-600 hover:bg-green-700">Apply Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Reports</CardTitle>
            <Button variant="outline" className="flex gap-2">
              <Download className="w-4 h-4" />
              Export Current Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="production">
            <TabsList className="mb-6">
              <TabsTrigger value="production">Weekly Production</TabsTrigger>
              <TabsTrigger value="indoor">Indoor Monthly</TabsTrigger>
              <TabsTrigger value="outdoor">Outdoor Monthly</TabsTrigger>
              <TabsTrigger value="sales">Sales Summary</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="contamination">Contamination</TabsTrigger>
            </TabsList>

            {/* Weekly Production Report */}
            <TabsContent value="production">
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-green-600" />
                        <div>
                          <p className="text-xs text-green-700">Total Production</p>
                          <p className="text-xl text-green-900">29,700</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <div>
                          <p className="text-xs text-blue-700">Indoor</p>
                          <p className="text-xl text-blue-900">11,000</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Package className="w-8 h-8 text-purple-600" />
                        <div>
                          <p className="text-xs text-purple-700">Outdoor</p>
                          <p className="text-xl text-purple-900">18,700</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-amber-50 border-amber-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-amber-600" />
                        <div>
                          <p className="text-xs text-amber-700">Avg/Week</p>
                          <p className="text-xl text-amber-900">7,425</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyProductionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="week" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="indoor" fill="#4CAF50" name="Indoor" />
                    <Bar dataKey="outdoor" fill="#81C784" name="Outdoor" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            {/* Monthly Indoor Report */}
            <TabsContent value="indoor">
              <div className="space-y-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={indoorMonthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="stage" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#22c55e" name="Plant Count" />
                  </BarChart>
                </ResponsiveContainer>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Stage</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Plant Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {indoorMonthlyData.map((item, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{item.stage}</td>
                          <td className="px-4 py-3 text-sm">
                            {item.count.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Sales Summary Report */}
            <TabsContent value="sales">
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <p className="text-xs text-green-700">Total Revenue</p>
                      <p className="text-xl text-green-900">₹24.55L</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <p className="text-xs text-blue-700">Total Orders</p>
                      <p className="text-xl text-blue-900">31</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4">
                      <p className="text-xs text-purple-700">Avg Order Value</p>
                      <p className="text-xl text-purple-900">₹79K</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-amber-50 border-amber-200">
                    <CardContent className="p-4">
                      <p className="text-xs text-amber-700">Active Customers</p>
                      <p className="text-xl text-amber-900">4</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Customer</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Orders</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Revenue</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesSummary.map((item, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{item.customer}</td>
                          <td className="px-4 py-3 text-sm">{item.orders}</td>
                          <td className="px-4 py-3 text-sm">{item.quantity.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm">₹{(item.revenue / 1000).toFixed(0)}K</td>
                          <td className="px-4 py-3 text-sm">
                            <Badge className={item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                              {item.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Contamination Summary */}
            <TabsContent value="contamination">
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Bug className="w-8 h-8 text-red-600" />
                        <div>
                          <p className="text-xs text-red-700">Total Cases</p>
                          <p className="text-xl text-red-900">15</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-amber-50 border-amber-200">
                    <CardContent className="p-4">
                      <p className="text-xs text-amber-700">Indoor</p>
                      <p className="text-xl text-amber-900">9</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-orange-50 border-orange-200">
                    <CardContent className="p-4">
                      <p className="text-xs text-orange-700">Outdoor</p>
                      <p className="text-xl text-orange-900">6</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <p className="text-xs text-green-700">Resolved</p>
                      <p className="text-xl text-green-900">13</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600 mb-4">Contamination breakdown and detailed logs can be viewed in respective modules.</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="text-sm">Bacterial</span>
                        <Badge className="bg-red-100 text-red-700">8 cases</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="text-sm">Fungal</span>
                        <Badge className="bg-orange-100 text-orange-700">4 cases</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="text-sm">Pest Infestation</span>
                        <Badge className="bg-amber-100 text-amber-700">3 cases</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Outdoor Movement Report */}
            <TabsContent value="outdoor">
              <div className="space-y-6">
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart data={outdoorMovementData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="primaryHardening" fill="#4ade80" name="Primary Hardening" />
                    <Bar dataKey="secondaryHardening" fill="#34d399" name="Secondary Hardening" />
                    <Bar dataKey="holdingArea" fill="#c4b5fd" name="Holding Area" />
                    <Line
                      type="monotone"
                      dataKey="monthlyTransfers"
                      stroke="#15803d"
                      strokeWidth={3}
                      name="Monthly Transfers"
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="mortality"
                      stroke="#f97316"
                      strokeDasharray="4 2"
                      name="Mortality"
                      dot={{ r: 3 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Month</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Monthly Transfers</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Primary</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Secondary</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Holding</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Mortality</th>
                      </tr>
                    </thead>
                    <tbody>
                      {outdoorMovementData.map((row) => (
                        <tr key={row.month} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{row.month}</td>
                          <td className="px-4 py-3 text-sm">{row.monthlyTransfers.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm">{row.primaryHardening.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm">{row.secondaryHardening.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm">{row.holdingArea.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-amber-600">{row.mortality}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Inventory Report */}
            <TabsContent value="inventory">
              <div className="space-y-6">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={inventorySupplierSummary}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="item" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="inventory" fill="#22c55e" name="Inventory Stock" />
                    <Bar dataKey="supplier" fill="#60a5fa" name="Supplier Deliveries" />
                  </BarChart>
                </ResponsiveContainer>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Item</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Inventory Stock</th>
                        <th className="px-4 py-3 text-left text-xs text-gray-600">Supplier Intake</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventorySupplierSummary.map((row) => (
                        <tr key={row.item} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{row.item}</td>
                          <td className="px-4 py-3 text-sm">{row.inventory.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm">{row.supplier.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
