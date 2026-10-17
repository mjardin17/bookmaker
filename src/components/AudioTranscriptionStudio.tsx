import React, { useState, useRef, useEffect } from 'react';
import { PublishingProject, Chapter } from '../types/storyforge';
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  Upload,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  BookOpen,
  ArrowRight,
  FileAudio,
  Trash2,
  Download,
  Volume2,
  VolumeX,
  Radio
} from 'lucide-react';

interface AudioTranscriptionStudioProps {
  project?: PublishingProject;
  onAppendToChapter?: (chapterId: string, text: string) => void;
  onAddTranscribedChapter?: (title: string, content: string) => void;
}

interface TranscriptionRecord {
  id: string;
  audioUrl?: string;
  text: string;
  durationSec: number;
  wordCount: number;
  timestamp: string;
  source: 'microphone' | 'file';
  model: string;
}

export const AudioTranscriptionStudio: React.FC<AudioTranscriptionStudioProps> = ({
  project,
  onAppendToChapter,
  onAddTranscribedChapter
}) => {
  // Recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Audio level meter for visualization
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // Target chapter for text insertion
  const chapters = project?.manuscript?.chapters || [];
  const [selectedChapterId, setSelectedChapterId] = useState<string>(chapters[0]?.id || '');

  // Session history
  const [history, setHistory] = useState<TranscriptionRecord[]>([]);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Clean up recording timer and audio context on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Visualizer loop during microphone recording
  const startVisualizer = (stream: MediaStream) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (e) {
      console.warn('Visualizer notice:', e);
    }
  };

  const stopVisualizer = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  // Start microphone recording
  const startRecording = async () => {
    setErrorMsg(null);
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscribedText('');
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      startVisualizer(stream);

      // Pick best supported mimeType
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stopVisualizer();
        stream.getTracks().forEach((track) => track.stop());

        const recordedBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(recordedBlob);
        const url = URL.createObjectURL(recordedBlob);
        setAudioUrl(url);

        // Auto-transcribe upon recording completion
        handleTranscribeBlob(recordedBlob, mimeType, 'microphone');
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access error:', err);
      setErrorMsg(
        err.name === 'NotAllowedError'
          ? 'Microphone permission was denied. Please allow microphone access in your browser settings.'
          : 'Unable to initialize microphone: ' + err.message
      );
    }
  };

  // Stop microphone recording
  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Convert Blob to Base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const b64 = result.replace(/^data:.+;base64,/, '');
        resolve(b64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Dispatches audio to gemini-3.5-transcribe
  const handleTranscribeBlob = async (blob: Blob, mimeType: string, source: 'microphone' | 'file') => {
    setIsTranscribing(true);
    setErrorMsg(null);
    setStatusMessage('Transcribing speech with gemini-3.5-transcribe...');

    try {
      const base64Audio = await blobToBase64(blob);

      const response = await fetch('/api/transcribe-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: base64Audio,
          mimeType: mimeType || 'audio/webm',
          prompt: 'Transcribe this spoken audio verbatim. Accurately capture dialogue, character voice, and storytelling beats.'
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to transcribe audio');
      }

      const text = data.text || '';
      setTranscribedText(text);
      setStatusMessage('Transcription complete!');

      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const record: TranscriptionRecord = {
        id: `trans-${Date.now()}`,
        audioUrl: audioUrl || undefined,
        text,
        durationSec: recordingSeconds || 5,
        wordCount: words,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source,
        model: 'gemini-3.5-transcribe'
      };

      setHistory((prev) => [record, ...prev]);
    } catch (err: any) {
      console.error('Transcription error:', err);
      setErrorMsg(err.message || 'Transcription error occurred');
    } finally {
      setIsTranscribing(false);
    }
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setAudioBlob(file);
    handleTranscribeBlob(file, file.type || 'audio/wav', 'file');
  };

  // Copy text helper
  const handleCopyText = () => {
    if (!transcribedText) return;
    navigator.clipboard.writeText(transcribedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format seconds to mm:ss
  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6 select-none">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Mic className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Voice Dictation & Audio Transcription
                <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  gemini-3.5-transcribe
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Dictate scenes, dialogue, and story beats using your microphone or uploaded audio, transcribed accurately with Google Gemini.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Audio File shortcut */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Upload Audio File</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Microphone Deck (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 text-center">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Radio className={`w-3.5 h-3.5 ${isRecording ? 'text-red-500' : 'text-slate-500'}`} />
                <span>Microphone Deck</span>
              </span>
              <span className="text-xs font-mono text-slate-400">
                Model: <strong className="text-emerald-400">gemini-3.5-transcribe</strong>
              </span>
            </div>

            {/* Central Animated Mic Button */}
            <div className="py-6 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                {/* Visualizer Volume Ring */}
                {isRecording && (
                  <div
                    className="absolute inset-0 -m-3 rounded-full border-2 border-emerald-500/60 transition-transform duration-75"
                    style={{ transform: `scale(${1 + audioLevel * 0.005})` }}
                  />
                )}

                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isTranscribing}
                  className={`w-28 h-28 rounded-full flex flex-col items-center justify-center font-black transition-all shadow-2xl active:scale-95 ${
                    isRecording
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                      : 'bg-gradient-to-tr from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <Square className="w-8 h-8 fill-current" />
                      <span className="text-[11px] uppercase tracking-wider mt-1">Stop</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-9 h-9" />
                      <span className="text-[11px] uppercase tracking-wider mt-1">Record</span>
                    </>
                  )}
                </button>
              </div>

              {/* Timer & Status */}
              <div>
                <p className="font-mono text-2xl font-black text-white">
                  {formatSeconds(recordingSeconds)}
                </p>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  {isRecording
                    ? 'Listening... Speak your chapter narrative or dialogue'
                    : 'Click to start voice dictation'}
                </p>
              </div>

              {/* Dynamic Sound Wave Level Meter */}
              {isRecording && (
                <div className="w-full max-w-xs space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>Input Level</span>
                    <span>{audioLevel}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-75"
                      style={{ width: `${audioLevel}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Audio Preview Player if recording exists */}
            {audioUrl && !isRecording && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-left">
                <span className="text-[11px] font-mono text-slate-400 uppercase block">
                  Recorded Audio Clip
                </span>
                <audio ref={audioPlayerRef} src={audioUrl} controls className="w-full h-9" />
              </div>
            )}

            {/* Loading / Status notice */}
            {isTranscribing && (
              <div className="p-3 bg-slate-950 border border-emerald-500/30 rounded-xl flex items-center justify-center gap-2 text-xs text-emerald-300 font-mono">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>{statusMessage}</span>
              </div>
            )}

            {errorMsg && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl font-medium">
                {errorMsg}
              </p>
            )}
          </div>

          {/* Quick Dictation Tips Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2.5 text-xs text-slate-400">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Voice Dictation Pro-Tips</span>
            </h3>
            <ul className="space-y-1.5 list-disc list-inside leading-relaxed text-[11px]">
              <li>Speak naturally: <strong>gemini-3.5-transcribe</strong> accurately understands punctuation, dialogue cues, and accents.</li>
              <li>Say <em>"comma"</em>, <em>"period"</em>, or <em>"new paragraph"</em> if you prefer explicit formatting.</li>
              <li>Dictate character interactions: The model preserves distinct speaker voices and character names.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Transcribed Text & Chapter Integration (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <FileAudio className="w-4 h-4" />
                <span>Transcribed Manuscript Output</span>
              </span>
              {transcribedText && (
                <span className="text-[11px] font-mono bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full">
                  {transcribedText.trim().split(/\s+/).length} words
                </span>
              )}
            </div>

            {/* Editable Transcribed Textarea */}
            <textarea
              value={transcribedText}
              onChange={(e) => setTranscribedText(e.target.value)}
              rows={12}
              placeholder="Your transcribed speech from gemini-3.5-transcribe will appear here in real-time. You can edit, format, or immediately append it to any chapter in your book..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 font-serif leading-relaxed resize-none"
            />

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyText}
                  disabled={!transcribedText}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setTranscribedText('')}
                  disabled={!transcribedText}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-400 hover:text-rose-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>

              {/* Story Integration Actions */}
              {chapters.length > 0 && onAppendToChapter && (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedChapterId}
                    onChange={(e) => setSelectedChapterId(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    {chapters.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        Chapter {ch.chapterNumber}: {ch.title}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      if (!transcribedText.trim()) return;
                      onAppendToChapter(selectedChapterId, transcribedText);
                      alert('Dictated text appended to manuscript chapter!');
                    }}
                    disabled={!transcribedText}
                    className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-lg shadow flex items-center gap-1.5 transition-all"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Append to Chapter</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Session History */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Dictation Session Clips ({history.length})
            </span>
            {history.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                Recordings from this session will appear here for review and playback.
              </p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto no-scrollbar">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setTranscribedText(item.text)}
                    className="p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 rounded-xl cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="truncate mr-3">
                      <p className="text-xs font-medium text-slate-200 truncate">{item.text}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {item.wordCount} words • {item.model} • {item.timestamp}
                      </p>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold shrink-0">
                      Load Text
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
