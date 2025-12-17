import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { UserProfile, Session, Tree } from '../types';
import { Flame, Clock, Trophy, TreePine } from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  sessions: Session[];
  forest: Tree[];
}

export const Dashboard: React.FC<DashboardProps> = ({ user, sessions, forest }) => {
  
  // -- Chart Data Prep --
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const minutesPerDay = last7Days.map(date => {
    return sessions
      .filter(s => s.date === date)
      .reduce((acc, curr) => acc + curr.duration, 0);
  });

  const barData = {
    labels: last7Days.map(d => d.slice(5)), // MM-DD
    datasets: [{
      label: 'Focus Minutes',
      data: minutesPerDay,
      backgroundColor: 'rgba(139, 92, 246, 0.6)',
      borderColor: 'rgba(139, 92, 246, 1)',
      borderWidth: 1,
      borderRadius: 4,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Weekly Focus', color: '#fff' }
    },
    scales: {
      y: { ticks: { color: '#ccc' }, grid: { color: 'rgba(255,255,255,0.1)' } },
      x: { ticks: { color: '#ccc' }, grid: { display: false } }
    }
  };

  // -- Stats Calc --
  const totalMinutes = sessions.reduce((acc, s) => acc + s.duration, 0);
  const efficiency = totalMinutes > 0 ? 100 : 0; // Simplified for now

  return (
    <div className="w-full h-full p-8 overflow-y-auto pb-32 animate-fade-in flex flex-col gap-8">
      <h1 className="text-4xl font-bold text-white">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 shrink-0">
        <StatCard 
          icon={<Clock className="text-blue-400" />}
          label="Total Focus"
          value={`${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`}
        />
        <StatCard 
          icon={<TreePine className="text-green-400" />}
          label="Trees Grown"
          value={forest.length.toString()}
        />
        <StatCard 
          icon={<Flame className="text-orange-400" />}
          label="Streak"
          value={`${user.streak} Days`}
        />
        <StatCard 
          icon={<Trophy className="text-yellow-400" />}
          label="Current Rank"
          value={user.title}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[22rem] shrink-0">
        <div id="weeklyChart" className="glass-panel p-6 rounded-2xl flex flex-col">
          <div className="flex-1 min-h-0">
             <Bar data={barData} options={chartOptions} />
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
            <h3 className="text-white font-semibold mb-4 border-b border-white/10 pb-2">Productivity Score</h3>
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl font-bold text-accent mb-2">{efficiency}%</div>
                    <p className="text-gray-400">Efficiency Rating</p>
                </div>
            </div>
        </div>
      </div>

      {/* My Forest - Added margin-bottom/padding to ensure no collision */}
      <div id="forest-container" className="glass-panel p-6 rounded-2xl shrink-0 mb-8">
        <h3 className="text-white text-xl font-semibold mb-6">My Forest</h3>
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-4 max-h-64 overflow-y-auto custom-scrollbar p-2">
          {forest.length === 0 && <p className="text-gray-500 col-span-full text-center py-10">Start a session to plant your first tree!</p>}
          {forest.map((tree) => (
            <div key={tree.id} className="flex flex-col items-center group relative cursor-help">
              <span className="text-3xl filter drop-shadow-lg transition-transform hover:scale-125">
                {tree.type === 'oak' ? '🌳' : tree.type === 'pine' ? '🌲' : tree.type === 'cherry' ? '🌸' : '🏆'}
              </span>
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black/90 text-white text-xs p-2 rounded whitespace-nowrap z-10 pointer-events-none">
                {tree.date} ({tree.duration}m)
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 hover:bg-white/5 transition-colors">
    <div className="p-3 bg-white/10 rounded-full">
      {React.cloneElement(icon as React.ReactElement, { size: 24 })}
    </div>
    <div>
      <p className="text-gray-400 text-sm font-medium">{label}</p>
      <p className="text-white text-2xl font-bold">{value}</p>
    </div>
  </div>
);