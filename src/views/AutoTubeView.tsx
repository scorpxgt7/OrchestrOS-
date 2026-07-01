import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { 
  LayoutDashboard, 
  Video, 
  UploadCloud, 
  Calendar, 
  History, 
  Settings, 
  Bell, 
  Search, 
  Plus, 
  PlayCircle, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle,
  RefreshCw,
  Wand2,
  Youtube,
  BarChart3,
  Users,
  Menu,
  X
} from 'lucide-react';

// --- Mock Data & Initial State ---
const MOCK_VIDEOS = [
  { id: 'v1', title: '10 React Tips for 2026', status: 'published', views: 12500, likes: 1200, scheduledAt: '2026-06-28T10:00:00Z', duration: '12:34' },
  { id: 'v2', title: 'Building a SaaS in a Weekend', status: 'published', views: 8400, likes: 890, scheduledAt: '2026-06-25T14:30:00Z', duration: '45:12' },
  { id: 'v3', title: 'Why I left my FAANG Job', status: 'scheduled', views: 0, likes: 0, scheduledAt: '2026-07-01T09:00:00Z', duration: '18:20' },
  { id: 'v4', title: 'Advanced BullMQ Patterns', status: 'failed', views: 0, likes: 0, scheduledAt: '2026-06-29T08:00:00Z', duration: '22:15' },
];

const MOCK_JOBS = [
  { id: 'j1', videoId: 'v1', status: 'completed', attempts: 1, maxRetries: 5, error: null, updatedAt: '2026-06-28T10:05:00Z' },
  { id: 'j2', videoId: 'v2', status: 'completed', attempts: 1, maxRetries: 5, error: null, updatedAt: '2026-06-25T14:32:00Z' },
  { id: 'j3', videoId: 'v4', status: 'dead', attempts: 5, maxRetries: 5, error: 'YouTube API Quota Exceeded', updatedAt: '2026-06-29T08:15:00Z' },
];

// --- Contexts ---
const AppContext = createContext<any>(null);

