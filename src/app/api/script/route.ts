import { NextRequest, NextResponse } from 'next/server';
import { CohereClient } from 'cohere-ai';

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { playerName } = body;

    if (!playerName) {
      return NextResponse.json({ error: 'playerName is required' }, { status: 400 });
    }

    const response = await cohere.generate({
      model: 'command-r-plus',
      prompt: `Write an exciting 30-second sports highlight reel narration for ${playerName}`,
      maxTokens: 300,
      temperature: 0.9,
    });

    const script = response.generations[0]?.text.trim();

    if (!script) {
      return NextResponse.json({ error: 'Script generation failed' }, { status: 500 });
    }

    return NextResponse.json({ script }, { status: 200 });

  } catch (error) {
    console.error('Script generation error:', error);
    return NextResponse.json({ error: 'Failed to generate script' }, { status: 500 });
  }
}
