'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, RotateCcw } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  disabled?: boolean;
}

export function AudioRecorder({ onRecordingComplete, disabled }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onRecordingComplete(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Không thể truy cập microphone. Vui lòng cho phép quyền truy cập.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setRecordingTime(0);
  };

  const playRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Recording button */}
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled}
        className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : audioUrl
            ? 'bg-green-500 hover:bg-green-600'
            : 'bg-blue-500 hover:bg-blue-600'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isRecording ? (
          <Square className="w-10 h-10 text-white" />
        ) : (
          <Mic className="w-10 h-10 text-white" />
        )}
      </button>

      {/* Status text */}
      <div className="text-center">
        {isRecording ? (
          <p className="text-lg font-medium text-red-600">
            Đang thu âm... {formatTime(recordingTime)}
          </p>
        ) : audioUrl ? (
          <p className="text-lg font-medium text-green-600">Đã thu âm xong!</p>
        ) : (
          <p className="text-lg font-medium text-gray-600">Nhấn để thu âm</p>
        )}
      </div>

      {/* Playback controls */}
      {audioUrl && !isRecording && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={playRecording}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700"
          >
            <Play className="w-5 h-5" />
            Nghe lại
          </button>
          <button
            type="button"
            onClick={resetRecording}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700"
          >
            <RotateCcw className="w-5 h-5" />
            Thu lại
          </button>
        </div>
      )}

      {/* Instructions */}
      <p className="text-sm text-gray-500 text-center max-w-xs">
        {isRecording
          ? 'Nhấn nút vuông đỏ để dừng thu âm'
          : 'Nhấn nút microphone để bắt đầu thu âm giọng nói của con'}
      </p>
    </div>
  );
}
