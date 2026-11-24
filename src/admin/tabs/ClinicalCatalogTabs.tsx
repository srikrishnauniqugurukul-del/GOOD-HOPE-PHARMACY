import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type { Customer, Department, Doctor, ServiceItem } from '../../types/domain';
import { adminFetch, uploadAdminImage } from '../../lib/api';
import { DoctorAvatar } from '../../components/DoctorAvatar';
import type { AdminTabProps } from '../types';

// ============================================================================
// 4. DOCTORS DIRECTORY MANAGEMENT (Add, Edit, Photo Upload, Show/Hide, Verify, Delete)
// ============================================================================
export const DoctorsTab: React.FC<AdminTabProps> = ({ overview, token, onRefresh, notify }) => {
  const [editing, setEditing] = useState<Partial<Doctor> | null>(null);
  const [uploading, setUploading] = useState(false);

  const openNew = () => {
    setEditing({
      name: '',
      departmentId: overview.departments[0]?.id || '',
      speciality: '',
      qualifications: '',
      boardDescription: '',
      registrationNumber: '',
      affiliation: '',
      bio: '',
      photoUrl: null,
      verificationStatus: 'draft_unverified',
      isVisible: true,
      isActive: true,
      consultationFeeNote: 'Confirm at counter',
    });
  };

  const handlePhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    try {
      const { imageUrl } = await uploadAdminImage(file, token);
      setEditing({ ...editing, photoUrl: imageUrl });
      notify('Doctor photo uploaded successfully.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Upload failed.', true);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      if (editing.id) {
        await adminFetch(`/api/admin/doctors/${editing.id}`, token, {
          method: 'PUT',
          body: JSON.stringify(editing),
        });
        notify(`Updated ${editing.name}.`);
      } else {
        await adminFetch('/api/admin/doctors', token, {
          method: 'POST',
          body: JSON.stringify(editing),
        });
        notify(`Added ${editing.name}.`);
      }
      setEditing(null);
      await onRefresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to save doctor.', true);
    }
  };

  const toggleField = async (doc: Doctor, patch: Partial<Doctor>, label: string) => {
    try {
      await adminFetch(`/api/admin/doctors/${doc.id}`, token, {
        method: 'PUT',
        body: JSON.stringify(patch),
      });
      notify(`${doc.name}: ${label}`);
      await onRefresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Action failed.', true);
    }
  };

  const handleDelete = async (doc: Doctor) => {
    try {
      await adminFetch(`/api/admin/doctors/${doc.id}`, token, { method: 'DELETE' });
      notify(`Removed ${doc.name}.`);
      await onRefresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Delete failed.', true);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display font-bold text-base text-[#172F43]">
            Doctors Directory ({overview.doctors.length} records)
          </h3>
          <p className="text-xs text-[#172F43]/65">
            Verify credentials, upload real photographs, edit details, or Show/Hide any doctor on the live website.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#37A879] hover:bg-[#28865E] text-white text-xs font-semibold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Doctor</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {overview.doctors.map((doc) => (
          <div
            key={doc.id}
            className={`bg-white rounded-xl border p-4 flex flex-col justify-between gap-4 ${
              doc.isVisible ? 'border-[#172F43]/10' : 'border-dashed border-[#172F43]/25 opacity-75'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <DoctorAvatar name={doc.name} photoUrl={doc.photoUrl} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-display font-bold text-sm text-[#172F43] truncate">
                    {doc.name}
                  </h4>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      doc.verificationStatus === 'verified'
                        ? 'bg-[#F1F8F3] text-[#28865E]'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {doc.verificationStatus === 'verified' ? 'Verified' : 'Draft / Unverified'}
                  </span>
                </div>
                <div className="text-xs text-[#37A879] font-medium">{doc.speciality}</div>
                {doc.qualifications && (
                  <p className="text-[11px] text-[#172F43]/75 mt-1">{doc.qualifications}</p>
                )}
                {doc.registrationNumber && (
                  <p className="text-[11px] font-mono-tabular text-[#172F43]/60">
                    Reg: {doc.registrationNumber}
                  </p>
                )}
                {doc.verificationNote && doc.verificationStatus !== 'verified' && (
                  <p className="text-[11px] text-amber-700 mt-1">{doc.verificationNote}</p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#172F43]/8 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    toggleField(
                      doc,
                      { isVisible: !doc.isVisible },
                      doc.isVisible ? 'Hidden from public website' : 'Visible on public website'
                    )
                  }
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border cursor-pointer ${
                    doc.isVisible
                      ? 'bg-[#F1F8F3] text-[#28865E] border-[#37A879]/30'
                      : 'bg-[#F5F7F8] text-[#172F43]/65 border-[#172F43]/15'
                  }`}
                >
                  {doc.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{doc.isVisible ? 'Shown' : 'Hidden'}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    toggleField(
                      doc,
                      {
                        verificationStatus:
                          doc.verificationStatus === 'verified' ? 'draft_unverified' : 'verified',
                      },
                      doc.verificationStatus === 'verified' ? 'Marked Unverified' : 'Marked Verified'
                    )
                  }
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-[#172F43]/15 text-[#172F43] hover:bg-[#F5F7F8] cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#37A879]" />
                  <span>{doc.verificationStatus === 'verified' ? 'Unverify' : 'Verify'}</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setEditing(doc)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-[#172F43] text-white cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(doc)}
                  title="Delete Doctor"
                  className="p-1.5 rounded-lg border border-red-200 text-[#D83B48] hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Doctor Modal */}
      {editing && (
        <div
          className="fixed inset-0 z-50 bg-[#172F43]/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setEditing(null)}
        >
          <form
            onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-[#172F43]/10 pb-3">
              <h4 className="font-display font-bold text-base text-[#172F43]">
                {editing.id ? `Edit ${editing.name}` : 'Add New Doctor'}
              </h4>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="p-1.5 rounded-lg hover:bg-[#F5F7F8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-xl bg-[#F5F7F8]">
              <DoctorAvatar name={editing.name || 'DR'} photoUrl={editing.photoUrl || null} size="sm" />
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#172F43]/15 text-xs font-semibold text-[#172F43] cursor-pointer hover:bg-[#F1F8F3]">
                  <Upload className="w-3.5 h-3.5 text-[#37A879]" />
                  <span>{uploading ? 'Uploading...' : 'Upload Doctor Photo'}</span>
                  <input type="file" accept="image/*" onChange={handlePhotoFile} className="hidden" />
                </label>
                {editing.photoUrl && (
                  <button
                    type="button"
                    onClick={() => setEditing({ ...editing, photoUrl: null })}
                    className="text-xs font-semibold text-[#D83B48] hover:underline cursor-pointer"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#172F43] mb-1">Doctor Name *</label>
                <input
                  required
                  value={editing.name || ''}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#172F43] mb-1">Department *</label>
                <select
                  required
                  value={editing.departmentId || ''}
                  onChange={(e) => setEditing({ ...editing, departmentId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
                >
                  {overview.departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-[#172F43] mb-1">Speciality *</label>
                <input
                  required
                  value={editing.speciality || ''}
                  onChange={(e) => setEditing({ ...editing, speciality: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#172F43] mb-1">Registration Number</label>
                <input
                  value={editing.registrationNumber || ''}
                  onChange={(e) => setEditing({ ...editing, registrationNumber: e.target.value })}
                  placeholder="e.g. WBMC-68227"
                  className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15 font-mono-tabular"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#172F43] mb-1">Qualifications</label>
                <input
                  value={editing.qualifications || ''}
                  onChange={(e) => setEditing({ ...editing, qualifications: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#172F43] mb-1">Affiliation</label>
                <input
                  value={editing.affiliation || ''}
                  onChange={(e) => setEditing({ ...editing, affiliation: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#172F43] mb-1">Board Description</label>
                <textarea
                  rows={2}
                  value={editing.boardDescription || ''}
                  onChange={(e) => setEditing({ ...editing, boardDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#172F43] mb-1">Short Biography</label>
                <textarea
                  rows={2}
                  value={editing.bio || ''}
                  onChange={(e) => setEditing({ ...editing, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#172F43] mb-1">Verification Status</label>
                <select
                  value={editing.verificationStatus || 'draft_unverified'}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      verificationStatus: e.target.value as 'draft_unverified' | 'verified',
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
                >
                  <option value="draft_unverified">Draft / Pending Verification</option>
                  <option value="verified">Verified</option>
                </select>
              </div>
              <div className="flex items-center gap-4 pt-5">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editing.isVisible)}
                    onChange={(e) => setEditing({ ...editing, isVisible: e.target.checked })}
                  />
                  <span className="font-semibold text-[#172F43]">Show on Website</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#172F43]/10">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-lg border border-[#172F43]/15 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#37A879] text-white text-xs font-semibold cursor-pointer"
              >
                Save Doctor
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 5. DEPARTMENTS MANAGEMENT
// ============================================================================
export const DepartmentsTab: React.FC<AdminTabProps> = ({ overview, token, onRefresh, notify }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminFetch('/api/admin/departments', token, {
        method: 'POST',
        body: JSON.stringify({ name, description, isActive: true }),
      });
      setName('');
      setDescription('');
      notify('Department added.');
      await onRefresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Add failed.', true);
    }
  };

  const toggleDept = async (dept: Department) => {
    await adminFetch(`/api/admin/departments/${dept.id}`, token, {
      method: 'PUT',
      body: JSON.stringify({ isActive: !dept.isActive }),
    });
    notify(`${dept.name} ${dept.isActive ? 'hidden' : 'activated'}.`);
    await onRefresh();
  };

  const deleteDept = async (dept: Department) => {
    await adminFetch(`/api/admin/departments/${dept.id}`, token, { method: 'DELETE' });
    notify(`Deleted ${dept.name}.`);
    await onRefresh();
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleAdd}
        className="bg-white rounded-xl border border-[#172F43]/10 p-5 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
      >
        <div className="sm:col-span-4">
          <label className="block text-xs font-semibold text-[#172F43] mb-1">New Department Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Orthopedics"
            className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15 text-xs"
          />
        </div>
        <div className="sm:col-span-6">
          <label className="block text-xs font-semibold text-[#172F43] mb-1">Short Description</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Consultation overview..."
            className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15 text-xs"
          />
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="w-full py-2 px-3 rounded-lg bg-[#37A879] text-white text-xs font-semibold cursor-pointer"
          >
            Add
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-[#172F43]/10 divide-y divide-[#172F43]/8">
        {overview.departments.map((dept) => (
          <div key={dept.id} className="p-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-display font-bold text-sm text-[#172F43]">{dept.name}</div>
              <div className="text-xs text-[#172F43]/65 mt-0.5">{dept.description}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => toggleDept(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                  dept.isActive
                    ? 'bg-[#F1F8F3] text-[#28865E] border-[#37A879]/30'
                    : 'bg-[#F5F7F8] text-[#172F43]/60 border-[#172F43]/15'
                }`}
              >
                {dept.isActive ? 'Shown' : 'Hidden'}
              </button>
              <button
                type="button"
                onClick={() => deleteDept(dept)}
                className="p-1.5 rounded-lg border border-red-200 text-[#D83B48] hover:bg-red-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// 6. SERVICES MANAGEMENT (All 11 services + Add/Edit/Fees/Show-Hide/Delete)
// ============================================================================
export const ServicesTab: React.FC<AdminTabProps> = ({ overview, token, onRefresh, notify }) => {
  const [editing, setEditing] = useState<Partial<ServiceItem> | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const dept = overview.departments.find((d) => d.id === editing.departmentId);
    const payload = {
      ...editing,
      category: editing.category || dept?.name || 'Consultation',
      durationMinutes: Number(editing.durationMinutes) || 20,
      consultationFee:
        editing.consultationFee === null || editing.consultationFee === undefined || String(editing.consultationFee) === ''
          ? null
          : Number(editing.consultationFee),
    };
    try {
      if (editing.id) {
        await adminFetch(`/api/admin/services/${editing.id}`, token, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        notify(`Service "${editing.name}" updated.`);
      } else {
        await adminFetch('/api/admin/services', token, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        notify(`Service "${editing.name}" created.`);
      }
      setEditing(null);
      await onRefresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Service save failed.', true);
    }
  };

  const toggleVisible = async (srv: ServiceItem) => {
    await adminFetch(`/api/admin/services/${srv.id}`, token, {
      method: 'PUT',
      body: JSON.stringify({ isVisible: !srv.isVisible }),
    });
    notify(`${srv.name}: ${srv.isVisible ? 'Hidden' : 'Shown'}`);
    await onRefresh();
  };

  const removeService = async (srv: ServiceItem) => {
    await adminFetch(`/api/admin/services/${srv.id}`, token, { method: 'DELETE' });
    notify(`Deleted service "${srv.name}".`);
    await onRefresh();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-base text-[#172F43]">
            Services ({overview.services.length} categories)
          </h3>
          <p className="text-xs text-[#172F43]/65">
            Configure consultation durations, fees, associated doctors, and public visibility.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setEditing({
              name: '',
              departmentId: overview.departments[0]?.id || '',
              category: overview.departments[0]?.name || '',
              description: '',
              doctorId: null,
              durationMinutes: 20,
              consultationFee: null,
              feeLabel: 'Confirm at pharmacy desk',
              isActive: true,
              isVisible: true,
            })
          }
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#37A879] text-white text-xs font-semibold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#172F43]/10 divide-y divide-[#172F43]/8">
        {overview.services.map((srv) => (
          <div key={srv.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold text-[#37A879]">{srv.category}</div>
              <div className="font-display font-bold text-sm text-[#172F43]">{srv.name}</div>
              <div className="text-xs text-[#172F43]/65 mt-0.5">
                {srv.durationMinutes} min ·{' '}
                {srv.consultationFee !== null && srv.consultationFee > 0
                  ? `₹${srv.consultationFee}`
                  : srv.feeLabel}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => toggleVisible(srv)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                  srv.isVisible
                    ? 'bg-[#F1F8F3] text-[#28865E] border-[#37A879]/30'
                    : 'bg-[#F5F7F8] text-[#172F43]/60 border-[#172F43]/15'
                }`}
              >
                {srv.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{srv.isVisible ? 'Shown' : 'Hidden'}</span>
              </button>
              <button
                type="button"
                onClick={() => setEditing(srv)}
                className="px-3 py-1.5 rounded-lg bg-[#172F43] text-white text-xs font-semibold cursor-pointer"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => removeService(srv)}
                className="p-1.5 rounded-lg border border-red-200 text-[#D83B48] hover:bg-red-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 bg-[#172F43]/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setEditing(null)}
        >
          <form
            onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 text-xs shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-[#172F43]/10 pb-3">
              <h4 className="font-display font-bold text-base text-[#172F43]">
                {editing.id ? 'Edit Service' : 'Add Service'}
              </h4>
              <button type="button" onClick={() => setEditing(null)} className="cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-[#172F43] mb-1">Service Name *</label>
                <input
                  required
                  value={editing.name || ''}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#172F43] mb-1">Department</label>
                  <select
                    value={editing.departmentId || ''}
                    onChange={(e) => setEditing({ ...editing, departmentId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
                  >
                    {overview.departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#172F43] mb-1">Associated Doctor</label>
                  <select
                    value={editing.doctorId || ''}
                    onChange={(e) => setEditing({ ...editing, doctorId: e.target.value || null })}
                    className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
                  >
                    <option value="">Any / Counter</option>
                    {overview.doctors.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#172F43] mb-1">Duration (min)</label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={editing.durationMinutes ?? 20}
                    onChange={(e) => setEditing({ ...editing, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15 font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#172F43] mb-1">Fee (₹ optional)</label>
                  <input
                    type="number"
                    min={0}
                    value={editing.consultationFee ?? ''}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        consultationFee: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                    placeholder="Blank = counter"
                    className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15 font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#172F43] mb-1">Fee Label</label>
                  <input
                    value={editing.feeLabel || ''}
                    onChange={(e) => setEditing({ ...editing, feeLabel: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-[#172F43] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editing.description || ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-lg border border-[#172F43]/15 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#37A879] text-white font-semibold cursor-pointer"
              >
                Save Service
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 7. PRIVATE CUSTOMERS MANAGEMENT
// ============================================================================
export const CustomersTab: React.FC<AdminTabProps> = ({ overview, token, onRefresh, notify }) => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return overview.customers;
    const q = query.toLowerCase();
    return overview.customers.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.mobile.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [overview.customers, query]);

  const history = selected
    ? overview.appointments.filter((a) => a.customerId === selected.id)
    : [];

  const saveNotes = async () => {
    if (!selected) return;
    await adminFetch(`/api/admin/customers/${selected.id}`, token, {
      method: 'PUT',
      body: JSON.stringify({ notes: notesDraft }),
    });
    notify('Customer notes saved.');
    await onRefresh();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-[#172F43]/40 absolute left-3 top-2.5" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search private customer registry by name or mobile..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#172F43]/15 text-xs"
          />
        </div>

        <div className="bg-white rounded-xl border border-[#172F43]/10 divide-y divide-[#172F43]/8">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#172F43]/60">
              No customer records yet. Customers are created automatically when appointments are booked.
            </div>
          ) : (
            filtered.map((cust) => {
              const count = overview.appointments.filter((a) => a.customerId === cust.id).length;
              return (
                <button
                  key={cust.id}
                  type="button"
                  onClick={() => {
                    setSelected(cust);
                    setNotesDraft(cust.notes || '');
                  }}
                  className={`w-full text-left p-4 flex items-center justify-between hover:bg-[#F5F7F8] cursor-pointer ${
                    selected?.id === cust.id ? 'bg-[#F1F8F3]' : ''
                  }`}
                >
                  <div>
                    <div className="font-semibold text-sm text-[#172F43]">{cust.fullName}</div>
                    <div className="font-mono-tabular text-xs text-[#172F43]/65">{cust.mobile}</div>
                  </div>
                  <div className="text-xs font-mono-tabular text-[#37A879] font-semibold">
                    {count} booking{count === 1 ? '' : 's'}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="lg:col-span-5 bg-white rounded-xl border border-[#172F43]/10 p-5 space-y-4 h-fit">
        {!selected ? (
          <p className="text-xs text-[#172F43]/60 py-10 text-center">
            Select a customer to view private appointment history (upcoming, completed, cancelled).
          </p>
        ) : (
          <>
            <div className="border-b border-[#172F43]/10 pb-3">
              <h4 className="font-display font-bold text-base text-[#172F43]">{selected.fullName}</h4>
              <p className="font-mono-tabular text-xs text-[#37A879]">{selected.mobile}</p>
              {selected.email && <p className="text-xs text-[#172F43]/65">{selected.email}</p>}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-[#F5F7F8]">
                <div className="font-mono-tabular font-bold text-[#37A879]">
                  {history.filter((h) => h.status === 'pending' || h.status === 'confirmed').length}
                </div>
                <div className="text-[10px] text-[#172F43]/60">Upcoming</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#F5F7F8]">
                <div className="font-mono-tabular font-bold text-[#172F43]">
                  {history.filter((h) => h.status === 'completed').length}
                </div>
                <div className="text-[10px] text-[#172F43]/60">Completed</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#F5F7F8]">
                <div className="font-mono-tabular font-bold text-[#D83B48]">
                  {history.filter((h) => h.status === 'cancelled').length}
                </div>
                <div className="text-[10px] text-[#172F43]/60">Cancelled</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#172F43]">Private Desk Notes</label>
              <textarea
                rows={2}
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#172F43]/15 text-xs"
              />
              <button
                type="button"
                onClick={saveNotes}
                className="px-3.5 py-1.5 rounded-lg bg-[#172F43] text-white text-xs font-semibold cursor-pointer"
              >
                Save Notes
              </button>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#172F43]/10">
              <div className="text-xs font-semibold text-[#172F43]">Appointment History</div>
              {history.map((h) => (
                <div key={h.id} className="p-2.5 rounded-lg bg-[#F5F7F8] text-xs flex justify-between">
                  <div>
                    <div className="font-semibold text-[#172F43]">{h.doctorName}</div>
                    <div className="font-mono-tabular text-[11px] text-[#172F43]/65">
                      {h.appointmentDate} · {h.startTime}
                    </div>
                  </div>
                  <span className="uppercase text-[10px] font-bold text-[#37A879]">{h.status}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
