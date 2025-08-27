import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

export default function PomodoroTimer() {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(15);
  const [currentMinutes, setCurrentMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [session, setSession] = useState(1);
  const [totalSessions, setTotalSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const totalTime = isBreak ? 
    (session % 4 === 0 ? longBreakMinutes : breakMinutes) : 
    workMinutes;
  const remainingTime = currentMinutes * 60 + seconds;
  const totalSeconds = totalTime * 60;
  const progress = ((totalSeconds - remainingTime) / totalSeconds) * 100;

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (currentMinutes > 0) {
          setCurrentMinutes(currentMinutes - 1);
          setSeconds(59);
        } else {
          // Timer finished
          setIsActive(false);
          playNotification();
          
          if (!isBreak) {
            // Work session finished, start break
            setTotalSessions(prev => prev + 1);
            setIsBreak(true);
            const nextBreakMinutes = session % 4 === 0 ? longBreakMinutes : breakMinutes;
            setCurrentMinutes(nextBreakMinutes);
            setSeconds(0);
            
            toast({
              title: "Work Session Complete!",
              description: `Time for a ${session % 4 === 0 ? 'long' : 'short'} break.`,
            });
          } else {
            // Break finished, start new work session
            setIsBreak(false);
            setCurrentMinutes(workMinutes);
            setSeconds(0);
            setSession(prev => prev + 1);
            
            toast({
              title: "Break Complete!",
              description: "Ready for the next work session?",
            });
          }
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, currentMinutes, seconds, isBreak, session, workMinutes, breakMinutes, longBreakMinutes]);

  const playNotification = () => {
    // Request notification permission
    if (Notification.permission === 'granted') {
      new Notification(`Pomodoro Timer`, {
        body: isBreak ? 'Break time is over!' : 'Work session complete!',
        icon: '/favicon.ico'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(`Pomodoro Timer`, {
            body: isBreak ? 'Break time is over!' : 'Work session complete!',
            icon: '/favicon.ico'
          });
        }
      });
    }

    // Play audio notification
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhCSGH0fPTgCkFJn/M8+SSRQ0VZrn3zrOjWg0VQKPS6ttjBjuByfTXhSwFT5fV8NCpXhMsJIHQ98e1cWMfNorW9cqPQQwXZ73vxJdJGAxOm+LvvmkhCylOhMfxLiGg2fLcSUmHy/LWDMOEyg=');
    audio.play().catch(() => {
      // Fallback if audio fails to play
      console.log('Audio notification failed');
    });
  };

  const startTimer = () => {
    setIsActive(true);
    // Request notification permission when starting
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setCurrentMinutes(workMinutes);
    setSeconds(0);
    setSession(1);
  };

  const skipSession = () => {
    if (!isBreak) {
      // Skip to break
      setTotalSessions(prev => prev + 1);
      setIsBreak(true);
      const nextBreakMinutes = session % 4 === 0 ? longBreakMinutes : breakMinutes;
      setCurrentMinutes(nextBreakMinutes);
      setSeconds(0);
    } else {
      // Skip break, go to next work session
      setIsBreak(false);
      setCurrentMinutes(workMinutes);
      setSeconds(0);
      setSession(prev => prev + 1);
    }
    setIsActive(false);
  };

  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Pomodoro Timer</h1>
          <p className="text-gray-600 dark:text-gray-400">Stay focused with the Pomodoro Technique</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Timer Display */}
          <Card className={`${isBreak ? 'bg-green-50 dark:bg-green-900/10' : 'bg-red-50 dark:bg-red-900/10'} transition-colors`}>
            <CardHeader>
              <CardTitle className={`text-center ${isBreak ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                {isBreak ? 
                  (session % 4 === 0 ? 'Long Break' : 'Short Break') : 
                  'Work Session'
                }
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="text-6xl font-mono font-bold text-gray-900 dark:text-white" data-testid="timer-display">
                {formatTime(currentMinutes, seconds)}
              </div>

              <Progress 
                value={progress} 
                className="h-4"
                data-testid="timer-progress"
              />

              <div className="flex justify-center space-x-4">
                {!isActive ? (
                  <Button onClick={startTimer} size="lg" data-testid="start-button">
                    <i className="fas fa-play mr-2"></i>
                    Start
                  </Button>
                ) : (
                  <Button onClick={pauseTimer} size="lg" variant="outline" data-testid="pause-button">
                    <i className="fas fa-pause mr-2"></i>
                    Pause
                  </Button>
                )}
                
                <Button onClick={resetTimer} size="lg" variant="outline" data-testid="reset-button">
                  <i className="fas fa-stop mr-2"></i>
                  Reset
                </Button>
                
                <Button onClick={skipSession} size="lg" variant="outline" data-testid="skip-button">
                  <i className="fas fa-forward mr-2"></i>
                  Skip
                </Button>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                Session {session} • Completed: {totalSessions}
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Timer Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="workMinutes">Work Duration (minutes)</Label>
                <Input
                  id="workMinutes"
                  type="number"
                  value={workMinutes}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setWorkMinutes(value);
                    if (!isActive && !isBreak) {
                      setCurrentMinutes(value);
                      setSeconds(0);
                    }
                  }}
                  min="1"
                  max="60"
                  disabled={isActive}
                  data-testid="work-minutes-input"
                />
              </div>

              <div>
                <Label htmlFor="breakMinutes">Short Break Duration (minutes)</Label>
                <Input
                  id="breakMinutes"
                  type="number"
                  value={breakMinutes}
                  onChange={(e) => setBreakMinutes(parseInt(e.target.value))}
                  min="1"
                  max="30"
                  disabled={isActive}
                  data-testid="break-minutes-input"
                />
              </div>

              <div>
                <Label htmlFor="longBreakMinutes">Long Break Duration (minutes)</Label>
                <Input
                  id="longBreakMinutes"
                  type="number"
                  value={longBreakMinutes}
                  onChange={(e) => setLongBreakMinutes(parseInt(e.target.value))}
                  min="1"
                  max="60"
                  disabled={isActive}
                  data-testid="long-break-minutes-input"
                />
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">How it works:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Work for 25 minutes (1 Pomodoro)</li>
                  <li>• Take a 5-minute short break</li>
                  <li>• After 4 Pomodoros, take a 15-30 minute long break</li>
                  <li>• Repeat the cycle</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Session Stats</h4>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400" data-testid="current-session">
                      {session}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Current</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-lg font-bold text-green-600 dark:text-green-400" data-testid="completed-sessions">
                      {totalSessions}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
