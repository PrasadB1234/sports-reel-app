import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream'; // ✅ Node.js stream import

const polly = new PollyClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function synthesizeSpeechToFile(text: string, fileName: string) {
  const command = new SynthesizeSpeechCommand({
    Text: text,
    OutputFormat: "mp3",
    VoiceId: "Matthew",
  });

  const { AudioStream } = await polly.send(command);

  if (!AudioStream) throw new Error("AudioStream is undefined");

  const filePath = path.join(process.cwd(), 'public', `${fileName}.mp3`);
  const writeStream = fs.createWriteStream(filePath);

  // ✅ Use Readable.from() to safely convert the stream
  Readable.from(AudioStream as any).pipe(writeStream);

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => resolve(`${fileName}.mp3`));
    writeStream.on('error', reject);
  });
}

