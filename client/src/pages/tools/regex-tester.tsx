import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface RegexMatch {
  match: string;
  groups: string[];
  index: number;
}

export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [testString, setTestString] = useState("");
  const [flags, setFlags] = useState({
    global: true,
    ignoreCase: false,
    multiline: false,
    dotAll: false,
    unicode: false,
    sticky: false
  });
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const regexResult = useMemo(() => {
    if (!pattern || !testString) {
      setIsValid(null);
      setError("");
      return { matches: [], isMatch: false };
    }

    try {
      const flagString = [
        flags.global ? 'g' : '',
        flags.ignoreCase ? 'i' : '',
        flags.multiline ? 'm' : '',
        flags.dotAll ? 's' : '',
        flags.unicode ? 'u' : '',
        flags.sticky ? 'y' : ''
      ].join('');

      const regex = new RegExp(pattern, flagString);
      const matches: RegexMatch[] = [];
      
      if (flags.global) {
        let match;
        while ((match = regex.exec(testString)) !== null) {
          matches.push({
            match: match[0],
            groups: match.slice(1),
            index: match.index
          });
          
          // Prevent infinite loop
          if (!flags.global || match[0].length === 0) break;
        }
      } else {
        const match = regex.exec(testString);
        if (match) {
          matches.push({
            match: match[0],
            groups: match.slice(1),
            index: match.index
          });
        }
      }

      setIsValid(true);
      setError("");
      return { matches, isMatch: matches.length > 0 };
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : "Invalid regex pattern");
      return { matches: [], isMatch: false };
    }
  }, [pattern, testString, flags]);

  const highlightedText = useMemo(() => {
    if (!testString || !regexResult.matches.length) return testString;

    let highlightedString = testString;
    let offset = 0;

    regexResult.matches.forEach((match, index) => {
      const beforeMatch = highlightedString.slice(0, match.index + offset);
      const matchText = `<mark class="bg-yellow-200 dark:bg-yellow-700 px-1 rounded" title="Match ${index + 1}">${match.match}</mark>`;
      const afterMatch = highlightedString.slice(match.index + offset + match.match.length);
      
      highlightedString = beforeMatch + matchText + afterMatch;
      offset += matchText.length - match.match.length;
    });

    return highlightedString;
  }, [testString, regexResult.matches]);

  const copyPattern = async () => {
    if (!pattern) return;
    
    try {
      await navigator.clipboard.writeText(pattern);
      toast({
        title: "Copied!",
        description: "Regex pattern copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const loadSample = () => {
    setPattern("(\\d{3})-(\\d{3})-(\\d{4})");
    setTestString("Call me at 123-456-7890 or 987-654-3210 for more information.");
    setFlags({ ...flags, global: true });
  };

  const clearAll = () => {
    setPattern("");
    setTestString("");
    setIsValid(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Regex Tester</h1>
          <p className="text-gray-600 dark:text-gray-400">Test and debug regular expressions with live matching</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pattern Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <i className="fas fa-search text-blue-500"></i>
                    Regex Pattern
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={loadSample}
                      data-testid="load-sample"
                    >
                      Sample
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={copyPattern}
                      disabled={!pattern}
                      data-testid="copy-pattern"
                    >
                      <i className="fas fa-copy mr-1"></i>
                      Copy
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Input
                    placeholder="Enter your regex pattern..."
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    className={`font-mono ${
                      isValid === false ? 'border-red-300 dark:border-red-600' : 
                      isValid === true ? 'border-green-300 dark:border-green-600' : ''
                    }`}
                    data-testid="pattern-input"
                  />
                  {isValid !== null && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <Badge variant={isValid ? "default" : "destructive"}>
                        {isValid ? "Valid" : "Invalid"}
                      </Badge>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <i className="fas fa-exclamation-triangle text-red-500 mt-0.5"></i>
                      <div>
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">
                          Pattern Error
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Flags</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="global"
                        checked={flags.global}
                        onCheckedChange={(checked) => 
                          setFlags({ ...flags, global: checked as boolean })
                        }
                        data-testid="flag-global"
                      />
                      <Label htmlFor="global" className="text-sm">Global (g)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ignoreCase"
                        checked={flags.ignoreCase}
                        onCheckedChange={(checked) => 
                          setFlags({ ...flags, ignoreCase: checked as boolean })
                        }
                        data-testid="flag-ignore-case"
                      />
                      <Label htmlFor="ignoreCase" className="text-sm">Ignore Case (i)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="multiline"
                        checked={flags.multiline}
                        onCheckedChange={(checked) => 
                          setFlags({ ...flags, multiline: checked as boolean })
                        }
                        data-testid="flag-multiline"
                      />
                      <Label htmlFor="multiline" className="text-sm">Multiline (m)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="dotAll"
                        checked={flags.dotAll}
                        onCheckedChange={(checked) => 
                          setFlags({ ...flags, dotAll: checked as boolean })
                        }
                        data-testid="flag-dot-all"
                      />
                      <Label htmlFor="dotAll" className="text-sm">Dot All (s)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="unicode"
                        checked={flags.unicode}
                        onCheckedChange={(checked) => 
                          setFlags({ ...flags, unicode: checked as boolean })
                        }
                        data-testid="flag-unicode"
                      />
                      <Label htmlFor="unicode" className="text-sm">Unicode (u)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sticky"
                        checked={flags.sticky}
                        onCheckedChange={(checked) => 
                          setFlags({ ...flags, sticky: checked as boolean })
                        }
                        data-testid="flag-sticky"
                      />
                      <Label htmlFor="sticky" className="text-sm">Sticky (y)</Label>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={clearAll}
                  variant="outline"
                  className="w-full"
                  data-testid="clear-all"
                >
                  <i className="fas fa-trash mr-2"></i>
                  Clear All
                </Button>
              </CardContent>
            </Card>

            {/* Quick Reference */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-book text-purple-500"></i>
                  Quick Reference
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">.</code> - Any character</div>
                  <div><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">*</code> - Zero or more</div>
                  <div><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">+</code> - One or more</div>
                  <div><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">?</code> - Zero or one</div>
                  <div><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">\d</code> - Digit</div>
                  <div><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">\w</code> - Word character</div>
                  <div><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">\s</code> - Whitespace</div>
                  <div><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">^</code> - Start of line</div>
                  <div><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">$</code> - End of line</div>
                  <div><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">[]</code> - Character class</div>
                  <div><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">()</code> - Capture group</div>
                  <div><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">|</code> - Alternation</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Test Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-edit text-green-500"></i>
                  Test String
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter text to test against your regex pattern..."
                  value={testString}
                  onChange={(e) => setTestString(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                  data-testid="test-string"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <i className="fas fa-bullseye text-yellow-500"></i>
                    Match Results
                  </span>
                  {regexResult.matches.length > 0 && (
                    <Badge variant="default">
                      {regexResult.matches.length} match{regexResult.matches.length !== 1 ? 'es' : ''}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {regexResult.matches.length > 0 ? (
                  <div className="space-y-4">
                    {/* Highlighted Text */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Label className="text-sm font-medium mb-2 block">Highlighted Text</Label>
                      <div 
                        className="font-mono text-sm whitespace-pre-wrap break-words"
                        dangerouslySetInnerHTML={{ __html: highlightedText }}
                        data-testid="highlighted-text"
                      />
                    </div>

                    {/* Matches List */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Matches</Label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {regexResult.matches.map((match, index) => (
                          <div
                            key={index}
                            className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                            data-testid={`match-${index}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-sm font-medium">Match {index + 1}</span>
                              <Badge variant="secondary">Position {match.index}</Badge>
                            </div>
                            <p className="font-mono text-sm bg-white dark:bg-gray-800 p-2 rounded">
                              "{match.match}"
                            </p>
                            {match.groups.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                  Capture Groups:
                                </p>
                                <div className="space-y-1">
                                  {match.groups.map((group, groupIndex) => (
                                    <div key={groupIndex} className="text-xs">
                                      <span className="text-gray-500">Group {groupIndex + 1}:</span>{' '}
                                      <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
                                        "{group}"
                                      </code>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <i className="fas fa-search text-4xl mb-4"></i>
                    <p className="text-lg mb-2">No matches found</p>
                    <p className="text-sm">
                      {!pattern ? "Enter a regex pattern to start testing" : "Try adjusting your pattern or test string"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}