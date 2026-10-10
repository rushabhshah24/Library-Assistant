import React, { useState, useEffect } from 'react';
import { Member, Book, Borrowing, Reservation } from '../types';
import { ShieldCheck, Plus, Trash2, Edit3, BookOpen, Users, AlertTriangle, ArrowUpDown, CheckCircle, Search, DollarSign, Database, FileSpreadsheet } from 'lucide-react';

interface LibrarianDashboardProps {
  currentUser: Member | null;
  onOpenLogin: () => void;
  books: Book[];
  onRefreshBooks: () => void;
  onOpenSqlTab: () => void;
}

export const LibrarianDashboard: React.FC<LibrarianDashboardProps> = ({
  currentUser,
  onOpenLogin,
  books,
  onRefreshBooks,
  onOpenSqlTab
}) => {
  const [stats, setStats] = useState<any>(null);
  const [recentBorrowings, setRecentBorrowings] = useState<Borrowing[]>([]);
  const [overdueLoans, setOverdueLoans] = useState<Borrowing[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'circulation' | 'books' | 'members' | 'overdue'>('circulation');

  // Issue Book Form State
  const [issueBookId, setIssueBookId] = useState<string>('');
  const [issueMemberId, setIssueMemberId] = useState<string>('');

  // Add Book Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newBookForm, setNewBookForm] = useState({
    title: '',
    author_name: '',
    category_name: 'Computer Science & AI',
    isbn: '',
    publication_year: '2024',
    publisher: 'Academic Press',
    edition: '1st Edition',
    shelf_location: 'Rack A-05, Shelf 2',
    call_number: 'CS.GEN.2024',
    total_copies: '3',
    description: '',
    cover_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
    tags: 'computer, academic'
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [memberEditName, setMemberEditName] = useState<string>('');
  const [memberEditDept, setMemberEditDept] = useState<string>('');

  const fetchLibrarianData = async () => {
    try {
      const res = await fetch('/api/librarian/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setRecentBorrowings(data.recentBorrowings || []);
        setOverdueLoans(data.overdueLoans || []);
        setMembers(data.members || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLibrarianData();
  }, []);

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueBookId || !issueMemberId) return;
    setNotification(null);

    try {
      const res = await fetch('/api/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: issueBookId, memberId: issueMemberId })
      });
      const data = await res.json();
      if (res.ok) {
        setNotification({ type: 'success', text: data.message });
        setIssueBookId('');
        fetchLibrarianData();
        onRefreshBooks();
      } else {
        setNotification({ type: 'error', text: data.error || "Failed to issue book." });
      }
    } catch (e) {
      setNotification({ type: 'error', text: "Network error during book checkout." });
    }
  };

  const handleReturnBook = async (borrowingId: number) => {
    setNotification(null);
    try {
      const res = await fetch('/api/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ borrowingId })
      });
      const data = await res.json();
      if (res.ok) {
        setNotification({ type: 'success', text: data.message });
        fetchLibrarianData();
        onRefreshBooks();
      } else {
        setNotification({ type: 'error', text: data.error || "Failed to process return." });
      }
    } catch (e) {
      setNotification({ type: 'error', text: "Network error." });
    }
  };

  const handlePayFine = async (borrowingId: number) => {
    try {
      const res = await fetch('/api/librarian/pay-fine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ borrowingId })
      });
      if (res.ok) {
        setNotification({ type: 'success', text: "Fine collected and marked as paid in library register." });
        fetchLibrarianData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBookForm)
      });
      const data = await res.json();
      if (res.ok) {
        setNotification({ type: 'success', text: `Added "${data.book.title}" to catalog!` });
        setShowAddModal(false);
        onRefreshBooks();
        fetchLibrarianData();
      } else {
        setNotification({ type: 'error', text: data.error || "Failed to add book." });
      }
    } catch (e) {
      setNotification({ type: 'error', text: "Network error adding book." });
    }
  };

  const handleDeleteBook = async (id: number) => {
    if (!window.confirm("Are you sure you want to remove this book from the university catalog?")) return;
    try {
      const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotification({ type: 'success', text: "Book record removed from catalog." });
        onRefreshBooks();
        fetchLibrarianData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !memberEditName.trim()) return;
    try {
      const res = await fetch(`/api/members/${editingMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: memberEditName.trim(),
          department: memberEditDept.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        setNotification({ type: 'success', text: `Updated member to "${data.member.name}".` });
        setEditingMember(null);
        fetchLibrarianData();
      } else {
        setNotification({ type: 'error', text: data.error || "Update failed." });
      }
    } catch (e) {
      setNotification({ type: 'error', text: "Network error updating member." });
    }
  };

  if (!currentUser || currentUser.role !== 'librarian') {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 shadow-xl text-center space-y-4">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-serif font-bold text-slate-900">Librarian Access Restricted</h2>
        <p className="text-sm text-slate-600">
          This portal allows circulation desk staff to catalog books, issue & return items, collect fines, and run reports.
        </p>
        <button
          onClick={onOpenLogin}
          className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-xl text-sm transition shadow-sm"
        >
          Sign In as Librarian (Dr. Vance Demo)
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Head Librarian Console</span>
            </span>
            <span className="text-xs text-slate-400">Staff ID: {currentUser.member_id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Library Administration & Circulation Desk
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Inventory controls, student transactions, overdue enforcement, and MySQL relational reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Book</span>
          </button>
          <button
            onClick={onOpenSqlTab}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs rounded-xl border border-slate-700 shadow-sm transition flex items-center gap-1.5"
          >
            <Database className="w-4 h-4" />
            <span>MySQL Schema Script</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-500 text-xs block">Titles in Catalog</span>
            <span className="text-2xl font-bold text-slate-900">{stats.totalTitles}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-500 text-xs block">Total Physical Copies</span>
            <span className="text-2xl font-bold text-slate-900">{stats.totalCopies}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-500 text-xs block">Available on Shelf</span>
            <span className="text-2xl font-bold text-emerald-600">{stats.availableCopies}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-500 text-xs block">Currently On Loan</span>
            <span className="text-2xl font-bold text-amber-600">{stats.borrowedCopies}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-500 text-xs block">Overdue Books</span>
            <span className={`text-2xl font-bold ${stats.overdueCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {stats.overdueCount}
            </span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-500 text-xs block">Unpaid Fines Total</span>
            <span className="text-2xl font-bold text-rose-700">${stats.totalFinesDue.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Notification Banner */}
      {notification && (
        <div className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
          notification.type === 'success'
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
            : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} className="text-xs font-semibold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Sub-Tab Navigation */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveSubTab('circulation')}
          className={`pb-3 border-b-2 transition ${
            activeSubTab === 'circulation'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Circulation Desk (Issue / Return)
        </button>
        <button
          onClick={() => setActiveSubTab('books')}
          className={`pb-3 border-b-2 transition ${
            activeSubTab === 'books'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Inventory Catalog ({books.length})
        </button>
        <button
          onClick={() => setActiveSubTab('overdue')}
          className={`pb-3 border-b-2 transition ${
            activeSubTab === 'overdue'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Overdue & Fine Collection ({overdueLoans.length})
        </button>
        <button
          onClick={() => setActiveSubTab('members')}
          className={`pb-3 border-b-2 transition ${
            activeSubTab === 'members'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Registered Members ({members.length})
        </button>
      </div>

      {/* 1. CIRCULATION DESK TAB */}
      {activeSubTab === 'circulation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Issue Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-lg text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-600" />
              <span>Issue Book to Member</span>
            </h3>
            <p className="text-xs text-slate-500">
              Select student member and available book to record a 14-day checkout transaction.
            </p>

            <form onSubmit={handleIssueBook} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Member / Student:</label>
                <select
                  value={issueMemberId}
                  onChange={(e) => setIssueMemberId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white text-xs"
                  required
                >
                  <option value="">-- Choose Member --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.member_id} - {m.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Book Title:</label>
                <select
                  value={issueBookId}
                  onChange={(e) => setIssueBookId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white text-xs"
                  required
                >
                  <option value="">-- Choose Book --</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id} disabled={b.available_copies <= 0}>
                      {b.title} [{b.available_copies > 0 ? `${b.available_copies} available` : '0 copies'}]
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-sm transition"
              >
                Issue Book Now
              </button>
            </form>
          </div>

          {/* Recent Circulation Transactions */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-lg text-slate-900 flex items-center justify-between">
              <span>Recent Circulation Transactions</span>
              <span className="text-xs font-normal text-slate-500">Last 10 Records</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Tx ID</th>
                    <th className="py-2.5 px-3">Book Title</th>
                    <th className="py-2.5 px-3">Borrower</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentBorrowings.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">#{tx.id}</td>
                      <td className="py-3 px-3 font-medium text-slate-900 max-w-[200px] truncate">{tx.book_title}</td>
                      <td className="py-3 px-3">{tx.member_name} ({tx.student_code})</td>
                      <td className="py-3 px-3">{tx.due_date}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                          tx.status === 'returned'
                            ? 'bg-slate-100 text-slate-700'
                            : tx.status === 'overdue'
                            ? 'bg-rose-100 text-rose-800 font-bold'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {tx.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {tx.status !== 'returned' && (
                          <button
                            onClick={() => handleReturnBook(tx.id)}
                            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-emerald-600 text-white font-semibold transition"
                          >
                            Return
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. INVENTORY CATALOG MANAGEMENT TAB */}
      {activeSubTab === 'books' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-900">University Catalog Records</h3>
              <p className="text-xs text-slate-500">Edit shelf assignments, call numbers, copies, or delete entries.</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Catalog New Book</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Call No.</th>
                  <th className="py-2.5 px-3">Title & Author</th>
                  <th className="py-2.5 px-3">Shelf Location</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Copies</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-amber-800">{b.call_number}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{b.title}</div>
                      <div className="text-[11px] text-slate-500">{b.author_name} ({b.publication_year})</div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{b.shelf_location}</td>
                    <td className="py-3 px-3">{b.category_name}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded font-bold ${b.available_copies > 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                        {b.available_copies} / {b.total_copies}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <button
                        onClick={() => handleDeleteBook(b.id)}
                        className="text-slate-400 hover:text-rose-600 transition"
                        title="Delete Book"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. OVERDUE & FINE COLLECTION TAB */}
      {activeSubTab === 'overdue' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-lg text-slate-900">
            Overdue Loans & Fine Collection Register
          </h3>
          <p className="text-xs text-slate-500">
            Policy: Overdue loans accrue $0.50/day. Librarians can receive cash/card payment and mark fines as settled.
          </p>

          {overdueLoans.length === 0 ? (
            <div className="p-8 text-center bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs text-emerald-800">
              No overdue loans currently registered! All student accounts are in good standing.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Book Title</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3">Overdue Fine</th>
                    <th className="py-2.5 px-3 text-right">Collect Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overdueLoans.map((ol) => (
                    <tr key={ol.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {ol.member_name} ({ol.student_code})
                      </td>
                      <td className="py-3 px-3">{ol.book_title}</td>
                      <td className="py-3 px-3 font-bold text-rose-700">{ol.due_date}</td>
                      <td className="py-3 px-3 font-bold text-rose-700">
                        ${ol.fine_amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handlePayFine(ol.id)}
                          className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-semibold text-xs transition"
                        >
                          Collect & Clear Fine
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. REGISTERED MEMBERS TAB */}
      {activeSubTab === 'members' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-lg text-slate-900">Registered Library Members</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Member ID</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Quota</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">{m.member_id}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{m.name}</td>
                    <td className="py-3 px-3">{m.email}</td>
                    <td className="py-3 px-3 capitalize font-medium">{m.role}</td>
                    <td className="py-3 px-3">{m.department}</td>
                    <td className="py-3 px-3">{m.max_allowed_books} Books</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {m.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setEditingMember(m);
                          setMemberEditName(m.name);
                          setMemberEditDept(m.department);
                        }}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded text-xs font-semibold transition"
                      >
                        Change Name
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="text-lg font-serif font-bold text-slate-900">Add New Book Record to Library</h3>
            <form onSubmit={handleAddBook} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">Book Title:</label>
                <input
                  type="text"
                  value={newBookForm.title}
                  onChange={(e) => setNewBookForm({ ...newBookForm, title: e.target.value })}
                  placeholder="e.g. Deep Learning Essentials"
                  className="w-full p-2 rounded border border-slate-300"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">Author Name:</label>
                  <input
                    type="text"
                    value={newBookForm.author_name}
                    onChange={(e) => setNewBookForm({ ...newBookForm, author_name: e.target.value })}
                    placeholder="e.g. Ian Goodfellow"
                    className="w-full p-2 rounded border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">ISBN:</label>
                  <input
                    type="text"
                    value={newBookForm.isbn}
                    onChange={(e) => setNewBookForm({ ...newBookForm, isbn: e.target.value })}
                    placeholder="978-0262035613"
                    className="w-full p-2 rounded border border-slate-300"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">Physical Shelf Location:</label>
                  <input
                    type="text"
                    value={newBookForm.shelf_location}
                    onChange={(e) => setNewBookForm({ ...newBookForm, shelf_location: e.target.value })}
                    placeholder="Rack B-12, Shelf 3"
                    className="w-full p-2 rounded border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">Call Number:</label>
                  <input
                    type="text"
                    value={newBookForm.call_number}
                    onChange={(e) => setNewBookForm({ ...newBookForm, call_number: e.target.value })}
                    placeholder="CS.DL.GOO.2024"
                    className="w-full p-2 rounded border border-slate-300"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">Category:</label>
                  <select
                    value={newBookForm.category_name}
                    onChange={(e) => setNewBookForm({ ...newBookForm, category_name: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 bg-white"
                  >
                    <option value="Computer Science & AI">Computer Science & AI</option>
                    <option value="Programming & Web">Programming & Web</option>
                    <option value="Biography & Inspiration">Biography & Inspiration</option>
                    <option value="Literature & Classics">Literature & Classics</option>
                    <option value="History & Philosophy">History & Philosophy</option>
                    <option value="Electronics & Networks">Electronics & Networks</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">Total Copies:</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={newBookForm.total_copies}
                    onChange={(e) => setNewBookForm({ ...newBookForm, total_copies: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">Description:</label>
                <textarea
                  rows={2}
                  value={newBookForm.description}
                  onChange={(e) => setNewBookForm({ ...newBookForm, description: e.target.value })}
                  placeholder="Summary of the book content and course syllabus alignment..."
                  className="w-full p-2 rounded border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded font-semibold text-white transition shadow-sm"
                >
                  Save to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative space-y-4">
            <h3 className="font-serif font-bold text-lg text-slate-900">
              Edit Student / Member Details
            </h3>
            <p className="text-xs text-slate-500">
              Modify student name and department in SNJB COE Library records.
            </p>

            <form onSubmit={handleSaveMember} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student / Member Name:</label>
                <input
                  type="text"
                  value={memberEditName}
                  onChange={(e) => setMemberEditName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department:</label>
                <input
                  type="text"
                  value={memberEditDept}
                  onChange={(e) => setMemberEditDept(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900"
                  required
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
                <span>Member ID: <strong>{editingMember.member_id}</strong> ({editingMember.role})</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-xs transition shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
