import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, Calendar, ExternalLink, Trash2, ChevronRight, Search, Clock, FileText, Globe,
  TrendingUp, Target, Lightbulb 
} from 'lucide-react';
import type { ArchivedTask } from '../types';
import type { ScoreResult } from '../agents/scorer';
import TwitterPreviewComponent from '../components/features/previews/TwitterPreview';
import LinkedInPreviewComponent from '../components/features/previews/LinkedInPreview';
import InstagramPreviewComponent from '../components/features/previews/InstagramPreview';
import YouTubePreviewComponent from '../components/features/previews/YouTubePreview';
import NewsletterPreviewComponent from '../components/features/previews/NewsletterPreview';

function ScoreBadge({ result }: { result?: ScoreResult | null }) {
  if (!result) return null;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'from-amber-400 to-orange-500 text-white';
    if (score >= 70) return 'from-emerald-400 to-teal-500 text-white';
    return 'from-indigo-400 to-purple-500 text-white';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`relative group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r ${getScoreColor(result.score)} shadow-lg shadow-indigo-500/10 cursor-help`}
    >
      <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider">
        <TrendingUp className="w-3.5 h-3.5" />
        {result.label}: {result.score}% 
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-0 mb-2 w-64 p-4 rounded-xl bg-gray-900 border border-white/10 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
        <p className="text-indigo-300 font-bold text-xs uppercase mb-2">AI Engagement Analysis</p>
        <ul className="space-y-1.5">
          {result.feedback?.map((f: string, i: number) => (
            <li key={i} className="text-gray-300 text-xs leading-tight flex gap-2">
              <span className="text-indigo-400 opacity-50">•</span>
              {f}
            </li>
          ))}
        </ul>
        <div className="absolute top-full left-6 -translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900 border-r border-b border-white/10" />
      </div>
    </motion.div>
  );
}

