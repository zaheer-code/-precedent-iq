import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, User, Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import Button from '../components/common/Button';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const { register } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasMinLength = password.length >= 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    if (!hasUpperCase || !hasNumber || !hasMinLength) {
      setFormError('Password does not meet the security requirements.');
      return;
    }

    setLoading(true);
    try {
      await register(fullName, email, password, confirmPassword);
      showSuccess('PrecedentIQ account created successfully.');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Registration failed. Please try again.';
      setFormError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] flex flex-col justify-center py-12 px-6 lg:px-8 selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2.5 mb-6">
          <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl shadow-lg shadow-amber-500/20 text-slate-950">
            <Scale className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="font-serif font-bold text-2xl tracking-wider text-amber-200">
            PRECEDENT<span className="text-amber-400 font-sans">IQ</span>
          </span>
        </Link>
        <h2 className="text-2xl font-serif font-bold text-slate-100">
          Create Counsel Account
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Set up your secure, isolated legal intelligence workspace
        </p>
      </div>

      {/* Form Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#121722] py-8 px-6 shadow-2xl rounded-2xl border border-slate-800 sm:px-10 space-y-6">
          
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Legal Name"
              type="text"
              icon={User}
              placeholder="e.g. Attorney Sarah Jenkins"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoFocus
            />

            <Input
              label="Professional Email"
              type="email"
              icon={Mail}
              placeholder="s.jenkins@firm.law"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              icon={Lock}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {/* Password Requirement Checklist */}
            <div className="p-3 bg-[#0d1017] rounded-xl border border-slate-800/80 space-y-1.5 text-[11px]">
              <div className="flex items-center space-x-1.5 text-slate-400">
                <CheckCircle2 className={`w-3.5 h-3.5 ${hasMinLength ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span>At least 8 characters</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-400">
                <CheckCircle2 className={`w-3.5 h-3.5 ${hasUpperCase ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span>At least 1 uppercase letter</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-400">
                <CheckCircle2 className={`w-3.5 h-3.5 ${hasNumber ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span>At least 1 numerical digit</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={ArrowRight}
              className="w-full mt-2"
            >
              Register & Access Workspace
            </Button>
          </form>

          <div className="text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-amber-400 hover:text-amber-300 underline">
              Sign In
            </Link>
          </div>

        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Strict matter data isolation • SOC2-ready architecture</span>
        </div>
      </div>

    </div>
  );
}
