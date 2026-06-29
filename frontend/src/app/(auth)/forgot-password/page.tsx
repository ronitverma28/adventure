'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth.api';
import { forgotPasswordSchema, ForgotPasswordData } from '@/lib/validations/auth.schema';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils/cn';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordData>({ resolver: zodResolver(forgotPasswordSchema) });
  const mutation = useMutation({
    mutationFn: (d: ForgotPasswordData) => authApi.forgotPassword(d),
    onSuccess: (_, v) => { setSentEmail(v.email); setSent(true); },
    onError: () => toast.error('Something went wrong. Please try again.'),
  });
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <AnimatePresence mode="wait">
        {!sent ? (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mb-8"><h1 className="font-display text-3xl font-bold text-foreground">Forgot password?</h1><p className="mt-2 text-muted-foreground">Enter your email and we&apos;ll send you a reset link.</p></div>
            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input {...register('email')} type="email" placeholder="you@example.com"
                    className={cn('w-full rounded-xl border bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20', errors.email ? 'border-red-500' : 'border-border')} />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <button type="submit" disabled={mutation.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-600 disabled:opacity-70">
                {mutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</> : <>Send Reset Link <ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>
            <div className="mt-6 text-center"><Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to login</Link></div>
          </motion.div>
        ) : (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="mb-6 flex justify-center"><div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10"><CheckCircle className="h-10 w-10 text-emerald-500" /></div></div>
            <h2 className="font-display text-2xl font-bold text-foreground">Check your email</h2>
            <p className="mt-3 text-muted-foreground">We sent a reset link to <span className="font-semibold text-foreground">{sentEmail}</span></p>
            <p className="mt-2 text-sm text-muted-foreground">The link expires in 1 hour.</p>
            <button onClick={() => mutation.mutate({ email: sentEmail })} className="mt-6 text-sm text-brand-500 hover:text-brand-600">Didn&apos;t receive it? Resend</button>
            <div className="mt-4"><Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to login</Link></div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
