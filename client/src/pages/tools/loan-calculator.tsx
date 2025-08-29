import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";

interface LoanResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  schedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

export default function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState<string>("");
  const [interestRate, setInterestRate] = useState<string>("");
  const [loanTerm, setLoanTerm] = useState<string>("");
  const [result, setResult] = useState<LoanResult | null>(null);

  const calculateLoan = () => {
    const principal = parseFloat(loanAmount);
    const annualRate = parseFloat(interestRate) / 100;
    const termYears = parseFloat(loanTerm);

    if (!principal || !annualRate || !termYears) return;

    const monthlyRate = annualRate / 12;
    const totalMonths = termYears * 12;

    // Calculate monthly payment using loan formula
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                          (Math.pow(1 + monthlyRate, totalMonths) - 1);

    const totalPayment = monthlyPayment * totalMonths;
    const totalInterest = totalPayment - principal;

    // Generate amortization schedule
    const schedule = [];
    let remainingBalance = principal;

    for (let month = 1; month <= totalMonths; month++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;

      schedule.push({
        month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, remainingBalance)
      });
    }

    setResult({
      monthlyPayment,
      totalPayment,
      totalInterest,
      schedule
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Loan Calculator</h1>
        <p className="text-muted-foreground">
          Calculate loan payments and view amortization schedule
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Loan Details</CardTitle>
            <CardDescription>
              Enter your loan information to calculate payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loan-amount">Loan Amount ($)</Label>
              <Input
                id="loan-amount"
                type="number"
                placeholder="e.g., 250000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                data-testid="input-loan-amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interest-rate">Annual Interest Rate (%)</Label>
              <Input
                id="interest-rate"
                type="number"
                step="0.01"
                placeholder="e.g., 3.5"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                data-testid="input-interest-rate"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loan-term">Loan Term (years)</Label>
              <Input
                id="loan-term"
                type="number"
                placeholder="e.g., 30"
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
                data-testid="input-loan-term"
              />
            </div>

            <Button 
              onClick={calculateLoan} 
              className="w-full"
              data-testid="button-calculate-loan"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calculate Payment
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Loan Summary</CardTitle>
              <CardDescription>
                Your loan payment breakdown
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-primary/5 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-primary" data-testid="monthly-payment">
                    {formatCurrency(result.monthlyPayment)}
                  </div>
                  <div className="text-sm text-muted-foreground">Monthly Payment</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold" data-testid="total-payment">
                      {formatCurrency(result.totalPayment)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Payment</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold" data-testid="total-interest">
                      {formatCurrency(result.totalInterest)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Interest</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">First Few Payments</h4>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {result.schedule.slice(0, 12).map((payment) => (
                    <div key={payment.month} className="flex justify-between text-sm bg-muted/50 p-2 rounded">
                      <span>Month {payment.month}</span>
                      <span>Principal: {formatCurrency(payment.principal)}</span>
                      <span>Interest: {formatCurrency(payment.interest)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}