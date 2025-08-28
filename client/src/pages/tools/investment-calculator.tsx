import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, TrendingUp, DollarSign } from "lucide-react";

export default function InvestmentCalculator() {
  const [principal, setPrincipal] = useState<string>("");
  const [monthlyContribution, setMonthlyContribution] = useState<string>("");
  const [interestRate, setInterestRate] = useState<string>("");
  const [years, setYears] = useState<string>("");
  const [compoundFrequency, setCompoundFrequency] = useState<string>("12");
  const [result, setResult] = useState<{
    futureValue: number;
    totalContributions: number;
    totalInterest: number;
  } | null>(null);

  const calculateInvestment = () => {
    const p = parseFloat(principal) || 0;
    const pmt = parseFloat(monthlyContribution) || 0;
    const r = parseFloat(interestRate) / 100;
    const t = parseFloat(years) || 0;
    const n = parseFloat(compoundFrequency);

    if (t <= 0 || r < 0) return;

    // Future value of initial principal
    const futureValuePrincipal = p * Math.pow(1 + r / n, n * t);
    
    // Future value of monthly contributions (annuity)
    const monthlyRate = r / 12;
    const totalMonths = t * 12;
    const futureValueContributions = pmt > 0 
      ? pmt * (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate
      : 0;

    const futureValue = futureValuePrincipal + futureValueContributions;
    const totalContributions = p + (pmt * totalMonths);
    const totalInterest = futureValue - totalContributions;

    setResult({
      futureValue,
      totalContributions,
      totalInterest,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
          <TrendingUp className="w-8 h-8" />
          Investment Calculator
        </h1>
        <p className="text-lg text-muted-foreground">
          Calculate the future value of your investments with compound interest
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Investment Parameters
            </CardTitle>
            <CardDescription>
              Enter your investment details to calculate future value
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="principal">Initial Investment ($)</Label>
              <Input
                id="principal"
                type="number"
                placeholder="10000"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                data-testid="input-principal"
              />
            </div>

            <div>
              <Label htmlFor="monthly">Monthly Contribution ($)</Label>
              <Input
                id="monthly"
                type="number"
                placeholder="500"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                data-testid="input-monthly-contribution"
              />
            </div>

            <div>
              <Label htmlFor="rate">Annual Interest Rate (%)</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                placeholder="7.5"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                data-testid="input-interest-rate"
              />
            </div>

            <div>
              <Label htmlFor="years">Investment Period (Years)</Label>
              <Input
                id="years"
                type="number"
                placeholder="20"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                data-testid="input-years"
              />
            </div>

            <div>
              <Label htmlFor="compound">Compound Frequency</Label>
              <Select value={compoundFrequency} onValueChange={setCompoundFrequency}>
                <SelectTrigger data-testid="select-compound-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Annually</SelectItem>
                  <SelectItem value="2">Semi-annually</SelectItem>
                  <SelectItem value="4">Quarterly</SelectItem>
                  <SelectItem value="12">Monthly</SelectItem>
                  <SelectItem value="365">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={calculateInvestment} 
              className="w-full"
              data-testid="button-calculate"
            >
              Calculate Investment
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Investment Results
            </CardTitle>
            <CardDescription>
              Your investment projection and breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-6">
                <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400" data-testid="text-future-value">
                    {formatCurrency(result.futureValue)}
                  </div>
                  <div className="text-sm text-muted-foreground">Future Value</div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                    <span className="font-medium">Total Contributions</span>
                    <span className="font-bold" data-testid="text-total-contributions">
                      {formatCurrency(result.totalContributions)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                    <span className="font-medium">Total Interest Earned</span>
                    <span className="font-bold text-green-600 dark:text-green-400" data-testid="text-total-interest">
                      {formatCurrency(result.totalInterest)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                    <span className="font-medium">Return on Investment</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400" data-testid="text-roi">
                      {result.totalContributions > 0 
                        ? ((result.totalInterest / result.totalContributions) * 100).toFixed(2)
                        : "0.00"
                      }%
                    </span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <h3 className="font-semibold mb-2">Investment Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Principal Contribution:</span>
                      <span>{((parseFloat(principal) || 0) / result.futureValue * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Contributions:</span>
                      <span>{(((parseFloat(monthlyContribution) || 0) * parseFloat(years) * 12) / result.futureValue * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Interest Growth:</span>
                      <span>{(result.totalInterest / result.futureValue * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Enter your investment details to see the projection</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Investment Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Compound Interest Power</h4>
              <p className="text-sm text-muted-foreground">
                The earlier you start investing, the more time your money has to grow through compound interest.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Regular Contributions</h4>
              <p className="text-sm text-muted-foreground">
                Consistent monthly contributions can significantly boost your investment returns over time.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Diversification</h4>
              <p className="text-sm text-muted-foreground">
                Consider diversifying your portfolio across different asset classes to manage risk.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Long-term Perspective</h4>
              <p className="text-sm text-muted-foreground">
                Stay invested for the long term to ride out market volatility and maximize returns.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}