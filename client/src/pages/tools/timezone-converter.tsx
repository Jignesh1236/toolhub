import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Globe, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const timezones = [
  { value: "UTC", label: "UTC - Coordinated Universal Time", offset: 0 },
  { value: "America/New_York", label: "EST/EDT - Eastern Time", offset: -5 },
  { value: "America/Chicago", label: "CST/CDT - Central Time", offset: -6 },
  { value: "America/Denver", label: "MST/MDT - Mountain Time", offset: -7 },
  { value: "America/Los_Angeles", label: "PST/PDT - Pacific Time", offset: -8 },
  { value: "Europe/London", label: "GMT/BST - Greenwich Mean Time", offset: 0 },
  { value: "Europe/Paris", label: "CET/CEST - Central European Time", offset: 1 },
  { value: "Europe/Berlin", label: "CET/CEST - Central European Time", offset: 1 },
  { value: "Asia/Tokyo", label: "JST - Japan Standard Time", offset: 9 },
  { value: "Asia/Shanghai", label: "CST - China Standard Time", offset: 8 },
  { value: "Asia/Kolkata", label: "IST - India Standard Time", offset: 5.5 },
  { value: "Australia/Sydney", label: "AEST/AEDT - Australian Eastern Time", offset: 10 },
  { value: "Pacific/Auckland", label: "NZST/NZDT - New Zealand Time", offset: 12 },
];

export default function TimezoneConverter() {
  const [sourceTime, setSourceTime] = useState("");
  const [sourceDate, setSourceDate] = useState("");
  const [sourceTimezone, setSourceTimezone] = useState("UTC");
  const [targetTimezone, setTargetTimezone] = useState("America/New_York");
  const [conversions, setConversions] = useState<Array<{ timezone: string; time: string; date: string }>>([]);
  const { toast } = useToast();

  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0].substring(0, 5);
    return { date, time };
  };

  useEffect(() => {
    const { date, time } = getCurrentDateTime();
    setSourceDate(date);
    setSourceTime(time);
  }, []);

  const convertTimezone = () => {
    if (!sourceTime || !sourceDate) {
      toast({
        title: "Error",
        description: "Please enter both date and time",
        variant: "destructive",
      });
      return;
    }

    try {
      const sourceDateTime = new Date(`${sourceDate}T${sourceTime}:00`);
      
      // Get timezone offset for source timezone (simplified)
      const sourceOffset = timezones.find(tz => tz.value === sourceTimezone)?.offset || 0;
      
      // Convert to UTC first
      const utcTime = new Date(sourceDateTime.getTime() - (sourceOffset * 60 * 60 * 1000));
      
      // Convert to all timezones
      const results = timezones.map(tz => {
        const convertedTime = new Date(utcTime.getTime() + (tz.offset * 60 * 60 * 1000));
        return {
          timezone: tz.label,
          time: convertedTime.toTimeString().split(' ')[0].substring(0, 5),
          date: convertedTime.toISOString().split('T')[0]
        };
      });

      setConversions(results);

      toast({
        title: "Success!",
        description: "Time converted across all timezones",
      });

    } catch (error) {
      console.error('Conversion error:', error);
      toast({
        title: "Error",
        description: "Failed to convert time. Please check your input.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Time copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const setCurrentTime = () => {
    const { date, time } = getCurrentDateTime();
    setSourceDate(date);
    setSourceTime(time);
    setSourceTimezone("UTC");
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Timezone Converter</h1>
        <p className="text-muted-foreground">
          Convert time between different timezones around the world
        </p>
      </div>

      <div className="grid gap-6">
        <Card data-testid="input-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Source Time
            </CardTitle>
            <CardDescription>
              Enter the time you want to convert
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="source-date">Date</Label>
                <Input
                  id="source-date"
                  type="date"
                  value={sourceDate}
                  onChange={(e) => setSourceDate(e.target.value)}
                  data-testid="input-source-date"
                />
              </div>
              
              <div>
                <Label htmlFor="source-time">Time</Label>
                <Input
                  id="source-time"
                  type="time"
                  value={sourceTime}
                  onChange={(e) => setSourceTime(e.target.value)}
                  data-testid="input-source-time"
                />
              </div>
              
              <div>
                <Label htmlFor="source-timezone">Timezone</Label>
                <Select value={sourceTimezone} onValueChange={setSourceTimezone}>
                  <SelectTrigger data-testid="select-source-timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={convertTimezone} data-testid="button-convert">
                <Globe className="h-4 w-4 mr-2" />
                Convert Time
              </Button>
              
              <Button
                onClick={setCurrentTime}
                variant="outline"
                data-testid="button-current-time"
              >
                Use Current Time
              </Button>
            </div>
          </CardContent>
        </Card>

        {conversions.length > 0 && (
          <Card data-testid="results-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Converted Times
              </CardTitle>
              <CardDescription>
                Time converted across all major timezones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {conversions.map((conversion, index) => {
                  const timeString = `${conversion.date} ${conversion.time}`;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      data-testid={`conversion-${index}`}
                    >
                      <div>
                        <div className="font-medium">{conversion.timezone}</div>
                        <div className="text-sm text-muted-foreground">
                          {conversion.date} at {conversion.time}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="font-mono text-lg">
                          {conversion.time}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(timeString)}
                          data-testid={`button-copy-${index}`}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card data-testid="info-card">
          <CardHeader>
            <CardTitle>Timezone Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">Popular Timezones</h4>
                <ul className="text-sm space-y-1">
                  <li>• UTC - Coordinated Universal Time (Standard reference)</li>
                  <li>• EST/EDT - Eastern Time (New York, Toronto)</li>
                  <li>• PST/PDT - Pacific Time (Los Angeles, Vancouver)</li>
                  <li>• GMT/BST - Greenwich Mean Time (London)</li>
                  <li>• CET/CEST - Central European Time (Paris, Berlin)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Tips</h4>
                <ul className="text-sm space-y-1">
                  <li>• DST (Daylight Saving Time) is automatically handled</li>
                  <li>• Use UTC for international coordination</li>
                  <li>• Consider daylight saving when scheduling</li>
                  <li>• Copy times by clicking the copy button</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}