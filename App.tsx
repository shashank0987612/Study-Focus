import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Home, LayoutDashboard, GraduationCap, HelpCircle, Calendar as CalIcon, Settings, 
  Maximize, Minimize, MonitorOff, Plus, Play, Pause, RefreshCw, Save, Trash2, Mic, StopCircle,
  ChevronLeft, ChevronRight, Image as ImageIcon, X, Coffee, Download, Music, Volume2,
  Star
} from 'lucide-react';
import { LiveClock, SpotifyWidget } from './components/Widgets';
import { Dashboard } from './components/Dashboard';
import { UserProfile, Session, Tree, Doubt, AppSettings, ViewState, Task, VoiceNote } from './types';
import { INITIAL_PROFILE, QUOTES, LEVEL_THRESHOLDS, PRESET_BACKGROUNDS } from './constants';

// --- View Components ---

// 1. HOME VIEW (TIMER + BREAK + SUBJECT + FEEDBACK)
const HomeView = ({ 
  user, 
  settings, 
  onSessionComplete 
}: { 
  user: UserProfile, 
  settings: AppSettings, 
  onSessionComplete: (duration: number, subject: string, rating: number, reflection: string) => void 
}) => {
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [timeLeft, setTimeLeft] = useState(settings.timerDuration * 60);
  const [isActive, setIsActive] = useState(false);
  
  // Subject Selection State
  const SUBJECTS = ['General', 'Math', 'Physics', 'Chemistry', 'Biology', 'History', 'Literature', 'Coding', 'Design', 'Business', 'Other'];
  const [selectedSubject, setSelectedSubject] = useState('General');
  const [customSubject, setCustomSubject] = useState('');
  
  // Feedback Modal State
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [reflection, setReflection] = useState('');
  
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  // Reset timer when settings change
  useEffect(() => {
    if (!isActive && mode === 'focus') {
      setTimeLeft(settings.timerDuration * 60);
    }
  }, [settings.timerDuration, isActive, mode]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      // Timer finished
      const soundUrl = settings.timerSound || 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg';
      const audio = new Audio(soundUrl);
      audio.volume = settings.volume / 100;
      audio.play().catch(e => console.error("Error playing sound", e));

      setIsActive(false); // Stop ticking

      if (mode === 'focus') {
        // FOCUS ENDED -> Show Feedback Modal
        setShowFeedback(true);
      } else {
        // BREAK ENDED -> Back to Focus
        setMode('focus');
        setTimeLeft(settings.timerDuration * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, settings]);

  const handleSubmitFeedback = () => {
      const finalSubject = selectedSubject === 'Other' ? (customSubject || 'General Focus') : selectedSubject;
      onSessionComplete(settings.timerDuration, finalSubject, rating, reflection);
      
      // Reset Feedback Form
      setShowFeedback(false);
      setRating(0);
      setReflection('');

      // Start Break
      setMode('break');
      setTimeLeft(settings.breakDuration * 60);
      setIsActive(true); // Auto-start break
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const skipBreak = () => {
    setMode('focus');
    setTimeLeft(settings.timerDuration * 60);
    setIsActive(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center relative z-10 transition-colors duration-500">
      
      {/* Break Mode Indicator */}
      {mode === 'break' && (
        <div className="absolute top-0 left-0 w-full h-full bg-green-900/20 pointer-events-none z-0 animate-pulse" />
      )}

      <div className="mb-8 max-w-2xl px-4 animate-fade-in-up z-10">
        {mode === 'focus' ? (
             <h2 className="text-xl md:text-2xl text-glassText font-light italic">"{quote}"</h2>
        ) : (
             <h2 className="text-3xl text-green-300 font-bold flex items-center justify-center gap-3">
                 <Coffee size={32} /> BREAK TIME
             </h2>
        )}
      </div>

      <div id="timer-display" className={`text-[6rem] md:text-[10rem] font-bold tracking-tighter leading-none mb-8 drop-shadow-2xl font-mono z-10 ${mode === 'break' ? 'text-green-400' : 'text-white'}`}>
        {formatTime(timeLeft)}
      </div>

      <div className="w-full max-w-md mb-8 z-10 flex flex-col items-center gap-3">
        {mode === 'focus' ? (
            <>
                <div className="flex gap-2 w-full justify-center">
                    <select 
                        value={selectedSubject} 
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="bg-white/10 border border-white/20 text-white text-lg py-2 px-4 rounded-lg focus:outline-none focus:border-accent text-center appearance-none cursor-pointer hover:bg-white/20 transition-colors"
                        disabled={isActive}
                    >
                        {SUBJECTS.map(s => <option key={s} value={s} className="bg-gray-900">{s}</option>)}
                    </select>
                </div>
                {selectedSubject === 'Other' && (
                    <input 
                        type="text" 
                        placeholder="Enter custom subject..." 
                        value={customSubject}
                        onChange={(e) => setCustomSubject(e.target.value)}
                        className="w-full bg-white/5 border-b-2 border-white/20 text-white text-center text-xl py-2 focus:outline-none focus:border-accent transition-colors placeholder-white/30"
                        disabled={isActive}
                    />
                )}
            </>
        ) : (
            <p className="text-xl text-white/80">Relax, breathe, and recharge.</p>
        )}
      </div>

      <div className="flex gap-4 z-10">
        <button 
          onClick={() => setIsActive(!isActive)}
          className={`rounded-full px-8 py-4 text-xl font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] ${mode === 'break' ? 'bg-green-500 text-black' : 'bg-white text-black'}`}
        >
          {isActive ? <Pause fill="black" /> : <Play fill="black" />}
          {isActive ? 'PAUSE' : mode === 'break' ? 'RESUME BREAK' : 'START FOCUS'}
        </button>
        
        {mode === 'break' && (
             <button onClick={skipBreak} className="glass-panel px-6 py-4 rounded-full text-white font-bold hover:bg-white/10">
                 Skip Break
             </button>
        )}
      </div>
      
      <div className="mt-8 text-sm text-gray-400 z-10">
        Level {user.level} • {user.title}
      </div>

      {/* Session Feedback Modal */}
      {showFeedback && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="glass-panel w-full max-w-lg p-8 rounded-2xl animate-fade-in-up flex flex-col items-center">
                  <h3 className="text-2xl font-bold text-white mb-2">Session Complete!</h3>
                  <p className="text-gray-400 mb-6">How was your focus?</p>
                  
                  <div className="flex gap-2 mb-6">
                      {[1, 2, 3, 4, 5].map((s) => (
                          <button 
                            key={s}
                            onClick={() => setRating(s)}
                            className={`p-2 transition-transform hover:scale-110 ${rating >= s ? 'text-yellow-400' : 'text-gray-600'}`}
                          >
                              <Star size={32} fill={rating >= s ? "currentColor" : "none"} />
                          </button>
                      ))}
                  </div>

                  <textarea 
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      placeholder="What did you accomplish? Any distractions?"
                      className="w-full h-32 bg-black/30 border border-white/10 rounded-xl p-4 text-white resize-none focus:border-accent outline-none mb-6"
                  />

                  <button 
                    onClick={handleSubmitFeedback}
                    className="w-full bg-accent text-white font-bold py-3 rounded-xl hover:bg-accent/80 transition-colors"
                  >
                      Save & Start Break
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

// 2. LEARN VIEW (Video + Voice Notes)
const LearnView = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [embedId, setEmbedId] = useState('');
  
  // Voice Note State
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<VoiceNote[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  const loadVideo = () => {
    // Extract video ID from standard YT urls
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = videoUrl.match(regExp);
    if (match && match[2].length === 11) {
      setEmbedId(match[2]);
    }
  };

  const startRecording = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          chunksRef.current = [];
          startTimeRef.current = Date.now();

          mediaRecorder.ondataavailable = (e) => {
              if (e.data.size > 0) chunksRef.current.push(e.data);
          };

          mediaRecorder.onstop = () => {
              const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
              const url = URL.createObjectURL(blob);
              const durationSec = Math.floor((Date.now() - startTimeRef.current) / 1000);
              const durationStr = `${Math.floor(durationSec/60)}:${String(durationSec%60).padStart(2,'0')}`;
              
              setRecordings(prev => [{
                  id: Date.now().toString(),
                  url,
                  date: new Date().toLocaleTimeString(),
                  duration: durationStr
              }, ...prev]);
              
              // Stop all tracks to release mic
              stream.getTracks().forEach(track => track.stop());
          };

          mediaRecorder.start();
          setIsRecording(true);
      } catch (err) {
          console.error("Error accessing microphone:", err);
          alert("Could not access microphone. Please check permissions.");
      }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
      }
  };

  const deleteRecording = (id: string) => {
      setRecordings(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="flex h-full w-full p-6 gap-6">
        {/* Left: Video Player */}
        <div className="flex-1 flex flex-col gap-4">
            <div className="glass-panel p-2 rounded-xl flex gap-2 w-full">
                <input 
                className="flex-1 bg-transparent text-white px-4 outline-none" 
                placeholder="Paste YouTube URL here..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadVideo()}
                />
                <button onClick={loadVideo} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg">Load</button>
            </div>
            <div className="flex-1 glass-panel rounded-xl overflow-hidden bg-black w-full shadow-2xl relative">
                {embedId ? (
                    <iframe 
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${embedId}`}
                        title="YouTube video player" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                    ></iframe>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 flex-col gap-4">
                        <GraduationCap size={64} className="opacity-20" />
                        <p>Load a lecture video to start.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Right: Voice Recorder */}
        <div className="w-80 glass-panel rounded-xl flex flex-col overflow-hidden shrink-0">
            <div className="p-4 border-b border-white/10 bg-white/5">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <Mic size={18} className="text-accent" /> Voice Notes
                </h3>
            </div>
            
            <div className="p-6 flex flex-col items-center justify-center border-b border-white/10 bg-black/20">
                {isRecording ? (
                    <div className="flex flex-col items-center animate-pulse">
                        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-2">
                            <Mic size={32} className="text-red-500" />
                        </div>
                        <span className="text-red-400 text-sm font-mono">Recording...</span>
                        <button onClick={stopRecording} className="mt-4 px-6 py-2 bg-red-600 rounded-full text-white font-bold hover:bg-red-700">Stop</button>
                    </div>
                ) : (
                    <button onClick={startRecording} className="flex flex-col items-center group">
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-2 group-hover:bg-accent/20 transition-colors">
                            <Mic size={32} className="text-gray-300 group-hover:text-accent" />
                        </div>
                        <span className="text-gray-400 text-sm">Tap to Record</span>
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {recordings.length === 0 && <p className="text-gray-500 text-center text-xs mt-10">No voice notes yet.</p>}
                {recordings.map(rec => (
                    <div key={rec.id} className="bg-white/5 p-3 rounded-lg border border-white/5">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-400">{rec.date}</span>
                            <span className="text-xs font-mono text-accent">{rec.duration}</span>
                        </div>
                        <audio src={rec.url} controls className="w-full h-8 mb-2 opacity-80" />
                        <div className="flex justify-end gap-2">
                            <a href={rec.url} download={`note-${rec.id}.webm`} className="text-gray-400 hover:text-white"><Download size={14} /></a>
                            <button onClick={() => deleteRecording(rec.id)} className="text-gray-400 hover:text-red-400"><Trash2 size={14} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

// 3. CALENDAR VIEW
const CalendarView = ({ sessions }: { sessions: Session[] }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    const getSessionsForDay = (day: number) => {
        const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0]; 
        const y = currentDate.getFullYear();
        const m = String(currentDate.getMonth() + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        const checkDate = `${y}-${m}-${d}`;
        return sessions.filter(s => s.date === checkDate);
    };

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`empty-${i}`} className="h-24 md:h-32 bg-transparent"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const daySessions = getSessionsForDay(day);
        const totalDuration = daySessions.reduce((acc, s) => acc + s.duration, 0);
        const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

        days.push(
            <div key={day} className={`h-24 md:h-32 glass-panel border-white/5 p-2 rounded-lg relative group transition-colors hover:bg-white/5 ${isToday ? 'border-accent/50 bg-accent/5' : ''}`}>
                <span className={`text-sm font-bold ${isToday ? 'text-accent' : 'text-gray-400'}`}>{day}</span>
                <div className="flex flex-wrap gap-1 mt-2 content-start">
                    {daySessions.map((s, idx) => (
                        <div key={idx} className="w-2 h-2 rounded-full bg-accent/80" title={`${s.subject} (${s.duration}m)`} />
                    ))}
                </div>
                {totalDuration > 0 && (
                     <div className="absolute bottom-2 right-2 text-xs text-gray-400 font-mono">
                         {Math.floor(totalDuration/60)}h {totalDuration%60}m
                     </div>
                )}
            </div>
        );
    }

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="h-full w-full p-6 md:p-8 flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white">
                    {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-2">
                    <button onClick={() => changeMonth(-1)} className="p-2 glass-panel rounded-full hover:bg-white/10"><ChevronLeft /></button>
                    <button onClick={() => changeMonth(1)} className="p-2 glass-panel rounded-full hover:bg-white/10"><ChevronRight /></button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-4 mb-2 text-center">
                {weekDays.map(d => (
                    <div key={d} className="text-gray-400 font-medium uppercase text-sm tracking-wider">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-2 md:gap-4 overflow-y-auto custom-scrollbar flex-1 pb-20">
                {days}
            </div>
        </div>
    );
};

// 4. DOUBTS VIEW (With Image Upload)
const DoubtsView = ({ doubts, addDoubt, toggleDoubtStatus, deleteDoubt }: any) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDoubt, setNewDoubt] = useState({ question: '', subject: '', priority: 'Medium' });
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [expandedImage, setExpandedImage] = useState<string | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        if(!newDoubt.question) return;
        addDoubt({ ...newDoubt, image: previewImage });
        setNewDoubt({ question: '', subject: '', priority: 'Medium' });
        setPreviewImage(null);
        setIsModalOpen(false);
    };

    return (
        <div className="h-full w-full p-8 overflow-y-auto pb-32">
             <div className="flex justify-between items-center mb-8">
                 <h1 className="text-3xl font-bold text-white">Doubts & Questions</h1>
                 <button onClick={() => setIsModalOpen(true)} className="bg-accent text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-accent/80 transition-colors shadow-lg shadow-accent/20">
                    <Plus size={18} /> Add Doubt
                 </button>
             </div>
             
             <div className="masonry-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {doubts.map((d: Doubt) => (
                     <div key={d.id} className={`glass-panel p-4 rounded-xl relative group flex flex-col gap-3 ${d.status === 'Solved' ? 'opacity-60' : ''}`}>
                         <div className="flex justify-between items-start">
                             <span className={`text-xs px-2 py-1 rounded ${d.priority === 'High' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'}`}>
                                 {d.priority}
                             </span>
                             <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={() => toggleDoubtStatus(d.id)} className="text-green-400 hover:text-green-300" title="Toggle Status">
                                    <RefreshCw size={16} />
                                 </button>
                                 <button onClick={() => deleteDoubt(d.id)} className="text-red-400 hover:text-red-300" title="Delete">
                                    <Trash2 size={16} />
                                 </button>
                             </div>
                         </div>
                         
                         <p className="text-white font-medium text-lg leading-snug">{d.question}</p>
                         {d.image && (
                             <div className="relative mt-2 rounded-lg overflow-hidden border border-white/10 cursor-pointer" onClick={() => setExpandedImage(d.image!)}>
                                 <img src={d.image} alt="Doubt attachment" className="w-full h-32 object-cover hover:scale-105 transition-transform" />
                             </div>
                         )}
                         <div className="flex justify-between items-center mt-auto border-t border-white/5 pt-3">
                             <span className="text-xs text-gray-400 font-mono uppercase tracking-wide">{d.subject || 'General'}</span>
                             <span className={`text-xs font-bold ${d.status === 'Solved' ? 'text-green-400' : 'text-yellow-400'}`}>{d.status}</span>
                         </div>
                     </div>
                 ))}
             </div>
             {expandedImage && (
                 <div className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setExpandedImage(null)}>
                     <img src={expandedImage} className="max-w-full max-h-full rounded-lg shadow-2xl" />
                 </div>
             )}
             {isModalOpen && (
                 <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                     <div className="glass-panel w-full max-w-md p-6 rounded-2xl animate-fade-in-up shadow-2xl border border-white/10">
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl text-white font-bold">New Doubt</h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="text-gray-400 hover:text-white" /></button>
                         </div>
                         <input 
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white mb-3 focus:border-accent outline-none transition-colors" 
                            placeholder="Subject (e.g., Physics)"
                            value={newDoubt.subject}
                            onChange={(e) => setNewDoubt({...newDoubt, subject: e.target.value})}
                         />
                         <textarea 
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white mb-3 h-32 resize-none focus:border-accent outline-none transition-colors" 
                            placeholder="What's your question?"
                            value={newDoubt.question}
                            onChange={(e) => setNewDoubt({...newDoubt, question: e.target.value})}
                         />
                         <div className="mb-4">
                            <label className="flex items-center gap-2 cursor-pointer w-fit text-sm text-gray-300 hover:text-white transition-colors">
                                <ImageIcon size={18} />
                                <span>{previewImage ? 'Change Image' : 'Attach Image'}</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                            {previewImage && (
                                <div className="mt-2 relative inline-block">
                                    <img src={previewImage} alt="Preview" className="h-20 w-auto rounded border border-white/20" />
                                    <button onClick={() => setPreviewImage(null)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-0.5 text-white hover:bg-red-600"><X size={12} /></button>
                                </div>
                            )}
                         </div>
                         <div className="flex gap-4 mb-6">
                            <select 
                                className="bg-black/30 border border-white/10 rounded-lg p-3 text-white flex-1 focus:border-accent outline-none"
                                value={newDoubt.priority}
                                onChange={(e) => setNewDoubt({...newDoubt, priority: e.target.value})}
                            >
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                            </select>
                         </div>
                         <div className="flex gap-2 justify-end pt-4 border-t border-white/10">
                             <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-300 hover:text-white font-medium">Cancel</button>
                             <button onClick={handleSubmit} className="px-6 py-2 bg-accent rounded-lg text-white font-bold hover:brightness-110 transition-all">Save Doubt</button>
                         </div>
                     </div>
                 </div>
             )}
        </div>
    )
}

// 6. MAIN APP COMPONENT
export default function App() {
  // State
  const [activeView, setActiveView] = useState<ViewState>('home');
  const [user, setUser] = useState<UserProfile>(INITIAL_PROFILE);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [forest, setForest] = useState<Tree[]>([]);
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    background: PRESET_BACKGROUNDS[0], // Using imported preset
    timerDuration: 25,
    breakDuration: 5,
    theme: 'glass',
    volume: 50,
    xpMultiplier: 1
  });
  
  const [ambientMode, setAmbientMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Load Data
  useEffect(() => {
    const savedUser = localStorage.getItem('godmode_user');
    const savedSessions = localStorage.getItem('godmode_sessions');
    const savedForest = localStorage.getItem('godmode_forest');
    const savedDoubts = localStorage.getItem('godmode_doubts');
    const savedSettings = localStorage.getItem('godmode_settings');

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedSessions) setSessions(JSON.parse(savedSessions));
    if (savedForest) setForest(JSON.parse(savedForest));
    if (savedDoubts) setDoubts(JSON.parse(savedDoubts));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
  }, []);

  // Save Data
  useEffect(() => {
    localStorage.setItem('godmode_user', JSON.stringify(user));
    localStorage.setItem('godmode_sessions', JSON.stringify(sessions));
    localStorage.setItem('godmode_forest', JSON.stringify(forest));
    localStorage.setItem('godmode_doubts', JSON.stringify(doubts));
    localStorage.setItem('godmode_settings', JSON.stringify(settings));
  }, [user, sessions, forest, doubts, settings]);

  // Logic: Session Complete
  const handleSessionComplete = (duration: number, subject: string, rating: number, reflection: string) => {
    // 1. Add Session
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    
    const newSession: Session = {
        id: Date.now().toString(),
        date: dateStr,
        duration: duration,
        subject: subject,
        rating,
        reflection
    };
    setSessions(prev => [...prev, newSession]);

    // 2. Add Tree
    const treeType = duration >= 45 ? 'oak' : duration >= 25 ? 'pine' : 'cherry';
    const newTree: Tree = {
        id: Date.now().toString(),
        type: Math.random() > 0.95 ? 'golden' : treeType,
        date: new Date().toLocaleDateString(),
        duration
    };
    setForest(prev => [newTree, ...prev]);

    // 3. Level Up User with Configurable XP
    const multiplier = settings.xpMultiplier || 1;
    const xpGained = Math.floor(duration * multiplier);
    const newXp = user.xp + xpGained;
    let newLevel = user.level;
    let newTitle = user.title;

    if (newXp >= LEVEL_THRESHOLDS.TIME_LORD) { newLevel = 5; newTitle = "Time Lord"; }
    else if (newXp >= LEVEL_THRESHOLDS.VETERAN) { newLevel = 4; newTitle = "Veteran"; }
    else if (newXp >= LEVEL_THRESHOLDS.FOCUSED) { newLevel = 3; newTitle = "Focused"; }
    else if (newXp >= LEVEL_THRESHOLDS.LEARNER) { newLevel = 2; newTitle = "Learner"; }
    else if (newXp >= 100 && user.level < 1) { newLevel = 1; }

    setUser({
        ...user,
        xp: newXp,
        level: newLevel,
        title: newTitle,
        streak: user.streak + (newSession.date !== user.lastActiveDate ? 1 : 0),
        lastActiveDate: newSession.date,
        coins: user.coins + Math.floor(duration / 10)
    });
  };

  // Logic: Doubts & Background Upload (existing code omitted for brevity as it remains same, included in full logic block above)
  const addDoubt = (data: Partial<Doubt>) => {
      const d: Doubt = {
          id: Date.now().toString(),
          question: data.question!,
          subject: data.subject || 'General',
          priority: (data.priority as any) || 'Medium',
          status: 'Pending',
          image: data.image,
          createdAt: new Date().toISOString()
      };
      setDoubts([...doubts, d]);
  };
  const toggleDoubtStatus = (id: string) => {
      setDoubts(doubts.map(d => d.id === id ? { ...d, status: d.status === 'Pending' ? 'Solved' : 'Pending' } : d));
  };
  const deleteDoubt = (id: string) => {
      setDoubts(doubts.filter(d => d.id !== id));
  };
  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              if (ev.target?.result) {
                  setSettings({ ...settings, background: ev.target.result as string });
              }
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };
  const handleTimerSoundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              if (ev.target?.result) {
                  setSettings({ ...settings, timerSound: ev.target.result as string });
              }
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  // Logic: Konami Code & Fullscreen
  useEffect(() => {
    let keys: string[] = [];
    const konami = "ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba";
    const handleKey = (e: KeyboardEvent) => {
        keys.push(e.key);
        keys = keys.slice(-10);
        if (keys.join('').includes(konami)) {
            setSettings(prev => ({ ...prev, theme: prev.theme === 'matrix' ? 'glass' : 'matrix' }));
        }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  return (
    <div className={`relative w-screen h-screen overflow-hidden text-white transition-colors duration-500 ${settings.theme === 'matrix' ? 'matrix-mode bg-black' : ''}`}>
      {/* Dynamic Background */}
      {settings.theme === 'glass' && (
          <div 
            id="bg-layer"
            className="absolute inset-0 bg-cover bg-center z-0 transition-all duration-1000 ease-in-out"
            style={{ backgroundImage: `url(${settings.background})`, filter: 'brightness(0.6)' }}
          />
      )}
      
      {/* Ambient Overlay to hide UI */}
      {ambientMode && (
          <div className="absolute inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end justify-center pb-10">
              <button 
                id="restore-ui-btn"
                onClick={() => setAmbientMode(false)}
                className="glass-panel px-6 py-2 rounded-full text-white hover:bg-white/10 transition-colors"
              >
                  Exit Ambient Mode
              </button>
          </div>
      )}

      {/* Main Content Area */}
      <main className={`relative z-10 w-full h-full pt-16 pb-24 ${ambientMode ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity duration-500`}>
         {activeView === 'home' && <HomeView user={user} settings={settings} onSessionComplete={handleSessionComplete} />}
         {activeView === 'dashboard' && <Dashboard user={user} sessions={sessions} forest={forest} />}
         {activeView === 'learn' && <LearnView />}
         {activeView === 'doubts' && <DoubtsView doubts={doubts} addDoubt={addDoubt} toggleDoubtStatus={toggleDoubtStatus} deleteDoubt={deleteDoubt} />}
         {activeView === 'calendar' && <CalendarView sessions={sessions} />}
      </main>

      {/* Global Widgets */}
      <div className={ambientMode ? 'hidden' : 'block'}>
        <LiveClock />
        <SpotifyWidget />
      </div>

      {/* Dock */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 ${ambientMode ? 'hidden' : 'flex'}`}>
          <div className="glass-panel px-4 py-3 rounded-2xl flex items-center gap-2 shadow-2xl backdrop-blur-xl border border-white/20">
              <NavIcon icon={<Home />} label="Home" active={activeView === 'home'} onClick={() => setActiveView('home')} />
              <NavIcon icon={<LayoutDashboard />} label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
              <NavIcon icon={<GraduationCap />} label="Learn" active={activeView === 'learn'} onClick={() => setActiveView('learn')} />
              <NavIcon icon={<HelpCircle />} label="Doubts" active={activeView === 'doubts'} onClick={() => setActiveView('doubts')} />
              <NavIcon icon={<CalIcon />} label="Calendar" active={activeView === 'calendar'} onClick={() => setActiveView('calendar')} />
              
              <div className="w-px h-8 bg-white/20 mx-2" />
              
              <NavIcon icon={<MonitorOff />} label="Ambient" onClick={() => setAmbientMode(true)} />
              <NavIcon icon={<Maximize />} label="Fullscreen" onClick={toggleFullScreen} />
              <NavIcon icon={<Settings />} label="Settings" onClick={() => setShowSettings(true)} />
          </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
          <div id="modal-settings" className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md flex items-center justify-center">
              <div className="glass-panel w-full max-w-2xl rounded-2xl p-8 animate-fade-in relative max-h-[90vh] overflow-y-auto">
                  <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><Minimize /></button>
                  <h2 className="text-2xl font-bold mb-6">Settings</h2>
                  
                  <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-300">Timer Duration: {settings.timerDuration} min</label>
                            <input 
                                type="range" min="5" max="90" step="5" 
                                value={settings.timerDuration}
                                onChange={(e) => setSettings({...settings, timerDuration: parseInt(e.target.value)})}
                                className="w-full accent-accent h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-300">Break Duration: {settings.breakDuration} min</label>
                            <input 
                                type="range" min="1" max="30" step="1" 
                                value={settings.breakDuration}
                                onChange={(e) => setSettings({...settings, breakDuration: parseInt(e.target.value)})}
                                className="w-full accent-green-400 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-300">XP Multiplier: x{settings.xpMultiplier || 1}</label>
                            <input 
                                type="range" min="0.5" max="5" step="0.5" 
                                value={settings.xpMultiplier || 1}
                                onChange={(e) => setSettings({...settings, xpMultiplier: parseFloat(e.target.value)})}
                                className="w-full accent-yellow-400 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-300">Timer Completion Sound</label>
                            <label className="flex items-center gap-2 cursor-pointer bg-white/5 hover:bg-white/10 p-2 rounded-lg border border-white/10 transition-colors">
                                <Volume2 size={18} />
                                <span className="text-sm truncate">{settings.timerSound ? 'Custom Sound Loaded' : 'Default Beep'}</span>
                                <input type="file" accept="audio/*" className="hidden" onChange={handleTimerSoundUpload} />
                            </label>
                            {settings.timerSound && (
                                <button 
                                    onClick={() => setSettings({...settings, timerSound: undefined})} 
                                    className="text-xs text-red-400 mt-1 hover:text-red-300"
                                >
                                    Reset to Default
                                </button>
                            )}
                        </div>
                      </div>

                      <div>
                          <label className="block text-sm font-medium mb-3 text-gray-300">Background Theme</label>
                          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                              {PRESET_BACKGROUNDS.map((bg, i) => (
                                  <div 
                                    key={i} 
                                    onClick={() => setSettings({...settings, background: bg})}
                                    className={`w-24 h-16 rounded-lg bg-cover bg-center cursor-pointer border-2 shrink-0 ${settings.background === bg ? 'border-accent' : 'border-transparent hover:border-white/50'}`}
                                    style={{ backgroundImage: `url(${bg})` }}
                                  />
                              ))}
                              <label className="w-24 h-16 rounded-lg border-2 border-dashed border-white/30 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 shrink-0">
                                  <span className="text-xs text-gray-400">Upload</span>
                                  <input type="file" accept="image/*" className="hidden" onChange={handleBgUpload} />
                              </label>
                          </div>
                      </div>

                      <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                          <button 
                            onClick={() => {
                                if(confirm("Are you sure? This will wipe all data.")) {
                                    localStorage.clear();
                                    window.location.reload();
                                }
                            }}
                            className="text-red-400 text-sm hover:text-red-300 flex items-center gap-1"
                          >
                             <Trash2 size={16} /> Factory Reset
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

// Helper Sub-component
const NavIcon = ({ icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`p-3 rounded-xl transition-all relative group ${active ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
    >
        {React.cloneElement(icon, { size: 20 })}
        {/* Tooltip */}
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {label}
        </span>
    </button>
);