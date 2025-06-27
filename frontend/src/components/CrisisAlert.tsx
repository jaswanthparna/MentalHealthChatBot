
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone, Mail, Heart, ExternalLink } from 'lucide-react';
import { EmergencyService, EmergencyContact } from '@/services/emergencyService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CrisisAlertProps {
  isVisible: boolean;
  onClose: () => void;
  crisisContacts?: any[];
}

const CrisisAlert: React.FC<CrisisAlertProps> = ({ isVisible, onClose, crisisContacts = [] }) => {
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isVisible) {
      console.log('CrisisAlert opened, loading contacts...');
      loadEmergencyContacts();
    }
  }, [isVisible, user?.token]);

  const loadEmergencyContacts = async () => {
    console.log('Loading emergency contacts from service...');
    setIsLoading(true);
    
    try {
      // Load contacts using the improved service
      const contacts = await EmergencyService.getEmergencyContacts(user?.token);
      console.log('Loaded emergency contacts:', contacts);
      setEmergencyContacts(contacts);
      
      // If we have crisis contacts from chat response, merge them
      if (crisisContacts.length > 0) {
        const formattedCrisisContacts = crisisContacts.map(contact => ({
          id: contact.name.toLowerCase().replace(/\s+/g, '_'),
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
          relationship: contact.relationship,
          isPrimary: false
        }));
        
        console.log('Merging crisis response contacts:', formattedCrisisContacts);
        setEmergencyContacts(prev => [...prev, ...formattedCrisisContacts]);
      }
    } catch (error) {
      console.error('Error loading emergency contacts:', error);
      setEmergencyContacts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCall = (phone: string, name: string) => {
    console.log('Attempting to call:', { phone, name });
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    if (window.navigator && 'userAgent' in window.navigator) {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        window.location.href = `tel:${cleanPhone}`;
      } else {
        // For desktop, copy to clipboard
        if (navigator.clipboard) {
          navigator.clipboard.writeText(cleanPhone).then(() => {
            toast({
              title: "Phone Number Copied",
              description: `${name}'s number (${phone}) copied to clipboard`,
            });
          });
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = cleanPhone;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          
          toast({
            title: "Phone Number Copied",
            description: `${name}'s number (${phone}) copied to clipboard`,
          });
        }
      }
    }
  };

  const handleEmail = (email: string, name: string) => {
    if (!email) {
      toast({
        title: "No Email",
        description: `No email address available for ${name}`,
        variant: "destructive"
      });
      return;
    }

    const subject = encodeURIComponent("I need support");
    const body = encodeURIComponent(`Hi ${name},\n\nI could use some support right now. Could you please reach out to me when you get this?\n\nThank you.`);
    
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    
    toast({
      title: "Opening Email",
      description: `Composing email to ${name}`,
    });
  };

  const handleCrisisHotline = (number: string, name: string) => {
    console.log('Calling crisis hotline:', { number, name });
    const cleanNumber = number.replace(/[^\d]/g, '');
    
    if (window.navigator && 'userAgent' in window.navigator) {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        window.location.href = `tel:${cleanNumber}`;
      } else {
        toast({
          title: "Crisis Hotline",
          description: `Call ${number} - ${name}. Number copied to clipboard.`,
          duration: 5000,
        });
        
        if (navigator.clipboard) {
          navigator.clipboard.writeText(cleanNumber);
        }
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full bg-white shadow-2xl border-red-200">
        <CardHeader className="bg-red-50 border-b border-red-200">
          <CardTitle className="flex items-center space-x-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            <span>We're Here to Help</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="text-center mb-6">
            <Heart className="w-12 h-12 mx-auto mb-3 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              You're Not Alone
            </h3>
            <p className="text-gray-600 text-sm">
              It takes courage to reach out. Here are immediate resources and your trusted contacts.
            </p>
          </div>

          {/* Crisis Hotlines */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-red-800 text-sm mb-3">
              Immediate Crisis Support
            </h4>
            <div className="space-y-2">
              <Button
                onClick={() => handleCrisisHotline('988', 'Suicide Prevention Lifeline')}
                className="w-full bg-red-600 hover:bg-red-700 text-white justify-start"
                size="sm"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call 988 - Suicide Prevention Lifeline
              </Button>
              <Button
                onClick={() => handleCrisisHotline('911', 'Emergency Services')}
                className="w-full bg-red-500 hover:bg-red-600 text-white justify-start"
                size="sm"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call 911 - Emergency Services
              </Button>
              <Button
                onClick={() => window.open('https://suicidepreventionlifeline.org/chat/', '_blank')}
                variant="outline"
                className="w-full border-red-300 text-red-600 hover:bg-red-50 justify-start"
                size="sm"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Crisis Chat Online
              </Button>
            </div>
          </div>

          {/* Emergency Contacts */}
          {emergencyContacts.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 text-sm mb-3">
                Your Trusted Contacts
              </h4>
              <div className="space-y-2">
                {emergencyContacts.slice(0, 4).map((contact, index) => (
                  <div key={contact.id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-sm">{contact.name}</p>
                      <p className="text-xs text-gray-500">{contact.relationship}</p>
                    </div>
                    <div className="flex space-x-1">
                      {contact.phone && (
                        <Button
                          size="sm"
                          onClick={() => handleCall(contact.phone!, contact.name)}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          <Phone className="w-3 h-3" />
                        </Button>
                      )}
                      {contact.email && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEmail(contact.email!, contact.name)}
                        >
                          <Mail className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show loading state */}
          {isLoading && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-center text-gray-500">Loading your contacts...</div>
            </div>
          )}

          {/* Show message if no contacts */}
          {!isLoading && emergencyContacts.length === 0 && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 text-sm mb-2">
                No Personal Contacts Added
              </h4>
              <p className="text-xs text-gray-600">
                You can add trusted contacts in the wellness page for quick access during emergencies.
              </p>
            </div>
          )}

          {/* Calming Resources */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 text-sm mb-2">
              Quick Calming Techniques
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Take 5 deep breaths: in for 4, hold for 4, out for 6</li>
              <li>• Name 5 things you can see, 4 you can hear, 3 you can touch</li>
              <li>• Remember: This feeling is temporary and will pass</li>
            </ul>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1">
              I'm Safe Now
            </Button>
            <Button 
              onClick={() => handleCrisisHotline('988', 'Crisis Support')}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              <Phone className="w-4 h-4 mr-2" />
              Get Help Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrisisAlert;
