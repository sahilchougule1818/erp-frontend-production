import { 
  Bell, LogOut, FlaskConical, Sprout, ShoppingCart, Package, FileText,
  Home, TestTube, Microscope, Thermometer, ShieldCheck, Warehouse, TreePine,
  ArrowRightLeft, Bug, Droplets, Clock, LayoutDashboard, Building, Shield, Menu, Users
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './shared/ui/avatar';
import { Badge } from './shared/ui/badge';
import { Button } from './shared/ui/button';
import { useAuth, User } from '../auth/AuthContext';
import { useState, useEffect } from 'react';
import { TwoFactorSetup } from '../auth/TwoFactorSetup';
import { NotificationPanel } from '../sales/shared/components/NotificationPanel';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './shared/ui/dropdown-menu';

interface HeaderProps {
  breadcrumbs: string[];
  user: User | null;
  onNavigate?: (page: string, breadcrumbs: string[]) => void;
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

export function Header({ breadcrumbs, user, onNavigate }: HeaderProps) {
  const { logout } = useAuth();
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [has2FA, setHas2FA] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (user) check2FAStatus();
    fetchNotificationCount();
  }, [user]);

  const fetchNotificationCount = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/sales/notifications/upcoming-deliveries`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotificationCount(data.length);
      }
    } catch (err) {
      console.error('Failed to fetch notification count');
    }
  };

  const check2FAStatus = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/2fa/status`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHas2FA(data.enabled);
      }
    } catch (err) {
      console.error('Failed to check 2FA status');
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable 2FA?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/2fa/disable`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setHas2FA(false);
        alert('2FA disabled successfully');
      }
    } catch (err) {
      alert('Failed to disable 2FA');
    }
  };


  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
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
      'Contamination': Bug,
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
      <div className="h-16 px-6 flex items-center justify-end">
        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-white/60 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <NotificationPanel onClose={() => { setShowNotifications(false); fetchNotificationCount(); }} />
            )}
          </div>

          {/* User Profile */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 pl-4 border-l border-green-200 hover:bg-white/60 px-2 py-1 rounded-lg transition-colors">
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-900">{user.firstName} {user.lastName}</div>
                    <div className="text-xs text-green-600">{user.role || 'User'}</div>
                  </div>
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-green-100 to-green-200 text-green-700">
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground mt-1">
                      {user.role || 'User'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === 'Admin' && (
                  <DropdownMenuItem onClick={() => onNavigate?.('user-management', ['Admin', 'User Management'])} className="cursor-pointer">
                    <Users className="w-4 h-4 mr-2" />
                    User Management
                  </DropdownMenuItem>
                )}
                {has2FA ? (
                  <DropdownMenuItem onClick={handleDisable2FA} className="cursor-pointer">
                    <Shield className="w-4 h-4 mr-2" />
                    Disable 2FA
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => setShow2FASetup(true)} className="cursor-pointer">
                    <Shield className="w-4 h-4 mr-2" />
                    Enable 2FA
                  </DropdownMenuItem>
                )}
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
      {show2FASetup && <TwoFactorSetup onClose={() => { setShow2FASetup(false); check2FAStatus(); }} />}
    </div>
  );
}
