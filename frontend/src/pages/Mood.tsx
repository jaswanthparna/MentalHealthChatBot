
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Smile, Meh, Frown, Heart, Sun, Cloud, CloudRain } from 'lucide-react';

interface MoodEntry {
  date: string;
  mood: string;
  note: string;
  intensity: number;
}

const Mood: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [moodNote, setMoodNote] = useState<string>('');
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);

  const moodOptions = [
    { name: 'Great', icon: Sun, color: 'text-yellow-500 bg-yellow-100', value: 'great' },
    { name: 'Good', icon: Smile, color: 'text-green-500 bg-green-100', value: 'good' },
    { name: 'Okay', icon: Meh, color: 'text-blue-500 bg-blue-100', value: 'okay' },
    { name: 'Low', icon: Cloud, color: 'text-gray-500 bg-gray-100', value: 'low' },
    { name: 'Struggling', icon: CloudRain, color: 'text-purple-500 bg-purple-100', value: 'struggling' },
  ];

  const saveMoodEntry = () => {
    if (!selectedDate || !selectedMood) return;

    const entry: MoodEntry = {
      date: selectedDate.toISOString().split('T')[0],
      mood: selectedMood,
      note: moodNote,
      intensity: Math.floor(Math.random() * 100) + 1, // Placeholder
    };

    setMoodEntries(prev => [...prev.filter(e => e.date !== entry.date), entry]);
    setSelectedMood('');
    setMoodNote('');
  };

  const todayEntry = moodEntries.find(entry => 
    entry.date === new Date().toISOString().split('T')[0]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Mood Tracker</h1>
          <p className="text-gray-600">Track your emotional journey and discover patterns</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Mood Check-in */}
          <div className="lg:col-span-2">
            <Card className="bg-white/70 backdrop-blur-md border-indigo-100 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  <span>How are you feeling today?</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mood Selection */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Select your mood:</p>
                  <div className="grid grid-cols-5 gap-3">
                    {moodOptions.map((mood) => {
                      const Icon = mood.icon;
                      return (
                        <button
                          key={mood.value}
                          onClick={() => setSelectedMood(mood.value)}
                          className={`p-4 rounded-xl transition-all duration-200 ${
                            selectedMood === mood.value
                              ? `${mood.color} ring-2 ring-offset-2 ring-indigo-400 scale-105`
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          <Icon className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-xs font-medium">{mood.name}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Add a note (optional):
                  </label>
                  <textarea
                    value={moodNote}
                    onChange={(e) => setMoodNote(e.target.value)}
                    placeholder="What's influencing your mood today?"
                    className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={saveMoodEntry}
                  disabled={!selectedMood}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                >
                  Save Mood Entry
                </Button>

                {todayEntry && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✓ You've already logged your mood today: <strong>{todayEntry.mood}</strong>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mood Insights */}
            <Card className="mt-6 bg-white/70 backdrop-blur-md border-indigo-100 shadow-xl">
              <CardHeader>
                <CardTitle>Weekly Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 7 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (6 - i));
                    const entry = moodEntries.find(e => e.date === date.toISOString().split('T')[0]);
                    
                    return (
                      <div key={i} className="text-center">
                        <p className="text-xs text-gray-600 mb-1">
                          {date.toLocaleDateString('en', { weekday: 'short' })}
                        </p>
                        <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                          entry 
                            ? moodOptions.find(m => m.value === entry.mood)?.color || 'bg-gray-100'
                            : 'bg-gray-100'
                        }`}>
                          {entry ? (
                            React.createElement(
                              moodOptions.find(m => m.value === entry.mood)?.icon || Meh,
                              { className: 'w-6 h-6' }
                            )
                          ) : (
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calendar */}
          <div>
            <Card className="bg-white/70 backdrop-blur-md border-indigo-100 shadow-xl">
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border-0"
                />
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6 bg-white/70 backdrop-blur-md border-indigo-100 shadow-xl">
              <CardHeader>
                <CardTitle>This Month</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Entries logged</span>
                  <span className="font-semibold text-indigo-600">{moodEntries.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current streak</span>
                  <span className="font-semibold text-green-600">3 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Most common</span>
                  <div className="flex items-center space-x-1">
                    <Smile className="w-4 h-4 text-green-500" />
                    <span className="font-semibold text-green-600">Good</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mood;
