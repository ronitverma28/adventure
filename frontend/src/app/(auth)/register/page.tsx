'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Loader2, Check } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { registerSchema, RegisterFormData } from '@/lib/validations/auth.schema';
import { cn } from '@/lib/utils/cn';

const PW_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter',  test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter',  test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number',            test: (p: string) => /[0-9]/.test(p) },
];

export default function RegisterPage() {
  const [showPw, setShowPw]   = useState(false);
  const [showCf, setShowCf]   = useState(false);
  const { register: reg, isRegistering } = useAuth();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema), defaultValues: { acceptTerms: false },
  });
  const pw = watch('password', '');
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Create your account</h1>
        <p className="mt-2 text-muted-foreground">Join 50,000+ trekkers on Adventure</p>
      </div>
      <form onSubmit={handleSubmit((d) => reg(d))} className="space-y-4">
        {[{ n: 'name' as const, l: 'Full Name', t: 'text', ph: 'Rahul Sharma', ic: User, ac: 'name' },
          { n: 'email' as const, l: 'Email', t: 'email', ph: 'you@example.com', ic: Mail, ac: 'email' },
          { n: 'phone' as const, l: 'Phone (optional)', t: 'tel', ph: '9876543210', ic: Phone, ac: 'tel' }]
          .map(({ n, l, t, ph, ic: Icon, ac }) => (
            <div key={n}>
              <label className="mb-1.5 block text-sm font-medium text-foreground">{l}</label>
              <div className="relative">
                <Icon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input {...register(n)} type={t} placeholder={ph} autoComplete={ac}
                  className={cn('w-full rounded-xl border bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20', errors[n] ? 'border-red-500' : 'border-border')} />
              </div>
              {errors[n] && <p className="mt-1 text-xs text-red-500">{(errors[n] as any)?.message}</p>}
            </div>
          ))}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input {...register('password')} type={showPw ? 'text' : 'password'} placeholder="••••••••" autoComplete="new-password"
              className={cn('w-full rounded-xl border bg-background py-3 pl-10 pr-11 text-sm text-foreground placeholder-muted-foreground outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20', errors.password ? 'border-red-500' : 'border-border')} />
            <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {pw && (
            <div className="mt-2 grid grid-cols-2 gap-1">
              {PW_RULES.map((r) => (
                <div key={r.label} className={cn('flex items-center gap-1.5 text-xs', r.test(pw) ? 'text-emerald-500' : 'text-muted-foreground')}>
                  <div className={cn('flex h-4 w-4 items-center justify-center rounded-full', r.test(pw) ? 'bg-emerald-500' : 'bg-muted')}>
                    {r.test(pw) && <Check className="h-2.5 w-2.5 text-white" />}
                  </div>
                  {r.label}
                </div>
              ))}
            </div>
          )}
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input {...register('confirmPassword')} type={showCf ? 'text' : 'password'} placeholder="••••••••" autoComplete="new-password"
              className={cn('w-full rounded-xl border bg-background py-3 pl-10 pr-11 text-sm text-foreground placeholder-muted-foreground outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20', errors.confirmPassword ? 'border-red-500' : 'border-border')} />
            <button type="button" onClick={() => setShowCf(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showCf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
        </div>
        <div>
          <div className="flex items-start gap-2">
            <input {...register('acceptTerms')} type="checkbox" id="terms" className="mt-0.5 h-4 w-4 rounded border-border accent-brand-500" />
            <label htmlFor="terms" className="text-sm text-muted-foreground">
              I agree to the <Link href="/terms" className="text-brand-500 hover:underline">Terms</Link> and <Link href="/privacy" className="text-brand-500 hover:underline">Privacy Policy</Link>
            </label>
          </div>
          {errors.acceptTerms && <p className="mt-1 text-xs text-red-500">{errors.acceptTerms.message}</p>}
        </div>
        <button type="submit" disabled={isRegistering}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-600 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70">
          {isRegistering ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</> : <>Create Account <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}<Link href="/login" className="font-semibold text-brand-500 hover:text-brand-600">Sign in</Link>
      </p>
    </motion.div>
  );
}
