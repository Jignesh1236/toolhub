import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface ConversionUnit {
  name: string;
  symbol: string;
  toBase: number; // Multiplier to convert to base unit
}

interface ConversionCategory {
  name: string;
  baseUnit: string;
  units: ConversionUnit[];
}

const conversionCategories: Record<string, ConversionCategory> = {
  length: {
    name: "Length",
    baseUnit: "meter",
    units: [
      { name: "Millimeter", symbol: "mm", toBase: 0.001 },
      { name: "Centimeter", symbol: "cm", toBase: 0.01 },
      { name: "Meter", symbol: "m", toBase: 1 },
      { name: "Kilometer", symbol: "km", toBase: 1000 },
      { name: "Inch", symbol: "in", toBase: 0.0254 },
      { name: "Foot", symbol: "ft", toBase: 0.3048 },
      { name: "Yard", symbol: "yd", toBase: 0.9144 },
      { name: "Mile", symbol: "mi", toBase: 1609.34 },
    ],
  },
  weight: {
    name: "Weight",
    baseUnit: "kilogram",
    units: [
      { name: "Milligram", symbol: "mg", toBase: 0.000001 },
      { name: "Gram", symbol: "g", toBase: 0.001 },
      { name: "Kilogram", symbol: "kg", toBase: 1 },
      { name: "Ounce", symbol: "oz", toBase: 0.0283495 },
      { name: "Pound", symbol: "lb", toBase: 0.453592 },
      { name: "Stone", symbol: "st", toBase: 6.35029 },
      { name: "Ton", symbol: "t", toBase: 1000 },
    ],
  },
  temperature: {
    name: "Temperature",
    baseUnit: "celsius",
    units: [
      { name: "Celsius", symbol: "°C", toBase: 1 },
      { name: "Fahrenheit", symbol: "°F", toBase: 1 },
      { name: "Kelvin", symbol: "K", toBase: 1 },
    ],
  },
  area: {
    name: "Area",
    baseUnit: "square meter",
    units: [
      { name: "Square Millimeter", symbol: "mm²", toBase: 0.000001 },
      { name: "Square Centimeter", symbol: "cm²", toBase: 0.0001 },
      { name: "Square Meter", symbol: "m²", toBase: 1 },
      { name: "Square Kilometer", symbol: "km²", toBase: 1000000 },
      { name: "Square Inch", symbol: "in²", toBase: 0.00064516 },
      { name: "Square Foot", symbol: "ft²", toBase: 0.092903 },
      { name: "Square Yard", symbol: "yd²", toBase: 0.836127 },
      { name: "Acre", symbol: "ac", toBase: 4046.86 },
      { name: "Hectare", symbol: "ha", toBase: 10000 },
    ],
  },
  volume: {
    name: "Volume",
    baseUnit: "liter",
    units: [
      { name: "Milliliter", symbol: "ml", toBase: 0.001 },
      { name: "Liter", symbol: "l", toBase: 1 },
      { name: "Cubic Meter", symbol: "m³", toBase: 1000 },
      { name: "Fluid Ounce", symbol: "fl oz", toBase: 0.0295735 },
      { name: "Cup", symbol: "cup", toBase: 0.236588 },
      { name: "Pint", symbol: "pt", toBase: 0.473176 },
      { name: "Quart", symbol: "qt", toBase: 0.946353 },
      { name: "Gallon", symbol: "gal", toBase: 3.78541 },
    ],
  },
  speed: {
    name: "Speed",
    baseUnit: "meter per second",
    units: [
      { name: "Meter per Second", symbol: "m/s", toBase: 1 },
      { name: "Kilometer per Hour", symbol: "km/h", toBase: 0.277778 },
      { name: "Mile per Hour", symbol: "mph", toBase: 0.44704 },
      { name: "Knot", symbol: "kn", toBase: 0.514444 },
      { name: "Foot per Second", symbol: "ft/s", toBase: 0.3048 },
    ],
  },
};

