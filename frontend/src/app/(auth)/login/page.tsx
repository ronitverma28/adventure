'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { loginSchema, LoginFormData } from '@/lib/validations/auth.schema';
import { cn } from '@/lib/utils/cn';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoggingIn } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema), defaultValues: { rememberMe: false },
  });
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Welcome back</h1>
        <p className="mt-2 text-muted-foreground">Sign in to your HimYatraa account</p>
      </div>
      <form onSubmit={handleSubmit((d) => login(d))} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input {...register('email')} type="email" placeholder="you@example.com" autoComplete="email"
              className={cn('w-full rounded-xl border bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20', errors.email ? 'border-red-500' : 'border-border')} />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Password</label>
            <Link href="/forgot-password" className="text-xs text-brand-500 hover:text-brand-600">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" autoComplete="current-password"
              className={cn('w-full rounded-xl border bg-background py-3 pl-10 pr-11 text-sm text-foreground placeholder-muted-foreground outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20', errors.password ? 'border-red-500' : 'border-border')} />
            <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>
        <div className="flex items-center gap-2">
          <input {...register('rememberMe')} type="checkbox" id="rememberMe" className="h-4 w-4 rounded border-border accent-brand-500" />
          <label htmlFor="rememberMe" className="text-sm text-muted-foreground">Remember me for 7 days</label>
        </div>
        <button type="submit" disabled={isLoggingIn}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-600 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70">
          {isLoggingIn ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : <>Sign In <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>
      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 border-t border-border" /><span className="text-xs text-muted-foreground">or continue with</span><div className="flex-1 border-t border-border" />
      </div>
      {/* <div className="grid grid-cols-2 gap-3">
        {['Google', 'Apple'].map((p) => (
          <button key={p} className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            {p === 'Google' ? <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> : <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>}
            {p}
          </button>
        ))}
      </div> */}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}<Link href="/register" className="font-semibold text-brand-500 hover:text-brand-600">Create one free</Link>
      </p>
    </motion.div>
  );
}
