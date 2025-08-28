import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function WordCounter() {
  const [text, setText] = useState("");
  const { toast } = useToast();

  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/) : [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    const averageWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
    const averageCharsPerWord = words.length > 0 ? text.replace(/\s/g, '').length / words.length : 0;
    
    return {
      characters: text.length,
      charactersNoSpaces: text.replace(/\s/g, '').length,
      words: words.length,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      averageWordsPerSentence: Math.round(averageWordsPerSentence * 100) / 100,
      averageCharsPerWord: Math.round(averageCharsPerWord * 100) / 100,
      readingTime: Math.ceil(words.length / 200), // Average reading speed: 200 words per minute
    };
  }, [text]);

  const readabilityScore = useMemo(() => {
    if (stats.words === 0 || stats.sentences === 0) return 0;
    
    // Simplified Flesch Reading Ease formula
    const averageSentenceLength = stats.words / stats.sentences;
    const averageSyllablesPerWord = stats.averageCharsPerWord / 2; // Rough approximation
    
    const score = 206.835 - (1.015 * averageSentenceLength) - (84.6 * averageSyllablesPerWord);
    return Math.max(0, Math.min(100, Math.round(score)));
  }, [stats]);

  const getReadabilityLevel = (score: number) => {
    if (score >= 90) return { level: "Very Easy", color: "text-green-600" };
    if (score >= 80) return { level: "Easy", color: "text-green-500" };
    if (score >= 70) return { level: "Fairly Easy", color: "text-yellow-500" };
    if (score >= 60) return { level: "Standard", color: "text-orange-500" };
    if (score >= 50) return { level: "Fairly Difficult", color: "text-orange-600" };
    if (score >= 30) return { level: "Difficult", color: "text-red-500" };
    return { level: "Very Difficult", color: "text-red-600" };
  };

  const clearText = () => {
    setText("");
  };

  const copyStats = async () => {
    const statsText = `Text Statistics:
Words: ${stats.words}
Characters: ${stats.characters}
Characters (no spaces): ${stats.charactersNoSpaces}
Sentences: ${stats.sentences}
Paragraphs: ${stats.paragraphs}
Reading Time: ${stats.readingTime} minutes
Readability Score: ${readabilityScore}`;

    try {
      await navigator.clipboard.writeText(statsText);
      toast({
        title: "Copied!",
        description: "Text statistics copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy statistics.",
        variant: "destructive",
      });
    }
  };

  const readabilityInfo = getReadabilityLevel(readabilityScore);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Word Counter</h1>
          <p className="text-gray-600 dark:text-gray-400">Analyze your text with detailed statistics and readability metrics</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Text Input */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Enter Your Text</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={copyStats} data-testid="copy-stats">
                      <i className="fas fa-copy mr-2"></i>
                      Copy Stats
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearText} data-testid="clear-text">
                      <i className="fas fa-times mr-2"></i>
                      Clear
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type or paste your text here to analyze..."
                  className="min-h-96 resize-none"
                  data-testid="text-input"
                />
              </CardContent>
            </Card>
          </div>

          {/* Statistics Panel */}
          <div className="space-y-6">
            {/* Basic Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Text Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="word-count">
                      {stats.words.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Words</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="char-count">
                      {stats.characters.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Characters</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400" data-testid="char-no-spaces">
                      {stats.charactersNoSpaces.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">No Spaces</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400" data-testid="sentence-count">
                      {stats.sentences.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Sentences</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Advanced Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Paragraphs</span>
                    <span className="font-semibold" data-testid="paragraph-count">{stats.paragraphs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Avg words/sentence</span>
                    <span className="font-semibold" data-testid="avg-words-sentence">{stats.averageWordsPerSentence}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Avg chars/word</span>
                    <span className="font-semibold" data-testid="avg-chars-word">{stats.averageCharsPerWord}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Reading time</span>
                    <span className="font-semibold" data-testid="reading-time">{stats.readingTime} min</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Readability Score */}
            <Card>
              <CardHeader>
                <CardTitle>Readability Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2" data-testid="readability-score">
                    {readabilityScore}
                  </div>
                  <div className={`text-lg font-semibold mb-3 ${readabilityInfo.color}`} data-testid="readability-level">
                    {readabilityInfo.level}
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${readabilityScore}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  <p>Flesch Reading Ease Score (0-100)</p>
                  <p>Higher scores indicate easier readability</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
