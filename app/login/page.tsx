'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { LogIn, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <span className="text-white text-2xl font-extrabold">S</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">자습ON</h1>
          <p className="text-sm text-text-tertiary mt-1">관리자 콘솔</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-card-border card-shadow-lg">
          <h2 className="text-lg font-bold text-text-primary mb-5">로그인</h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-hot-light border border-hot/15 text-hot text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-text-tertiary mb-1.5 block tracking-wide uppercase">이메일</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@studyon.local"
                required
                className="w-full rounded-xl bg-bg border border-card-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 placeholder:text-text-tertiary"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-text-tertiary mb-1.5 block tracking-wide uppercase">비밀번호</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  required
                  className="w-full rounded-xl bg-bg border border-card-border px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 placeholder:text-text-tertiary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 gradient-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={16} />
                  로그인
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-sm text-text-tertiary text-center mt-5">
          계정이 없으신가요?{' '}
          <Link href="/signup" className="text-primary font-semibold hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
