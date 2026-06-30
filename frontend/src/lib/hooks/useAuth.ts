import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api/auth.api';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import type { LoginRequest, RegisterRequest, User } from '@/types/auth.types';

export function useAuth() {
  const { user, isAuthenticated, logout: storeLogout, setAuth, updateUser } = useAuthStore();
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: ({ data }) => {
      const auth = data.data;
      setAuth(
        { id: auth.userId, name: auth.name, email: auth.email, avatarUrl: auth.avatarUrl, roles: auth.roles, isVerified: true, emailVerified: true },
        auth.accessToken, auth.refreshToken
      );
      toast.success(`Welcome back, ${auth.name}!`);
      
      let redirectUrl = '/';
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        redirectUrl = params.get('redirect') || '/';
      }
      router.push(redirectUrl);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? 'Invalid email or password');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: ({ data }) => {
      const auth = data.data;
      setAuth(
        { id: auth.userId, name: auth.name, email: auth.email, avatarUrl: auth.avatarUrl, roles: auth.roles, isVerified: false, emailVerified: false },
        auth.accessToken, auth.refreshToken
      );
      toast.success('Account created! Please verify your email.');
      router.push('/');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? 'Registration failed. Please try again.');
    },
  });

  const logout = async () => {
    try { await authApi.logout(); } finally {
      storeLogout();
      router.push('/login');
      toast.success('Logged out successfully');
    }
  };

  const isAdmin = user?.roles.includes('ROLE_ADMIN') ?? false;
  const isGuide = user?.roles.includes('ROLE_GUIDE') ?? false;

  return {
    user, isAuthenticated, isAdmin, isGuide,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout, updateUser,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
