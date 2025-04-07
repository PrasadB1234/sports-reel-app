'use client';

import { useEffect, useState, useRef } from 'react';
import styles from './ReelsPage.module.css';

export default function ReelsPage() {
  const [videos, setVideos] = useState<string[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [status, setStatus] = useState('');
  const [script, setScript] = useState('');
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]); 
  const [activeIndex, setActiveIndex] = useState(0);

  /*Loader*/
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  // Fetch video list
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch('/api/list-files');
        const data = await res.json();
        if (data.success) setVideos(data.videos.reverse());
      } catch (err) {
        console.error("Error fetching videos:", err);
      }
    };
    fetchVideos();
  }, []);

 
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
    if (video) {
        if (index === activeIndex) {
        video.currentTime = 0;
        video.muted = false;
        video.play().catch(console.error);
        } else {
        video.pause();
        video.muted = true;
        }
    }
    });
  }, [activeIndex]);

  
  useEffect(() => {
    if (videos.length > 0) {
    setActiveIndex(0); 
    }
  }, [videos]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const height = e.currentTarget.clientHeight;
    const index = Math.round(scrollTop / height);
    setActiveIndex(index);
  };


/*new code for generate*/
const handleGenerate = async () => {
    if (!playerName) return alert("Enter player name");
  
    setLoading(true);
    setError('');
    setStatus("Generating script... 🧠");
  
    try {
      const scriptRes = await fetch('/api/script', {
        method: 'POST',
        body: JSON.stringify({ playerName }),
        headers: { 'Content-Type': 'application/json' },
      });
      const scriptData = await scriptRes.json();
      if (!scriptRes.ok || !scriptData.script) throw new Error("Script generation failed");
      setScript(scriptData.script);
  
      setStatus("Generating voice... 🔊");
      const voiceRes = await fetch('/api/voice', {
        method: 'POST',
        body: JSON.stringify({
          script: scriptData.script,
          fileName: `${playerName}-voice`,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const voiceData = await voiceRes.json();
      if (!voiceRes.ok || !voiceData.voiceUrl) throw new Error("Voice generation failed");
  
      setStatus("Fetching image... 🖼️");
      const imageRes = await fetch('/api/image', {
        method: 'POST',
        body: JSON.stringify({ playerName }),
        headers: { 'Content-Type': 'application/json' },
      });
      const imageData = await imageRes.json();
      if (!imageRes.ok || !imageData.imageUrl) throw new Error("Image fetch failed");
  
      setStatus("Generating video... 🎬");
      const videoRes = await fetch('/api/video', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: imageData.imageUrl,
          audio: `${playerName}-voice.mp3`,
          output: `${playerName}-video.mp4`,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const videoData = await videoRes.json();
      if (!videoRes.ok || !videoData.videoUrl) throw new Error("Video generation failed");
  
      setStatus("✅ Video created!");
      setVideos(prev => [videoData.videoUrl, ...prev]);
      setActiveIndex(0); // autoplay the new one
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "❌ Something went wrong!");
      setStatus("❌ Error occurred!");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>🎥 AI Sports Reel Generator</h1>

      <input
        type="text"
        placeholder="Enter player name (e.g., sachin)"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        className={styles.input}
      />

      <button onClick={handleGenerate} className={styles.button}>
        Create AI Reel
      </button>

      {status && <p className={styles.status}>{status}</p>}

      <div className={styles.reelFeed} onScroll={handleScroll}>
        {videos.map((url, i) => (
          <div key={i} className={styles.reel}>
            <video
              src={url}
            //   ref={(el) => (videoRefs.current[i] = el!)}
                ref={(el) => {
                    videoRefs.current[i] = el;
                }}
              controls
              muted
              className={styles.video}
            />
          </div>
        ))}
      </div>

    <div style={{ marginTop: '1rem' }}>
        {loading ? (
        <p className={styles.status}>⏳ Please wait... generating video...</p>
        ) : (
        <button onClick={handleGenerate} className={styles.button}>
            Create AI Reel
        </button>
        )}
        {status && <p className={styles.status}>{status}</p>}
        {error && <p style={{ color: 'red', marginTop: '0.5rem' }}>{error}</p>}
    </div>

    </div>
  );
}


