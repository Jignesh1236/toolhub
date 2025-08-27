import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, Printer } from "lucide-react";

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  fromCompany: string;
  fromAddress: string;
  fromEmail: string;
  fromPhone: string;
  toCompany: string;
  toAddress: string;
  toEmail: string;
  items: InvoiceItem[];
  notes: string;
  currency: string;
  taxRate: number;
}

export default function InvoiceGenerator() {
  const [invoice, setInvoice] = useState<InvoiceData>({
    invoiceNumber: `INV-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fromCompany: "",
    fromAddress: "",
    fromEmail: "",
    fromPhone: "",
    toCompany: "",
    toAddress: "",
    toEmail: "",
    items: [{ description: "", quantity: 1, rate: 0, amount: 0 }],
    notes: "",
    currency: "USD",
    taxRate: 0,
  });

  const { toast } = useToast();

  const addItem = () => {
    setInvoice({
      ...invoice,
      items: [...invoice.items, { description: "", quantity: 1, rate: 0, amount: 0 }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = invoice.items.filter((_, i) => i !== index);
    setInvoice({ ...invoice, items: newItems });
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...invoice.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Calculate amount
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    
    setInvoice({ ...invoice, items: newItems });
  };

  const calculateSubtotal = () => {
    return invoice.items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * invoice.taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const generatePDF = async () => {
    try {
      const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
      
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4 size
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      let yPosition = 800;
      const leftMargin = 50;
      const rightMargin = 545;
      
      // Header
      page.drawText('INVOICE', {
        x: leftMargin,
        y: yPosition,
        size: 24,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2)
      });
      
      page.drawText(`#${invoice.invoiceNumber}`, {
        x: rightMargin - 100,
        y: yPosition,
        size: 16,
        font: boldFont,
        color: rgb(0.5, 0.5, 0.5)
      });
      
      yPosition -= 40;
      
      // From section
      page.drawText('FROM:', {
        x: leftMargin,
        y: yPosition,
        size: 12,
        font: boldFont
      });
      
      yPosition -= 20;
      
      const fromInfo = [
        invoice.fromCompany,
        invoice.fromAddress,
        invoice.fromEmail,
        invoice.fromPhone
      ].filter(info => info.trim());
      
      fromInfo.forEach(info => {
        page.drawText(info, {
          x: leftMargin,
          y: yPosition,
          size: 10,
          font
        });
        yPosition -= 15;
      });
      
      yPosition -= 10;
      
      // To section
      page.drawText('TO:', {
        x: leftMargin,
        y: yPosition,
        size: 12,
        font: boldFont
      });
      
      yPosition -= 20;
      
      const toInfo = [
        invoice.toCompany,
        invoice.toAddress,
        invoice.toEmail
      ].filter(info => info.trim());
      
      toInfo.forEach(info => {
        page.drawText(info, {
          x: leftMargin,
          y: yPosition,
          size: 10,
          font
        });
        yPosition -= 15;
      });
      
      // Date info
      page.drawText('Date:', {
        x: rightMargin - 150,
        y: yPosition + 45,
        size: 10,
        font: boldFont
      });
      
      page.drawText(invoice.date, {
        x: rightMargin - 100,
        y: yPosition + 45,
        size: 10,
        font
      });
      
      page.drawText('Due Date:', {
        x: rightMargin - 150,
        y: yPosition + 30,
        size: 10,
        font: boldFont
      });
      
      page.drawText(invoice.dueDate, {
        x: rightMargin - 100,
        y: yPosition + 30,
        size: 10,
        font
      });
      
      yPosition -= 40;
      
      // Items table
      const tableTop = yPosition;
      const colWidths = [250, 80, 80, 100];
      const headers = ['Description', 'Qty', 'Rate', 'Amount'];
      
      // Table headers
      let xPos = leftMargin;
      headers.forEach((header, i) => {
        page.drawText(header, {
          x: xPos,
          y: yPosition,
          size: 12,
          font: boldFont
        });
        xPos += colWidths[i];
      });
      
      yPosition -= 25;
      
      // Table items
      invoice.items.forEach(item => {
        if (item.description.trim()) {
          xPos = leftMargin;
          
          page.drawText(item.description.substring(0, 30), {
            x: xPos,
            y: yPosition,
            size: 10,
            font
          });
          xPos += colWidths[0];
          
          page.drawText(item.quantity.toString(), {
            x: xPos,
            y: yPosition,
            size: 10,
            font
          });
          xPos += colWidths[1];
          
          page.drawText(`${invoice.currency} ${item.rate.toFixed(2)}`, {
            x: xPos,
            y: yPosition,
            size: 10,
            font
          });
          xPos += colWidths[2];
          
          page.drawText(`${invoice.currency} ${item.amount.toFixed(2)}`, {
            x: xPos,
            y: yPosition,
            size: 10,
            font
          });
          
          yPosition -= 20;
        }
      });
      
      yPosition -= 20;
      
      // Totals
      const subtotal = calculateSubtotal();
      const tax = calculateTax();
      const total = calculateTotal();
      
      page.drawText('Subtotal:', {
        x: rightMargin - 200,
        y: yPosition,
        size: 12,
        font: boldFont
      });
      
      page.drawText(`${invoice.currency} ${subtotal.toFixed(2)}`, {
        x: rightMargin - 100,
        y: yPosition,
        size: 12,
        font
      });
      
      if (invoice.taxRate > 0) {
        yPosition -= 20;
        page.drawText(`Tax (${invoice.taxRate}%):`, {
          x: rightMargin - 200,
          y: yPosition,
          size: 12,
          font: boldFont
        });
        
        page.drawText(`${invoice.currency} ${tax.toFixed(2)}`, {
          x: rightMargin - 100,
          y: yPosition,
          size: 12,
          font
        });
      }
      
      yPosition -= 25;
      
      page.drawText('TOTAL:', {
        x: rightMargin - 200,
        y: yPosition,
        size: 14,
        font: boldFont
      });
      
      page.drawText(`${invoice.currency} ${total.toFixed(2)}`, {
        x: rightMargin - 100,
        y: yPosition,
        size: 14,
        font: boldFont
      });
      
      // Notes
      if (invoice.notes.trim()) {
        yPosition -= 40;
        page.drawText('Notes:', {
          x: leftMargin,
          y: yPosition,
          size: 12,
          font: boldFont
        });
        
        yPosition -= 20;
        const notesLines = invoice.notes.split('\n');
        notesLines.forEach(line => {
          page.drawText(line, {
            x: leftMargin,
            y: yPosition,
            size: 10,
            font
          });
          yPosition -= 15;
        });
      }
      
      const pdfBytes = await pdfDoc.save();
      
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoice.invoiceNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Invoice Generated!",
        description: "PDF invoice has been downloaded.",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const clearInvoice = () => {
    setInvoice({
      invoiceNumber: `INV-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      fromCompany: "",
      fromAddress: "",
      fromEmail: "",
      fromPhone: "",
      toCompany: "",
      toAddress: "",
      toEmail: "",
      items: [{ description: "", quantity: 1, rate: 0, amount: 0 }],
      notes: "",
      currency: "USD",
      taxRate: 0,
    });
  };

  const loadSample = () => {
    setInvoice({
      ...invoice,
      fromCompany: "Your Company Name",
      fromAddress: "123 Business Street\nCity, State 12345",
      fromEmail: "billing@yourcompany.com",
      fromPhone: "+1 (555) 123-4567",
      toCompany: "Client Company",
      toAddress: "456 Client Avenue\nClient City, State 67890",
      toEmail: "accounts@clientcompany.com",
      items: [
        { description: "Web Development Services", quantity: 40, rate: 75, amount: 3000 },
        { description: "Domain & Hosting Setup", quantity: 1, rate: 200, amount: 200 }
      ],
      notes: "Thank you for your business!\nPayment is due within 30 days.",
      taxRate: 8.5,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Invoice Generator</h1>
          <p className="text-gray-600 dark:text-gray-400">Create professional invoices for your business</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="xl:col-span-2 space-y-6">
            {/* Invoice Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <i className="fas fa-file-invoice text-blue-500"></i>
                    Invoice Details
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadSample} data-testid="load-sample">
                      Sample
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearInvoice} data-testid="clear-invoice">
                      Clear
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={invoice.invoiceNumber}
                    onChange={(e) => setInvoice({ ...invoice, invoiceNumber: e.target.value })}
                    data-testid="invoice-number"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={invoice.date}
                    onChange={(e) => setInvoice({ ...invoice, date: e.target.value })}
                    data-testid="invoice-date"
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
                    data-testid="due-date"
                  />
                </div>
              </CardContent>
            </Card>

            {/* From/To Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>From (Your Business)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fromCompany">Company Name</Label>
                    <Input
                      id="fromCompany"
                      value={invoice.fromCompany}
                      onChange={(e) => setInvoice({ ...invoice, fromCompany: e.target.value })}
                      data-testid="from-company"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fromAddress">Address</Label>
                    <Textarea
                      id="fromAddress"
                      value={invoice.fromAddress}
                      onChange={(e) => setInvoice({ ...invoice, fromAddress: e.target.value })}
                      rows={3}
                      data-testid="from-address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fromEmail">Email</Label>
                    <Input
                      id="fromEmail"
                      type="email"
                      value={invoice.fromEmail}
                      onChange={(e) => setInvoice({ ...invoice, fromEmail: e.target.value })}
                      data-testid="from-email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fromPhone">Phone</Label>
                    <Input
                      id="fromPhone"
                      value={invoice.fromPhone}
                      onChange={(e) => setInvoice({ ...invoice, fromPhone: e.target.value })}
                      data-testid="from-phone"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>To (Client)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="toCompany">Company Name</Label>
                    <Input
                      id="toCompany"
                      value={invoice.toCompany}
                      onChange={(e) => setInvoice({ ...invoice, toCompany: e.target.value })}
                      data-testid="to-company"
                    />
                  </div>
                  <div>
                    <Label htmlFor="toAddress">Address</Label>
                    <Textarea
                      id="toAddress"
                      value={invoice.toAddress}
                      onChange={(e) => setInvoice({ ...invoice, toAddress: e.target.value })}
                      rows={3}
                      data-testid="to-address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="toEmail">Email</Label>
                    <Input
                      id="toEmail"
                      type="email"
                      value={invoice.toEmail}
                      onChange={(e) => setInvoice({ ...invoice, toEmail: e.target.value })}
                      data-testid="to-email"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Invoice Items</span>
                  <Button onClick={addItem} size="sm" data-testid="add-item">
                    <i className="fas fa-plus mr-2"></i>
                    Add Item
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoice.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        <Label>Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Item description"
                          data-testid={`item-description-${index}`}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Qty</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          data-testid={`item-quantity-${index}`}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Rate</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                          data-testid={`item-rate-${index}`}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Amount</Label>
                        <Input
                          value={`${invoice.currency} ${item.amount.toFixed(2)}`}
                          readOnly
                          className="bg-gray-50 dark:bg-gray-800"
                          data-testid={`item-amount-${index}`}
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          disabled={invoice.items.length === 1}
                          data-testid={`remove-item-${index}`}
                        >
                          <i className="fas fa-trash text-red-500"></i>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notes and Tax */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={invoice.notes}
                    onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                    placeholder="Additional notes or payment terms..."
                    rows={4}
                    data-testid="invoice-notes"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={invoice.currency} onValueChange={(value) => setInvoice({ ...invoice, currency: value })}>
                      <SelectTrigger data-testid="currency-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                        <SelectItem value="AUD">AUD (A$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      step="0.01"
                      value={invoice.taxRate}
                      onChange={(e) => setInvoice({ ...invoice, taxRate: parseFloat(e.target.value) || 0 })}
                      data-testid="tax-rate"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Preview/Summary Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-calculator text-green-500"></i>
                  Invoice Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">{invoice.currency} {calculateSubtotal().toFixed(2)}</span>
                  </div>
                  {invoice.taxRate > 0 && (
                    <div className="flex justify-between">
                      <span>Tax ({invoice.taxRate}%):</span>
                      <span className="font-medium">{invoice.currency} {calculateTax().toFixed(2)}</span>
                    </div>
                  )}
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{invoice.currency} {calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <Button onClick={generatePDF} className="w-full" data-testid="generate-pdf">
                  <i className="fas fa-file-pdf mr-2"></i>
                  Generate PDF Invoice
                </Button>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-star text-yellow-500"></i>
                  Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-check text-green-500"></i>
                    <span>Professional PDF invoices</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-check text-green-500"></i>
                    <span>Multiple currencies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-check text-green-500"></i>
                    <span>Tax calculations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-check text-green-500"></i>
                    <span>Custom notes & terms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-check text-green-500"></i>
                    <span>Instant download</span>
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