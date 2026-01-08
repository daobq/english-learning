'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui';
import { Volume2, Loader2, Check, Star } from 'lucide-react';

interface Answer {
  id: string;
  audio_url: string | null;
  transcript: string | null;
  ai_score: number | null;
  teacher_score: number | null;
  teacher_feedback: string | null;
}

interface AnswerReviewProps {
  answer: Answer;
  vocabularyWord: string;
}

export function AnswerReview({ answer, vocabularyWord }: AnswerReviewProps) {
  const [transcript, setTranscript] = useState(answer.transcript);
  const [aiScore, setAiScore] = useState(answer.ai_score);
  const [teacherScore, setTeacherScore] = useState(answer.teacher_score);
  const [teacherFeedback, setTeacherFeedback] = useState(answer.teacher_feedback || '');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const transcribeAudio = async () => {
    if (!answer.audio_url) return;

    setIsTranscribing(true);

    try {
      // Use Web Speech API for transcription via a simple approach
      // In production, you'd use a server-side Whisper API
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioUrl: answer.audio_url,
          expectedText: vocabularyWord,
        }),
      });

      const data = await response.json();

      if (data.transcript) {
        setTranscript(data.transcript);
        setAiScore(data.score);

        // Save to database
        const supabase = createClient();
        await supabase
          .from('answers')
          .update({
            transcript: data.transcript,
            ai_score: data.score,
          })
          .eq('id', answer.id);
      }
    } catch (err) {
      console.error('Transcription error:', err);
      alert('Không thể phân tích audio. Vui lòng thử lại.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const saveTeacherReview = async () => {
    setIsSaving(true);

    try {
      const supabase = createClient();
      await supabase
        .from('answers')
        .update({
          teacher_score: teacherScore,
          teacher_feedback: teacherFeedback || null,
        })
        .eq('id', answer.id);
    } catch (err) {
      console.error('Save error:', err);
      alert('Không thể lưu. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const playAudio = () => {
    if (answer.audio_url) {
      const audio = new Audio(answer.audio_url);
      audio.play();
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-4">
      {/* Student recording */}
      <div>
        <p className="text-sm text-gray-500 mb-2">Bài thu âm của học sinh:</p>
        <div className="flex items-center gap-3">
          <button
            onClick={playAudio}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 rounded-xl text-purple-700"
          >
            <Volume2 className="w-5 h-5" />
            Nghe bài làm
          </button>

          {!transcript && (
            <Button
              variant="secondary"
              size="sm"
              onClick={transcribeAudio}
              disabled={isTranscribing}
            >
              {isTranscribing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Đang phân tích...
                </>
              ) : (
                'AI Chấm điểm'
              )}
            </Button>
          )}
        </div>
      </div>

      {/* AI Analysis */}
      {transcript && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">AI đã nhận diện:</p>
            {aiScore !== null && (
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  aiScore >= 80
                    ? 'bg-green-100 text-green-700'
                    : aiScore >= 50
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                AI Score: {aiScore}%
              </span>
            )}
          </div>
          <p className="text-gray-900 bg-white p-3 rounded-lg border">
            &ldquo;{transcript}&rdquo;
          </p>
        </div>
      )}

      {/* Teacher Review */}
      <div className="border-t pt-4">
        <p className="text-sm text-gray-500 mb-3">Đánh giá của giáo viên:</p>

        {/* Score buttons */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-gray-600">Điểm:</span>
          {[20, 40, 60, 80, 100].map((score) => (
            <button
              key={score}
              onClick={() => setTeacherScore(score)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                teacherScore === score
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border hover:bg-gray-50'
              }`}
            >
              {score}
            </button>
          ))}
        </div>

        {/* Feedback */}
        <textarea
          rows={2}
          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
          placeholder="Nhận xét cho học sinh (tùy chọn)..."
          value={teacherFeedback}
          onChange={(e) => setTeacherFeedback(e.target.value)}
        />

        <Button
          size="sm"
          onClick={saveTeacherReview}
          disabled={teacherScore === null || isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-1" />
              Lưu đánh giá
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
