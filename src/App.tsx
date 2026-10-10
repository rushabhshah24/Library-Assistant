import React, { useState, useEffect } from 'react';
import { Book, Member } from './types';
import { Navbar } from './components/Navbar';
import { BookCard } from './components/BookCard';
import { BookDetailModal } from './components/BookDetailModal';
import { AiChatbot } from './components/AiChatbot';
import { StudentDashboard } from './components/StudentDashboard';
import { LibrarianDashboard } from './components/LibrarianDashboard';
import { LibraryPolicies } from './components/LibraryPolicies';
import { DatabaseExplorer } from './components/DatabaseExplorer';
import { DemonstrationGuide } from './components/DemonstrationGuide';
import { LoginModal } from './components/LoginModal';
import { Search, Sparkles, Mic, BookOpen, CheckCircle, Clock, Filter, Layers, HelpCircle, Volume2, ArrowRight } from 'lucide-react';
import { useVoiceAssistant } from './hooks/useVoiceAssistant';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('catalog');
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Pre-authenticated default student for frictionless evaluation
  const [currentUser, setCurrentUser] = useState<Member | null>({
    id: 1,
    member_id: "STU-2024-101",
    name: "Arpita Shah",
    email: "student@university.edu",
    role: "student",
    department: "Computer Engineering",
    max_allowed_books: 3,
    status: "active",
    phone: "+91 98765 43210"
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [preloadedAiPrompt, setPreloadedAiPrompt] = useState<string | null>(null);

  // Voice assistant for catalog quick-search
  const {
    isListening: isCatalogListening,
    startListening: startCatalogVoice,
    stopListening: stopCatalogVoice
  } = useVoiceAssistant((spoken) => {
    if (spoken) {
      setSearchQuery(spoken);
      showToast(`Voice query: "${spoken}"`);
    }
  });

  const fetchBooks = async () => {
    try {
      let url = '/api/books';
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [searchQuery, selectedCategory, selectedStatus]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleBorrow = async (bookId: number) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    try {
      const res = await fetch('/api/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, memberId: currentUser.id })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, 'success');
        fetchBooks();
      } else {
        showToast(data.error || "Borrow failed.", 'error');
      }
    } catch (e) {
      showToast("Network error during borrow operation.", 'error');
    }
  };

  const handleReserve = async (bookId: number) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    try {
      const res = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, memberId: currentUser.id })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, 'success');
        fetchBooks();
      } else {
        showToast(data.error || "Reserve failed.", 'error');
      }
    } catch (e) {
      showToast("Network error placing reservation.", 'error');
    }
  };

  const handleAskAi = (promptText?: string) => {
    if (promptText) {
      setPreloadedAiPrompt(promptText);
    }
    setCurrentTab('ai-chat');
  };

  const handleQuickLogin = (role: 'student' | 'librarian') => {
    if (role === 'student') {
      setCurrentUser({
        id: 1,
        member_id: "STU-2024-101",
        name: "Arpita Shah",
        email: "student@university.edu",
        role: "student",
        department: "Computer Engineering",
        max_allowed_books: 3,
        status: "active",
        phone: "+91 98765 43210"
      });
      showToast("Switched profile to Arpita Shah (Student)");
    } else {
      setCurrentUser({
        id: 3,
        member_id: "LIB-2024-001",
        name: "Dr. Eleanor Vance",
        email: "librarian@university.edu",
        role: "librarian",
        department: "Library Services & Archives",
        max_allowed_books: 15,
        status: "active",
        phone: "+1 (555) 987-6543"
      });
      showToast("Switched profile to Dr. Eleanor Vance (Head Librarian)");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-900 selection:bg-amber-100 selection:text-amber-900">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold flex items-center gap-2 ${
            toastMessage.type === 'success'
              ? 'bg-slate-900 text-white border-slate-700'
              : 'bg-rose-600 text-white border-rose-500'
          }`}>
            <CheckCircle className="w-4 h-4 text-amber-400" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={() => {
          setCurrentUser(null);
          showToast("Signed out. You can sign in anytime.");
        }}
        onSwitchUser={setCurrentUser}
        isVoiceActive={isCatalogListening}
      />

      {/* Main Content Viewports */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 1. BOOK CATALOG TAB */}
        {currentTab === 'catalog' && (
          <div className="space-y-8 animate-fade-in">
            {/* Hero Welcome Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-800">
              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>SNJB COE Central Library Management</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
                  Discover Books. Check Shelf Locations. Powered by AI.
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                  Ask SNJB COE Library AI naturally, explore our verified engineering catalog with real-time copy counts, physical rack locations (e.g. Rack A-14), and hands-free voice assistance.
                </p>

                {/* Quick AI Suggestion Chips */}
                <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium">Try asking AI:</span>
                  <button
                    onClick={() => handleAskAi("Find books written by A. P. J. Abdul Kalam.")}
                    className="bg-slate-800/80 hover:bg-amber-600 hover:text-white text-slate-200 border border-slate-700/80 px-3 py-1.5 rounded-full transition"
                  >
                    "Books by Abdul Kalam"
                  </button>
                  <button
                    onClick={() => handleAskAi("Do you have books on Artificial Intelligence?")}
                    className="bg-slate-800/80 hover:bg-amber-600 hover:text-white text-slate-200 border border-slate-700/80 px-3 py-1.5 rounded-full transition"
                  >
                    "Books on AI"
                  </button>
                  <button
                    onClick={() => handleAskAi("Recommend some books for learning Java.")}
                    className="bg-slate-800/80 hover:bg-amber-600 hover:text-white text-slate-200 border border-slate-700/80 px-3 py-1.5 rounded-full transition"
                  >
                    "Java Recommendations"
                  </button>
                </div>
              </div>

              {/* Decorative Background Elements */}
              <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Catalog Search & Filters Bar */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by book title, author (e.g. Kalam), ISBN, category, or call number..."
                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-slate-50 focus:bg-white text-slate-900 transition"
                  />
                  {/* Voice input button in search bar */}
                  <button
                    onClick={() => isCatalogListening ? stopCatalogVoice() : startCatalogVoice()}
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition ${
                      isCatalogListening
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'text-slate-400 hover:text-amber-700 hover:bg-slate-100'
                    }`}
                    title={isCatalogListening ? "Listening... click to stop" : "Speak to search"}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>

                {/* Availability Filter Dropdown */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="all">All Availability Statuses</option>
                    <option value="available">Available on Shelf Only</option>
                    <option value="borrowed">Currently Borrowed Only</option>
                  </select>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Category:</span>
                </span>
                {[
                  { label: "All Subjects", val: "all" },
                  { label: "Computer Science & AI", val: "Computer Science & AI" },
                  { label: "Programming & Web", val: "Programming & Web" },
                  { label: "Biography & Inspiration", val: "Biography & Inspiration" },
                  { label: "Literature & Classics", val: "Literature & Classics" },
                  { label: "History & Philosophy", val: "History & Philosophy" },
                  { label: "Electronics & Networks", val: "Electronics & Networks" }
                ].map((cat) => (
                  <button
                    key={cat.val}
                    onClick={() => setSelectedCategory(cat.val)}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition font-medium ${
                      selectedCategory === cat.val
                        ? 'bg-slate-900 text-white font-semibold shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Books Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
                <span>Showing <strong>{books.length}</strong> catalog records</span>
                <span>Verified physical collection • SNJB COE Central Library</span>
              </div>

              {books.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
                  <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
                  <h3 className="text-base font-serif font-bold text-slate-800">No matching books found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try searching for author keywords like "Kalam", subjects like "Java" or "AI", or reset your filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedStatus('all');
                    }}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-amber-600 transition"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {books.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      currentUser={currentUser}
                      onSelectBook={setSelectedBook}
                      onBorrow={handleBorrow}
                      onReserve={handleReserve}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. AI ASSISTANT CHAT TAB */}
        {currentTab === 'ai-chat' && (
          <div className="animate-fade-in">
            <AiChatbot
              currentUser={currentUser}
              onSelectBook={setSelectedBook}
              onBorrow={handleBorrow}
              onReserve={handleReserve}
              preloadedPrompt={preloadedAiPrompt}
              onClearPreloadedPrompt={() => setPreloadedAiPrompt(null)}
            />
          </div>
        )}

        {/* 3. STUDENT PORTAL TAB */}
        {currentTab === 'student' && (
          <StudentDashboard
            currentUser={currentUser}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onSelectBook={setSelectedBook}
            onNavigateToCatalog={() => setCurrentTab('catalog')}
            onNavigateToAi={handleAskAi}
            onUpdateUser={setCurrentUser}
          />
        )}

        {/* 4. LIBRARIAN DESK TAB */}
        {currentTab === 'librarian' && (
          <LibrarianDashboard
            currentUser={currentUser}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            books={books}
            onRefreshBooks={fetchBooks}
            onOpenSqlTab={() => setCurrentTab('database')}
          />
        )}

        {/* 5. POLICIES & HANDBOOK TAB */}
        {currentTab === 'policies' && (
          <LibraryPolicies />
        )}

        {/* 6. DATABASE SCHEMA & SQL SCRIPT TAB */}
        {currentTab === 'database' && (
          <DatabaseExplorer onRefreshAllData={fetchBooks} />
        )}

        {/* 7. DEMONSTRATION SCENARIOS FOR COLLEGE EVALUATION */}
        {currentTab === 'demo' && (
          <DemonstrationGuide
            onRunAiQuery={handleAskAi}
            onNavigateTab={setCurrentTab}
            onQuickLogin={handleQuickLogin}
          />
        )}
      </main>

      {/* Book Detail Modal */}
      <BookDetailModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        currentUser={currentUser}
        onBorrow={handleBorrow}
        onReserve={handleReserve}
        onAskAi={handleAskAi}
      />

      {/* Login & Registration Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(member) => {
          setCurrentUser(member);
          showToast(`Welcome, ${member.name}! Signed in as ${member.role}.`);
        }}
      />
    </div>
  );
}
