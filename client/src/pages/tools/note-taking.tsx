import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  section: string;
  color: string;
  attachments: Attachment[];
}

interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'video' | 'file';
  url: string;
  size: number;
}

interface Section {
  id: string;
  name: string;
  color: string;
  noteCount: number;
}

export default function NoteTaking() {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Welcome to Advanced Notes',
      content: '<h2>Getting Started</h2><p>This is your advanced note-taking application with rich text formatting, sections, and tagging support.</p><ul><li>Create notes with rich formatting</li><li>Organize in sections</li><li>Add tags for easy searching</li><li>Attach multimedia content</li></ul>',
      tags: ['welcome', 'tutorial'],
      createdAt: new Date(),
      updatedAt: new Date(),
      section: 'general',
      color: 'blue',
      attachments: []
    },
    {
      id: '2',
      title: 'Project Ideas',
      content: '<h3>Web Development Projects</h3><p>Here are some interesting project ideas:</p><ol><li>Task management app</li><li>Weather dashboard</li><li>Recipe organizer</li></ol>',
      tags: ['projects', 'ideas', 'development'],
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 86400000),
      section: 'work',
      color: 'green',
      attachments: [
        { id: '1', name: 'project-mockup.png', type: 'image', url: '/api/placeholder/400/300', size: 256000 }
      ]
    }
  ]);

  const [sections, setSections] = useState<Section[]>([
    { id: 'general', name: 'General', color: 'gray', noteCount: 1 },
    { id: 'work', name: 'Work', color: 'blue', noteCount: 1 },
    { id: 'personal', name: 'Personal', color: 'green', noteCount: 0 },
    { id: 'ideas', name: 'Ideas', color: 'purple', noteCount: 0 }
  ]);

  const [activeSection, setActiveSection] = useState<string>('general');
  const [selectedNote, setSelectedNote] = useState<Note | null>(notes[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [isCreatingSection, setIsCreatingSection] = useState(false);

  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    section: 'general',
    color: 'blue'
  });

  const [newSection, setNewSection] = useState({
    name: '',
    color: 'blue'
  });

  const editorRef = useRef<HTMLDivElement>(null);

  const filteredNotes = notes
    .filter(note => activeSection === 'all' || note.section === activeSection)
    .filter(note =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    updateNoteContent();
  };

  const updateNoteContent = () => {
    if (editorRef.current && selectedNote) {
      const updatedNote = {
        ...selectedNote,
        content: editorRef.current.innerHTML,
        updatedAt: new Date()
      };
      
      setNotes(notes.map(note => 
        note.id === selectedNote.id ? updatedNote : note
      ));
      setSelectedNote(updatedNote);
    }
  };

  const createNote = () => {
    if (!newNote.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a note title.",
        variant: "destructive"
      });
      return;
    }

    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content || '<p>Start writing your note...</p>',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      section: newNote.section,
      color: newNote.color,
      attachments: []
    };

    setNotes([note, ...notes]);
    setSelectedNote(note);
    setNewNote({ title: '', content: '', section: 'general', color: 'blue' });
    setIsCreatingNote(false);

    // Update section count
    setSections(sections.map(section =>
      section.id === note.section
        ? { ...section, noteCount: section.noteCount + 1 }
        : section
    ));

    toast({
      title: "Note Created",
      description: `"${note.title}" has been created successfully.`,
    });
  };

  const deleteNote = (noteId: string) => {
    const noteToDelete = notes.find(note => note.id === noteId);
    if (!noteToDelete) return;

    setNotes(notes.filter(note => note.id !== noteId));
    
    if (selectedNote?.id === noteId) {
      setSelectedNote(notes.find(note => note.id !== noteId) || null);
    }

    // Update section count
    setSections(sections.map(section =>
      section.id === noteToDelete.section
        ? { ...section, noteCount: Math.max(0, section.noteCount - 1) }
        : section
    ));

    toast({
      title: "Note Deleted",
      description: "Note has been deleted successfully.",
    });
  };

  const addTag = () => {
    if (!newTag.trim() || !selectedNote) return;

    const tag = newTag.trim().toLowerCase();
    if (selectedNote.tags.includes(tag)) {
      toast({
        title: "Tag exists",
        description: "This tag already exists for this note.",
        variant: "destructive"
      });
      return;
    }

    const updatedNote = {
      ...selectedNote,
      tags: [...selectedNote.tags, tag],
      updatedAt: new Date()
    };

    setNotes(notes.map(note => 
      note.id === selectedNote.id ? updatedNote : note
    ));
    setSelectedNote(updatedNote);
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    if (!selectedNote) return;

    const updatedNote = {
      ...selectedNote,
      tags: selectedNote.tags.filter(tag => tag !== tagToRemove),
      updatedAt: new Date()
    };

    setNotes(notes.map(note => 
      note.id === selectedNote.id ? updatedNote : note
    ));
    setSelectedNote(updatedNote);
  };

  const createSection = () => {
    if (!newSection.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a section name.",
        variant: "destructive"
      });
      return;
    }

    const section: Section = {
      id: newSection.name.toLowerCase().replace(/\s+/g, '-'),
      name: newSection.name,
      color: newSection.color,
      noteCount: 0
    };

    setSections([...sections, section]);
    setNewSection({ name: '', color: 'blue' });
    setIsCreatingSection(false);

    toast({
      title: "Section Created",
      description: `"${section.name}" section has been created.`,
    });
  };

  const exportNotes = () => {
    const exportData = {
      notes,
      sections,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notes-export.json';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Notes Exported",
      description: "Your notes have been exported successfully.",
    });
  };

  // Multimedia functions
  const insertImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !selectedNote) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        const attachment: Attachment = {
          id: Date.now().toString(),
          name: file.name,
          type: 'image',
          url: imageUrl,
          size: file.size
        };

        // Add attachment to note
        const updatedNote = {
          ...selectedNote,
          attachments: [...selectedNote.attachments, attachment],
          updatedAt: new Date()
        };

        setNotes(notes.map(note => 
          note.id === selectedNote.id ? updatedNote : note
        ));
        setSelectedNote(updatedNote);

        // Insert image into editor
        if (editorRef.current) {
          document.execCommand('insertHTML', false, 
            `<img src="${imageUrl}" alt="${file.name}" style="max-width: 100%; height: auto; margin: 10px 0;" />`
          );
          updateNoteContent();
        }

        toast({
          title: "Image Added",
          description: `${file.name} has been added to your note.`,
        });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const attachFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.txt,.zip,.rar';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !selectedNote) return;

      const attachment: Attachment = {
        id: Date.now().toString(),
        name: file.name,
        type: 'file',
        url: URL.createObjectURL(file),
        size: file.size
      };

      const updatedNote = {
        ...selectedNote,
        attachments: [...selectedNote.attachments, attachment],
        updatedAt: new Date()
      };

      setNotes(notes.map(note => 
        note.id === selectedNote.id ? updatedNote : note
      ));
      setSelectedNote(updatedNote);

      toast({
        title: "File Attached",
        description: `${file.name} has been attached to your note.`,
      });
    };
    input.click();
  };

  const recordAudio = async () => {
    if (!selectedNote) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(blob);
        
        const attachment: Attachment = {
          id: Date.now().toString(),
          name: `audio-${new Date().getTime()}.wav`,
          type: 'audio',
          url: audioUrl,
          size: blob.size
        };

        const updatedNote = {
          ...selectedNote,
          attachments: [...selectedNote.attachments, attachment],
          updatedAt: new Date()
        };

        setNotes(notes.map(note => 
          note.id === selectedNote.id ? updatedNote : note
        ));
        setSelectedNote(updatedNote);

        toast({
          title: "Audio Recorded",
          description: "Audio recording has been added to your note.",
        });

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      
      toast({
        title: "Recording Started",
        description: "Click the button again to stop recording.",
      });

      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 30000); // Auto-stop after 30 seconds

    } catch (error) {
      toast({
        title: "Recording Failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const removeAttachment = (attachmentId: string) => {
    if (!selectedNote) return;

    const updatedNote = {
      ...selectedNote,
      attachments: selectedNote.attachments.filter(att => att.id !== attachmentId),
      updatedAt: new Date()
    };

    setNotes(notes.map(note => 
      note.id === selectedNote.id ? updatedNote : note
    ));
    setSelectedNote(updatedNote);

    toast({
      title: "Attachment Removed",
      description: "Attachment has been removed from your note.",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-sticky-note text-white text-sm"></i>
                </div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Notes</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search notes and tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
                data-testid="search-notes"
              />
              <Button onClick={() => setIsCreatingNote(true)} data-testid="create-note">
                <i className="fas fa-plus mr-2"></i>
                New Note
              </Button>
              <Button variant="outline" onClick={exportNotes} data-testid="export-notes">
                <i className="fas fa-download mr-2"></i>
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="p-4">
            {/* Sections */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Sections
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreatingSection(true)}
                  data-testid="create-section"
                >
                  <i className="fas fa-plus text-xs"></i>
                </Button>
              </div>
              
              <div className="space-y-1">
                <Button
                  variant={activeSection === 'all' ? 'default' : 'ghost'}
                  className="w-full justify-between text-sm"
                  onClick={() => setActiveSection('all')}
                  data-testid="all-sections"
                >
                  <div className="flex items-center">
                    <i className="fas fa-folder mr-2"></i>
                    All Notes
                  </div>
                  <Badge variant="secondary">{notes.length}</Badge>
                </Button>
                
                {sections.map((section) => (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? 'default' : 'ghost'}
                    className="w-full justify-between text-sm"
                    onClick={() => setActiveSection(section.id)}
                    data-testid={`section-${section.id}`}
                  >
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full bg-${section.color}-500 mr-2`}></div>
                      {section.name}
                    </div>
                    <Badge variant="secondary">{section.noteCount}</Badge>
                  </Button>
                ))}
              </div>
            </div>

            {/* Recent Tags */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
                Popular Tags
              </h3>
              <div className="flex flex-wrap gap-1">
                {Array.from(new Set(notes.flatMap(note => note.tags)))
                  .slice(0, 10)
                  .map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setSearchQuery(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notes List */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">
              {activeSection === 'all' ? 'All Notes' : sections.find(s => s.id === activeSection)?.name}
              <span className="text-sm text-gray-500 ml-2">({filteredNotes.length})</span>
            </h3>
            
            <div className="space-y-3">
              {filteredNotes.map((note) => (
                <Card
                  key={note.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedNote?.id === note.id ? 'ring-2 ring-purple-500' : ''
                  }`}
                  onClick={() => setSelectedNote(note)}
                  data-testid={`note-${note.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm truncate flex-1">{note.title}</h4>
                      <div className={`w-3 h-3 rounded-full bg-${note.color}-500 ml-2 flex-shrink-0`}></div>
                    </div>
                    
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                      {note.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{note.updatedAt.toLocaleDateString()}</span>
                      <div className="flex items-center space-x-1">
                        {note.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {note.tags.length > 2 && (
                          <span className="text-xs">+{note.tags.length - 2}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Note Editor */}
        <div className="flex-1 flex flex-col">
          {selectedNote ? (
            <>
              {/* Note Header */}
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <Input
                      value={selectedNote.title}
                      onChange={(e) => {
                        const updatedNote = { ...selectedNote, title: e.target.value, updatedAt: new Date() };
                        setNotes(notes.map(note => note.id === selectedNote.id ? updatedNote : note));
                        setSelectedNote(updatedNote);
                      }}
                      className="text-lg font-semibold border-none shadow-none p-0 h-auto"
                      data-testid="note-title-input"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteNote(selectedNote.id)}
                    className="text-red-500 hover:text-red-700"
                    data-testid="delete-note"
                  >
                    <i className="fas fa-trash"></i>
                  </Button>
                </div>

                {/* Tags */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex flex-wrap gap-1">
                    {selectedNote.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs cursor-pointer hover:bg-red-100 dark:hover:bg-red-900"
                        onClick={() => removeTag(tag)}
                      >
                        {tag} <i className="fas fa-times ml-1 text-xs"></i>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Input
                      placeholder="Add tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      className="w-24 h-6 text-xs"
                      data-testid="add-tag-input"
                    />
                    <Button size="sm" onClick={addTag} className="h-6 px-2 text-xs" data-testid="add-tag-button">
                      <i className="fas fa-plus"></i>
                    </Button>
                  </div>
                </div>

                {/* Toolbar */}
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText('bold')}
                    className="h-8 w-8 p-0"
                    data-testid="bold-button"
                  >
                    <i className="fas fa-bold"></i>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText('italic')}
                    className="h-8 w-8 p-0"
                    data-testid="italic-button"
                  >
                    <i className="fas fa-italic"></i>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText('underline')}
                    className="h-8 w-8 p-0"
                    data-testid="underline-button"
                  >
                    <i className="fas fa-underline"></i>
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText('insertUnorderedList')}
                    className="h-8 w-8 p-0"
                    data-testid="bullet-list"
                  >
                    <i className="fas fa-list-ul"></i>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText('insertOrderedList')}
                    className="h-8 w-8 p-0"
                    data-testid="numbered-list"
                  >
                    <i className="fas fa-list-ol"></i>
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText('formatBlock', 'h2')}
                    className="h-8 px-2 text-sm"
                    data-testid="heading-button"
                  >
                    H2
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => formatText('formatBlock', 'p')}
                    className="h-8 px-2 text-sm"
                    data-testid="paragraph-button"
                  >
                    P
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  {/* Multimedia buttons */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={insertImage}
                    className="h-8 w-8 p-0"
                    data-testid="insert-image"
                  >
                    <i className="fas fa-image"></i>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={attachFile}
                    className="h-8 w-8 p-0"
                    data-testid="attach-file"
                  >
                    <i className="fas fa-paperclip"></i>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={recordAudio}
                    className="h-8 w-8 p-0"
                    data-testid="record-audio"
                  >
                    <i className="fas fa-microphone"></i>
                  </Button>
                </div>
              </div>

              {/* Editor */}
              <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm h-full flex flex-col">
                  <div
                    ref={editorRef}
                    contentEditable
                    className="flex-1 p-6 focus:outline-none prose prose-lg max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: selectedNote.content }}
                    onInput={updateNoteContent}
                    style={{
                      minHeight: '400px',
                      fontFamily: 'Georgia, serif',
                      fontSize: '16px',
                      lineHeight: '1.6',
                    }}
                    data-testid="note-editor"
                  />
                  
                  {/* Attachments */}
                  {selectedNote.attachments.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-600 p-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Attachments ({selectedNote.attachments.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {selectedNote.attachments.map((attachment) => (
                          <div key={attachment.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            {attachment.type === 'image' ? (
                              <img 
                                src={attachment.url} 
                                alt={attachment.name}
                                className="w-16 h-16 object-cover rounded border" 
                              />
                            ) : attachment.type === 'audio' ? (
                              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                                <i className="fas fa-volume-up text-blue-600 text-xl"></i>
                              </div>
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-600 rounded flex items-center justify-center">
                                <i className={`fas ${
                                  attachment.name.includes('.pdf') ? 'fa-file-pdf text-red-500' :
                                  attachment.name.includes('.doc') ? 'fa-file-word text-blue-500' :
                                  'fa-file text-gray-500'
                                } text-xl`}></i>
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {attachment.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {formatFileSize(attachment.size)}
                              </div>
                              
                              <div className="flex items-center space-x-2 mt-2">
                                {attachment.type === 'audio' && (
                                  <audio controls className="h-8">
                                    <source src={attachment.url} type="audio/wav" />
                                    Your browser does not support the audio element.
                                  </audio>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => {
                                    const a = document.createElement('a');
                                    a.href = attachment.url;
                                    a.download = attachment.name;
                                    a.click();
                                  }}
                                  data-testid={`download-attachment-${attachment.id}`}
                                >
                                  <i className="fas fa-download mr-1"></i>
                                  Download
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 px-2 text-xs text-red-500 hover:text-red-700"
                                  onClick={() => removeAttachment(attachment.id)}
                                  data-testid={`remove-attachment-${attachment.id}`}
                                >
                                  <i className="fas fa-times"></i>
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <i className="fas fa-sticky-note text-4xl mb-4"></i>
                <p className="text-lg">Select a note to start editing</p>
                <p className="text-sm mt-2">Or create a new note to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Note Modal */}
      {isCreatingNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Create New Note</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreatingNote(false)}
                  data-testid="close-create-note"
                >
                  <i className="fas fa-times"></i>
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <Input
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    placeholder="Enter note title"
                    data-testid="new-note-title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Section</label>
                  <select
                    value={newNote.section}
                    onChange={(e) => setNewNote({ ...newNote, section: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                    data-testid="new-note-section"
                  >
                    {sections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreatingNote(false)} data-testid="cancel-create-note">
                    Cancel
                  </Button>
                  <Button onClick={createNote} data-testid="save-create-note">
                    <i className="fas fa-save mr-2"></i>
                    Create Note
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Section Modal */}
      {isCreatingSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Create New Section</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreatingSection(false)}
                  data-testid="close-create-section"
                >
                  <i className="fas fa-times"></i>
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Section Name</label>
                  <Input
                    value={newSection.name}
                    onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                    placeholder="Enter section name"
                    data-testid="new-section-name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Color</label>
                  <div className="flex space-x-2">
                    {['blue', 'green', 'purple', 'red', 'yellow', 'indigo'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewSection({ ...newSection, color })}
                        className={`w-8 h-8 rounded-full bg-${color}-500 ${
                          newSection.color === color ? 'ring-2 ring-gray-400' : ''
                        }`}
                        data-testid={`color-${color}`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreatingSection(false)} data-testid="cancel-create-section">
                    Cancel
                  </Button>
                  <Button onClick={createSection} data-testid="save-create-section">
                    <i className="fas fa-save mr-2"></i>
                    Create Section
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