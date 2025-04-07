
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import mime from 'mime-types';

const execPromise = promisify(exec);

const s3 = new S3Client({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  const { imageUrl, audio, output } = await req.json();

  const tempDir = path.join(process.cwd(), 'public');
  const imagePath = path.join(tempDir, 'temp-image.jpg');
  const audioPath = path.join(tempDir, 'temp-audio.mp3');
  const outputPath = path.join(tempDir, output);

  try {
    // Download image
    if (imageUrl.startsWith('data:image/')) {
      const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
      fs.writeFileSync(imagePath, Buffer.from(base64Data, 'base64'));
    } else {
      const imageRes = await fetch(imageUrl);
      if (!imageRes.ok) throw new Error(`Failed to download image: ${imageRes.statusText}`);
      const buffer = await imageRes.arrayBuffer();
      fs.writeFileSync(imagePath, Buffer.from(buffer));
    }

    // ✅ TEMP: Use hardcoded S3 audio URL
    const audioUrl = `https://sports-reel-bucket.s3.eu-north-1.amazonaws.com/audio/${audio}`;
    console.log("🎧 Using audio URL:", audioUrl);

    const audioRes = await fetch(audioUrl);
    if (!audioRes.ok) {
      console.error("❌ Failed to download audio:", await audioRes.text());
      return NextResponse.json({ success: false, error: 'Failed to download audio from S3' });
    }
    const audioBuffer = await audioRes.arrayBuffer();
    fs.writeFileSync(audioPath, Buffer.from(audioBuffer));

    // Generate video using FFmpeg
    const cmd = `ffmpeg -y -loop 1 -i ${imagePath} -i ${audioPath} -c:v libx264 -tune stillimage -c:a aac -b:a 192k -shortest -pix_fmt yuv420p ${outputPath}`;
    console.log("▶️ Running FFmpeg command:", cmd);
    await execPromise(cmd);

    // Upload video to S3
    const videoBuffer = fs.readFileSync(outputPath);
    const contentType = mime.lookup(outputPath) || 'video/mp4';

    const uploadParams = {
      Bucket: 'sports-reel-bucket',
      Key: `videos/${output}`,
      Body: videoBuffer,
      ContentType: contentType,
    };

    await s3.send(new PutObjectCommand(uploadParams));

    const videoUrl = `https://sports-reel-bucket.s3.eu-north-1.amazonaws.com/videos/${output}`;
    console.log("✅ Video uploaded to:", videoUrl);

    return NextResponse.json({ success: true, videoUrl });
  } catch (err: any) {
    console.error('🚨 Video generation or upload failed:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to generate video' });
  } finally {
    // Cleanup temp files
    [imagePath, audioPath, outputPath].forEach((file) => {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    });
  }
}













