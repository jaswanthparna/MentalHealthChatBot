
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { testBackendConnection, API_CONFIG } from '@/config/api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const HealthCheck: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const connected = await testBackendConnection();
      setIsConnected(connected);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Connection check failed:', error);
      setIsConnected(false);
      setLastChecked(new Date());
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Check connection on component mount
    checkConnection();
  }, []);

  const getStatusIcon = () => {
    if (isChecking) {
      return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    }
    
    if (isConnected === true) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    
    if (isConnected === false) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    
    return null;
  };

  const getStatusText = () => {
    if (isChecking) return 'Checking...';
    if (isConnected === true) return 'Connected';
    if (isConnected === false) return 'Disconnected';
    return 'Unknown';
  };

  const getStatusColor = () => {
    if (isConnected === true) return 'text-green-600';
    if (isConnected === false) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">Backend Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Server URL:</span>
          <span className="text-sm font-mono">{API_CONFIG.baseUrl}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Status:</span>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
        </div>
        
        {lastChecked && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Last checked:</span>
            <span className="text-sm text-gray-500">
              {lastChecked.toLocaleTimeString()}
            </span>
          </div>
        )}
        
        <Button 
          onClick={checkConnection} 
          disabled={isChecking}
          className="w-full"
          variant="outline"
        >
          {isChecking ? 'Checking...' : 'Check Connection'}
        </Button>
        
        {isConnected === false && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              <strong>Connection Failed:</strong> Make sure your backend is running on {API_CONFIG.baseUrl}
            </p>
            <p className="text-xs text-red-600 mt-1">
              Common fixes: Check if backend is started, verify port number, check for CORS issues.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthCheck;
