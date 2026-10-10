import React from 'react';
import { PlayCircle, CheckCircle, Sparkles, Mic, BookOpen, Clock, ShieldCheck, Database, ArrowRight } from 'lucide-react';
import { Member } from '../types';

interface DemonstrationGuideProps {
  onRunAiQuery: (query: string) => void;
  onNavigateTab: (tab: string) => void;
  onQuickLogin: (role: 'student' | 'librarian') => void;
}

export const DemonstrationGuide: React.FC<DemonstrationGuideProps> = ({
  onRunAiQuery,
  onNavigateTab,
  onQuickLogin
}) => {
  const SCENARIOS = [
    {
      id: 1,
      title: "Scenario 1: Author & Inventory Discovery",
      tag: "AI Grounded Query",
      prompt: "Find books written by A. P. J. Abdul Kalam.",
      description: "Demonstrates natural language search for specific authors without hallucinating non-existent books. Returns verified shelf locations ('Rack C-02, Shelf 3') and availability.",
      expected: "Assistant returns 'Wings of Fire' and 'Ignited Minds', citing exact call numbers, shelf locations, and available copies.",
      actionLabel: "Test Kalam Query in AI Assistant",
      onExecute: () => {
        onRunAiQuery("Find books written by A. P. J. Abdul Kalam.");
        onNavigateTab('ai-chat');
      }
    },
    {
      id: 2,
      title: "Scenario 2: Java Textbook Recommendations",
      tag: "Academic Advisory",
      prompt: "Recommend some books for learning Java.",
      description: "Demonstrates curriculum-aligned book recommendations distinguishing beginner syntax references from advanced software engineering best practices.",
      expected: "Recommends 'Java: The Complete Reference' by Herbert Schildt and 'Effective Java' by Joshua Bloch with shelf numbers.",
      actionLabel: "Test Java Recommendation",
      onExecute: () => {
        onRunAiQuery("Recommend some books for learning Java.");
        onNavigateTab('ai-chat');
      }
    },
    {
      id: 3,
      title: "Scenario 3: Book Availability & Hold Reservations",
      tag: "Circulation Rules",
      prompt: "Can I borrow Clean Code? What is its availability status?",
      description: "Tests strict factual safety: Clean Code currently has 0 available copies on shelf. The AI refuses to invent available copies and guides user to reserve hold.",
      expected: "Assistant confirms 0 copies available on shelf, provides call number 'CS.SE.MAR.2008', and advises placing a reservation waitlist hold.",
      actionLabel: "Check Clean Code Status",
      onExecute: () => {
        onRunAiQuery("Can I borrow Clean Code? What is its availability status?");
        onNavigateTab('ai-chat');
      }
    },
    {
      id: 4,
      title: "Scenario 4: Hands-Free Voice Accessibility",
      tag: "Voice Assistant (STT + TTS)",
      prompt: "What is the procedure for returning a book?",
      description: "Demonstrates Web Speech Recognition for spoken queries and SpeechSynthesis for clear audio readouts for accessibility.",
      expected: "Live audio waveform, voice recognition, and spoken response detailing the 24/7 return drop-box and fine policies.",
      actionLabel: "Open Voice Assistant",
      onExecute: () => {
        onRunAiQuery("What is the procedure for returning a book?");
        onNavigateTab('ai-chat');
      }
    },
    {
      id: 5,
      title: "Scenario 5: Student Due Dates, Renewal & Fines",
      tag: "Student Dashboard",
      prompt: "Manage loans & renewals",
      description: "Logs in as Student Arpita Shah. Shows overdue loan for Clean Code ($3.00 accrued fine at $0.50/day), active loan for AI Modern Approach, and 1-click renewal.",
      expected: "Displays countdowns, renewal limit checks (maximum 2 renewals), and overdue fine calculator.",
      actionLabel: "Login as Student Arpita & Open Portal",
      onExecute: () => {
        onQuickLogin('student');
        onNavigateTab('student');
      }
    },
    {
      id: 6,
      title: "Scenario 6: Librarian Circulation & Database Script",
      tag: "Administration & SQL",
      prompt: "Admin desk operations",
      description: "Logs in as Head Librarian Dr. Eleanor Vance. Issues books, collects overdue fines, adds new catalog items, and exports MySQL 8.0 schema scripts.",
      expected: "Circulation transaction register, inventory management, and full downloadable `schema.sql` file.",
      actionLabel: "Login as Librarian & Open Desk",
      onExecute: () => {
        onQuickLogin('librarian');
        onNavigateTab('librarian');
      }
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Hero Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Interactive College Project Evaluation Suite</span>
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
          Demonstration Scenarios & Test Cases
        </h1>
        <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
          Use these one-click test cases to review each required feature of the AI-Powered Library Assistant: AI grounding, speech accessibility, real-time availability checks, circulation rules, student/librarian dashboards, and MySQL database scripts.
        </p>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SCENARIOS.map((sc) => (
          <div
            key={sc.id}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                  {sc.tag}
                </span>
                <span className="font-mono text-xs font-bold text-slate-400">
                  Case #{sc.id}
                </span>
              </div>

              <h3 className="font-serif font-bold text-slate-900 text-base leading-snug">
                {sc.title}
              </h3>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 italic">
                "{sc.prompt}"
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {sc.description}
              </p>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-700 block mb-1">Expected Result:</span>
                <p className="text-[11px] text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100 leading-relaxed">
                  {sc.expected}
                </p>
              </div>
            </div>

            <button
              onClick={sc.onExecute}
              className="mt-5 w-full py-2.5 px-4 bg-slate-900 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold transition shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>{sc.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
