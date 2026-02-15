import { 
  Bell, LogOut, FlaskConical, Sprout, ShoppingCart, Package, FileText,
  Home, TestTube, Microscope, Thermometer, ShieldCheck, Warehouse, TreePine,
  ArrowRightLeft, Bug, Droplets, Clock, LayoutDashboard, Building
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useAuth, User } from '../Auth/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface HeaderProps {
  breadcrumbs: string[];
  user: User | null;
}

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'owner':
      return 'Owner';
    case 'indoor-operator':
      return 'Indoor Operator';
    case 'outdoor-operator':
      return 'Outdoor Operator';
    case 'sales-analyst':
      return 'Sales & Report Analyst';
    default:
      return 'User';
  }
};

export function Header({ breadcrumbs, user }: HeaderProps) {
  const { logout } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getModuleIcon = (pageName: string) => {
    const iconMap: { [key: string]: any } = {
      'Indoor Dashboard': Home,
      'Media Preparation': TestTube,
      'Subculturing': Microscope,
      'Incubation': Thermometer,
      'Cleaning Record': ShieldCheck,
      'Sampling': TestTube,
      'Outdoor Dashboard': Warehouse,
      'Dashboard': Warehouse,
      'Primary Hardening': TreePine,
      'Secondary Hardening': Sprout,
      'Shifting': ArrowRightLeft,
      'Mortality': Bug,
      'Fertilization': Droplets,
      'Holding Area': Package,
      'Batch Timeline': Clock,
      'Inventory': LayoutDashboard,
      'Buyer': ShoppingCart,
      'Seller': FileText,
      'Ledger': FileText,
      'Inventory Record': Package,
      'Supplier Detail': Building,
      'Reports': FileText
    };
    return iconMap[pageName] || FileText;
  };

  const getModuleColor = (module: string) => {
    return { bg: 'bg-green-50', border: 'border-green-100', icon: 'text-green-600', text: 'text-green-700' };
  };

  const currentModule = breadcrumbs[0] || '';
  const currentPage = breadcrumbs[breadcrumbs.length - 1] || '';
  const ModuleIcon = getModuleIcon(currentPage);
  const colors = getModuleColor(currentModule);

  return (
    <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-purple-50 border-b border-gray-200">
      <div className="h-16 px-6 flex items-center justify-between">
        {/* Left Side - Current Module */}
        {currentPage && (
          <div className={`flex items-center gap-2 px-4 py-2 ${colors.bg} rounded-lg border ${colors.border}`}>
            <ModuleIcon className={`w-5 h-5 ${colors.icon}`} />
            <span className={`text-sm font-medium ${colors.text}`}>{currentPage}</span>
          </div>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* User Profile */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 pl-4 border-l border-green-200 hover:bg-white/60 px-2 py-1 rounded-lg transition-colors">
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-900">{user.name}</div>
                    <div className="text-xs text-green-600">{getRoleLabel(user.role)}</div>
                  </div>
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-green-100 to-green-200 text-green-700">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground mt-1">
                      {getRoleLabel(user.role)}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
