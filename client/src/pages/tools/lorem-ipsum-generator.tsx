import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function LoremIpsumGenerator() {
  const [generatedText, setGeneratedText] = useState('');
  const [count, setCount] = useState('5');
  const [type, setType] = useState('paragraphs');
  const { toast } = useToast();

  const loremWords = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'at', 'vero', 'eos',
    'accusamus', 'iusto', 'odio', 'dignissimos', 'ducimus', 'blanditiis',
    'praesentium', 'voluptatum', 'deleniti', 'atque', 'corrupti', 'quos', 'dolores',
    'quas', 'molestias', 'excepturi', 'occaecati', 'cupiditate', 'similique',
    'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo', 'inventore',
    'veritatis', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta', 'explicabo',
    'nemo', 'ipsam', 'quia', 'voluptas', 'aspernatur', 'odit', 'aut', 'fugit'
  ];

  const generateWords = (count: number): string => {
    const words = [];
    for (let i = 0; i < count; i++) {
      words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
    }
    return words.join(' ');
  };

  const generateSentence = (): string => {
    const wordCount = Math.floor(Math.random() * 10) + 8; // 8-17 words per sentence
    const sentence = generateWords(wordCount);
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
  };

  const generateParagraph = (): string => {
    const sentenceCount = Math.floor(Math.random() * 4) + 3; // 3-6 sentences per paragraph
    const sentences = [];
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(generateSentence());
    }
    return sentences.join(' ');
  };

  const generateLorem = () => {
    const numCount = parseInt(count) || 1;
    let result = '';

    switch (type) {
      case 'words':
        result = generateWords(numCount);
        break;
      case 'sentences':
        const sentences = [];
        for (let i = 0; i < numCount; i++) {
          sentences.push(generateSentence());
        }
        result = sentences.join(' ');
        break;
      case 'paragraphs':
        const paragraphs = [];
        for (let i = 0; i < numCount; i++) {
          paragraphs.push(generateParagraph());
        }
        result = paragraphs.join('\n\n');
        break;
      default:
        result = generateParagraph();
    }

    setGeneratedText(result);
    toast({
      title: 'Generated',
      description: `${numCount} ${type} of Lorem Ipsum generated successfully`,
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedText).then(() => {
      toast({
        title: 'Copied',
        description: 'Lorem Ipsum text copied to clipboard',
      });
    });
  };

  const clearText = () => {
    setGeneratedText('');
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          <i className="fas fa-align-left mr-3 text-purple-600"></i>
          Lorem Ipsum Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate placeholder text for design and development projects
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Generator Settings</CardTitle>
            <CardDescription>Configure your Lorem Ipsum generation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="count-input">Count</Label>
                <Input
                  id="count-input"
                  type="number"
                  min="1"
                  max="100"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="mt-2"
                  data-testid="count-input"
                />
              </div>

              <div>
                <Label htmlFor="type-select">Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="mt-2" data-testid="type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="words">Words</SelectItem>
                    <SelectItem value="sentences">Sentences</SelectItem>
                    <SelectItem value="paragraphs">Paragraphs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={generateLorem} className="w-full" data-testid="generate-button">
                  <i className="fas fa-magic mr-2"></i>
                  Generate
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={copyToClipboard}
                disabled={!generatedText}
                variant="outline"
                data-testid="copy-button"
              >
                <i className="fas fa-copy mr-2"></i>
                Copy Text
              </Button>
              <Button
                onClick={clearText}
                disabled={!generatedText}
                variant="outline"
                data-testid="clear-button"
              >
                <i className="fas fa-trash mr-2"></i>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Text</CardTitle>
            <CardDescription>Your Lorem Ipsum placeholder text</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Generated Lorem Ipsum will appear here..."
              value={generatedText}
              readOnly
              rows={15}
              className="bg-gray-50 dark:bg-gray-800 resize-none"
              data-testid="generated-text"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { count: '1', type: 'paragraphs', label: '1 Paragraph' },
                { count: '3', type: 'paragraphs', label: '3 Paragraphs' },
                { count: '5', type: 'sentences', label: '5 Sentences' },
                { count: '50', type: 'words', label: '50 Words' },
              ].map((preset, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCount(preset.count);
                    setType(preset.type);
                    setTimeout(generateLorem, 100);
                  }}
                  data-testid={`preset-${index}`}
                >
                  <i className="fas fa-bolt mr-2 text-xs"></i>
                  {preset.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About Lorem Ipsum</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. It has been the 
              industry's standard dummy text ever since the 1500s, when an unknown printer took a galley 
              of type and scrambled it to make a type specimen book. It is used to demonstrate the visual 
              form of a document or a typeface without relying on meaningful content.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}