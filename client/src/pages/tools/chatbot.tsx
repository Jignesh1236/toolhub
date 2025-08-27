import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Bot, User, RefreshCw, Settings } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface BotPersonality {
  name: string;
  description: string;
  systemPrompt: string;
  icon: string;
}

const botPersonalities: BotPersonality[] = [
  {
    name: "Assistant",
    description: "Helpful general-purpose assistant",
    systemPrompt: "You are a helpful, friendly assistant. Provide clear and concise answers.",
    icon: "🤖"
  },
  {
    name: "Teacher",
    description: "Educational and patient instructor",
    systemPrompt: "You are a patient teacher. Explain concepts clearly and encourage learning.",
    icon: "👨‍🏫"
  },
  {
    name: "Therapist",
    description: "Supportive and empathetic listener",
    systemPrompt: "You are a supportive therapist. Listen actively and provide emotional support.",
    icon: "💚"
  },
  {
    name: "Comedian",
    description: "Funny and entertaining conversationalist",
    systemPrompt: "You are a witty comedian. Make conversations fun with appropriate humor.",
    icon: "😄"
  },
  {
    name: "Expert",
    description: "Technical and detailed specialist",
    systemPrompt: "You are a technical expert. Provide detailed, accurate information.",
    icon: "🎓"
  }
];

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [selectedBot, setSelectedBot] = useState<BotPersonality>(botPersonalities[0]);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Welcome message when bot changes
    if (messages.length === 0 || messages[messages.length - 1].sender === 'user') {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: `Hello! I'm ${selectedBot.name}. ${selectedBot.description}. How can I help you today?`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, welcomeMessage]);
    }
  }, [selectedBot]);

  const generateBotResponse = async (userMessage: string): Promise<string> => {
    // Simulate bot thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Simple response generation based on keywords and bot personality
    const lowerMessage = userMessage.toLowerCase();
    
    if (selectedBot.name === "Teacher") {
      if (lowerMessage.includes('what') || lowerMessage.includes('how') || lowerMessage.includes('why')) {
        return `Great question! Let me explain that step by step. ${generateEducationalResponse(userMessage)}`;
      }
      return `That's an interesting topic to explore. Let's break it down together. ${generateEducationalResponse(userMessage)}`;
    }
    
    if (selectedBot.name === "Therapist") {
      if (lowerMessage.includes('sad') || lowerMessage.includes('angry') || lowerMessage.includes('upset')) {
        return `I hear that you're experiencing some difficult emotions. It's completely normal to feel this way sometimes. Would you like to talk more about what's contributing to these feelings?`;
      }
      return `Thank you for sharing that with me. I'm here to listen and support you. How are you feeling about this situation?`;
    }
    
    if (selectedBot.name === "Comedian") {
      return `${generateFunnyResponse(userMessage)} 😄 But seriously, ${generateHelpfulResponse(userMessage)}`;
    }
    
    if (selectedBot.name === "Expert") {
      return `From a technical perspective, ${generateTechnicalResponse(userMessage)}. Would you like me to elaborate on any specific aspect?`;
    }
    
    // Default Assistant responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! How can I assist you today?";
    }
    
    if (lowerMessage.includes('help')) {
      return "I'm here to help! You can ask me questions, have a conversation, or request assistance with various topics.";
    }
    
    if (lowerMessage.includes('weather')) {
      return "I don't have access to real-time weather data, but I'd recommend checking a weather app or website for current conditions in your area.";
    }
    
    if (lowerMessage.includes('time')) {
      return `The current time is ${new Date().toLocaleTimeString()}.`;
    }
    
    return generateHelpfulResponse(userMessage);
  };

  const generateEducationalResponse = (message: string): string => {
    const responses = [
      "This is a fundamental concept that many people find interesting.",
      "Let me provide some context that might help clarify this topic.",
      "There are several key points to consider when thinking about this.",
      "This connects to broader principles that are worth understanding."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateFunnyResponse = (message: string): string => {
    const responses = [
      "Well, that's one way to look at it!",
      "You know what they say about that...",
      "That reminds me of a joke, but I'll spare you!",
      "Interesting perspective - very original!"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateTechnicalResponse = (message: string): string => {
    const responses = [
      "the key considerations involve several interconnected factors",
      "this requires careful analysis of the underlying principles",
      "the optimal approach would depend on specific requirements and constraints",
      "there are multiple methodologies that could be applied here"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateHelpfulResponse = (message: string): string => {
    const responses = [
      "That's an interesting point. Could you tell me more about what specifically you're looking for?",
      "I understand what you're asking about. Here's how I can help with that.",
      "That's a good question. Let me provide some useful information on that topic.",
      "I see what you mean. Here's my perspective on that matter.",
      "Thanks for asking about that. I'd be happy to discuss this further."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    try {
      const botResponse = await generateBotResponse(inputText);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble responding right now. Please try again.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setIsTyping(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
          <MessageCircle className="w-8 h-8" />
          AI Chatbot
        </h1>
        <p className="text-lg text-muted-foreground">
          Chat with different AI personalities and assistants
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Bot Selection Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Bot Personalities
            </CardTitle>
            <CardDescription>
              Choose your AI assistant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {botPersonalities.map((bot) => (
              <div
                key={bot.name}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedBot.name === bot.name 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
                onClick={() => setSelectedBot(bot)}
                data-testid={`bot-${bot.name.toLowerCase()}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{bot.icon}</span>
                  <span className="font-medium">{bot.name}</span>
                </div>
                <p className="text-sm opacity-90">{bot.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="lg:col-span-3 flex flex-col h-[600px]">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedBot.icon}</span>
                <div>
                  <CardTitle>{selectedBot.name}</CardTitle>
                  <CardDescription>{selectedBot.description}</CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                data-testid="button-clear-chat"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          {/* Messages Area */}
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    data-testid={`message-${message.id}`}
                  >
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                      <div className="flex items-start gap-2">
                        {message.sender === 'bot' && (
                          <span className="text-lg">{selectedBot.icon}</span>
                        )}
                        {message.sender === 'user' && (
                          <User className="w-5 h-5 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm">{message.text}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{selectedBot.icon}</span>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isTyping && sendMessage()}
                  placeholder={`Type a message to ${selectedBot.name}...`}
                  disabled={isTyping}
                  className="flex-1"
                  data-testid="input-message"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputText.trim() || isTyping}
                  data-testid="button-send"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>About AI Chatbot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Different Personalities</h4>
              <p className="text-sm text-muted-foreground">
                Each bot has a unique personality and conversation style. Switch between them to explore different interaction types.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Demo Purpose</h4>
              <p className="text-sm text-muted-foreground">
                This is a demonstration chatbot with simulated responses. Real AI integration would require API keys and external services.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Privacy</h4>
              <p className="text-sm text-muted-foreground">
                All conversations happen locally in your browser. No data is sent to external servers in this demo version.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Features</h4>
              <p className="text-sm text-muted-foreground">
                Try different conversation topics and see how each personality responds differently to the same questions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}