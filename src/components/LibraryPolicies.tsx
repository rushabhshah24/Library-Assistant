import React from 'react';
import { FileText, Clock, AlertTriangle, ShieldCheck, CheckCircle, HelpCircle, Phone, MapPin } from 'lucide-react';

export const LibraryPolicies: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Title */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            <span>SNJB COE Central Library Handbook</span>
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
          Circulation Policies, Rules & Procedures
        </h1>
        <p className="text-sm text-slate-300 mt-2 max-w-xl">
          Everything you need to know about borrowing quotas, renewal limits, overdue fine calculations, and 24/7 return options.
        </p>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rule 1: Quotas & Periods */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span>Borrowing Quotas & Loan Periods</span>
          </h3>
          <ul className="text-xs text-slate-700 space-y-2 leading-relaxed">
            <li>• <strong>Undergraduate & Postgraduate Students</strong>: Up to <strong>3 books</strong> simultaneously for a <strong>14-day</strong> loan period.</li>
            <li>• <strong>Faculty & Research Fellows</strong>: Up to <strong>15 books</strong> simultaneously for a <strong>28-day</strong> loan period.</li>
            <li>• <strong>Reference & Reserve Collection</strong>: Marked with red spine labels (available for 2-hour in-library reading only).</li>
          </ul>
        </div>

        {/* Rule 2: Renewals & Holds */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>Renewals & Reservation Holds</span>
          </h3>
          <ul className="text-xs text-slate-700 space-y-2 leading-relaxed">
            <li>• <strong>Online Renewal</strong>: Allowed up to <strong>2 times</strong> per book via your student portal, adding 14 days per renewal.</li>
            <li>• <strong>Hold Restriction</strong>: If another student has placed a hold reservation, renewals are automatically disabled to ensure equitable access.</li>
            <li>• <strong>Hold Collection Window</strong>: When a reserved book is returned, the next user has <strong>48 hours</strong> to claim it at the front desk.</li>
          </ul>
        </div>

        {/* Rule 3: Overdue Fines */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>Overdue Penalties & Fines</span>
          </h3>
          <ul className="text-xs text-slate-700 space-y-2 leading-relaxed">
            <li>• <strong>Daily Overdue Rate</strong>: Accrues at <strong>$0.50 per calendar day</strong> per book past the due date.</li>
            <li>• <strong>Borrowing Suspension</strong>: Accounts with unpaid balances exceeding <strong>$10.00</strong> cannot check out additional books until settled.</li>
            <li>• <strong>Settling Dues</strong>: Fines can be paid in cash or card at the Librarian circulation desk on Floor 1.</li>
          </ul>
        </div>

        {/* Rule 4: Returning Books */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <span>Book Return Procedures</span>
          </h3>
          <ul className="text-xs text-slate-700 space-y-2 leading-relaxed">
            <li>• <strong>Staffed Hours</strong>: Hand books directly to the front circulation desk (Floor 1). Immediate digital receipt issued.</li>
            <li>• <strong>24/7 Drop Box</strong>: Located outside the main building entrance. Items deposited are processed the following business morning.</li>
            <li>• <strong>Damaged or Lost Items</strong>: Replacement cost plus a standard $15.00 catalog processing fee applies.</li>
          </ul>
        </div>
      </div>

      {/* Building Hours & Map */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-amber-600" />
          <span>Building Operating Hours & Floor Layout</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-700">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="font-bold block text-slate-900 mb-1">Standard Term Hours</span>
            <p>Monday – Friday: 8:00 AM – 10:00 PM</p>
            <p>Saturday: 9:00 AM – 6:00 PM</p>
            <p>Sunday: 12:00 PM – 6:00 PM</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="font-bold block text-slate-900 mb-1">Mid-Term & Finals Exam Period</span>
            <p className="text-emerald-700 font-semibold">24/7 Continuous Access</p>
            <p>Silent study wings open through the night with campus security badge.</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="font-bold block text-slate-900 mb-1">Floor Map & Wing Reference</span>
            <p>Floor 1: Circulation, Classics, Biography</p>
            <p>Floor 2: Computer Science, AI, Networks</p>
            <p>Floor 3: History, Philosophy & Silent Study</p>
          </div>
        </div>
      </div>
    </div>
  );
};
