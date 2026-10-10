import React, { useState } from 'react';
import { X, Mic, CheckCircle2, AlertTriangle, ShieldAlert, RefreshCw, Volume2, HelpCircle, Laptop } from 'lucide-react';
import { MicPermissionState } from '../hooks/useVoiceAssistant';

interface MicrophoneDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  speechSupported: boolean;
  permissionState: MicPermissionState;
  audioLevel: number;
  errorMessage: string | null;
  onTestMic: () => Promise<{ success: boolean; message: string }>;
  onStartListening: () => void;
}

export const MicrophoneDiagnosticModal: React.FC<MicrophoneDiagnosticModalProps> = ({
  isOpen,
  onClose,
  speechSupported,
  permissionState,
  audioLevel,
  errorMessage,
  onTestMic,
  onStartListening
}) => {
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleRunTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await onTestMic();
    setTestResult(res);
    setIsTesting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-slate-900">
              Microphone Diagnostic & Troubleshooting
            </h3>
            <p className="text-xs text-slate-500">
              Fix browser permissions and test your microphone input
            </p>
          </div>
        </div>

        {/* Live Diagnostics Status Cards */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[11px] mb-1">Browser Speech Engine:</span>
            <div className="flex items-center gap-1.5 font-bold">
              {speechSupported ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Supported (Web Speech)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-700">Not Supported (Use Chrome/Edge)</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[11px] mb-1">Microphone Permission:</span>
            <div className="flex items-center gap-1.5 font-bold">
              {permissionState === 'granted' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Allowed</span>
                </>
              ) : permissionState === 'denied' ? (
                <>
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span className="text-rose-700">Blocked / Denied</span>
                </>
              ) : (
                <>
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-700">Needs User Prompt</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Live Audio Volume Meter */}
        <div className="p-3.5 bg-slate-900 rounded-xl text-white space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>Real-Time Microphone Input Level:</span>
            </span>
            <span className="font-mono text-amber-400 font-bold">{audioLevel}%</span>
          </div>
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-75 ${
                audioLevel > 50 ? 'bg-emerald-500' : audioLevel > 15 ? 'bg-amber-400' : 'bg-slate-600'
              }`}
              style={{ width: `${Math.max(4, audioLevel)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 italic">
            {audioLevel > 0
              ? "✓ Microphone is receiving sound!"
              : "Speak into your mic after granting permission to see the green bar move."}
          </p>
        </div>

        {/* Error Callout if any */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Detected Issue:</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* How to Fix Common Reasons */}
        <div className="space-y-2.5 text-xs">
          <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
            Common Reasons & How to Enable:
          </h4>
          <ol className="space-y-2 text-slate-600 list-decimal list-inside bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <li>
              <strong>Browser Blocked in Address Bar:</strong> Click the <strong>lock icon 🔒</strong> or <strong>camera icon 📹</strong> located at the very left of your browser URL bar. Change <strong>Microphone</strong> from <em>Block</em> to <strong>Allow</strong>.
            </li>
            <li>
              <strong>Browser Compatibility:</strong> Chrome, Edge, and Safari have full native support for Web Speech API. If you are using Firefox, speech recognition is disabled by default.
            </li>
            <li>
              <strong>Operating System Privacy:</strong> On Windows, go to <em>Settings → Privacy → Microphone</em> and enable "Allow desktop apps to access your microphone". On macOS, check <em>System Settings → Privacy & Security → Microphone</em>.
            </li>
            <li>
              <strong>Headset / Input Selection:</strong> Verify your headset or microphone isn't physically muted or selected incorrectly in system settings.
            </li>
          </ol>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div className={`p-3 rounded-xl border text-xs font-semibold ${
            testResult.success
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}>
            {testResult.message}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
          <button
            onClick={handleRunTest}
            disabled={isTesting}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? "Testing Mic..." : "Request & Test Permission"}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onStartListening();
            }}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold transition shadow-sm flex items-center gap-1.5"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Start Voice Assistant</span>
          </button>
        </div>
      </div>
    </div>
  );
};
