import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './components/Auth/AuthContext';
import { Login } from './components/Auth/Login';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { OperatorMaster } from './components/Indoor/OperatorMaster';
import { IndoorDashboard } from './components/Indoor/IndoorDashboard';
import { MediaPreparation } from './components/Indoor/MediaPreparation';
import { Subculturing } from './components/Indoor/Subculturing';
import { Incubation } from './components/Indoor/Incubation';
import { CleaningRecord } from './components/Indoor/CleaningRecord';
import { Sampling } from './components/Indoor/Sampling';
import { OutdoorDashboard } from './components/Outdoor/OutdoorDashboard';
import { PrimaryHardening } from './components/Outdoor/PrimaryHardening';
import { SecondaryHardening } from './components/Outdoor/SecondaryHardening';
import { Mortality } from './components/Outdoor/Mortality';
import { Fertilization } from './components/Outdoor/Fertilization';
import { Shifting } from './components/Outdoor/Shifting';
import { HoldingArea } from './components/Outdoor/HoldingArea';
import { BatchTimeline } from './components/Outdoor/BatchTimeline';
import { OutdoorSampling } from './components/Outdoor/OutdoorSampling';
import { BuyerSection } from './components/Sales/BuyerSection';
import { SellerSection } from './components/Sales/SellerSection';
import { LedgerSection } from './components/Sales/LedgerSection';
import { Reports } from './components/Reports/Reports';
import { InventoryRecord } from './components/InventorySupplier/InventoryRecord/InventoryRecord';
import { SupplierDetail } from './components/InventorySupplier/SupplierDetail/SupplierDetail';
import { InventoryDashboard } from './components/Sales/InventoryDashboard'; // Import the restored component

import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

function AppContent() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('indoor-dashboard');
  const [breadcrumbs, setBreadcrumbs] = useState(['Indoor', 'Dashboard']);
  const navigate = useNavigate();

  // Get default page and breadcrumbs based on user role
  const getDefaultPage = useCallback(() => {
    if (!user) return { page: 'indoor-dashboard', breadcrumbs: ['Indoor', 'Dashboard'] };
    
    switch (user.role) {
      case 'owner':
        return { page: 'indoor-dashboard', breadcrumbs: ['Indoor', 'Dashboard'] };
      case 'indoor-operator':
        return { page: 'indoor-dashboard', breadcrumbs: ['Indoor', 'Dashboard'] };
      case 'outdoor-operator':
        return { page: 'outdoor-dashboard', breadcrumbs: ['Outdoor', 'Dashboard'] };
      case 'sales-analyst':
        return { page: 'sales-buyer', breadcrumbs: ['Sales', 'Buyer Bookings'] };
      default:
        return { page: 'indoor-dashboard', breadcrumbs: ['Indoor', 'Dashboard'] };
    }
  }, [user]);

  // Check if user has access to a page
  const hasAccess = useCallback((page: string): boolean => {
    if (!user) return false;
    if (user.role === 'owner') return true;

    const indoorPages = ['indoor-dashboard', 'operator-master', 'media-preparation', 'subculturing', 'incubation', 'cleaning-record', 'sampling'];
    const outdoorPages = ['outdoor-dashboard', 'primary-hardening', 'secondary-hardening', 'shifting', 'outdoor-contamination', 'fertilization', 'holding-area', 'batch-timeline', 'outdoor-sampling'];
    const salesPages = ['sales-buyer', 'sales-seller', 'sales-ledger', 'inventory-dashboard'];
    const inventorySupplierPages = ['inventory-record', 'supplier-detail'];
    const reportPages = ['reports'];

    switch (user.role) {
      case 'indoor-operator':
        return indoorPages.includes(page);
      case 'outdoor-operator':
        return outdoorPages.includes(page);
      case 'sales-analyst':
        return salesPages.includes(page) || inventorySupplierPages.includes(page) || reportPages.includes(page);
      default:
        return false;
    }
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
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header breadcrumbs={breadcrumbs} user={user} />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/indoor-dashboard" element={<IndoorDashboard />} />
            <Route path="/operator-master" element={<OperatorMaster />} />
            <Route path="/media-preparation" element={<MediaPreparation />} />
            <Route path="/subculturing" element={<Subculturing />} />
            <Route path="/incubation" element={<Incubation />} />
            <Route path="/cleaning-record" element={<CleaningRecord />} />
            <Route path="/sampling" element={<Sampling />} />
            <Route path="/outdoor-dashboard" element={<OutdoorDashboard />} />
            <Route path="/primary-hardening" element={<PrimaryHardening />} />
            <Route path="/secondary-hardening" element={<SecondaryHardening />} />
            <Route path="/shifting" element={<Shifting />} />
            <Route path="/outdoor-contamination" element={<Mortality />} />
            <Route path="/fertilization" element={<Fertilization />} />
            <Route path="/holding-area" element={<HoldingArea />} />
            <Route path="/batch-timeline" element={<BatchTimeline />} />
            <Route path="/outdoor-sampling" element={<OutdoorSampling />} />
            <Route path="/sales-buyer" element={<BuyerSection />} />
            <Route path="/sales-seller" element={<SellerSection />} />
            <Route path="/sales-ledger" element={<LedgerSection />} />
            <Route path="/inventory-dashboard" element={<InventoryDashboard />} /> {/* Sales Dashboard route */}
            <Route path="/reports" element={<Reports />} />
            <Route path="/inventory-record" element={<InventoryRecord />} />
            <Route path="/supplier-detail" element={<SupplierDetail />} />
          </Routes>
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
      </AuthProvider>
    </Router>
  );
}
