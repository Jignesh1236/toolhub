import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, File as FileIcon, Clock, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function FileDownload() {
  const [location] = useLocation();
  const [fileData, setFileData] = useState<{ id: string; name: string; publicUrl?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    
    if (id && supabase) {
      supabase
        .from('shared_files')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data, error }) => {
          if (data && !error) {
            setFileData({ 
              id: data.id, 
              name: data.originalName || data.original_name, 
              publicUrl: data.publicUrl || data.public_url 
            });
          }
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [location]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!fileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Invalid Download Link</p>
      </div>
    );
  }

  const handleDownload = () => {
    if (fileData.publicUrl) {
      window.open(fileData.publicUrl, '_blank');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <FileIcon className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Ready to Download</CardTitle>
          <CardDescription>
            Someone shared a file with you through ToolHub
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-medium text-lg break-all">{fileData.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Temporary File</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Secure Transfer</span>
            </div>
          </div>

          <Button 
            className="w-full h-12 text-lg" 
            onClick={handleDownload}
          >
            <Download className="mr-2 h-5 w-5" />
            Download Now
          </Button>

          <p className="text-xs text-muted-foreground">
            Note: This file is hosted on Supabase and will be automatically deleted after the set time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

