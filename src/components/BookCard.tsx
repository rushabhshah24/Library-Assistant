import React from 'react';
import { Book, Member } from '../types';
import { MapPin, BookOpen, CheckCircle, Clock, AlertTriangle, Bookmark, BookmarkCheck } from 'lucide-react';

interface BookCardProps {
  book: Book;
  currentUser: Member | null;
  onSelectBook: (book: Book) => void;
  onBorrow: (bookId: number) => void;
  onReserve: (bookId: number) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  currentUser,
  onSelectBook,
  onBorrow,
  onReserve
}) => {
  const isAvailable = book.available_copies > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div>
        {/* Card Header & Cover Banner */}
        <div className="relative h-44 bg-slate-900 overflow-hidden cursor-pointer" onClick={() => onSelectBook(book)}>
          <img
            src={book.cover_url}
            alt={book.title}
            className="w-full h-full object-cover opacity-85 group-hover:scale-105 group-hover:opacity-95 transition-all duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          {/* Availability Badge */}
          <div className="absolute top-3 right-3">
            {isAvailable ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 text-white shadow-sm backdrop-blur-sm">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{book.available_copies} of {book.total_copies} Available</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/90 text-white shadow-sm backdrop-blur-sm">
                <Clock className="w-3.5 h-3.5" />
                <span>All Checked Out</span>
              </span>
            )}
          </div>

          {/* Call number overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200 font-mono">
            <span className="bg-slate-900/80 backdrop-blur-sm px-2 py-0.5 rounded border border-slate-700/60 text-amber-300">
              {book.call_number}
            </span>
            <span className="text-[11px] text-slate-300 truncate max-w-[140px]">
              {book.edition}
            </span>
          </div>
        </div>

        {/* Book Information Content */}
        <div className="p-4 cursor-pointer" onClick={() => onSelectBook(book)}>
          <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider mb-1">
            {book.category_name}
          </div>
          <h3 className="font-serif font-bold text-slate-900 text-base leading-snug group-hover:text-amber-700 transition line-clamp-2">
            {book.title}
          </h3>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            by {book.author_name}
          </p>

          {/* Shelf location */}
          <div className="mt-3.5 flex items-center gap-2 p-2 rounded-lg bg-amber-50/70 border border-amber-200/50 text-xs text-amber-950">
            <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span className="font-semibold">{book.shelf_location}</span>
          </div>

          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
            {book.description}
          </p>
        </div>
      </div>

      {/* Card Footer & Action Buttons */}
      <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2 mt-2">
        <button
          onClick={() => onSelectBook(book)}
          className="text-xs text-slate-600 hover:text-slate-900 font-medium px-2 py-1.5 rounded transition"
        >
          View Details
        </button>

        {isAvailable ? (
          <button
            onClick={() => onBorrow(book.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Borrow Book</span>
          </button>
        ) : (
          <button
            onClick={() => onReserve(book.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Reserve Hold</span>
          </button>
        )}
      </div>
    </div>
  );
};
