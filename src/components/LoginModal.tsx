import React, { useState } from 'react';
import { X, User, ShieldCheck, LogIn, UserPlus } from 'lucide-react';
import { Member } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (member: Member) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState<string>('student@university.edu');
  const [password, setPassword] = useState<string>('password123');
  const [role, setRole] = useState<'student' | 'librarian'>('student');

  // Register state
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regDept, setRegDept] = useState<string>('Computer Science');
  const [regPhone, setRegPhone] = useState<string>('+1 (555) 123-4567');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      const data = await res.json();
      if (res.ok) {
        onLoginSuccess(data.member);
        onClose();
      } else {
        setError(data.error || "Authentication failed.");
      }
    } catch (e) {
      setError("Network error connecting to login server.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          department: regDept,
          phone: regPhone,
          password: 'password123'
        })
      });
      const data = await res.json();
      if (res.ok) {
        onLoginSuccess(data.member);
        onClose();
      } else {
        setError(data.error || "Registration failed.");
      }
    } catch (e) {
      setError("Network error connecting to registration server.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoSelect = (selectedRole: 'student' | 'librarian', studentEmail?: string) => {
    if (selectedRole === 'student') {
      setEmail(studentEmail || 'student@university.edu');
      setPassword('password123');
      setRole('student');
    } else {
      setEmail('librarian@university.edu');
      setPassword('adminpassword');
      setRole('librarian');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Demo Fast Track Banner */}
        <div className="mb-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 p-3.5 rounded-xl">
          <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block mb-1.5">
            ⚡ 1-Click Demo Profiles for Testing
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickDemoSelect('student', 'student@university.edu')}
              className="p-2 rounded-lg bg-white border border-amber-200 hover:border-amber-400 text-left transition shadow-xs"
            >
              <div className="font-bold text-slate-900 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-amber-600" />
                <span>Arpita (Student)</span>
              </div>
              <span className="text-[10px] text-slate-500">STU-101 (Has Overdue)</span>
            </button>

            <button
              onClick={() => handleQuickDemoSelect('librarian')}
              className="p-2 rounded-lg bg-white border border-amber-200 hover:border-amber-400 text-left transition shadow-xs"
            >
              <div className="font-bold text-slate-900 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Dr. Vance (Admin)</span>
              </div>
              <span className="text-[10px] text-slate-500">LIB-001 (Desk Staff)</span>
            </button>
          </div>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-200 mb-4 text-xs font-semibold">
          <button
            onClick={() => setTab('signin')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 ${
              tab === 'signin' ? 'border-amber-600 text-amber-800' : 'border-transparent text-slate-400'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            onClick={() => setTab('register')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 ${
              tab === 'register' ? 'border-amber-600 text-amber-800' : 'border-transparent text-slate-400'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Student Registration</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs">
            {error}
          </div>
        )}

        {tab === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Account Type:</label>
              <div className="grid grid-cols-2 gap-2">
                <label className={`p-2 rounded-lg border text-center cursor-pointer transition ${
                  role === 'student' ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold' : 'border-slate-200 text-slate-600'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={role === 'student'}
                    onChange={() => setRole('student')}
                    className="sr-only"
                  />
                  <span>Student Card</span>
                </label>
                <label className={`p-2 rounded-lg border text-center cursor-pointer transition ${
                  role === 'librarian' ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold' : 'border-slate-200 text-slate-600'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="librarian"
                    checked={role === 'librarian'}
                    onChange={() => setRole('librarian')}
                    className="sr-only"
                  />
                  <span>Librarian Staff</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-amber-600 text-white font-semibold rounded-xl transition shadow-sm mt-2 disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Authenticate & Open Dashboard"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-0.5">Full Name:</label>
              <input
                type="text"
                placeholder="e.g. Jordan Smith"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-0.5">Student University Email:</label>
              <input
                type="email"
                placeholder="jordan@university.edu"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-0.5">Academic Department:</label>
              <input
                type="text"
                placeholder="Computer Science & Engineering"
                value={regDept}
                onChange={(e) => setRegDept(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-0.5">Contact Phone:</label>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl transition shadow-sm mt-2 disabled:opacity-50"
            >
              {loading ? "Registering..." : "Create Student Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
