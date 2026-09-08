'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/BrandLogo';
import { User, Mail, Lock, LockKeyhole, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { signup } from '@/lib/auth';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (!terms) { setError('Please accept Privacy Policy and Terms'); return; }
    setError(''); setLoading(true);
    try {
      await signup(fullName || email.split('@')[0], email, password);
      router.push('/');
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#E8F7FB]">
      <header className="flex w-full flex-col items-center justify-center gap-2 pb-6 pt-10">
        <BrandLogo variant="header" />
      </header>
      <main className="flex-1 flex flex-col justify-end md:justify-center px-6 md:px-0">
        <div className="bg-white w-full md:max-w-md mx-auto rounded-t-[36px] md:rounded-[36px] shadow-[0_-4px_40px_rgba(10,60,88,0.08)] px-6 pt-10 pb-8 flex flex-col gap-8">
          <div className="flex flex-col gap-1 text-center">
            <h2 className="text-xl font-semibold text-[#0a3c58]">Create Account</h2>
            <p className="text-sm text-[#42474d]">Join the community and help see change on campus.</p>
          </div>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {error && <div className="rounded-lg bg-[#ffdad6] text-[#93000a] text-sm px-4 py-3">{error}</div>}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#42474d] ml-2">Full Name</label>
              <div className="flex items-center bg-[#E8F7FB]/50 border border-[#0a3c58]/20 rounded-lg px-4 py-3 input-focus-ring">
                <User className="h-5 w-5 text-[#72787e] mr-3" />
                <input value={fullName} onChange={(e)=>setFullName(e.target.value)} required placeholder="Jane Doe" className="w-full bg-transparent border-none p-0 text-[#101e21] placeholder:text-[#c2c7ce] focus:ring-0 focus:outline-none" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#42474d] ml-2">Student Email</label>
              <div className="flex items-center bg-[#E8F7FB]/50 border border-[#0a3c58]/20 rounded-lg px-4 py-3 input-focus-ring">
                <Mail className="h-5 w-5 text-[#72787e] mr-3" />
                <input value={email} onChange={(e)=>setEmail(e.target.value)} required type="email" placeholder="jane.doe@university.edu" className="w-full bg-transparent border-none p-0 text-[#101e21] placeholder:text-[#c2c7ce] focus:ring-0 focus:outline-none" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#42474d] ml-2">Password</label>
              <div className="flex items-center bg-[#E8F7FB]/50 border border-[#0a3c58]/20 rounded-lg px-4 py-3 input-focus-ring">
                <Lock className="h-5 w-5 text-[#72787e] mr-3" />
                <input value={password} onChange={(e)=>setPassword(e.target.value)} required type={show? 'text':'password'} placeholder="••••••••" className="w-full bg-transparent border-none p-0 text-[#101e21] focus:ring-0 focus:outline-none" />
                <button type="button" onClick={()=>setShow(!show)} className="ml-2 text-[#72787e]">{show? <EyeOff className="h-5 w-5"/>: <Eye className="h-5 w-5"/>}</button>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#42474d] ml-2">Confirm Password</label>
              <div className="flex items-center bg-[#E8F7FB]/50 border border-[#0a3c58]/20 rounded-lg px-4 py-3 input-focus-ring">
                <LockKeyhole className="h-5 w-5 text-[#72787e] mr-3" />
                <input value={confirm} onChange={(e)=>setConfirm(e.target.value)} required type="password" placeholder="••••••••" className="w-full bg-transparent border-none p-0 text-[#101e21] focus:ring-0 focus:outline-none" />
              </div>
            </div>
            <div className="flex items-start gap-3 mt-2">
              <input id="terms" type="checkbox" checked={terms} onChange={(e)=>setTerms(e.target.checked)} required className="w-6 h-6 rounded-md border-[#72787e] text-[#46C3DB] focus:ring-[#46C3DB] bg-[#E8F7FB]/50" />
              <label htmlFor="terms" className="text-sm text-[#42474d] leading-tight">I agree to the <a className="text-[#0A3C58] font-medium hover:underline" href="#">Privacy Policy</a> and <a className="text-[#0A3C58] font-medium hover:underline" href="#">Terms of Service</a>.</label>
            </div>
            <button disabled={loading} type="submit" className="mt-4 w-full h-[56px] rounded-full bg-gradient-to-r from-[#0A3C58] to-[#46C3DB] text-white font-semibold shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60">
              {loading?'Creating…':'Create Account'} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          <div className="text-center">
            <p className="text-sm text-[#42474d]">Already have an account? <Link href="/login" className="text-[#46C3DB] font-semibold hover:text-[#0a3c58]">Sign In</Link></p>
          </div>
        </div>
      </main>
    </div>
  );
}
