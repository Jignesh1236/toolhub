import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Copy, RefreshCw, Heart, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Quote {
  text: string;
  author: string;
  category: string;
}

export default function QuoteGenerator() {
  const { toast } = useToast();
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [favorites, setFavorites] = useState<Quote[]>([]);

  const quotes: Quote[] = [
    // Motivational
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "motivational" },
    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs", category: "motivational" },
    { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs", category: "motivational" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney", category: "motivational" },
    { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller", category: "motivational" },
    
    // Success
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "success" },
    { text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill", category: "success" },
    { text: "The road to success and the road to failure are almost exactly the same.", author: "Colin R. Davis", category: "success" },
    { text: "Success is not the key to happiness. Happiness is the key to success.", author: "Albert Schweitzer", category: "success" },
    { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller", category: "success" },
    
    // Life
    { text: "Life is what happens to you while you're busy making other plans.", author: "John Lennon", category: "life" },
    { text: "The purpose of our lives is to be happy.", author: "Dalai Lama", category: "life" },
    { text: "Life is really simple, but we insist on making it complicated.", author: "Confucius", category: "life" },
    { text: "In the end, we will remember not the words of our enemies, but the silence of our friends.", author: "Martin Luther King Jr.", category: "life" },
    { text: "Life is 10% what happens to you and 90% how you react to it.", author: "Charles R. Swindoll", category: "life" },
    
    // Wisdom
    { text: "The only true wisdom is in knowing you know nothing.", author: "Socrates", category: "wisdom" },
    { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle", category: "wisdom" },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney", category: "wisdom" },
    { text: "Yesterday is history, tomorrow is a mystery, today is a gift of God.", author: "Eleanor Roosevelt", category: "wisdom" },
    { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde", category: "wisdom" },
    
    // Inspirational
    { text: "Be the change that you wish to see in the world.", author: "Mahatma Gandhi", category: "inspirational" },
    { text: "Spread love everywhere you go. Let no one ever come to you without leaving happier.", author: "Mother Teresa", category: "inspirational" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "inspirational" },
    { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle", category: "inspirational" },
    { text: "Whoever is happy will make others happy too.", author: "Anne Frank", category: "inspirational" },
    
    // Technology
    { text: "Technology is best when it brings people together.", author: "Matt Mullenweg", category: "technology" },
    { text: "The advance of technology is based on making it fit in so that you don't really even notice it.", author: "Bill Gates", category: "technology" },
    { text: "Any sufficiently advanced technology is indistinguishable from magic.", author: "Arthur C. Clarke", category: "technology" },
    { text: "The real problem is not whether machines think but whether men do.", author: "B.F. Skinner", category: "technology" },
    { text: "The Internet is becoming the town square for the global village of tomorrow.", author: "Bill Gates", category: "technology" },
  ];

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "motivational", label: "Motivational" },
    { value: "success", label: "Success" },
    { value: "life", label: "Life" },
    { value: "wisdom", label: "Wisdom" },
    { value: "inspirational", label: "Inspirational" },
    { value: "technology", label: "Technology" },
  ];

  const generateQuote = () => {
    const filteredQuotes = selectedCategory === "all" 
      ? quotes 
      : quotes.filter(quote => quote.category === selectedCategory);
    
    if (filteredQuotes.length === 0) {
      toast({
        title: "No quotes found",
        description: "Try selecting a different category",
        variant: "destructive"
      });
      return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const newQuote = filteredQuotes[randomIndex];
    
    // Make sure we don't show the same quote twice in a row
    if (currentQuote && newQuote.text === currentQuote.text && filteredQuotes.length > 1) {
      generateQuote();
      return;
    }
    
    setCurrentQuote(newQuote);
  };

  const copyQuote = () => {
    if (!currentQuote) return;
    
    const quoteToCopy = `"${currentQuote.text}" - ${currentQuote.author}`;
    navigator.clipboard.writeText(quoteToCopy);
    toast({
      title: "Quote copied!",
      description: "Quote has been copied to clipboard"
    });
  };

  const shareQuote = async () => {
    if (!currentQuote) return;
    
    const quoteText = `"${currentQuote.text}" - ${currentQuote.author}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Inspiring Quote',
          text: quoteText,
        });
      } catch (error) {
        copyQuote(); // Fallback to copy
      }
    } else {
      copyQuote(); // Fallback to copy
    }
  };

  const toggleFavorite = () => {
    if (!currentQuote) return;
    
    const isFavorite = favorites.some(fav => fav.text === currentQuote.text);
    
    if (isFavorite) {
      setFavorites(prev => prev.filter(fav => fav.text !== currentQuote.text));
      toast({
        title: "Removed from favorites",
        description: "Quote removed from your favorites"
      });
    } else {
      setFavorites(prev => [...prev, currentQuote]);
      toast({
        title: "Added to favorites",
        description: "Quote saved to your favorites"
      });
    }
  };

  const isFavorite = currentQuote ? favorites.some(fav => fav.text === currentQuote.text) : false;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Quote Generator</h1>
        <p className="text-muted-foreground">
          Generate inspirational and motivational quotes to brighten your day
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quote Display */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Daily Inspiration</CardTitle>
            <CardDescription>
              Get inspired with carefully curated quotes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentQuote ? (
              <div className="text-center space-y-4">
                <div className="space-y-4">
                  <blockquote className="text-xl md:text-2xl font-medium leading-relaxed text-center px-4" data-testid="quote-text">
                    "{currentQuote.text}"
                  </blockquote>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg text-muted-foreground">—</span>
                    <span className="text-lg font-semibold" data-testid="quote-author">
                      {currentQuote.author}
                    </span>
                    <Badge variant="secondary" data-testid="quote-category">
                      {currentQuote.category}
                    </Badge>
                  </div>
                </div>

                <div className="flex justify-center gap-2 flex-wrap">
                  <Button onClick={copyQuote} variant="outline" data-testid="button-copy">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Quote
                  </Button>
                  <Button onClick={shareQuote} variant="outline" data-testid="button-share">
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button 
                    onClick={toggleFavorite} 
                    variant={isFavorite ? "default" : "outline"}
                    data-testid="button-favorite"
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                    {isFavorite ? 'Favorited' : 'Favorite'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <RefreshCw className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Click "Generate Quote" to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Quote</CardTitle>
            <CardDescription>
              Choose a category and generate inspiring quotes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger data-testid="select-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={generateQuote} className="w-full" data-testid="button-generate">
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate Quote
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              {selectedCategory === "all" ? quotes.length : quotes.filter(q => q.category === selectedCategory).length} quotes available
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Favorites */}
      {favorites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Favorite Quotes ({favorites.length})</CardTitle>
            <CardDescription>
              Quotes you've saved for inspiration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favorites.map((quote, index) => (
                <Card key={index} className="p-4">
                  <blockquote className="text-sm mb-2">
                    "{quote.text}"
                  </blockquote>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">— {quote.author}</span>
                    <Badge variant="outline" className="text-xs">
                      {quote.category}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quote Categories Info */}
      <Card>
        <CardHeader>
          <CardTitle>Quote Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {categories.filter(cat => cat.value !== "all").map(category => (
              <div key={category.value} className="text-center p-3 border rounded-lg">
                <h3 className="font-medium">{category.label}</h3>
                <p className="text-muted-foreground">
                  {quotes.filter(q => q.category === category.value).length} quotes
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}