import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: Date;
  isRead: boolean;
  isStarred: boolean;
  folder: 'inbox' | 'sent' | 'drafts' | 'trash';
  attachments: { name: string; size: number; type: string }[];
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  description: string;
}

export default function EmailClient() {
  const [emails, setEmails] = useState<Email[]>([
    {
      id: '1',
      from: 'john@example.com',
      to: 'me@example.com',
      subject: 'Welcome to Email Client',
      body: 'This is a sample email message to demonstrate the email client functionality.',
      timestamp: new Date(),
      isRead: false,
      isStarred: false,
      folder: 'inbox',
      attachments: []
    },
    {
      id: '2',
      from: 'team@company.com',
      to: 'me@example.com',
      subject: 'Project Update',
      body: 'Here is the latest update on our project progress. Please review and provide feedback.',
      timestamp: new Date(Date.now() - 3600000),
      isRead: true,
      isStarred: true,
      folder: 'inbox',
      attachments: [{ name: 'project-report.pdf', size: 1024000, type: 'application/pdf' }]
    }
  ]);

  const [contacts, setContacts] = useState<Contact[]>([
    { id: '1', name: 'John Doe', email: 'john@example.com', company: 'Example Corp' },
    { id: '2', name: 'Jane Smith', email: 'jane@company.com', company: 'Tech Solutions' }
  ]);

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Team Meeting',
      date: new Date(),
      time: '10:00 AM',
      description: 'Weekly team standup meeting'
    }
  ]);

  const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent' | 'drafts' | 'trash'>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [activeTab, setActiveTab] = useState<'emails' | 'contacts' | 'calendar'>('emails');
  const [isComposing, setIsComposing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [newEmail, setNewEmail] = useState({
    to: '',
    subject: '',
    body: '',
    attachments: [] as File[]
  });

  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });

  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    description: ''
  });

  const filteredEmails = emails
    .filter(email => email.folder === activeFolder)
    .filter(email => 
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.body.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const unreadCount = emails.filter(email => !email.isRead && email.folder === 'inbox').length;

  const markAsRead = (emailId: string) => {
    setEmails(emails.map(email => 
      email.id === emailId ? { ...email, isRead: true } : email
    ));
  };

  const toggleStar = (emailId: string) => {
    setEmails(emails.map(email => 
      email.id === emailId ? { ...email, isStarred: !email.isStarred } : email
    ));
  };

  const sendEmail = () => {
    if (!newEmail.to || !newEmail.subject) {
      toast({
        title: "Error",
        description: "Please fill in recipient and subject fields.",
        variant: "destructive"
      });
      return;
    }

    const email: Email = {
      id: Date.now().toString(),
      from: 'me@example.com',
      to: newEmail.to,
      subject: newEmail.subject,
      body: newEmail.body,
      timestamp: new Date(),
      isRead: true,
      isStarred: false,
      folder: 'sent',
      attachments: newEmail.attachments.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }))
    };

    setEmails([...emails, email]);
    setNewEmail({ to: '', subject: '', body: '', attachments: [] });
    setIsComposing(false);
    
    toast({
      title: "Email Sent",
      description: `Email sent to ${newEmail.to} with ${newEmail.attachments.length} attachment(s)`,
    });
  };

  const handleFileAttachment = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif';
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        const fileArray = Array.from(files);
        setNewEmail(prev => ({
          ...prev,
          attachments: [...prev.attachments, ...fileArray]
        }));
        toast({
          title: "Files Attached",
          description: `${fileArray.length} file(s) have been attached to your email.`,
        });
      }
    };
    input.click();
  };

  const removeAttachment = (index: number) => {
    setNewEmail(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const addContact = () => {
    if (!newContact.name || !newContact.email) {
      toast({
        title: "Error",
        description: "Please fill in name and email fields.",
        variant: "destructive"
      });
      return;
    }

    const contact: Contact = {
      id: Date.now().toString(),
      ...newContact
    };

    setContacts([...contacts, contact]);
    setNewContact({ name: '', email: '', phone: '', company: '' });
    
    toast({
      title: "Contact Added",
      description: `${newContact.name} has been added to your contacts.`,
    });
  };

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date) {
      toast({
        title: "Error",
        description: "Please fill in title and date fields.",
        variant: "destructive"
      });
      return;
    }

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: new Date(newEvent.date),
      time: newEvent.time,
      description: newEvent.description
    };

    setCalendarEvents([...calendarEvents, event]);
    setNewEvent({ title: '', date: '', time: '', description: '' });
    
    toast({
      title: "Event Added",
      description: `${newEvent.title} has been added to your calendar.`,
    });
  };

  const exportEmails = () => {
    const exportData = {
      emails: emails,
      contacts: contacts,
      calendarEvents: calendarEvents,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email-client-data.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported",
      description: "Your emails, contacts, and calendar have been exported.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-envelope text-white text-sm"></i>
                </div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Email Client</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
                data-testid="search-emails"
              />
              <Button 
                variant="outline" 
                onClick={exportEmails}
                data-testid="export-emails"
              >
                <i className="fas fa-download mr-2"></i>
                Export
              </Button>
              <Button onClick={() => setIsComposing(true)} data-testid="compose-email">
                <i className="fas fa-pen mr-2"></i>
                Compose
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="p-4">
            {/* Navigation Tabs */}
            <div className="flex space-x-1 mb-6">
              <Button
                variant={activeTab === 'emails' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('emails')}
                className="flex-1"
                data-testid="emails-tab"
              >
                <i className="fas fa-envelope mr-2"></i>
                Mail
              </Button>
              <Button
                variant={activeTab === 'contacts' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('contacts')}
                className="flex-1"
                data-testid="contacts-tab"
              >
                <i className="fas fa-address-book mr-2"></i>
                Contacts
              </Button>
              <Button
                variant={activeTab === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('calendar')}
                className="flex-1"
                data-testid="calendar-tab"
              >
                <i className="fas fa-calendar mr-2"></i>
                Calendar
              </Button>
            </div>

            {activeTab === 'emails' && (
              <div className="space-y-2">
                <Button
                  variant={activeFolder === 'inbox' ? 'default' : 'ghost'}
                  className="w-full justify-between"
                  onClick={() => setActiveFolder('inbox')}
                  data-testid="inbox-folder"
                >
                  <div className="flex items-center">
                    <i className="fas fa-inbox mr-2"></i>
                    Inbox
                  </div>
                  {unreadCount > 0 && (
                    <Badge variant="destructive">{unreadCount}</Badge>
                  )}
                </Button>
                <Button
                  variant={activeFolder === 'sent' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveFolder('sent')}
                  data-testid="sent-folder"
                >
                  <i className="fas fa-paper-plane mr-2"></i>
                  Sent
                </Button>
                <Button
                  variant={activeFolder === 'drafts' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveFolder('drafts')}
                  data-testid="drafts-folder"
                >
                  <i className="fas fa-file-alt mr-2"></i>
                  Drafts
                </Button>
                <Button
                  variant={activeFolder === 'trash' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveFolder('trash')}
                  data-testid="trash-folder"
                >
                  <i className="fas fa-trash mr-2"></i>
                  Trash
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {activeTab === 'emails' && (
            <>
              {/* Email List */}
              <div className="w-1/3 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredEmails.map((email) => (
                    <div
                      key={email.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        selectedEmail?.id === email.id ? 'bg-blue-50 dark:bg-blue-900' : ''
                      } ${!email.isRead ? 'bg-blue-25 dark:bg-blue-950' : ''}`}
                      onClick={() => {
                        setSelectedEmail(email);
                        markAsRead(email.id);
                      }}
                      data-testid={`email-${email.id}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm ${!email.isRead ? 'font-semibold' : ''}`}>
                          {email.from}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStar(email.id);
                            }}
                            className={`text-sm ${email.isStarred ? 'text-yellow-500' : 'text-gray-400'}`}
                            data-testid={`star-${email.id}`}
                          >
                            <i className={`fas fa-star`}></i>
                          </button>
                          <span className="text-xs text-gray-500">
                            {email.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <h3 className={`text-sm mb-1 ${!email.isRead ? 'font-semibold' : ''}`}>
                        {email.subject}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {email.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Content */}
              <div className="flex-1 bg-white dark:bg-gray-800">
                {selectedEmail ? (
                  <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                      <h2 className="text-xl font-semibold mb-2">{selectedEmail.subject}</h2>
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <span className="font-medium">From:</span> {selectedEmail.from}
                        </div>
                        <span>{selectedEmail.timestamp.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto">
                      <div className="whitespace-pre-wrap mb-6">{selectedEmail.body}</div>
                      
                      {selectedEmail.attachments.length > 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Attachments ({selectedEmail.attachments.length})
                          </h4>
                          <div className="space-y-2">
                            {selectedEmail.attachments.map((attachment, index) => (
                              <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                                <i className={`fas ${
                                  attachment.type.includes('image') ? 'fa-image' :
                                  attachment.type.includes('pdf') ? 'fa-file-pdf' :
                                  attachment.name.includes('.doc') ? 'fa-file-word' :
                                  attachment.name.includes('.xls') || attachment.name.includes('sheet') ? 'fa-file-excel' :
                                  'fa-file'
                                } text-blue-500`}></i>
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{attachment.name}</div>
                                  <div className="text-xs text-gray-500">{formatFileSize(attachment.size)}</div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-3"
                                  onClick={() => {
                                    toast({
                                      title: "Download",
                                      description: `${attachment.name} would be downloaded in a real email client.`,
                                    });
                                  }}
                                  data-testid={`download-attachment-${index}`}
                                >
                                  <i className="fas fa-download mr-1"></i>
                                  Download
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    Select an email to read
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'contacts' && (
            <div className="flex-1 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Contacts</h2>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Add New Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Full Name"
                        value={newContact.name}
                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                        data-testid="contact-name"
                      />
                      <Input
                        placeholder="Email"
                        type="email"
                        value={newContact.email}
                        onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                        data-testid="contact-email"
                      />
                      <Input
                        placeholder="Phone"
                        value={newContact.phone}
                        onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                        data-testid="contact-phone"
                      />
                      <Input
                        placeholder="Company"
                        value={newContact.company}
                        onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                        data-testid="contact-company"
                      />
                    </div>
                    <Button onClick={addContact} data-testid="add-contact">
                      <i className="fas fa-plus mr-2"></i>
                      Add Contact
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contacts.map((contact) => (
                  <Card key={contact.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {contact.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{contact.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{contact.email}</p>
                          {contact.company && (
                            <p className="text-xs text-gray-500">{contact.company}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="flex-1 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Calendar</h2>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Add New Event</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Event Title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        data-testid="event-title"
                      />
                      <Input
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        data-testid="event-date"
                      />
                      <Input
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                        data-testid="event-time"
                      />
                    </div>
                    <Textarea
                      placeholder="Event Description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      data-testid="event-description"
                    />
                    <Button onClick={addEvent} data-testid="add-event">
                      <i className="fas fa-plus mr-2"></i>
                      Add Event
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                {calendarEvents.map((event) => (
                  <Card key={event.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{event.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {event.date.toLocaleDateString()} at {event.time}
                          </p>
                          {event.description && (
                            <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                          )}
                        </div>
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                          <i className="fas fa-calendar text-white text-sm"></i>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {isComposing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Compose Email</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsComposing(false)}
                  data-testid="close-compose"
                >
                  <i className="fas fa-times"></i>
                </Button>
              </div>
              
              <div className="space-y-4">
                <Input
                  placeholder="To"
                  value={newEmail.to}
                  onChange={(e) => setNewEmail({ ...newEmail, to: e.target.value })}
                  data-testid="compose-to"
                />
                <Input
                  placeholder="Subject"
                  value={newEmail.subject}
                  onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
                  data-testid="compose-subject"
                />
                <Textarea
                  placeholder="Message"
                  value={newEmail.body}
                  onChange={(e) => setNewEmail({ ...newEmail, body: e.target.value })}
                  className="min-h-[200px]"
                  data-testid="compose-body"
                />
                
                {/* Attachments */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Attachments</label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleFileAttachment}
                      data-testid="attach-files"
                    >
                      <i className="fas fa-paperclip mr-2"></i>
                      Attach Files
                    </Button>
                  </div>
                  
                  {newEmail.attachments.length > 0 && (
                    <div className="border border-gray-200 dark:border-gray-600 rounded-md p-2 max-h-32 overflow-y-auto">
                      {newEmail.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between py-1 px-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                          <div className="flex items-center space-x-2">
                            <i className={`fas ${
                              file.type.includes('image') ? 'fa-image' :
                              file.type.includes('pdf') ? 'fa-file-pdf' :
                              file.type.includes('word') ? 'fa-file-word' :
                              file.type.includes('excel') || file.type.includes('sheet') ? 'fa-file-excel' :
                              'fa-file'
                            } text-sm text-gray-500`}></i>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                            <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            data-testid={`remove-attachment-${index}`}
                          >
                            <i className="fas fa-times text-xs"></i>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsComposing(false)} data-testid="cancel-compose">
                    Cancel
                  </Button>
                  <Button onClick={sendEmail} data-testid="send-email">
                    <i className="fas fa-paper-plane mr-2"></i>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}