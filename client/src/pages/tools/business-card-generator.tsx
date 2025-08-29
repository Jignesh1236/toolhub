import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Eye, Palette, Type, Upload } from 'lucide-react';

interface BusinessCardData {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  backgroundColor: string;
  textColor: string;
  template: string;
  logo?: File | null;
}

export default function BusinessCardGenerator() {
  const [cardData, setCardData] = useState<BusinessCardData>({
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    template: 'modern',
    logo: null
  });

  const [logoPreview, setLogoPreview] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof BusinessCardData, value: string) => {
    setCardData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCardData(prev => ({ ...prev, logo: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateBusinessCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size (standard business card: 3.5" x 2" at 300 DPI)
    canvas.width = 1050; // 3.5 * 300
    canvas.height = 600;  // 2 * 300

    // Clear canvas
    ctx.fillStyle = cardData.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add border
    ctx.strokeStyle = cardData.textColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Set text color
    ctx.fillStyle = cardData.textColor;

    if (cardData.template === 'modern') {
      // Modern template layout
      ctx.font = 'bold 48px Arial';
      ctx.fillText(cardData.name, 60, 120);

      ctx.font = '28px Arial';
      ctx.fillText(cardData.title, 60, 160);

      ctx.font = 'bold 32px Arial';
      ctx.fillText(cardData.company, 60, 210);

      ctx.font = '24px Arial';
      let yPos = 280;
      if (cardData.email) {
        ctx.fillText(`✉ ${cardData.email}`, 60, yPos);
        yPos += 40;
      }
      if (cardData.phone) {
        ctx.fillText(`📞 ${cardData.phone}`, 60, yPos);
        yPos += 40;
      }
      if (cardData.website) {
        ctx.fillText(`🌐 ${cardData.website}`, 60, yPos);
        yPos += 40;
      }
    } else if (cardData.template === 'classic') {
      // Classic template layout
      ctx.textAlign = 'center';
      ctx.font = 'bold 42px serif';
      ctx.fillText(cardData.name, canvas.width / 2, 140);

      ctx.font = '26px serif';
      ctx.fillText(cardData.title, canvas.width / 2, 180);

      ctx.font = 'bold 30px serif';
      ctx.fillText(cardData.company, canvas.width / 2, 230);

      ctx.font = '22px serif';
      let yPos = 300;
      if (cardData.email) {
        ctx.fillText(cardData.email, canvas.width / 2, yPos);
        yPos += 35;
      }
      if (cardData.phone) {
        ctx.fillText(cardData.phone, canvas.width / 2, yPos);
        yPos += 35;
      }
      if (cardData.website) {
        ctx.fillText(cardData.website, canvas.width / 2, yPos);
      }
    } else if (cardData.template === 'creative') {
      // Creative template with side design
      // Add colored side panel
      const panelColor = cardData.textColor === '#000000' ? '#007bff' : cardData.textColor;
      ctx.fillStyle = panelColor;
      ctx.fillRect(0, 0, 200, canvas.height);

      // Reset text color for main content
      ctx.fillStyle = cardData.textColor;
      ctx.font = 'bold 44px Arial';
      ctx.fillText(cardData.name, 240, 120);

      ctx.font = '28px Arial';
      ctx.fillText(cardData.title, 240, 160);

      ctx.font = 'bold 32px Arial';
      ctx.fillText(cardData.company, 240, 210);

      ctx.font = '24px Arial';
      let yPos = 280;
      if (cardData.email) {
        ctx.fillText(cardData.email, 240, yPos);
        yPos += 40;
      }
      if (cardData.phone) {
        ctx.fillText(cardData.phone, 240, yPos);
        yPos += 40;
      }
      if (cardData.website) {
        ctx.fillText(cardData.website, 240, yPos);
      }

      // Add logo area in colored panel if logo exists
      if (logoPreview) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 20, 20, 160, 160);
        };
        img.src = logoPreview;
      }
    }

    // Add address at bottom if provided
    if (cardData.address) {
      ctx.font = '20px Arial';
      ctx.textAlign = cardData.template === 'classic' ? 'center' : 'left';
      const xPos = cardData.template === 'classic' ? canvas.width / 2 : 
                   cardData.template === 'creative' ? 240 : 60;
      ctx.fillText(cardData.address, xPos, canvas.height - 40);
    }
  };

  const downloadBusinessCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${cardData.name.replace(/\s+/g, '_')}_business_card.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // Generate card when data changes
  React.useEffect(() => {
    if (cardData.name || cardData.company) {
      generateBusinessCard();
    }
  }, [cardData, logoPreview]);

  const templates = [
    { value: 'modern', label: 'Modern' },
    { value: 'classic', label: 'Classic' },
    { value: 'creative', label: 'Creative' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Business Card Generator</h1>
          <p className="text-lg text-muted-foreground">
            Create professional digital business cards with custom designs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Business Card Details
              </CardTitle>
              <CardDescription>
                Fill in your information to create your business card
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={cardData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={cardData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Software Engineer"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  value={cardData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="Tech Solutions Inc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={cardData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="john@company.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={cardData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={cardData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="www.company.com"
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={cardData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Business St, City, State 12345"
                  rows={2}
                />
              </div>

              {/* Design Options */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Design Options
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="template">Template</Label>
                    <Select 
                      value={cardData.template} 
                      onValueChange={(value) => handleInputChange('template', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.value} value={template.value}>
                            {template.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={cardData.backgroundColor}
                      onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                      className="h-10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="textColor">Text Color</Label>
                    <Input
                      id="textColor"
                      type="color"
                      value={cardData.textColor}
                      onChange={(e) => handleInputChange('textColor', e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Label>Logo (Optional)</Label>
                  <div className="mt-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                    {logoPreview && (
                      <div className="mt-2">
                        <img 
                          src={logoPreview} 
                          alt="Logo preview" 
                          className="w-20 h-20 object-contain border rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview and Download */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Business Card Preview
              </CardTitle>
              <CardDescription>
                Preview your business card design
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                  <canvas
                    ref={canvasRef}
                    className="max-w-full h-auto border rounded"
                    style={{ aspectRatio: '1.75' }}
                  />
                </div>

                <Button 
                  onClick={downloadBusinessCard}
                  className="w-full"
                  disabled={!cardData.name && !cardData.company}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Business Card (PNG)
                </Button>

                <div className="text-sm text-muted-foreground">
                  <p>• Standard business card size: 3.5" × 2"</p>
                  <p>• High resolution: 300 DPI</p>
                  <p>• Ready for printing or digital use</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}