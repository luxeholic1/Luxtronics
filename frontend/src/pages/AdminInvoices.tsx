import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileDown, Loader2, Plus, ReceiptText, RefreshCw, Trash2 } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type InvoiceType = "proforma" | "tax";

type WooProduct = {
  id: number;
  name: string;
  price: string;
  regular_price?: string;
  sku?: string;
};

type InvoiceLine = {
  id: string;
  productId: string;
  description: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
};

type InvoiceForm = {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  sellerName: string;
  sellerAddress: string;
  sellerTaxId: string;
  customerName: string;
  customerAddress: string;
  customerTaxId: string;
  currency: string;
  notes: string;
};

const today = new Date().toISOString().slice(0, 10);

const makeInvoiceNumber = (type: InvoiceType) => {
  const prefix = type === "tax" ? "TAX" : "PRO";
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `${prefix}-${stamp}-${String(Date.now()).slice(-4)}`;
};

const makeLine = (): InvoiceLine => ({
  id: crypto.randomUUID(),
  productId: "",
  description: "",
  sku: "",
  quantity: 1,
  unitPrice: 0,
  taxRate: 18,
});

const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  }[char] || char));

const getLineSubtotal = (line: InvoiceLine) => line.quantity * line.unitPrice;
const getLineTax = (line: InvoiceLine, invoiceType: InvoiceType) =>
  invoiceType === "tax" ? getLineSubtotal(line) * (line.taxRate / 100) : 0;

