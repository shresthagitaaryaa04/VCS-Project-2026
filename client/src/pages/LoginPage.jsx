import { useState } from 'react';
import { Mountain, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuthStore();
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    await login(email, password);
  };

  return (
    <div className="auth-shell">
      {/* Left: Art panel */}
      <div className="auth-art">
        {/* Decorative floating circles */}
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-[#40916c] opacity-10 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-[#2d6a4f] opacity-10 blur-3xl" />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <img src="/trek sathi logo.png" alt="Trek Sathi" className="h-10 w-auto object-contain" />
            <span className="text-white font-extrabold text-xl">Trek Sathi</span>
          </div>

          <span className="pill-badge bg-[#40916c]/20 text-[#74c69d] border-[#40916c]/30 mb-6 inline-block">
            <Mountain className="w-3.5 h-3.5" /> Nepal Trekking Community
          </span>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
            Your next adventure<br />starts with the<br />
            <span className="text-[#74c69d]">right people.</span>
          </h1>
          <p className="text-gray-300 text-sm leading-relaxed mb-10 max-w-xs">
            Discover Nepal's trails and connect with trekkers who match your style, pace and budget.
          </p>

          {/* Testimonial */}
          <div className="border border-[#2d6a4f] rounded-xl p-4 bg-white/5 backdrop-blur-sm max-w-xs">
            <p className="text-gray-300 text-sm italic mb-2">
              "The easiest way to turn a solo trail idea into a group plan."
            </p>
            <p className="text-[#74c69d] text-xs font-semibold">— Trek Sathi community</p>
          </div>

          {/* Benefits */}
          <div className="flex flex-col gap-2 mt-8">
            {['Trail recommendations', 'Companion matching', 'Groups & messaging'].map(b => (
              <div key={b} className="flex items-center gap-2 text-gray-300 text-sm">
                <span className="text-[#74c69d]">✓</span> {b}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form side */}
      <div className="auth-form-side">
        <div className="w-full max-w-md">
          {/* Mobile logo (visible on small screens only) */}
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <img src="/trek sathi logo.png" alt="Trek Sathi" className="h-8 w-auto object-contain" />
            <span className="font-extrabold text-lg text-[#111c14]">Trek Sathi</span>
          </div>

          <h2 className="text-2xl font-extrabold text-[#111c14] mb-1">Welcome back</h2>
          <p className="text-[#5a6455] text-sm mb-8">Log in to continue your adventure.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              id="login-email"
              label="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (formErrors.email) setFormErrors({ ...formErrors, email: undefined });
              }}
              placeholder="your@email.com"
              icon={<Mail className="w-5 h-5" />}
              error={formErrors.email}
            />

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                id="login-password"
                label="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formErrors.password) setFormErrors({ ...formErrors, password: undefined });
                }}
                placeholder="••••••••"
                icon={<Lock className="w-5 h-5" />}
                error={formErrors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-[#5a6455]">
                <input type="checkbox" className="w-3.5 h-3.5 rounded border-[#ddd8cc] text-[#1a472a] focus:ring-[#40916c]" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-[#1a472a] hover:text-[#15391f] font-medium transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1a472a] hover:bg-[#15391f] text-white py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {isLoading ? <><LoadingSpinner size="sm" /><span>Logging in...</span></> : 'Log in'}
            </button>

            <div className="text-center pt-4 border-t border-[#ddd8cc]">
              <p className="text-[#5a6455] text-sm">
                Don&apos;t have an account?{' '}
                <Link to="/signup" className="text-[#1a472a] font-semibold hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
