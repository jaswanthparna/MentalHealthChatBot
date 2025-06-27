
import React from 'react';
import Navigation from '@/components/Navigation';
import BreathingExercise from '@/components/BreathingExercise';
import CrisisContacts from '@/components/CrisisContacts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, BookOpen, Users, Lightbulb } from 'lucide-react';

const Wellness: React.FC = () => {
  const gratitudePrompts = [
    "What made you smile today?",
    "Who are you grateful for and why?",
    "What's something beautiful you noticed recently?",
    "What challenge helped you grow?",
    "What comfort or luxury do you appreciate?",
  ];

  const mindfulnessTips = [
    "Take three deep breaths before starting any task",
    "Notice five things you can see, four you can hear, three you can touch",
    "Practice loving-kindness by sending good wishes to someone",
    "Take a mindful walk and notice your surroundings",
    "Spend 2 minutes focusing only on your breathing",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Wellness Tools</h1>
          <p className="text-gray-600">Mindful practices and resources to support your emotional wellbeing</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Breathing Exercise - Full width on mobile, half on large screens */}
          <div className="lg:col-span-1">
            <BreathingExercise />
          </div>

          {/* Crisis Contacts - Full width on mobile, half on large screens */}
          <div className="lg:col-span-1">
            <CrisisContacts />
          </div>

          {/* Gratitude Practice */}
          <Card className="bg-white/70 backdrop-blur-md border-indigo-100 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-pink-500" />
                <span>Gratitude Practice</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-sm">
                Take a moment to reflect on the good in your life. Choose a prompt that speaks to you:
              </p>
              
              <div className="space-y-3">
                {gratitudePrompts.slice(0, 4).map((prompt, index) => (
                  <div
                    key={index}
                    className="p-3 bg-pink-50 border border-pink-200 rounded-lg hover:bg-pink-100 transition-colors cursor-pointer group"
                  >
                    <p className="text-sm text-gray-700 group-hover:text-pink-800">{prompt}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <p className="text-xs text-gray-500 mb-3">
                  Research shows that regular gratitude practice can improve mood, sleep quality, and overall life satisfaction.
                </p>
                <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white">
                  <Heart className="w-4 h-4 mr-2" />
                  Start Gratitude Reflection
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mindfulness Tips */}
          <Card className="bg-white/70 backdrop-blur-md border-indigo-100 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <span>Mindfulness Tips</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-sm">
                Quick mindfulness practices you can do anywhere, anytime:
              </p>
              
              <div className="space-y-3">
                {mindfulnessTips.map((tip, index) => (
                  <div
                    key={index}
                    className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                  >
                    <div className="flex items-start space-x-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-yellow-400 text-yellow-800 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <p className="text-sm text-gray-700 flex-1">{tip}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <p className="text-xs text-gray-500 mb-3">
                  Even 2-3 minutes of mindfulness can help reduce stress and increase focus.
                </p>
                <Button variant="outline" className="w-full border-yellow-300 text-yellow-600 hover:bg-yellow-50">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Set Mindfulness Reminder
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Professional Support Resources */}
          <Card className="bg-white/70 backdrop-blur-md border-indigo-100 shadow-xl lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-500" />
                <span>Professional Support & Resources</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-sm">
                Remember, seeking professional help is a sign of strength. Here are trusted resources:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 text-sm mb-2">Mental Health America</h4>
                  <p className="text-xs text-green-700 mb-2">Comprehensive mental health information and resources</p>
                  <Button size="sm" variant="outline" className="w-full border-green-300 text-green-600 hover:bg-green-50">
                    Visit Website
                  </Button>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 text-sm mb-2">Psychology Today</h4>
                  <p className="text-xs text-blue-700 mb-2">Find therapists and mental health professionals near you</p>
                  <Button size="sm" variant="outline" className="w-full border-blue-300 text-blue-600 hover:bg-blue-50">
                    Find Therapist
                  </Button>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-semibold text-purple-800 text-sm mb-2">NAMI</h4>
                  <p className="text-xs text-purple-700 mb-2">National Alliance on Mental Illness support groups</p>
                  <Button size="sm" variant="outline" className="w-full border-purple-300 text-purple-600 hover:bg-purple-50">
                    Find Support
                  </Button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Heart className="w-4 h-4 text-red-600" />
                  <h4 className="font-semibold text-red-800 text-sm">Important Reminder</h4>
                </div>
                <p className="text-xs text-red-700 mb-3">
                  If you're experiencing thoughts of self-harm or suicide, please reach out for immediate help. You matter, and support is available 24/7.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                    Call 988 - Suicide Prevention
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                    Text HOME to 741741
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Wellness;
