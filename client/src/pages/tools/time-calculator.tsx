
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Plus, Minus, Calculator } from "lucide-react";

interface TimeResult {
  hours: number;
  minutes: number;
  seconds: number;
}

export default function TimeCalculator() {
  // Time arithmetic
  const [time1Hours, setTime1Hours] = useState<string>("");
  const [time1Minutes, setTime1Minutes] = useState<string>("");
  const [time1Seconds, setTime1Seconds] = useState<string>("");
  const [time2Hours, setTime2Hours] = useState<string>("");
  const [time2Minutes, setTime2Minutes] = useState<string>("");
  const [time2Seconds, setTime2Seconds] = useState<string>("");
  const [operation, setOperation] = useState<"add" | "subtract">("add");
  const [arithmeticResult, setArithmeticResult] = useState<TimeResult | null>(null);

  // Time conversion
  const [convertValue, setConvertValue] = useState<string>("");
  const [fromUnit, setFromUnit] = useState<string>("minutes");
  const [toUnit, setToUnit] = useState<string>("hours");
  const [conversionResult, setConversionResult] = useState<number | null>(null);

  // Time difference
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [differenceResult, setDifferenceResult] = useState<{
    hours: number;
    minutes: number;
    totalMinutes: number;
    totalSeconds: number;
  } | null>(null);

  const timeToSeconds = (hours: number, minutes: number, seconds: number): number => {
    return hours * 3600 + minutes * 60 + seconds;
  };

  const secondsToTime = (totalSeconds: number): TimeResult => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { hours, minutes, seconds };
  };

  const calculateTimeArithmetic = () => {
    const h1 = parseInt(time1Hours) || 0;
    const m1 = parseInt(time1Minutes) || 0;
    const s1 = parseInt(time1Seconds) || 0;
    const h2 = parseInt(time2Hours) || 0;
    const m2 = parseInt(time2Minutes) || 0;
    const s2 = parseInt(time2Seconds) || 0;

    const time1InSeconds = timeToSeconds(h1, m1, s1);
    const time2InSeconds = timeToSeconds(h2, m2, s2);

    let resultSeconds: number;
    if (operation === "add") {
      resultSeconds = time1InSeconds + time2InSeconds;
    } else {
      resultSeconds = Math.abs(time1InSeconds - time2InSeconds);
    }

    setArithmeticResult(secondsToTime(resultSeconds));
  };

  const calculateTimeConversion = () => {
    const value = parseFloat(convertValue);
    if (isNaN(value)) return;

    // Convert everything to seconds first
    let valueInSeconds: number;
    switch (fromUnit) {
      case "seconds":
        valueInSeconds = value;
        break;
      case "minutes":
        valueInSeconds = value * 60;
        break;
      case "hours":
        valueInSeconds = value * 3600;
        break;
      case "days":
        valueInSeconds = value * 86400;
        break;
      case "weeks":
        valueInSeconds = value * 604800;
        break;
      default:
        valueInSeconds = value;
    }

    // Convert from seconds to target unit
    let result: number;
    switch (toUnit) {
      case "seconds":
        result = valueInSeconds;
        break;
      case "minutes":
        result = valueInSeconds / 60;
        break;
      case "hours":
        result = valueInSeconds / 3600;
        break;
      case "days":
        result = valueInSeconds / 86400;
        break;
      case "weeks":
        result = valueInSeconds / 604800;
        break;
      default:
        result = valueInSeconds;
    }

    setConversionResult(result);
  };

  const calculateTimeDifference = () => {
    if (!startTime || !endTime) return;

    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);

    let diffMs = end.getTime() - start.getTime();
    
    // Handle next day scenario
    if (diffMs < 0) {
      diffMs += 24 * 60 * 60 * 1000; // Add 24 hours
    }

    const totalMinutes = Math.floor(diffMs / 60000);
    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    setDifferenceResult({
      hours,
      minutes,
      totalMinutes,
      totalSeconds
    });
  };

  const formatTime = (time: TimeResult): string => {
    const h = time.hours.toString().padStart(2, '0');
    const m = time.minutes.toString().padStart(2, '0');
    const s = time.seconds.toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const formatNumber = (num: number): string => {
    return num % 1 === 0 ? num.toString() : num.toFixed(2);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Time Calculator</h1>
        <p className="text-muted-foreground">
          Perform time calculations, conversions, and find time differences
        </p>
      </div>

      <Tabs defaultValue="arithmetic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="arithmetic" data-testid="tab-arithmetic">Add/Subtract</TabsTrigger>
          <TabsTrigger value="conversion" data-testid="tab-conversion">Convert Units</TabsTrigger>
          <TabsTrigger value="difference" data-testid="tab-difference">Time Difference</TabsTrigger>
        </TabsList>

        <TabsContent value="arithmetic" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Time Arithmetic</CardTitle>
                <CardDescription>
                  Add or subtract two time values
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>First Time</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="number"
                      placeholder="Hours"
                      value={time1Hours}
                      onChange={(e) => setTime1Hours(e.target.value)}
                      data-testid="input-time1-hours"
                    />
                    <Input
                      type="number"
                      placeholder="Minutes"
                      value={time1Minutes}
                      onChange={(e) => setTime1Minutes(e.target.value)}
                      data-testid="input-time1-minutes"
                    />
                    <Input
                      type="number"
                      placeholder="Seconds"
                      value={time1Seconds}
                      onChange={(e) => setTime1Seconds(e.target.value)}
                      data-testid="input-time1-seconds"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Operation</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={operation === "add" ? "default" : "outline"}
                      onClick={() => setOperation("add")}
                      className="flex-1"
                      data-testid="button-add"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                    <Button
                      variant={operation === "subtract" ? "default" : "outline"}
                      onClick={() => setOperation("subtract")}
                      className="flex-1"
                      data-testid="button-subtract"
                    >
                      <Minus className="w-4 h-4 mr-2" />
                      Subtract
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Second Time</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="number"
                      placeholder="Hours"
                      value={time2Hours}
                      onChange={(e) => setTime2Hours(e.target.value)}
                      data-testid="input-time2-hours"
                    />
                    <Input
                      type="number"
                      placeholder="Minutes"
                      value={time2Minutes}
                      onChange={(e) => setTime2Minutes(e.target.value)}
                      data-testid="input-time2-minutes"
                    />
                    <Input
                      type="number"
                      placeholder="Seconds"
                      value={time2Seconds}
                      onChange={(e) => setTime2Seconds(e.target.value)}
                      data-testid="input-time2-seconds"
                    />
                  </div>
                </div>

                <Button 
                  onClick={calculateTimeArithmetic} 
                  className="w-full"
                  data-testid="button-calculate-arithmetic"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate
                </Button>
              </CardContent>
            </Card>

            {arithmeticResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Result</CardTitle>
                  <CardDescription>
                    Time calculation result
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="text-3xl font-bold text-primary" data-testid="arithmetic-result">
                      {formatTime(arithmeticResult)}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold">{arithmeticResult.hours}</div>
                        <div className="text-muted-foreground">Hours</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{arithmeticResult.minutes}</div>
                        <div className="text-muted-foreground">Minutes</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{arithmeticResult.seconds}</div>
                        <div className="text-muted-foreground">Seconds</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Time Unit Conversion</CardTitle>
                <CardDescription>
                  Convert between different time units
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="convert-value">Value</Label>
                  <Input
                    id="convert-value"
                    type="number"
                    placeholder="Enter value"
                    value={convertValue}
                    onChange={(e) => setConvertValue(e.target.value)}
                    data-testid="input-convert-value"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>From</Label>
                    <Select value={fromUnit} onValueChange={setFromUnit}>
                      <SelectTrigger data-testid="select-from-unit">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="seconds">Seconds</SelectItem>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="weeks">Weeks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>To</Label>
                    <Select value={toUnit} onValueChange={setToUnit}>
                      <SelectTrigger data-testid="select-to-unit">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="seconds">Seconds</SelectItem>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="weeks">Weeks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={calculateTimeConversion} 
                  className="w-full"
                  data-testid="button-calculate-conversion"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Convert
                </Button>
              </CardContent>
            </Card>

            {conversionResult !== null && (
              <Card>
                <CardHeader>
                  <CardTitle>Conversion Result</CardTitle>
                  <CardDescription>
                    Time unit conversion result
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="text-3xl font-bold text-primary" data-testid="conversion-result">
                      {formatNumber(conversionResult)} {toUnit}
                    </div>
                    <div className="text-muted-foreground">
                      {convertValue} {fromUnit} = {formatNumber(conversionResult)} {toUnit}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="difference" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Time Difference</CardTitle>
                <CardDescription>
                  Calculate the difference between two times
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    data-testid="input-start-time"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-time">End Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    data-testid="input-end-time"
                  />
                </div>

                <Button 
                  onClick={calculateTimeDifference} 
                  className="w-full"
                  data-testid="button-calculate-difference"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Calculate Difference
                </Button>
              </CardContent>
            </Card>

            {differenceResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Time Difference Result</CardTitle>
                  <CardDescription>
                    Duration between the selected times
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary" data-testid="difference-result">
                        {differenceResult.hours}h {differenceResult.minutes}m
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg font-semibold" data-testid="total-minutes">
                          {differenceResult.totalMinutes}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Minutes</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg font-semibold" data-testid="total-seconds">
                          {differenceResult.totalSeconds}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Seconds</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
