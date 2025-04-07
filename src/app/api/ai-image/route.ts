import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const { playerName } = await req.json();

    if (!playerName) {
      return NextResponse.json({ success: false, error: 'Player name is required' });
    }

    const prompt = `Ultra realistic portrait of ${playerName} playing cricket, dramatic lighting, high resolution`;

    const output = await replicate.run(
      'stability-ai/stable-diffusion:db21e45e4c8a2f2fbe1a9c7a208a469d48e7da3486ae5b8f49a2e06c1e3c2b6a', // model + version
      {
        input: {
          prompt,
        },
      }
    );

    const imageUrl = Array.isArray(output) ? output[0] : output;

    if (!imageUrl) {
      return NextResponse.json({ success: false, error: 'AI image generation returned no result' });
    }

    return NextResponse.json({ success: true, imageUrl });
  } catch (error: any) {
    console.error('AI Image Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'AI image generation failed',
    });
  }
}
