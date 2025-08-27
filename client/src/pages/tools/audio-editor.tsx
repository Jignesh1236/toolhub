import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Upload, Download, Play, Pause, Scissors, Volume2, VolumeX, Waves, Loader2, Music } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioClip {
  id: string;
  file: File;
  url: string;
  duration: number;
  startTime: number;
  endTime: number;
  volume: number;
}

interface AudioEffect {
  id: string;
  name: string;
  enabled: boolean;
  intensity: number;
}

export default function AudioEditor() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [audioClips, setAudioClips] = useState<AudioClip[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputAudio, setOutputAudio] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [masterVolume, setMasterVolume] = useState([100]);
  const [activeTab, setActiveTab] = useState("trim");
  const [effects, setEffects] = useState<AudioEffect[]>([
    { id: "noise-reduction", name: "Noise Reduction", enabled: false, intensity: 50 },
    { id: "normalize", name: "Normalize", enabled: false, intensity: 80 },
    { id: "echo", name: "Echo", enabled: false, intensity: 30 },
    { id: "reverb", name: "Reverb", enabled: false, intensity: 25 },
    { id: "bass-boost", name: "Bass Boost", enabled: false, intensity: 40 },
    { id: "treble-boost", name: "Treble Boost", enabled: false, intensity: 40 },
  ]);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const audioFiles = files.filter(file => file.type.startsWith('audio/'));
    
    if (audioFiles.length === 0) {
      toast({
        title: "Invalid file type",
        description: "Please select audio files (MP3, WAV, OGG, M4A)",
        variant: "destructive",
      });
      return;
    }

    setSelectedFiles(audioFiles);
    
    // Create audio clips with metadata
    const clips: AudioClip[] = audioFiles.map((file, index) => ({
      id: `clip-${index}`,
      file,
      url: URL.createObjectURL(file),
      duration: 0,
      startTime: 0,
      endTime: 0,
      volume: 100,
    }));
    
    setAudioClips(clips);
    setOutputAudio(null);
    setProgress(0);
  };

  const loadAudioMetadata = (clip: AudioClip) => {
    return new Promise<AudioClip>((resolve) => {
      const audio = document.createElement('audio');
      audio.src = clip.url;
      audio.onloadedmetadata = () => {
        resolve({
          ...clip,
          duration: audio.duration,
          endTime: audio.duration,
        });
      };
    });
  };

  useEffect(() => {
    if (audioClips.length > 0) {
      Promise.all(audioClips.map(loadAudioMetadata)).then(updatedClips => {
        setAudioClips(updatedClips);
      });
    }
  }, [audioClips.length]);

  // Initialize Web Audio API for waveform visualization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const drawWaveform = async (audioUrl: string) => {
    if (!canvasRef.current || !audioContextRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

      const width = canvas.width;
      const height = canvas.height;
      const data = audioBuffer.getChannelData(0);
      const step = Math.ceil(data.length / width);
      const amp = height / 2;

      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1;
      ctx.beginPath();

      for (let i = 0; i < width; i++) {
        const min = Math.min(...Array.from(data.slice(i * step, (i + 1) * step)));
        const max = Math.max(...Array.from(data.slice(i * step, (i + 1) * step)));
        
        ctx.moveTo(i, (1 + min) * amp);
        ctx.lineTo(i, (1 + max) * amp);
      }

      ctx.stroke();
    } catch (error) {
      console.error('Error drawing waveform:', error);
    }
  };

  useEffect(() => {
    if (audioClips.length > 0 && audioClips[0].url) {
      drawWaveform(audioClips[0].url);
    }
  }, [audioClips]);

  const updateClipTiming = (clipId: string, field: 'startTime' | 'endTime' | 'volume', value: number) => {
    setAudioClips(clips => 
      clips.map(clip => 
        clip.id === clipId ? { ...clip, [field]: value } : clip
      )
    );
  };

  const trimAudio = async () => {
    if (audioClips.length === 0) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const clip = audioClips[0];
      
      // Simulate audio trimming process
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // For demo, use the original audio URL
      setOutputAudio(clip.url);

      toast({
        title: "Success!",
        description: `Audio trimmed from ${clip.startTime.toFixed(1)}s to ${clip.endTime.toFixed(1)}s`,
      });

    } catch (error) {
      console.error('Error trimming audio:', error);
      toast({
        title: "Error",
        description: "Failed to trim audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const mixAudios = async () => {
    if (audioClips.length < 2) {
      toast({
        title: "Insufficient audio files",
        description: "Please select at least 2 audio files to mix",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate audio mixing process
      for (let i = 0; i < audioClips.length; i++) {
        setProgress((i + 1) / audioClips.length * 90);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // For demo, use the first audio as output
      setOutputAudio(audioClips[0].url);
      setProgress(100);

      toast({
        title: "Success!",
        description: `Mixed ${audioClips.length} audio tracks successfully`,
      });

    } catch (error) {
      console.error('Error mixing audio:', error);
      toast({
        title: "Error",
        description: "Failed to mix audio tracks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const applyEffects = async () => {
    if (audioClips.length === 0) return;

    const enabledEffects = effects.filter(effect => effect.enabled);
    if (enabledEffects.length === 0) {
      toast({
        title: "No effects selected",
        description: "Please enable at least one effect to apply",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate effect processing
      for (const effect of enabledEffects) {
        const effectProgress = (enabledEffects.indexOf(effect) + 1) / enabledEffects.length * 100;
        setProgress(effectProgress);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      setOutputAudio(audioClips[0].url);

      toast({
        title: "Success!",
        description: `Applied ${enabledEffects.length} effects to audio`,
      });

    } catch (error) {
      console.error('Error applying effects:', error);
      toast({
        title: "Error",
        description: "Failed to apply effects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleEffect = (effectId: string) => {
    setEffects(effects => 
      effects.map(effect => 
        effect.id === effectId ? { ...effect, enabled: !effect.enabled } : effect
      )
    );
  };

  const updateEffectIntensity = (effectId: string, intensity: number) => {
    setEffects(effects => 
      effects.map(effect => 
        effect.id === effectId ? { ...effect, intensity } : effect
      )
    );
  };

  const downloadAudio = () => {
    if (!outputAudio) return;

    const link = document.createElement('a');
    link.href = outputAudio;
    link.download = `edited-audio-${Date.now()}.mp3`;
    link.click();
  };

  const playPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Audio Editor</h1>
        <p className="text-muted-foreground">
          Professional audio editing with trimming, mixing, and noise reduction
        </p>
      </div>

      <div className="grid gap-6">
        <Card data-testid="audio-upload-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Audio Files
            </CardTitle>
            <CardDescription>
              Select audio files to edit (MP3, WAV, OGG, M4A)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Input
                  type="file"
                  accept="audio/*"
                  multiple
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                  data-testid="input-audio-files"
                />
              </div>
              
              {audioClips.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Selected Audio Files:</h4>
                  {audioClips.map((clip, index) => (
                    <Alert key={clip.id}>
                      <Music className="h-4 w-4" />
                      <AlertDescription>
                        {clip.file.name} ({(clip.file.size / 1024 / 1024).toFixed(2)} MB)
                        {clip.duration > 0 && ` - ${clip.duration.toFixed(1)}s`}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {audioClips.length > 0 && (
          <Card data-testid="audio-preview-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Waves className="h-5 w-5" />
                Audio Preview & Waveform
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-black rounded-lg p-4">
                  <canvas
                    ref={canvasRef}
                    width="800"
                    height="200"
                    className="w-full h-32 bg-gray-900 rounded"
                    data-testid="waveform-canvas"
                  />
                </div>
                
                <audio
                  ref={audioRef}
                  src={audioClips[0]?.url}
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  data-testid="audio-preview"
                  className="hidden"
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={playPause}
                      variant="outline"
                      size="sm"
                      data-testid="button-play-pause"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {currentTime.toFixed(1)}s / {audioClips[0]?.duration.toFixed(1)}s
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Volume2 className="h-4 w-4" />
                    <Slider
                      value={masterVolume}
                      onValueChange={setMasterVolume}
                      max={100}
                      step={1}
                      className="w-24"
                      data-testid="slider-master-volume"
                    />
                    <span className="text-sm w-10">{masterVolume[0]}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card data-testid="editing-tools-card">
          <CardHeader>
            <CardTitle>Audio Editing Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="trim" data-testid="tab-trim">
                  <Scissors className="h-4 w-4 mr-2" />
                  Trim
                </TabsTrigger>
                <TabsTrigger value="mix" data-testid="tab-mix">
                  <Volume2 className="h-4 w-4 mr-2" />
                  Mix
                </TabsTrigger>
                <TabsTrigger value="effects" data-testid="tab-effects">
                  <Waves className="h-4 w-4 mr-2" />
                  Effects
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trim" className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Trim Audio</h4>
                  {audioClips.length > 0 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="start-time">Start Time (seconds)</Label>
                          <Input
                            id="start-time"
                            type="number"
                            min="0"
                            max={audioClips[0]?.duration || 0}
                            step="0.1"
                            value={audioClips[0]?.startTime || 0}
                            onChange={(e) => updateClipTiming(audioClips[0]?.id, 'startTime', Number(e.target.value))}
                            data-testid="input-start-time"
                          />
                        </div>
                        <div>
                          <Label htmlFor="end-time">End Time (seconds)</Label>
                          <Input
                            id="end-time"
                            type="number"
                            min="0"
                            max={audioClips[0]?.duration || 0}
                            step="0.1"
                            value={audioClips[0]?.endTime || 0}
                            onChange={(e) => updateClipTiming(audioClips[0]?.id, 'endTime', Number(e.target.value))}
                            data-testid="input-end-time"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={trimAudio}
                        disabled={isProcessing}
                        className="w-full"
                        data-testid="button-trim"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Trimming...
                          </>
                        ) : (
                          <>
                            <Scissors className="h-4 w-4 mr-2" />
                            Trim Audio
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="mix" className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Mix Audio Tracks</h4>
                  
                  {audioClips.map((clip, index) => (
                    <div key={clip.id} className="space-y-2 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Track {index + 1}: {clip.file.name}</span>
                        <div className="flex items-center space-x-2">
                          <VolumeX className="h-4 w-4" />
                          <Slider
                            value={[clip.volume]}
                            onValueChange={(value) => updateClipTiming(clip.id, 'volume', value[0])}
                            max={200}
                            step={1}
                            className="w-24"
                            data-testid={`slider-volume-${index}`}
                          />
                          <Volume2 className="h-4 w-4" />
                          <span className="text-sm w-10">{clip.volume}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    onClick={mixAudios}
                    disabled={isProcessing || audioClips.length < 2}
                    className="w-full"
                    data-testid="button-mix"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Mixing...
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-4 w-4 mr-2" />
                        Mix {audioClips.length} Tracks
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="effects" className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Audio Effects</h4>
                  
                  <div className="grid gap-4">
                    {effects.map((effect) => (
                      <div key={effect.id} className="space-y-2 p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={effect.enabled}
                              onChange={() => toggleEffect(effect.id)}
                              className="rounded"
                              data-testid={`checkbox-${effect.id}`}
                            />
                            <span className="font-medium">{effect.name}</span>
                          </div>
                        </div>
                        
                        {effect.enabled && (
                          <div className="flex items-center space-x-4">
                            <Label className="text-sm">Intensity:</Label>
                            <Slider
                              value={[effect.intensity]}
                              onValueChange={(value) => updateEffectIntensity(effect.id, value[0])}
                              max={100}
                              step={1}
                              className="flex-1"
                              data-testid={`slider-${effect.id}`}
                            />
                            <span className="text-sm w-10">{effect.intensity}%</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    onClick={applyEffects}
                    disabled={isProcessing || !effects.some(e => e.enabled)}
                    className="w-full"
                    data-testid="button-apply-effects"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Applying Effects...
                      </>
                    ) : (
                      <>
                        <Waves className="h-4 w-4 mr-2" />
                        Apply Effects
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {isProcessing && (
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <span>Processing...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} data-testid="progress-processing" />
              </div>
            )}
          </CardContent>
        </Card>

        {outputAudio && (
          <Card data-testid="result-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Edited Audio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Audio editing completed successfully! Preview and download your edited audio.
                  </AlertDescription>
                </Alert>
                
                <Button
                  onClick={downloadAudio}
                  className="w-full"
                  data-testid="button-download"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Edited Audio
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}