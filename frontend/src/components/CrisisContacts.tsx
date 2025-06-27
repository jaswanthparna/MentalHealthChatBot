import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Phone, Plus, Edit, Trash2, Shield, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { EmergencyService, EmergencyContact } from '@/services/emergencyService';

const CrisisContacts: React.FC = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: '',
  });
  const { toast } = useToast();
  const { user } = useAuth();

  // Load contacts on component mount
  useEffect(() => {
    loadContacts();
  }, [user?.token]);

  const loadContacts = async () => {
    console.log('Loading crisis contacts...');
    
    // Always include default emergency contacts
    const defaultContacts: EmergencyContact[] = [
      {
        id: 'emergency',
        name: 'Emergency Services',
        phone: '911',
        relationship: 'Emergency',
        isPrimary: true
      },
      {
        id: 'crisis-text',
        name: 'Crisis Text Line',
        phone: '741741',
        relationship: 'Crisis Support',
        isPrimary: false
      },
      {
        id: 'suicide-prevention',
        name: 'Suicide Prevention Lifeline',
        phone: '988',
        relationship: 'Crisis Support',
        isPrimary: false
      }
    ];

    setIsLoading(true);
    try {
      const userContacts = await EmergencyService.getEmergencyContacts(user?.token);
      
      const formattedUserContacts = userContacts.map((contact, index) => ({
        ...contact,
        id: contact.id || `user_${index}`,
        isPrimary: contact.isPrimary || false,
      }));

      setContacts([...defaultContacts, ...formattedUserContacts]);
      console.log('Crisis contacts loaded successfully, total:', defaultContacts.length + formattedUserContacts.length);
    } catch (error) {
      console.error('Error loading contacts:', error);
      setContacts(defaultContacts);
      toast({
        title: "Warning",
        description: "Could not load contacts. Using defaults only.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveContacts = async (updatedContacts: EmergencyContact[]) => {
    console.log('Saving crisis contacts...');
    
    // Filter out default contacts before saving
    const userContacts = updatedContacts.filter(contact => 
      !['emergency', 'crisis-text', 'suicide-prevention'].includes(contact.id || '')
    );

    try {
      await EmergencyService.saveEmergencyContacts(userContacts, user?.token || '');
      console.log('Contacts saved successfully');
    } catch (error) {
      console.error('Error saving contacts:', error);
      throw new Error('Failed to save contacts');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', phone: '', email: '', relationship: '' });
    setIsAddingContact(false);
    setEditingContact(null);
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'Name is required';
    }
    
    if (!formData.phone.trim()) {
      return 'Phone number is required';
    }

    if (!formData.relationship.trim()) {
      return 'Relationship is required';
    }

    // Basic phone validation
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      return 'Please enter a valid phone number';
    }

    // Basic email validation if provided
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        return 'Please enter a valid email address';
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      let updatedContacts: EmergencyContact[];

      if (editingContact) {
        // Edit existing contact
        updatedContacts = contacts.map(contact => 
          contact.id === editingContact.id 
            ? { ...contact, ...formData }
            : contact
        );
        
        await saveContacts(updatedContacts);
        setContacts(updatedContacts);
        
        toast({
          title: "Contact Updated",
          description: `${formData.name} has been updated successfully`,
        });
      } else {
        // Add new contact - format for backend compatibility
        const newContact: EmergencyContact = {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || undefined,
          relationship: formData.relationship.trim(),
          isPrimary: false
        };
        
        updatedContacts = [...contacts, newContact];
        
        await saveContacts(updatedContacts);
        setContacts(updatedContacts);
        
        toast({
          title: "Contact Added",
          description: `${formData.name} has been added to your crisis contacts`,
        });
      }

      resetForm();
    } catch (error) {
      console.error('Error saving contact:', error);
      toast({
        title: "Save Error",
        description: error instanceof Error ? error.message : "Failed to save contact. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (contact: EmergencyContact) => {
    if (contact.id === 'emergency' || contact.id === 'crisis-text' || contact.id === 'suicide-prevention') {
      toast({
        title: "Cannot Edit",
        description: "Default emergency contacts cannot be edited",
        variant: "destructive"
      });
      return;
    }
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone || '',
      email: contact.email || '',
      relationship: contact.relationship || ''
    });
  };

  const handleDelete = async (contactId: string) => {
    if (contactId === 'emergency' || contactId === 'crisis-text' || contactId === 'suicide-prevention') {
      toast({
        title: "Cannot Delete",
        description: "Default emergency contacts cannot be deleted",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const updatedContacts = contacts.filter(contact => contact.id !== contactId);
      await saveContacts(updatedContacts);
      setContacts(updatedContacts);
      toast({
        title: "Contact Deleted",
        description: "Crisis contact has been removed",
      });
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Delete Error",
        description: "Failed to delete contact. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCall = (phone: string, name: string) => {
    window.location.href = `tel:${phone}`;
    toast({
      title: "Calling",
      description: `Calling ${name} at ${phone}`,
    });
  };

  const setPrimary = async (contactId: string) => {
    setIsLoading(true);
    try {
      const updatedContacts = contacts.map(contact => ({
        ...contact,
        isPrimary: contact.id === contactId
      }));
      await saveContacts(updatedContacts);
      setContacts(updatedContacts);
      toast({
        title: "Primary Contact Set",
        description: "Primary crisis contact has been updated",
      });
    } catch (error) {
      console.error('Error setting primary contact:', error);
      toast({
        title: "Update Error",
        description: "Failed to update primary contact. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-md border-red-100 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-500" />
            <span>Crisis Contacts</span>
          </div>
          <Dialog open={isAddingContact || editingContact !== null} onOpenChange={(open) => {
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button
                onClick={() => setIsAddingContact(true)}
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-white"
                disabled={isLoading}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingContact ? 'Edit Crisis Contact' : 'Add Crisis Contact'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Contact name"
                    required
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone number"
                    type="tel"
                    required
                    maxLength={20}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email address"
                    type="email"
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship *
                  </label>
                  <Input
                    value={formData.relationship}
                    onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                    placeholder="e.g., Friend, Family, Therapist"
                    required
                    maxLength={50}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : (editingContact ? 'Update Contact' : 'Add Contact')}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} disabled={isLoading}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Heart className="w-4 h-4 text-red-600" />
            <p className="text-sm font-semibold text-red-800">
              If you're in immediate danger, call 911
            </p>
          </div>
          <p className="text-xs text-red-700">
            These contacts are stored securely and available for quick access during emergencies.
          </p>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {isLoading && contacts.length === 0 ? (
            <div className="text-center py-4 text-gray-500">Loading contacts...</div>
          ) : (
            contacts.map((contact) => (
              <div
                key={contact.id}
                className={`p-3 rounded-lg border transition-all ${
                  contact.isPrimary
                    ? 'bg-red-50 border-red-300'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-800">{contact.name}</h4>
                      {contact.isPrimary && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                    {contact.phone && <p className="text-sm text-gray-600">{contact.phone}</p>}
                    {contact.email && <p className="text-sm text-gray-600">{contact.email}</p>}
                    {contact.relationship && (
                      <p className="text-xs text-gray-500">{contact.relationship}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    {contact.phone && (
                      <Button
                        size="sm"
                        onClick={() => handleCall(contact.phone!, contact.name)}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Phone className="w-3 h-3" />
                      </Button>
                    )}
                    {!contact.isPrimary && contact.id !== 'emergency' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPrimary(contact.id!)}
                        disabled={isLoading}
                      >
                        <Shield className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(contact)}
                      disabled={isLoading}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(contact.id!)}
                      className="text-red-600 hover:text-red-700"
                      disabled={isLoading}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {contacts.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No crisis contacts added yet</p>
            <p className="text-sm">Add trusted contacts for emergency situations</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CrisisContacts;
