import React, { useState, useEffect } from 'react';
import { Database, Download, Copy, Check, RefreshCw, Key, Link2, Table, FileCode } from 'lucide-react';

interface DatabaseExplorerProps {
  onRefreshAllData: () => void;
}

export const DatabaseExplorer: React.FC<DatabaseExplorerProps> = ({ onRefreshAllData }) => {
  const [sqlContent, setSqlContent] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'script' | 'erd' | 'tables'>('script');
  const [selectedTable, setSelectedTable] = useState<string>('books');
  const [tableData, setTableData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/database/sql-schema')
      .then(res => res.json())
      .then(data => {
        setSqlContent(data.sql || '');
        setIsLoading(false);
      })
      .catch(e => {
        console.error(e);
        setIsLoading(false);
      });
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([sqlContent], { type: 'text/sql' });
    element.href = URL.createObjectURL(file);
    element.download = "snjb_coe_library_system.sql";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleResetData = async () => {
    if (!window.confirm("Reset all library database tables back to verified sample records?")) return;
    try {
      const res = await fetch('/api/database/reset', { method: 'POST' });
      const data = await res.json();
      setResetMessage(data.message);
      onRefreshAllData();
      setTimeout(() => setResetMessage(null), 3500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <Database className="w-3.5 h-3.5" />
              <span>Relational MySQL 8.0 Architecture</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Database Schema & SQL Setup Script
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Complete DDL/DML setup scripts, foreign key integrity definitions, and sample records for college project evaluation and deployment.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
            <span>{copied ? 'Copied SQL!' : 'Copy Script'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download .sql File</span>
          </button>
          <button
            onClick={handleResetData}
            className="px-3.5 py-2 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-semibold border border-rose-700/60 transition flex items-center gap-1.5"
            title="Reset to initial state"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Sample Data</span>
          </button>
        </div>
      </div>

      {resetMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-semibold">
          {resetMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('script')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'script' ? 'border-amber-600 text-amber-700' : 'border-transparent text-slate-500'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Full MySQL DDL & DML Script</span>
        </button>
        <button
          onClick={() => setActiveTab('erd')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'erd' ? 'border-amber-600 text-amber-700' : 'border-transparent text-slate-500'
          }`}
        >
          <Link2 className="w-4 h-4" />
          <span>Entity-Relationship Architecture</span>
        </button>
      </div>

      {/* Tab 1: SQL Script View */}
      {activeTab === 'script' && (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 overflow-hidden shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs text-slate-400">
            <span className="font-mono">schema.sql • MySQL 8.0 / MariaDB Compatible</span>
            <span>UTF-8 Unicode • Foreign Keys Enforced</span>
          </div>
          <pre className="mt-4 p-4 text-xs font-mono text-emerald-400 bg-slate-900/90 rounded-xl overflow-x-auto max-h-[600px] leading-relaxed select-all">
            {sqlContent || "-- Loading SQL schema script..."}
          </pre>
        </div>
      )}

      {/* Tab 2: ERD & Table Specifications */}
      {activeTab === 'erd' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Table: books */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b pb-2 border-slate-100">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Table className="w-4 h-4 text-amber-600" />
                <span>books</span>
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono">Catalog Table</span>
            </div>
            <ul className="text-xs space-y-1.5 font-mono text-slate-700">
              <li className="flex items-center justify-between text-amber-800 font-bold">
                <span>id INT</span>
                <span className="text-[10px] bg-amber-50 px-1 border border-amber-200 rounded">PRIMARY KEY</span>
              </li>
              <li>isbn VARCHAR(20) UNIQUE</li>
              <li>title VARCHAR(300) NOT NULL</li>
              <li className="text-indigo-700">author_id INT (FK → authors.id)</li>
              <li className="text-indigo-700">category_id INT (FK → categories.id)</li>
              <li>shelf_location VARCHAR(100)</li>
              <li>call_number VARCHAR(50)</li>
              <li>total_copies INT</li>
              <li>available_copies INT</li>
            </ul>
          </div>

          {/* Table: members */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b pb-2 border-slate-100">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Table className="w-4 h-4 text-amber-600" />
                <span>members</span>
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono">Users & Roles</span>
            </div>
            <ul className="text-xs space-y-1.5 font-mono text-slate-700">
              <li className="flex items-center justify-between text-amber-800 font-bold">
                <span>id INT</span>
                <span className="text-[10px] bg-amber-50 px-1 border border-amber-200 rounded">PRIMARY KEY</span>
              </li>
              <li>member_id VARCHAR(50) UNIQUE</li>
              <li>name VARCHAR(200)</li>
              <li>email VARCHAR(255) UNIQUE</li>
              <li>role ENUM('student','librarian')</li>
              <li>department VARCHAR(150)</li>
              <li>max_allowed_books INT</li>
              <li>status ENUM('active','suspended')</li>
            </ul>
          </div>

          {/* Table: borrowings */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b pb-2 border-slate-100">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Table className="w-4 h-4 text-emerald-600" />
                <span>borrowings</span>
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">Transactions</span>
            </div>
            <ul className="text-xs space-y-1.5 font-mono text-slate-700">
              <li className="flex items-center justify-between text-amber-800 font-bold">
                <span>id INT</span>
                <span className="text-[10px] bg-amber-50 px-1 border border-amber-200 rounded">PRIMARY KEY</span>
              </li>
              <li className="text-indigo-700">book_id INT (FK → books.id)</li>
              <li className="text-indigo-700">member_id INT (FK → members.id)</li>
              <li>issue_date DATE</li>
              <li>due_date DATE</li>
              <li>return_date DATE NULL</li>
              <li>renewal_count INT DEFAULT 0</li>
              <li>status ENUM('active','returned','overdue')</li>
              <li>fine_amount DECIMAL(8,2)</li>
            </ul>
          </div>

          {/* Table: reservations */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b pb-2 border-slate-100">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Table className="w-4 h-4 text-indigo-600" />
                <span>reservations</span>
              </span>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-mono">Hold Queue</span>
            </div>
            <ul className="text-xs space-y-1.5 font-mono text-slate-700">
              <li className="flex items-center justify-between text-amber-800 font-bold">
                <span>id INT</span>
                <span className="text-[10px] bg-amber-50 px-1 border border-amber-200 rounded">PRIMARY KEY</span>
              </li>
              <li className="text-indigo-700">book_id INT (FK → books.id)</li>
              <li className="text-indigo-700">member_id INT (FK → members.id)</li>
              <li>reservation_date DATE</li>
              <li>status ENUM('waiting','ready','fulfilled')</li>
              <li>queue_position INT</li>
            </ul>
          </div>

          {/* Table: categories */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b pb-2 border-slate-100">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Table className="w-4 h-4 text-purple-600" />
                <span>categories</span>
              </span>
              <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-mono">Floor Sections</span>
            </div>
            <ul className="text-xs space-y-1.5 font-mono text-slate-700">
              <li className="flex items-center justify-between text-amber-800 font-bold">
                <span>id INT</span>
                <span className="text-[10px] bg-amber-50 px-1 border border-amber-200 rounded">PRIMARY KEY</span>
              </li>
              <li>name VARCHAR(150) UNIQUE</li>
              <li>slug VARCHAR(150) UNIQUE</li>
              <li>floor_section VARCHAR(100)</li>
              <li>description TEXT</li>
            </ul>
          </div>

          {/* Table: authors */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b pb-2 border-slate-100">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Table className="w-4 h-4 text-rose-600" />
                <span>authors</span>
              </span>
              <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-mono">Biographies</span>
            </div>
            <ul className="text-xs space-y-1.5 font-mono text-slate-700">
              <li className="flex items-center justify-between text-amber-800 font-bold">
                <span>id INT</span>
                <span className="text-[10px] bg-amber-50 px-1 border border-amber-200 rounded">PRIMARY KEY</span>
              </li>
              <li>name VARCHAR(255) NOT NULL</li>
              <li>nationality VARCHAR(100)</li>
              <li>biography TEXT</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
