'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { login } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('s.mitchell@university.edu');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#E8F7FB] overflow-x-hidden">
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-[#0A3C58] to-[#46C3DB] px-6 py-12 md:py-0 md:min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-white rounded-full" />
          <div className="absolute top-20 -right-20 w-48 h-48 bg-[#46C3DB] rounded-full opacity-30" />
        </div>
        <div className="relative z-10 flex items-center justify-center bg-transparent">
          <Image
            src="/campusfix-full-logo.png"
            width={340}
            height={300}
            alt="CampusFix"
            className="w-[300px] h-[265px] md:w-[340px] md:h-[300px] object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.25)]"
            priority
          />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-[#E8F7FB] p-6 md:p-8">
        <div className="login-card bg-white w-full px-6 pt-10 pb-8 relative z-20 max-w-md mx-auto rounded-[36px] shadow-[0_8px_32px_rgba(10,60,88,0.12)]">
        <div className="mb-8">
          <h2 className="text-[24px] font-semibold text-[#0A3C58] mb-2">Welcome Back</h2>
          <p className="text-[#42474d] text-[16px]">Sign in to access your dashboard and points.</p>
        </div>
        <form className="space-y-4" onSubmit={onSubmit}>
          {error && <div className="rounded-lg bg-[#ffdad6] text-[#93000a] text-sm px-4 py-3">{error}</div>}
          <div className="input-field-custom flex items-center px-4 h-14">
            <Mail className="h-5 w-5 text-[#42474d] mr-3 shrink-0" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder="Student Email" className="w-full bg-transparent border-none p-0 h-full text-[#101e21] placeholder:text-[#72787e] focus:ring-0 focus:outline-none" />
          </div>
          <div className="input-field-custom flex items-center px-4 h-14">
            <Lock className="h-5 w-5 text-[#42474d] mr-3 shrink-0" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} required type={show ? 'text' : 'password'} placeholder="Password" className="w-full bg-transparent border-none p-0 h-full text-[#101e21] placeholder:text-[#72787e] focus:ring-0 focus:outline-none" />
            <button type="button" onClick={() => setShow(!show)} className="p-2 -mr-2 text-[#42474d] hover:text-[#0A3C58]">
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <div className="flex justify-end pt-2">
            <Link href="#" className="text-sm font-semibold text-[#46C3DB] hover:text-[#0A3C58]">Forgot Password?</Link>
          </div>
          <div className="pt-4">
            <button disabled={loading} type="submit" className="w-full h-14 rounded-full bg-gradient-to-r from-[#0A3C58] to-[#46C3DB] text-white font-semibold shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60">
              {loading ? 'Signing in…' : 'Login'} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
        <div className="mt-8 text-center pb-4">
          <p className="text-sm text-[#42474d]">
            New here? <Link href="/signup" className="font-semibold text-[#0A3C58] hover:text-[#46C3DB] underline decoration-2 underline-offset-4">Create an Account</Link>
          </p>
          <p className="text-xs text-[#72787e] mt-3">Admin demo: s.mitchell@university.edu • Student: alex.chen@university.edu</p>
        </div>
        </div>
      </div>
    </div>
  );
}
