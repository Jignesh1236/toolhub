import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight, TrendingUp } from "lucide-react";

interface ExchangeRate {
  [key: string]: number;
}

export default function CurrencyConverter() {
  const [amount, setAmount] = useState<string>("1");
  const [fromCurrency, setFromCurrency] = useState<string>("USD");
  const [toCurrency, setToCurrency] = useState<string>("EUR");
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate>({});
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock exchange rates - in a real app, you'd fetch from an API
  const mockRates: ExchangeRate = {
    USD: 1,
    EUR: 0.85,
    GBP: 0.73,
    JPY: 110.12,
    CAD: 1.25,
    AUD: 1.35,
    CHF: 0.92,
    CNY: 6.45,
    INR: 74.83,
    KRW: 1180.50,
    BRL: 5.20,
    MXN: 20.15,
    SGD: 1.35,
    HKD: 7.78,
    NOK: 8.60,
    SEK: 8.85,
    DKK: 6.35,
    PLN: 3.90,
    CZK: 21.75,
    HUF: 295.40
  };

  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$" },
    { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
    { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
    { code: "INR", name: "Indian Rupee", symbol: "₹" },
    { code: "KRW", name: "South Korean Won", symbol: "₩" },
    { code: "BRL", name: "Brazilian Real", symbol: "R$" },
    { code: "MXN", name: "Mexican Peso", symbol: "$" },
    { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
    { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
    { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
    { code: "SEK", name: "Swedish Krona", symbol: "kr" },
    { code: "DKK", name: "Danish Krone", symbol: "kr" },
    { code: "PLN", name: "Polish Zloty", symbol: "zł" },
    { code: "CZK", name: "Czech Koruna", symbol: "Kč" },
    { code: "HUF", name: "Hungarian Forint", symbol: "Ft" }
  ];

  useEffect(() => {
    // Simulate loading exchange rates
    setLoading(true);
    setTimeout(() => {
      setExchangeRates(mockRates);
      setLoading(false);
    }, 500);
  }, []);

  const convertCurrency = () => {
    const amountNum = parseFloat(amount);
    if (!amountNum || !exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) return;

    // Convert to USD first, then to target currency
    const usdAmount = amountNum / exchangeRates[fromCurrency];
    const convertedAmount = usdAmount * exchangeRates[toCurrency];
    setResult(convertedAmount);
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const formatCurrency = (amount: number, currencyCode: string) => {
    const currency = currencies.find(c => c.code === currencyCode);
    return `${currency?.symbol || ''}${amount.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const getExchangeRate = () => {
    if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) return null;
    const usdFromRate = 1 / exchangeRates[fromCurrency];
    const rate = usdFromRate * exchangeRates[toCurrency];
    return rate;
  };

  useEffect(() => {
    convertCurrency();
  }, [amount, fromCurrency, toCurrency, exchangeRates]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Currency Converter</h1>
        <p className="text-muted-foreground">
          Convert between different currencies with live exchange rates
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Convert Currency</CardTitle>
            <CardDescription>
              Enter amount and select currencies to convert
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                data-testid="input-amount"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>From</Label>
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger data-testid="select-from-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={swapCurrencies}
                  data-testid="button-swap-currencies"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label>To</Label>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger data-testid="select-to-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <TrendingUp className="w-5 h-5 inline mr-2" />
              Conversion Result
            </CardTitle>
            <CardDescription>
              Live exchange rate calculation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading exchange rates...
              </div>
            ) : result !== null && amount ? (
              <>
                <div className="text-center space-y-2">
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(parseFloat(amount), fromCurrency)}
                  </div>
                  <div className="text-3xl font-bold text-primary" data-testid="conversion-result">
                    {formatCurrency(result, toCurrency)}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Exchange Rate</div>
                    <div className="font-mono" data-testid="exchange-rate">
                      1 {fromCurrency} = {getExchangeRate()?.toFixed(4)} {toCurrency}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <div className="font-semibold">1 {fromCurrency}</div>
                    <div className="text-muted-foreground">
                      {formatCurrency(getExchangeRate() || 0, toCurrency)}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">10 {fromCurrency}</div>
                    <div className="text-muted-foreground">
                      {formatCurrency((getExchangeRate() || 0) * 10, toCurrency)}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">100 {fromCurrency}</div>
                    <div className="text-muted-foreground">
                      {formatCurrency((getExchangeRate() || 0) * 100, toCurrency)}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Enter an amount to see the conversion
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}