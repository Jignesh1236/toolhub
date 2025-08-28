import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";

export default function PasswordGenerator() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState([12]);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [strength, setStrength] = useState("");
  const { toast } = useToast();

  const generatePassword = () => {
    let charset = "";
    
    if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (includeNumbers) charset += "0123456789";
    if (includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    
    if (excludeSimilar) {
      charset = charset.replace(/[0O1lI]/g, "");
    }
    
    if (charset === "") {
      toast({
        title: "Error",
        description: "Please select at least one character type.",
        variant: "destructive",
      });
      return;
    }
    
    let newPassword = "";
    for (let i = 0; i < length[0]; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    setPassword(newPassword);
    calculateStrength(newPassword);
  };

  const calculateStrength = (pwd: string) => {
    let score = 0;
    
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    if (pwd.length >= 16) score += 1;
    
    if (score < 3) setStrength("Weak");
    else if (score < 5) setStrength("Medium");
    else if (score < 6) setStrength("Strong");
    else setStrength("Very Strong");
  };

  const copyToClipboard = async () => {
    if (!password) return;
    
    try {
      await navigator.clipboard.writeText(password);
      toast({
        title: "Copied!",
        description: "Password copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy password.",
        variant: "destructive",
      });
    }
  };

  const downloadPasswordRecord = () => {
    if (!password) {
      toast({
        title: "Error",
        description: "Please generate a password first",
        variant: "destructive",
      });
      return;
    }

    const recordText = `Password Record
Generated: ${new Date().toLocaleString()}

Password: ${password}
Strength: ${strength}

Settings Used:
- Length: ${length[0]} characters
- Uppercase: ${includeUppercase ? 'Yes' : 'No'}
- Lowercase: ${includeLowercase ? 'Yes' : 'No'}
- Numbers: ${includeNumbers ? 'Yes' : 'No'}
- Symbols: ${includeSymbols ? 'Yes' : 'No'}
- Exclude Similar: ${excludeSimilar ? 'Yes' : 'No'}

Security Tips:
- Store this password in a secure password manager
- Never share passwords via email or text
- Use unique passwords for each account
- Enable two-factor authentication when available

IMPORTANT: Keep this record secure and delete it after saving to your password manager.
`;

    const blob = new Blob([recordText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `password-record-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Password Record Downloaded",
      description: "Secure password record has been saved",
    });
  };

  const getStrengthColor = () => {
    switch (strength) {
      case "Weak": return "bg-red-100 text-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Strong": return "bg-blue-100 text-blue-800";
      case "Very Strong": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Password Generator</h1>
          <p className="text-gray-600 dark:text-gray-400">Generate secure passwords with customizable options</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generator Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Password Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password Length */}
              <div>
                <Label htmlFor="length">Password Length: {length[0]}</Label>
                <Slider
                  value={length}
                  onValueChange={setLength}
                  max={50}
                  min={4}
                  step={1}
                  className="mt-2"
                  data-testid="length-slider"
                />
              </div>

              {/* Character Types */}
              <div className="space-y-4">
                <Label>Character Types</Label>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="uppercase"
                    checked={includeUppercase}
                    onCheckedChange={(checked) => setIncludeUppercase(checked === true)}
                    data-testid="uppercase-checkbox"
                  />
                  <Label htmlFor="uppercase">Uppercase Letters (A-Z)</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lowercase"
                    checked={includeLowercase}
                    onCheckedChange={(checked) => setIncludeLowercase(checked === true)}
                    data-testid="lowercase-checkbox"
                  />
                  <Label htmlFor="lowercase">Lowercase Letters (a-z)</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="numbers"
                    checked={includeNumbers}
                    onCheckedChange={(checked) => setIncludeNumbers(checked === true)}
                    data-testid="numbers-checkbox"
                  />
                  <Label htmlFor="numbers">Numbers (0-9)</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="symbols"
                    checked={includeSymbols}
                    onCheckedChange={(checked) => setIncludeSymbols(checked === true)}
                    data-testid="symbols-checkbox"
                  />
                  <Label htmlFor="symbols">Symbols (!@#$%^&*)</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="excludeSimilar"
                    checked={excludeSimilar}
                    onCheckedChange={(checked) => setExcludeSimilar(checked === true)}
                    data-testid="exclude-similar-checkbox"
                  />
                  <Label htmlFor="excludeSimilar">Exclude similar characters (0, O, 1, l, I)</Label>
                </div>
              </div>

              <Button onClick={generatePassword} className="w-full" data-testid="generate-button">
                <i className="fas fa-key mr-2"></i>
                Generate Password
              </Button>
            </CardContent>
          </Card>

          {/* Generated Password */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Password</CardTitle>
                {strength && (
                  <Badge className={getStrengthColor()} data-testid="strength-badge">
                    {strength}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {password ? (
                <>
                  <div className="relative">
                    <Input
                      type="text"
                      value={password}
                      readOnly
                      className="font-mono text-lg pr-20"
                      data-testid="generated-password"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyToClipboard}
                        data-testid="copy-password"
                      >
                        <i className="fas fa-copy"></i>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={downloadPasswordRecord}
                        data-testid="download-password"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Length</p>
                      <p className="font-semibold">{password.length} characters</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Entropy</p>
                      <p className="font-semibold">{Math.floor(Math.log2(Math.pow(64, password.length)))} bits</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <div className="text-center">
                    <i className="fas fa-key text-4xl text-gray-400 mb-2"></i>
                    <p className="text-gray-500 dark:text-gray-400">
                      Click "Generate Password" to create a secure password
                    </p>
                  </div>
                </div>
              )}

              {/* Password Tips */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  <i className="fas fa-lightbulb mr-2"></i>
                  Password Security Tips
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• Use at least 12 characters for better security</li>
                  <li>• Include a mix of uppercase, lowercase, numbers, and symbols</li>
                  <li>• Never reuse passwords across different accounts</li>
                  <li>• Consider using a password manager</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
