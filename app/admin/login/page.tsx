'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Please enter both Admin ID and Password');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid credentials');
      }

      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: '#0F172A' }}>
      <div className="admin-login-card" style={{ maxWidth: '360px', width: '100%', background: '#FFFFFF', borderRadius: '16px', padding: '24px 22px', boxShadow: '0 20px 40px -12px rgba(0,0,0,0.3)', textAlign: 'center' }}>
        
        {/* Compact Shield Icon */}
        <div style={{ display: 'inline-flex', width: '44px', height: '44px', borderRadius: '50%', background: '#EBF5FF', color: '#0077C8', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
          <ShieldCheck size={24} />
        </div>

        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: '0 0 3px' }}>
          HOPEKRAFT Admin
        </h1>
        <p style={{ fontFamily: "'Poppins', sans-serif", color: '#6B7280', fontSize: '0.78rem', margin: '0 0 16px' }}>
          Secure Portal for Orders &amp; Logistics Management
        </p>

        {error && (
          <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '8px', padding: '8px 10px', fontSize: '0.76rem', marginBottom: '14px', textAlign: 'left', fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
          {/* Admin ID / Master Key */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
              Admin ID / Master Key
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="admin-login-input"
                style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter private admin key"
                required
                autoComplete="off"
                spellCheck={false}
              />
              <User size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="admin-login-input"
                style={{ width: '100%', padding: '9px 34px 9px 34px', borderRadius: '8px', border: '1.5px solid #E2E8F0', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                autoComplete="current-password"
              />
              <Lock size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0, display: 'flex' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              padding: '11px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'background 0.2s ease',
              opacity: loading ? 0.75 : 1
            }}
          >
            {loading ? 'Authenticating...' : (
              <>
                <span>Sign In to Admin</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F3F4F6', fontSize: '0.72rem', color: '#6B7280' }}>
          <div>🔒 256-Bit Encrypted Session • Cloudflare Protected</div>
          <div style={{ marginTop: '6px' }}>
            <Link href="/" style={{ color: '#0077C8', textDecoration: 'none', fontWeight: 600 }}>
              ← Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
