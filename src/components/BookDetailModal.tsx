import React from 'react';
import { Book, Member } from '../types';
import { X, MapPin, BookOpen, Bookmark, Calendar, CheckCircle, Clock, Hash, Tag, Building2, HelpCircle } from 'lucide-react';

interface BookDetailModalProps {
  book: Book | null;
  onClose: () => void;
  currentUser: Member | null;
  onBorrow: (bookId: number) => void;
  onReserve: (bookId: number) => void;
  onAskAi: (prompt: string) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  onClose,
  currentUser,
  onBorrow,
  onReserve,
  onAskAi
}) => {
  if (!book) return null;

  const isAvailable = book.available_copies > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header Banner */}
        <div className="relative bg-slate-900 text-white p-6 pb-5 flex items-start justify-between">
          <div className="pr-8">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-block mb-2">
              {book.category_name}
            </span>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-white leading-tight">
              {book.title}
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              By <span className="text-amber-200 font-medium">{book.author_name}</span> • {book.publication_year}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Availability & Location Callout Banner */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isAvailable ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {isAvailable ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Clock className="w-5 h-5 text-amber-600" />
                )}
                <span className={`font-bold text-sm ${isAvailable ? 'text-emerald-900' : 'text-amber-900'}`}>
                  {isAvailable
                    ? `${book.available_copies} of ${book.total_copies} Copies Available in Library`
                    : `All ${book.total_copies} Copies Currently Borrowed`}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {isAvailable
                  ? "Standard undergraduate loan period: 14 days (with up to 2 renewals allowed)."
                  : "Estimated availability upon next return. Place a hold to reserve the next copy."}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {isAvailable ? (
                <button
                  onClick={() => {
                    onBorrow(book.id);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Borrow Now</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    onReserve(book.id);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>Place Reservation Hold</span>
                </button>
              )}
            </div>
          </div>

          {/* Physical Shelf Navigation Location */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>Physical Shelf Location & Call Details</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block mb-0.5">Physical Rack/Shelf:</span>
                <span className="font-semibold text-slate-900 text-sm">{book.shelf_location}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block mb-0.5">Call Number:</span>
                <span className="font-mono font-bold text-amber-700 text-sm">{book.call_number}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block mb-0.5">Edition & Publisher:</span>
                <span className="font-semibold text-slate-900">{book.edition} ({book.publisher})</span>
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Book Synopsis & Syllabus Context
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
              {book.description}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">ISBN Number:</span>
              <span className="font-mono font-medium text-slate-800">{book.isbn}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">Publication Year:</span>
              <span className="font-semibold text-slate-800">{book.publication_year}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">Total Copies:</span>
              <span className="font-semibold text-slate-800">{book.total_copies} Copies</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">Catalog Status:</span>
              <span className="font-semibold text-emerald-700">Verified University Record</span>
            </div>
          </div>

          {/* Ask AI about this book */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/70 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="text-xs font-semibold text-amber-950">Have questions about this book?</p>
                <p className="text-[11px] text-amber-800">Ask SNJB COE Library AI for study recommendations, syllabus fit, or similar titles.</p>
              </div>
            </div>
            <button
              onClick={() => {
                onAskAi(`Tell me more about "${book.title}" and why it is recommended for coursework.`);
                onClose();
              }}
              className="text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition"
            >
              Ask AI Agent
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
