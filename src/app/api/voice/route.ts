
import { NextRequest, NextResponse } from 'next/server';
import { synthesizeSpeechToS3 } from '@/lib/polly';

export async function POST(req: NextRequest) {
  const { script, fileName } = await req.json();

  if (!script || !fileName) {
    return NextResponse.json({ error: "script and fileName are required" }, { status: 400 });
  }

  try {
    const voiceUrl = await synthesizeSpeechToS3(script, fileName);
    return NextResponse.json({ voiceUrl });
  } catch (error) {
    console.error("Polly Error:", error);
    return NextResponse.json({ error: 'Failed to generate voice' }, { status: 500 });
  }
}

