import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Download, Lock, FileText, Shield, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PDFPasswordProtect() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [protectedUrl, setProtectedUrl] = useState<string | null>(null);
  const [ownerPassword, setOwnerPassword] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [permissions, setPermissions] = useState({
    print: true,
    copy: true,
    modify: true,
    annotate: true,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setOriginalFile(file);
      setProtectedUrl(null);
    } else {
      alert('Please select a valid PDF file.');
    }
  };

  const protectPDF = async () => {
    if (!originalFile || (!ownerPassword && !userPassword)) {
      alert('Please provide at least one password.');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Import PDF-lib dynamically
      const { PDFDocument, StandardFonts } = await import('pdf-lib');
      
      const arrayBuffer = await originalFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Set up encryption options
      const encryptOptions: any = {};
      
      if (ownerPassword) {
        encryptOptions.ownerPassword = ownerPassword;
      }
      
      if (userPassword) {
        encryptOptions.userPassword = userPassword;
      }
      
      // Set permissions
      encryptOptions.permissions = {
        printing: permissions.print ? 'highResolution' : 'none',
        modifying: permissions.modify,
        copying: permissions.copy,
        annotating: permissions.annotate,
        fillingForms: permissions.modify,
        contentAccessibility: true,
        documentAssembly: permissions.modify,
      };
      
      // Save with encryption
      const protectedBytes = await pdfDoc.save(encryptOptions);
      
      // Create blob and URL
      const blob = new Blob([protectedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setProtectedUrl(url);
      setIsProcessing(false);
      
    } catch (error) {
      console.error('PDF protection error:', error);
      alert('Error protecting PDF. Please try again.');
      setIsProcessing(false);
    }
  };

  const downloadProtected = () => {
    if (protectedUrl && originalFile) {
      const link = document.createElement('a');
      link.href = protectedUrl;
      link.download = `protected-${originalFile.name}`;
      link.click();
    }
  };

  const resetProtector = () => {
    setOriginalFile(null);
    setProtectedUrl(null);
    setOwnerPassword("");
    setUserPassword("");
    setPermissions({
      print: true,
      copy: true,
      modify: true,
      annotate: true,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">PDF Password Protect</h1>
          <p className="text-lg text-gray-600">Add password protection and security to your PDF files</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              PDF Security Tool
            </CardTitle>
            <CardDescription>
              Secure your PDF files with passwords and control user permissions for viewing, printing, and editing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Owner password grants full access, while user password restricts access based on permissions. 
                Always remember your passwords - they cannot be recovered!
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <Label htmlFor="pdf-upload">Upload PDF File</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className="flex-1"
                />
                <Button onClick={resetProtector} variant="outline">
                  Reset
                </Button>
              </div>
            </div>

            {originalFile && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Owner Password (Full Access)
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          type={showPasswords ? "text" : "password"}
                          value={ownerPassword}
                          onChange={(e) => setOwnerPassword(e.target.value)}
                          placeholder="Enter owner password"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setOwnerPassword(generatePassword())}
                      >
                        Generate
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Allows full access to the PDF including changing security settings
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Label className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      User Password (Restricted Access)
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          type={showPasswords ? "text" : "password"}
                          value={userPassword}
                          onChange={(e) => setUserPassword(e.target.value)}
                          placeholder="Enter user password"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setUserPassword(generatePassword())}
                      >
                        Generate
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Required to open the PDF with limited permissions
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPasswords(!showPasswords)}
                  >
                    {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Label className="text-sm">
                    {showPasswords ? 'Hide' : 'Show'} passwords
                  </Label>
                </div>

                <div className="space-y-4">
                  <Label className="text-lg font-medium">User Permissions</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="print"
                        checked={permissions.print}
                        onCheckedChange={(checked) =>
                          setPermissions(prev => ({ ...prev, print: checked as boolean }))
                        }
                      />
                      <Label htmlFor="print" className="text-sm">Allow Printing</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="copy"
                        checked={permissions.copy}
                        onCheckedChange={(checked) =>
                          setPermissions(prev => ({ ...prev, copy: checked as boolean }))
                        }
                      />
                      <Label htmlFor="copy" className="text-sm">Allow Copying Text</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="modify"
                        checked={permissions.modify}
                        onCheckedChange={(checked) =>
                          setPermissions(prev => ({ ...prev, modify: checked as boolean }))
                        }
                      />
                      <Label htmlFor="modify" className="text-sm">Allow Modifications</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="annotate"
                        checked={permissions.annotate}
                        onCheckedChange={(checked) =>
                          setPermissions(prev => ({ ...prev, annotate: checked as boolean }))
                        }
                      />
                      <Label htmlFor="annotate" className="text-sm">Allow Annotations</Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button 
                    onClick={protectPDF} 
                    disabled={isProcessing || (!ownerPassword && !userPassword)}
                    className="px-8"
                  >
                    {isProcessing ? 'Protecting...' : 'Protect PDF'}
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Original PDF
                    </Label>
                    <div className="border rounded-lg p-6 bg-white text-center">
                      <FileText className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                      <p className="font-medium text-gray-900">{originalFile.name}</p>
                      <p className="text-sm text-gray-500">Unprotected</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Protected PDF
                    </Label>
                    <div className="border rounded-lg p-6 bg-white text-center">
                      {protectedUrl ? (
                        <>
                          <div className="relative">
                            <FileText className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <Lock className="h-6 w-6 text-red-500 absolute top-0 right-1/2 transform translate-x-1/2 bg-white rounded-full p-1" />
                          </div>
                          <p className="font-medium text-gray-900">protected-{originalFile.name}</p>
                          <p className="text-sm text-gray-500">Password Protected</p>
                          <Button 
                            onClick={downloadProtected} 
                            className="mt-4"
                            size="sm"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </>
                      ) : (
                        <div className="text-gray-400">
                          <div className="relative">
                            <FileText className="h-16 w-16 mx-auto mb-4" />
                            <Lock className="h-6 w-6 absolute top-0 right-1/2 transform translate-x-1/2 bg-white rounded-full p-1" />
                          </div>
                          <p>{isProcessing ? 'Protecting...' : 'Protected PDF will appear here'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!originalFile && (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-600 mb-2">Click to upload a PDF file</p>
                <p className="text-sm text-gray-500">Add password protection to secure your document</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}