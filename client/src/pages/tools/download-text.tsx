import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Type, Clock, ShieldCheck, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function TextDownload() {
  const [location] = useLocation();
  const [textData, setTextData] = useState<{ id: string; title: string; content: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      fetch(`/api/texts/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.id) setTextData(data);
        })
        .catch(err => console.error("Fetch error:", err));
    }
  }, [location]);

  const copyToClipboard = () => {
    if (textData) {
      navigator.clipboard.writeText(textData.content);
      toast({
        title: "✅ Copied",
        description: "Text content copied to clipboard",
      });
    }
  };

  if (!textData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading text share...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto bg-blue-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Type className="h-8 w-8 text-blue-500" />
          </div>
          <CardTitle className="text-2xl">{textData.title}</CardTitle>
          <CardDescription>
            Shared via ToolHub Text Share
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-6 rounded-lg whitespace-pre-wrap font-mono text-sm border">
            {textData.content}
          </div>

          <div className="flex gap-4">
            <Button className="flex-1" onClick={copyToClipboard}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Text
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground border-t pt-4">
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Temporary Share</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="h-3 w-3" />
              <span>Secure Transfer</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
