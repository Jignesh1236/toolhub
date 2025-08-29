import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Wallet, TrendingDown, TrendingUp, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  type: 'expense' | 'income';
}

export default function ExpenseTracker() {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("food");
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const categories = [
    { value: 'food', label: 'Food & Dining', color: 'orange' },
    { value: 'transport', label: 'Transportation', color: 'blue' },
    { value: 'shopping', label: 'Shopping', color: 'pink' },
    { value: 'entertainment', label: 'Entertainment', color: 'purple' },
    { value: 'bills', label: 'Bills & Utilities', color: 'red' },
    { value: 'health', label: 'Healthcare', color: 'green' },
    { value: 'education', label: 'Education', color: 'indigo' },
    { value: 'travel', label: 'Travel', color: 'cyan' },
    { value: 'other', label: 'Other', color: 'gray' }
  ];

  // Load expenses from localStorage
  useEffect(() => {
    const savedExpenses = localStorage.getItem('expense-tracker-data');
    if (savedExpenses) {
      const parsedExpenses = JSON.parse(savedExpenses);
      const expensesWithDates = parsedExpenses.map((expense: any) => ({
        ...expense,
        date: new Date(expense.date)
      }));
      setExpenses(expensesWithDates);
    }
  }, []);

  // Save expenses to localStorage
  useEffect(() => {
    localStorage.setItem('expense-tracker-data', JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = () => {
    if (!amount || !description.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter both amount and description",
        variant: "destructive"
      });
      return;
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      description: description.trim(),
      category,
      date: new Date(),
      type
    };

    setExpenses(prev => [newExpense, ...prev]);
    setAmount("");
    setDescription("");
    
    toast({
      title: `${type === 'expense' ? 'Expense' : 'Income'} added`,
      description: `$${amount} has been recorded`
    });
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
    toast({
      title: "Entry deleted",
      description: "The entry has been removed from your records"
    });
  };

  const getFilteredExpenses = () => {
    return expenses.filter(expense => {
      const expenseDate = expense.date;
      return expenseDate.getMonth() === selectedMonth && 
             expenseDate.getFullYear() === selectedYear;
    });
  };

  const getStats = () => {
    const filteredExpenses = getFilteredExpenses();
    const totalExpenses = filteredExpenses
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const totalIncome = filteredExpenses
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const balance = totalIncome - totalExpenses;
    
    const expensesByCategory = categories.map(cat => ({
      ...cat,
      amount: filteredExpenses
        .filter(e => e.type === 'expense' && e.category === cat.value)
        .reduce((sum, e) => sum + e.amount, 0)
    }));

    return {
      totalExpenses,
      totalIncome,
      balance,
      expensesByCategory,
      transactionCount: filteredExpenses.length
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const stats = getStats();
  const filteredExpenses = getFilteredExpenses();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Expense Tracker</h1>
        <p className="text-muted-foreground">
          Track your income and expenses to manage your budget
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium">Expenses</span>
            </div>
            <div className="text-2xl font-bold text-red-600" data-testid="total-expenses">
              {formatCurrency(stats.totalExpenses)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">Income</span>
            </div>
            <div className="text-2xl font-bold text-green-600" data-testid="total-income">
              {formatCurrency(stats.totalIncome)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">Balance</span>
            </div>
            <div className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="balance">
              {formatCurrency(stats.balance)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium">Transactions</span>
            </div>
            <div className="text-2xl font-bold" data-testid="transaction-count">
              {stats.transactionCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Transaction Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Transaction</CardTitle>
            <CardDescription>
              Record a new income or expense
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={type === 'expense' ? 'default' : 'outline'}
                onClick={() => setType('expense')}
                data-testid="button-expense-type"
              >
                <TrendingDown className="w-4 h-4 mr-2" />
                Expense
              </Button>
              <Button
                variant={type === 'income' ? 'default' : 'outline'}
                onClick={() => setType('income')}
                data-testid="button-income-type"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Income
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                data-testid="input-amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Enter description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                data-testid="input-description"
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger data-testid="select-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={addExpense} className="w-full" data-testid="button-add-transaction">
              <Plus className="w-4 h-4 mr-2" />
              Add {type === 'expense' ? 'Expense' : 'Income'}
            </Button>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Transactions</CardTitle>
              <div className="flex gap-2">
                <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All ({filteredExpenses.length})</TabsTrigger>
                <TabsTrigger value="expenses">Expenses ({filteredExpenses.filter(e => e.type === 'expense').length})</TabsTrigger>
                <TabsTrigger value="income">Income ({filteredExpenses.filter(e => e.type === 'income').length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-2 max-h-96 overflow-y-auto">
                {filteredExpenses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions for {months[selectedMonth]} {selectedYear}
                  </div>
                ) : (
                  filteredExpenses.map((expense) => (
                    <TransactionItem
                      key={expense.id}
                      expense={expense}
                      onDelete={deleteExpense}
                      categories={categories}
                      formatCurrency={formatCurrency}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="expenses" className="space-y-2 max-h-96 overflow-y-auto">
                {filteredExpenses.filter(e => e.type === 'expense').map((expense) => (
                  <TransactionItem
                    key={expense.id}
                    expense={expense}
                    onDelete={deleteExpense}
                    categories={categories}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </TabsContent>

              <TabsContent value="income" className="space-y-2 max-h-96 overflow-y-auto">
                {filteredExpenses.filter(e => e.type === 'income').map((expense) => (
                  <TransactionItem
                    key={expense.id}
                    expense={expense}
                    onDelete={deleteExpense}
                    categories={categories}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.expensesByCategory
              .filter(cat => cat.amount > 0)
              .sort((a, b) => b.amount - a.amount)
              .map((cat) => (
                <div key={cat.value} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{cat.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {((cat.amount / stats.totalExpenses) * 100).toFixed(1)}% of total
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(cat.amount)}</div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface TransactionItemProps {
  expense: Expense;
  onDelete: (id: string) => void;
  categories: Array<{ value: string; label: string; color: string }>;
  formatCurrency: (amount: number) => string;
}

function TransactionItem({ expense, onDelete, categories, formatCurrency }: TransactionItemProps) {
  const category = categories.find(cat => cat.value === expense.category);
  
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className="font-medium">{expense.description}</div>
          <Badge variant="outline" className="text-xs">
            {category?.label}
          </Badge>
          <Badge variant={expense.type === 'income' ? 'default' : 'secondary'} className="text-xs">
            {expense.type}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {expense.date.toLocaleDateString()}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className={`font-semibold ${expense.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
          {expense.type === 'income' ? '+' : '-'}{formatCurrency(expense.amount)}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(expense.id)}
          data-testid={`delete-${expense.id}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}