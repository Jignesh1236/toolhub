import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface Slide {
  id: string;
  title: string;
  content: string;
  layout: 'title' | 'content' | 'image' | 'comparison' | 'two-column' | 'image-content' | 'bullets';
  background?: string;
  animation?: 'fade' | 'slide' | 'zoom' | 'flip' | 'none';
  theme?: 'default' | 'corporate' | 'modern' | 'creative';
}

export default function Presentation() {
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: '1',
      title: 'Welcome to Your Presentation',
      content: 'Click to edit content',
      layout: 'title',
      background: '#ffffff',
      animation: 'fade',
      theme: 'default'
    }
  ]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [presentationName, setPresentationName] = useState('Untitled Presentation');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [editingField, setEditingField] = useState<'title' | 'content' | null>(null);

  const addSlide = (layout: Slide['layout'] = 'content') => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      title: 'New Slide',
      content: 'Click to add content',
      layout,
      background: '#ffffff'
    };
    setSlides([...slides, newSlide]);
    setCurrentSlide(slides.length);
    toast({
      title: "Slide Added",
      description: `New ${layout} slide has been added.`,
    });
  };

  const deleteSlide = (index: number) => {
    if (slides.length > 1) {
      const newSlides = slides.filter((_, i) => i !== index);
      setSlides(newSlides);
      setCurrentSlide(Math.max(0, index - 1));
      toast({
        title: "Slide Deleted",
        description: "Slide has been removed from presentation.",
      });
    }
  };

  const duplicateSlide = (index: number) => {
    const slideToClone = slides[index];
    const newSlide = {
      ...slideToClone,
      id: Date.now().toString(),
      title: `${slideToClone.title} (Copy)`
    };
    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, newSlide);
    setSlides(newSlides);
    setCurrentSlide(index + 1);
    toast({
      title: "Slide Duplicated",
      description: "Slide has been copied successfully.",
    });
  };

  const updateSlide = (field: keyof Slide, value: string) => {
    const newSlides = [...slides];
    newSlides[currentSlide] = { ...newSlides[currentSlide], [field]: value };
    setSlides(newSlides);
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const startSlideshow = () => {
    setIsSlideshow(true);
    setCurrentSlide(0);
  };

  const exitSlideshow = () => {
    setIsSlideshow(false);
  };

  const savePresentation = (format: 'json' | 'pptx' | 'pdf' = 'json') => {
    if (format === 'pptx') {
      // Create PPTX-like structure
      const pptxContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:p="urn:schemas-microsoft-com:office:powerpoint">
        <head>
          <meta charset="utf-8">
          <title>${presentationName}</title>
          <style>
            .slide { 
              width: 800px; 
              height: 600px; 
              page-break-after: always; 
              padding: 40px; 
              border: 1px solid #ccc; 
              margin: 20px 0; 
              background: white;
            }
            .slide-title { font-size: 28px; font-weight: bold; margin-bottom: 20px; color: #2B5797; }
            .slide-content { font-size: 18px; line-height: 1.5; }
            .title-slide { text-align: center; }
            .title-slide .slide-title { font-size: 36px; margin-top: 150px; }
            .title-slide .slide-content { font-size: 24px; margin-top: 50px; }
          </style>
        </head>
        <body>
          ${slides.map((slide, index) => `
            <div class="slide ${slide.layout === 'title' ? 'title-slide' : ''}">
              <div class="slide-title">${slide.title}</div>
              <div class="slide-content">${slide.content.replace(/\n/g, '<br>')}</div>
            </div>
          `).join('')}
        </body>
        </html>
      `;
      
      const blob = new Blob([pptxContent], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${presentationName}.pptx`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "PPTX Exported",
        description: `${presentationName}.pptx has been exported successfully.`,
      });
    } else if (format === 'pdf') {
      // PDF export via print
      const printContent = slides.map((slide, index) => `
        <div style="width: 800px; height: 600px; page-break-after: always; padding: 40px; border: 1px solid #ccc; margin: 20px 0; background: white;">
          <h1 style="font-size: 28px; font-weight: bold; margin-bottom: 20px; color: #2B5797;">${slide.title}</h1>
          <div style="font-size: 18px; line-height: 1.5;">${slide.content.replace(/\n/g, '<br>')}</div>
        </div>
      `).join('');
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${presentationName}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; }
                @media print { .slide { page-break-after: always; } }
              </style>
            </head>
            <body>
              ${printContent}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    } else {
      // JSON format
      const presentationData = {
        name: presentationName,
        slides: slides,
        createdAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(presentationData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${presentationName}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Presentation Saved",
        description: `${presentationName} has been saved successfully.`,
      });
    }
  };

  const importPresentation = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pptx,.json,.ppt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          
          if (file.name.endsWith('.json')) {
            try {
              const presentationData = JSON.parse(content);
              if (presentationData.slides && Array.isArray(presentationData.slides)) {
                setSlides(presentationData.slides);
                setPresentationName(presentationData.name || file.name.replace(/\.[^/.]+$/, ""));
                setCurrentSlide(0);
                
                toast({
                  title: "Presentation Imported",
                  description: `${file.name} has been imported successfully.`,
                });
              }
            } catch (error) {
              toast({
                title: "Import Error",
                description: "Invalid presentation file format.",
                variant: "destructive"
              });
            }
          } else if (file.name.endsWith('.pptx') || file.name.endsWith('.ppt')) {
            // Basic PPTX parsing (simplified)
            try {
              const parser = new DOMParser();
              const doc = parser.parseFromString(content, 'text/html');
              const slideElements = doc.querySelectorAll('.slide');
              
              if (slideElements.length > 0) {
                const importedSlides: Slide[] = Array.from(slideElements).map((slideEl, index) => {
                  const titleEl = slideEl.querySelector('.slide-title');
                  const contentEl = slideEl.querySelector('.slide-content');
                  
                  return {
                    id: (index + 1).toString(),
                    title: titleEl?.textContent || `Slide ${index + 1}`,
                    content: contentEl?.textContent || '',
                    layout: slideEl.classList.contains('title-slide') ? 'title' : 'content',
                    background: '#ffffff'
                  };
                });
                
                setSlides(importedSlides);
                setPresentationName(file.name.replace(/\.[^/.]+$/, ""));
                setCurrentSlide(0);
                
                toast({
                  title: "PPTX Imported",
                  description: `${file.name} has been imported successfully.`,
                });
              } else {
                throw new Error('No slides found');
              }
            } catch (error) {
              toast({
                title: "Import Error",
                description: "Could not parse the PowerPoint file. Please try a JSON file instead.",
                variant: "destructive"
              });
            }
          }
        };
        
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const getSlidePreview = (slide: Slide) => {
    const themeClasses = {
      default: 'bg-white dark:bg-gray-800',
      corporate: 'bg-blue-50 dark:bg-blue-900',
      modern: 'bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900',
      creative: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900'
    };

    const containerClass = `h-full ${themeClasses[slide.theme || 'default']}`;

    switch (slide.layout) {
      case 'title':
        return (
          <div className={`${containerClass} flex flex-col justify-center items-center text-center p-4`}>
            <h1 className="text-2xl font-bold mb-4">{slide.title}</h1>
            <p className="text-lg">{slide.content}</p>
          </div>
        );
      case 'content':
        return (
          <div className={`${containerClass} p-6`}>
            <h2 className="text-xl font-semibold mb-4">{slide.title}</h2>
            <div className="text-sm whitespace-pre-wrap">{slide.content}</div>
          </div>
        );
      case 'bullets':
        return (
          <div className={`${containerClass} p-6`}>
            <h2 className="text-xl font-semibold mb-4">{slide.title}</h2>
            <ul className="text-sm space-y-2">
              {slide.content.split('\n').filter(line => line.trim()).map((line, i) => (
                <li key={i} className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {line.trim()}
                </li>
              ))}
            </ul>
          </div>
        );
      case 'two-column':
        return (
          <div className={`${containerClass} p-6`}>
            <h2 className="text-xl font-semibold mb-4">{slide.title}</h2>
            <div className="grid grid-cols-2 gap-4 h-3/4">
              <div className="text-sm">
                <h3 className="font-medium mb-2">Column 1</h3>
                <div className="whitespace-pre-wrap">{slide.content.split('|')[0] || 'Content for left column'}</div>
              </div>
              <div className="text-sm">
                <h3 className="font-medium mb-2">Column 2</h3>
                <div className="whitespace-pre-wrap">{slide.content.split('|')[1] || 'Content for right column'}</div>
              </div>
            </div>
          </div>
        );
      case 'image-content':
        return (
          <div className={`${containerClass} p-6`}>
            <h2 className="text-xl font-semibold mb-4">{slide.title}</h2>
            <div className="grid grid-cols-2 gap-4 h-3/4">
              <div className="bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                <i className="fas fa-image text-3xl text-gray-400"></i>
              </div>
              <div className="text-sm whitespace-pre-wrap">{slide.content}</div>
            </div>
          </div>
        );
      case 'image':
        return (
          <div className={`${containerClass} p-6`}>
            <h2 className="text-xl font-semibold mb-4">{slide.title}</h2>
            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
              <i className="fas fa-image text-4xl text-gray-400"></i>
            </div>
          </div>
        );
      case 'comparison':
        return (
          <div className={`${containerClass} p-6`}>
            <h2 className="text-xl font-semibold mb-4">{slide.title}</h2>
            <div className="grid grid-cols-2 gap-4 h-3/4">
              <div className="bg-green-50 dark:bg-green-900 p-4 rounded">
                <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">Pros</h3>
                <div className="text-sm text-green-700 dark:text-green-300">{slide.content.split('|')[0] || 'Advantages'}</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900 p-4 rounded">
                <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">Cons</h3>
                <div className="text-sm text-red-700 dark:text-red-300">{slide.content.split('|')[1] || 'Disadvantages'}</div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className={`${containerClass} p-6`}>
            <h2 className="text-xl font-semibold mb-4">{slide.title}</h2>
            <p className="text-sm">{slide.content}</p>
          </div>
        );
    }
  };

  if (isSlideshow) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <button
          onClick={exitSlideshow}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          data-testid="exit-slideshow"
        >
          <i className="fas fa-times text-2xl"></i>
        </button>
        
        <div className="w-full h-full max-w-6xl max-h-4xl bg-white dark:bg-gray-800 mx-4 relative">
          {getSlidePreview(slides[currentSlide])}
        </div>
        
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="text-white border-white hover:bg-white hover:text-black"
            data-testid="prev-slide-slideshow"
          >
            <i className="fas fa-chevron-left"></i>
          </Button>
          <span className="text-white">
            {currentSlide + 1} / {slides.length}
          </span>
          <Button
            variant="outline"
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="text-white border-white hover:bg-white hover:text-black"
            data-testid="next-slide-slideshow"
          >
            <i className="fas fa-chevron-right"></i>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-file-powerpoint text-white text-sm"></i>
                </div>
                <div>
                  {isEditingName ? (
                    <Input
                      value={presentationName}
                      onChange={(e) => setPresentationName(e.target.value)}
                      onBlur={() => setIsEditingName(false)}
                      onKeyPress={(e) => e.key === 'Enter' && setIsEditingName(false)}
                      className="h-8 w-48 text-lg font-semibold"
                      autoFocus
                      data-testid="presentation-name-input"
                    />
                  ) : (
                    <h1 
                      className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-orange-600"
                      onClick={() => setIsEditingName(true)}
                      data-testid="presentation-name"
                    >
                      {presentationName}
                    </h1>
                  )}
                  <p className="text-sm text-gray-500">{slides.length} slides</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={importPresentation}
                data-testid="import-presentation"
              >
                <i className="fas fa-upload mr-2"></i>
                Import
              </Button>
              <div className="relative group">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => savePresentation('json')}
                  data-testid="save-presentation"
                >
                  <i className="fas fa-save mr-2"></i>
                  Save ▼
                </Button>
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => savePresentation('json')}
                    className="w-full justify-start whitespace-nowrap"
                    data-testid="save-json"
                  >
                    <i className="fas fa-file-code mr-2"></i>
                    Save as JSON
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => savePresentation('pptx')}
                    className="w-full justify-start whitespace-nowrap"
                    data-testid="save-pptx"
                  >
                    <i className="fas fa-file-powerpoint mr-2"></i>
                    Export as PPTX
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => savePresentation('pdf')}
                    className="w-full justify-start whitespace-nowrap"
                    data-testid="save-pdf"
                  >
                    <i className="fas fa-file-pdf mr-2"></i>
                    Export as PDF
                  </Button>
                </div>
              </div>
              <Button onClick={startSlideshow} className="bg-orange-600 hover:bg-orange-700" data-testid="start-slideshow">
                <i className="fas fa-play mr-2"></i>
                Slideshow
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Slide Thumbnails */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Slides</h3>
              <div className="flex space-x-1">
                <Button size="sm" onClick={() => addSlide('content')} data-testid="add-slide">
                  <i className="fas fa-plus"></i>
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              {slides.map((slide, index) => (
                <Card 
                  key={slide.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    currentSlide === index ? 'ring-2 ring-orange-500' : ''
                  }`}
                  onClick={() => setCurrentSlide(index)}
                  data-testid={`slide-thumbnail-${index}`}
                >
                  <CardContent className="p-3">
                    <div className="aspect-video bg-gray-50 dark:bg-gray-700 rounded mb-2 overflow-hidden">
                      <div className="w-full h-full scale-[0.4] origin-top-left">
                        {getSlidePreview(slide)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {index + 1}. {slide.title}
                      </span>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateSlide(index);
                          }}
                          className="h-6 w-6 p-0"
                          data-testid={`duplicate-slide-${index}`}
                        >
                          <i className="fas fa-copy text-xs"></i>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSlide(index);
                          }}
                          className="h-6 w-6 p-0"
                          disabled={slides.length === 1}
                          data-testid={`delete-slide-${index}`}
                        >
                          <i className="fas fa-trash text-xs"></i>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-4">
              <Select onValueChange={(value) => updateSlide('layout', value)} value={slides[currentSlide]?.layout}>
                <SelectTrigger className="w-48" data-testid="layout-select">
                  <SelectValue placeholder="Select layout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Title Slide</SelectItem>
                  <SelectItem value="content">Content</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="comparison">Comparison</SelectItem>
                  <SelectItem value="two-column">Two Column</SelectItem>
                  <SelectItem value="image-content">Image + Content</SelectItem>
                  <SelectItem value="bullets">Bullet Points</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-4">
                <Select onValueChange={(value) => updateSlide('animation', value)} value={slides[currentSlide]?.animation || 'fade'}>
                  <SelectTrigger className="w-32" data-testid="animation-select">
                    <SelectValue placeholder="Animation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fade">Fade</SelectItem>
                    <SelectItem value="slide">Slide</SelectItem>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="flip">Flip</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select onValueChange={(value) => updateSlide('theme', value)} value={slides[currentSlide]?.theme || 'default'}>
                  <SelectTrigger className="w-32" data-testid="theme-select">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSlide('title')}
                    data-testid="add-title-slide"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Title Slide
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSlide('bullets')}
                    data-testid="add-bullets-slide"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Bullet Slide
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Slide Editor */}
          <div className="flex-1 p-8 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-lg w-full max-w-4xl aspect-video relative">
              {slides[currentSlide] && (
                <div className="h-full p-8">
                  {editingField === 'title' ? (
                    <Input
                      value={slides[currentSlide].title}
                      onChange={(e) => updateSlide('title', e.target.value)}
                      onBlur={() => setEditingField(null)}
                      onKeyPress={(e) => e.key === 'Enter' && setEditingField(null)}
                      className="text-2xl font-bold mb-4 border-none shadow-none p-0"
                      autoFocus
                      data-testid="title-editor"
                    />
                  ) : (
                    <h1 
                      className="text-2xl font-bold mb-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded"
                      onClick={() => setEditingField('title')}
                      data-testid="slide-title"
                    >
                      {slides[currentSlide].title}
                    </h1>
                  )}
                  
                  {editingField === 'content' ? (
                    <Textarea
                      value={slides[currentSlide].content}
                      onChange={(e) => updateSlide('content', e.target.value)}
                      onBlur={() => setEditingField(null)}
                      className="flex-1 min-h-[300px] border-none shadow-none p-2 resize-none"
                      autoFocus
                      data-testid="content-editor"
                    />
                  ) : (
                    <div 
                      className="flex-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded min-h-[300px]"
                      onClick={() => setEditingField('content')}
                      data-testid="slide-content"
                    >
                      <div className="whitespace-pre-wrap">{slides[currentSlide].content}</div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Navigation */}
              <div className="absolute bottom-4 right-4 flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  data-testid="prev-slide"
                >
                  <i className="fas fa-chevron-left"></i>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextSlide}
                  disabled={currentSlide === slides.length - 1}
                  data-testid="next-slide"
                >
                  <i className="fas fa-chevron-right"></i>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}