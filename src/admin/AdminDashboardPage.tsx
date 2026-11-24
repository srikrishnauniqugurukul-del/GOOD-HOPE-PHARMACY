import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Building2,
  Calendar,
  CalendarClock,
  CalendarOff,
  Clock,
  ExternalLink,
  FileEdit,
  Image as ImageIcon,
  LayoutDashboard,
  ListChecks,
  LogOut,
  MapPin,
  Menu,
  ShieldCheck,
  Star,
  Stethoscope,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { useSite } from '../hooks/useSiteContext';
import { adminFetch } from '../lib/api';
import { GoodHopeLogo } from '../components/GoodHopeLogo';
import type { AdminOverviewData, AdminTabKey } from './types';
import {
  AppointmentsTab,
  CalendarTab,
  OverviewTab,
} from './tabs/OverviewAndAppointmentsTabs';
import {
  CustomersTab,
  DepartmentsTab,
  DoctorsTab,
  ServicesTab,
} from './tabs/ClinicalCatalogTabs';
import {
  BlockedDatesTab,
  BusinessHoursTab,
  DoctorAvailabilityTab,
} from './tabs/ScheduleControlTabs';
import {
  AdminProfileTab,
  GalleryAdminTab,
  MapContactTab,
  NotificationsTab,
  ReviewsTab,
  SecurityTab,
  WebsiteContentTab,
} from './tabs/MediaContentAndSettingsTabs';

const SIDEBAR_ITEMS: Array<{ key: AdminTabKey; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { key: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
  { key: 'appointments', label: 'Appointments', icon: ListChecks },
  { key: 'calendar', label: 'Appointment Calendar', icon: Calendar },
  { key: 'doctors', label: 'Doctors', icon: Stethoscope },
  { key: 'departments', label: 'Departments', icon: Building2 },
  { key: 'services', label: 'Services', icon: FileEdit },
  { key: 'customers', label: 'Customers', icon: Users },
  { key: 'business_hours', label: 'Business Hours', icon: Clock },
  { key: 'doctor_availability', label: 'Doctor Availability', icon: CalendarClock },
  { key: 'blocked_dates', label: 'Blocked Dates', icon: CalendarOff },
  { key: 'gallery', label: 'Gallery', icon: ImageIcon },
  { key: 'content', label: 'Website Content', icon: FileEdit },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'reviews', label: 'Reviews', icon: Star },
  { key: 'map_contact', label: 'Map & Contact Settings', icon: MapPin },
  { key: 'profile', label: 'Admin Profile', icon: UserCheck },
  { key: 'security', label: 'Security Settings', icon: ShieldCheck },
];