export default function AdminInvoices() {
  const [invoiceType, setInvoiceType] = useState<InvoiceType>("proforma");
  const [products, setProducts] = useState<WooProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [lines, setLines] = useState<InvoiceLine[]>([makeLine()]);
  const [form, setForm] = useState<InvoiceForm>({
    invoiceNumber: makeInvoiceNumber("proforma"),
    invoiceDate: today,
    dueDate: today,
    sellerName: "Luxtronics",
    sellerAddress: "Luxtronics Online Store",
    sellerTaxId: "",
    customerName: "",
    customerAddress: "",
    customerTaxId: "",
    currency: "INR",
    notes: "Thank you for choosing Luxtronics.",
  });
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const response = await fetch("/api/woo/products?per_page=100&status=publish&orderby=title&order=asc");
      const data = await response.json();
      if (!response.ok || data.success === false) throw new Error(data.error || "Product fetch failed");
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      setProducts([]);
      toast({
        title: "Products unavailable",
        description: error instanceof Error ? error.message : "Could not load WooCommerce products.",
        variant: "destructive",
      });
    } finally {
      setLoadingProducts(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const totals = useMemo(() => {
    const subtotal = lines.reduce((sum, line) => sum + getLineSubtotal(line), 0);
    const tax = lines.reduce((sum, line) => sum + getLineTax(line, invoiceType), 0);
    return { subtotal, tax, grandTotal: subtotal + tax };
  }, [invoiceType, lines]);

  const updateLine = (lineId: string, patch: Partial<InvoiceLine>) => {
    setLines((current) => current.map((line) => line.id === lineId ? { ...line, ...patch } : line));
  };

  const selectProduct = (lineId: string, productId: string) => {
    const product = products.find((item) => String(item.id) === productId);
    updateLine(lineId, {
      productId,
      description: product?.name || "",
      sku: product?.sku || "",
      unitPrice: Number(product?.price || product?.regular_price || 0),
    });
  };

  const handleTypeChange = (value: string) => {
    const nextType = value as InvoiceType;
    setInvoiceType(nextType);
    setForm((current) => ({ ...current, invoiceNumber: makeInvoiceNumber(nextType) }));
  };

  const buildInvoiceHtml = () => {
    const title = invoiceType === "tax" ? "Tax Invoice" : "Proforma Invoice";
    const rows = lines.map((line, index) => {
      const subtotal = getLineSubtotal(line);
      const tax = getLineTax(line, invoiceType);
      return `
        <tr>
          <td>${index + 1}</td>
          <td>
            <strong>${escapeHtml(line.description || "Custom item")}</strong>
            ${line.sku ? `<br><span>SKU: ${escapeHtml(line.sku)}</span>` : ""}
          </td>
          <td>${line.quantity}</td>
          <td>${formatMoney(line.unitPrice, form.currency)}</td>
          ${invoiceType === "tax" ? `<td>${line.taxRate}%</td><td>${formatMoney(tax, form.currency)}</td>` : ""}
          <td>${formatMoney(subtotal + tax, form.currency)}</td>
        </tr>
      `;
    }).join("");

    return `
      <!doctype html>
      <html>
        <head>
          <title>${escapeHtml(title)} ${escapeHtml(form.invoiceNumber)}</title>
          <style>
            body { color: #111827; font-family: Arial, sans-serif; margin: 32px; }
            .top { align-items: flex-start; display: flex; justify-content: space-between; gap: 32px; }
            h1 { font-size: 30px; margin: 0 0 8px; text-transform: uppercase; }
            h2 { font-size: 15px; margin: 0 0 8px; text-transform: uppercase; }
            p { line-height: 1.45; margin: 4px 0; white-space: pre-line; }
            .muted { color: #6b7280; font-size: 12px; }
            .panel { border: 1px solid #d1d5db; border-radius: 8px; margin-top: 24px; padding: 16px; }
            .grid { display: grid; gap: 16px; grid-template-columns: 1fr 1fr; }
            table { border-collapse: collapse; margin-top: 24px; width: 100%; }
            th, td { border-bottom: 1px solid #e5e7eb; font-size: 12px; padding: 10px; text-align: left; vertical-align: top; }
            th { background: #f9fafb; color: #374151; text-transform: uppercase; }
            .totals { margin-left: auto; margin-top: 18px; width: 320px; }
            .totals div { display: flex; justify-content: space-between; padding: 8px 0; }
            .grand { border-top: 2px solid #111827; font-size: 18px; font-weight: 700; }
            @media print { body { margin: 18mm; } button { display: none; } }
          </style>
        </head>
        <body>
          <div class="top">
            <div>
              <h1>${escapeHtml(title)}</h1>
              <p class="muted">Invoice No. ${escapeHtml(form.invoiceNumber)}</p>
              <p class="muted">Date: ${escapeHtml(form.invoiceDate)} · Due: ${escapeHtml(form.dueDate)}</p>
            </div>
            <div>
              <h2>${escapeHtml(form.sellerName)}</h2>
              <p>${escapeHtml(form.sellerAddress)}</p>
              ${form.sellerTaxId ? `<p class="muted">Tax ID: ${escapeHtml(form.sellerTaxId)}</p>` : ""}
            </div>
          </div>
          <div class="grid panel">
            <div>
              <h2>Bill To</h2>
              <p><strong>${escapeHtml(form.customerName || "Customer")}</strong></p>
              <p>${escapeHtml(form.customerAddress)}</p>
              ${form.customerTaxId ? `<p class="muted">Tax ID: ${escapeHtml(form.customerTaxId)}</p>` : ""}
            </div>
            <div>
              <h2>Summary</h2>
              <p class="muted">${invoiceType === "tax" ? "This is a tax invoice with applicable tax shown separately." : "This is a proforma invoice and is not a tax demand until confirmed."}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th><th>Item</th><th>Qty</th><th>Unit Price</th>
                ${invoiceType === "tax" ? "<th>Tax</th><th>Tax Amount</th>" : ""}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="totals">
            <div><span>Subtotal</span><strong>${formatMoney(totals.subtotal, form.currency)}</strong></div>
            ${invoiceType === "tax" ? `<div><span>Tax</span><strong>${formatMoney(totals.tax, form.currency)}</strong></div>` : ""}
            <div class="grand"><span>Total</span><span>${formatMoney(totals.grandTotal, form.currency)}</span></div>
          </div>
          ${form.notes ? `<div class="panel"><h2>Notes</h2><p>${escapeHtml(form.notes)}</p></div>` : ""}
          <script>window.onload = () => { window.print(); };</script>
        </body>
      </html>
    `;
  };

  const saveAsPdf = () => {
    const validLines = lines.filter((line) => line.description.trim() && line.quantity > 0);
    if (!form.customerName.trim() || validLines.length === 0) {
      toast({
        title: "Invoice needs details",
        description: "Add a customer name and at least one product line before saving.",
        variant: "destructive",
      });
      return;
    }

    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=960,height=720");
    if (!printWindow) {
      toast({
        title: "Popup blocked",
        description: "Allow popups for this site, then try saving the PDF again.",
        variant: "destructive",
      });
      return;
    }
    printWindow.document.open();
    printWindow.document.write(buildInvoiceHtml());
    printWindow.document.close();
  };

  return (
    <Layout>
      <SEO title="Admin Invoices" description="Admin-only invoice generator." canonical="https://luxtronics.in/admin/invoices" noindex nofollow />

      <section className="container py-8">
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-border pb-5 lg:flex-row lg:items-end">
          <div>
            <Link to="/admin" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Admin invoice tools</p>
            <h1 className="mt-2 font-display text-3xl font-black tracking-tight md:text-4xl">Invoice Generator</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Create proforma and tax invoices from WooCommerce products, then save them as PDF.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2" onClick={fetchProducts} disabled={loadingProducts}>
              {loadingProducts ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Products
            </Button>
            <Button className="gap-2" onClick={saveAsPdf}>
              <FileDown className="h-4 w-4" />
              Save as PDF
            </Button>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_420px]">
          <div className="space-y-5">
            <Card className="border-border/80 bg-card/90">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ReceiptText className="h-5 w-5 text-primary" />
                  Invoice Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={invoiceType} onValueChange={handleTypeChange}>
                  <TabsList>
                    <TabsTrigger value="proforma">Proforma</TabsTrigger>
                    <TabsTrigger value="tax">Tax Invoice</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="invoiceNumber">Invoice number</Label>
                    <Input id="invoiceNumber" value={form.invoiceNumber} onChange={(event) => setForm({ ...form, invoiceNumber: event.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="invoiceDate">Invoice date</Label>
                    <Input id="invoiceDate" type="date" value={form.invoiceDate} onChange={(event) => setForm({ ...form, invoiceDate: event.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due date</Label>
                    <Input id="dueDate" type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="sellerName">Seller name</Label>
                    <Input id="sellerName" value={form.sellerName} onChange={(event) => setForm({ ...form, sellerName: event.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="sellerTaxId">Seller tax ID</Label>
                    <Input id="sellerTaxId" value={form.sellerTaxId} onChange={(event) => setForm({ ...form, sellerTaxId: event.target.value })} placeholder="GSTIN / ABN / NZBN" />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="sellerAddress">Seller address</Label>
                    <Textarea id="sellerAddress" rows={3} value={form.sellerAddress} onChange={(event) => setForm({ ...form, sellerAddress: event.target.value })} />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="customerName">Customer name</Label>
                    <Input id="customerName" value={form.customerName} onChange={(event) => setForm({ ...form, customerName: event.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="customerTaxId">Customer tax ID</Label>
                    <Input id="customerTaxId" value={form.customerTaxId} onChange={(event) => setForm({ ...form, customerTaxId: event.target.value })} placeholder="Optional" />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="customerAddress">Customer address</Label>
                    <Textarea id="customerAddress" rows={3} value={form.customerAddress} onChange={(event) => setForm({ ...form, customerAddress: event.target.value })} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-card/90">
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <CardTitle className="text-lg">Products</CardTitle>
                <Button size="sm" className="gap-2" onClick={() => setLines((current) => [...current, makeLine()])}>
                  <Plus className="h-4 w-4" />
                  Add line
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[220px]">Product</TableHead>
                      <TableHead className="min-w-[180px]">Description</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit</TableHead>
                      {invoiceType === "tax" && <TableHead>Tax %</TableHead>}
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell>
                          <select
                            value={line.productId}
                            onChange={(event) => selectProduct(line.id, event.target.value)}
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
                          >
                            <option value="">Custom item</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>{product.name}</option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell>
                          <Input value={line.description} onChange={(event) => updateLine(line.id, { description: event.target.value })} placeholder="Item description" />
                        </TableCell>
                        <TableCell>
                          <Input className="w-20" inputMode="numeric" value={line.quantity} onChange={(event) => updateLine(line.id, { quantity: Number(event.target.value) || 0 })} />
                        </TableCell>
                        <TableCell>
                          <Input className="w-28" inputMode="decimal" value={line.unitPrice} onChange={(event) => updateLine(line.id, { unitPrice: Number(event.target.value) || 0 })} />
                        </TableCell>
                        {invoiceType === "tax" && (
                          <TableCell>
                            <Input className="w-24" inputMode="decimal" value={line.taxRate} onChange={(event) => updateLine(line.id, { taxRate: Number(event.target.value) || 0 })} />
                          </TableCell>
                        )}
                        <TableCell className="text-right font-semibold">
                          {formatMoney(getLineSubtotal(line) + getLineTax(line, invoiceType), form.currency)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={lines.length === 1}
                            onClick={() => setLines((current) => current.filter((item) => item.id !== line.id))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={invoiceType === "tax" ? 5 : 4}>Subtotal</TableCell>
                      <TableCell className="text-right">{formatMoney(totals.subtotal, form.currency)}</TableCell>
                      <TableCell />
                    </TableRow>
                    {invoiceType === "tax" && (
                      <TableRow>
                        <TableCell colSpan={5}>Tax</TableCell>
                        <TableCell className="text-right">{formatMoney(totals.tax, form.currency)}</TableCell>
                        <TableCell />
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell colSpan={invoiceType === "tax" ? 5 : 4}>Grand total</TableCell>
                      <TableCell className="text-right text-base font-black">{formatMoney(totals.grandTotal, form.currency)}</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>
          </div>

          <Card className="h-fit border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Preview Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    value={form.currency}
                    onChange={(event) => setForm({ ...form, currency: event.target.value })}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
                  >
                    <option value="INR">INR</option>
                    <option value="AUD">AUD</option>
                    <option value="NZD">NZD</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" rows={4} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  {invoiceType === "tax" ? "Tax Invoice" : "Proforma Invoice"}
                </p>
                <h2 className="mt-1 break-words font-display text-2xl font-black">{form.invoiceNumber}</h2>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-4"><span>Subtotal</span><strong>{formatMoney(totals.subtotal, form.currency)}</strong></div>
                  {invoiceType === "tax" && <div className="flex justify-between gap-4"><span>Tax</span><strong>{formatMoney(totals.tax, form.currency)}</strong></div>}
                  <div className="flex justify-between gap-4 border-t border-border pt-3 text-base"><span>Total</span><strong>{formatMoney(totals.grandTotal, form.currency)}</strong></div>
                </div>
              </div>

              <Button className="w-full gap-2" onClick={saveAsPdf}>
                <FileDown className="h-4 w-4" />
                Save as PDF
              </Button>
              <p className="text-xs text-muted-foreground">
                The PDF opens in the browser print dialog. Choose Save as PDF as the destination.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
