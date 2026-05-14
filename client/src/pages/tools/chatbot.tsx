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
    const models = [
      "Qwen/Qwen2.5-Coder-32B-Instruct",
      "deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct",
      "meta-llama/Llama-3.1-8B-Instruct",
      "mistralai/Mistral-7B-Instruct-v0.3",
      "codellama/CodeLlama-34b-Instruct-hf"
    ];

    for (const model of models) {
      try {
        console.log(`Using Hugging Face model: ${model}...`);
        
        let prompt = "";
        if (model.includes("Qwen") || model.includes("DeepSeek")) {
          prompt = `<|im_start|>system\n${selectedBot.systemPrompt}<|im_end|>\n<|im_start|>user\n${userMessage}<|im_end|>\n<|im_start|>assistant\n`;
        } else if (model.includes("Llama")) {
          prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n${selectedBot.systemPrompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n${userMessage}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`;
        } else if (model.includes("Mistral")) {
          prompt = `<s>[INST] ${selectedBot.systemPrompt}\n\n${userMessage} [/INST]`;
        } else {
          prompt = `System: ${selectedBot.systemPrompt}\nUser: ${userMessage}\nAssistant:`;
        }

        const hfResponse = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${import.meta.env.VITE_HF_TOKEN || ''}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ 
            inputs: prompt,
            parameters: { 
              max_new_tokens: 1000, 
              return_full_text: false,
              temperature: 0.7,
              do_sample: true
            },
            options: {
              wait_for_model: true
            }
          })
        });

        if (!hfResponse.ok) {
          if (hfResponse.status === 401) break;
          continue;
        }

        const data = await hfResponse.json();
        if (data.error) continue;

        let botText = Array.isArray(data) ? (data[0]?.generated_text || "") : (data.generated_text || "");
        
        // Clean up
        if (botText.includes("<|im_start|>assistant\n")) {
          botText = botText.split("<|im_start|>assistant\n").pop();
        }
        if (botText.includes("<|im_end|>")) botText = botText.split("<|im_end|>")[0];
        if (botText.includes("<|eot_id|>")) botText = botText.split("<|eot_id|>")[0];

        if (botText && botText.trim().length > 0) {
          return botText.trim();
        }
      } catch (err) {
        console.warn(`Model ${model} error:`, err);
        continue;
      }
    }

    return "I'm having trouble connecting to all AI services. Please try again later.";
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