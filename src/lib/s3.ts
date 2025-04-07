// lib/s3.ts
import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
});

export async function uploadFileToS3(localFilePath: string, s3Key: string) {
  const fileContent = fs.readFileSync(localFilePath);

  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: s3Key,
    Body: fileContent,
    ContentType: 'video/mp4',
    ACL: 'public-read', 
  };

  await s3.upload(uploadParams).promise();

  return `https://${uploadParams.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
}
