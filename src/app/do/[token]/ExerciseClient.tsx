'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AudioRecorder } from '@/components/AudioRecorder';
import { Button, Input, Card } from '@/components/ui';
import { BookOpen, ChevronRight, Check, Loader2, Volume2, Star, Sparkles } from 'lucide-react';

interface Vocabulary {
  id: string;
  word: string;
  meaning: string | null;
  order_index: number;
}

interface ExerciseClientProps {
  assignment: {
    id: string;
    title: string;
    description: string | null;
  };
  vocabulary: Vocabulary[];
  showMeaning: boolean;
  isDirectLesson?: boolean; // True if accessing lesson directly (not via assignment)
}

type Step = 'intro' | 'exercise' | 'complete';

// Text-to-speech helper
function speakWord(word: string, rate = 0.7) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  }
}

export function ExerciseClient({ assignment, vocabulary, showMeaning, isDirectLesson = false }: ExerciseClientProps) {
  const [step, setStep] = useState<Step>('intro');
  const [studentName, setStudentName] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [recordings, setRecordings] = useState<Map<string, Blob>>(new Map());
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const currentWord = vocabulary[currentWordIndex];
  const isLastWord = currentWordIndex === vocabulary.length - 1;
  const hasRecording = recordings.has(currentWord?.id);

  // Load voices on mount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const startExercise = async () => {
    if (!studentName.trim()) return;

    // If direct lesson access, skip creating submission
    if (isDirectLesson) {
      setStep('exercise');
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('submissions')
      .insert({
        assignment_id: assignment.id,
        student_name: studentName.trim(),
      })
      .select()
      .single();

    if (error) {
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
      return;
    }

    setSubmissionId(data.id);
    setStep('exercise');
  };

  const handleRecordingComplete = (blob: Blob) => {
    setRecordings((prev) => new Map(prev).set(currentWord.id, blob));
  };

  const saveAnswerAndContinue = async () => {
    if (!hasRecording) return;

    setIsSavingAnswer(true);

    try {
      // If direct lesson access, skip saving to database
      if (!isDirectLesson && submissionId) {
        const supabase = createClient();
        const blob = recordings.get(currentWord.id)!;

        // Upload audio to Supabase Storage
        const fileName = `submissions/${submissionId}/${currentWord.id}.webm`;
        const { error: uploadError } = await supabase.storage
          .from('audio')
          .upload(fileName, blob, {
            contentType: 'audio/webm',
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
        }

        const { data: urlData } = supabase.storage
          .from('audio')
          .getPublicUrl(fileName);

        // Create answer record
        await supabase.from('answers').insert({
          submission_id: submissionId,
          vocabulary_id: currentWord.id,
          audio_url: urlData.publicUrl,
        });
      }

      // Move to next word or complete
      if (isLastWord) {
        await completeExercise();
      } else {
        setCurrentWordIndex((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Error saving answer:', err);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSavingAnswer(false);
    }
  };

  const completeExercise = async () => {
    setIsSubmitting(true);

    try {
      // If direct lesson access, skip updating database
      if (!isDirectLesson && submissionId) {
        const supabase = createClient();
        await supabase
          .from('submissions')
          .update({ completed_at: new Date().toISOString() })
          .eq('id', submissionId);
      }

      setShowConfetti(true);
      setStep('complete');
    } catch (err) {
      console.error('Error completing exercise:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Intro screen - Kid friendly
  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="text-center border-4 border-purple-200 shadow-xl">
            {/* Fun header with stars */}
            <div className="mb-6">
              <div className="flex justify-center gap-2 mb-4">
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 animate-pulse" />
                <Sparkles className="w-10 h-10 text-purple-500" />
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 animate-pulse" />
              </div>

              <h1 className="text-3xl font-bold text-purple-600 mb-2">
                {assignment.title}
              </h1>
              {assignment.description && (
                <p className="text-gray-600 text-lg">{assignment.description}</p>
              )}

              <div className="mt-4 inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-full text-xl font-bold">
                {vocabulary.length} tu vung
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xl font-medium text-gray-700 mb-2">
                  Ten cua con la gi?
                </label>
                <input
                  type="text"
                  placeholder="Nhap ten con..."
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full text-2xl text-center px-6 py-4 border-4 border-purple-200 rounded-2xl focus:outline-none focus:border-purple-400"
                />
              </div>

              <button
                onClick={startExercise}
                disabled={!studentName.trim()}
                className="w-full py-5 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-2xl font-bold rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-500 hover:to-emerald-600 transition-all transform hover:scale-105 active:scale-95"
              >
                BAT DAU HOC!
              </button>
            </div>

            <p className="text-gray-500 mt-6 text-lg">
              Phu huynh giup con nhap ten va bam bat dau nhe!
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // Complete screen - Celebration!
  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-green-100 to-emerald-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Confetti animation */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`,
                }}
              >
                {['🎉', '🌟', '⭐', '🎊', '💫', '✨'][Math.floor(Math.random() * 6)]}
              </div>
            ))}
          </div>
        )}

        <Card className="w-full max-w-md text-center border-4 border-green-300 shadow-xl relative z-10">
          <div className="mb-6">
            <div className="text-8xl mb-4">🎉</div>
            <h1 className="text-4xl font-bold text-green-600 mb-2">
              GIOI LAM!
            </h1>
            <p className="text-2xl text-purple-600 font-medium">
              {studentName} da hoan thanh bai hoc!
            </p>
          </div>

          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-6 mb-6">
            <div className="flex justify-center gap-2 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-8 h-8 text-yellow-500 fill-yellow-500" />
              ))}
            </div>
            <p className="text-xl text-gray-700">
              Con da doc {recordings.size}/{vocabulary.length} tu!
            </p>
            <p className="text-gray-500 mt-2">
              Co giao se cham bai va nhan xet nhe!
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-gradient-to-r from-blue-400 to-purple-500 text-white text-xl font-bold rounded-2xl"
          >
            LAM LAI BAI
          </button>
        </Card>
      </div>
    );
  }

  // Exercise screen - Large, kid-friendly UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4">
      <div className="max-w-lg mx-auto">
        {/* Progress bar - Colorful */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-lg font-medium mb-2">
            <span className="text-purple-600">{studentName}</span>
            <span className="bg-white px-4 py-1 rounded-full text-purple-600">
              Tu {currentWordIndex + 1}/{vocabulary.length}
            </span>
          </div>
          <div className="h-4 bg-white rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
              style={{
                width: `${((currentWordIndex + 1) / vocabulary.length) * 100}%`,
              }}
            />
          </div>
          {/* Word indicators */}
          <div className="flex justify-center gap-1 mt-2">
            {vocabulary.map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  i < currentWordIndex
                    ? 'bg-green-500'
                    : i === currentWordIndex
                    ? 'bg-purple-500 scale-125'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main word card */}
        <Card className="mb-6 border-4 border-purple-200 shadow-xl">
          <div className="text-center py-8 space-y-6">
            {/* Word number */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full shadow-lg">
              <span className="text-3xl font-bold text-white">
                {currentWordIndex + 1}
              </span>
            </div>

            {/* The word - LARGE */}
            <div className="space-y-2">
              <p className="text-gray-500 text-lg">Doc tu nay:</p>
              <p className="text-5xl md:text-6xl font-bold text-gray-900 py-4">
                {currentWord.word}
              </p>
              {showMeaning && currentWord.meaning && (
                <p className="text-2xl text-purple-600 bg-purple-50 py-2 px-4 rounded-xl inline-block">
                  {currentWord.meaning}
                </p>
              )}
            </div>

            {/* Listen button - BIG */}
            <div>
              <p className="text-gray-500 mb-3 text-lg">Nhan de nghe:</p>
              <button
                onClick={() => speakWord(currentWord.word)}
                className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg hover:from-blue-500 hover:to-blue-700 transition-all transform hover:scale-110 active:scale-95 mx-auto"
              >
                <Volume2 className="w-12 h-12 text-white" />
              </button>
              <p className="text-sm text-gray-400 mt-2">Bam de nghe phat am</p>
            </div>
          </div>
        </Card>

        {/* Recording section */}
        <Card className="mb-6 border-4 border-orange-200 shadow-xl">
          <div className="text-center py-6">
            <p className="text-xl text-gray-700 mb-4 font-medium">
              Bay gio con hay noi lai nhe!
            </p>
            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              disabled={isSavingAnswer}
            />
            {hasRecording && (
              <p className="text-green-600 mt-3 font-medium text-lg">
                Da thu am xong!
              </p>
            )}
          </div>
        </Card>

        {/* Next button - BIG and colorful */}
        <button
          onClick={saveAnswerAndContinue}
          disabled={!hasRecording || isSavingAnswer}
          className={`w-full py-6 text-2xl font-bold rounded-2xl shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
            hasRecording && !isSavingAnswer
              ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isSavingAnswer ? (
            <span className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 mr-3 animate-spin" />
              Dang luu...
            </span>
          ) : isLastWord ? (
            <span className="flex items-center justify-center">
              <Check className="w-8 h-8 mr-3" />
              NOP BAI
            </span>
          ) : (
            <span className="flex items-center justify-center">
              TU TIEP THEO
              <ChevronRight className="w-8 h-8 ml-2" />
            </span>
          )}
        </button>

        {/* Help text */}
        <p className="text-center text-gray-500 mt-4 text-lg">
          {hasRecording
            ? 'Nhan nut xanh de tiep tuc!'
            : 'Thu am giong noi truoc khi tiep tuc'}
        </p>
      </div>
    </div>
  );
}
