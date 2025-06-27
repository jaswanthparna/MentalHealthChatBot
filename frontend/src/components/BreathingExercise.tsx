
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wind, Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BreathingPattern {
  name: string;
  inhale: number;
  hold: number;
  exhale: number;
  description: string;
}

const breathingPatterns: BreathingPattern[] = [
  {
    name: '4-4-6 (Relaxing)',
    inhale: 4000,
    hold: 4000,
    exhale: 6000,
    description: 'Great for general relaxation and stress relief'
  },
  {
    name: '4-7-8 (Sleep)',
    inhale: 4000,
    hold: 7000,
    exhale: 8000,
    description: 'Ideal for falling asleep and deep relaxation'
  },
  {
    name: '6-2-6 (Balanced)',
    inhale: 6000,
    hold: 2000,
    exhale: 6000,
    description: 'Balanced breathing for focus and calm'
  },
  {
    name: '4-4-4 (Box)',
    inhale: 4000,
    hold: 4000,
    exhale: 4000,
    description: 'Box breathing for anxiety and stress management'
  }
];

const BreathingExercise: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [currentPattern, setCurrentPattern] = useState(breathingPatterns[0]);
  const [cycleCount, setCycleCount] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      startSessionTimer();
      breathingCycle();
    } else {
      stopAllTimers();
    }

    return () => stopAllTimers();
  }, [isActive, currentPattern]);

  const stopAllTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
  };

  const startSessionTimer = () => {
    sessionTimerRef.current = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
  };

  const breathingCycle = () => {
    const phases = [
      { phase: 'inhale' as const, duration: currentPattern.inhale, next: 'hold' as const },
      { phase: 'hold' as const, duration: currentPattern.hold, next: 'exhale' as const },
      { phase: 'exhale' as const, duration: currentPattern.exhale, next: 'inhale' as const },
    ];

    let currentPhaseIndex = 0;

    const cycle = () => {
      if (!isActive) return;

      const current = phases[currentPhaseIndex];
      setPhase(current.phase);
      
      // Increment cycle count when starting a new inhale phase
      if (current.phase === 'inhale' && currentPhaseIndex === 0 && cycleCount > 0) {
        setCycleCount(prev => prev + 1);
      } else if (current.phase === 'inhale' && cycleCount === 0) {
        setCycleCount(1);
      }
      
      timerRef.current = setTimeout(() => {
        currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
        if (isActive) cycle();
      }, current.duration);
    };

    cycle();
  };

  const startExercise = () => {
    setIsActive(true);
    setCycleCount(0);
    setSessionTime(0);
  };

  const stopExercise = () => {
    setIsActive(false);
    setPhase('inhale');
    stopAllTimers();
  };

  const restartExercise = () => {
    stopExercise();
    setTimeout(startExercise, 100);
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'inhale': return 'Breathe in slowly through your nose...';
      case 'hold': return 'Hold your breath gently...';
      case 'exhale': return 'Breathe out slowly through your mouth...';
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale': return 'border-green-400 bg-green-100';
      case 'hold': return 'border-yellow-400 bg-yellow-100';
      case 'exhale': return 'border-blue-400 bg-blue-100';
    }
  };

  const getPhaseIconColor = () => {
    switch (phase) {
      case 'inhale': return 'text-green-600';
      case 'hold': return 'text-yellow-600';
      case 'exhale': return 'text-blue-600';
    }
  };

  const getCircleScale = () => {
    switch (phase) {
      case 'inhale': return 'scale-110';
      case 'hold': return 'scale-100';
      case 'exhale': return 'scale-75';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-white/70 backdrop-blur-md border-indigo-100 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wind className="w-5 h-5 text-blue-500" />
            <span>Breathing Exercise</span>
          </div>
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Breathing Pattern Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Pattern
                  </label>
                  <Select
                    value={currentPattern.name}
                    onValueChange={(value) => {
                      const pattern = breathingPatterns.find(p => p.name === value);
                      if (pattern) {
                        setCurrentPattern(pattern);
                        if (isActive) {
                          restartExercise();
                        }
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {breathingPatterns.map((pattern) => (
                        <SelectItem key={pattern.name} value={pattern.name}>
                          {pattern.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-1">
                    {currentPattern.name}
                  </p>
                  <p className="text-xs text-blue-700">
                    {currentPattern.description}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Inhale: {currentPattern.inhale/1000}s | Hold: {currentPattern.hold/1000}s | Exhale: {currentPattern.exhale/1000}s
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        {/* Breathing Circle */}
        <div className="relative">
          <div className={`w-32 h-32 mx-auto rounded-full border-4 transition-all duration-1000 flex items-center justify-center ${
            isActive 
              ? `${getPhaseColor()} ${getCircleScale()}`
              : 'border-gray-300 bg-gray-100'
          }`}>
            <Wind className={`w-12 h-12 transition-colors duration-500 ${
              isActive ? getPhaseIconColor() : 'text-gray-400'
            }`} />
          </div>
        </div>
        
        {/* Instruction Text */}
        <div className="space-y-2">
          <p className="text-lg font-semibold text-gray-800">
            {isActive ? getPhaseInstruction() : 'Ready to breathe mindfully?'}
          </p>
          <p className="text-sm text-gray-600">
            {isActive 
              ? `${currentPattern.name} breathing pattern` 
              : `Current pattern: ${currentPattern.name}`
            }
          </p>
        </div>

        {/* Stats */}
        {isActive && (
          <div className="flex justify-center space-x-6 text-sm text-gray-600">
            <div className="text-center">
              <div className="font-semibold text-indigo-600">{cycleCount}</div>
              <div>Cycles</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-indigo-600">{formatTime(sessionTime)}</div>
              <div>Time</div>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex justify-center space-x-3">
          {!isActive ? (
            <Button
              onClick={startExercise}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Start
            </Button>
          ) : (
            <>
              <Button
                onClick={stopExercise}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <Pause className="w-4 h-4 mr-2" />
                Stop
              </Button>
              <Button
                onClick={restartExercise}
                variant="outline"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restart
              </Button>
            </>
          )}
        </div>

        {/* Instructions */}
        {!isActive && (
          <div className="text-xs text-gray-500 max-w-sm mx-auto">
            <p>Find a comfortable position, close your eyes if you'd like, and follow the breathing rhythm. Focus on the sensation of your breath.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BreathingExercise;
