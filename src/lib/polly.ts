import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const polly = new PollyClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = "sports-reel-bucket"; // ✅ Replace with your actual bucket
const AUDIO_FOLDER = "audio"; // Optional folder prefix inside bucket

export async function synthesizeSpeechToS3(text: string, fileName: string) {
  const command = new SynthesizeSpeechCommand({
    Text: text,
    OutputFormat: "mp3",
    VoiceId: "Matthew",
  });

  const { AudioStream } = await polly.send(command);
  if (!AudioStream) throw new Error("AudioStream is undefined");

  const chunks: Uint8Array[] = [];
  for await (const chunk of AudioStream as any as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }

  const buffer = Buffer.concat(chunks);
  const s3Key = `${AUDIO_FOLDER}/${fileName}.mp3`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
      ContentType: "audio/mpeg",
    })
  );

  const s3Url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
  return s3Url;
}


