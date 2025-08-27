import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";

// Tool imports
import ImageResizer from "@/pages/tools/image-resizer";
import PDFMerger from "@/pages/tools/pdf-merger";
import JSONFormatter from "@/pages/tools/json-formatter";
import PasswordGenerator from "@/pages/tools/password-generator";
import WordCounter from "@/pages/tools/word-counter";
import PomodoroTimer from "@/pages/tools/pomodoro-timer";
import QRGenerator from "@/pages/tools/qr-generator";
import UnitConverter from "@/pages/tools/unit-converter";
import WeatherDashboard from "@/pages/tools/weather-dashboard";
import TextToSpeech from "@/pages/tools/text-to-speech";
import Base64Converter from "@/pages/tools/base64-converter";
import HashGenerator from "@/pages/tools/hash-generator";
import LoremIpsumGenerator from "@/pages/tools/lorem-ipsum-generator";
import BMICalculator from "@/pages/tools/bmi-calculator";
import OCRTextExtractor from "@/pages/tools/ocr-text-extractor";
import ImageOptimizer from "@/pages/tools/image-optimizer";
import SQLFormatter from "@/pages/tools/sql-formatter";
import MarkdownEditor from "@/pages/tools/markdown-editor";
import CSSMinifier from "@/pages/tools/css-minifier";
import RegexTester from "@/pages/tools/regex-tester";
import ApiTester from "@/pages/tools/api-tester";
import InvoiceGenerator from "@/pages/tools/invoice-generator";
import ContentSummarizer from "@/pages/tools/content-summarizer";
import IPLookup from "@/pages/tools/ip-lookup";
import PortScanner from "@/pages/tools/port-scanner";
import VideoToGif from "@/pages/tools/video-to-gif";
import SocialMediaGenerator from "@/pages/tools/social-media-generator";
import TextEncryptor from "@/pages/tools/text-encryptor";
import LanguageTranslator from "@/pages/tools/language-translator";
import SSLChecker from "@/pages/tools/ssl-checker";
import CsvToJson from "@/pages/tools/csv-to-json";
import ColorConverter from "@/pages/tools/color-converter";
import TimezoneConverter from "@/pages/tools/timezone-converter";
import BarcodeGenerator from "@/pages/tools/barcode-generator";
import PDFConverter from "@/pages/tools/pdf-converter";

// New tool imports
import ColorPaletteGenerator from "@/pages/tools/color-palette-generator";
import GradientGenerator from "@/pages/tools/gradient-generator";
import MetaTagGenerator from "@/pages/tools/meta-tag-generator";
import LoanCalculator from "@/pages/tools/loan-calculator";
import AgeCalculator from "@/pages/tools/age-calculator";
import DateCalculator from "@/pages/tools/date-calculator";
import PercentageCalculator from "@/pages/tools/percentage-calculator";
import TipCalculator from "@/pages/tools/tip-calculator";
import CurrencyConverter from "@/pages/tools/currency-converter";
import NotesApp from "@/pages/tools/notes-app";
import TodoList from "@/pages/tools/todo-list";
import EmailValidator from "@/pages/tools/email-validator";
import URLShortener from "@/pages/tools/url-shortener";
import FaviconGenerator from "@/pages/tools/favicon-generator";
import ExpenseTracker from "@/pages/tools/expense-tracker";
import BudgetCalculator from "@/pages/tools/budget-calculator";
import HtmlValidator from "@/pages/tools/html-validator";
import XmlFormatter from "@/pages/tools/xml-formatter";
import HabitTracker from "@/pages/tools/habit-tracker";
import QuoteGenerator from "@/pages/tools/quote-generator";
import MemeGenerator from "@/pages/tools/meme-generator";
import AudioConverter from "@/pages/tools/audio-converter";

// Advanced Media Tools
import VideoEditor from "@/pages/tools/video-editor";
import AudioEditor from "@/pages/tools/audio-editor";
import ImageEditor from "@/pages/tools/image-editor";
import GifMaker from "@/pages/tools/gif-maker";
import WatermarkTool from "@/pages/tools/watermark-tool";

