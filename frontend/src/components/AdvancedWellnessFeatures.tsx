
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, BookOpen, TrendingUp, Lightbulb, Heart, Timer } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  status: 'available' | 'coming-soon' | 'beta';
  onClick?: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon: Icon, status, onClick }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'beta': return 'bg-blue-100 text-blue-800';
      case 'coming-soon': return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'available': return 'Available';
      case 'beta': return 'Beta';
      case 'coming-soon': return 'Coming Soon';
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-md border-indigo-100 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
          onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
};

const AdvancedWellnessFeatures: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const features = [
    {
      id: 'ai-journal',
      title: 'AI-Powered Journal Suggestions',
      description: 'Get personalized prompts and insights based on CBT principles to guide your reflective writing.',
      icon: BookOpen,
      status: 'coming-soon' as const,
    },
    {
      id: 'mood-prediction',
      title: 'Mood Pattern Analysis',
      description: 'Discover patterns in your emotional journey with AI-driven insights and trend analysis.',
      icon: TrendingUp,
      status: 'coming-soon' as const,
    },
    {
      id: 'emotional-insights',
      title: 'Emotional Intelligence Insights',
      description: 'Understand your emotional responses and learn strategies for emotional regulation.',
      icon: Brain,
      status: 'coming-soon' as const,
    },
    {
      id: 'wellness-recommendations',
      title: 'Personalized Wellness Plans',
      description: 'Receive tailored recommendations for activities, exercises, and resources based on your needs.',
      icon: Lightbulb,
      status: 'coming-soon' as const,
    },
    {
      id: 'progress-tracking',
      title: 'Wellness Progress Tracking',
      description: 'Monitor your mental health journey with comprehensive progress reports and milestones.',
      icon: Heart,
      status: 'beta' as const,
    },
    {
      id: 'guided-sessions',
      title: 'Guided Mindfulness Sessions',
      description: 'Access a library of guided meditation and mindfulness exercises tailored to your current state.',
      icon: Timer,
      status: 'beta' as const,
    },
  ];

  const handleFeatureClick = (featureId: string) => {
    setSelectedFeature(featureId);
    
    // For now, show a message about the feature
    const feature = features.find(f => f.id === featureId);
    if (feature?.status === 'coming-soon') {
      alert(`${feature.title} is coming soon! We're working hard to bring you this feature.`);
    } else if (feature?.status === 'beta') {
      alert(`${feature.title} is in beta! This feature is being developed and will be available soon.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Advanced Wellness Features</h2>
        <p className="text-gray-600">
          Powerful AI-driven tools to enhance your mental wellness journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <FeatureCard
            key={feature.id}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            status={feature.status}
            onClick={() => handleFeatureClick(feature.id)}
          />
        ))}
      </div>

      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-1">Have a Feature Idea?</h3>
              <p className="text-gray-600 text-sm">
                We're always looking to improve your wellness experience. Share your ideas with us!
              </p>
            </div>
            <Button variant="outline" className="border-indigo-300 text-indigo-600 hover:bg-indigo-100">
              Share Feedback
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedWellnessFeatures;
