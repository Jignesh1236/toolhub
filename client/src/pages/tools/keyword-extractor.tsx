import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Key, Search, BarChart3, Copy, Download, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Keyword {
  word: string;
  frequency: number;
  relevance: number;
  category: 'high' | 'medium' | 'low';
}

interface KeywordStats {
  totalWords: number;
  uniqueWords: number;
  averageWordLength: number;
  totalKeywords: number;
}

export default function KeywordExtractor() {
  const [inputText, setInputText] = useState<string>("");
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [stats, setStats] = useState<KeywordStats | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [minWordLength, setMinWordLength] = useState<number[]>([3]);
  const [maxKeywords, setMaxKeywords] = useState<number[]>([20]);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(false);
  const { toast } = useToast();

  // Common stop words to filter out
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall', 'this', 'that',
    'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
    'my', 'your', 'his', 'her', 'its', 'our', 'their', 'what', 'when', 'where', 'why', 'how',
    'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
    'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'now', 'also', 'here',
    'there', 'up', 'out', 'if', 'about', 'into', 'through', 'during', 'before', 'after', 'above',
    'below', 'from', 'between', 'among', 'because', 'as', 'until', 'while', 'since', 'although'
  ]);

  const extractKeywords = () => {
    if (!inputText.trim()) {
      toast({
        title: "No text provided",
        description: "Please enter some text to extract keywords from.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      try {
        // Clean and normalize text
        const cleanText = inputText
          .toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        // Split into words
        const words = cleanText.split(' ').filter(word => {
          if (word.length < minWordLength[0]) return false;
          if (stopWords.has(word)) return false;
          if (!includeNumbers && /^\d+$/.test(word)) return false;
          return true;
        });

        // Count word frequencies
        const wordFreq = new Map<string, number>();
        words.forEach(word => {
          wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
        });

        // Calculate relevance scores (simple tf-idf approximation)
        const totalWords = words.length;
        const uniqueWords = wordFreq.size;
        
        const keywordList: Keyword[] = Array.from(wordFreq.entries())
          .map(([word, frequency]) => {
            // Simple relevance calculation based on frequency and word length
            const tf = frequency / totalWords;
            const lengthBonus = Math.min(word.length / 10, 1);
            const relevance = tf * lengthBonus * 100;
            
            let category: 'high' | 'medium' | 'low' = 'low';
            if (relevance > 1.5) category = 'high';
            else if (relevance > 0.5) category = 'medium';

            return {
              word,
              frequency,
              relevance: Math.round(relevance * 100) / 100,
              category
            };
          })
          .sort((a, b) => b.relevance - a.relevance)
          .slice(0, maxKeywords[0]);

        // Calculate statistics
        const keywordStats: KeywordStats = {
          totalWords: inputText.split(/\s+/).length,
          uniqueWords,
          averageWordLength: Math.round(words.reduce((sum, word) => sum + word.length, 0) / words.length * 100) / 100,
          totalKeywords: keywordList.length
        };

        setKeywords(keywordList);
        setStats(keywordStats);

        toast({
          title: "Keywords extracted successfully",
          description: `Found ${keywordList.length} relevant keywords.`
        });

      } catch (error) {
        console.error('Keyword extraction failed:', error);
        toast({
          title: "Extraction failed",
          description: "An error occurred while extracting keywords.",
          variant: "destructive"
        });
      } finally {
        setIsProcessing(false);
      }
    }, 1000);
  };

  const copyKeywords = () => {
    const keywordText = keywords.map(k => k.word).join(', ');
    navigator.clipboard.writeText(keywordText).then(() => {
      toast({
        title: "Keywords copied",
        description: "Keywords have been copied to clipboard."
      });
    });
  };

  const exportKeywords = () => {
    const exportData = {
      extracted_at: new Date().toISOString(),
      source_text_length: inputText.length,
      settings: {
        min_word_length: minWordLength[0],
        max_keywords: maxKeywords[0],
        include_numbers: includeNumbers
      },
      statistics: stats,
      keywords: keywords
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `keywords_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Keywords exported",
      description: "Keywords have been exported as JSON file."
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'high':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case 'medium':
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'high': return 'High Relevance';
      case 'medium': return 'Medium Relevance';
      default: return 'Low Relevance';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
          <Key className="w-8 h-8" />
          Keyword Extractor
        </h1>
        <p className="text-lg text-muted-foreground">
          Extract and analyze important keywords from any text content
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Text Input
            </CardTitle>
            <CardDescription>
              Paste or type the text you want to extract keywords from
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="text-input">Text Content</Label>
              <Textarea
                id="text-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter your text here... This can be an article, blog post, research paper, or any content you want to analyze for keywords."
                rows={12}
                className="resize-none"
                data-testid="textarea-input"
              />
              <p className="text-sm text-muted-foreground mt-1">
                {inputText.length} characters, {inputText.split(/\s+/).filter(w => w.length > 0).length} words
              </p>
            </div>

            {/* Settings */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium">Extraction Settings</h4>
              
              <div>
                <Label>Minimum Word Length: {minWordLength[0]} characters</Label>
                <Slider
                  value={minWordLength}
                  onValueChange={setMinWordLength}
                  max={10}
                  min={2}
                  step={1}
                  className="mt-2"
                  data-testid="slider-min-word-length"
                />
              </div>

              <div>
                <Label>Maximum Keywords: {maxKeywords[0]}</Label>
                <Slider
                  value={maxKeywords}
                  onValueChange={setMaxKeywords}
                  max={50}
                  min={5}
                  step={5}
                  className="mt-2"
                  data-testid="slider-max-keywords"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="include-numbers"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  data-testid="checkbox-include-numbers"
                />
                <Label htmlFor="include-numbers">Include numbers as keywords</Label>
              </div>
            </div>

            <Button
              onClick={extractKeywords}
              disabled={!inputText.trim() || isProcessing}
              className="w-full"
              data-testid="button-extract"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Extracting Keywords...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Extract Keywords
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Statistics Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Statistics
            </CardTitle>
            <CardDescription>
              Text analysis overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="stat-total-words">
                      {stats.totalWords}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Words</div>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="stat-unique-words">
                      {stats.uniqueWords}
                    </div>
                    <div className="text-sm text-muted-foreground">Unique Words</div>
                  </div>
                  
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400" data-testid="stat-avg-length">
                      {stats.averageWordLength}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Length</div>
                  </div>
                  
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400" data-testid="stat-keywords">
                      {stats.totalKeywords}
                    </div>
                    <div className="text-sm text-muted-foreground">Keywords</div>
                  </div>
                </div>

                {keywords.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyKeywords}
                        className="flex-1"
                        data-testid="button-copy"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportKeywords}
                        className="flex-1"
                        data-testid="button-export"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No analysis yet</p>
                <p className="text-sm">Extract keywords to see statistics</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Keywords Results */}
      {keywords.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Extracted Keywords</CardTitle>
            <CardDescription>
              Keywords sorted by relevance score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Category filters */}
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="bg-red-50 dark:bg-red-950/20">
                  High Relevance: {keywords.filter(k => k.category === 'high').length}
                </Badge>
                <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-950/20">
                  Medium Relevance: {keywords.filter(k => k.category === 'medium').length}
                </Badge>
                <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20">
                  Low Relevance: {keywords.filter(k => k.category === 'low').length}
                </Badge>
              </div>

              {/* Keywords grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {keywords.map((keyword, index) => (
                  <div
                    key={keyword.word}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    data-testid={`keyword-${index}`}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{keyword.word}</div>
                      <div className="text-sm text-muted-foreground">
                        Frequency: {keyword.frequency} • Score: {keyword.relevance}
                      </div>
                    </div>
                    <Badge className={getCategoryColor(keyword.category)}>
                      {getCategoryLabel(keyword.category)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How Keyword Extraction Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Text Processing</h4>
              <p className="text-sm text-muted-foreground">
                The tool analyzes your text by removing common stop words, normalizing case, and filtering by word length.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Relevance Scoring</h4>
              <p className="text-sm text-muted-foreground">
                Keywords are scored based on frequency, word length, and distribution throughout the text.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Categorization</h4>
              <p className="text-sm text-muted-foreground">
                Results are categorized into high, medium, and low relevance based on their calculated scores.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Customization</h4>
              <p className="text-sm text-muted-foreground">
                Adjust settings like minimum word length and maximum results to fine-tune your keyword extraction.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}