import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";

export default function QRGenerator() {
  const [qrData, setQrData] = useState("");
  const [qrSize, setQrSize] = useState("200");
  const [qrColor, setQrColor] = useState("#000000");
  const [qrBgColor, setQrBgColor] = useState("#ffffff");
  const [qrType, setQrType] = useState("text");
  const [generatedQR, setGeneratedQR] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Contact form fields
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactOrg, setContactOrg] = useState("");
  
  // WiFi form fields
  const [wifiSSID, setWifiSSID] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiSecurity, setWifiSecurity] = useState("WPA");
  const [wifiHidden, setWifiHidden] = useState(false);
  
  const { toast } = useToast();

  const generateQRCode = async () => {
    let dataToEncode = qrData;
    
    // Format data based on type
    switch (qrType) {
      case "contact":
        dataToEncode = `BEGIN:VCARD
VERSION:3.0
FN:${contactName}
TEL:${contactPhone}
EMAIL:${contactEmail}
ORG:${contactOrg}
END:VCARD`;
        break;
      case "wifi":
        dataToEncode = `WIFI:T:${wifiSecurity};S:${wifiSSID};P:${wifiPassword};H:${wifiHidden ? 'true' : 'false'};;`;
        break;
      case "email":
        dataToEncode = `mailto:${qrData}`;
        break;
      case "sms":
        dataToEncode = `sms:${qrData}`;
        break;
      case "phone":
        dataToEncode = `tel:${qrData}`;
        break;
    }
    
    if (!dataToEncode.trim()) {
      toast({
        title: "Error",
        description: "Please enter data to generate QR code.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Using QR Server API (free service)
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&color=${qrColor.substring(1)}&bgcolor=${qrBgColor.substring(1)}&data=${encodeURIComponent(dataToEncode)}`;
      setGeneratedQR(qrUrl);
      
      toast({
        title: "Success!",
        description: "QR code generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = () => {
    if (!generatedQR) return;
    
    const link = document.createElement('a');
    link.href = generatedQR;
    link.download = `qr-code-${Date.now()}.png`;
    link.click();
  };

  const copyQRLink = async () => {
    if (!generatedQR) return;
    
    try {
      await navigator.clipboard.writeText(generatedQR);
      toast({
        title: "Copied!",
        description: "QR code URL copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy URL.",
        variant: "destructive",
      });
    }
  };

  const renderInputFields = () => {
    switch (qrType) {
      case "contact":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="contactName">Full Name</Label>
              <Input
                id="contactName"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="John Doe"
                data-testid="contact-name"
              />
            </div>
            <div>
              <Label htmlFor="contactPhone">Phone Number</Label>
              <Input
                id="contactPhone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+1234567890"
                data-testid="contact-phone"
              />
            </div>
            <div>
              <Label htmlFor="contactEmail">Email</Label>
              <Input
                id="contactEmail"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="john@example.com"
                data-testid="contact-email"
              />
            </div>
            <div>
              <Label htmlFor="contactOrg">Organization</Label>
              <Input
                id="contactOrg"
                value={contactOrg}
                onChange={(e) => setContactOrg(e.target.value)}
                placeholder="Company Name"
                data-testid="contact-org"
              />
            </div>
          </div>
        );
      
      case "wifi":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="wifiSSID">Network Name (SSID)</Label>
              <Input
                id="wifiSSID"
                value={wifiSSID}
                onChange={(e) => setWifiSSID(e.target.value)}
                placeholder="MyWiFiNetwork"
                data-testid="wifi-ssid"
              />
            </div>
            <div>
              <Label htmlFor="wifiPassword">Password</Label>
              <Input
                id="wifiPassword"
                type="password"
                value={wifiPassword}
                onChange={(e) => setWifiPassword(e.target.value)}
                placeholder="WiFi Password"
                data-testid="wifi-password"
              />
            </div>
            <div>
              <Label htmlFor="wifiSecurity">Security Type</Label>
              <Select value={wifiSecurity} onValueChange={setWifiSecurity}>
                <SelectTrigger data-testid="wifi-security">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WPA">WPA/WPA2</SelectItem>
                  <SelectItem value="WEP">WEP</SelectItem>
                  <SelectItem value="nopass">Open (No Password)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="wifiHidden"
                checked={wifiHidden}
                onChange={(e) => setWifiHidden(e.target.checked)}
                className="rounded"
                data-testid="wifi-hidden"
              />
              <Label htmlFor="wifiHidden">Hidden Network</Label>
            </div>
          </div>
        );
      
      default:
        return (
          <div>
            <Label htmlFor="qrData">
              {qrType === "url" && "Website URL"}
              {qrType === "text" && "Text Content"}
              {qrType === "email" && "Email Address"}
              {qrType === "sms" && "Phone Number"}
              {qrType === "phone" && "Phone Number"}
            </Label>
            <Textarea
              id="qrData"
              value={qrData}
              onChange={(e) => setQrData(e.target.value)}
              placeholder={
                qrType === "url" ? "https://example.com" :
                qrType === "email" ? "example@email.com" :
                qrType === "sms" ? "+1234567890" :
                qrType === "phone" ? "+1234567890" :
                "Enter your text here..."
              }
              className="min-h-24"
              data-testid="qr-data-input"
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">QR Code Generator</h1>
          <p className="text-gray-600 dark:text-gray-400">Generate QR codes for URLs, text, contacts, WiFi, and more</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generator Settings */}
          <Card>
            <CardHeader>
              <CardTitle>QR Code Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* QR Code Type */}
              <div>
                <Label>QR Code Type</Label>
                <Tabs value={qrType} onValueChange={setQrType} className="mt-2">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="text" data-testid="type-text">Text</TabsTrigger>
                    <TabsTrigger value="url" data-testid="type-url">URL</TabsTrigger>
                    <TabsTrigger value="contact" data-testid="type-contact">Contact</TabsTrigger>
                  </TabsList>
                  <TabsList className="grid w-full grid-cols-3 mt-2">
                    <TabsTrigger value="wifi" data-testid="type-wifi">WiFi</TabsTrigger>
                    <TabsTrigger value="email" data-testid="type-email">Email</TabsTrigger>
                    <TabsTrigger value="sms" data-testid="type-sms">SMS</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Dynamic Input Fields */}
              {renderInputFields()}

              {/* Customization Options */}
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="qrSize">Size (px)</Label>
                    <Select value={qrSize} onValueChange={setQrSize}>
                      <SelectTrigger data-testid="qr-size">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="150">150x150</SelectItem>
                        <SelectItem value="200">200x200</SelectItem>
                        <SelectItem value="300">300x300</SelectItem>
                        <SelectItem value="400">400x400</SelectItem>
                        <SelectItem value="500">500x500</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="qrColor">Foreground Color</Label>
                    <Input
                      id="qrColor"
                      type="color"
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      className="h-10 w-full"
                      data-testid="qr-color"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="qrBgColor">Background Color</Label>
                  <Input
                    id="qrBgColor"
                    type="color"
                    value={qrBgColor}
                    onChange={(e) => setQrBgColor(e.target.value)}
                    className="h-10 w-full"
                    data-testid="qr-bg-color"
                  />
                </div>
              </div>

              <Button 
                onClick={generateQRCode}
                disabled={isGenerating}
                className="w-full"
                data-testid="generate-qr"
              >
                {isGenerating ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Generating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-qrcode mr-2"></i>
                    Generate QR Code
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated QR Code */}
          <Card>
            <CardHeader>
              <CardTitle>Generated QR Code</CardTitle>
            </CardHeader>
            <CardContent>
              {generatedQR ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-4 bg-white rounded-lg shadow-sm">
                      <img 
                        src={generatedQR} 
                        alt="Generated QR Code" 
                        className="max-w-full h-auto"
                        data-testid="generated-qr-image"
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button onClick={downloadQR} className="flex-1" data-testid="download-qr">
                      <i className="fas fa-download mr-2"></i>
                      Download PNG
                    </Button>
                    <Button onClick={copyQRLink} variant="outline" className="flex-1" data-testid="copy-qr-link">
                      <i className="fas fa-link mr-2"></i>
                      Copy URL
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <div className="text-center">
                    <i className="fas fa-qrcode text-4xl text-gray-400 mb-4"></i>
                    <p className="text-gray-500 dark:text-gray-400">
                      Your generated QR code will appear here
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Usage Examples */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>QR Code Usage Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  <i className="fas fa-link mr-2"></i>Website Links
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Share website URLs quickly by scanning QR codes on business cards or posters
                </p>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">
                  <i className="fas fa-wifi mr-2"></i>WiFi Access
                </h4>
                <p className="text-sm text-green-800 dark:text-green-300">
                  Let guests connect to WiFi instantly without typing passwords
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">
                  <i className="fas fa-user mr-2"></i>Contact Info
                </h4>
                <p className="text-sm text-purple-800 dark:text-purple-300">
                  Share contact details that can be saved directly to address books
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
