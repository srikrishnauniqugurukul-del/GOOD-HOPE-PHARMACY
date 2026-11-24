import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Bell,
  Check,
  Database,
  Eye,
  EyeOff,
  ImagePlus,
  KeyRound,
  MapPin,
  Plus,
  Save,
  ShieldCheck,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import type { GalleryCategory, GalleryItem, ReviewItem, SectionVisibility, SiteSettings } from '../../types/domain';
import { adminFetch, uploadAdminImage } from '../../lib/api';
import { GoodHopeLogo } from '../../components/GoodHopeLogo';
import { useSite } from '../../hooks/useSiteContext';
import type { AdminTabProps } from '../types';

// ============================================================================
// 11. PHOTO GALLERY MANAGER (Upload, Caption, Reorder, Show/Hide, Permanent Delete)
// ============================================================================
export const GalleryAdminTab: React.FC<AdminTabProps> = ({
  overview,
  token,
  onRefresh,
  notify,
}) => {
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<GalleryCategory>('healthcare_environment');
  const [imageUrl, setImageUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadAdminImage(file, token);
      setImageUrl(res.imageUrl);
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''));
      notify('Photo uploaded to server! Click "Add to Gallery" to publish.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Upload failed.', true);
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) return notify('Please upload a photo or enter an image URL.', true);
    try {
      await adminFetch('/api/admin/gallery', token, {
        method: 'POST',
        body: JSON.stringify({ title, caption, category, imageUrl, isPublished }),
      });
      setTitle('');
      setCaption('');
      setImageUrl('');
      notify('Photo added to live website gallery!');
      await onRefresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to add photo.', true);
    }
  };

  const togglePublish = async (item: GalleryItem) => {
    await adminFetch(`/api/admin/gallery/${item.id}`, token, {
      method: 'PUT',
      body: JSON.stringify({ isPublished: !item.isPublished }),
    });
    notify(`"${item.title}" is now ${item.isPublished ? 'HIDDEN' : 'SHOWN'} on all browsers.`);
    await onRefresh();
  };

  const moveItem = async (idx: number, direction: -1 | 1) => {
    const sorted = [...overview.gallery].sort((a, b) => a.displayOrder - b.displayOrder);
    const target = idx + direction;
    if (target < 0 || target >= sorted.length) return;
    [sorted[idx], sorted[target]] = [sorted[target], sorted[idx]];
    await adminFetch('/api/admin/gallery/reorder', token, {
      method: 'POST',
      body: JSON.stringify({ orderedIds: sorted.map((g) => g.id) }),
    });
    notify('Gallery display order updated.');
    await onRefresh();
  };

  const deleteItem = async (item: GalleryItem) => {
    await adminFetch(`/api/admin/gallery/${item.id}`, token, { method: 'DELETE' });
    notify(`Permanently deleted "${item.title}" from server & website.`);
    await onRefresh();
  };

  const sortedGallery = [...overview.gallery].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="space-y-6">
      {/* Add Photo Card */}
      <form
        onSubmit={handleAdd}
        className="bg-white rounded-xl border border-[#172F43]/10 p-5 space-y-4 text-xs"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-sm text-[#172F43]">
              Upload / Add Gallery Photograph
            </h3>
            <p className="text-[#172F43]/65 mt-0.5">
              Uploaded photos are saved on the server and appear live across Chrome, mobile, and all visitors immediately.
            </p>
          </div>
          <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#172F43] text-white font-semibold cursor-pointer hover:bg-[#23435e]">
            <Upload className="w-3.5 h-3.5 text-[#B9D36A]" />
            <span>{uploading ? 'Uploading...' : 'Choose Photo File'}</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block font-semibold text-[#172F43] mb-1">Photo Title *</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Pharmacy Counter"
              className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#172F43] mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as GalleryCategory)}
              className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
            >
              <option value="pharmacy_exterior">Pharmacy Exterior</option>
              <option value="pharmacy_signboard">Pharmacy Signboard</option>
              <option value="good_hope_logo">Good Hope Logo</option>
              <option value="doctor_board">Doctor Availability Board</option>
              <option value="healthcare_environment">Healthcare Environment</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block font-semibold text-[#172F43] mb-1">Uploaded Path or Image URL *</label>
            <input
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Upload a file above or paste https://..."
              className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15 font-mono-tabular"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block font-semibold text-[#172F43] mb-1">Caption</label>
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Short description shown under the photo..."
              className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
            />
          </div>
          <div className="flex items-end justify-between gap-2">
            <label className="inline-flex items-center gap-1.5 font-semibold text-[#172F43] pb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              <span>Show Now</span>
            </label>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#37A879] hover:bg-[#28865E] text-white font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ImagePlus className="w-3.5 h-3.5" />
              <span>Add Photo</span>
            </button>
          </div>
        </div>
      </form>

      {/* Gallery Grid with Show/Hide, Reorder, Delete */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedGallery.map((item, idx) => (
          <div
            key={item.id}
            className={`bg-white rounded-xl border overflow-hidden flex flex-col justify-between ${
              item.isPublished ? 'border-[#172F43]/10' : 'border-dashed border-[#172F43]/30 opacity-75'
            }`}
          >
            <div>
              <div className="aspect-[4/3] bg-[#F5F7F8] overflow-hidden relative">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {!item.isPublished && (
                  <div className="absolute inset-0 bg-[#172F43]/60 flex items-center justify-center text-white text-xs font-bold">
                    HIDDEN FROM PUBLIC
                  </div>
                )}
              </div>
              <div className="p-3.5">
                <div className="font-display font-bold text-sm text-[#172F43]">{item.title}</div>
                <p className="text-xs text-[#172F43]/65 mt-0.5 line-clamp-2">{item.caption}</p>
              </div>
            </div>

            <div className="px-3.5 pb-3.5 pt-2 border-t border-[#172F43]/8 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => togglePublish(item)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                  item.isPublished
                    ? 'bg-[#F1F8F3] text-[#28865E] border-[#37A879]/30'
                    : 'bg-[#F5F7F8] text-[#172F43]/65 border-[#172F43]/15'
                }`}
              >
                {item.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{item.isPublished ? 'Shown' : 'Hidden'}</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveItem(idx, -1)}
                  disabled={idx === 0}
                  title="Move Up"
                  className="p-1.5 rounded-lg border border-[#172F43]/15 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(idx, 1)}
                  disabled={idx === sortedGallery.length - 1}
                  title="Move Down"
                  className="p-1.5 rounded-lg border border-[#172F43]/15 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteItem(item)}
                  title="Permanently Delete"
                  className="p-1.5 rounded-lg border border-red-200 text-[#D83B48] hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// 12. WEBSITE CONTENT & MASTER SHOW/HIDE VISIBILITY CONTROLS TAB
// ============================================================================
const VISIBILITY_CONTROLS: Array<{ key: keyof SectionVisibility; label: string; desc: string }> = [
  { key: 'showAnnouncementBar', label: 'Top Announcement Banner', desc: 'Show notice strip above header' },
  { key: 'showHeroSection', label: 'Hero Section', desc: 'Main headline & CTA banner' },
  { key: 'showHeroAnimation', label: 'Hero 4-Scene Animation', desc: 'Turn OFF for static low-motion view' },
  { key: 'showAboutSection', label: 'About Good Hope Section', desc: 'Pharmacy introduction section' },
  { key: 'showOwnerProfile', label: 'Owner Profile Card', desc: 'Display Sudarshan Karkee photo & bio' },
  { key: 'showWhyChooseSection', label: 'Why Choose Good Hope', desc: '5 patient care pillars grid' },
  { key: 'showServicesSection', label: 'Services Section', desc: 'Dynamic speciality categories' },
  { key: 'showDoctorsSection', label: 'Doctors Directory Section', desc: 'Visiting specialists cards' },
  { key: 'showBookingSection', label: 'Homepage Booking Section', desc: 'Interactive booking widget on home' },
  { key: 'allowPublicBooking', label: 'Allow Online Bookings', desc: 'Pause/resume booking submissions' },
  { key: 'showPharmacySection', label: 'In-Store Pharmacy Section', desc: 'Counter & in-store care overview' },
  { key: 'showGallerySection', label: 'Photo Gallery Section', desc: 'Published clinic & signboard photos' },
  { key: 'showReviewsSection', label: 'Verified Reviews Section', desc: 'Displays only when approved reviews exist' },
  { key: 'showContactSection', label: 'Contact & Location Section', desc: 'Homepage address & call card' },
];

export const WebsiteContentTab: React.FC<AdminTabProps> = ({
  overview,
  token,
  onRefresh,
  notify,
}) => {
  const [form, setForm] = useState<SiteSettings>(overview.settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(overview.settings);
  }, [overview.settings]);

  const toggleVis = async (key: keyof SectionVisibility) => {
    const nextVal = !form.visibility[key];
    const nextVis = { ...form.visibility, [key]: nextVal };
    setForm({ ...form, visibility: nextVis });
    try {
      await adminFetch('/api/admin/settings', token, {
        method: 'PUT',
        body: JSON.stringify({ visibility: { [key]: nextVal } }),
      });
      notify(`Updated "${key}" -> ${nextVal ? 'SHOWN' : 'HIDDEN'} live!`);
      await onRefresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Toggle failed.', true);
    }
  };

  const handleUploadAsset = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logoUrl' | 'ownerPhotoUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { imageUrl } = await uploadAdminImage(file, token);
      setForm((prev) => ({ ...prev, [field]: imageUrl }));
      notify('Image uploaded! Click Save Content to publish.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Upload failed.', true);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminFetch('/api/admin/settings', token, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      notify('Website content & logo saved live across all browsers!');
      await onRefresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Save failed.', true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Instant Show / Hide Control Matrix */}
      <div className="bg-white rounded-xl border border-[#172F43]/10 p-5 space-y-4">
        <div>
          <h3 className="font-display font-bold text-base text-[#172F43]">
            Live Show / Hide Section Controls (দেখাবেন কি না কন্ট্রোল করুন)
          </h3>
          <p className="text-xs text-[#172F43]/65 mt-0.5">
            Toggle any section ON or OFF instantly. Changes take effect immediately for all visitors on Chrome and mobile.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {VISIBILITY_CONTROLS.map((ctrl) => {
            const active = form.visibility[ctrl.key];
            return (
              <button
                key={ctrl.key}
                type="button"
                onClick={() => toggleVis(ctrl.key)}
                className={`p-3.5 rounded-xl border text-left flex items-start justify-between gap-3 transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#F1F8F3] border-[#37A879]/35'
                    : 'bg-[#F5F7F8] border-[#172F43]/12 opacity-75'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-[#172F43]">{ctrl.label}</div>
                  <div className="text-[11px] text-[#172F43]/65 mt-0.5">{ctrl.desc}</div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                    active ? 'bg-[#37A879] text-white' : 'bg-[#172F43]/20 text-[#172F43]'
                  }`}
                >
                  {active ? 'SHOWN' : 'HIDDEN'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content & Brand Logo Editor */}
      <form
        onSubmit={handleSave}
        className="bg-white rounded-xl border border-[#172F43]/10 p-5 space-y-5 text-xs"
      >
        <div className="flex items-center justify-between border-b border-[#172F43]/10 pb-3">
          <h3 className="font-display font-bold text-base text-[#172F43]">
            Brand Logo & Website Copy Editor
          </h3>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#37A879] text-white font-semibold cursor-pointer disabled:opacity-60"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Website Content'}</span>
          </button>
        </div>

        {/* Logo & Owner Photo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#F5F7F8] flex items-center gap-4">
            <GoodHopeLogo logoUrl={form.logoUrl} size={56} />
            <div className="space-y-1.5">
              <div className="font-semibold text-[#172F43]">Website Logo</div>
              <div className="flex flex-wrap gap-2">
                <label className="px-3 py-1.5 rounded-lg bg-white border border-[#172F43]/15 font-semibold cursor-pointer">
                  Upload Custom Logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadAsset(e, 'logoUrl')}
                    className="hidden"
                  />
                </label>
                {form.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, logoUrl: null })}
                    className="text-[#D83B48] font-semibold cursor-pointer"
                  >
                    Reset to Vector Logo
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F7F8] flex items-center gap-4">
            {form.ownerPhotoUrl && (
              <img
                src={form.ownerPhotoUrl}
                alt={form.ownerName}
                className="w-14 h-14 rounded-xl object-cover border border-[#37A879]/25"
              />
            )}
            <div className="space-y-1.5">
              <div className="font-semibold text-[#172F43]">Owner Photo ({form.ownerName})</div>
              <div className="flex flex-wrap gap-2">
                <label className="px-3 py-1.5 rounded-lg bg-white border border-[#172F43]/15 font-semibold cursor-pointer">
                  Replace Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadAsset(e, 'ownerPhotoUrl')}
                    className="hidden"
                  />
                </label>
                {form.ownerPhotoUrl && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, ownerPhotoUrl: '' })}
                    className="text-[#D83B48] font-semibold cursor-pointer"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block font-semibold text-[#172F43] mb-1">Top Announcement Text</label>
            <input
              value={form.announcementText}
              onChange={(e) => setForm({ ...form, announcementText: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#172F43] mb-1">Hero Headline</label>
            <input
              value={form.heroHeadline}
              onChange={(e) => setForm({ ...form, heroHeadline: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#172F43] mb-1">Hero Subheading</label>
            <input
              value={form.heroSubheading}
              onChange={(e) => setForm({ ...form, heroSubheading: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block font-semibold text-[#172F43] mb-1">Hero Supporting Text</label>
            <textarea
              rows={2}
              value={form.heroSupportingText}
              onChange={(e) => setForm({ ...form, heroSupportingText: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block font-semibold text-[#172F43] mb-1">About Section Headline</label>
            <input
              value={form.aboutHeadline}
              onChange={(e) => setForm({ ...form, aboutHeadline: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block font-semibold text-[#172F43] mb-1">About Description</label>
            <textarea
              rows={3}
              value={form.aboutDescription}
              onChange={(e) => setForm({ ...form, aboutDescription: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block font-semibold text-[#172F43] mb-1">Pharmacy Description</label>
            <textarea
              rows={3}
              value={form.pharmacyDescription}
              onChange={(e) => setForm({ ...form, pharmacyDescription: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

// ============================================================================
// 13. NOTIFICATIONS & CONTACT ENQUIRIES TAB
// ============================================================================
export const NotificationsTab: React.FC<AdminTabProps> = ({
  overview,
  token,
  onRefresh,
  notify,
}) => {
  const markAllRead = async () => {
    await adminFetch('/api/admin/notifications/read-all', token, { method: 'POST' });
    notify('All notifications marked as read.');
    await onRefresh();
  };

  const resolveEnquiry = async (id: string) => {
    await adminFetch(`/api/admin/enquiries/${id}`, token, {
      method: 'PATCH',
      body: JSON.stringify({ isResolved: true }),
    });
    notify('Enquiry marked resolved.');
    await onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#F1F8F3] border border-[#37A879]/25 rounded-xl p-4 text-xs text-[#172F43]/80 flex flex-wrap items-center justify-between gap-3">
        <div>
          <strong>External Delivery Channels:</strong> WhatsApp Business API (
          {overview.settings.whatsappIntegrationStatus === 'configured' ? 'Configured' : 'Not Configured'}) · Email SMTP (
          {overview.settings.emailIntegrationStatus === 'configured' ? 'Configured' : 'Not Configured'}). In-panel notifications are always live.
        </div>
        <button
          type="button"
          onClick={markAllRead}
          className="px-3 py-1.5 rounded-lg bg-[#172F43] text-white font-semibold cursor-pointer"
        >
          Mark All Read
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#172F43]/10 p-5 space-y-3">
          <div className="flex items-center gap-2 font-display font-bold text-sm text-[#172F43]">
            <Bell className="w-4 h-4 text-[#37A879]" />
            <span>System & Booking Alerts ({overview.notifications.length})</span>
          </div>
          {overview.notifications.length === 0 ? (
            <p className="text-xs text-[#172F43]/60 py-6 text-center">No notifications yet.</p>
          ) : (
            <div className="divide-y divide-[#172F43]/8">
              {overview.notifications.map((n) => (
                <div key={n.id} className="py-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-semibold ${n.isRead ? 'text-[#172F43]/75' : 'text-[#172F43]'}`}>
                      {n.title}
                    </span>
                    <span className="font-mono-tabular text-[10px] text-[#172F43]/50">
                      {n.createdAt.slice(0, 10)}
                    </span>
                  </div>
                  <p className="text-[#172F43]/70 mt-0.5">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-[#172F43]/10 p-5 space-y-3">
          <h4 className="font-display font-bold text-sm text-[#172F43]">
            Contact Form Enquiries ({overview.contactEnquiries.length})
          </h4>
          {overview.contactEnquiries.length === 0 ? (
            <p className="text-xs text-[#172F43]/60 py-6 text-center">No contact enquiries submitted yet.</p>
          ) : (
            <div className="divide-y divide-[#172F43]/8">
              {overview.contactEnquiries.map((e) => (
                <div key={e.id} className="py-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#172F43]">
                      {e.fullName} · <span className="font-mono-tabular">{e.mobile}</span>
                    </span>
                    {!e.isResolved ? (
                      <button
                        type="button"
                        onClick={() => resolveEnquiry(e.id)}
                        className="text-[11px] font-semibold text-[#37A879] hover:underline cursor-pointer"
                      >
                        Mark Resolved
                      </button>
                    ) : (
                      <span className="text-[10px] font-semibold text-[#172F43]/50">Resolved</span>
                    )}
                  </div>
                  <div className="font-medium text-[#172F43]/85">{e.subject}</div>
                  <p className="text-[#172F43]/70">{e.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 14. VERIFIED REVIEWS MANAGEMENT TAB
// ============================================================================
export const ReviewsTab: React.FC<AdminTabProps> = ({ overview, token, onRefresh, notify }) => {
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [sourceLabel, setSourceLabel] = useState('Verified Visitor');
  const [googleReviewUrl, setGoogleReviewUrl] = useState(overview.settings.googleReviewUrl || '');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminFetch('/api/admin/reviews', token, {
        method: 'POST',
        body: JSON.stringify({
          customerName,
          rating,
          comment,
          sourceLabel,
          isApproved: true,
          isVisible: true,
        }),
      });
      setCustomerName('');
      setComment('');
      notify('Verified customer review added.');
      await onRefresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Add failed.', true);
    }
  };

  const toggleReview = async (rev: ReviewItem) => {
    await adminFetch(`/api/admin/reviews/${rev.id}`, token, {
      method: 'PUT',
      body: JSON.stringify({ isVisible: !rev.isVisible, isApproved: !rev.isVisible }),
    });
    notify(`Review ${rev.isVisible ? 'hidden' : 'published'}.`);
    await onRefresh();
  };

  const deleteReview = async (id: string) => {
    await adminFetch(`/api/admin/reviews/${id}`, token, { method: 'DELETE' });
    notify('Review deleted.');
    await onRefresh();
  };

  const saveReviewLink = async () => {
    await adminFetch('/api/admin/settings', token, {
      method: 'PUT',
      body: JSON.stringify({ googleReviewUrl }),
    });
    notify('Google Review link saved.');
    await onRefresh();
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="bg-white rounded-xl border border-[#172F43]/10 p-5 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[240px]">
          <label className="block font-semibold text-[#172F43] mb-1">
            Verified Google Review Link (Optional)
          </label>
          <input
            value={googleReviewUrl}
            onChange={(e) => setGoogleReviewUrl(e.target.value)}
            placeholder="https://g.page/r/..."
            className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
          />
        </div>
        <button
          type="button"
          onClick={saveReviewLink}
          className="px-4 py-2 rounded-lg bg-[#172F43] text-white font-semibold cursor-pointer"
        >
          Save Link
        </button>
      </div>

      <form
        onSubmit={handleAdd}
        className="bg-white rounded-xl border border-[#172F43]/10 p-5 space-y-3"
      >
        <div className="font-display font-bold text-sm text-[#172F43]">
          Add Genuine Customer Feedback (Never add fabricated reviews)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Customer full name"
            className="px-3 py-2 rounded-lg border border-[#172F43]/15"
          />
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="px-3 py-2 rounded-lg border border-[#172F43]/15"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{n} Stars</option>
            ))}
          </select>
          <input
            value={sourceLabel}
            onChange={(e) => setSourceLabel(e.target.value)}
            placeholder="Source (e.g. Verified Patient)"
            className="px-3 py-2 rounded-lg border border-[#172F43]/15"
          />
        </div>
        <textarea
          required
          rows={2}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Verified customer feedback text..."
          className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-[#37A879] text-white font-semibold inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Save & Publish Verified Review</span>
        </button>
      </form>

      <div className="bg-white rounded-xl border border-[#172F43]/10 divide-y divide-[#172F43]/8">
        {overview.reviews.length === 0 ? (
          <div className="p-8 text-center text-[#172F43]/60">
            No reviews added yet. The public Reviews section stays automatically hidden until verified reviews are approved.
          </div>
        ) : (
          overview.reviews.map((rev) => (
            <div key={rev.id} className="p-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#172F43]">{rev.customerName}</span>
                  <span className="inline-flex items-center text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                    {rev.rating}
                  </span>
                </div>
                <p className="text-[#172F43]/75 mt-1">{rev.comment}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleReview(rev)}
                  className="px-2.5 py-1.5 rounded-lg border border-[#172F43]/15 font-semibold cursor-pointer"
                >
                  {rev.isVisible ? 'Hide' : 'Show'}
                </button>
                <button
                  type="button"
                  onClick={() => deleteReview(rev.id)}
                  className="p-1.5 rounded-lg border border-red-200 text-[#D83B48] cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 15. MAP & CONTACT SETTINGS TAB
// ============================================================================
export const MapContactTab: React.FC<AdminTabProps> = ({ overview, token, onRefresh, notify }) => {
  const [form, setForm] = useState<SiteSettings>(overview.settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(overview.settings);
  }, [overview.settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminFetch('/api/admin/settings', token, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      notify('Map, address, contact & social settings saved.');
      await onRefresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Save failed.', true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSave}
      className="bg-white rounded-xl border border-[#172F43]/10 p-6 space-y-5 text-xs"
    >
      <div className="flex items-center justify-between border-b border-[#172F43]/10 pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#37A879]" />
          <h3 className="font-display font-bold text-base text-[#172F43]">
            Contact, Address, Google Maps & Facebook Settings
          </h3>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-[#37A879] text-white font-semibold inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-[#172F43] mb-1">Business Name</label>
          <input
            value={form.businessName}
            onChange={(e) => setForm({ ...form, businessName: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
          />
        </div>
        <div>
          <label className="block font-semibold text-[#172F43] mb-1">Owner Name</label>
          <input
            value={form.ownerName}
            onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
          />
        </div>
        <div>
          <label className="block font-semibold text-[#172F43] mb-1">Primary Telephone</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15 font-mono-tabular"
          />
        </div>
        <div>
          <label className="block font-semibold text-[#172F43] mb-1">Public Email (Optional)</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Leave blank if not published"
            className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
          />
        </div>
        <div>
          <label className="block font-semibold text-[#172F43] mb-1">Primary Plus Code Address</label>
          <input
            value={form.plusCodeAddress}
            onChange={(e) => setForm({ ...form, plusCodeAddress: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
          />
        </div>
        <div>
          <label className="block font-semibold text-[#172F43] mb-1">Additional Street Reference</label>
          <input
            value={form.streetAddress}
            onChange={(e) => setForm({ ...form, streetAddress: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
          />
        </div>
        <div className="md:col-span-2 p-4 rounded-xl bg-[#F5F7F8] space-y-3">
          <div>
            <label className="block font-semibold text-[#172F43] mb-1">
              Verified Good Hope Pharmacy Google Maps URL
            </label>
            <input
              value={form.googleMapsUrl}
              onChange={(e) => setForm({ ...form, googleMapsUrl: e.target.value })}
              placeholder="Paste verified Good Hope Pharmacy pin link here"
              className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15 bg-white"
            />
          </div>
          <label className="inline-flex items-center gap-2 font-semibold text-[#172F43] cursor-pointer">
            <input
              type="checkbox"
              checked={form.isMapPinVerified}
              onChange={(e) => setForm({ ...form, isMapPinVerified: e.target.checked })}
            />
            <span>Owner has verified this Good Hope Pharmacy Google Maps pin</span>
          </label>
        </div>

        <div className="md:col-span-2 p-4 rounded-xl bg-[#F5F7F8] space-y-3">
          <div>
            <label className="block font-semibold text-[#172F43] mb-1">Facebook Profile URL</label>
            <input
              value={form.facebookUrl}
              onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15 bg-white"
            />
          </div>
          <label className="inline-flex items-center gap-2 font-semibold text-[#172F43] cursor-pointer">
            <input
              type="checkbox"
              checked={form.visibility.showFacebookLink}
              onChange={(e) =>
                setForm({
                  ...form,
                  visibility: { ...form.visibility, showFacebookLink: e.target.checked },
                })
              }
            />
            <span>Owner Approved: Display Facebook link publicly on website</span>
          </label>
        </div>
      </div>
    </form>
  );
};

// ============================================================================
// 16. ADMIN PROFILE TAB
// ============================================================================
export const AdminProfileTab: React.FC<AdminTabProps> = ({
  overview,
  token,
  onRefresh,
  notify,
}) => {
  const [fullName, setFullName] = useState(overview.adminProfile.fullName);
  const [role, setRole] = useState(overview.adminProfile.role);
  const [phone, setPhone] = useState(overview.adminProfile.phone);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminFetch('/api/admin/profile', token, {
      method: 'PUT',
      body: JSON.stringify({ fullName, role, phone }),
    });
    notify('Admin profile updated.');
    await onRefresh();
  };

  return (
    <form
      onSubmit={handleSave}
      className="bg-white rounded-xl border border-[#172F43]/10 p-6 max-w-xl space-y-4 text-xs"
    >
      <h3 className="font-display font-bold text-base text-[#172F43]">Administrator Profile</h3>
      <div>
        <label className="block font-semibold text-[#172F43] mb-1">Full Name</label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
        />
      </div>
      <div>
        <label className="block font-semibold text-[#172F43] mb-1">User ID (Username)</label>
        <input
          disabled
          value={overview.adminProfile.username || 'Not set'}
          className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15 bg-[#F5F7F8] font-mono-tabular"
        />
      </div>
      <div>
        <label className="block font-semibold text-[#172F43] mb-1">Admin Email ID</label>
        <input
          disabled
          value={overview.adminProfile.email || 'Not set'}
          className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15 bg-[#F5F7F8]"
        />
        <p className="mt-1 text-[11px] text-[#172F43]/60">
          To change your User ID, Email ID, or Password, open the Security & Audit Logs tab.
        </p>
      </div>
      <div>
        <label className="block font-semibold text-[#172F43] mb-1">Role</label>
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
        />
      </div>
      <div>
        <label className="block font-semibold text-[#172F43] mb-1">Contact Phone</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15 font-mono-tabular"
        />
      </div>
      <button
        type="submit"
        className="px-5 py-2.5 rounded-xl bg-[#37A879] text-white font-semibold cursor-pointer"
      >
        Save Profile
      </button>
    </form>
  );
};

// ============================================================================
// 17. SECURITY SETTINGS & AUDIT LOGS TAB
// ============================================================================
export const SecurityTab: React.FC<AdminTabProps> = ({ overview, token, onRefresh, notify }) => {
  const { setAdminSession } = useSite();
  const [newUsername, setNewUsername] = useState(overview.adminProfile.username || '');
  const [newEmail, setNewEmail] = useState(overview.adminProfile.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNewUsername(overview.adminProfile.username || '');
    setNewEmail(overview.adminProfile.email || '');
  }, [overview.adminProfile.username, overview.adminProfile.email]);

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminFetch<{ ok: boolean; token: string; profile: typeof overview.adminProfile }>(
        '/api/admin/auth/update-credentials',
        token,
        {
          method: 'POST',
          body: JSON.stringify({
            currentPassword,
            newUsername: newUsername.trim(),
            newEmail: newEmail.trim(),
            newPassword: newPassword || '',
          }),
        }
      );
      setAdminSession(res.token, res.profile);
      setCurrentPassword('');
      setNewPassword('');
      notify('Admin User ID, Email & Password updated and synced across sessions.');
      await onRefresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Credential update failed.', true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#172F43]/10 p-5 space-y-3">
          <div className="flex items-center gap-2 font-display font-bold text-sm text-[#172F43]">
            <Database className="w-4 h-4 text-[#37A879]" />
            <span>Database & Cross-Site Login Sync</span>
          </div>
          <p className="text-[#172F43]/75 leading-relaxed">
            Active Storage:{' '}
            <strong className="text-[#172F43]">
              {overview.storageBackend === 'supabase'
                ? 'Supabase PostgreSQL (Live Cross-Site Sync Active)'
                : 'Server Persistent Store (Set SUPABASE_URL & SUPABASE_SECRET_KEY in Secrets to sync AI Studio + Shared/Live Website automatically)'}
            </strong>
          </p>
          <ul className="space-y-1.5 text-[#172F43]/70">
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#37A879]" />
              <span>Login supports both User ID and Email ID with salted scrypt password hashing</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#37A879]" />
              <span>Updating credentials here updates the shared server/Supabase store immediately</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#37A879]" />
              <span>Private customer records excluded from public APIs</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#37A879]" />
              <span>Atomic server-side double-booking prevention active</span>
            </li>
          </ul>
        </div>

        <form
          onSubmit={handleUpdateCredentials}
          className="bg-white rounded-xl border border-[#172F43]/10 p-5 space-y-3"
        >
          <div className="flex items-center gap-2 font-display font-bold text-sm text-[#172F43]">
            <KeyRound className="w-4 h-4 text-[#37A879]" />
            <span>Change User ID, Email ID & Password</span>
          </div>
          <div>
            <label className="block font-semibold text-[#172F43] mb-1">Admin User ID (Username)</label>
            <input
              type="text"
              required
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="e.g. sudarshan_admin"
              className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15 font-mono-tabular"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#172F43] mb-1">Admin Email ID</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="yourname@gmail.com"
              className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#172F43] mb-1">
              Current Password (required to confirm changes)
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#172F43] mb-1">
              New Password (optional — leave blank to keep current)
            </label>
            <input
              type="password"
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 8 characters"
              className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-[#172F43] hover:bg-[#1e3d57] text-white font-semibold cursor-pointer disabled:opacity-60"
          >
            {saving ? 'Updating...' : 'Save Updated Login Credentials'}
          </button>
        </form>
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-xl border border-[#172F43]/10 p-5 space-y-3">
        <div className="flex items-center gap-2 font-display font-bold text-sm text-[#172F43]">
          <ShieldCheck className="w-4 h-4 text-[#37A879]" />
          <span>Recent Admin Audit Logs</span>
        </div>
        <div className="divide-y divide-[#172F43]/8 max-h-80 overflow-y-auto">
          {overview.auditLogs.map((log) => (
            <div key={log.id} className="py-2.5 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-mono-tabular font-bold text-[#37A879] mr-2">{log.action}</span>
                <span className="text-[#172F43]">{log.summary}</span>
              </div>
              <div className="font-mono-tabular text-[11px] text-[#172F43]/55">
                {log.actor} · {log.createdAt.slice(0, 16).replace('T', ' ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