export default function UnitConverter() {
  const [category, setCategory] = useState("length");
  const [fromUnit, setFromUnit] = useState("");
  const [toUnit, setToUnit] = useState("");
  const [fromValue, setFromValue] = useState("");
  const [toValue, setToValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const categoryData = conversionCategories[category];
    if (categoryData && categoryData.units.length > 0) {
      setFromUnit(categoryData.units[0].symbol);
      setToUnit(categoryData.units[1]?.symbol || categoryData.units[0].symbol);
    }
  }, [category]);

  useEffect(() => {
    if (fromValue && fromUnit && toUnit && !isNaN(parseFloat(fromValue))) {
      convertValue(parseFloat(fromValue));
    } else {
      setToValue("");
    }
  }, [fromValue, fromUnit, toUnit, category]);

  const convertValue = (value: number) => {
    const categoryData = conversionCategories[category];
    if (!categoryData) return;

    const fromUnitData = categoryData.units.find(unit => unit.symbol === fromUnit);
    const toUnitData = categoryData.units.find(unit => unit.symbol === toUnit);
    
    if (!fromUnitData || !toUnitData) return;

    let result: number;

    if (category === "temperature") {
      result = convertTemperature(value, fromUnit, toUnit);
    } else {
      // Convert to base unit first, then to target unit
      const baseValue = value * fromUnitData.toBase;
      result = baseValue / toUnitData.toBase;
    }

    setToValue(result.toString());
    
    // Add to history
    const conversionString = `${value} ${fromUnit} = ${result.toFixed(6)} ${toUnit}`;
    setHistory(prev => [conversionString, ...prev.slice(0, 9)]); // Keep last 10 conversions
  };

  const convertTemperature = (value: number, from: string, to: string): number => {
    if (from === to) return value;
    
    // Convert to Celsius first
    let celsius: number;
    switch (from) {
      case "°F":
        celsius = (value - 32) * 5/9;
        break;
      case "K":
        celsius = value - 273.15;
        break;
      default:
        celsius = value;
    }
    
    // Convert from Celsius to target
    switch (to) {
      case "°F":
        return (celsius * 9/5) + 32;
      case "K":
        return celsius + 273.15;
      default:
        return celsius;
    }
  };

  const swapUnits = () => {
    const tempUnit = fromUnit;
    const tempValue = fromValue;
    
    setFromUnit(toUnit);
    setToUnit(tempUnit);
    setFromValue(toValue);
  };

  const clearAll = () => {
    setFromValue("");
    setToValue("");
    setHistory([]);
  };

  const copyResult = async () => {
    if (!toValue) return;
    
    try {
      await navigator.clipboard.writeText(`${fromValue} ${fromUnit} = ${toValue} ${toUnit}`);
      toast({
        title: "Copied!",
        description: "Conversion result copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy result.",
        variant: "destructive",
      });
    }
  };

  const currentCategory = conversionCategories[category];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Unit Converter</h1>
          <p className="text-gray-600 dark:text-gray-400">Convert between different units of measurement</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Converter */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Unit Conversion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category Selection */}
                <div>
                  <Label>Conversion Category</Label>
                  <Tabs value={category} onValueChange={setCategory} className="mt-2">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="length" data-testid="category-length">Length</TabsTrigger>
                      <TabsTrigger value="weight" data-testid="category-weight">Weight</TabsTrigger>
                      <TabsTrigger value="temperature" data-testid="category-temperature">Temperature</TabsTrigger>
                    </TabsList>
                    <TabsList className="grid w-full grid-cols-3 mt-2">
                      <TabsTrigger value="area" data-testid="category-area">Area</TabsTrigger>
                      <TabsTrigger value="volume" data-testid="category-volume">Volume</TabsTrigger>
                      <TabsTrigger value="speed" data-testid="category-speed">Speed</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* From Unit */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fromValue">From</Label>
                      <Input
                        id="fromValue"
                        type="number"
                        value={fromValue}
                        onChange={(e) => setFromValue(e.target.value)}
                        placeholder="Enter value"
                        data-testid="from-value"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fromUnit">Unit</Label>
                      <Select value={fromUnit} onValueChange={setFromUnit}>
                        <SelectTrigger data-testid="from-unit">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currentCategory.units.map((unit) => (
                            <SelectItem key={unit.symbol} value={unit.symbol}>
                              {unit.name} ({unit.symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Swap Button */}
                  <div className="flex justify-center">
                    <Button 
                      variant="outline" 
                      onClick={swapUnits}
                      className="rounded-full p-3"
                      data-testid="swap-units"
                    >
                      <i className="fas fa-exchange-alt text-lg"></i>
                    </Button>
                  </div>

                  {/* To Unit */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="toValue">To</Label>
                      <Input
                        id="toValue"
                        type="number"
                        value={toValue}
                        readOnly
                        className="bg-gray-50 dark:bg-gray-800"
                        data-testid="to-value"
                      />
                    </div>
                    <div>
                      <Label htmlFor="toUnit">Unit</Label>
                      <Select value={toUnit} onValueChange={setToUnit}>
                        <SelectTrigger data-testid="to-unit">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currentCategory.units.map((unit) => (
                            <SelectItem key={unit.symbol} value={unit.symbol}>
                              {unit.name} ({unit.symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={copyResult} disabled={!toValue} data-testid="copy-result">
                    <i className="fas fa-copy mr-2"></i>
                    Copy Result
                  </Button>
                  <Button variant="outline" onClick={clearAll} data-testid="clear-all">
                    <i className="fas fa-times mr-2"></i>
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* History & Quick Conversions */}
          <div className="space-y-6">
            {/* Conversion History */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Conversion History</CardTitle>
                  {history.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setHistory([])}
                      data-testid="clear-history"
                    >
                      <i className="fas fa-trash text-sm"></i>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {history.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {history.map((conversion, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm font-mono"
                        data-testid={`history-item-${index}`}
                      >
                        {conversion}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    Conversion history will appear here
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Reference */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-200 text-sm mb-1">
                      Popular Length Conversions
                    </h4>
                    <div className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                      <p>1 meter = 3.28 feet</p>
                      <p>1 mile = 1.61 kilometers</p>
                      <p>1 inch = 2.54 centimeters</p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-semibold text-green-900 dark:text-green-200 text-sm mb-1">
                      Popular Weight Conversions
                    </h4>
                    <div className="text-xs text-green-800 dark:text-green-300 space-y-1">
                      <p>1 kilogram = 2.20 pounds</p>
                      <p>1 ounce = 28.35 grams</p>
                      <p>1 pound = 16 ounces</p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-200 text-sm mb-1">
                      Temperature Formulas
                    </h4>
                    <div className="text-xs text-purple-800 dark:text-purple-300 space-y-1">
                      <p>°F = (°C × 9/5) + 32</p>
                      <p>°C = (°F - 32) × 5/9</p>
                      <p>K = °C + 273.15</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
