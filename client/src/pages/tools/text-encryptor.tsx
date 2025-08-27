import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Eye, EyeOff, Lock, Unlock, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CryptoJS from "crypto-js";

const encryptionMethods = [
  { id: "aes", name: "AES-256", description: "Advanced Encryption Standard" },
  { id: "des", name: "DES", description: "Data Encryption Standard" },
  { id: "rabbit", name: "Rabbit", description: "High-speed stream cipher" },
  { id: "rc4", name: "RC4", description: "Rivest Cipher 4" },
];

export default function TextEncryptor() {
  const [inputText, setInputText] = useState("");
  const [password, setPassword] = useState("");
  const [method, setMethod] = useState("aes");
  const [outputText, setOutputText] = useState("");
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const processText = () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to process",
        variant: "destructive",
      });
      return;
    }

    if (!password.trim()) {
      toast({
        title: "Error",
        description: "Please enter a password",
        variant: "destructive",
      });
      return;
    }

    try {
      let result = "";

      if (mode === "encrypt") {
        switch (method) {
          case "aes":
            result = CryptoJS.AES.encrypt(inputText, password).toString();
            break;
          case "des":
            result = CryptoJS.DES.encrypt(inputText, password).toString();
            break;
          case "rabbit":
            result = CryptoJS.Rabbit.encrypt(inputText, password).toString();
            break;
          case "rc4":
            result = CryptoJS.RC4.encrypt(inputText, password).toString();
            break;
          default:
            throw new Error("Unknown encryption method");
        }
      } else {
        switch (method) {
          case "aes":
            result = CryptoJS.AES.decrypt(inputText, password).toString(CryptoJS.enc.Utf8);
            break;
          case "des":
            result = CryptoJS.DES.decrypt(inputText, password).toString(CryptoJS.enc.Utf8);
            break;
          case "rabbit":
            result = CryptoJS.Rabbit.decrypt(inputText, password).toString(CryptoJS.enc.Utf8);
            break;
          case "rc4":
            result = CryptoJS.RC4.decrypt(inputText, password).toString(CryptoJS.enc.Utf8);
            break;
          default:
            throw new Error("Unknown decryption method");
        }

        if (!result) {
          throw new Error("Decryption failed - incorrect password or corrupted data");
        }
      }

      setOutputText(result);
      
      toast({
        title: "Success!",
        description: `Text ${mode}ed successfully`,
      });

    } catch (error) {
      console.error(`${mode} error:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${mode} text`,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const swapInputOutput = () => {
    setInputText(outputText);
    setOutputText("");
    setMode(mode === "encrypt" ? "decrypt" : "encrypt");
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let result = "";
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
  };

  const selectedMethod = encryptionMethods.find(m => m.id === method);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Text Encryptor/Decryptor</h1>
        <p className="text-muted-foreground">
          Encrypt and decrypt text using various cryptographic algorithms
        </p>
      </div>

      <div className="grid gap-6">
        <Card data-testid="settings-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Encryption Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="mode">Mode</Label>
                <Select value={mode} onValueChange={(value: "encrypt" | "decrypt") => setMode(value)}>
                  <SelectTrigger data-testid="select-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="encrypt">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Encrypt
                      </div>
                    </SelectItem>
                    <SelectItem value="decrypt">
                      <div className="flex items-center gap-2">
                        <Unlock className="h-4 w-4" />
                        Decrypt
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="method">Encryption Method</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger data-testid="select-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {encryptionMethods.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        <div>
                          <div className="font-medium">{m.name}</div>
                          <div className="text-sm text-muted-foreground">{m.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="password">Password</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter encryption password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    data-testid="input-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateRandomPassword}
                  data-testid="button-generate-password"
                >
                  Generate
                </Button>
              </div>
              {selectedMethod && (
                <p className="text-sm text-muted-foreground mt-2">
                  Using {selectedMethod.name} - {selectedMethod.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card data-testid="input-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Input Text</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(inputText)}
                  disabled={!inputText}
                  data-testid="button-copy-input"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>
                Enter the text you want to {mode}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={`Enter text to ${mode}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
                data-testid="textarea-input"
              />
              <div className="text-xs text-muted-foreground mt-2">
                Characters: {inputText.length}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="output-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Output Text</span>
                <div className="flex gap-2">
                  {outputText && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={swapInputOutput}
                        data-testid="button-swap"
                      >
                        Swap
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(outputText)}
                        data-testid="button-copy-output"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardTitle>
              <CardDescription>
                {mode === "encrypt" ? "Encrypted" : "Decrypted"} result
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={`${mode === "encrypt" ? "Encrypted" : "Decrypted"} text will appear here...`}
                value={outputText}
                readOnly
                className="min-h-[200px] font-mono text-sm"
                data-testid="textarea-output"
              />
              <div className="text-xs text-muted-foreground mt-2">
                Characters: {outputText.length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Button
              onClick={processText}
              className="w-full"
              disabled={!inputText.trim() || !password.trim()}
              data-testid="button-process"
            >
              {mode === "encrypt" ? (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Encrypt Text
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4 mr-2" />
                  Decrypt Text
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}