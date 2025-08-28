import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Download } from 'lucide-react';

export default function TextToSpeech() {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('');
  const [rate, setRate] = useState([1]);
  const [pitch, setPitch] = useState([1]);
  const [volume, setVolume] = useState([1]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const { toast } = useToast();

  // Load available voices
  const loadVoices = () => {
    const availableVoices = speechSynthesis.getVoices();
    setVoices(availableVoices);
    if (availableVoices.length > 0 && !voice) {
      setVoice(availableVoices[0].name);
    }
  };

  // Load voices when component mounts and when voices change
  useState(() => {
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  });

  const speakText = () => {
    if (!text.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some text to speak',
        variant: 'destructive',
      });
      return;
    }

    // Stop any current speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Find selected voice
    const selectedVoice = voices.find(v => v.name === voice);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.rate = rate[0];
    utterance.pitch = pitch[0];
    utterance.volume = volume[0];

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => {
      setIsPlaying(false);
      toast({
        title: 'Error',
        description: 'Failed to speak text',
        variant: 'destructive',
      });
    };

    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const downloadTextScript = () => {
    if (!text.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some text to download',
        variant: 'destructive',
      });
      return;
    }

    const scriptContent = `Text-to-Speech Script
Generated on: ${new Date().toLocaleString()}

Voice Settings:
- Voice: ${voice || 'Default'}
- Rate: ${rate[0]}x
- Pitch: ${pitch[0]}x
- Volume: ${Math.round(volume[0] * 100)}%

Text Content:
${text}

Instructions:
This script can be used to reproduce the text-to-speech settings.
Copy the text content and apply the voice settings in any TTS application.
`;

    const blob = new Blob([scriptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tts-script-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Script Downloaded',
      description: 'Text-to-Speech script has been saved',
    });
  };

  const downloadAudioData = () => {
    if (!text.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some text first',
        variant: 'destructive',
      });
      return;
    }

    // Create SSML-like markup for the audio settings
    const ssmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="${voice || 'default'}" rate="${rate[0]}" pitch="${pitch[0]}" volume="${volume[0]}">
    ${text}
  </voice>
</speak>`;

    const blob = new Blob([ssmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tts-audio-config-${Date.now()}.ssml`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Audio Config Downloaded',
      description: 'SSML audio configuration has been saved',
    });
  };

  const pauseSpeaking = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
    } else if (speechSynthesis.paused) {
      speechSynthesis.resume();
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          <i className="fas fa-volume-up mr-3 text-blue-600"></i>
          Text to Speech
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Convert text to natural-sounding speech with customizable voice settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Text Input</CardTitle>
              <CardDescription>Enter the text you want to convert to speech</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="text-input">Text</Label>
                <Textarea
                  id="text-input"
                  placeholder="Enter your text here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={8}
                  className="mt-2"
                  data-testid="text-input"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={speakText}
                  disabled={isPlaying || !text.trim()}
                  className="flex-1"
                  data-testid="speak-button"
                >
                  <i className="fas fa-play mr-2"></i>
                  {isPlaying ? 'Speaking...' : 'Speak'}
                </Button>
                
                <Button
                  onClick={pauseSpeaking}
                  disabled={!speechSynthesis.speaking}
                  variant="outline"
                  data-testid="pause-button"
                >
                  <i className={`fas ${speechSynthesis.paused ? 'fa-play' : 'fa-pause'} mr-2`}></i>
                  {speechSynthesis.paused ? 'Resume' : 'Pause'}
                </Button>
                
                <Button
                  onClick={stopSpeaking}
                  disabled={!isPlaying}
                  variant="outline"
                  data-testid="stop-button"
                >
                  <i className="fas fa-stop mr-2"></i>
                  Stop
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Voice Settings</CardTitle>
              <CardDescription>Customize speech parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="voice-select">Voice</Label>
                <Select value={voice} onValueChange={setVoice}>
                  <SelectTrigger className="mt-2" data-testid="voice-select">
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map((v) => (
                      <SelectItem key={v.name} value={v.name}>
                        {v.name} ({v.lang})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Rate: {rate[0]}</Label>
                <Slider
                  value={rate}
                  onValueChange={setRate}
                  max={2}
                  min={0.1}
                  step={0.1}
                  className="mt-2"
                  data-testid="rate-slider"
                />
              </div>

              <div>
                <Label>Pitch: {pitch[0]}</Label>
                <Slider
                  value={pitch}
                  onValueChange={setPitch}
                  max={2}
                  min={0}
                  step={0.1}
                  className="mt-2"
                  data-testid="pitch-slider"
                />
              </div>

              <div>
                <Label>Volume: {volume[0]}</Label>
                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  max={1}
                  min={0}
                  step={0.1}
                  className="mt-2"
                  data-testid="volume-slider"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Download Options
              </CardTitle>
              <CardDescription>Save your text and voice settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={downloadTextScript}
                disabled={!text.trim()}
                variant="outline"
                className="w-full"
                data-testid="download-script"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Text Script
              </Button>
              <Button
                onClick={downloadAudioData}
                disabled={!text.trim()}
                variant="outline"
                className="w-full"
                data-testid="download-audio-config"
              >
                <Download className="w-4 h-4 mr-2" />
                Download SSML Config
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                'Hello, this is a test of the text to speech feature.',
                'The quick brown fox jumps over the lazy dog.',
                'Welcome to our amazing text to speech tool!',
              ].map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setText(example)}
                  className="text-left justify-start h-auto p-3"
                  data-testid={`example-${index}`}
                >
                  <i className="fas fa-quote-left mr-2 text-gray-400"></i>
                  <span className="text-sm">{example}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}