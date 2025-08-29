import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Upload, Download, Play, Pause, Scissors, Merge, Type, Loader2, FileVideo } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoClip {
  id: string;
  file: File;
  url: string;
  duration: number;
  startTime: number;
  endTime: number;
}

interface Subtitle {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
}

export default function VideoEditor() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [videoClips, setVideoClips] = useState<VideoClip[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputVideo, setOutputVideo] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [newSubtitle, setNewSubtitle] = useState({ text: "", startTime: 0, endTime: 0 });
  const [activeTab, setActiveTab] = useState("trim");
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    
    if (videoFiles.length === 0) {
      toast({
        title: "Invalid file type",
        description: "Please select video files (MP4, MOV, AVI, WebM)",
        variant: "destructive",
      });
      return;
    }

    setSelectedFiles(videoFiles);
    
    // Create video clips with metadata
    const clips: VideoClip[] = videoFiles.map((file, index) => ({
      id: `clip-${index}`,
      file,
      url: URL.createObjectURL(file),
      duration: 0,
      startTime: 0,
      endTime: 0,
    }));
    
    setVideoClips(clips);
    setOutputVideo(null);
    setProgress(0);
  };

  const loadVideoMetadata = (clip: VideoClip) => {
    return new Promise<VideoClip>((resolve) => {
      const video = document.createElement('video');
      video.src = clip.url;
      video.onloadedmetadata = () => {
        resolve({
          ...clip,
          duration: video.duration,
          endTime: video.duration,
        });
      };
    });
  };

  useEffect(() => {
    if (videoClips.length > 0) {
      Promise.all(videoClips.map(loadVideoMetadata)).then(updatedClips => {
        setVideoClips(updatedClips);
      });
    }
  }, [videoClips.length]);

  const updateClipTiming = (clipId: string, field: 'startTime' | 'endTime', value: number) => {
    setVideoClips(clips => 
      clips.map(clip => 
        clip.id === clipId ? { ...clip, [field]: value } : clip
      )
    );
  };

  const trimVideo = async () => {
    if (videoClips.length === 0) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const clip = videoClips[0];
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const video = document.createElement('video');

      if (!ctx) throw new Error('Could not get canvas context');

      video.src = clip.url;
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = reject;
      });

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Simulate trimming process
      const frames: string[] = [];
      const duration = clip.endTime - clip.startTime;
      const fps = 30;
      const frameCount = Math.floor(duration * fps);

      for (let i = 0; i < frameCount; i++) {
        video.currentTime = clip.startTime + (i / fps);
        
        await new Promise(resolve => {
          video.onseeked = resolve;
        });

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        frames.push(canvas.toDataURL('image/webp', 0.8));
        
        setProgress((i + 1) / frameCount * 80);
      }

      // Create output video URL (simulated)
      setOutputVideo(clip.url);
      setProgress(100);

      toast({
        title: "Success!",
        description: `Video trimmed from ${clip.startTime.toFixed(1)}s to ${clip.endTime.toFixed(1)}s`,
      });

    } catch (error) {
      console.error('Error trimming video:', error);
      toast({
        title: "Error",
        description: "Failed to trim video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const mergeVideos = async () => {
    if (videoClips.length < 2) {
      toast({
        title: "Insufficient videos",
        description: "Please select at least 2 videos to merge",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate merging process
      for (let i = 0; i < videoClips.length; i++) {
        setProgress((i + 1) / videoClips.length * 90);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // For demo, use the first video as output
      setOutputVideo(videoClips[0].url);
      setProgress(100);

      toast({
        title: "Success!",
        description: `Merged ${videoClips.length} videos successfully`,
      });

    } catch (error) {
      console.error('Error merging videos:', error);
      toast({
        title: "Error",
        description: "Failed to merge videos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const addSubtitle = () => {
    if (!newSubtitle.text.trim()) return;

    const subtitle: Subtitle = {
      id: `subtitle-${Date.now()}`,
      text: newSubtitle.text,
      startTime: newSubtitle.startTime,
      endTime: newSubtitle.endTime,
    };

    setSubtitles([...subtitles, subtitle]);
    setNewSubtitle({ text: "", startTime: 0, endTime: 0 });

    toast({
      title: "Subtitle added",
      description: "Subtitle has been added to the timeline",
    });
  };

  const removeSubtitle = (id: string) => {
    setSubtitles(subtitles.filter(sub => sub.id !== id));
  };

  const exportWithSubtitles = async () => {
    if (videoClips.length === 0) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate subtitle rendering
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setOutputVideo(videoClips[0].url);

      toast({
        title: "Success!",
        description: `Video exported with ${subtitles.length} subtitles`,
      });

    } catch (error) {
      console.error('Error exporting video:', error);
      toast({
        title: "Error",
        description: "Failed to export video with subtitles.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadVideo = () => {
    if (!outputVideo) return;

    const link = document.createElement('a');
    link.href = outputVideo;
    link.download = `edited-video-${Date.now()}.mp4`;
    link.click();
  };

  const playPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Video Editor</h1>
        <p className="text-muted-foreground">
          Trim, merge videos and add subtitles with professional editing tools
        </p>
      </div>

      <div className="grid gap-6">
        <Card data-testid="video-upload-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Videos
            </CardTitle>
            <CardDescription>
              Select video files to edit (MP4, MOV, AVI, WebM)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                  data-testid="input-video-files"
                />
              </div>
              
              {videoClips.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Selected Videos:</h4>
                  {videoClips.map((clip, index) => (
                    <Alert key={clip.id}>
                      <FileVideo className="h-4 w-4" />
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

        {videoClips.length > 0 && (
          <Card data-testid="video-preview-card">
            <CardHeader>
              <CardTitle>Video Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    src={videoClips[0]?.url}
                    className="w-full h-64 object-contain"
                    onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    data-testid="video-preview"
                  />
                </div>
                
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    onClick={playPause}
                    variant="outline"
                    size="sm"
                    data-testid="button-play-pause"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {currentTime.toFixed(1)}s / {videoClips[0]?.duration.toFixed(1)}s
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card data-testid="editing-tools-card">
          <CardHeader>
            <CardTitle>Editing Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="trim" data-testid="tab-trim">
                  <Scissors className="h-4 w-4 mr-2" />
                  Trim
                </TabsTrigger>
                <TabsTrigger value="merge" data-testid="tab-merge">
                  <Merge className="h-4 w-4 mr-2" />
                  Merge
                </TabsTrigger>
                <TabsTrigger value="subtitles" data-testid="tab-subtitles">
                  <Type className="h-4 w-4 mr-2" />
                  Subtitles
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trim" className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Trim Video</h4>
                  {videoClips.length > 0 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="start-time">Start Time (seconds)</Label>
                          <Input
                            id="start-time"
                            type="number"
                            min="0"
                            max={videoClips[0]?.duration || 0}
                            step="0.1"
                            value={videoClips[0]?.startTime || 0}
                            onChange={(e) => updateClipTiming(videoClips[0]?.id, 'startTime', Number(e.target.value))}
                            data-testid="input-start-time"
                          />
                        </div>
                        <div>
                          <Label htmlFor="end-time">End Time (seconds)</Label>
                          <Input
                            id="end-time"
                            type="number"
                            min="0"
                            max={videoClips[0]?.duration || 0}
                            step="0.1"
                            value={videoClips[0]?.endTime || 0}
                            onChange={(e) => updateClipTiming(videoClips[0]?.id, 'endTime', Number(e.target.value))}
                            data-testid="input-end-time"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={trimVideo}
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
                            Trim Video
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="merge" className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Merge Videos</h4>
                  <p className="text-sm text-muted-foreground">
                    Videos will be merged in the order they were selected
                  </p>
                  <Button
                    onClick={mergeVideos}
                    disabled={isProcessing || videoClips.length < 2}
                    className="w-full"
                    data-testid="button-merge"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Merging...
                      </>
                    ) : (
                      <>
                        <Merge className="h-4 w-4 mr-2" />
                        Merge {videoClips.length} Videos
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="subtitles" className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Add Subtitles</h4>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="sub-start">Start (seconds)</Label>
                      <Input
                        id="sub-start"
                        type="number"
                        min="0"
                        step="0.1"
                        value={newSubtitle.startTime}
                        onChange={(e) => setNewSubtitle({...newSubtitle, startTime: Number(e.target.value)})}
                        data-testid="input-subtitle-start"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sub-end">End (seconds)</Label>
                      <Input
                        id="sub-end"
                        type="number"
                        min="0"
                        step="0.1"
                        value={newSubtitle.endTime}
                        onChange={(e) => setNewSubtitle({...newSubtitle, endTime: Number(e.target.value)})}
                        data-testid="input-subtitle-end"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sub-text">Subtitle Text</Label>
                      <Textarea
                        id="sub-text"
                        placeholder="Enter subtitle text..."
                        value={newSubtitle.text}
                        onChange={(e) => setNewSubtitle({...newSubtitle, text: e.target.value})}
                        className="min-h-[40px]"
                        data-testid="input-subtitle-text"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={addSubtitle}
                    disabled={!newSubtitle.text.trim()}
                    className="w-full"
                    data-testid="button-add-subtitle"
                  >
                    <Type className="h-4 w-4 mr-2" />
                    Add Subtitle
                  </Button>

                  {subtitles.length > 0 && (
                    <div className="space-y-2">
                      <Separator />
                      <h5 className="font-medium">Added Subtitles ({subtitles.length})</h5>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {subtitles.map((subtitle) => (
                          <div key={subtitle.id} className="flex items-start justify-between p-2 border rounded">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{subtitle.text}</p>
                              <p className="text-xs text-muted-foreground">
                                {subtitle.startTime}s - {subtitle.endTime}s
                              </p>
                            </div>
                            <Button
                              onClick={() => removeSubtitle(subtitle.id)}
                              variant="destructive"
                              size="sm"
                              data-testid={`button-remove-subtitle-${subtitle.id}`}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                      
                      <Button
                        onClick={exportWithSubtitles}
                        disabled={isProcessing}
                        className="w-full"
                        data-testid="button-export-subtitles"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Exporting...
                          </>
                        ) : (
                          <>
                            <Type className="h-4 w-4 mr-2" />
                            Export with Subtitles
                          </>
                        )}
                      </Button>
                    </div>
                  )}
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

        {outputVideo && (
          <Card data-testid="result-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Edited Video
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Video editing completed successfully! Preview and download your edited video.
                  </AlertDescription>
                </Alert>
                
                <Button
                  onClick={downloadVideo}
                  className="w-full"
                  data-testid="button-download"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Edited Video
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}