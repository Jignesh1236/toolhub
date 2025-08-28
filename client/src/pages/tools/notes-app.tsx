import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Search, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export default function NotesApp() {
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('notes-app-notes');
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes);
      // Convert date strings back to Date objects
      const notesWithDates = parsedNotes.map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt)
      }));
      setNotes(notesWithDates);
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem('notes-app-notes', JSON.stringify(notes));
  }, [notes]);

  const createNewNote = () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your note",
        variant: "destructive"
      });
      return;
    }

    const newNote: Note = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: extractTags(content)
    };

    setNotes(prev => [newNote, ...prev]);
    setSelectedNote(newNote);
    setTitle("");
    setContent("");
    setIsEditing(false);
    
    toast({
      title: "Note created",
      description: "Your note has been saved successfully"
    });
  };

  const updateNote = () => {
    if (!selectedNote || !title.trim()) return;

    const updatedNote: Note = {
      ...selectedNote,
      title: title.trim(),
      content: content.trim(),
      updatedAt: new Date(),
      tags: extractTags(content)
    };

    setNotes(prev => prev.map(note => 
      note.id === selectedNote.id ? updatedNote : note
    ));
    setSelectedNote(updatedNote);
    setIsEditing(false);
    
    toast({
      title: "Note updated",
      description: "Your changes have been saved"
    });
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
      setTitle("");
      setContent("");
      setIsEditing(false);
    }
    
    toast({
      title: "Note deleted",
      description: "The note has been removed"
    });
  };

  const selectNote = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(false);
  };

  const startNewNote = () => {
    setSelectedNote(null);
    setTitle("");
    setContent("");
    setIsEditing(true);
  };

  const extractTags = (text: string): string[] => {
    const tagRegex = /#(\w+)/g;
    const matches = text.match(tagRegex);
    return matches ? matches.map(tag => tag.substring(1)) : [];
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Notes App</h1>
        <p className="text-muted-foreground">
          Create, edit, and organize your notes with tags
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Notes List */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Notes ({notes.length})</CardTitle>
              <Button size="sm" onClick={startNewNote} data-testid="button-new-note">
                <Plus className="w-4 h-4 mr-1" />
                New
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-notes"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-2">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                {searchTerm ? "No notes found" : "No notes yet"}
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedNote?.id === note.id ? 'bg-primary/5 border-primary' : ''
                  }`}
                  onClick={() => selectNote(note)}
                  data-testid={`note-item-${note.id}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{note.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {note.content || "No content"}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                        {note.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{note.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {formatDate(note.updatedAt)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                      data-testid={`button-delete-${note.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Note Editor */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle>
              {selectedNote ? (isEditing ? "Edit Note" : "View Note") : "New Note"}
            </CardTitle>
            <CardDescription>
              {selectedNote && !isEditing
                ? `Created ${formatDate(selectedNote.createdAt)} • Updated ${formatDate(selectedNote.updatedAt)}`
                : "Create or edit your notes. Use #hashtags to add tags."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-4">
            <div className="space-y-2">
              <Label htmlFor="note-title">Title</Label>
              <Input
                id="note-title"
                placeholder="Enter note title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                readOnly={Boolean(selectedNote && !isEditing)}
                data-testid="input-note-title"
              />
            </div>

            <div className="space-y-2 flex-1 flex flex-col">
              <Label htmlFor="note-content">Content</Label>
              <Textarea
                id="note-content"
                placeholder="Write your note here... Use #hashtags to add tags."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 min-h-[300px] resize-none"
                readOnly={Boolean(selectedNote && !isEditing)}
                data-testid="textarea-note-content"
              />
            </div>

            <div className="flex gap-2 pt-2">
              {selectedNote ? (
                <>
                  {isEditing ? (
                    <>
                      <Button onClick={updateNote} data-testid="button-save-note">
                        Save Changes
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsEditing(false);
                          setTitle(selectedNote.title);
                          setContent(selectedNote.content);
                        }}
                        data-testid="button-cancel-edit"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)} data-testid="button-edit-note">
                      Edit Note
                    </Button>
                  )}
                </>
              ) : (
                <Button onClick={createNewNote} data-testid="button-create-note">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Note
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}