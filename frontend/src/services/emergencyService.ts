
interface EmergencyContact {
  id?: string;
  name: string;
  phone?: string;
  email?: string;
  relationship?: string;
  isPrimary?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export class EmergencyService {
  private static STORAGE_KEY = 'emergencyContacts';

  static async saveEmergencyContacts(contacts: EmergencyContact[], token: string): Promise<void> {
    console.log('Saving emergency contacts:', { contactCount: contacts.length, hasToken: !!token });
    
    // Always save to localStorage first as backup
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(contacts));
      console.log('Saved to localStorage successfully');
    } catch (localError) {
      console.error('Failed to save to localStorage:', localError);
    }

    // Then try to save to backend if token exists
    if (!token) {
      console.log('No token provided, using localStorage only');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/mood/profile/emergency-contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(contacts),
      });

      console.log('Save emergency contacts response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to save emergency contacts to backend:', errorData);
        // Don't throw error since localStorage save succeeded
        console.log('Continuing with localStorage save as fallback');
        return;
      }

      const result = await response.json();
      console.log('Emergency contacts saved to backend successfully:', result);
    } catch (error) {
      console.error('Error saving emergency contacts to backend:', error);
      // Don't throw error since localStorage save succeeded
      console.log('Continuing with localStorage save as fallback');
    }
  }

  static async getEmergencyContacts(token?: string): Promise<EmergencyContact[]> {
    console.log('Loading emergency contacts:', { hasToken: !!token });
    
    // Try backend first if token exists
    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}/mood/profile/emergency-contacts`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        console.log('Load emergency contacts response:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });

        if (response.ok) {
          const data = await response.json();
          const backendContacts = data.contacts || [];
          console.log('Emergency contacts loaded from backend successfully:', backendContacts);
          
          // Also update localStorage with backend data for consistency
          try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(backendContacts));
          } catch (localError) {
            console.error('Failed to sync to localStorage:', localError);
          }
          
          return backendContacts;
        }
      } catch (error) {
        console.error('Error loading emergency contacts from backend:', error);
      }
    }

    // Fallback to localStorage
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const fallbackContacts = stored ? JSON.parse(stored) : [];
      console.log('Loaded emergency contacts from localStorage:', fallbackContacts);
      return fallbackContacts;
    } catch (localError) {
      console.error('Failed to load from localStorage:', localError);
      return [];
    }
  }

  static getStoredContacts(): EmergencyContact[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }
}

export type { EmergencyContact };
