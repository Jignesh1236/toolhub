import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, ArrowLeftRight, Volume2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "th", name: "Thai", flag: "🇹🇭" },
  { code: "vi", name: "Vietnamese", flag: "🇻🇳" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "sv", name: "Swedish", flag: "🇸🇪" },
  { code: "da", name: "Danish", flag: "🇩🇰" },
  { code: "no", name: "Norwegian", flag: "🇳🇴" },
  { code: "fi", name: "Finnish", flag: "🇫🇮" },
  { code: "pl", name: "Polish", flag: "🇵🇱" },
];

// Simple translation mapping for demo purposes
const simpleTranslations: Record<string, Record<string, string>> = {
  "hello": {
    "es": "hola",
    "fr": "bonjour", 
    "de": "hallo",
    "it": "ciao",
    "pt": "olá",
    "ru": "привет",
    "ja": "こんにちは",
    "ko": "안녕하세요",
    "zh": "你好",
    "ar": "مرحبا",
    "hi": "नमस्ते"
  },
  "thank you": {
    "es": "gracias",
    "fr": "merci",
    "de": "danke",
    "it": "grazie",
    "pt": "obrigado",
    "ru": "спасибо",
    "ja": "ありがとう",
    "ko": "감사합니다",
    "zh": "谢谢",
    "ar": "شكرا",
    "hi": "धन्यवाद"
  },
  "good morning": {
    "es": "buenos días",
    "fr": "bonjour",
    "de": "guten morgen",
    "it": "buongiorno",
    "pt": "bom dia",
    "ru": "доброе утро",
    "ja": "おはよう",
    "ko": "좋은 아침",
    "zh": "早上好",
    "ar": "صباح الخير",
    "hi": "सुप्रभात"
  }
};

export default function LanguageTranslator() {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [isTranslating, setIsTranslating] = useState(false);
  const [detectedLang, setDetectedLang] = useState("");
  const { toast } = useToast();

  const translateText = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to translate",
        variant: "destructive",
      });
      return;
    }

    setIsTranslating(true);
    setDetectedLang("");

    try {
      // Simulate translation delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simple demo translation - in real app would use translation API
      const lowerText = inputText.toLowerCase().trim();
      let translated = "";

      // Check for simple phrases
      const match = Object.entries(simpleTranslations).find(([phrase]) => 
        lowerText.includes(phrase)
      );

      if (match) {
        const [phrase, translations] = match;
        translated = translations[targetLang] || inputText;
        
        // Detect source language if auto-detect
        if (sourceLang === "auto") {
          const possibleLang = Object.entries(simpleTranslations[phrase]).find(([, trans]) => 
            lowerText.includes(trans.toLowerCase())
          )?.[0] || "en";
          setDetectedLang(possibleLang);
        }
      } else {
        // For demo, return a placeholder translation
        const targetLanguage = languages.find(l => l.code === targetLang);
        translated = `[Translation to ${targetLanguage?.name}: ${inputText}]`;
      }

      setTranslatedText(translated);

      toast({
        title: "Success!",
        description: "Text translated successfully",
      });

    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Error", 
        description: "Translation failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const swapLanguages = () => {
    if (sourceLang === "auto") return;
    
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(translatedText);
    setTranslatedText(inputText);
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

  const speakText = (text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === "zh" ? "zh-CN" : lang === "ar" ? "ar-SA" : lang;
      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Not supported",
        description: "Text-to-speech is not supported in this browser",
        variant: "destructive",
      });
    }
  };

  const getLanguageName = (code: string) => {
    return languages.find(l => l.code === code)?.name || code;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Language Translator</h1>
        <p className="text-muted-foreground">
          Translate text between different languages instantly
        </p>
      </div>

      <div className="grid gap-6">
        <Card data-testid="language-selector-card">
          <CardHeader>
            <CardTitle>Translation Settings</CardTitle>
            <CardDescription>
              Select source and target languages for translation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Select value={sourceLang} onValueChange={setSourceLang}>
                  <SelectTrigger data-testid="select-source-lang">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">🌐 Auto-detect</SelectItem>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {detectedLang && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Detected: {getLanguageName(detectedLang)}
                  </p>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={swapLanguages}
                disabled={sourceLang === "auto"}
                data-testid="button-swap-languages"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </Button>

              <div className="flex-1">
                <Select value={targetLang} onValueChange={setTargetLang}>
                  <SelectTrigger data-testid="select-target-lang">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card data-testid="input-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  {sourceLang === "auto" ? "Source Text" : getLanguageName(sourceLang)}
                </span>
                <div className="flex gap-2">
                  {inputText && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => speakText(inputText, sourceLang)}
                        data-testid="button-speak-input"
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(inputText)}
                        data-testid="button-copy-input"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter text to translate..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[200px] resize-none"
                data-testid="textarea-input"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Characters: {inputText.length}</span>
                <span>Words: {inputText.trim() ? inputText.trim().split(/\s+/).length : 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="output-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{getLanguageName(targetLang)}</span>
                <div className="flex gap-2">
                  {translatedText && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => speakText(translatedText, targetLang)}
                        data-testid="button-speak-output"
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(translatedText)}
                        data-testid="button-copy-output"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Translation will appear here..."
                value={translatedText}
                readOnly
                className="min-h-[200px] resize-none bg-muted"
                data-testid="textarea-output"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Characters: {translatedText.length}</span>
                <span>Words: {translatedText.trim() ? translatedText.trim().split(/\s+/).length : 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Button
              onClick={translateText}
              className="w-full"
              disabled={!inputText.trim() || isTranslating || sourceLang === targetLang}
              data-testid="button-translate"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Translating...
                </>
              ) : (
                "Translate"
              )}
            </Button>
            {sourceLang === targetLang && (
              <p className="text-sm text-muted-foreground text-center mt-2">
                Please select different source and target languages
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}