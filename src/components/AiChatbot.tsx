import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX, Sparkles, BookOpen, RefreshCw, Bot, User, CheckCircle2, ShieldCheck, MapPin, AlertCircle, Wrench } from 'lucide-react';
import { Book, ChatMessage, Member } from '../types';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { MicrophoneDiagnosticModal } from './MicrophoneDiagnosticModal';

interface AiChatbotProps {
  currentUser: Member | null;
  onSelectBook: (book: Book) => void;
  onBorrow: (bookId: number) => void;
  onReserve: (bookId: number) => void;
  preloadedPrompt?: string | null;
  onClearPreloadedPrompt?: () => void;
}

const DEFAULT_QUESTIONS = [
  "Do you have books on Artificial Intelligence?",
  "Find books written by A. P. J. Abdul Kalam.",
  "Which programming books are available?",
  "What is the procedure for returning a book?",
  "Recommend some books for learning Java.",
  "What are the library overdue fines and loan periods?"
];

export const AiChatbot: React.FC<AiChatbotProps> = ({
  currentUser,
  onSelectBook,
  onBorrow,
  onReserve,
  preloadedPrompt,
  onClearPreloadedPrompt
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello ${currentUser ? currentUser.name : 'there'}! I am **SNJB COE Library Assistant**, your College of Engineering AI Assistant.\n\nI answer your questions using verified live library records and configured university policies. How can I assist your studies today?`,
      timestamp: 'Just now',
      suggestedQuestions: DEFAULT_QUESTIONS.slice(0, 4)
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showMicDiagnostic, setShowMicDiagnostic] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hook for Web Speech STT and TTS
  const {
    isListening,
    isSpeaking,
    transcript,
    speechSupported,
    synthSupported,
    errorMessage: voiceError,
    autoSpeakReplies,
    permissionState,
    audioLevel,
    setAutoSpeakReplies,
    startListening,
    stopListening,
    testMicrophone,
    speak,
    cancelSpeech
  } = useVoiceAssistant((spokenText) => {
    if (spokenText) {
      setInputText(spokenText);
      handleSendMessage(spokenText);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (preloadedPrompt) {
      handleSendMessage(preloadedPrompt);
      if (onClearPreloadedPrompt) {
        onClearPreloadedPrompt();
      }
    }
  }, [preloadedPrompt]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isLoading) return;

    // Stop ongoing speech
    cancelSpeech();

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Build history for context
      const history = messages.slice(-6).map(m => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        parts: [{ text: m.text }]
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history,
          memberId: currentUser?.id
        })
      });

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || "I couldn't process that query. Please ask the front desk librarian.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        matchedBooks: data.matchedBooks || [],
        suggestedQuestions: data.suggestedQuestions || DEFAULT_QUESTIONS.slice(0, 3),
        intent: data.intent,
        isFallback: data.isFallback
      };

      setMessages(prev => [...prev, aiMsg]);

      // Voice read aloud if enabled
      if (autoSpeakReplies && synthSupported) {
        speak(data.reply);
      }
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "I encountered a communication error with the library system. Please check your network or try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Chat Header */}
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-bold text-lg text-white">SNJB COE Library AI Assistant</h2>
              <span className="flex items-center gap-1 text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Verified Library Grounding</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Grounded on SNJB COE Central Library inventory • Hands-free voice assistant enabled
            </p>
          </div>
        </div>

        {/* Audio & Mic Controls */}
        <div className="flex items-center space-x-2">
          {synthSupported && (
            <button
              onClick={() => {
                if (isSpeaking) {
                  cancelSpeech();
                }
                setAutoSpeakReplies(!autoSpeakReplies);
              }}
              className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                autoSpeakReplies
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title={autoSpeakReplies ? "Voice auto-reading is ON (Click to mute)" : "Voice auto-reading is OFF (Click to unmute)"}
            >
              {autoSpeakReplies ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{autoSpeakReplies ? 'Voice Readout' : 'Muted'}</span>
            </button>
          )}

          <button
            onClick={() => setShowMicDiagnostic(true)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-300 hover:bg-slate-700 transition flex items-center gap-1 text-xs"
            title="Microphone Diagnostic & Troubleshooting"
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Mic Check</span>
          </button>

          <button
            onClick={() => setMessages([
              {
                id: 'welcome-restart',
                sender: 'assistant',
                text: "Chat refreshed. How can I assist your book search, library policies, or study recommendations?",
                timestamp: 'Just now',
                suggestedQuestions: DEFAULT_QUESTIONS.slice(0, 4)
              }
            ])}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Reset Conversation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Voice Active Listening Notification Bar */}
      {isListening && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2.5 flex items-center justify-between text-xs font-semibold animate-pulse">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 animate-bounce" />
            <span>Listening to your voice... Speak clearly into your microphone</span>
            {audioLevel > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-950 text-amber-300 text-[10px] font-mono">
                Volume: {audioLevel}%
              </span>
            )}
          </div>
          <button
            onClick={stopListening}
            className="px-2.5 py-1 bg-slate-900 text-white rounded text-[11px] hover:bg-slate-800 font-semibold"
          >
            Done Speaking
          </button>
        </div>
      )}

      {/* Live Transcript Bubble when recording */}
      {isListening && transcript && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-xs text-amber-900 italic flex items-center gap-2">
          <span className="font-semibold not-italic">Hearing:</span> "{transcript}"
        </div>
      )}

      {/* Voice error notice with 1-click troubleshooter */}
      {voiceError && (
        <div className="bg-amber-50 text-amber-900 px-4 py-2.5 text-xs border-b border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{voiceError}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMicDiagnostic(true)}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded font-semibold text-[11px] transition shadow-xs"
            >
              Open Mic Troubleshooter 🛠️
            </button>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-start gap-3 max-w-[85%]">
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl shadow-sm leading-relaxed text-sm ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}
              >
                {/* Formatted Text */}
                <div className="whitespace-pre-wrap space-y-2">
                  {msg.text.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="leading-relaxed">
                      {paragraph.split('**').map((part, pIdx) =>
                        pIdx % 2 === 1 ? <strong key={pIdx} className="font-semibold text-amber-600">{part}</strong> : part
                      )}
                    </p>
                  ))}
                </div>

                {/* Spoken Audio Re-play button for assistant messages */}
                {msg.sender === 'assistant' && synthSupported && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <button
                      onClick={() => speak(msg.text)}
                      className="flex items-center gap-1 hover:text-amber-700 font-medium transition"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Listen to response</span>
                    </button>
                    <span className="text-[10px]">{msg.timestamp}</span>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-amber-300 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Cited / Matched Books Carousel if any */}
            {msg.matchedBooks && msg.matchedBooks.length > 0 && (
              <div className="mt-3 ml-11 max-w-[90%] w-full">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  <span>Verified Catalog Records ({msg.matchedBooks.length}):</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {msg.matchedBooks.map((b) => (
                    <div
                      key={b.id}
                      className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs hover:border-amber-300 transition flex items-start gap-3"
                    >
                      <img
                        src={b.cover_url}
                        alt={b.title}
                        className="w-14 h-18 object-cover rounded shadow-xs flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 truncate" title={b.title}>
                          {b.title}
                        </h4>
                        <p className="text-[11px] text-slate-600 truncate">by {b.author_name}</p>
                        <div className="flex items-center gap-1 text-[11px] text-amber-800 mt-1">
                          <MapPin className="w-3 h-3 text-amber-600 flex-shrink-0" />
                          <span className="truncate">{b.shelf_location}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            b.available_copies > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {b.available_copies > 0 ? `${b.available_copies} Available` : 'Borrowed'}
                          </span>
                          <button
                            onClick={() => onSelectBook(b)}
                            className="text-[11px] text-amber-700 font-semibold hover:underline"
                          >
                            Inspect →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Follow-up Questions */}
            {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
              <div className="mt-3 ml-11 flex flex-wrap gap-1.5 max-w-[90%]">
                {msg.suggestedQuestions.map((q, qIdx) => (
                  <button
                    key={qIdx}
                    onClick={() => handleSendMessage(q)}
                    className="text-xs bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-300 px-3 py-1.5 rounded-full shadow-xs transition"
                  >
                    💬 {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl text-xs text-slate-600 flex items-center gap-2 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>SNJB COE Library AI is querying library records & formulating response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar & Hands-Free Microphone */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex items-center gap-2">
          {/* Hands-Free Voice Button */}
          <button
            onClick={() => {
              if (isListening) {
                stopListening();
              } else {
                startListening();
              }
            }}
            className={`p-3 rounded-xl transition shadow-sm flex items-center justify-center relative ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
                : 'bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 border border-slate-200'
            }`}
            title={isListening ? "Listening... click to stop" : "Click for voice assistant interaction"}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-amber-700" />}
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening to your voice..." : "Ask: 'Do you have books on AI?', 'Find books by Abdul Kalam', or library rules..."}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm text-slate-900 placeholder-slate-400 bg-slate-50 focus:bg-white transition"
              disabled={isLoading}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="p-3 bg-slate-900 hover:bg-amber-600 text-white rounded-xl transition shadow-sm disabled:opacity-40 disabled:hover:bg-slate-900 flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
          <div className="flex items-center gap-1.5">
            <span>💡 Tip: Click the microphone or use</span>
            <button
              onClick={() => setShowMicDiagnostic(true)}
              className="text-amber-700 font-semibold underline hover:text-amber-800"
            >
              Mic Troubleshooter
            </button>
            <span>if your mic is blocked.</span>
          </div>
          <span>Verified University Database Rules Active</span>
        </div>
      </div>

      {/* Microphone Diagnostic Modal */}
      <MicrophoneDiagnosticModal
        isOpen={showMicDiagnostic}
        onClose={() => setShowMicDiagnostic(false)}
        speechSupported={speechSupported}
        permissionState={permissionState}
        audioLevel={audioLevel}
        errorMessage={voiceError}
        onTestMic={testMicrophone}
        onStartListening={startListening}
      />
    </div>
  );
};