export const AdminDashboardPage: React.FC = () => {
  const { adminToken, logoutAdmin, refreshSite } = useSite();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AdminTabKey>('overview');
  const [overview, setOverview] = useState<AdminOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; isError: boolean } | null>(null);

  const notify = useCallback((msg: string, isError = false) => {
    setToast({ msg, isError });
    window.setTimeout(() => {
      setToast((curr) => (curr?.msg === msg ? null : curr));
    }, 4000);
  }, []);

  const loadOverview = useCallback(async () => {
    if (!adminToken) return;
    try {
      const res = await adminFetch<AdminOverviewData>('/api/admin/overview', adminToken);
      setOverview(res);
      await refreshSite();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Session expired.';
      if (msg.toLowerCase().includes('authentication') || msg.toLowerCase().includes('session')) {
        logoutAdmin();
        navigate('/admin/login', { replace: true });
      } else {
        notify(msg, true);
      }
    } finally {
      setLoading(false);
    }
  }, [adminToken, logoutAdmin, navigate, notify, refreshSite]);

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin/login', { replace: true });
      return;
    }
    loadOverview();
  }, [adminToken, navigate, loadOverview]);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login', { replace: true });
  };

  if (!adminToken) return null;

  const currentItem = SIDEBAR_ITEMS.find((i) => i.key === activeTab) || SIDEBAR_ITEMS[0];

  return (
    <div className="min-h-screen bg-[#F5F7F8] flex">
      {/* Desktop & Mobile Sidebar (Green + Navy Brand Identity) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#172F43] text-white flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <GoodHopeLogo logoUrl={overview?.settings.logoUrl} size={38} />
            <div className="truncate">
              <div className="font-display font-extrabold text-sm text-white truncate">
                GOOD HOPE
              </div>
              <div className="text-[11px] text-[#B9D36A]">Admin Control Panel</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.key;
            const unread =
              item.key === 'notifications' ? overview?.stats.unreadNotifications || 0 : 0;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setActiveTab(item.key);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#37A879] text-white font-semibold'
                    : 'text-white/75 hover:bg-white/8 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                {unread > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-[#D83B48] text-white font-mono-tabular text-[10px] font-bold">
                    {unread}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* 18. Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-white/80 hover:bg-[#D83B48] hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white border-b border-[#172F43]/10 px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="lg:hidden p-2 rounded-lg border border-[#172F43]/15 text-[#172F43] cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="truncate">
              <div className="text-[11px] text-[#37A879] font-semibold">
                Good Hope Pharmacy · Kalimpong
              </div>
              <h1 className="font-display font-bold text-base sm:text-lg text-[#172F43] truncate">
                {currentItem.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F1F8F3] border border-[#37A879]/25 text-xs font-semibold text-[#172F43] hover:bg-[#e1f1e7] whitespace-nowrap"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#37A879]" />
            </Link>
          </div>
        </header>

        {toast && (
          <div
            className={`mx-4 sm:mx-6 mt-4 px-4 py-3 rounded-xl text-xs font-semibold border ${
              toast.isError
                ? 'bg-red-50 border-red-200 text-[#D83B48]'
                : 'bg-[#F1F8F3] border-[#37A879]/35 text-[#28865E]'
            }`}
          >
            {toast.msg}
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 max-w-[1400px] w-full mx-auto">
          {loading || !overview ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-24 rounded-xl bg-white border border-[#172F43]/10 animate-pulse" />
                ))}
              </div>
              <div className="h-64 rounded-xl bg-white border border-[#172F43]/10 animate-pulse" />
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewTab overview={overview} token={adminToken} onRefresh={loadOverview} notify={notify} />
              )}
              {activeTab === 'appointments' && (
                <AppointmentsTab overview={overview} token={adminToken} onRefresh={loadOverview} notify={notify} />
              )}
              {activeTab === 'calendar' && (
                <CalendarTab overview={overview} token={adminToken} onRefresh={loadOverview} notify={notify} />
              )}
              {activeTab === 'doctors' && (
                <DoctorsTab overview={overview} token={adminToken} onRefresh={loadOverview} notify={notify} />
              )}
              {activeTab === 'departments' && (
                <DepartmentsTab overview={overview} token={adminToken} onRefresh={loadOverview} notify={notify} />
              )}
              {activeTab === 'services' && (
                <ServicesTab overview={overview} token={adminToken} onRefresh={loadOverview} notify={notify} />
              )}
              {activeTab === 'customers' && (
                <CustomersTab overview={overview} token={adminToken} onRefresh={loadOverview} notify={notify} />
              )}
              {activeTab === 'business_hours' && (
                <BusinessHoursTab overview={overview} token={adminToken} onRefresh={loadOverview} notify={notify} />
              )}
              {activeTab === 'doctor_availability' && (
                <DoctorAvailabilityTab overview={overview} token={adminToken} onRefresh={loadOverview} notify={notify} />
              )}
              {activeTab === 'blocked_dates' && (
                <BlockedDatesTab overview={overview} token={adminToken} onRefresh={loadOverview} notify={notify} />
              )}
              {activeTab === 'gallery' && (
                <GalleryAdminTab overview={overview} token={adminToken} onRefresh={loadOverview} notify={notify} />
              )}
              {activeTab === 'content' && (
                <WebsiteContentTab overview={overview} token={adminToken} onRefresh={loadOverview} notify={notify} />
              )}
              {activeTab === 'notifications' && (
                <NotificationsTab overview={overview} token={adminToken} onRefresh={loadOverview} notify={notify} />
              )}
              {activeTab === 'reviews' && (
                <ReviewsTab overview={overview} token={adminToken} onRefresh={loadOverview} notify={notify} />
              )}
              {activeTab === 'map_contact' && (
                <MapContactTab overview={overview} token={adminToken} onRefresh={loadOverview} notify={notify} />
              )}
              {activeTab === 'profile' && (
                <AdminProfileTab overview={overview} token={adminToken} onRefresh={loadOverview} notify={notify} />
              )}
              {activeTab === 'security' && (
                <SecurityTab overview={overview} token={adminToken} onRefresh={loadOverview} notify={notify} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
