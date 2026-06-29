'use client';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth.api';
import { resetPasswordSchema, ResetPasswordData } from '@/lib/validations/auth.schema';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils/cn';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-500" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const [showNew, setShowNew] = useState(false);
  const [showCf, setShowCf]   = useState(false);
  const [done, setDone]       = useState(false);
  const token = useSearchParams().get('token') ?? '';
  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordData>({ resolver: zodResolver(resetPasswordSchema) });
  const mutation = useMutation({
    mutationFn: (d: ResetPasswordData) => authApi.resetPassword({
      token,
      newPassword: d.newPassword,
      confirmPassword: d.confirmPassword
    }),
    onSuccess: () => setDone(true),
    onError: () => toast.error('Invalid or expired reset link. Please request a new one.'),
  });
  if (!token) return (<div className="text-center"><p className="text-muted-foreground">Invalid reset link.</p><Link href="/forgot-password" className="mt-4 block text-brand-500">Request a new one</Link></div>);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mb-8"><h1 className="font-display text-3xl font-bold text-foreground">Set new password</h1><p className="mt-2 text-muted-foreground">Choose a strong password for your account.</p></div>
            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
              {[{ n: 'newPassword' as const, l: 'New Password', s: showNew, t: () => setShowNew(v => !v) },
                { n: 'confirmPassword' as const, l: 'Confirm Password', s: showCf, t: () => setShowCf(v => !v) }]
                .map(({ n, l, s, t }) => (
                  <div key={n}>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">{l}</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input {...register(n)} type={s ? 'text' : 'password'} placeholder="••••••••"
                        className={cn('w-full rounded-xl border bg-background py-3 pl-10 pr-11 text-sm text-foreground placeholder-muted-foreground outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20', errors[n] ? 'border-red-500' : 'border-border')} />
                      <button type="button" onClick={t} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{s ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                    </div>
                    {errors[n] && <p className="mt-1 text-xs text-red-500">{errors[n]?.message}</p>}
                  </div>
                ))}
              <button type="submit" disabled={mutation.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-600 disabled:opacity-70">
                {mutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Resetting...</> : <>Reset Password <ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="mb-6 flex justify-center"><div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10"><CheckCircle className="h-10 w-10 text-emerald-500" /></div></div>
            <h2 className="font-display text-2xl font-bold text-foreground">Password reset!</h2>
            <p className="mt-3 text-muted-foreground">Your password has been successfully updated.</p>
            <Link href="/login" className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600">Sign In <ArrowRight className="h-4 w-4" /></Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
