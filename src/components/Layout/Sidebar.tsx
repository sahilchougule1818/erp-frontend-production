import { useState, useMemo, useEffect } from 'react';
import { 
  Home, 
  FlaskConical, 
  Sprout, 
  ShoppingCart, 
  FileText, 
  ChevronDown, 
  ChevronRight,
  TestTube,
  Microscope,
  Thermometer,
  ShieldCheck,
  Warehouse,
  TreePine,
  ArrowRightLeft,
  Bug,
  Droplets,
  Package,
  Clock,
  LayoutDashboard, /* Added for Sales Dashboard */
  Building /* Added for Supplier Detail */
} from 'lucide-react';
import { User } from '../Auth/AuthContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string, breadcrumbs: string[]) => void;
  user: User | null;
}

export function Sidebar({ currentPage, onNavigate, user }: SidebarProps) {
  // Determine which groups should be expanded based on user role
  const getInitialExpandedGroups = () => {
    if (!user) return [];
    
    switch (user.role) {
      case 'owner':
        return ['indoor', 'outdoor', 'inventory-supplier', 'sales', 'reports'];
      case 'indoor-operator':
        return ['indoor'];
      case 'outdoor-operator':
        return ['outdoor'];
      case 'sales-analyst':
        return ['sales', 'inventory-supplier', 'reports'];
      default:
        return [];
    }
  };

  const [expandedGroups, setExpandedGroups] = useState<string[]>(getInitialExpandedGroups());

  // Update expanded groups when user changes
  useEffect(() => {
    setExpandedGroups(getInitialExpandedGroups());
  }, [user]);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev =>
      prev.includes(group)
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  // Filter menu items based on user role
  const menuItems = useMemo(() => {
    const allMenuItems = [
    {
      id: 'indoor',
      label: 'Indoor Module',
      icon: FlaskConical,
      children: [
        { id: 'indoor-dashboard', label: 'Indoor Dashboard', icon: Home, page: 'indoor-dashboard', breadcrumbs: ['Indoor', 'Indoor Dashboard'] },
        { id: 'media-preparation', label: 'Media Preparation', icon: TestTube, page: 'media-preparation', breadcrumbs: ['Indoor', 'Media Preparation'] },
        { id: 'subculturing', label: 'Subculturing', icon: Microscope, page: 'subculturing', breadcrumbs: ['Indoor', 'Subculturing'] },
        { id: 'incubation', label: 'Incubation', icon: Thermometer, page: 'incubation', breadcrumbs: ['Indoor', 'Incubation'] },
        { id: 'cleaning-record', label: 'Cleaning Record', icon: ShieldCheck, page: 'cleaning-record', breadcrumbs: ['Indoor', 'Cleaning Record'] },
        { id: 'sampling', label: 'Sampling', icon: TestTube, page: 'sampling', breadcrumbs: ['Indoor', 'Sampling'] }
      ]
    },
    {
      id: 'outdoor',
      label: 'Outdoor Module',
      icon: Sprout,
      children: [
        { id: 'outdoor-dashboard', label: 'Outdoor Dashboard', icon: Warehouse, page: 'outdoor-dashboard', breadcrumbs: ['Outdoor', 'Dashboard'] },
        { id: 'primary-hardening', label: 'Primary Hardening', icon: TreePine, page: 'primary-hardening', breadcrumbs: ['Outdoor', 'Primary Hardening'] },
        { id: 'secondary-hardening', label: 'Secondary Hardening', icon: Sprout, page: 'secondary-hardening', breadcrumbs: ['Outdoor', 'Secondary Hardening'] },
        { id: 'shifting', label: 'Shifting Register', icon: ArrowRightLeft, page: 'shifting', breadcrumbs: ['Outdoor', 'Shifting'] },
        { id: 'outdoor-contamination', label: 'Mortality', icon: Bug, page: 'outdoor-contamination', breadcrumbs: ['Outdoor', 'Mortality'] },
        { id: 'fertilization', label: 'Fertilization', icon: Droplets, page: 'fertilization', breadcrumbs: ['Outdoor', 'Fertilization'] },
        { id: 'holding-area', label: 'Holding Area', icon: Package, page: 'holding-area', breadcrumbs: ['Outdoor', 'Holding Area'] },
        { id: 'batch-timeline', label: 'Batch Timeline', icon: Clock, page: 'batch-timeline', breadcrumbs: ['Outdoor', 'Batch Timeline'] },
        { id: 'outdoor-sampling', label: 'Sampling', icon: TestTube, page: 'outdoor-sampling', breadcrumbs: ['Outdoor', 'Sampling'] }
      ]
    },
    {
      id: 'sales',
      label: 'Sales',
      icon: ShoppingCart,
      children: [
        { id: 'inventory-dashboard', label: 'Sales Dashboard', icon: LayoutDashboard, page: 'inventory-dashboard', breadcrumbs: ['Sales', 'Sales Dashboard'] },
        { id: 'sales-buyer', label: 'Buyer Section', icon: ShoppingCart, page: 'sales-buyer', breadcrumbs: ['Sales', 'Buyer'] },
        { id: 'sales-seller', label: 'Seller Section', icon: FileText, page: 'sales-seller', breadcrumbs: ['Sales', 'Seller'] },
        { id: 'sales-ledger', label: 'Ledger Section', icon: FileText, page: 'sales-ledger', breadcrumbs: ['Sales', 'Ledger'] }
      ]
    },
    {
      id: 'inventory-supplier',
      label: 'Inventory & Supplier',
      icon: Package,
      children: [
        { id: 'inventory-record', label: 'Inventory Record', icon: Package, page: 'inventory-record', breadcrumbs: ['Inventory & Supplier', 'Inventory Record'] },
        { id: 'supplier-detail', label: 'Supplier Detail', icon: Building, page: 'supplier-detail', breadcrumbs: ['Inventory & Supplier', 'Supplier Detail'] }
      ]
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      page: 'reports',
      breadcrumbs: ['Reports']
    }
    ];

    if (!user) return [];

    // Filter based on user role
    switch (user.role) {
      case 'owner':
        // Owner has access to everything
        return allMenuItems;
      case 'indoor-operator':
        // Only indoor modules
        return allMenuItems.filter(item => item.id === 'indoor');
      case 'outdoor-operator':
        // Only outdoor modules
        return allMenuItems.filter(item => item.id === 'outdoor');
      case 'sales-analyst':
        // Only sales, inventory, supplier and reports
        return allMenuItems.filter(item => item.id === 'sales' || item.id === 'inventory-supplier' || item.id === 'reports');
      default:
        return [];
    }
  }, [user]);

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <FlaskConical className="w-8 h-8 text-green-600" />
        <div className="ml-3">
          <div className="text-gray-900">Seema Biotech</div>
          <div className="text-xs text-gray-500">ERP System</div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map(item => (
          <div key={item.id}>
            {item.children ? (
              <>
                <button
                  onClick={() => toggleGroup(item.id)}
                  className="w-full flex items-center justify-between px-6 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <item.icon className="w-5 h-5 mr-3" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  {expandedGroups.includes(item.id) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                {expandedGroups.includes(item.id) && (
                  <div className="bg-gray-50">
                    {item.children.map(child => (
                      <button
                        key={child.id}
                        onClick={() => onNavigate(child.page, child.breadcrumbs)}
                        className={`w-full flex items-center px-6 pl-12 py-2.5 text-sm transition-colors ${
                          currentPage === child.page
                            ? 'bg-green-50 text-green-700 border-r-4 border-green-600'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <child.icon className="w-4 h-4 mr-3" />
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => onNavigate(item.page!, item.breadcrumbs!)}
                className={`w-full flex items-center px-6 py-2.5 text-sm transition-colors ${
                  currentPage === item.page
                    ? 'bg-green-50 text-green-700 border-r-4 border-green-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
