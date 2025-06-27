
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Plus, Calendar, Search } from 'lucide-react';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: Date;
  mood?: string;
}

const Journal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: '1',
      title: 'A Peaceful Morning',
      content: 'Started my day with meditation and gratitude practice. Feeling centered and ready for whatever comes my way.',
      date: new Date('2024-01-15'),
      mood: 'peaceful'
    },
    {
      id: '2',
      title: 'Challenging Day at Work',
      content: 'Had some difficult conversations today, but I handled them with grace. Learning to set boundaries is an ongoing process.',
      date: new Date('2024-01-14'),
      mood: 'reflective'
    }
  ]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const startNewEntry = () => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      title: '',
      content: '',
      date: new Date(),
    };
    setSelectedEntry(newEntry);
    setIsCreating(true);
  };

  const saveEntry = () => {
    if (!selectedEntry || !selectedEntry.title.trim()) return;

    if (isCreating) {
      setEntries(prev => [selectedEntry, ...prev]);
    } else {
      setEntries(prev => prev.map(entry => 
        entry.id === selectedEntry.id ? selectedEntry : entry
      ));
    }
    
    setSelectedEntry(null);
    setIsCreating(false);
  };

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Personal Journal</h1>
            <p className="text-gray-600">Reflect, process, and grow through mindful writing</p>
          </div>
          <Button
            onClick={startNewEntry}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Entry
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Entry List */}
          <div className="lg:col-span-1">
            <Card className="bg-white/70 backdrop-blur-md border-indigo-100 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <span>Entries</span>
                </CardTitle>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search entries..."
                    className="pl-10 border-indigo-200 focus:border-indigo-400"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {filteredEntries.map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => {
                      setSelectedEntry(entry);
                      setIsCreating(false);
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedEntry?.id === entry.id
                        ? 'bg-indigo-100 border border-indigo-300'
                        : 'bg-white hover:bg-indigo-50 border border-transparent'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-800 truncate">{entry.title}</h3>
                    <p className="text-sm text-gray-600 truncate">{entry.content}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {entry.date.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                {filteredEntries.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No entries found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Entry Editor */}
          <div className="lg:col-span-2">
            {selectedEntry ? (
              <Card className="bg-white/70 backdrop-blur-md border-indigo-100 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      <span className="text-sm text-gray-600">
                        {formatDate(selectedEntry.date)}
                      </span>
                    </div>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedEntry(null);
                          setIsCreating(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={saveEntry}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                        disabled={!selectedEntry.title.trim()}
                      >
                        {isCreating ? 'Save Entry' : 'Update Entry'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Input
                      value={selectedEntry.title}
                      onChange={(e) => setSelectedEntry({
                        ...selectedEntry,
                        title: e.target.value
                      })}
                      placeholder="Entry title..."
                      className="text-lg font-semibold border-indigo-200 focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <textarea
                      value={selectedEntry.content}
                      onChange={(e) => setSelectedEntry({
                        ...selectedEntry,
                        content: e.target.value
                      })}
                      placeholder="What's on your mind? Let your thoughts flow..."
                      className="w-full h-96 p-4 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none text-gray-700 leading-relaxed"
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/70 backdrop-blur-md border-indigo-100 shadow-xl h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Welcome to Your Journal</h3>
                  <p className="mb-4">Select an entry to read or create a new one to start writing</p>
                  <Button
                    onClick={startNewEntry}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Start Writing
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journal;
