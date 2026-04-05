import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { Login } from './auth/NewLogin';
import { Sidebar } from './layout/Sidebar';
import { Header } from './layout/Header';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from './layout/shared/ui/Toaster';
import { Toaster as SalesToaster } from './sales/shared/ui/Toaster';
import { Toaster as IndoorToaster } from './indoor/shared/ui/Toaster';
import { Toaster as OutdoorToaster } from './outdoor/shared/ui/Toaster';
import { Toaster as InventoryToaster } from './inventory/shared/ui/Toaster';

// Lazy load all page components
const OperatorMaster = lazy(() => import('./indoor/operators/containers/OperatorMaster').then(m => ({ default: m.OperatorMaster })));
const OutdoorWorkerMaster = lazy(() => import('./outdoor/workers/containers/OutdoorWorkerMaster').then(m => ({ default: m.OutdoorWorkerMaster })));
const Tunnels = lazy(() => import('./outdoor/tunnels/containers/Tunnels').then(m => ({ default: m.Tunnels })));
const IndoorDashboard = lazy(() => import('./indoor/dashboard/containers/IndoorDashboard').then(m => ({ default: m.IndoorDashboard })));
const MediaPreparation = lazy(() => import('./indoor/media-preparation/containers/MediaPreparation').then(m => ({ default: m.MediaPreparation })));
const Subculturing = lazy(() => import('./indoor/subculturing/containers/Subculturing').then(m => ({ default: m.Subculturing })));
const Incubation = lazy(() => import('./indoor/incubation/containers/Incubation').then(m => ({ default: m.Incubation })));
const CleaningRecord = lazy(() => import('./indoor/cleaning/containers/CleaningRecord').then(m => ({ default: m.CleaningRecord })));
const Sampling = lazy(() => import('./indoor/sampling/containers/Sampling').then(m => ({ default: m.Sampling })));
const IndoorContamination = lazy(() => import('./indoor/contamination/containers/IndoorContamination').then(m => ({ default: m.IndoorContamination })));
const IndoorBatchMaster = lazy(() => import('./indoor/batch-master/containers/IndoorBatchMaster'));
const OutdoorDashboard = lazy(() => import('./outdoor/dashboard/containers/OutdoorDashboard').then(m => ({ default: m.OutdoorDashboard })));
const PrimaryHardening = lazy(() => import('./outdoor/hardening/containers/PrimaryHardening').then(m => ({ default: m.PrimaryHardening })));
const SecondaryHardening = lazy(() => import('./outdoor/hardening/containers/SecondaryHardening').then(m => ({ default: m.SecondaryHardening })));
const OutdoorMortality = lazy(() => import('./outdoor/mortality/containers/OutdoorMortality').then(m => ({ default: m.OutdoorMortality })));
const Fertilization = lazy(() => import('./outdoor/fertilization/containers/Fertilization').then(m => ({ default: m.Fertilization })));
const TunnelShifts = lazy(() => import('./outdoor/tunnels/containers/TunnelShifts').then(m => ({ default: m.TunnelShifts })));
const HoldingArea = lazy(() => import('./outdoor/holding-area/containers/HoldingArea').then(m => ({ default: m.HoldingArea })));
const OutdoorSampling = lazy(() => import('./outdoor/sampling/containers/OutdoorSampling').then(m => ({ default: m.OutdoorSampling })));
const BatchMaster = lazy(() => import('./outdoor/batch-master/containers/BatchMaster'));
const BankAccountSection = lazy(() => import('./sales/bank-accounts/containers/BankAccountSection'));
const CustomerSection = lazy(() => import('./sales/customers/containers/CustomerSection').then(m => ({ default: m.CustomerSection })));
const CustomersManagement = lazy(() => import('./sales/customers/containers/CustomersManagement').then(m => ({ default: m.CustomersManagement })));
const InventoryPurchasesSection = lazy(() => import('./sales/inventory-purchases/containers/InventoryPurchasesSection').then(m => ({ default: m.InventoryPurchasesSection })));
const LedgerSection = lazy(() => import('./sales/ledger/containers/LedgerSection').then(m => ({ default: m.LedgerSection })));
const BookingLifecycle = lazy(() => import('./sales/bookings/containers/BookingLifecycle').then(m => ({ default: m.BookingLifecycle })));
const RefundDisbursementSection = lazy(() => import('./sales/refunds/containers/RefundDisbursementSection').then(m => ({ default: m.RefundDisbursementSection })));
const Reports = lazy(() => import('./reports/Reports').then(m => ({ default: m.Reports })));
const InventoryRecord = lazy(() => import('./inventory/inventory-record/containers/InventoryRecord').then(m => ({ default: m.InventoryRecord })));
const SupplierDetail = lazy(() => import('./inventory/supplier-detail/containers/SupplierDetail').then(m => ({ default: m.SupplierDetail })));
const InventoryOverview = lazy(() => import('./inventory/dashboard/containers/InventoryDashboard').then(m => ({ default: m.InventoryDashboard })));
const PurchaseLog = lazy(() => import('./inventory/purchase-log/containers/PurchaseLog').then(m => ({ default: m.PurchaseLog })));
const WithdrawalLog = lazy(() => import('./inventory/withdrawal-log/containers/WithdrawalLog').then(m => ({ default: m.WithdrawalLog })));
const SalesDashboard = lazy(() => import('./sales/dashboard/containers/SalesDashboard').then(m => ({ default: m.SalesDashboard })));
const UserManagement = lazy(() => import('./auth/NewUserManagement').then(m => ({ default: m.UserManagement })));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

