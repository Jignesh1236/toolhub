import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Download, RefreshCw, Sparkles, Hash, AtSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const platforms = [
  { id: "twitter", name: "Twitter/X", maxChars: 280, hashtags: true, mentions: true },
  { id: "instagram", name: "Instagram", maxChars: 2200, hashtags: true, mentions: true },
  { id: "linkedin", name: "LinkedIn", maxChars: 3000, hashtags: true, mentions: true },
  { id: "facebook", name: "Facebook", maxChars: 63206, hashtags: true, mentions: true },
  { id: "tiktok", name: "TikTok", maxChars: 2200, hashtags: true, mentions: true },
];

const tones = [
  "Professional", "Casual", "Friendly", "Inspiring", "Humorous", 
  "Educational", "Promotional", "Engaging", "Motivational", "Informative"
];

const contentTypes = [
  "Announcement", "Question", "Tip", "Behind the scenes", 
  "Product showcase", "Educational", "Inspirational quote",
  "Industry news", "Personal story", "Call to action"
];

const hashtags = {
  business: ["#business", "#entrepreneur", "#success", "#growth", "#leadership"],
  tech: ["#technology", "#innovation", "#AI", "#digital", "#startup"],
  marketing: ["#marketing", "#socialmedia", "#branding", "#content", "#strategy"],
  lifestyle: ["#lifestyle", "#motivation", "#inspiration", "#wellness", "#mindset"],
  education: ["#education", "#learning", "#knowledge", "#skills", "#development"],
};

export default function SocialMediaGenerator() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("twitter");
  const [tone, setTone] = useState("Professional");
  const [contentType, setContentType] = useState("Announcement");
  const [keywords, setKeywords] = useState("");
  const [customHashtags, setCustomHashtags] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const selectedPlatform = platforms.find(p => p.id === platform);

  const generateContent = async () => {
    if (!topic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic for your post",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate content generation
      await new Promise(resolve => setTimeout(resolve, 1000));

      const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k);
      const hashtagList = customHashtags.split(',').map(h => h.trim().replace('#', '')).filter(h => h);

      let content = "";

      // Generate content based on type and tone
      switch (contentType) {
        case "Question":
          content = `What's your take on ${topic}? `;
          break;
        case "Tip":
          content = `💡 Pro tip about ${topic}: `;
          break;
        case "Behind the scenes":
          content = `Behind the scenes: Working on ${topic} and `;
          break;
        case "Inspirational quote":
          content = `"Success in ${topic} comes from `;
          break;
        case "Educational":
          content = `Did you know? When it comes to ${topic}, `;
          break;
        default:
          content = `Excited to share about ${topic}! `;
      }

      // Add tone-specific content
      switch (tone) {
        case "Professional":
          content += "This represents a significant opportunity for growth and innovation in our industry.";
          break;
        case "Casual":
          content += "just wanted to share this cool thing I've been working on lately!";
          break;
        case "Inspiring":
          content += "remember that every expert was once a beginner. Keep pushing forward!";
          break;
        case "Humorous":
          content += "turns out it's more complicated than I thought... but that's half the fun! 😅";
          break;
        default:
          content += "there's so much to learn and explore in this space.";
      }

      // Add keywords naturally
      if (keywordList.length > 0) {
        content += ` Key areas include: ${keywordList.join(', ')}.`;
      }

      // Add hashtags
      const allHashtags = [...hashtagList];
      
      // Add relevant category hashtags
      if (topic.toLowerCase().includes('business') || topic.toLowerCase().includes('entrepreneur')) {
        allHashtags.push(...hashtags.business.slice(0, 3));
      }
      if (topic.toLowerCase().includes('tech') || topic.toLowerCase().includes('AI')) {
        allHashtags.push(...hashtags.tech.slice(0, 3));
      }
      if (topic.toLowerCase().includes('marketing') || topic.toLowerCase().includes('social')) {
        allHashtags.push(...hashtags.marketing.slice(0, 3));
      }

      // Remove duplicates and limit based on platform
      const uniqueHashtags = Array.from(new Set(allHashtags));
      const maxHashtags = platform === 'twitter' ? 3 : 5;
      const finalHashtags = uniqueHashtags.slice(0, maxHashtags);

      if (finalHashtags.length > 0) {
        content += `\n\n${finalHashtags.map(h => `#${h.replace('#', '')}`).join(' ')}`;
      }

      // Ensure content fits platform limits
      if (selectedPlatform && content.length > selectedPlatform.maxChars) {
        content = content.substring(0, selectedPlatform.maxChars - 3) + "...";
      }

      setGeneratedContent(content);

      toast({
        title: "Success!",
        description: "Social media content generated successfully",
      });

    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedContent) return;

    try {
      await navigator.clipboard.writeText(generatedContent);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadAsText = () => {
    if (!generatedContent) return;

    const blob = new Blob([generatedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `social-media-post-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const addSuggestedHashtag = (hashtag: string) => {
    const current = customHashtags.split(',').map(h => h.trim()).filter(h => h);
    if (!current.includes(hashtag)) {
      setCustomHashtags(current.length > 0 ? `${customHashtags}, ${hashtag}` : hashtag);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Social Media Content Generator</h1>
        <p className="text-muted-foreground">
          Create engaging social media posts optimized for different platforms
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card data-testid="input-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Content Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="topic">Topic/Subject *</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Product launch, Company milestone, Industry trends..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  data-testid="input-topic"
                />
              </div>

              <div>
                <Label htmlFor="platform">Platform</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger data-testid="select-platform">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} (max {p.maxChars} chars)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger data-testid="select-tone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tones.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="contentType">Content Type</Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger data-testid="select-content-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                <Input
                  id="keywords"
                  placeholder="innovation, technology, growth"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  data-testid="input-keywords"
                />
              </div>

              <div>
                <Label htmlFor="hashtags">Custom Hashtags (comma-separated)</Label>
                <Input
                  id="hashtags"
                  placeholder="startup, innovation, tech"
                  value={customHashtags}
                  onChange={(e) => setCustomHashtags(e.target.value)}
                  data-testid="input-hashtags"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Suggested Hashtags</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(hashtags).map(([category, tags]) => 
                    tags.slice(0, 3).map((hashtag) => (
                      <Badge
                        key={hashtag}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => addSuggestedHashtag(hashtag.replace('#', ''))}
                        data-testid={`badge-hashtag-${hashtag.replace('#', '')}`}
                      >
                        <Hash className="h-3 w-3 mr-1" />
                        {hashtag.replace('#', '')}
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              <Button
                onClick={generateContent}
                disabled={isGenerating}
                className="w-full"
                data-testid="button-generate"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card data-testid="output-card">
            <CardHeader>
              <CardTitle>Generated Content</CardTitle>
              <CardDescription>
                {selectedPlatform && (
                  <>Optimized for {selectedPlatform.name} (max {selectedPlatform.maxChars} characters)</>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedContent ? (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-muted min-h-[200px]">
                    <div className="whitespace-pre-wrap text-sm" data-testid="text-generated-content">
                      {generatedContent}
                    </div>
                  </div>

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Characters: {generatedContent.length}</span>
                    {selectedPlatform && (
                      <span className={generatedContent.length > selectedPlatform.maxChars ? "text-destructive" : "text-green-600"}>
                        {generatedContent.length > selectedPlatform.maxChars ? "Too long" : "Within limit"}
                      </span>
                    )}
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      size="sm"
                      data-testid="button-copy"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    
                    <Button
                      onClick={downloadAsText}
                      variant="outline"
                      size="sm"
                      data-testid="button-download"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Enter your topic and settings, then click "Generate Content" to create your social media post</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}