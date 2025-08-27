import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator } from "lucide-react";

export default function PercentageCalculator() {
  // Basic percentage calculation
  const [value1, setValue1] = useState<string>("");
  const [percentage1, setPercentage1] = useState<string>("");
  const [basicResult, setBasicResult] = useState<number | null>(null);

  // Percentage change calculation
  const [oldValue, setOldValue] = useState<string>("");
  const [newValue, setNewValue] = useState<string>("");
  const [changeResult, setChangeResult] = useState<{ change: number; increase: boolean } | null>(null);

  // What percentage calculation
  const [part, setPart] = useState<string>("");
  const [whole, setWhole] = useState<string>("");
  const [whatPercentResult, setWhatPercentResult] = useState<number | null>(null);

  const calculateBasicPercentage = () => {
    const val = parseFloat(value1);
    const perc = parseFloat(percentage1);
    if (!isNaN(val) && !isNaN(perc)) {
      setBasicResult((val * perc) / 100);
    }
  };

  const calculatePercentageChange = () => {
    const oldVal = parseFloat(oldValue);
    const newVal = parseFloat(newValue);
    if (!isNaN(oldVal) && !isNaN(newVal) && oldVal !== 0) {
      const change = ((newVal - oldVal) / oldVal) * 100;
      setChangeResult({
        change: Math.abs(change),
        increase: change >= 0
      });
    }
  };

  const calculateWhatPercentage = () => {
    const partVal = parseFloat(part);
    const wholeVal = parseFloat(whole);
    if (!isNaN(partVal) && !isNaN(wholeVal) && wholeVal !== 0) {
      setWhatPercentResult((partVal / wholeVal) * 100);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Percentage Calculator</h1>
        <p className="text-muted-foreground">
          Calculate percentages, increases, decreases, and more
        </p>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic" data-testid="tab-basic">Basic Percentage</TabsTrigger>
          <TabsTrigger value="change" data-testid="tab-change">Percentage Change</TabsTrigger>
          <TabsTrigger value="what" data-testid="tab-what">What Percentage</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calculate Percentage of a Number</CardTitle>
              <CardDescription>
                Find what X% of Y equals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="percentage">Percentage (%)</Label>
                  <Input
                    id="percentage"
                    type="number"
                    placeholder="e.g., 25"
                    value={percentage1}
                    onChange={(e) => setPercentage1(e.target.value)}
                    data-testid="input-percentage"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">of</Label>
                  <Input
                    id="value"
                    type="number"
                    placeholder="e.g., 200"
                    value={value1}
                    onChange={(e) => setValue1(e.target.value)}
                    data-testid="input-value"
                  />
                </div>
              </div>

              <Button onClick={calculateBasicPercentage} className="w-full" data-testid="button-calculate-basic">
                <Calculator className="w-4 h-4 mr-2" />
                Calculate
              </Button>

              {basicResult !== null && (
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary" data-testid="basic-result">
                    {basicResult.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {percentage1}% of {value1} = {basicResult.toLocaleString()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="change" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calculate Percentage Change</CardTitle>
              <CardDescription>
                Find the percentage increase or decrease
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="old-value">Original Value</Label>
                  <Input
                    id="old-value"
                    type="number"
                    placeholder="e.g., 100"
                    value={oldValue}
                    onChange={(e) => setOldValue(e.target.value)}
                    data-testid="input-old-value"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-value">New Value</Label>
                  <Input
                    id="new-value"
                    type="number"
                    placeholder="e.g., 120"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    data-testid="input-new-value"
                  />
                </div>
              </div>

              <Button onClick={calculatePercentageChange} className="w-full" data-testid="button-calculate-change">
                <Calculator className="w-4 h-4 mr-2" />
                Calculate Change
              </Button>

              {changeResult !== null && (
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <div className={`text-2xl font-bold ${changeResult.increase ? 'text-green-600' : 'text-red-600'}`} data-testid="change-result">
                    {changeResult.increase ? '+' : '-'}{changeResult.change.toFixed(2)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {changeResult.increase ? 'Increase' : 'Decrease'} from {oldValue} to {newValue}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="what" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>What Percentage Is X of Y?</CardTitle>
              <CardDescription>
                Find what percentage one number is of another
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="part">Part</Label>
                  <Input
                    id="part"
                    type="number"
                    placeholder="e.g., 25"
                    value={part}
                    onChange={(e) => setPart(e.target.value)}
                    data-testid="input-part"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whole">Whole</Label>
                  <Input
                    id="whole"
                    type="number"
                    placeholder="e.g., 100"
                    value={whole}
                    onChange={(e) => setWhole(e.target.value)}
                    data-testid="input-whole"
                  />
                </div>
              </div>

              <Button onClick={calculateWhatPercentage} className="w-full" data-testid="button-calculate-what">
                <Calculator className="w-4 h-4 mr-2" />
                Calculate Percentage
              </Button>

              {whatPercentResult !== null && (
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary" data-testid="what-result">
                    {whatPercentResult.toFixed(2)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {part} is {whatPercentResult.toFixed(2)}% of {whole}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}