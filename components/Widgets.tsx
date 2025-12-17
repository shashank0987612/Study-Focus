import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, Music, Minimize2, Maximize2, Upload } from 'lucide-react';
import { AMBIENT_SOUNDS } from '../constants';

// --- Live Clock Widget ---
export const LiveClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div id="live-clock-widget" className="fixed top-6 right-6 z-50 text-right select-none">
      <div className="text-4xl font-bold text-white tracking-tighter drop-shadow-lg">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="text-sm text-gray-300 font-medium tracking-wide uppercase">
        {time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
      </div>
    </div>
  );
};

// --- Spotify/Media Widget ---
export const SpotifyWidget: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState(AMBIENT_SOUNDS);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const draggingRef = useRef(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  const currentTrack = playlist[currentTrackIdx];

  // Load custom tracks from local storage on mount
  useEffect(() => {
    const savedTracks = localStorage.getItem('godmode_custom_tracks');
    if (savedTracks) {
        try {
            const parsed = JSON.parse(savedTracks);
            setPlaylist([...AMBIENT_SOUNDS, ...parsed]);
        } catch(e) { console.error("Error loading custom tracks", e); }
    }
  }, []);

  useEffect(() => {
    // If track changes, re-init audio
    if (audioRef.current) {
        audioRef.current.pause();
    }
    audioRef.current = new Audio(currentTrack.url);
    audioRef.current.loop = true;
    
    if (isPlaying) {
        audioRef.current.play().catch(e => {
            console.error("Audio play failed", e);
            setIsPlaying(false);
        });
    }

    return () => {
        audioRef.current?.pause();
    }
  }, [currentTrackIdx, playlist]); 

  // Watch isPlaying separately to toggle pause/play on same track
  useEffect(() => {
      if(!audioRef.current) return;
      if (isPlaying && audioRef.current.paused) {
          audioRef.current.play().catch(e => console.error(e));
      } else if (!isPlaying && !audioRef.current.paused) {
          audioRef.current.pause();
      }
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextTrack = () => {
    setCurrentTrackIdx((prev) => (prev + 1) % playlist.length);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              if (ev.target?.result) {
                  const newTrack = {
                      name: file.name.replace(/\.[^/.]+$/, ""),
                      url: ev.target.result as string,
                      isCustom: true
                  };
                  // Persist custom tracks
                  const updatedPlaylist = [...playlist, newTrack];
                  setPlaylist(updatedPlaylist);
                  
                  // Save only custom ones to LS
                  const customTracks = updatedPlaylist.filter((t: any) => t.isCustom);
                  try {
                      localStorage.setItem('godmode_custom_tracks', JSON.stringify(customTracks));
                  } catch (err) {
                      alert("File too large to save to storage, but it will play for this session.");
                  }
                  
                  // Auto play the new track
                  setCurrentTrackIdx(updatedPlaylist.length - 1);
                  setIsPlaying(true);
              }
          };
          reader.readAsDataURL(file);
      }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    draggingRef.current = true;
    offsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (draggingRef.current) {
      setPosition({
        x: e.clientX - offsetRef.current.x,
        y: e.clientY - offsetRef.current.y
      });
    }
  };

  const handleMouseUp = () => {
    draggingRef.current = false;
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (isMinimized) {
    return (
      <div 
        id="spotify-widget"
        className="fixed z-50 glass-panel p-3 rounded-full cursor-pointer hover:bg-white/10 transition-all animate-pulse"
        style={{ left: position.x, top: position.y }}
        onMouseDown={handleMouseDown}
        onClick={() => setIsMinimized(false)}
      >
        <Music className="text-accent" size={24} />
      </div>
    );
  }

  return (
    <div 
      id="spotify-widget"
      className="fixed z-50 glass-panel rounded-2xl w-64 overflow-hidden transition-shadow shadow-2xl"
      style={{ left: position.x, top: position.y }}
    >
      <div 
        className="bg-white/5 p-3 flex justify-between items-center cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
            <Music size={16} className="text-gray-400" />
            <span className="text-xs font-bold text-gray-300">PLAYER</span>
        </div>
        <button onClick={() => setIsMinimized(true)} className="text-gray-400 hover:text-white">
          <Minimize2 size={16} />
        </button>
      </div>
      
      <div className="p-4 flex flex-col items-center">
        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 mb-3 flex items-center justify-center shadow-lg relative group">
             <Music size={32} className="text-white/80" />
        </div>
        
        <div className="text-center mb-4 w-full">
            <h3 className="text-white font-semibold text-sm truncate px-2">{currentTrack.name}</h3>
            <p className="text-gray-400 text-xs">{currentTrackIdx < AMBIENT_SOUNDS.length ? 'God Mode Library' : 'My Playlist'}</p>
        </div>
        
        <div className="flex items-center gap-4 w-full justify-center mb-3">
             <button onClick={togglePlay} className="p-3 bg-white text-black rounded-full hover:scale-105 transition-transform">
                {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-0.5" />}
             </button>
             <button onClick={nextTrack} className="text-gray-300 hover:text-white">
                <SkipForward size={24} />
             </button>
        </div>

        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer hover:text-white transition-colors">
            <Upload size={12} />
            Add Song
            <input type="file" accept="audio/*" className="hidden" onChange={handleUpload} />
        </label>
      </div>
    </div>
  );
};