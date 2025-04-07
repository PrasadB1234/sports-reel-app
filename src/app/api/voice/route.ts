import { NextRequest, NextResponse } from 'next/server';
import { synthesizeSpeechToFile } from '@/lib/polly';

export async function POST(req: NextRequest) {
    const { script, fileName } = await req.json();
  
    if (!script || !fileName) {
      return NextResponse.json({ error: "script and fileName are required" }, { status: 400 });
    }
  
    try {
      const voiceFile = await synthesizeSpeechToFile(script, fileName);
      return NextResponse.json({ voiceUrl: `/${voiceFile}` });
    } catch (error) {
      console.error("Polly Error:", error);
      return NextResponse.json({ error: 'Failed to generate voice' }, { status: 500 });
    }
  }
