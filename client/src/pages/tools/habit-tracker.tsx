import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Habit {
  id: string;
  name: string;
  description: string;
  color: string;
  targetDays: number;
  createdAt: Date;
  completions: { [date: string]: boolean };
}

export default function HabitTracker() {
  const { toast } = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitName, setHabitName] = useState("");
  const [habitDescription, setHabitDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState("#3b82f6");

  const colors = [
    { name: "Blue", value: "#3b82f6" },
    { name: "Green", value: "#10b981" },
    { name: "Purple", value: "#8b5cf6" },
    { name: "Red", value: "#ef4444" },
    { name: "Orange", value: "#f59e0b" },
    { name: "Pink", value: "#ec4899" },
    { name: "Indigo", value: "#6366f1" },
    { name: "Teal", value: "#14b8a6" },
  ];

  // Load habits from localStorage
  useEffect(() => {
    const savedHabits = localStorage.getItem('habit-tracker-data');
    if (savedHabits) {
      const parsedHabits = JSON.parse(savedHabits);
      const habitsWithDates = parsedHabits.map((habit: any) => ({
        ...habit,
        createdAt: new Date(habit.createdAt)
      }));
      setHabits(habitsWithDates);
    }
  }, []);

  // Save habits to localStorage
  useEffect(() => {
    localStorage.setItem('habit-tracker-data', JSON.stringify(habits));
  }, [habits]);

  const addHabit = () => {
    if (!habitName.trim()) {
      toast({
        title: "Habit name required",
        description: "Please enter a name for your habit",
        variant: "destructive"
      });
      return;
    }

    const newHabit: Habit = {
      id: Date.now().toString(),
      name: habitName.trim(),
      description: habitDescription.trim(),
      color: selectedColor,
      targetDays: 30,
      createdAt: new Date(),
      completions: {}
    };

    setHabits(prev => [newHabit, ...prev]);
    setHabitName("");
    setHabitDescription("");
    
    toast({
      title: "Habit added!",
      description: "Start tracking your new habit today"
    });
  };

  const toggleHabitCompletion = (habitId: string, date: string) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const newCompletions = { ...habit.completions };
        newCompletions[date] = !newCompletions[date];
        return { ...habit, completions: newCompletions };
      }
      return habit;
    }));
  };

  const deleteHabit = (habitId: string) => {
    setHabits(prev => prev.filter(habit => habit.id !== habitId));
    toast({
      title: "Habit deleted",
      description: "The habit has been removed from your tracker"
    });
  };

  const getDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const generateWeekDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date);
    }
    return dates;
  };

  const getHabitStats = (habit: Habit) => {
    const weekDates = generateWeekDates();
    const completedThisWeek = weekDates.filter(date => 
      habit.completions[getDateString(date)]
    ).length;
    
    const totalCompletions = Object.values(habit.completions).filter(Boolean).length;
    const streak = getCurrentStreak(habit);
    
    return {
      completedThisWeek,
      totalCompletions,
      streak,
      weeklyProgress: (completedThisWeek / 7) * 100
    };
  };

  const getCurrentStreak = (habit: Habit) => {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = getDateString(date);
      
      if (habit.completions[dateString]) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const weekDates = generateWeekDates();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Habit Tracker</h1>
        <p className="text-muted-foreground">
          Build and track daily habits to achieve your goals
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Habit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Habit</CardTitle>
            <CardDescription>
              Create a new habit to track daily
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="habit-name">Habit Name</Label>
              <Input
                id="habit-name"
                placeholder="e.g., Read for 30 minutes"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                data-testid="input-habit-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="habit-description">Description (Optional)</Label>
              <Input
                id="habit-description"
                placeholder="Why is this habit important?"
                value={habitDescription}
                onChange={(e) => setHabitDescription(e.target.value)}
                data-testid="input-habit-description"
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    className={`w-8 h-8 rounded-full border-2 ${
                      selectedColor === color.value ? 'border-gray-400' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setSelectedColor(color.value)}
                    data-testid={`color-${color.name.toLowerCase()}`}
                  />
                ))}
              </div>
            </div>

            <Button onClick={addHabit} className="w-full" data-testid="button-add-habit">
              Add Habit
            </Button>
          </CardContent>
        </Card>

        {/* Habits List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Your Habits</CardTitle>
            <CardDescription>
              Track your daily progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            {habits.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No habits yet</p>
                <p className="text-sm">Add your first habit to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {habits.map((habit) => {
                  const stats = getHabitStats(habit);
                  return (
                    <Card key={habit.id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: habit.color }}
                            />
                            <div>
                              <h3 className="font-semibold">{habit.name}</h3>
                              {habit.description && (
                                <p className="text-sm text-muted-foreground">
                                  {habit.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteHabit(habit.id)}
                            data-testid={`delete-habit-${habit.id}`}
                          >
                            Delete
                          </Button>
                        </div>

                        {/* Week Progress */}
                        <div className="grid grid-cols-7 gap-2">
                          {weekDates.map((date) => {
                            const dateString = getDateString(date);
                            const isCompleted = habit.completions[dateString];
                            const isToday = dateString === getDateString(new Date());
                            
                            return (
                              <button
                                key={dateString}
                                onClick={() => toggleHabitCompletion(habit.id, dateString)}
                                className={`
                                  aspect-square rounded-lg border-2 text-xs font-medium
                                  ${isCompleted 
                                    ? 'border-green-500 bg-green-500 text-white' 
                                    : 'border-gray-200 hover:border-gray-300'
                                  }
                                  ${isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                                `}
                                data-testid={`habit-${habit.id}-date-${dateString}`}
                              >
                                {date.getDate()}
                              </button>
                            );
                          })}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-lg font-bold" data-testid={`streak-${habit.id}`}>
                              {stats.streak}
                            </div>
                            <div className="text-sm text-muted-foreground">Day Streak</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold" data-testid={`week-progress-${habit.id}`}>
                              {stats.completedThisWeek}/7
                            </div>
                            <div className="text-sm text-muted-foreground">This Week</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold" data-testid={`total-${habit.id}`}>
                              {stats.totalCompletions}
                            </div>
                            <div className="text-sm text-muted-foreground">Total Days</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Weekly Progress</span>
                            <span>{stats.completedThisWeek}/7 days</span>
                          </div>
                          <Progress value={stats.weeklyProgress} className="h-2" />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Overall Stats */}
      {habits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold" data-testid="total-habits">
                  {habits.length}
                </div>
                <div className="text-sm text-muted-foreground">Active Habits</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold" data-testid="completed-today">
                  {habits.filter(habit => 
                    habit.completions[getDateString(new Date())]
                  ).length}
                </div>
                <div className="text-sm text-muted-foreground">Completed Today</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold" data-testid="longest-streak">
                  {Math.max(...habits.map(habit => getCurrentStreak(habit)), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Longest Streak</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold" data-testid="completion-rate">
                  {habits.length > 0 
                    ? Math.round(
                        (habits.filter(habit => 
                          habit.completions[getDateString(new Date())]
                        ).length / habits.length) * 100
                      )
                    : 0
                  }%
                </div>
                <div className="text-sm text-muted-foreground">Today's Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}