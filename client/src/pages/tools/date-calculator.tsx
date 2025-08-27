import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, Minus } from "lucide-react";

interface DateDifference {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalHours: number;
  totalMinutes: number;
}

export default function DateCalculator() {
  // Date difference calculation
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [dateDifference, setDateDifference] = useState<DateDifference | null>(null);

  // Date addition/subtraction
  const [baseDate, setBaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [operation, setOperation] = useState<"add" | "subtract">("add");
  const [valueToAdd, setValueToAdd] = useState<string>("");
  const [unitToAdd, setUnitToAdd] = useState<string>("days");
  const [resultDate, setResultDate] = useState<string>("");

  const calculateDateDifference = () => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      // Swap dates if start is after end
      const temp = start;
      start.setTime(end.getTime());
      end.setTime(temp.getTime());
    }

    // Calculate exact difference
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    // Calculate totals
    const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;

    setDateDifference({
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalHours,
      totalMinutes
    });
  };

  const calculateDateAddition = () => {
    if (!baseDate || !valueToAdd) return;

    const base = new Date(baseDate);
    const value = parseInt(valueToAdd);

    if (isNaN(value)) return;

    let result = new Date(base);

    if (operation === "add") {
      switch (unitToAdd) {
        case "days":
          result.setDate(result.getDate() + value);
          break;
        case "weeks":
          result.setDate(result.getDate() + (value * 7));
          break;
        case "months":
          result.setMonth(result.getMonth() + value);
          break;
        case "years":
          result.setFullYear(result.getFullYear() + value);
          break;
      }
    } else {
      switch (unitToAdd) {
        case "days":
          result.setDate(result.getDate() - value);
          break;
        case "weeks":
          result.setDate(result.getDate() - (value * 7));
          break;
        case "months":
          result.setMonth(result.getMonth() - value);
          break;
        case "years":
          result.setFullYear(result.getFullYear() - value);
          break;
      }
    }

    setResultDate(result.toISOString().split('T')[0]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Date Calculator</h1>
        <p className="text-muted-foreground">
          Calculate differences between dates and add/subtract time periods
        </p>
      </div>

      <Tabs defaultValue="difference" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="difference" data-testid="tab-difference">Date Difference</TabsTrigger>
          <TabsTrigger value="addition" data-testid="tab-addition">Add/Subtract Time</TabsTrigger>
        </TabsList>

        <TabsContent value="difference" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Calculate Date Difference</CardTitle>
                <CardDescription>
                  Find the difference between two dates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    data-testid="input-start-date"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    data-testid="input-end-date"
                  />
                </div>

                <Button 
                  onClick={calculateDateDifference} 
                  className="w-full"
                  data-testid="button-calculate-difference"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Calculate Difference
                </Button>
              </CardContent>
            </Card>

            {dateDifference && (
              <Card>
                <CardHeader>
                  <CardTitle>Date Difference Result</CardTitle>
                  <CardDescription>
                    Time difference between the selected dates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-primary" data-testid="exact-difference">
                      {dateDifference.years > 0 && `${dateDifference.years} years, `}
                      {dateDifference.months > 0 && `${dateDifference.months} months, `}
                      {dateDifference.days} days
                    </div>
                    <p className="text-muted-foreground">Exact Difference</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-semibold" data-testid="total-days">
                        {dateDifference.totalDays.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Days</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-semibold" data-testid="total-weeks">
                        {dateDifference.totalWeeks.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Weeks</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-semibold" data-testid="total-hours">
                        {dateDifference.totalHours.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Hours</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-semibold" data-testid="total-minutes">
                        {dateDifference.totalMinutes.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Minutes</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="addition" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Add or Subtract Time</CardTitle>
                <CardDescription>
                  Add or subtract time periods from a date
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="base-date">Base Date</Label>
                  <Input
                    id="base-date"
                    type="date"
                    value={baseDate}
                    onChange={(e) => setBaseDate(e.target.value)}
                    data-testid="input-base-date"
                  />
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

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="value">Value</Label>
                    <Input
                      id="value"
                      type="number"
                      placeholder="Enter number"
                      value={valueToAdd}
                      onChange={(e) => setValueToAdd(e.target.value)}
                      data-testid="input-value"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Select value={unitToAdd} onValueChange={setUnitToAdd}>
                      <SelectTrigger data-testid="select-unit">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="weeks">Weeks</SelectItem>
                        <SelectItem value="months">Months</SelectItem>
                        <SelectItem value="years">Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={calculateDateAddition} 
                  className="w-full"
                  data-testid="button-calculate-addition"
                >
                  Calculate Result
                </Button>
              </CardContent>
            </Card>

            {resultDate && (
              <Card>
                <CardHeader>
                  <CardTitle>Calculation Result</CardTitle>
                  <CardDescription>
                    The calculated date result
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Result Date</div>
                      <div className="text-2xl font-bold text-primary" data-testid="result-date">
                        {formatDate(resultDate)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground">Day of Week</div>
                        <div className="font-semibold" data-testid="result-day-of-week">
                          {getDayOfWeek(resultDate)}
                        </div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground">ISO Format</div>
                        <div className="font-mono text-sm" data-testid="result-iso">
                          {resultDate}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {operation === "add" ? "Added" : "Subtracted"} {valueToAdd} {unitToAdd} 
                      {operation === "add" ? " to " : " from "} {formatDate(baseDate)}
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