import React, { useState, useEffect } from 'react';
import { Member, Book, Borrowing, Reservation, Announcement } from '../types';
import { BookOpen, Clock, Calendar, AlertCircle, RefreshCw, Bookmark, Sparkles, CheckCircle, Bell, ArrowRight, ShieldAlert, Edit3, X, User } from 'lucide-react';

interface StudentDashboardProps {
  currentUser: Member | null;
  onOpenLogin: () => void;
  onSelectBook: (book: Book) => void;
  onNavigateToCatalog: () => void;
  onNavigateToAi: (prompt?: string) => void;
  onUpdateUser?: (updated: Member) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  onOpenLogin,
  onSelectBook,
  onNavigateToCatalog,
  onNavigateToAi,
  onUpdateUser
}) => {
  const [dashboardData, setDashboardData] = useState<{
    member: Member;
    activeLoans: Borrowing[];
    pastLoans: Borrowing[];
    reservations: Reservation[];
    totalFines: number;
    recommended: Book[];
  } | null>(null);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit Student Name / Profile Modal State
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editDepartment, setEditDepartment] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const fetchDashboard = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/student/dashboard/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }

      const annRes = await fetch('/api/announcements');
      if (annRes.ok) {
        const annData = await annRes.json();
        setAnnouncements(annData.announcements || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name);
      setEditDepartment(currentUser.department);
      setEditPhone(currentUser.phone);
      fetchDashboard();
    }
  }, [currentUser]);

  const handleRenew = async (borrowingId: number) => {
    if (!currentUser) return;
    setActionMessage(null);
    try {
      const res = await fetch('/api/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ borrowingId, memberId: currentUser.id })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: 'success', text: data.message });
        fetchDashboard();
      } else {
        setActionMessage({ type: 'error', text: data.error || "Renewal failed." });
      }
    } catch (e) {
      setActionMessage({ type: 'error', text: "Network error during renewal." });
    }
  };

  const handleReturn = async (borrowingId: number) => {
    setActionMessage(null);
    try {
      const res = await fetch('/api/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ borrowingId })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: 'success', text: data.message });
        fetchDashboard();
      } else {
        setActionMessage({ type: 'error', text: data.error || "Return failed." });
      }
    } catch (e) {
      setActionMessage({ type: 'error', text: "Network error during return." });
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !editName.trim()) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/members/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          department: editDepartment.trim(),
          phone: editPhone.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.member) {
        setActionMessage({ type: 'success', text: `Student name updated to "${data.member.name}" successfully!` });
        setShowEditModal(false);
        if (onUpdateUser) {
          onUpdateUser(data.member);
        }
        fetchDashboard();
      } else {
        setActionMessage({ type: 'error', text: data.error || "Failed to update profile." });
      }
    } catch (e) {
      setActionMessage({ type: 'error', text: "Network error updating student profile." });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 shadow-xl text-center space-y-4">
        <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto">
          <BookOpen className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-serif font-bold text-slate-900">Student Portal Access</h2>
        <p className="text-sm text-slate-600">
          Please sign in with your student credentials or use the instant demo student account to view active loans, renew books, and track hold reservations.
        </p>
        <button
          onClick={onOpenLogin}
          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-amber-600 text-white font-semibold rounded-xl text-sm transition shadow-sm"
        >
          Sign In as Student (Demo)
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Student Welcome Banner with Edit Name Action */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Student ID: {currentUser.member_id}
            </span>
            <span className="text-xs text-slate-400">Department: {currentUser.department}</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Welcome back, {currentUser.name}
            </h1>
            <button
              onClick={() => {
                setEditName(currentUser.name);
                setEditDepartment(currentUser.department);
                setEditPhone(currentUser.phone);
                setShowEditModal(true);
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-slate-700 transition flex items-center gap-1 text-xs"
              title="Change Student Name / Edit Profile"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Change Name</span>
            </button>
          </div>

          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Manage your borrowed course texts, renewal dates, hold requests, and personalized AI reading recommendations.
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-3 gap-3 flex-shrink-0 text-center">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <span className="text-2xl font-bold text-amber-400">{dashboardData?.activeLoans.length || 0} / {currentUser.max_allowed_books}</span>
            <span className="block text-[11px] text-slate-400 mt-0.5">Active Loans</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <span className="text-2xl font-bold text-indigo-400">{dashboardData?.reservations.length || 0}</span>
            <span className="block text-[11px] text-slate-400 mt-0.5">Holds Reserved</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
            <span className={`text-2xl font-bold ${(dashboardData?.totalFines || 0) > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              ${(dashboardData?.totalFines || 0).toFixed(2)}
            </span>
            <span className="block text-[11px] text-slate-400 mt-0.5">Dues / Fines</span>
          </div>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
          actionMessage.type === 'success'
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
            : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="text-xs underline font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Two Column Layout: Active Borrows + Announcements & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column (2 spans): Active Borrows & Reservations */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Borrowed Books */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                  <span>Currently Borrowed Books</span>
                </h2>
                <p className="text-xs text-slate-500">Books issued to student <strong>{currentUser.name}</strong> ({currentUser.member_id}). Maximum 2 renewals per title.</p>
              </div>
              <button
                onClick={onNavigateToCatalog}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
              >
                <span>Find More Books</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {dashboardData?.activeLoans.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-sm text-slate-500">You currently have no books on loan.</p>
                <button
                  onClick={onNavigateToCatalog}
                  className="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardData?.activeLoans.map((loan) => {
                  const isOverdue = loan.status === 'overdue';
                  return (
                    <div
                      key={loan.id}
                      className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isOverdue ? 'bg-rose-50/70 border-rose-200' : 'bg-slate-50/80 border-slate-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">{loan.book_title}</h4>
                          {isOverdue && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">
                              OVERDUE
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                          <span>Issued: <strong>{loan.issue_date}</strong></span>
                          <span className={isOverdue ? 'text-rose-700 font-bold' : ''}>
                            Due: <strong>{loan.due_date}</strong>
                          </span>
                          <span>Renewals Used: <strong>{loan.renewal_count}/2</strong></span>
                        </div>
                        {isOverdue && loan.fine_amount > 0 && (
                          <p className="text-xs text-rose-700 font-semibold flex items-center gap-1 mt-1">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Accrued Fine: ${loan.fine_amount.toFixed(2)} ($0.50/day policy)</span>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleRenew(loan.id)}
                          disabled={loan.renewal_count >= 2}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition flex items-center gap-1 shadow-xs"
                          title={loan.renewal_count >= 2 ? "Max renewals reached" : "Extend loan by 14 days"}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Renew Loan</span>
                        </button>
                        <button
                          onClick={() => handleReturn(loan.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition"
                        >
                          Return Copy
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reserved Books Queue */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-indigo-600" />
              <span>Active Hold Reservations</span>
            </h2>
            <p className="text-xs text-slate-500">
              When copies are returned, hold members are given 48 hours for front desk collection.
            </p>

            {dashboardData?.reservations.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-xl text-xs text-slate-500">
                You have no active reservations. If a book you want is checked out, you can reserve it from the catalog.
              </div>
            ) : (
              <div className="space-y-2">
                {dashboardData?.reservations.map((res) => (
                  <div
                    key={res.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-indigo-50/40 flex items-center justify-between text-xs"
                  >
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">{res.book_title}</h5>
                      <span className="text-slate-500">Requested: {res.reservation_date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        res.status === 'ready'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {res.status === 'ready' ? 'Ready for Pickup at Desk!' : `Waitlist Position #${res.queue_position}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Loan History */}
          {dashboardData?.pastLoans && dashboardData.pastLoans.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                Completed Borrowing History ({dashboardData.pastLoans.length})
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                {dashboardData.pastLoans.map((pl) => (
                  <div key={pl.id} className="py-2.5 flex items-center justify-between text-slate-600">
                    <span className="font-medium text-slate-800">{pl.book_title}</span>
                    <span>Returned: {pl.return_date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Column: AI Recommendations & Announcements */}
        <div className="space-y-6">
          {/* AI Recommended Books for Student */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl border border-amber-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="font-serif font-bold text-base text-amber-950">
                  Recommended for Your Studies
                </h3>
                <p className="text-[11px] text-amber-800">
                  Based on your department ({currentUser.department}) & reading records
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {dashboardData?.recommended.map((book) => (
                <div
                  key={book.id}
                  onClick={() => onSelectBook(book)}
                  className="p-3 bg-white rounded-xl border border-amber-200/60 shadow-xs hover:border-amber-400 cursor-pointer transition flex items-start gap-3"
                >
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className="w-12 h-16 object-cover rounded shadow-xs flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs text-slate-900 truncate" title={book.title}>
                      {book.title}
                    </h5>
                    <p className="text-[11px] text-slate-600 truncate">{book.author_name}</p>
                    <span className="inline-block mt-1 text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                      {book.shelf_location}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigateToAi(`What books would you recommend for a ${currentUser.department} student?`)}
              className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask SNJB COE Library AI for More Suggestions</span>
            </button>
          </div>

          {/* Library Announcements */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-600" />
              <span>Library Notices & Hours</span>
            </h3>

            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span>{ann.title}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{ann.date}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Student Profile & Name Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative space-y-4">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-slate-900">Change Student Name</h3>
                <p className="text-xs text-slate-500">Update your student identity in SNJB COE Library records</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Full Name:</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Arpita Shah"
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-slate-900 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Engineering Department:</label>
                <input
                  type="text"
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  placeholder="e.g. Computer Engineering"
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone:</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
                <span>Member ID: <strong>{currentUser.member_id}</strong> (Fixed student barcode identifier)</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || !editName.trim()}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-xs transition shadow-sm disabled:opacity-50"
                >
                  {isUpdating ? "Saving..." : "Save Name"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