// Additional tool imports
import InvestmentCalculator from "@/pages/tools/investment-calculator";
import TaxCalculator from "@/pages/tools/tax-calculator";
import DomainWhois from "@/pages/tools/domain-whois";
import PingTest from "@/pages/tools/ping-test";
import SpeedTest from "@/pages/tools/speed-test";
import WebsiteScreenshot from "@/pages/tools/website-screenshot";
import FileCompressor from "@/pages/tools/file-compressor";
import DuplicateFinder from "@/pages/tools/duplicate-finder";
import ResumeBuilder from "@/pages/tools/resume-builder";
import Chatbot from "@/pages/tools/chatbot";
import KeywordExtractor from "@/pages/tools/keyword-extractor";
import SentimentAnalyzer from "@/pages/tools/sentiment-analyzer";
import FileShare from "@/pages/tools/file-share";
import SharedFile from "@/pages/shared-file";

// MS Office Suite imports
import WordProcessor from "@/pages/tools/word-processor";
import Spreadsheet from "@/pages/tools/spreadsheet";
import Presentation from "@/pages/tools/presentation";
import EmailClient from "@/pages/tools/email-client";
import DatabaseManager from "@/pages/tools/database-manager";
import NoteTaking from "@/pages/tools/note-taking";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      
      {/* Shared file access route */}
      <Route path="/shared/:id" component={SharedFile} />
      
      {/* MS Office Suite */}
      <Route path="/tools/word-processor" component={WordProcessor} />
      <Route path="/tools/spreadsheet" component={Spreadsheet} />
      <Route path="/tools/presentation" component={Presentation} />
      <Route path="/tools/email-client" component={EmailClient} />
      <Route path="/tools/database-manager" component={DatabaseManager} />
      <Route path="/tools/note-taking" component={NoteTaking} />
      
      {/* File Sharing */}
      <Route path="/tools/file-share" component={FileShare} />
      
      {/* Media Tools */}
      <Route path="/tools/image-resizer" component={ImageResizer} />
      <Route path="/tools/pdf-merger" component={PDFMerger} />
      <Route path="/tools/video-to-gif" component={VideoToGif} />
      
      {/* Developer Tools */}
      <Route path="/tools/json-formatter" component={JSONFormatter} />
      <Route path="/tools/regex-tester" component={RegexTester} />
      <Route path="/tools/api-tester" component={ApiTester} />
      
      {/* Security Tools */}
      <Route path="/tools/password-generator" component={PasswordGenerator} />
      
      {/* Content Creation */}
      <Route path="/tools/social-media-generator" component={SocialMediaGenerator} />
      
      {/* Text Analysis */}
      <Route path="/tools/word-counter" component={WordCounter} />
      <Route path="/tools/text-to-speech" component={TextToSpeech} />
      <Route path="/tools/text-encryptor" component={TextEncryptor} />
      <Route path="/tools/language-translator" component={LanguageTranslator} />
      
      {/* Security Tools */}
      <Route path="/tools/hash-generator" component={HashGenerator} />
      <Route path="/tools/ssl-checker" component={SSLChecker} />
      
      {/* Converters */}
      <Route path="/tools/unit-converter" component={UnitConverter} />
      <Route path="/tools/base64-converter" component={Base64Converter} />
      <Route path="/tools/csv-to-json" component={CsvToJson} />
      <Route path="/tools/color-converter" component={ColorConverter} />
      <Route path="/tools/timezone-converter" component={TimezoneConverter} />
      <Route path="/tools/pdf-converter" component={PDFConverter} />
      
      {/* Generators */}
      <Route path="/tools/qr-generator" component={QRGenerator} />
      <Route path="/tools/lorem-ipsum-generator" component={LoremIpsumGenerator} />
      <Route path="/tools/barcode-generator" component={BarcodeGenerator} />
      <Route path="/tools/color-palette-generator" component={ColorPaletteGenerator} />
      <Route path="/tools/gradient-generator" component={GradientGenerator} />
      <Route path="/tools/meta-tag-generator" component={MetaTagGenerator} />
      <Route path="/tools/favicon-generator" component={FaviconGenerator} />
      
      {/* Calculators */}
      <Route path="/tools/bmi-calculator" component={BMICalculator} />
      <Route path="/tools/loan-calculator" component={LoanCalculator} />
      <Route path="/tools/age-calculator" component={AgeCalculator} />
      <Route path="/tools/date-calculator" component={DateCalculator} />
      <Route path="/tools/percentage-calculator" component={PercentageCalculator} />
      <Route path="/tools/tip-calculator" component={TipCalculator} />
      
      {/* Financial Tools */}
      <Route path="/tools/expense-tracker" component={ExpenseTracker} />
      <Route path="/tools/budget-calculator" component={BudgetCalculator} />
      <Route path="/tools/investment-calculator" component={InvestmentCalculator} />
      <Route path="/tools/tax-calculator" component={TaxCalculator} />
      <Route path="/tools/currency-converter" component={CurrencyConverter} />
      
      {/* Productivity Tools */}
      <Route path="/tools/pomodoro-timer" component={PomodoroTimer} />
      <Route path="/tools/notes-app" component={NotesApp} />
      <Route path="/tools/todo-list" component={TodoList} />
      <Route path="/tools/habit-tracker" component={HabitTracker} />
      
      {/* Networking Tools */}
      <Route path="/tools/ip-lookup" component={IPLookup} />
      <Route path="/tools/domain-whois" component={DomainWhois} />
      <Route path="/tools/port-scanner" component={PortScanner} />
      <Route path="/tools/ping-test" component={PingTest} />
      <Route path="/tools/speed-test" component={SpeedTest} />
      
      {/* Utilities */}
      <Route path="/tools/email-validator" component={EmailValidator} />
      <Route path="/tools/url-shortener" component={URLShortener} />
      <Route path="/tools/website-screenshot" component={WebsiteScreenshot} />
      <Route path="/tools/file-compressor" component={FileCompressor} />
      <Route path="/tools/duplicate-finder" component={DuplicateFinder} />
      <Route path="/tools/weather-dashboard" component={WeatherDashboard} />
      
      {/* Media Tools (additional) */}
      <Route path="/tools/image-optimizer" component={ImageOptimizer} />
      <Route path="/tools/audio-converter" component={AudioConverter} />
      <Route path="/tools/ocr-text-extractor" component={OCRTextExtractor} />
      
      {/* Advanced Media Tools */}
      <Route path="/tools/video-editor" component={VideoEditor} />
      <Route path="/tools/audio-editor" component={AudioEditor} />
      <Route path="/tools/image-editor" component={ImageEditor} />
      <Route path="/tools/gif-maker" component={GifMaker} />
      <Route path="/tools/watermark-tool" component={WatermarkTool} />
      
      {/* Developer Tools (additional) */}
      <Route path="/tools/css-minifier" component={CSSMinifier} />
      <Route path="/tools/html-validator" component={HtmlValidator} />
      <Route path="/tools/sql-formatter" component={SQLFormatter} />
      <Route path="/tools/xml-formatter" component={XmlFormatter} />
      <Route path="/tools/markdown-editor" component={MarkdownEditor} />
      
      {/* Content Creation */}
      <Route path="/tools/meme-generator" component={MemeGenerator} />
      <Route path="/tools/quote-generator" component={QuoteGenerator} />
      <Route path="/tools/invoice-generator" component={InvoiceGenerator} />
      <Route path="/tools/resume-builder" component={ResumeBuilder} />
      
      {/* AI & Automation */}
      <Route path="/tools/chatbot" component={Chatbot} />
      <Route path="/tools/content-summarizer" component={ContentSummarizer} />
      <Route path="/tools/keyword-extractor" component={KeywordExtractor} />
      <Route path="/tools/sentiment-analyzer" component={SentimentAnalyzer} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
