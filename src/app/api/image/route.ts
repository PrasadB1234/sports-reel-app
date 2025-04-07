import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { playerName } = await req.json();

    if (!playerName) {
      return NextResponse.json({ success: false, error: 'Player name is required' }, { status: 400 });
    }

    const HUGGINGFACE_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN!;
    const MODEL_ID = 'stabilityai/stable-diffusion-2';

    const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL_ID}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HUGGINGFACE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `realistic photo of ${playerName} as an athlete, cinematic lighting, 4k`,
      }),
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const text = await response.text();

        try {
          const json = JSON.parse(text);
          errorMessage = json.error || JSON.stringify(json);
        } catch {
          errorMessage = text || 'Unknown error from Hugging Face API';
        }
      } catch (parseErr) {
        errorMessage = 'Failed to parse error response';
      }

      console.error('🛑 Hugging Face API Error:', errorMessage);
      return NextResponse.json({ success: false, error: errorMessage }, { status: response.status });
    }

    const buffer = await response.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');
    const imageUrl = `data:image/png;base64,${base64Image}`;

    return NextResponse.json({ success: true, imageUrl });
  } catch (err: any) {
    console.error('❌ Unexpected Error:', err?.stack || err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Unexpected error occurred' },
      { status: 500 }
    );
  }
}







