import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Mail, AlertTriangle } from "lucide-react";

interface ValidationResult {
  email: string;
  isValid: boolean;
  reason?: string;
  suggestions?: string[];
}

export default function EmailValidator() {
  const [singleEmail, setSingleEmail] = useState("");
  const [bulkEmails, setBulkEmails] = useState("");
  const [singleResult, setSingleResult] = useState<ValidationResult | null>(null);
  const [bulkResults, setBulkResults] = useState<ValidationResult[]>([]);

  const validateEmail = (email: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      return {
        email: email.trim(),
        isValid: false,
        reason: "Email is empty"
      };
    }

    if (!emailRegex.test(trimmedEmail)) {
      return {
        email: email.trim(),
        isValid: false,
        reason: "Invalid email format",
        suggestions: ["Make sure it includes @ and a domain"]
      };
    }

    // Check for common typos
    const suggestions: string[] = [];
    const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
    const [localPart, domainPart] = trimmedEmail.split('@');

    if (domainPart) {
      // Check for common domain typos
      if (domainPart.includes('gmial') || domainPart.includes('gmai')) {
        suggestions.push(localPart + '@gmail.com');
      } else if (domainPart.includes('yahoo') && !domainPart.includes('yahoo.com')) {
        suggestions.push(localPart + '@yahoo.com');
      } else if (domainPart.includes('hotmai') || domainPart.includes('hotmal')) {
        suggestions.push(localPart + '@hotmail.com');
      }

      // Check for missing TLD
      if (!domainPart.includes('.')) {
        suggestions.push(`${localPart}@${domainPart}.com`);
      }

      // Check for double @
      if (trimmedEmail.split('@').length > 2) {
        return {
          email: email.trim(),
          isValid: false,
          reason: "Multiple @ symbols found"
        };
      }

      // Check for spaces
      if (trimmedEmail.includes(' ')) {
        return {
          email: email.trim(),
          isValid: false,
          reason: "Email contains spaces"
        };
      }

      // Check for consecutive dots
      if (domainPart.includes('..')) {
        return {
          email: email.trim(),
          isValid: false,
          reason: "Domain contains consecutive dots"
        };
      }

      // Check if domain starts or ends with dot
      if (domainPart.startsWith('.') || domainPart.endsWith('.')) {
        return {
          email: email.trim(),
          isValid: false,
          reason: "Domain cannot start or end with a dot"
        };
      }
    }

    return {
      email: email.trim(),
      isValid: true,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  };

  const validateSingleEmail = () => {
    const result = validateEmail(singleEmail);
    setSingleResult(result);
  };

  const validateBulkEmails = () => {
    const emails = bulkEmails.split('\n').filter(email => email.trim());
    const results = emails.map(validateEmail);
    setBulkResults(results);
  };

  const getBulkStats = () => {
    const total = bulkResults.length;
    const valid = bulkResults.filter(r => r.isValid).length;
    const invalid = total - valid;
    return { total, valid, invalid };
  };

  const copyValidEmails = () => {
    const validEmails = bulkResults.filter(r => r.isValid).map(r => r.email).join('\n');
    navigator.clipboard.writeText(validEmails);
  };

  const stats = getBulkStats();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Email Validator</h1>
        <p className="text-muted-foreground">
          Validate email addresses and check for common errors
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Single Email Validation */}
        <Card>
          <CardHeader>
            <CardTitle>Single Email Validation</CardTitle>
            <CardDescription>
              Validate and check a single email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="single-email">Email Address</Label>
              <Input
                id="single-email"
                type="email"
                placeholder="Enter email address..."
                value={singleEmail}
                onChange={(e) => setSingleEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && validateSingleEmail()}
                data-testid="input-single-email"
              />
            </div>

            <Button onClick={validateSingleEmail} className="w-full" data-testid="button-validate-single">
              <Mail className="w-4 h-4 mr-2" />
              Validate Email
            </Button>

            {singleResult && (
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-2">
                  {singleResult.isValid ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    {singleResult.isValid ? "Valid Email" : "Invalid Email"}
                  </span>
                </div>

                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="font-mono text-sm break-all" data-testid="validated-email">
                    {singleResult.email}
                  </div>
                </div>

                {singleResult.reason && (
                  <div className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                    <span className="text-muted-foreground" data-testid="validation-reason">
                      {singleResult.reason}
                    </span>
                  </div>
                )}

                {singleResult.suggestions && singleResult.suggestions.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Suggestions:</div>
                    {singleResult.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {suggestion}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSingleEmail(suggestion)}
                          data-testid={`suggestion-${index}`}
                        >
                          Use this
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bulk Email Validation */}
        <Card>
          <CardHeader>
            <CardTitle>Bulk Email Validation</CardTitle>
            <CardDescription>
              Validate multiple email addresses at once
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-emails">Email Addresses (one per line)</Label>
              <Textarea
                id="bulk-emails"
                placeholder="Enter multiple emails, one per line..."
                value={bulkEmails}
                onChange={(e) => setBulkEmails(e.target.value)}
                rows={8}
                data-testid="textarea-bulk-emails"
              />
            </div>

            <Button onClick={validateBulkEmails} className="w-full" data-testid="button-validate-bulk">
              Validate All Emails
            </Button>

            {bulkResults.length > 0 && (
              <div className="space-y-4 pt-4 border-t">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <div className="font-semibold" data-testid="bulk-total">{stats.total}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="font-semibold text-green-600" data-testid="bulk-valid">{stats.valid}</div>
                    <div className="text-xs text-muted-foreground">Valid</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded">
                    <div className="font-semibold text-red-600" data-testid="bulk-invalid">{stats.invalid}</div>
                    <div className="text-xs text-muted-foreground">Invalid</div>
                  </div>
                </div>

                {stats.valid > 0 && (
                  <Button variant="outline" onClick={copyValidEmails} className="w-full" data-testid="button-copy-valid">
                    Copy Valid Emails
                  </Button>
                )}

                {/* Results */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {bulkResults.map((result, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center gap-2 p-2 rounded border ${
                        result.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}
                    >
                      {result.isValid ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-sm truncate">{result.email}</div>
                        {result.reason && (
                          <div className="text-xs text-muted-foreground">{result.reason}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}