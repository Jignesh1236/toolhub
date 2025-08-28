import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calculator, Users } from "lucide-react";

export default function TipCalculator() {
  const [billAmount, setBillAmount] = useState<string>("");
  const [tipPercentage, setTipPercentage] = useState([18]);
  const [numberOfPeople, setNumberOfPeople] = useState<string>("1");

  const calculateTip = () => {
    const bill = parseFloat(billAmount);
    const people = parseInt(numberOfPeople);
    const tip = tipPercentage[0];

    if (!bill || !people) return null;

    const tipAmount = (bill * tip) / 100;
    const totalAmount = bill + tipAmount;
    const perPerson = totalAmount / people;
    const tipPerPerson = tipAmount / people;

    return {
      tipAmount,
      totalAmount,
      perPerson,
      tipPerPerson
    };
  };

  const result = calculateTip();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const presetTips = [10, 15, 18, 20, 25];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Tip Calculator</h1>
        <p className="text-muted-foreground">
          Calculate tips and split bills among friends
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Bill Details</CardTitle>
            <CardDescription>
              Enter your bill amount and party size
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bill-amount">Bill Amount ($)</Label>
              <Input
                id="bill-amount"
                type="number"
                step="0.01"
                placeholder="e.g., 85.50"
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
                data-testid="input-bill-amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="people">Number of People</Label>
              <Input
                id="people"
                type="number"
                min="1"
                placeholder="1"
                value={numberOfPeople}
                onChange={(e) => setNumberOfPeople(e.target.value)}
                data-testid="input-number-of-people"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Tip Percentage</Label>
                <span className="text-lg font-semibold" data-testid="tip-percentage">
                  {tipPercentage[0]}%
                </span>
              </div>
              
              <Slider
                value={tipPercentage}
                onValueChange={setTipPercentage}
                max={30}
                min={0}
                step={1}
                className="w-full"
                data-testid="slider-tip-percentage"
              />

              <div className="flex gap-2 flex-wrap">
                {presetTips.map((percent) => (
                  <Button
                    key={percent}
                    variant={tipPercentage[0] === percent ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTipPercentage([percent])}
                    data-testid={`preset-tip-${percent}`}
                  >
                    {percent}%
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Calculator className="w-5 h-5 inline mr-2" />
              Calculation
            </CardTitle>
            <CardDescription>
              Your tip and bill breakdown
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {result && billAmount && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-semibold" data-testid="tip-amount">
                      {formatCurrency(result.tipAmount)}
                    </div>
                    <div className="text-sm text-muted-foreground">Tip Amount</div>
                  </div>
                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <div className="text-lg font-semibold text-primary" data-testid="total-amount">
                      {formatCurrency(result.totalAmount)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Amount</div>
                  </div>
                </div>

                {parseInt(numberOfPeople) > 1 && (
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4" />
                      <span className="font-semibold">Split Among {numberOfPeople} People</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg font-semibold" data-testid="tip-per-person">
                          {formatCurrency(result.tipPerPerson)}
                        </div>
                        <div className="text-sm text-muted-foreground">Tip per Person</div>
                      </div>
                      <div className="text-center p-3 bg-primary/5 rounded-lg">
                        <div className="text-lg font-semibold text-primary" data-testid="total-per-person">
                          {formatCurrency(result.perPerson)}
                        </div>
                        <div className="text-sm text-muted-foreground">Total per Person</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-center pt-4 border-t space-y-1">
                  <div className="text-sm text-muted-foreground">Bill Breakdown</div>
                  <div className="text-sm">
                    Bill: {formatCurrency(parseFloat(billAmount))} + 
                    Tip ({tipPercentage[0]}%): {formatCurrency(result.tipAmount)} = 
                    Total: {formatCurrency(result.totalAmount)}
                  </div>
                </div>
              </>
            )}

            {!billAmount && (
              <div className="text-center py-8 text-muted-foreground">
                Enter a bill amount to see the calculation
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}