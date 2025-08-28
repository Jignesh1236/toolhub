import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";

interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  nextBirthday: {
    date: string;
    daysUntil: number;
  };
}

export default function AgeCalculator() {
  const [birthDate, setBirthDate] = useState<string>("");
  const [targetDate, setTargetDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [result, setResult] = useState<AgeResult | null>(null);

  const calculateAge = () => {
    if (!birthDate) return;

    const birth = new Date(birthDate);
    const target = new Date(targetDate);

    if (birth > target) {
      alert("Birth date cannot be in the future!");
      return;
    }

    // Calculate exact age
    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(target.getFullYear(), target.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    // Calculate totals
    const totalDays = Math.floor((target.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;

    // Calculate next birthday
    const nextBirthday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday <= target) {
      nextBirthday.setFullYear(target.getFullYear() + 1);
    }
    const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

    setResult({
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalMonths,
      nextBirthday: {
        date: nextBirthday.toLocaleDateString(),
        daysUntil: daysUntilBirthday
      }
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Age Calculator</h1>
        <p className="text-muted-foreground">
          Calculate exact age in years, months, and days
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Enter Dates</CardTitle>
            <CardDescription>
              Select your birth date and target date
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="birth-date">Birth Date</Label>
              <Input
                id="birth-date"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                data-testid="input-birth-date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-date">Calculate Age On</Label>
              <Input
                id="target-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                data-testid="input-target-date"
              />
            </div>

            <Button 
              onClick={calculateAge} 
              className="w-full"
              data-testid="button-calculate-age"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Calculate Age
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Age Result</CardTitle>
              <CardDescription>
                Your exact age calculation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-primary" data-testid="exact-age">
                  {result.years} years, {result.months} months, {result.days} days
                </div>
                <p className="text-muted-foreground">Exact Age</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-semibold" data-testid="total-days">
                    {result.totalDays.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Days</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-semibold" data-testid="total-weeks">
                    {result.totalWeeks.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Weeks</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-semibold" data-testid="total-months">
                    {result.totalMonths}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Months</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-semibold" data-testid="total-years">
                    {result.years}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Years</div>
                </div>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Next Birthday</h4>
                <p className="text-lg" data-testid="next-birthday">
                  {result.nextBirthday.date}
                </p>
                <p className="text-sm text-muted-foreground" data-testid="days-until-birthday">
                  {result.nextBirthday.daysUntil} days to go
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}