import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { useSite } from '../hooks/useSiteContext';
import { fetchAdminAuthStatus } from '../lib/api';
import { GoodHopeLogo } from '../components/GoodHopeLogo';

export const AdminLoginPage: React.FC = () => {
  const { adminToken, setAdminSession, data } = useSite();
  const navigate = useNavigate();

  const [statusLoading, setStatusLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'env_passcode' | 'claimed_account' | 'needs_setup'>('needs_setup');

  const [fullName, setFullName] = useState('Sudarshan Karkee');
  const [email, setEmail] = useState('admin@goodhopepharmacy.in');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (adminToken) {
      navigate('/admin', { replace: true });
      return;
    }
    fetchAdminAuthStatus()
      .then((res) => {
        setAuthMode(res.mode);
      })
      .catch(() => {
        setError('Unable to reach authentication server.');
      })
      .finally(() => setStatusLoading(false));
  }, [adminToken, navigate]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      return setError('Please choose a strong password of at least 8 characters.');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Setup failed.');
      setAdminSession(body.token, body.profile);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to complete admin setup.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Sign-in failed.');
      setAdminSession(body.token, body.profile);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#172F43] via-[#1b3a52] to-[#122638] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-white/10 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col items-center text-center">
          <GoodHopeLogo logoUrl={data?.settings.logoUrl} size={64} />
          <h1 className="mt-4 font-display font-extrabold text-2xl text-[#172F43]">
            {authMode === 'needs_setup' ? 'Initial Admin Setup' : 'Good Hope Admin Login'}
          </h1>
          <p className="mt-1 text-xs text-[#172F43]/65">
            {authMode === 'needs_setup'
              ? 'First-time owner claim: create your private administrator credentials to lock and control the site.'
              : 'Authorized Good Hope Pharmacy administrators only.'}
          </p>
        </div>

        {statusLoading ? (
          <div className="py-10 text-center text-sm text-[#172F43]/60">Checking security status...</div>
        ) : authMode === 'needs_setup' ? (
          <form onSubmit={handleSetup} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#F1F8F3] border border-[#37A879]/25 text-xs text-[#172F43]/80 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#37A879] mt-0.5 shrink-0" />
              <span>
                Public registration is disabled. This one-time setup locks immediately after you claim the owner account.
              </span>
            </div>

            <div>
              <label htmlFor="setup-name" className="block text-xs font-semibold text-[#172F43] mb-1">
                Owner / Administrator Name
              </label>
              <input
                id="setup-name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#172F43]/15 text-sm focus:outline-none focus:border-[#37A879]"
              />
            </div>

            <div>
              <label htmlFor="setup-email" className="block text-xs font-semibold text-[#172F43] mb-1">
                Admin Email
              </label>
              <input
                id="setup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#172F43]/15 text-sm focus:outline-none focus:border-[#37A879]"
              />
            </div>

            <div>
              <label htmlFor="setup-pass" className="block text-xs font-semibold text-[#172F43] mb-1">
                Create Admin Password (min 8 chars)
              </label>
              <input
                id="setup-pass"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#172F43]/15 text-sm focus:outline-none focus:border-[#37A879]"
              />
            </div>

            <div>
              <label htmlFor="setup-confirm" className="block text-xs font-semibold text-[#172F43] mb-1">
                Confirm Password
              </label>
              <input
                id="setup-confirm"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#172F43]/15 text-sm focus:outline-none focus:border-[#37A879]"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-[#D83B48]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-[#37A879] hover:bg-[#28865E] text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <KeyRound className="w-4 h-4" />
              <span>{submitting ? 'Securing Account...' : 'Claim Admin & Open Dashboard'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            {authMode === 'claimed_account' && (
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold text-[#172F43] mb-1">
                  Admin Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#172F43]/15 text-sm focus:outline-none focus:border-[#37A879]"
                />
              </div>
            )}

            <div>
              <label htmlFor="login-pass" className="block text-xs font-semibold text-[#172F43] mb-1">
                {authMode === 'env_passcode' ? 'Admin Passcode' : 'Password'}
              </label>
              <input
                id="login-pass"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter administrator password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#172F43]/15 text-sm focus:outline-none focus:border-[#37A879]"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-[#D83B48]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-[#37A879] hover:bg-[#28865E] text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Lock className="w-4 h-4" />
              <span>{submitting ? 'Signing In...' : 'Sign In to Admin Panel'}</span>
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-[#172F43]/10 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#172F43]/70 hover:text-[#37A879]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Good Hope Pharmacy Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
