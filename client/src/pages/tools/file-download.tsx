import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, File as FileIcon, Clock, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

export default function FileDownload() {
  const [location] = useLocation();
  const [fileData, setFileData] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const name = params.get("name");
    if (id && name) {
      setFileData({ id, name });
    }
  }, [location]);

  if (!fileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Invalid Download Link</p>
      </div>
    );
  }

  const directDownloadUrl = `https://tmpfiles.org/dl/${fileData.id}/${fileData.name}`;

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
            onClick={() => window.location.href = directDownloadUrl}
          >
            <Download className="mr-2 h-5 w-5" />
            Download Now
          </Button>

          <p className="text-xs text-muted-foreground">
            Note: This file is hosted externally and will be automatically deleted after the set time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