// --- Components ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    published: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    scheduled: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    queued: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    processing: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    uploading: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    failed: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    dead: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    ready: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  const icons: Record<string, React.ReactNode> = {
    published: <CheckCircle2 className="w-3 h-3 mr-1" />,
    completed: <CheckCircle2 className="w-3 h-3 mr-1" />,
    scheduled: <Clock className="w-3 h-3 mr-1" />,
    queued: <Clock className="w-3 h-3 mr-1" />,
    processing: <RefreshCw className="w-3 h-3 mr-1 animate-spin" />,
    uploading: <RefreshCw className="w-3 h-3 mr-1 animate-spin" />,
    failed: <AlertCircle className="w-3 h-3 mr-1" />,
    dead: <XCircle className="w-3 h-3 mr-1" />,
    ready: <PlayCircle className="w-3 h-3 mr-1" />,
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.ready} capitalize`}>
      {icons[status]}
      {status}
    </span>
  );
};

// --- Pages ---

const Dashboard = () => {
  const { videos, jobs } = useContext(AppContext);
  
  const stats = useMemo(() => {
    const published = videos.filter((v: any) => v.status === 'published');
    const totalViews = published.reduce((acc: number, v: any) => acc + v.views, 0);
    const totalLikes = published.reduce((acc: number, v: any) => acc + v.likes, 0);
    const successRate = jobs.length ? Math.round((jobs.filter((j: any) => j.status === 'completed').length / jobs.length) * 100) : 0;
    
    return { published: published.length, totalViews, totalLikes, successRate };
  }, [videos, jobs]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: <BarChart3 className="w-5 h-5 text-[var(--brand-primary)]" />, trend: '+12%' },
          { label: 'Total Likes', value: stats.totalLikes.toLocaleString(), icon: <Youtube className="w-5 h-5 text-rose-400" />, trend: '+8%' },
          { label: 'Published Videos', value: stats.published, icon: <Video className="w-5 h-5 text-emerald-400" />, trend: '+2 this week' },
          { label: 'Upload Success Rate', value: `${stats.successRate}%`, icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />, trend: 'Healthy Queue' },
        ].map((stat, i) => (
          <div key={i} className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-[var(--text-secondary)]">{stat.label}</h3>
              <div className="p-2 bg-[var(--bg-surface-hover)] rounded-lg">{stat.icon}</div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</span>
              <span className="text-xs text-emerald-400 mt-1">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Recent Uploads</h2>
          <div className="space-y-4">
            {videos.slice(0, 4).map((video: any) => (
              <div key={video.id} className="flex items-center justify-between p-3 hover:bg-[var(--bg-surface-hover)] rounded-lg transition-colors border border-transparent hover:border-[var(--border-color)]">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[var(--bg-surface-hover)] rounded-lg flex items-center justify-center flex-shrink-0">
                    <PlayCircle className="w-6 h-6 text-[var(--text-secondary)]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-[var(--text-primary)] line-clamp-1">{video.title}</h4>
                    <p className="text-xs text-[var(--text-muted)]">{new Date(video.scheduledAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <StatusBadge status={video.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">System Queue</h2>
          <div className="space-y-4">
            {jobs.slice(0, 4).map((job: any) => {
              const video = videos.find((v: any) => v.id === job.videoId);
              return (
                <div key={job.id} className="flex flex-col p-3 bg-[var(--bg-surface-hover)] rounded-lg border border-[var(--border-color)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-[var(--text-secondary)]">Job: {job.id}</span>
                    <StatusBadge status={job.status} />
                  </div>
                  <p className="text-sm text-[var(--text-primary)] truncate">{video?.title || 'Unknown Video'}</p>
                  {job.error && (
                    <p className="text-xs text-rose-400 mt-2 bg-rose-500/10 p-2 rounded border border-rose-500/20">
                      Error: {job.error} (Attempt {job.attempts}/{job.maxRetries})
                    </p>
                  )}
                </div>
              )
            })}
            {jobs.length === 0 && <p className="text-sm text-[var(--text-secondary)]">Queue is empty.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const VideoLibrary = () => {
  const { videos } = useContext(AppContext);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-color)] bg-[var(--bg-surface)]">
              <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Video</th>
              <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
              <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Date</th>
              <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider text-right">Metrics</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {videos.map((video: any) => (
              <tr key={video.id} className="hover:bg-[var(--bg-surface-hover)] transition-colors">
                <td className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-10 bg-[var(--bg-surface)] rounded flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                      <PlayCircle className="w-5 h-5 text-[var(--text-secondary)]" />
                      {video.duration && <span className="absolute bottom-1 right-1 bg-black/70 text-[10px] px-1 rounded text-white">{video.duration}</span>}
                    </div>
                    <span className="font-medium text-sm text-[var(--text-primary)] line-clamp-2">{video.title}</span>
                  </div>
                </td>
                <td className="p-4"><StatusBadge status={video.status} /></td>
                <td className="p-4 text-sm text-[var(--text-secondary)]">
                  {new Date(video.scheduledAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end space-x-3 text-sm text-[var(--text-secondary)]">
                    <span className="flex items-center"><BarChart3 className="w-4 h-4 mr-1"/> {video.views > 0 ? video.views : '-'}</span>
                    <span className="flex items-center"><Youtube className="w-4 h-4 mr-1"/> {video.likes > 0 ? video.likes : '-'}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const UploadForm = ({ navigateTo }: { navigateTo: (tab: string) => void }) => {
  const { setVideos, setJobs } = useContext(AppContext);
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<any>(null);
  const [formData, setFormData] = useState({ title: '', description: '', tags: '', scheduledDate: '', scheduledTime: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileDrop = (e: any) => {
    e.preventDefault();
    setFile({ name: 'awesome_video_final.mp4', size: '245 MB' });
    setTimeout(() => setStep(2), 800);
  };

  const handleGenerateAI = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        title: "🚀 Mastering Full-Stack Architecture in 2026 (Ultimate Guide)",
        description: "In this comprehensive guide, we break down the ultimate full-stack architecture using React, Node, and BullMQ.\n\nTimestamps:\n0:00 Intro\n1:20 The Architecture\n5:00 BullMQ Magic",
        tags: "webdev, react, nodejs, architecture, tutorial",
      }));
      setIsGenerating(false);
    }, 1500);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      const newVideoId = `v-${Date.now()}`;
      const newJobId = `job-${Date.now()}`;
      const isScheduled = formData.scheduledDate && formData.scheduledTime;
      
      let scheduledDateTime = new Date();
      if (isScheduled) {
        scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      }

      setVideos((prev: any) => [{
        id: newVideoId,
        title: formData.title || file.name,
        status: isScheduled ? 'scheduled' : 'uploading',
        views: 0,
        likes: 0,
        scheduledAt: scheduledDateTime.toISOString(),
        duration: '00:00'
      }, ...prev]);

      if (!isScheduled) {
        setJobs((prev: any) => [{
          id: newJobId,
          videoId: newVideoId,
          status: 'queued',
          attempts: 0,
          maxRetries: 5,
          error: null,
          updatedAt: new Date().toISOString()
        }, ...prev]);
      }

      setIsSubmitting(false);
      navigateTo('history');
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-3xl animate-in fade-in duration-500">
      <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl p-6 backdrop-blur-sm">
        {step === 1 ? (
          <div 
            onDragOver={(e) => e.preventDefault()} 
            onDrop={handleFileDrop}
            className="border-2 border-dashed border-[var(--border-color)] rounded-xl p-12 text-center hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer group"
            onClick={() => handleFileDrop({ preventDefault: () => {} })}
          >
            <div className="w-16 h-16 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">Drag and drop your video file</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6">MP4, MOV, WebM up to 128GB</p>
            <button className="bg-[var(--brand-primary)] hover:opacity-90 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Select Files
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between bg-[var(--bg-surface)] p-4 rounded-lg border border-[var(--border-color)]">
              <div className="flex items-center space-x-3">
                <Video className="text-[var(--brand-primary)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{file.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{file.size} • Uploaded successfully</p>
                </div>
              </div>
              <button type="button" onClick={() => setStep(1)} className="text-sm text-[var(--brand-primary)] hover:underline">Change</button>
            </div>

            <div className="flex justify-end">
              <button 
                type="button" 
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-[var(--brand-primary)] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
              >
                {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                <span>{isGenerating ? 'Analyzing Video...' : 'Generate AI Metadata'}</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] transition-all"
                  placeholder="Enter video title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Description</label>
                <textarea 
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] transition-all"
                  placeholder="Tell viewers about your video"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Tags (comma separated)</label>
                <input 
                  type="text" 
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] transition-all"
                  placeholder="gaming, tutorial, review"
                />
              </div>
            </div>

            <div className="border-t border-[var(--border-color)] pt-6">
              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">Scheduling</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Date</label>
                  <input 
                    type="date" 
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Time (Local)</label>
                  <input 
                    type="time" 
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2">Leave blank to queue for immediate publishing.</p>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-[var(--brand-primary)] hover:opacity-90 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center disabled:opacity-70"
              >
                {isSubmitting ? (
                  <><RefreshCw className="w-5 h-5 animate-spin mr-2" /> Processing...</>
                ) : (
                  formData.scheduledDate ? 'Schedule & Process' : 'Process & Upload Now'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const UploadHistory = () => {
  const { jobs, setJobs, videos, setVideos } = useContext(AppContext);

  const handleRetry = (jobId: string) => {
    setJobs((prev: any) => prev.map((job: any) => {
      if (job.id === jobId) {
        return { ...job, status: 'queued', attempts: 0, error: null };
      }
      return job;
    }));
    
    const job = jobs.find((j: any) => j.id === jobId);
    if (job) {
      setVideos((prev: any) => prev.map((v: any) => v.id === job.videoId ? { ...v, status: 'uploading' } : v));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-color)] bg-[var(--bg-surface)]">
              <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Job ID</th>
              <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Video</th>
              <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
              <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Attempts</th>
              <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {jobs.map((job: any) => {
              const video = videos.find((v: any) => v.id === job.videoId);
              return (
                <tr key={job.id} className="hover:bg-[var(--bg-surface-hover)] transition-colors">
                  <td className="p-4 font-mono text-xs text-[var(--text-secondary)]">{job.id}</td>
                  <td className="p-4">
                    <span className="font-medium text-sm text-[var(--text-primary)] block line-clamp-1">{video?.title || 'Unknown'}</span>
                    {job.error && <span className="text-xs text-rose-400 block mt-1">{job.error}</span>}
                  </td>
                  <td className="p-4"><StatusBadge status={job.status} /></td>
                  <td className="p-4 text-sm text-[var(--text-secondary)]">
                    {job.attempts} / {job.maxRetries}
                  </td>
                  <td className="p-4 text-right">
                    {(job.status === 'dead' || job.status === 'failed') && (
                      <button 
                        onClick={() => handleRetry(job.id)}
                        className="text-[var(--brand-primary)] hover:opacity-80 text-sm font-medium flex items-center justify-end w-full"
                      >
                        <RefreshCw className="w-4 h-4 mr-1" /> Retry
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
            {jobs.length === 0 && (
               <tr><td colSpan={5} className="p-8 text-center text-[var(--text-secondary)]">No jobs in system.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


// --- Main Application ---

export default function AutoTubeView() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // App State Simulation
  const [videos, setVideos] = useState(MOCK_VIDEOS);
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const [youtubeConnected, setYoutubeConnected] = useState(true);

  // Background Worker Simulation (BullMQ mock)
  useEffect(() => {
    const workerInterval = setInterval(() => {
      setJobs((prevJobs: any) => {
        let queueChanged = false;
        
        const newJobs = prevJobs.map((job: any) => {
          if (job.status === 'queued') {
            queueChanged = true;
            return { ...job, status: 'processing', updatedAt: new Date().toISOString() };
          }
          
          if (job.status === 'processing') {
            queueChanged = true;
            const isSuccess = Math.random() > 0.4; 
            
            if (isSuccess) {
              setVideos((vids: any) => vids.map((v: any) => v.id === job.videoId ? { ...v, status: 'published' } : v));
              return { ...job, status: 'completed', updatedAt: new Date().toISOString() };
            } else {
              const newAttempts = job.attempts + 1;
              if (newAttempts >= job.maxRetries) {
                setVideos((vids: any) => vids.map((v: any) => v.id === job.videoId ? { ...v, status: 'failed' } : v));
                return { ...job, status: 'dead', attempts: newAttempts, error: 'YouTube API Timeout / Quota limit', updatedAt: new Date().toISOString() };
              }
              return { ...job, status: 'queued', attempts: newAttempts, error: 'Connection reset, retrying...', updatedAt: new Date().toISOString() };
            }
          }
          return job;
        });

        return queueChanged ? newJobs : prevJobs;
      });
    }, 4000);

    return () => clearInterval(workerInterval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'videos', label: 'Library', icon: <Video className="w-4 h-4" /> },
    { id: 'upload', label: 'Upload', icon: <UploadCloud className="w-4 h-4" /> },
    { id: 'history', label: 'Queue', icon: <History className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <AppContext.Provider value={{ videos, setVideos, jobs, setJobs, youtubeConnected, setYoutubeConnected }}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">Agent: YouTube AutoTube</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Specialized workspace for automated video uploads, metadata generation, and publishing queues.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                Agent Online
             </div>
          </div>
        </div>

        {/* Custom App Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar space-x-1 border-b border-[var(--border-color)]">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === item.id 
                  ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]' 
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-color)]'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="pt-2">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'videos' && <VideoLibrary />}
          {activeTab === 'upload' && <UploadForm navigateTo={setActiveTab} />}
          {activeTab === 'history' && <UploadHistory />}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl">
              <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Integrations</h3>
                <div className="flex items-center justify-between p-4 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center">
                      <Youtube className="w-6 h-6 text-rose-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--text-primary)]">YouTube Data API v3</h4>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {youtubeConnected ? 'Connected as @TechWithAI' : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setYoutubeConnected(!youtubeConnected)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                      youtubeConnected 
                        ? 'bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-color)]' 
                        : 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20'
                    }`}
                  >
                    {youtubeConnected ? 'Disconnect' : 'Connect Channel'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppContext.Provider>
  );
}
