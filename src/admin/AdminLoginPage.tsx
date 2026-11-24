import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Eye, EyeOff, KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { useSite } from '../hooks/useSiteContext';
import { fetchAdminAuthStatus } from '../lib/api';
import { GoodHopeLogo } from '../components/GoodHopeLogo';

export const AdminLoginPage: React.FC = () => {
  const { adminToken, setAdminSession, data } = useSite();
  const navigate = useNavigate();

  const [statusLoading, setStatusLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'env_passcode' | 'claimed_account' | 'needs_setup'>('claimed_account');
  const [activeTab, setActiveTab] = useState<'login' | 'setup'>('login');
  const [storageBackend, setStorageBackend] = useState<'supabase' | 'local_server_db'>('local_server_db');

  // Fresh setup state
  const [fullName, setFullName] = useState('Sudarshan Karkee');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Login state (accepts either User ID or Email ID)
  const [identifier, setIdentifier] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
        setActiveTab(res.mode === 'needs_setup' ? 'setup' : 'login');
        setStorageBackend(res.storageBackend);
      })
      .catch(() => {
        setError('Unable to reach authentication server.');
      })
      .finally(() => setStatusLoading(false));
  }, [adminToken, navigate]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (username.trim().length < 3) {
      return setError('Please choose a User ID of at least 3 characters (letters, numbers, _, ., -).');
    }
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
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
          fullName: fullName.trim(),
        }),
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
        body: JSON.stringify({
          identifier: identifier.trim(),
          email: identifier.trim(),
          password,
        }),
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

  const showSetupForm = authMode === 'needs_setup' && activeTab === 'setup';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#172F43] via-[#1b3a52] to-[#122638] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-white/10 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col items-center text-center">
          <GoodHopeLogo logoUrl={data?.settings.logoUrl} size={64} />
          <h1 className="mt-4 font-display font-extrabold text-2xl text-[#172F43]">
            {showSetupForm ? 'Create Admin Login' : 'Admin Login'}
          </h1>
          <p className="mt-1 text-xs text-[#172F43]/65">
            {showSetupForm
              ? 'Set your fresh User ID, Email ID & Password once to secure the Good Hope Admin Panel.'
              : 'Sign in with your User ID or Email ID and Password.'}
          </p>
        </div>

        {/* Side-by-side Login / First-Time Setup switcher (only visible before account is claimed) */}
        {!statusLoading && authMode === 'needs_setup' && (
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#F5F7F8] border border-[#172F43]/10">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setError(null);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-[#172F43] text-white'
                  : 'text-[#172F43]/75 hover:text-[#172F43]'
              }`}
            >
              Admin Login
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('setup');
                setError(null);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'setup'
                  ? 'bg-[#37A879] text-white'
                  : 'text-[#172F43]/75 hover:text-[#172F43]'
              }`}
            >
              First-Time Setup
            </button>
          </div>
        )}

        {statusLoading ? (
          <div className="py-10 text-center text-sm text-[#172F43]/60">Checking login status...</div>
        ) : showSetupForm ? (
          <form onSubmit={handleSetup} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#F1F8F3] border border-[#37A879]/25 text-xs text-[#172F43]/80 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#37A879] mt-0.5 shrink-0" />
              <span>
                Fresh setup ready. After saving your credentials, this page automatically switches to the private Login Panel. You can update User ID, Email, or Password anytime inside Admin → Security.
              </span>
            </div>

            <div>
              <label htmlFor="setup-name" className="block text-xs font-semibold text-[#172F43] mb-1">
                Owner / Admin Name
              </label>
              <input
                id="setup-name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Sudarshan Karkee"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#172F43]/15 text-sm focus:outline-none focus:border-[#37A879]"
              />
            </div>

            <div>
              <label htmlFor="setup-username" className="block text-xs font-semibold text-[#172F43] mb-1">
                User ID (Username)
              </label>
              <input
                id="setup-username"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. sudarshan_admin"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#172F43]/15 text-sm focus:outline-none focus:border-[#37A879]"
              />
            </div>

            <div>
              <label htmlFor="setup-email" className="block text-xs font-semibold text-[#172F43] mb-1">
                Email ID
              </label>
              <input
                id="setup-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. yourname@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#172F43]/15 text-sm focus:outline-none focus:border-[#37A879]"
              />
            </div>

            <div>
              <label htmlFor="setup-pass" className="block text-xs font-semibold text-[#172F43] mb-1">
                Password (min 8 characters)
              </label>
              <div className="relative">
                <input
                  id="setup-pass"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-[#172F43]/15 text-sm focus:outline-none focus:border-[#37A879]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#172F43]/50 hover:text-[#172F43] cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="setup-confirm" className="block text-xs font-semibold text-[#172F43] mb-1">
                Confirm Password
              </label>
              <input
                id="setup-confirm"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
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
              <span>{submitting ? 'Saving Credentials...' : 'Save Credentials & Sign In'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            {authMode === 'needs_setup' && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                No admin account is set up on this server yet. Switch to{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('setup');
                    setError(null);
                  }}
                  className="font-bold underline text-[#172F43] cursor-pointer"
                >
                  First-Time Setup
                </button>{' '}
                once to create your User ID, Email & Password.
              </div>
            )}

            {authMode !== 'env_passcode' && (
              <div>
                <label htmlFor="login-identifier" className="block text-xs font-semibold text-[#172F43] mb-1">
                  User ID or Email ID
                </label>
                <input
                  id="login-identifier"
                  type="text"
                  required
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your User ID or Email ID"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#172F43]/15 text-sm focus:outline-none focus:border-[#37A879]"
                />
              </div>
            )}

            <div>
              <label htmlFor="login-pass" className="block text-xs font-semibold text-[#172F43] mb-1">
                {authMode === 'env_passcode' ? 'Admin Passcode' : 'Password'}
              </label>
              <div className="relative">
                <input
                  id="login-pass"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-[#172F43]/15 text-sm focus:outline-none focus:border-[#37A879]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#172F43]/50 hover:text-[#172F43] cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
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

            <p className="text-[11px] text-center text-[#172F43]/55 leading-relaxed">
              {storageBackend === 'supabase'
                ? 'Synced via Supabase — login & credential changes apply across both AI Studio and the live website.'
                : 'Same User ID, Email & Password work across browsers on this server. Add Supabase keys in Secrets for multi-site sync.'}
            </p>
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