function AppContent() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('indoor-dashboard');
  const [breadcrumbs, setBreadcrumbs] = useState(['Indoor', 'Dashboard']);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  // Get default page and breadcrumbs based on user role
  const getDefaultPage = useCallback(() => {
    if (!user) return { page: 'indoor-dashboard', breadcrumbs: ['Indoor', 'Dashboard'] };
    
    if (user.role === 'Admin') {
      return { page: 'indoor-dashboard', breadcrumbs: ['Indoor', 'Dashboard'] };
    }
    
    return { page: 'indoor-dashboard', breadcrumbs: ['Indoor', 'Dashboard'] };
  }, [user]);

  // Check if user has access to a page
  const hasAccess = useCallback((_page: string): boolean => {
    if (!user) return false;
    if (user.role === 'Admin') return true;
    return true; // Allow all pages for now
  }, [user]);

  // Initialize page based on user role when user is available
  useEffect(() => {
    if (user) {
      const defaultPage = getDefaultPage();
      // Only update if current page doesn't match default or user doesn't have access
      if (currentPage !== defaultPage.page || !hasAccess(currentPage)) {
        setCurrentPage(defaultPage.page);
        setBreadcrumbs(defaultPage.breadcrumbs);
      }
    }
  }, [user, hasAccess, getDefaultPage]); // Add hasAccess and getDefaultPage to dependencies

  const handleNavigate = (page: string, breadcrumbPath: string[]) => {
    setCurrentPage(page);
    setBreadcrumbs(breadcrumbPath);
    navigate(`/${page}`); // Use navigate for routing
  };

  // Redirect if user does not have access to the current page
  useEffect(() => {
    if (user && !isLoading && !hasAccess(currentPage)) {
      const defaultPage = getDefaultPage();
      setCurrentPage(defaultPage.page);
      setBreadcrumbs(defaultPage.breadcrumbs);
      navigate(`/${defaultPage.page}`);
    }
  }, [user, isLoading, currentPage, hasAccess, getDefaultPage, navigate]);

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} user={user} isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header breadcrumbs={breadcrumbs} user={user} onNavigate={handleNavigate} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<IndoorDashboard />} />
              <Route path="/indoor-dashboard" element={<IndoorDashboard />} />
              <Route path="/indoor-batch-master" element={<IndoorBatchMaster />} />
              <Route path="/operator-master" element={<OperatorMaster />} />
              <Route path="/media-preparation" element={<MediaPreparation />} />
              <Route path="/subculturing" element={<Subculturing />} />
              <Route path="/incubation" element={<Incubation />} />
              <Route path="/indoor-contamination" element={<IndoorContamination />} />
              <Route path="/cleaning-record" element={<CleaningRecord />} />
              <Route path="/sampling" element={<Sampling />} />
              <Route path="/outdoor-dashboard" element={<OutdoorDashboard />} />
              <Route path="/outdoor-operator-master" element={<OutdoorWorkerMaster />} />
              <Route path="/tunnel-master" element={<Tunnels />} />
              <Route path="/primary-hardening" element={<PrimaryHardening />} />
              <Route path="/secondary-hardening" element={<SecondaryHardening />} />
              <Route path="/shifting" element={<TunnelShifts />} />

              <Route path="/outdoor-contamination" element={<OutdoorMortality />} />
              <Route path="/fertilization" element={<Fertilization />} />
              <Route path="/holding-area" element={<HoldingArea />} />
              <Route path="/outdoor-sampling" element={<OutdoorSampling />} />
              <Route path="/batch-master" element={<BatchMaster />} />
              <Route path="/sales-bank" element={<BankAccountSection />} />
              <Route path="/sales-buyer" element={<CustomerSection />} />
              <Route path="/sales-customers" element={<CustomersManagement />} />
              <Route path="/sales-refunds" element={<RefundDisbursementSection />} />
              <Route path="/sales-inventory-purchases" element={<InventoryPurchasesSection />} />
              <Route path="/sales-ledger" element={<LedgerSection />} />
              <Route path="/booking-lifecycle" element={<BookingLifecycle />} />
              {/* <Route path="/production-orders" element={<ProductionOrders />} /> */}
              <Route path="/inventory-dashboard" element={<SalesDashboard />} />
              <Route path="/inventory-dashboard-master" element={<InventoryOverview />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/inventory-record" element={<InventoryRecord />} />
              <Route path="/purchase-log" element={<PurchaseLog />} />
              <Route path="/withdrawal-log" element={<WithdrawalLog />} />
              <Route path="/supplier-detail" element={<SupplierDetail />} />
              <Route path="/user-management" element={<UserManagement />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <Toaster />
        <SalesToaster />
        <IndoorToaster />
        <OutdoorToaster />
        <InventoryToaster />
      </AuthProvider>
    </Router>
  );
}
