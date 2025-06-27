
// API Configuration
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
    },
    chatbot: {
      query: '/chatbot/query',
    },
    conversations: {
      list: '/conversations',
      new: '/conversations/new',
      get: '/conversations/{id}',
      message: '/conversations/{id}/message',
    },
  },
  timeout: 30000, // 30 seconds
};

// Helper function to build full API URLs
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseUrl}${endpoint}`;
};

// Test connectivity function with better error handling
export const testBackendConnection = async (): Promise<boolean> => {
  try {
    console.log(`Testing connection to: ${API_CONFIG.baseUrl}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
    
    const response = await fetch(`${API_CONFIG.baseUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    console.log('Health check response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    return response.ok;
  } catch (error) {
    console.error('Backend connection test failed:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('Connection test timed out');
      } else if (error.message.includes('fetch')) {
        console.error('Network error during connection test');
      }
    }
    
    return false;
  }
};

// Enhanced API request helper
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<Response> => {
  const url = getApiUrl(endpoint);
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const requestOptions: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  console.log('API Request:', {
    url,
    method: requestOptions.method || 'GET',
    hasToken: !!token,
  });

  try {
    const response = await fetch(url, requestOptions);
    
    console.log('API Response:', {
      url,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    return response;
  } catch (error) {
    console.error('API Request failed:', { url, error });
    throw error;
  }
};

