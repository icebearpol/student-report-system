'use client';
import Link from 'next/link';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

export default function AnonymousPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#E8F7FB]">
      <div className="h-[60vh] bg-gradient-to-b from-[#0A3C58] to-[#46C3DB] flex flex-col items-center justify-center relative pb-20">
        <div className="z-10 mt-8 flex flex-col items-center">
          <BrandLogo variant="anonymous" />
        </div>
      </div>
      <div className="absolute bottom-0 w-full h-[50vh] bg-white rounded-t-[36px] shadow-[0_-12px_40px_0_rgba(10,60,88,0.12)] z-20 flex flex-col px-6 pt-10 pb-12">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-[#d6e5e9] rounded-full"></div>
        <div className="flex-1 flex flex-col items-center max-w-md mx-auto w-full">
          <h2 className="mb-1 text-xl font-semibold text-[#101e21]">Ready to report?</h2>
          <p className="mb-8 text-center text-sm text-[#42474d]">Help improve our campus infrastructure quickly and securely.</p>
          <div className="w-full bg-[#E8F7FB] border border-[#46C3DB]/20 rounded-[24px] p-4 flex items-start gap-3 mb-8">
            <ShieldCheck className="h-6 w-6 text-[#46C3DB] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm text-[#101e21] mb-1">Privacy First</h3>
              <p className="text-sm text-[#42474d]">No personal identifiers are stored. Your location and report details are completely anonymized.</p>
            </div>
          </div>
          <Link href="/login" className="w-full h-14 bg-gradient-to-r from-[#0A3C58] to-[#46C3DB] rounded-full text-white font-semibold shadow-[0_4px_16px_rgba(70,195,219,0.3)] flex items-center justify-center gap-2 mb-6 hover:opacity-90 active:scale-[0.98] transition-all">
            Proceed Anonymously <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="mt-auto text-center">
            <p className="text-sm text-[#42474d]">Want to earn points or track personal reports?</p>
            <Link href="/login" className="text-sm font-semibold text-[#46C3DB] mt-1 inline-block hover:underline">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
