import { NextRequest, NextResponse } from 'next/server';

// Simple text similarity scoring function
function calculateSimilarity(text1: string, text2: string): number {
  const normalize = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim()
      .split(/\s+/);

  const words1 = normalize(text1);
  const words2 = normalize(text2);

  if (words1.length === 0 || words2.length === 0) return 0;

  let matchCount = 0;
  for (const word of words2) {
    if (words1.includes(word)) {
      matchCount++;
    }
  }

  // Calculate score based on word matches
  const precision = matchCount / words2.length;
  const recall = matchCount / words1.length;

  if (precision + recall === 0) return 0;

  // F1 score
  const f1 = (2 * precision * recall) / (precision + recall);
  return Math.round(f1 * 100);
}

export async function POST(request: NextRequest) {
  try {
    const { audioUrl, expectedText } = await request.json();

    if (!audioUrl || !expectedText) {
      return NextResponse.json(
        { error: 'Missing audioUrl or expectedText' },
        { status: 400 }
      );
    }

    // In a production environment, you would:
    // 1. Download the audio file from audioUrl
    // 2. Send it to Whisper API (OpenAI) or another STT service
    // 3. Get the transcript back
    // 4. Compare with expectedText

    // For now, we'll simulate this with a placeholder
    // The teacher can still manually review the audio

    // Simulated transcript (in production, this comes from Whisper)
    // For demo purposes, we'll return a message indicating manual review needed
    const simulatedTranscript = '[Cần xem thủ công]';
    const score = 0; // Will be set by teacher

    return NextResponse.json({
      transcript: simulatedTranscript,
      score: score,
      note: 'Hệ thống đang trong giai đoạn thử nghiệm. Giáo viên vui lòng nghe và chấm điểm thủ công.',
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