export function Archive() {
  const [history, setHistory] = useState<ArchivedTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<ArchivedTask | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('ai-studio-history');
    if (raw) {
      try {
        setHistory(JSON.parse(raw));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = history.filter(t => t.id !== id);
    setHistory(next);
    localStorage.setItem('ai-studio-history', JSON.stringify(next));
    if (selectedTask?.id === id) setSelectedTask(null);
  };

  const filteredHistory = history.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.sourceContent.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/30">
              <History className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">Archive & History</h1>
              <p className="text-gray-400 mt-1">Access your previous repurposing tasks</p>
            </div>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* List Section */}
          <div className={`lg:col-span-4 space-y-4 ${selectedTask ? 'hidden lg:block' : 'block'}`}>
            {filteredHistory.length === 0 ? (
              <div className="text-center py-20 rounded-3xl bg-white/5 border border-white/10 border-dashed">
                <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No history found</p>
                <p className="text-gray-600 text-sm mt-1">Start repurposing content to build your archive</p>
              </div>
            ) : (
              filteredHistory.map((task) => (
                <motion.div
                  layoutId={task.id}
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`group relative p-5 rounded-2xl border transition-all cursor-pointer ${
                    selectedTask?.id === task.id 
                    ? 'bg-indigo-500/20 border-indigo-500 shadow-xl shadow-indigo-500/10' 
                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {task.sourceType === 'url' ? (
                          <Globe className="w-3.5 h-3.5 text-blue-400" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        <span className="text-xs font-mono text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 opacity-50" />
                          {new Date(task.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-white font-semibold truncate leading-tight group-hover:text-indigo-300 transition-colors">
                        {task.title}
                      </h3>
                      <p className="text-gray-500 text-xs truncate">
                        {task.sourceContent.substring(0, 100)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDelete(task.id, e)}
                        className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className={`w-4 h-4 transition-all ${selectedTask?.id === task.id ? 'text-indigo-400 translate-x-1' : 'text-gray-600 group-hover:text-gray-400'}`} />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Detail Section */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {selectedTask ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  key={selectedTask.id}
                  className="space-y-8"
                >
                  {/* Detail Toolbar */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 lg:hidden">
                    <button 
                      onClick={() => setSelectedTask(null)}
                      className="text-indigo-400 text-sm font-medium flex items-center gap-1"
                    >
                      Back to list
                    </button>
                  </div>

                  {/* Strategy Info (Reused from Dashboard) */}
                  <div className="p-8 rounded-3xl bg-indigo-500/5 border border-indigo-500/20 backdrop-blur-xl">
                    <div className="flex items-center gap-2 mb-6">
                      <TrendingUp className="w-5 h-5 text-indigo-400" />
                      <h2 className="text-xl font-bold text-white tracking-tight">Historical Strategy Insight</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-indigo-300 font-medium">
                          <Target className="w-4 h-4" />
                          <span>Target Audience</span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {selectedTask.analysis.targetAudience}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-purple-300 font-medium">
                          <Lightbulb className="w-4 h-4" />
                          <span>Key Use Cases</span>
                        </div>
                        <ul className="space-y-2">
                          {selectedTask.analysis.useCases.map((useCase: string, i: number) => (
                            <li key={i} className="text-gray-300 text-sm flex gap-2">
                              <span className="text-indigo-500">•</span>
                              {useCase}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Previews */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
                    {selectedTask.previews.twitter && (
                      <div className="space-y-3">
                        <ScoreBadge result={selectedTask.previews.twitter.score} />
                        <TwitterPreviewComponent content={typeof selectedTask.previews.twitter === 'string' ? selectedTask.previews.twitter : selectedTask.previews.twitter.content} image={typeof selectedTask.previews.twitter === 'object' ? selectedTask.previews.twitter.image : undefined} />
                      </div>
                    )}
                    {selectedTask.previews.linkedin && (
                      <div className="space-y-3">
                        <ScoreBadge result={selectedTask.previews.linkedin.score} />
                        <LinkedInPreviewComponent content={typeof selectedTask.previews.linkedin === 'string' ? selectedTask.previews.linkedin : selectedTask.previews.linkedin.content} image={typeof selectedTask.previews.linkedin === 'object' ? selectedTask.previews.linkedin.image : undefined} />
                      </div>
                    )}
                    {selectedTask.previews.instagram && (
                      <div className="space-y-3">
                        <ScoreBadge result={selectedTask.previews.instagram.score} />
                        <InstagramPreviewComponent content={typeof selectedTask.previews.instagram === 'string' ? selectedTask.previews.instagram : selectedTask.previews.instagram.content} image={typeof selectedTask.previews.instagram === 'object' ? selectedTask.previews.instagram.image : undefined} />
                      </div>
                    )}
                    {selectedTask.previews.youtube && (
                      <div className="space-y-3">
                        <ScoreBadge result={selectedTask.previews.youtube.score} />
                        <YouTubePreviewComponent content={typeof selectedTask.previews.youtube === 'string' ? selectedTask.previews.youtube : selectedTask.previews.youtube.content} image={typeof selectedTask.previews.youtube === 'object' ? selectedTask.previews.youtube.image : undefined} />
                      </div>
                    )}
                    {selectedTask.previews.newsletter && (
                      <div className="space-y-3">
                        <ScoreBadge result={selectedTask.previews.newsletter.score} />
                        <NewsletterPreviewComponent content={typeof selectedTask.previews.newsletter === 'string' ? selectedTask.previews.newsletter : selectedTask.previews.newsletter.content} />
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-40 rounded-3xl bg-white/5 border border-white/10 border-dashed">
                  <div className="p-6 rounded-full bg-white/5 mb-6">
                    <ExternalLink className="w-12 h-12 text-gray-700" />
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">Select a task</h3>
                  <p className="text-gray-500 max-w-sm">
                    Select a previously completed task from the left to view the generated content and strategy.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
