import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calculator, DollarSign, PiggyBank, AlertTriangle } from "lucide-react";

interface BudgetCategory {
  name: string;
  budgeted: number;
  spent: number;
  icon: string;
  color: string;
}

export default function BudgetCalculator() {
  const [monthlyIncome, setMonthlyIncome] = useState<string>("");
  const [categories, setCategories] = useState<BudgetCategory[]>([
    { name: "Housing", budgeted: 0, spent: 0, icon: "🏠", color: "blue" },
    { name: "Food", budgeted: 0, spent: 0, icon: "🍽️", color: "orange" },
    { name: "Transportation", budgeted: 0, spent: 0, icon: "🚗", color: "green" },
    { name: "Utilities", budgeted: 0, spent: 0, icon: "⚡", color: "yellow" },
    { name: "Entertainment", budgeted: 0, spent: 0, icon: "🎬", color: "purple" },
    { name: "Healthcare", budgeted: 0, spent: 0, icon: "🏥", color: "red" },
    { name: "Shopping", budgeted: 0, spent: 0, icon: "🛍️", color: "pink" },
    { name: "Savings", budgeted: 0, spent: 0, icon: "💰", color: "emerald" },
  ]);

  const updateCategoryBudget = (index: number, value: string) => {
    const newCategories = [...categories];
    newCategories[index].budgeted = parseFloat(value) || 0;
    setCategories(newCategories);
  };

  const updateCategorySpent = (index: number, value: string) => {
    const newCategories = [...categories];
    newCategories[index].spent = parseFloat(value) || 0;
    setCategories(newCategories);
  };

  const getStats = () => {
    const income = parseFloat(monthlyIncome) || 0;
    const totalBudgeted = categories.reduce((sum, cat) => sum + cat.budgeted, 0);
    const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
    const remaining = income - totalSpent;
    const budgetRemaining = totalBudgeted - totalSpent;
    const savingsGoal = categories.find(cat => cat.name === "Savings")?.budgeted || 0;
    const actualSavings = remaining;

    return {
      income,
      totalBudgeted,
      totalSpent,
      remaining,
      budgetRemaining,
      savingsGoal,
      actualSavings,
      budgetUtilization: totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0,
      incomeUtilization: income > 0 ? (totalSpent / income) * 100 : 0
    };
  };

  const getCategoryStatus = (category: BudgetCategory) => {
    if (category.budgeted === 0) return { status: 'not-set', percentage: 0 };
    
    const percentage = (category.spent / category.budgeted) * 100;
    
    if (percentage <= 75) return { status: 'good', percentage };
    if (percentage <= 100) return { status: 'warning', percentage };
    return { status: 'over', percentage };
  };

  const getRecommendedBudget = () => {
    const income = parseFloat(monthlyIncome) || 0;
    if (income === 0) return null;

    return {
      housing: income * 0.3, // 30%
      food: income * 0.15, // 15%
      transportation: income * 0.15, // 15%
      utilities: income * 0.1, // 10%
      entertainment: income * 0.05, // 5%
      healthcare: income * 0.05, // 5%
      shopping: income * 0.05, // 5%
      savings: income * 0.2, // 20%
    };
  };

  const applyRecommendedBudget = () => {
    const recommended = getRecommendedBudget();
    if (!recommended) return;

    const newCategories = categories.map(cat => ({
      ...cat,
      budgeted: recommended[cat.name.toLowerCase() as keyof typeof recommended] || 0
    }));
    setCategories(newCategories);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const stats = getStats();
  const recommended = getRecommendedBudget();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Budget Calculator</h1>
        <p className="text-muted-foreground">
          Plan and track your monthly budget across different categories
        </p>
      </div>

      {/* Income and Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <Label htmlFor="monthly-income">Monthly Income</Label>
            <Input
              id="monthly-income"
              type="number"
              placeholder="Enter monthly income"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              className="mt-2"
              data-testid="input-monthly-income"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">Total Spent</span>
            </div>
            <div className="text-xl font-bold" data-testid="total-spent">
              {formatCurrency(stats.totalSpent)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <PiggyBank className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">Remaining</span>
            </div>
            <div className={`text-xl font-bold ${stats.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="remaining">
              {formatCurrency(stats.remaining)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calculator className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium">Budget Used</span>
            </div>
            <div className="text-xl font-bold" data-testid="budget-utilization">
              {stats.budgetUtilization.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Setup */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Budget Categories</CardTitle>
              <CardDescription>
                Set budget amounts for each category and track spending
              </CardDescription>
            </div>
            {recommended && (
              <Button onClick={applyRecommendedBudget} variant="outline" data-testid="button-apply-recommended">
                Apply Recommended Budget
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category, index) => {
              const status = getCategoryStatus(category);
              const recommendedAmount = recommended ? recommended[category.name.toLowerCase() as keyof typeof recommended] : 0;
              
              return (
                <Card key={category.name} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{category.icon}</span>
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <Badge 
                        variant={
                          status.status === 'good' ? 'default' :
                          status.status === 'warning' ? 'secondary' : 'destructive'
                        }
                      >
                        {status.status === 'not-set' ? 'Not Set' :
                         status.status === 'good' ? 'On Track' :
                         status.status === 'warning' ? 'Near Limit' : 'Over Budget'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Budget</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={category.budgeted || ''}
                          onChange={(e) => updateCategoryBudget(index, e.target.value)}
                          data-testid={`input-budget-${category.name.toLowerCase()}`}
                        />
                        {recommendedAmount > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Suggested: {formatCurrency(recommendedAmount)}
                          </div>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs">Spent</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={category.spent || ''}
                          onChange={(e) => updateCategorySpent(index, e.target.value)}
                          data-testid={`input-spent-${category.name.toLowerCase()}`}
                        />
                      </div>
                    </div>

                    {category.budgeted > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{formatCurrency(category.spent)} spent</span>
                          <span>{formatCurrency(category.budgeted - category.spent)} left</span>
                        </div>
                        <Progress 
                          value={Math.min(status.percentage, 100)} 
                          className="h-2"
                          data-testid={`progress-${category.name.toLowerCase()}`}
                        />
                        <div className="text-xs text-center text-muted-foreground">
                          {status.percentage.toFixed(1)}% used
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Budget Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Income Utilization</h3>
              <div className="text-2xl font-bold mb-2" data-testid="income-utilization">
                {stats.incomeUtilization.toFixed(1)}%
              </div>
              <Progress value={Math.min(stats.incomeUtilization, 100)} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                of your income is being spent
              </p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Savings Rate</h3>
              <div className="text-2xl font-bold mb-2" data-testid="savings-rate">
                {stats.income > 0 ? ((stats.remaining / stats.income) * 100).toFixed(1) : 0}%
              </div>
              <div className={`text-sm ${stats.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(stats.remaining)} saved
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Target: 20% savings rate
              </p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Budget Status</h3>
              <div className="flex items-center justify-center gap-2 mb-2">
                {stats.budgetRemaining >= 0 ? (
                  <div className="text-green-600">
                    <span className="text-2xl font-bold">{formatCurrency(stats.budgetRemaining)}</span>
                    <p className="text-sm">under budget</p>
                  </div>
                ) : (
                  <div className="text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-2xl font-bold">{formatCurrency(Math.abs(stats.budgetRemaining))}</span>
                    <p className="text-sm">over budget</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}