import { NextRequest, NextResponse } from 'next/server';

// This API route provides voice options and handles TTS generation
// For the MVP, we'll use client-side Web Speech API for preview
// and store the text content directly (audio will be generated on-the-fly)

export async function GET() {
  // Available voices for English (these match Web Speech API voices)
  const voices = [
    { id: 'en-US', name: 'US English', language: 'en-US' },
    { id: 'en-GB', name: 'UK English', language: 'en-GB' },
    { id: 'en-AU', name: 'Australian English', language: 'en-AU' },
  ];

  return NextResponse.json({ voices });
}

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'en-US' } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // For the MVP, we'll return the text and voice settings
    // The client will use Web Speech API to generate audio
    // In production, you can integrate with:
    // - Google Cloud TTS
    // - Amazon Polly
    // - Azure Speech Services

    return NextResponse.json({
      text,
      voice,
      // Indicate that client should use Web Speech API
      useClientTTS: true,
    });
  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json(
      { error: 'Failed to process TTS request' },
      { status: 500 }
    );
  }
}
