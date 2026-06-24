'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { authApi } from '@/lib/api/auth.api';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-500" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const token = useSearchParams().get('token');
  const [status, setStatus]   = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Invalid verification link.'); return; }
    authApi.verifyEmail(token)
      .then(() => { setStatus('success'); setMessage('Your email has been verified!'); })
      .catch((err) => { setStatus('error'); setMessage(err?.response?.data?.error ?? 'Verification failed. The link may have expired.'); });
  }, [token]);
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
      {status === 'loading' && (<><Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-brand-500" /><h2 className="font-display text-2xl font-bold text-foreground">Verifying your email...</h2></>)}
      {status === 'success' && (<>
        <div className="mb-6 flex justify-center"><div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10"><CheckCircle className="h-10 w-10 text-emerald-500" /></div></div>
        <h2 className="font-display text-2xl font-bold text-foreground">Email Verified!</h2>
        <p className="mt-3 text-muted-foreground">{message}</p>
        <p className="mt-1 text-sm text-muted-foreground">Welcome to Adventure. Your account is now active.</p>
        <Link href="/treks" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600">Explore Treks</Link>
      </>)}
      {status === 'error' && (<>
        <div className="mb-6 flex justify-center"><div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10"><XCircle className="h-10 w-10 text-red-500" /></div></div>
        <h2 className="font-display text-2xl font-bold text-foreground">Verification Failed</h2>
        <p className="mt-3 text-muted-foreground">{message}</p>
        <Link href="/login" className="mt-6 inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted">Back to Login</Link>
      </>)}
    </motion.div>
  );
}
