import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Frown, Meh, Smile, TrendingUp, BarChart3, MessageSquare, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SentimentResult {
  overall: 'positive' | 'negative' | 'neutral';
  scores: {
    positive: number;
    negative: number;
    neutral: number;
  };
  confidence: number;
  emotions: {
    joy: number;
    anger: number;
    sadness: number;
    fear: number;
    surprise: number;
    disgust: number;
  };
  keywords: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
}

interface TextStats {
  wordCount: number;
  sentenceCount: number;
  averageWordsPerSentence: number;
  readabilityScore: number;
}

export default function SentimentAnalyzer() {
  const [inputText, setInputText] = useState<string>("");
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [stats, setStats] = useState<TextStats | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const { toast } = useToast();

  // Sentiment dictionaries for basic analysis
  const positiveWords = new Set([
    'amazing', 'awesome', 'excellent', 'fantastic', 'great', 'good', 'wonderful', 'beautiful',
    'love', 'like', 'enjoy', 'happy', 'pleased', 'satisfied', 'delighted', 'thrilled',
    'brilliant', 'outstanding', 'superb', 'magnificent', 'perfect', 'best', 'better',
    'successful', 'win', 'victory', 'achieve', 'accomplish', 'improve', 'benefit',
    'helpful', 'useful', 'valuable', 'important', 'significant', 'meaningful', 'worthy',
    'comfortable', 'easy', 'simple', 'smooth', 'efficient', 'effective', 'reliable',
    'trust', 'confidence', 'hope', 'optimistic', 'positive', 'bright', 'clear'
  ]);

  const negativeWords = new Set([
    'awful', 'terrible', 'horrible', 'bad', 'worst', 'hate', 'dislike', 'angry', 'mad',
    'sad', 'depressed', 'upset', 'frustrated', 'annoyed', 'disappointed', 'disgusted',
    'fail', 'failure', 'lose', 'loss', 'defeat', 'wrong', 'mistake', 'error', 'problem',
    'difficult', 'hard', 'impossible', 'complicated', 'confusing', 'unclear', 'poor',
    'weak', 'broken', 'damaged', 'hurt', 'pain', 'suffer', 'worry', 'fear', 'scared',
    'doubt', 'uncertain', 'negative', 'dark', 'gloomy', 'pessimistic', 'hopeless'
  ]);

  const emotionWords = {
    joy: ['happy', 'joyful', 'cheerful', 'excited', 'thrilled', 'delighted', 'pleased', 'glad'],
    anger: ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'frustrated', 'outraged', 'livid'],
    sadness: ['sad', 'depressed', 'melancholy', 'miserable', 'gloomy', 'sorrowful', 'dejected'],
    fear: ['afraid', 'scared', 'terrified', 'anxious', 'worried', 'nervous', 'frightened'],
    surprise: ['surprised', 'amazed', 'astonished', 'shocked', 'stunned', 'bewildered'],
    disgust: ['disgusted', 'revolted', 'repulsed', 'sickened', 'appalled', 'nauseated']
  };

  const analyzeSentiment = () => {
    if (!inputText.trim()) {
      toast({
        title: "No text provided",
        description: "Please enter some text to analyze.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    setTimeout(() => {
      try {
        const text = inputText.toLowerCase();
        const words = text.split(/\W+/).filter(word => word.length > 0);
        const sentences = inputText.split(/[.!?]+/).filter(s => s.trim().length > 0);

        // Calculate sentiment scores
        let positiveCount = 0;
        let negativeCount = 0;
        const foundPositive: string[] = [];
        const foundNegative: string[] = [];

        words.forEach(word => {
          if (positiveWords.has(word)) {
            positiveCount++;
            if (!foundPositive.includes(word)) foundPositive.push(word);
          }
          if (negativeWords.has(word)) {
            negativeCount++;
            if (!foundNegative.includes(word)) foundNegative.push(word);
          }
        });

        const totalSentimentWords = positiveCount + negativeCount;
        const positiveScore = totalSentimentWords > 0 ? (positiveCount / totalSentimentWords) * 100 : 33;
        const negativeScore = totalSentimentWords > 0 ? (negativeCount / totalSentimentWords) * 100 : 33;
        const neutralScore = 100 - positiveScore - negativeScore;

        // Determine overall sentiment
        let overall: 'positive' | 'negative' | 'neutral' = 'neutral';
        if (positiveScore > negativeScore && positiveScore > 40) overall = 'positive';
        else if (negativeScore > positiveScore && negativeScore > 40) overall = 'negative';

        // Calculate confidence
        const maxScore = Math.max(positiveScore, negativeScore, neutralScore);
        const confidence = Math.round(maxScore);

        // Analyze emotions
        const emotions = {
          joy: 0,
          anger: 0,
          sadness: 0,
          fear: 0,
          surprise: 0,
          disgust: 0
        };

        Object.entries(emotionWords).forEach(([emotion, emotionWordList]) => {
          const count = words.filter(word => emotionWordList.includes(word)).length;
          emotions[emotion as keyof typeof emotions] = Math.round((count / words.length) * 1000);
        });

        // Calculate text statistics
        const wordCount = words.length;
        const sentenceCount = sentences.length;
        const averageWordsPerSentence = sentenceCount > 0 ? Math.round((wordCount / sentenceCount) * 10) / 10 : 0;
        
        // Simple readability score (approximation)
        const avgSentenceLength = averageWordsPerSentence;
        const readabilityScore = Math.max(0, Math.min(100, 100 - (avgSentenceLength - 15) * 2));

        const sentimentResult: SentimentResult = {
          overall,
          scores: {
            positive: Math.round(positiveScore),
            negative: Math.round(negativeScore),
            neutral: Math.round(neutralScore)
          },
          confidence,
          emotions,
          keywords: {
            positive: foundPositive.slice(0, 10),
            negative: foundNegative.slice(0, 10),
            neutral: words.filter(w => !positiveWords.has(w) && !negativeWords.has(w) && w.length > 4).slice(0, 10)
          }
        };

        const textStats: TextStats = {
          wordCount,
          sentenceCount,
          averageWordsPerSentence,
          readabilityScore: Math.round(readabilityScore)
        };

        setResult(sentimentResult);
        setStats(textStats);

        toast({
          title: "Analysis complete",
          description: `Sentiment: ${overall} (${confidence}% confidence)`
        });

      } catch (error) {
        console.error('Sentiment analysis failed:', error);
        toast({
          title: "Analysis failed",
          description: "An error occurred during sentiment analysis.",
          variant: "destructive"
        });
      } finally {
        setIsAnalyzing(false);
      }
    }, 1500);
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Smile className="w-6 h-6 text-green-600 dark:text-green-400" />;
      case 'negative':
        return <Frown className="w-6 h-6 text-red-600 dark:text-red-400" />;
      default:
        return <Meh className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case 'negative':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    }
  };

  const copyResults = () => {
    if (!result) return;
    
    const summary = `Sentiment Analysis Results:
Overall: ${result.overall} (${result.confidence}% confidence)
Positive: ${result.scores.positive}%
Negative: ${result.scores.negative}%
Neutral: ${result.scores.neutral}%

Top Emotions:
${Object.entries(result.emotions)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 3)
  .map(([emotion, score]) => `${emotion}: ${score/10}%`)
  .join('\n')}`;

    navigator.clipboard.writeText(summary).then(() => {
      toast({
        title: "Results copied",
        description: "Analysis results have been copied to clipboard."
      });
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
          <Heart className="w-8 h-8" />
          Sentiment Analyzer
        </h1>
        <p className="text-lg text-muted-foreground">
          Analyze the emotional tone and sentiment of your text content
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Text Analysis
            </CardTitle>
            <CardDescription>
              Enter the text you want to analyze for sentiment and emotions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="text-input">Text Content</Label>
              <Textarea
                id="text-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter your text here... This could be a review, social media post, email, article, or any text you want to analyze for sentiment and emotional tone."
                rows={12}
                className="resize-none"
                data-testid="textarea-input"
              />
              <p className="text-sm text-muted-foreground mt-1">
                {inputText.length} characters, {inputText.split(/\s+/).filter(w => w.length > 0).length} words
              </p>
            </div>

            <Button
              onClick={analyzeSentiment}
              disabled={!inputText.trim() || isAnalyzing}
              className="w-full"
              data-testid="button-analyze"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Analyzing Sentiment...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  Analyze Sentiment
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Text Statistics
            </CardTitle>
            <CardDescription>
              Basic text analysis metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400" data-testid="stat-words">
                      {stats.wordCount}
                    </div>
                    <div className="text-xs text-muted-foreground">Words</div>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400" data-testid="stat-sentences">
                      {stats.sentenceCount}
                    </div>
                    <div className="text-xs text-muted-foreground">Sentences</div>
                  </div>
                  
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400" data-testid="stat-avg-words">
                      {stats.averageWordsPerSentence}
                    </div>
                    <div className="text-xs text-muted-foreground">Avg/Sentence</div>
                  </div>
                  
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <div className="text-lg font-bold text-orange-600 dark:text-orange-400" data-testid="stat-readability">
                      {stats.readabilityScore}
                    </div>
                    <div className="text-xs text-muted-foreground">Readability</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No analysis yet</p>
                <p className="text-sm">Analyze text to see statistics</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      {result && (
        <>
          {/* Overall Sentiment */}
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sentiment Analysis Results</CardTitle>
                  <CardDescription>
                    Overall emotional tone and confidence level
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyResults}
                  data-testid="button-copy-results"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy Results
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {getSentimentIcon(result.overall)}
                    <div>
                      <div className="font-semibold text-lg" data-testid="result-overall">
                        {result.overall.charAt(0).toUpperCase() + result.overall.slice(1)}
                      </div>
                      <Badge className={getSentimentColor(result.overall)} data-testid="result-confidence">
                        {result.confidence}% Confidence
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Positive</span>
                        <span data-testid="score-positive">{result.scores.positive}%</span>
                      </div>
                      <Progress value={result.scores.positive} className="h-2 bg-gray-200">
                        <div 
                          className="h-full bg-green-500 rounded-full transition-all"
                          style={{ width: `${result.scores.positive}%` }}
                        />
                      </Progress>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Negative</span>
                        <span data-testid="score-negative">{result.scores.negative}%</span>
                      </div>
                      <Progress value={result.scores.negative} className="h-2 bg-gray-200">
                        <div 
                          className="h-full bg-red-500 rounded-full transition-all"
                          style={{ width: `${result.scores.negative}%` }}
                        />
                      </Progress>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Neutral</span>
                        <span data-testid="score-neutral">{result.scores.neutral}%</span>
                      </div>
                      <Progress value={result.scores.neutral} className="h-2 bg-gray-200">
                        <div 
                          className="h-full bg-yellow-500 rounded-full transition-all"
                          style={{ width: `${result.scores.neutral}%` }}
                        />
                      </Progress>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Emotion Analysis</h4>
                  <div className="space-y-2">
                    {Object.entries(result.emotions)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 6)
                      .map(([emotion, score], index) => (
                        <div key={`${emotion}-${index}`} className="flex justify-between items-center">
                          <span className="capitalize">{emotion}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="h-full bg-blue-500 rounded-full transition-all"
                                style={{ width: `${Math.min(100, score)}%` }}
                              />
                            </div>
                            <span className="text-sm w-8" data-testid={`emotion-${emotion}`}>
                              {Math.round(score / 10)}%
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Keywords */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Sentiment Keywords</CardTitle>
              <CardDescription>
                Key words that influenced the sentiment analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-green-600 dark:text-green-400 mb-3">Positive Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.positive.map((keyword, index) => (
                      <Badge 
                        key={keyword} 
                        variant="secondary" 
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        data-testid={`positive-keyword-${index}`}
                      >
                        {keyword}
                      </Badge>
                    ))}
                    {result.keywords.positive.length === 0 && (
                      <span className="text-sm text-muted-foreground">No positive keywords found</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-red-600 dark:text-red-400 mb-3">Negative Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.negative.map((keyword, index) => (
                      <Badge 
                        key={keyword} 
                        variant="secondary" 
                        className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        data-testid={`negative-keyword-${index}`}
                      >
                        {keyword}
                      </Badge>
                    ))}
                    {result.keywords.negative.length === 0 && (
                      <span className="text-sm text-muted-foreground">No negative keywords found</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-3">Neutral Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.neutral.slice(0, 8).map((keyword, index) => (
                      <Badge 
                        key={keyword} 
                        variant="secondary"
                        data-testid={`neutral-keyword-${index}`}
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Understanding Sentiment Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Sentiment Scoring</h4>
              <p className="text-sm text-muted-foreground">
                Text is analyzed for positive, negative, and neutral sentiment based on word patterns and linguistic indicators.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Emotion Detection</h4>
              <p className="text-sm text-muted-foreground">
                Advanced analysis identifies specific emotions like joy, anger, sadness, fear, surprise, and disgust.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Confidence Levels</h4>
              <p className="text-sm text-muted-foreground">
                The confidence score indicates how certain the analysis is about the detected sentiment.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Use Cases</h4>
              <p className="text-sm text-muted-foreground">
                Perfect for analyzing customer feedback, social media posts, reviews, emails, and other text content.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}