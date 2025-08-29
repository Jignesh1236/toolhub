import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, DollarSign, Receipt } from "lucide-react";

export default function TaxCalculator() {
  const [annualIncome, setAnnualIncome] = useState<string>("");
  const [filingStatus, setFilingStatus] = useState<string>("single");
  const [deductions, setDeductions] = useState<string>("");
  const [result, setResult] = useState<{
    taxableIncome: number;
    federalTax: number;
    effectiveRate: number;
    marginalRate: number;
    afterTaxIncome: number;
  } | null>(null);

  // 2024 US Federal Tax Brackets
  const taxBrackets = {
    single: [
      { min: 0, max: 11000, rate: 0.10 },
      { min: 11000, max: 44725, rate: 0.12 },
      { min: 44725, max: 95375, rate: 0.22 },
      { min: 95375, max: 182050, rate: 0.24 },
      { min: 182050, max: 231250, rate: 0.32 },
      { min: 231250, max: 578125, rate: 0.35 },
      { min: 578125, max: Infinity, rate: 0.37 }
    ],
    marriedJoint: [
      { min: 0, max: 22000, rate: 0.10 },
      { min: 22000, max: 89450, rate: 0.12 },
      { min: 89450, max: 190750, rate: 0.22 },
      { min: 190750, max: 364200, rate: 0.24 },
      { min: 364200, max: 462500, rate: 0.32 },
      { min: 462500, max: 693750, rate: 0.35 },
      { min: 693750, max: Infinity, rate: 0.37 }
    ],
    marriedSeparate: [
      { min: 0, max: 11000, rate: 0.10 },
      { min: 11000, max: 44725, rate: 0.12 },
      { min: 44725, max: 95375, rate: 0.22 },
      { min: 95375, max: 182050, rate: 0.24 },
      { min: 182050, max: 231250, rate: 0.32 },
      { min: 231250, max: 346875, rate: 0.35 },
      { min: 346875, max: Infinity, rate: 0.37 }
    ],
    headOfHousehold: [
      { min: 0, max: 15700, rate: 0.10 },
      { min: 15700, max: 59850, rate: 0.12 },
      { min: 59850, max: 95350, rate: 0.22 },
      { min: 95350, max: 182050, rate: 0.24 },
      { min: 182050, max: 231250, rate: 0.32 },
      { min: 231250, max: 578100, rate: 0.35 },
      { min: 578100, max: Infinity, rate: 0.37 }
    ]
  };

  // Standard deductions for 2024
  const standardDeductions = {
    single: 14600,
    marriedJoint: 29200,
    marriedSeparate: 14600,
    headOfHousehold: 21900
  };

  const calculateTax = () => {
    const income = parseFloat(annualIncome) || 0;
    const userDeductions = parseFloat(deductions) || 0;
    const standardDeduction = standardDeductions[filingStatus as keyof typeof standardDeductions];
    
    if (income <= 0) return;

    const totalDeductions = Math.max(userDeductions, standardDeduction);
    const taxableIncome = Math.max(0, income - totalDeductions);
    
    const brackets = taxBrackets[filingStatus as keyof typeof taxBrackets];
    let federalTax = 0;
    let marginalRate = 0;

    for (const bracket of brackets) {
      if (taxableIncome > bracket.min) {
        const taxableAtBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
        federalTax += taxableAtBracket * bracket.rate;
        marginalRate = bracket.rate;
      }
    }

    const effectiveRate = taxableIncome > 0 ? (federalTax / taxableIncome) * 100 : 0;
    const afterTaxIncome = income - federalTax;

    setResult({
      taxableIncome,
      federalTax,
      effectiveRate,
      marginalRate: marginalRate * 100,
      afterTaxIncome
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
          <Receipt className="w-8 h-8" />
          Tax Calculator
        </h1>
        <p className="text-lg text-muted-foreground">
          Calculate your estimated federal income tax for 2024
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Tax Information
            </CardTitle>
            <CardDescription>
              Enter your income and filing details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="income">Annual Income ($)</Label>
              <Input
                id="income"
                type="number"
                placeholder="75000"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(e.target.value)}
                data-testid="input-annual-income"
              />
            </div>

            <div>
              <Label htmlFor="filing-status">Filing Status</Label>
              <Select value={filingStatus} onValueChange={setFilingStatus}>
                <SelectTrigger data-testid="select-filing-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="marriedJoint">Married Filing Jointly</SelectItem>
                  <SelectItem value="marriedSeparate">Married Filing Separately</SelectItem>
                  <SelectItem value="headOfHousehold">Head of Household</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="deductions">Itemized Deductions ($)</Label>
              <Input
                id="deductions"
                type="number"
                placeholder={`Leave blank to use standard deduction ($${standardDeductions[filingStatus as keyof typeof standardDeductions].toLocaleString()})`}
                value={deductions}
                onChange={(e) => setDeductions(e.target.value)}
                data-testid="input-deductions"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Standard deduction: {formatCurrency(standardDeductions[filingStatus as keyof typeof standardDeductions])}
              </p>
            </div>

            <Button 
              onClick={calculateTax} 
              className="w-full"
              data-testid="button-calculate"
            >
              Calculate Tax
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Tax Calculation Results
            </CardTitle>
            <CardDescription>
              Your estimated federal tax breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-6">
                <div className="text-center p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-lg">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400" data-testid="text-federal-tax">
                    {formatCurrency(result.federalTax)}
                  </div>
                  <div className="text-sm text-muted-foreground">Federal Tax Owed</div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                    <span className="font-medium">Taxable Income</span>
                    <span className="font-bold" data-testid="text-taxable-income">
                      {formatCurrency(result.taxableIncome)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                    <span className="font-medium">After-Tax Income</span>
                    <span className="font-bold text-green-600 dark:text-green-400" data-testid="text-after-tax-income">
                      {formatCurrency(result.afterTaxIncome)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                    <span className="font-medium">Effective Tax Rate</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400" data-testid="text-effective-rate">
                      {result.effectiveRate.toFixed(2)}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                    <span className="font-medium">Marginal Tax Rate</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400" data-testid="text-marginal-rate">
                      {result.marginalRate.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <h3 className="font-semibold mb-2">Tax Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Gross Income:</span>
                      <span>{formatCurrency(parseFloat(annualIncome) || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deductions:</span>
                      <span>-{formatCurrency(Math.max(parseFloat(deductions) || 0, standardDeductions[filingStatus as keyof typeof standardDeductions]))}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Taxable Income:</span>
                      <span>{formatCurrency(result.taxableIncome)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Enter your income details to calculate taxes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Important Tax Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">2024 Tax Year</h4>
              <p className="text-sm text-muted-foreground">
                This calculator uses 2024 federal tax brackets and standard deductions.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Federal Tax Only</h4>
              <p className="text-sm text-muted-foreground">
                This calculation includes only federal income tax. State and local taxes are not included.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Estimated Calculation</h4>
              <p className="text-sm text-muted-foreground">
                This is a simplified estimate. Consult a tax professional for accurate calculations.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Additional Considerations</h4>
              <p className="text-sm text-muted-foreground">
                Does not include FICA taxes, AMT, or tax credits that may apply to your situation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}