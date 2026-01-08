'use client';

import { Volume2 } from 'lucide-react';

interface VocabularyAudioButtonProps {
  word: string;
}

export function VocabularyAudioButton({ word }: VocabularyAudioButtonProps) {
  const handleClick = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="p-3 text-purple-500 hover:bg-purple-100 rounded-xl"
      title="Nghe phát âm"
    >
      <Volume2 className="w-6 h-6" />
    </button>
  );
}
