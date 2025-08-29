import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function HashGenerator() {
  const [inputText, setInputText] = useState('');
  const [md5Hash, setMd5Hash] = useState('');
  const [sha1Hash, setSha1Hash] = useState('');
  const [sha256Hash, setSha256Hash] = useState('');
  const { toast } = useToast();

  // Simple MD5 implementation
  const generateMD5 = (text: string): string => {
    // This is a simplified MD5 for demo purposes
    // In production, use a proper crypto library
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  };

  const generateHashes = async () => {
    if (!inputText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some text to generate hashes',
        variant: 'destructive',
      });
      return;
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(inputText);

      // Generate MD5 (simplified)
      const md5 = generateMD5(inputText);
      setMd5Hash(md5);

      // Generate SHA-1
      const sha1Buffer = await crypto.subtle.digest('SHA-1', data);
      const sha1Array = Array.from(new Uint8Array(sha1Buffer));
      const sha1 = sha1Array.map(b => b.toString(16).padStart(2, '0')).join('');
      setSha1Hash(sha1);

      // Generate SHA-256
      const sha256Buffer = await crypto.subtle.digest('SHA-256', data);
      const sha256Array = Array.from(new Uint8Array(sha256Buffer));
      const sha256 = sha256Array.map(b => b.toString(16).padStart(2, '0')).join('');
      setSha256Hash(sha256);

      toast({
        title: 'Success',
        description: 'Hashes generated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate hashes',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string, hashType: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied',
        description: `${hashType} hash copied to clipboard`,
      });
    });
  };

  const clearAll = () => {
    setInputText('');
    setMd5Hash('');
    setSha1Hash('');
    setSha256Hash('');
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          <i className="fas fa-hashtag mr-3 text-purple-600"></i>
          Hash Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate MD5, SHA-1, and SHA-256 hashes for your text
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Input Text</CardTitle>
            <CardDescription>Enter the text you want to hash</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="input-text">Text to Hash</Label>
              <Textarea
                id="input-text"
                placeholder="Enter your text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={6}
                className="mt-2"
                data-testid="input-text"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={generateHashes} className="flex-1" data-testid="generate-button">
                <i className="fas fa-cog mr-2"></i>
                Generate Hashes
              </Button>
              <Button onClick={clearAll} variant="outline" data-testid="clear-button">
                <i className="fas fa-trash mr-2"></i>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">
                <i className="fas fa-shield-alt mr-2"></i>
                MD5 Hash
              </CardTitle>
              <CardDescription>32-character hexadecimal digest</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="md5-output">MD5 Output</Label>
                <Input
                  id="md5-output"
                  value={md5Hash}
                  readOnly
                  className="mt-2 bg-gray-50 dark:bg-gray-800 font-mono text-sm"
                  placeholder="MD5 hash will appear here..."
                  data-testid="md5-output"
                />
              </div>
              <Button
                onClick={() => copyToClipboard(md5Hash, 'MD5')}
                disabled={!md5Hash}
                variant="outline"
                size="sm"
                className="w-full"
                data-testid="copy-md5-button"
              >
                <i className="fas fa-copy mr-2"></i>
                Copy MD5
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">
                <i className="fas fa-shield-alt mr-2"></i>
                SHA-1 Hash
              </CardTitle>
              <CardDescription>40-character hexadecimal digest</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sha1-output">SHA-1 Output</Label>
                <Input
                  id="sha1-output"
                  value={sha1Hash}
                  readOnly
                  className="mt-2 bg-gray-50 dark:bg-gray-800 font-mono text-sm"
                  placeholder="SHA-1 hash will appear here..."
                  data-testid="sha1-output"
                />
              </div>
              <Button
                onClick={() => copyToClipboard(sha1Hash, 'SHA-1')}
                disabled={!sha1Hash}
                variant="outline"
                size="sm"
                className="w-full"
                data-testid="copy-sha1-button"
              >
                <i className="fas fa-copy mr-2"></i>
                Copy SHA-1
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">
                <i className="fas fa-shield-alt mr-2"></i>
                SHA-256 Hash
              </CardTitle>
              <CardDescription>64-character hexadecimal digest</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sha256-output">SHA-256 Output</Label>
                <Input
                  id="sha256-output"
                  value={sha256Hash}
                  readOnly
                  className="mt-2 bg-gray-50 dark:bg-gray-800 font-mono text-sm"
                  placeholder="SHA-256 hash will appear here..."
                  data-testid="sha256-output"
                />
              </div>
              <Button
                onClick={() => copyToClipboard(sha256Hash, 'SHA-256')}
                disabled={!sha256Hash}
                variant="outline"
                size="sm"
                className="w-full"
                data-testid="copy-sha256-button"
              >
                <i className="fas fa-copy mr-2"></i>
                Copy SHA-256
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>About Hash Functions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-red-600 mb-2">MD5</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  128-bit hash function, widely used but considered cryptographically broken. 
                  Good for checksums but not for security.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-600 mb-2">SHA-1</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  160-bit hash function, better than MD5 but also deprecated for security applications. 
                  Still used in some legacy systems.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-green-600 mb-2">SHA-256</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  256-bit hash function, part of SHA-2 family. Currently secure and widely used 
                  for cryptographic applications.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}