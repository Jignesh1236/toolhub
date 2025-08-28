import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export default function Base64Converter() {
  const [plainText, setPlainText] = useState('');
  const [encodedText, setEncodedText] = useState('');
  const { toast } = useToast();

  const encodeToBase64 = () => {
    if (!plainText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some text to encode',
        variant: 'destructive',
      });
      return;
    }

    try {
      const encoded = btoa(unescape(encodeURIComponent(plainText)));
      setEncodedText(encoded);
      toast({
        title: 'Success',
        description: 'Text encoded to Base64 successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to encode text. Please check your input.',
        variant: 'destructive',
      });
    }
  };

  const decodeFromBase64 = () => {
    if (!encodedText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter Base64 text to decode',
        variant: 'destructive',
      });
      return;
    }

    try {
      const decoded = decodeURIComponent(escape(atob(encodedText)));
      setPlainText(decoded);
      toast({
        title: 'Success',
        description: 'Base64 decoded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid Base64 string. Please check your input.',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied',
        description: 'Text copied to clipboard',
      });
    });
  };

  const clearAll = () => {
    setPlainText('');
    setEncodedText('');
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          <i className="fas fa-code mr-3 text-gray-600"></i>
          Base64 Converter
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Encode and decode text to/from Base64 format
        </p>
      </div>

      <Tabs defaultValue="encode" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="encode">Encode</TabsTrigger>
          <TabsTrigger value="decode">Decode</TabsTrigger>
        </TabsList>

        <TabsContent value="encode">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Plain Text</CardTitle>
                <CardDescription>Enter text to encode to Base64</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="plain-text">Text Input</Label>
                  <Textarea
                    id="plain-text"
                    placeholder="Enter plain text here..."
                    value={plainText}
                    onChange={(e) => setPlainText(e.target.value)}
                    rows={8}
                    className="mt-2"
                    data-testid="plain-text-input"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={encodeToBase64} className="flex-1" data-testid="encode-button">
                    <i className="fas fa-arrow-right mr-2"></i>
                    Encode to Base64
                  </Button>
                  <Button onClick={() => copyToClipboard(plainText)} variant="outline" data-testid="copy-plain-button">
                    <i className="fas fa-copy"></i>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Base64 Output</CardTitle>
                <CardDescription>Encoded Base64 result</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="encoded-output">Base64 Output</Label>
                  <Textarea
                    id="encoded-output"
                    placeholder="Base64 encoded text will appear here..."
                    value={encodedText}
                    readOnly
                    rows={8}
                    className="mt-2 bg-gray-50 dark:bg-gray-800"
                    data-testid="encoded-output"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => copyToClipboard(encodedText)}
                    disabled={!encodedText}
                    className="flex-1"
                    data-testid="copy-encoded-button"
                  >
                    <i className="fas fa-copy mr-2"></i>
                    Copy Base64
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="decode">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Base64 Input</CardTitle>
                <CardDescription>Enter Base64 text to decode</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="encoded-input">Base64 Input</Label>
                  <Textarea
                    id="encoded-input"
                    placeholder="Enter Base64 text here..."
                    value={encodedText}
                    onChange={(e) => setEncodedText(e.target.value)}
                    rows={8}
                    className="mt-2"
                    data-testid="encoded-input"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={decodeFromBase64} className="flex-1" data-testid="decode-button">
                    <i className="fas fa-arrow-left mr-2"></i>
                    Decode from Base64
                  </Button>
                  <Button onClick={() => copyToClipboard(encodedText)} variant="outline" data-testid="copy-base64-button">
                    <i className="fas fa-copy"></i>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plain Text Output</CardTitle>
                <CardDescription>Decoded plain text result</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="plain-output">Plain Text Output</Label>
                  <Textarea
                    id="plain-output"
                    placeholder="Decoded text will appear here..."
                    value={plainText}
                    readOnly
                    rows={8}
                    className="mt-2 bg-gray-50 dark:bg-gray-800"
                    data-testid="plain-output"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => copyToClipboard(plainText)}
                    disabled={!plainText}
                    className="flex-1"
                    data-testid="copy-decoded-button"
                  >
                    <i className="fas fa-copy mr-2"></i>
                    Copy Decoded Text
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-center">
        <Button onClick={clearAll} variant="outline" data-testid="clear-button">
          <i className="fas fa-trash mr-2"></i>
          Clear All
        </Button>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>About Base64</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Base64 is a binary-to-text encoding scheme that represents binary data in ASCII format. 
              It's commonly used for encoding data in email, web forms, and APIs. Each Base64 digit represents 6 bits of data.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}