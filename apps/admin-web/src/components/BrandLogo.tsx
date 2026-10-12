import Image from 'next/image';
import { EyeOff } from 'lucide-react';
import { brand } from '@campus/ui-components';

type BrandLogoProps = {
  variant: 'mark' | 'header' | 'hero' | 'anonymous';
  title?: string;
  subtitle?: string;
};

/**
 * Uniform brand lockup. Single source of truth for logo dimensions,
 * title sizes and spacing across admin-web panels and pages.
 *
 * - mark:      32x32 sidebar / app-bar mark + 16px title
 * - header:    160x48 auth header logo (legacy, prefer hero for auth)
 * - hero:      240x212 login hero logo (compact, no breakpoint jump)
 * - anonymous: identical transparent/floating 240x212 lockup as hero,
 *              directly on the gradient — no white card — plus the
 *              "Anonymous Mode Enabled" pill as sole differentiator.
 */
export function BrandLogo({ variant, title, subtitle }: BrandLogoProps) {
  if (variant === 'mark') {
    return (
      <div className="flex items-center gap-2">
        <Image
          src="/campus-fix-mark.png"
          width={brand.mark}
          height={brand.mark}
          alt="CampusFix"
          className="h-8 w-8 shrink-0 object-contain"
          priority
        />
        <div>
          <p className="text-base font-semibold leading-tight text-slate-900">
            {title ?? 'CampusFix'}
          </p>
          <p className="text-xs leading-tight text-slate-500">
            {subtitle ?? 'Admin Dashboard'}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'header') {
    return (
      <div className="flex flex-col items-center justify-center gap-2">
        <Image
          src="/campus-fix-logo.png"
          width={brand.headerWidth}
          height={brand.headerHeight}
          alt="CampusFix"
          className="h-12 w-40 object-contain"
          priority
        />
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className="flex items-center justify-center">
        <Image
          src="/campusfix-full-logo.png"
          width={brand.authMarkWidth}
          height={brand.authMarkHeight}
          alt="CampusFix"
          className="h-[212px] w-[240px] object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.25)]"
          priority
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Image
        src="/campusfix-full-logo.png"
        width={brand.authMarkWidth}
        height={brand.authMarkHeight}
        alt="CampusFix"
        className="h-[212px] w-[240px] object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.25)]"
        priority
      />
      <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
        Report • Connect • See Change
      </p>
      <div className="mt-1 flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-3.5 py-1.5 backdrop-blur-sm">
        <EyeOff className="h-4 w-4 text-white" />
        <span className="text-xs font-medium text-white">
          Anonymous Mode Enabled
        </span>
      </div>
    </div>
  );
}
