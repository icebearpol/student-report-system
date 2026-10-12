'use client';
import { X } from 'lucide-react';

export function TermsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#0A3C58]">Terms & Privacy Policy</h2>
          <button onClick={onClose} className="text-[#72787e] hover:text-[#101e21]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[420px] space-y-4 overflow-y-auto pr-2 text-sm text-[#42474d]">
          <div>
            <h3 className="mb-1 font-semibold text-[#0A3C58]">Privacy Policy</h3>
            <p>CampusFix collects only the information administrators provide when creating an account (name, email) and the actions taken while managing reports (status changes, assignments). No student identity data is exposed beyond what each report already discloses.</p>
          </div>
          <div>
            <h3 className="mb-1 font-semibold text-[#0A3C58]">Terms of Service</h3>
            <p>This dashboard is provided for authorized campus staff to triage and resolve reported issues. Access should not be shared outside your authorized role. This is a student capstone project and is provided as-is.</p>
          </div>
        </div>
        <button onClick={onClose} className="mt-5 w-full rounded-lg bg-[#0A3C58] py-2.5 text-sm font-semibold text-white hover:bg-[#0A3C58]/90">
          Close
        </button>
      </div>
    </div>
  );
}