import { useState, useEffect, useRef, useCallback } from 'react';

// Window declaration for Web Speech API
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

export type MicPermissionState = 'prompt' | 'granted' | 'denied' | 'unknown';

export function useVoiceAssistant(onSpeechResult?: (transcript: string) => void) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const [synthSupported, setSynthSupported] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);
  const [autoSpeakReplies, setAutoSpeakReplies] = useState<boolean>(true);
  const [permissionState, setPermissionState] = useState<MicPermissionState>('unknown');
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Check initial permissions if query is available
  useEffect(() => {
    if (typeof navigator !== 'undefined' && (navigator as any).permissions) {
      try {
        (navigator as any).permissions
          .query({ name: 'microphone' })
          .then((permissionStatus: any) => {
            setPermissionState(permissionStatus.state);
            permissionStatus.onchange = () => {
              setPermissionState(permissionStatus.state);
              if (permissionStatus.state === 'granted') {
                setErrorMessage(null);
                setErrorType(null);
              }
            };
          })
          .catch(() => {
            setPermissionState('unknown');
          });
      } catch {
        setPermissionState('unknown');
      }
    }
  }, []);

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSynthSupported(true);
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setErrorMessage(null);
          setErrorType(null);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);

          const lastResult = event.results[event.results.length - 1];
          if (lastResult.isFinal) {
            if (onSpeechResult && currentTranscript.trim()) {
              onSpeechResult(currentTranscript.trim());
            }
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
          stopAudioAnalyser();

          setErrorType(event.error);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setPermissionState('denied');
            setErrorMessage(
              "Microphone permission blocked. Please click the lock or camera icon in your browser address bar and select 'Allow' for Microphone."
            );
          } else if (event.error === 'network') {
            setErrorMessage(
              "Web Speech service network issue. Please check your internet connection or use text input."
            );
          } else if (event.error === 'audio-capture') {
            setErrorMessage(
              "No microphone hardware found. Please plug in or connect an audio input device."
            );
          } else if (event.error !== 'no-speech') {
            setErrorMessage(`Microphone issue (${event.error}). Please check browser permissions.`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          stopAudioAnalyser();
        };

        recognitionRef.current = recognition;
      } catch (e) {
        console.warn("Failed to instantiate speech recognition:", e);
      }
    } else {
      setSpeechSupported(false);
      setErrorMessage("Speech Recognition is not supported on this browser. Google Chrome or Microsoft Edge is recommended.");
    }

    return () => {
      stopAudioAnalyser();
    };
  }, [onSpeechResult]);

  const startAudioAnalyser = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setPermissionState('granted');

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (err: any) {
      console.warn("Audio analyser error / permission denied:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionState('denied');
        setErrorMessage(
          "Microphone permission was denied. Please allow microphone access in your browser address bar."
        );
      }
    }
  };

  const stopAudioAnalyser = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  };

  const startListening = useCallback(async () => {
    setErrorMessage(null);
    setErrorType(null);

    // Cancel text-to-speech if running
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    if (!speechSupported) {
      setErrorMessage("Speech Recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    // Step 1: Explicitly request microphone stream to ensure browser prompt is shown
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.mediaDevices?.getUserMedia === 'function') {
        await startAudioAnalyser();
      }
    } catch (err: any) {
      console.warn("getUserMedia failed before recognition start:", err);
    }

    // Step 2: Start speech recognition engine
    try {
      setTranscript('');
      recognitionRef.current?.start();
    } catch (e: any) {
      // In case recognition was already active, restart it cleanly
      try {
        recognitionRef.current?.stop();
        setTimeout(() => {
          recognitionRef.current?.start();
        }, 150);
      } catch (err) {
        console.error("Recognition start error:", err);
      }
    }
  }, [speechSupported]);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch (e) {
      console.error(e);
    }
    stopAudioAnalyser();
    setIsListening(false);
  }, []);

  const testMicrophone = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    try {
      if (typeof navigator === 'undefined' || typeof navigator.mediaDevices?.getUserMedia !== 'function') {
        return { success: false, message: "Microphone mediaDevices API not available in this browser." };
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionState('granted');
      setErrorMessage(null);
      setErrorType(null);
      // Clean up test stream
      stream.getTracks().forEach(t => t.stop());
      return { success: true, message: "Microphone hardware detected and permitted successfully!" };
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionState('denied');
        const msg = "Microphone blocked: Click the lock icon 🔒 next to the website address bar to allow microphone.";
        setErrorMessage(msg);
        return { success: false, message: msg };
      }
      const msg = `Microphone check failed: ${err.message || err.name}`;
      setErrorMessage(msg);
      return { success: false, message: msg };
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthSupported || typeof window === 'undefined') return;

    const cleanText = text
      .replace(/[*#`_]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/•/g, ', ')
      .slice(0, 450);

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v =>
      v.lang.startsWith('en') &&
      (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David'))
    );
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [synthSupported]);

  const cancelSpeech = useCallback(() => {
    if (synthSupported && typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [synthSupported]);

  return {
    isListening,
    isSpeaking,
    transcript,
    speechSupported,
    synthSupported,
    errorMessage,
    errorType,
    autoSpeakReplies,
    permissionState,
    audioLevel,
    setAutoSpeakReplies,
    startListening,
    stopListening,
    testMicrophone,
    speak,
    cancelSpeech
  };
}
