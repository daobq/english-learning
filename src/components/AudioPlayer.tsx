'use client';

import { useState } from 'react';
import { Volume2, Loader2 } from 'lucide-react';

interface AudioPlayerProps {
  src?: string | null;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Use Web Speech API for text-to-speech
function speakText(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8; // Slower for children
    utterance.pitch = 1;

    // Try to find an English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice =
      voices.find((v) => v.lang.startsWith('en') && v.name.includes('Female')) ||
      voices.find((v) => v.lang.startsWith('en'));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);

    window.speechSynthesis.speak(utterance);
  });
}

export function AudioPlayer({ src, text, size = 'lg' }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePlay = async () => {
    if (isPlaying) return;

    setIsLoading(true);

    try {
      if (src) {
        // Use audio file if available
        const audio = new Audio(src);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => {
          setIsPlaying(false);
          // Fallback to TTS if audio fails
          if (text) {
            speakText(text).finally(() => setIsPlaying(false));
          }
        };
        await audio.play();
        setIsPlaying(true);
      } else if (text) {
        // Use Web Speech API
        setIsPlaying(true);
        await speakText(text);
        setIsPlaying(false);
      }
    } catch (err) {
      console.error('Error playing audio:', err);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  return (
    <button
      type="button"
      onClick={handlePlay}
      disabled={isPlaying || isLoading}
      className={`${sizes[size]} rounded-full flex items-center justify-center transition-all ${
        isPlaying
          ? 'bg-green-500 animate-pulse'
          : 'bg-orange-500 hover:bg-orange-600'
      } disabled:cursor-not-allowed`}
    >
      {isLoading ? (
        <Loader2 className={`${iconSizes[size]} text-white animate-spin`} />
      ) : (
        <Volume2 className={`${iconSizes[size]} text-white`} />
      )}
    </button>
  );
}
