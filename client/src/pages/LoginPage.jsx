import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Scale, Mail, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import Button from '../components/common/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const { login } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      showSuccess('Welcome back to PrecedentIQ.');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Login failed. Please check credentials.';
      setFormError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('counsel@precedentiq.law');
    setPassword('PrecedentIQ2026!');
  };

  return (
    <div className="min-h-screen bg-[#0B1020] flex flex-col justify-center py-12 px-6 lg:px-8 selection:bg-[#D9A62E]/30 selection:text-[#F3F4F6]">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2.5 mb-6">
          <div className="p-2.5 bg-[#D9A62E] rounded-xl shadow-lg shadow-[#D9A62E]/10 text-[#0B1020]">
            <Scale className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-[#F3F4F6]">
            PRECEDENT<span className="text-[#D9A62E]">IQ</span>
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-[#F3F4F6]">
          Sign In to Legal Intelligence
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Enter your authorized credentials to access matter records
        </p>
      </div>

      {/* Form Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#11182D] py-8 px-6 shadow-2xl rounded-2xl border border-[#1C2640] sm:px-10 space-y-6">
          
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Professional Email"
              type="email"
              icon={Mail}
              placeholder="counsel@firm.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={ArrowRight}
              className="w-full mt-2"
            >
              Sign In to Workspace
            </Button>
          </form>

          {/* Quick Demo Fill Helper */}
          <div className="pt-2 border-t border-[#1C2640]">
            <button
              type="button"
              onClick={fillDemo}
              className="w-full text-xs text-center text-[#D9A62E] hover:text-[#E5B645] font-medium py-1.5 rounded-lg bg-[#151E36] hover:bg-[#1C2848] border border-[#1C2640] transition-all"
            >
              Fill Sample Credentials (counsel@precedentiq.law)
            </button>
          </div>

          <div className="text-center text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-[#D9A62E] hover:text-[#E5B645] underline">
              Create an account
            </Link>
          </div>

        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-[#D9A62E]" />
          <span>256-bit encrypted • Isolated database multi-tenancy</span>
        </div>
      </div>

    </div>
  );
}
