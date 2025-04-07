import { exec } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

export async function generateVideoFromImageAndAudio(image: string, audio: string, output: string): Promise<string> {
  const publicPath = path.join(process.cwd(), 'public');
  const imagePath = path.join(publicPath, image);
  const audioPath = path.join(publicPath, audio);
  const outputPath = path.join(publicPath, output);

  const command = `ffmpeg -y -loop 1 -i "${imagePath}" -i "${audioPath}" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest "${outputPath}"`;

  return new Promise((resolve, reject) => {
    exec(command, async (error, stdout, stderr) => {
      if (error) {
        console.error('FFmpeg Error:', stderr);
        reject(error);
        return;
      }

      try {
        await fs.unlink(imagePath);
        await fs.unlink(audioPath);
       
        resolve(output); 
      } catch (cleanupError) {
        console.warn('Cleanup Error:', cleanupError);
        resolve(output); 
      }
    });
  });
}
