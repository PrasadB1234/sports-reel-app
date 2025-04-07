
import { NextResponse } from 'next/server';
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET() {
  try {
    const data = await s3
      .listObjectsV2({
        Bucket: 'sports-reel-bucket',
        Prefix: 'videos/',
      })
      .promise();

    const videos = data.Contents?.filter(obj => obj.Key?.endsWith('.mp4'))?.map(obj => {
      return `https://sports-reel-bucket.s3.eu-north-1.amazonaws.com/${obj.Key}`;
    }) || [];

    return NextResponse.json({ success: true, videos });
  } catch (err) {
    console.error('S3 List Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch videos' }, { status: 500 });
  }
}

  