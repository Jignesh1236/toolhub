import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

export default function BMICalculator() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [heightUnit, setHeightUnit] = useState('cm');
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState('');
  const [categoryColor, setCategoryColor] = useState('');
  const { toast } = useToast();

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) {
      return { category: 'Underweight', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900' };
    } else if (bmi >= 18.5 && bmi < 25) {
      return { category: 'Normal weight', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900' };
    } else if (bmi >= 25 && bmi < 30) {
      return { category: 'Overweight', color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900' };
    } else {
      return { category: 'Obese', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900' };
    }
  };

  const calculateBMI = () => {
    if (!weight || !height) {
      toast({
        title: 'Error',
        description: 'Please enter both weight and height',
        variant: 'destructive',
      });
      return;
    }

    const weightValue = parseFloat(weight);
    const heightValue = parseFloat(height);

    if (weightValue <= 0 || heightValue <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter valid positive numbers',
        variant: 'destructive',
      });
      return;
    }

    // Convert to metric if needed
    let weightInKg = weightValue;
    let heightInM = heightValue;

    if (weightUnit === 'lb') {
      weightInKg = weightValue * 0.453592; // Convert pounds to kg
    }

    if (heightUnit === 'ft') {
      heightInM = heightValue * 0.3048; // Convert feet to meters
    } else if (heightUnit === 'cm') {
      heightInM = heightValue / 100; // Convert cm to meters
    } else if (heightUnit === 'in') {
      heightInM = heightValue * 0.0254; // Convert inches to meters
    }

    const calculatedBMI = weightInKg / (heightInM * heightInM);
    const { category: bmiCategory, color, bgColor } = getBMICategory(calculatedBMI);

    setBmi(calculatedBMI);
    setCategory(bmiCategory);
    setCategoryColor(`${color} ${bgColor}`);

    toast({
      title: 'BMI Calculated',
      description: `Your BMI is ${calculatedBMI.toFixed(1)} (${bmiCategory})`,
    });
  };

  const clearForm = () => {
    setWeight('');
    setHeight('');
    setBmi(null);
    setCategory('');
    setCategoryColor('');
  };

  const getBMIProgress = () => {
    if (!bmi) return 0;
    // Map BMI to 0-100 scale for progress bar
    if (bmi < 18.5) return (bmi / 18.5) * 25;
    if (bmi < 25) return 25 + ((bmi - 18.5) / (25 - 18.5)) * 25;
    if (bmi < 30) return 50 + ((bmi - 25) / (30 - 25)) * 25;
    return Math.min(100, 75 + ((bmi - 30) / 10) * 25);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          <i className="fas fa-weight mr-3 text-green-600"></i>
          BMI Calculator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Calculate your Body Mass Index and understand your health metrics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Enter Your Details</CardTitle>
            <CardDescription>Input your weight and height information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight-input">Weight</Label>
                <Input
                  id="weight-input"
                  type="number"
                  placeholder="Enter weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="mt-2"
                  data-testid="weight-input"
                />
              </div>
              <div>
                <Label htmlFor="weight-unit">Unit</Label>
                <Select value={weightUnit} onValueChange={setWeightUnit}>
                  <SelectTrigger className="mt-2" data-testid="weight-unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="lb">Pounds (lb)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height-input">Height</Label>
                <Input
                  id="height-input"
                  type="number"
                  placeholder="Enter height"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="mt-2"
                  data-testid="height-input"
                />
              </div>
              <div>
                <Label htmlFor="height-unit">Unit</Label>
                <Select value={heightUnit} onValueChange={setHeightUnit}>
                  <SelectTrigger className="mt-2" data-testid="height-unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cm">Centimeters (cm)</SelectItem>
                    <SelectItem value="ft">Feet (ft)</SelectItem>
                    <SelectItem value="in">Inches (in)</SelectItem>
                    <SelectItem value="m">Meters (m)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={calculateBMI} className="flex-1" data-testid="calculate-button">
                <i className="fas fa-calculator mr-2"></i>
                Calculate BMI
              </Button>
              <Button onClick={clearForm} variant="outline" data-testid="clear-button">
                <i className="fas fa-trash mr-2"></i>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your BMI Result</CardTitle>
            <CardDescription>Body Mass Index calculation and category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {bmi && (
              <>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2" data-testid="bmi-value">
                    {bmi.toFixed(1)}
                  </div>
                  <div className={`text-lg font-semibold px-3 py-1 rounded-lg ${categoryColor}`} data-testid="bmi-category">
                    {category}
                  </div>
                </div>

                <div>
                  <Label>BMI Scale</Label>
                  <Progress value={getBMIProgress()} className="mt-2 h-3" />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Underweight</span>
                    <span>Normal</span>
                    <span>Overweight</span>
                    <span>Obese</span>
                  </div>
                </div>
              </>
            )}

            {!bmi && (
              <div className="text-center text-gray-500 py-8">
                <i className="fas fa-calculator text-4xl mb-4"></i>
                <p>Enter your details and click Calculate to see your BMI</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>BMI Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-blue-600 font-semibold">Underweight</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">BMI less than 18.5</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-green-600 font-semibold">Normal weight</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">BMI 18.5 - 24.9</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-yellow-600 font-semibold">Overweight</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">BMI 25 - 29.9</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-red-600 font-semibold">Obese</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">BMI 30 or greater</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>About BMI</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Body Mass Index (BMI) is a measure of body fat based on height and weight. It's a useful screening tool 
              but doesn't directly measure body fat. BMI may not be accurate for athletes with high muscle mass, 
              pregnant women, or elderly individuals. Always consult with healthcare professionals for personalized advice.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}