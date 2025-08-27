import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function ContentSummarizer() {
  const [input, setInput] = useState("");
  const [summary, setSummary] = useState("");
  const [summaryLength, setSummaryLength] = useState([3]);
  const [summaryType, setSummaryType] = useState("extractive");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const summarizeText = async () => {
    if (!input.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to summarize.",
        variant: "destructive",
      });
      return;
    }

    if (input.trim().split(' ').length < 10) {
      toast({
        title: "Text Too Short",
        description: "Please provide at least 10 words to generate a meaningful summary.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 10);
      
      if (summaryType === "extractive") {
        // Extractive summarization - select most important sentences
        const numSentences = Math.min(summaryLength[0], sentences.length);
        
        // Score sentences based on keyword frequency and position
        const wordFreq = new Map<string, number>();
        const words = input.toLowerCase().match(/\b\w+\b/g) || [];
        
        words.forEach(word => {
          if (word.length > 3) { // Ignore short words
            wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
          }
        });
        
        const sentenceScores = sentences.map((sentence, index) => {
          const sentenceWords = sentence.toLowerCase().match(/\b\w+\b/g) || [];
          let score = 0;
          
          sentenceWords.forEach(word => {
            score += wordFreq.get(word) || 0;
          });
          
          // Boost score for sentences at the beginning and end
          if (index < sentences.length * 0.3) score *= 1.2;
          if (index > sentences.length * 0.7) score *= 1.1;
          
          return { sentence: sentence.trim(), score, index };
        });
        
        const topSentences = sentenceScores
          .sort((a, b) => b.score - a.score)
          .slice(0, numSentences)
          .sort((a, b) => a.index - b.index);
        
        setSummary(topSentences.map(s => s.sentence).join('. ') + '.');
        
      } else {
        // Abstractive summarization - generate new sentences (simplified approach)
        const keyWords = input.toLowerCase()
          .match(/\b\w+\b/g)
          ?.filter(word => word.length > 4)
          ?.slice(0, 20) || [];
        
        const keyTopics = Array.from(new Set(keyWords))
          .slice(0, summaryLength[0])
          .join(', ');
        
        setSummary(`This content discusses key topics including: ${keyTopics}. The main focus appears to be on ${keyWords[0] || 'the primary subject'} and related concepts. ${sentences[0]?.substring(0, 100)}...`);
      }

      toast({
        title: "Summary Generated!",
        description: `Created a ${summaryType} summary with ${summaryLength[0]} key points.`,
      });
    } catch (error) {
      toast({
        title: "Summarization Failed",
        description: "Failed to generate summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeSentiment = () => {
    if (!input.trim()) return null;

    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'enjoy', 'happy', 'pleased', 'satisfied', 'perfect', 'outstanding', 'brilliant'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'angry', 'frustrated', 'disappointed', 'poor', 'worst', 'disgusting', 'annoying', 'useless'];

    const words = input.toLowerCase().match(/\b\w+\b/g) || [];
    let positiveScore = 0;
    let negativeScore = 0;

    words.forEach(word => {
      if (positiveWords.includes(word)) positiveScore++;
      if (negativeWords.includes(word)) negativeScore++;
    });

    const totalScore = positiveScore - negativeScore;
    
    if (totalScore > 2) return { sentiment: 'Positive', color: 'text-green-600', score: totalScore };
    if (totalScore < -2) return { sentiment: 'Negative', color: 'text-red-600', score: totalScore };
    return { sentiment: 'Neutral', color: 'text-gray-600', score: totalScore };
  };

  const getKeywords = () => {
    if (!input.trim()) return [];
    
    const words = input.toLowerCase().match(/\b\w+\b/g) || [];
    const wordFreq = new Map<string, number>();
    
    words.forEach(word => {
      if (word.length > 3) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      }
    });
    
    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, freq]) => ({ word, freq }));
  };

  const copyOutput = async () => {
    if (!summary) return;
    
    try {
      await navigator.clipboard.writeText(summary);
      toast({
        title: "Copied!",
        description: "Summary copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const clearAll = () => {
    setInput("");
    setSummary("");
  };

  const loadSample = () => {
    const sampleText = `Artificial Intelligence (AI) has revolutionized numerous industries and continues to shape the future of technology. Machine learning algorithms enable computers to learn from data without being explicitly programmed, leading to breakthrough applications in healthcare, finance, transportation, and entertainment.

In healthcare, AI assists doctors in diagnosing diseases more accurately and quickly. Medical imaging analysis powered by deep learning can detect cancer cells, fractures, and other abnormalities with remarkable precision. Drug discovery processes have also been accelerated through AI, reducing the time and cost required to develop new medications.

The financial sector has embraced AI for fraud detection, algorithmic trading, and risk assessment. Banks use machine learning models to analyze transaction patterns and identify suspicious activities in real-time. Credit scoring has become more sophisticated, enabling better lending decisions based on comprehensive data analysis.

Autonomous vehicles represent one of the most ambitious AI applications. Self-driving cars use computer vision, sensor fusion, and neural networks to navigate complex traffic scenarios. While still in development, this technology promises to reduce accidents, improve traffic efficiency, and provide mobility solutions for people with disabilities.

However, AI development also raises important ethical considerations. Issues such as algorithmic bias, job displacement, privacy concerns, and the need for transparency in AI decision-making processes require careful attention. Establishing proper regulations and ethical guidelines is crucial for ensuring that AI benefits society as a whole.

The future of AI looks promising with continued advancements in quantum computing, neural network architectures, and natural language processing. As AI becomes more integrated into our daily lives, it's essential to balance innovation with responsible development practices.`;
    
    setInput(sampleText);
    setSummary("");
  };

  const stats = {
    words: input.trim() ? input.trim().split(/\s+/).length : 0,
    characters: input.length,
    sentences: input.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
    readingTime: Math.ceil((input.trim().split(/\s+/).length || 0) / 200)
  };

  const sentiment = analyzeSentiment();
  const keywords = getKeywords();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI Content Summarizer</h1>
          <p className="text-gray-600 dark:text-gray-400">Generate intelligent summaries from long-form content</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <i className="fas fa-file-text text-blue-500"></i>
                    Content Input
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadSample} data-testid="load-sample">
                      Sample
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearAll} data-testid="clear-all">
                      Clear
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste or type your content here to generate an AI-powered summary..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[300px] resize-none"
                  data-testid="content-input"
                />
                
                {/* Content Stats */}
                {stats.words > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600">{stats.words}</p>
                      <p className="text-xs text-gray-500">Words</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">{stats.characters}</p>
                      <p className="text-xs text-gray-500">Characters</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-purple-600">{stats.sentences}</p>
                      <p className="text-xs text-gray-500">Sentences</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-orange-600">{stats.readingTime}m</p>
                      <p className="text-xs text-gray-500">Read Time</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-cog text-green-500"></i>
                  Summarization Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Summary Type</Label>
                  <Select value={summaryType} onValueChange={setSummaryType}>
                    <SelectTrigger data-testid="summary-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="extractive">Extractive (Select key sentences)</SelectItem>
                      <SelectItem value="abstractive">Abstractive (Generate new text)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block">
                    Summary Length: {summaryLength[0]} key points
                  </Label>
                  <Slider
                    value={summaryLength}
                    onValueChange={setSummaryLength}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                    data-testid="summary-length"
                  />
                </div>

                <Button
                  onClick={summarizeText}
                  disabled={isProcessing || !input.trim()}
                  className="w-full"
                  data-testid="summarize-button"
                >
                  {isProcessing ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Generating Summary...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-magic mr-2"></i>
                      Generate AI Summary
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <i className="fas fa-file-alt text-purple-500"></i>
                    Generated Summary
                  </span>
                  {summary && (
                    <Button variant="outline" size="sm" onClick={copyOutput} data-testid="copy-summary">
                      <i className="fas fa-copy mr-1"></i>
                      Copy
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summary ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm leading-relaxed" data-testid="summary-output">{summary}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      Summary generated using {summaryType} method with {summaryLength[0]} key points
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <i className="fas fa-robot text-4xl mb-4"></i>
                    <p className="text-lg mb-2">No summary generated yet</p>
                    <p className="text-sm">Add content and click "Generate AI Summary" to begin</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-chart-bar text-yellow-500"></i>
                  Content Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {input.trim() ? (
                  <div className="space-y-4">
                    {/* Sentiment */}
                    {sentiment && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Sentiment:</span>
                          <Badge className={sentiment.color}>{sentiment.sentiment}</Badge>
                        </div>
                      </div>
                    )}

                    {/* Keywords */}
                    {keywords.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Top Keywords:</h4>
                        <div className="flex flex-wrap gap-1">
                          {keywords.slice(0, 8).map(({ word, freq }) => (
                            <Badge key={word} variant="secondary" className="text-xs">
                              {word} ({freq})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                    Add content to see analysis
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-star text-orange-500"></i>
                  AI Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-brain text-blue-500"></i>
                    <span>Intelligent extractive summarization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-lightbulb text-green-500"></i>
                    <span>Abstractive content generation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-heart text-red-500"></i>
                    <span>Sentiment analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-key text-purple-500"></i>
                    <span>Keyword extraction</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-clock text-orange-500"></i>
                    <span>Reading time estimation</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}