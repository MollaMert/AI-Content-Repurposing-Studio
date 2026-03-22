import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, AlertCircle, Sparkles, CheckCircle } from 'lucide-react';

interface LoadingStateProps {
  stage: string;
  progress: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
}

const stages = [
  { id: 'Analyzing', label: 'Analyzing', icon: Search, description: 'Scanning your content...' },
  { id: 'Critiquing', label: 'Critiquing', icon: AlertCircle, description: 'Evaluating quality...' },
  { id: 'Generating', label: 'Generating', icon: Sparkles, description: 'Creating drafts...' },
  { id: 'Complete', label: 'Complete', icon: CheckCircle, description: 'Ready to publish!' },
];

export function LoadingState({ stage, progress }: LoadingStateProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [confetti, setConfetti] = useState<number[]>([]);

  useEffect(() => {
    if (stage === 'Generating') {
      const newParticles: Particle[] = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 2 + 1,
      }));
      const t = setTimeout(() => setParticles(newParticles), 0);
      return () => clearTimeout(t);
    }
  }, [stage]);

  useEffect(() => {
    if (stage === 'Complete') {
      const confettiCount = 20;
      const newConfetti = Array.from({ length: confettiCount }, (_, i) => i);
      const t = setTimeout(() => {
        setConfetti(newConfetti);
        setTimeout(() => setConfetti([]), 3000);
      }, 0);
      return () => clearTimeout(t);
    }
  }, [stage]);

  const currentStage = stages.find(s => s.id === stage) || stages[0];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-[300px] h-[200px] relative flex items-center justify-center"
    >
      {/* Glass Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-indigo-950/80 to-purple-950/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent" />
      </div>

      {/* Confetti */}
      {stage === 'Complete' && confetti.map(i => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'][i % 4],
            boxShadow: `0 0 6px ${['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'][i % 4]}`,
          }}
          initial={{ x: 150, y: 100, scale: 0 }}
          animate={{
            x: 50 + (i % 5) * 40,
            y: 20 + Math.floor(i / 5) * 30,
            scale: [0, 1, 1, 0],
            rotate: [0, 180, 360],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 2,
            delay: i * 0.05,
            repeat: 1,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-4 p-6 w-full">
        {/* Icon Container */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          {stage === 'Analyzing' && (
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Search className="w-10 h-10 text-indigo-400" strokeWidth={2} />
            </motion.div>
          )}

          {stage === 'Critiquing' && (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 w-12 h-12 border-2 border-amber-400/30 rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 w-16 h-16 border-2 border-amber-400/20 rounded-full"
              />
              <AlertCircle className="w-10 h-10 text-amber-400" strokeWidth={2} />
            </>
          )}

          {stage === 'Generating' && (
            <>
              {particles.map(p => (
                <motion.div
                  key={p.id}
                  className="absolute w-1 h-1 bg-purple-400 rounded-full"
                  animate={{
                    x: (p.x - 50) * 2,
                    y: (p.y - 50) * 2,
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: p.duration,
                    repeat: Infinity,
                    delay: p.id * 0.2,
                  }}
                />
              ))}
              <Sparkles className="w-10 h-10 text-purple-400" strokeWidth={2} />
            </>
          )}

          {stage === 'Complete' && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <CheckCircle className="w-14 h-14 text-green-400" strokeWidth={2} />
            </motion.div>
          )}
        </div>

        {/* Stage Label */}
        <motion.div
          key={stage}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h3 className="text-white text-base font-semibold mb-1">
            {currentStage.label}
          </h3>
          <p className="text-gray-400 text-xs">
            {currentStage.description}
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="w-full space-y-1.5">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Processing</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
