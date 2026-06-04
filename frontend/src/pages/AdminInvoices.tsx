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
  customerCompanyName: string;
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

const PRODUCTS_PER_PAGE = 100;

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

const getLineGross = (line: InvoiceLine) => line.quantity * line.unitPrice;
const getLineTaxable = (line: InvoiceLine, invoiceType: InvoiceType) =>
  invoiceType === "tax" && line.taxRate > 0
    ? getLineGross(line) / (1 + line.taxRate / 100)
    : getLineGross(line);
const getLineIncludedTax = (line: InvoiceLine, invoiceType: InvoiceType) =>
  invoiceType === "tax" ? getLineGross(line) - getLineTaxable(line, invoiceType) : 0;

export default function AdminInvoices() {
  const [invoiceType, setInvoiceType] = useState<InvoiceType>("proforma");
  const [products, setProducts] = useState<WooProduct[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [lines, setLines] = useState<InvoiceLine[]>([makeLine()]);
  const [form, setForm] = useState<InvoiceForm>({
    invoiceNumber: makeInvoiceNumber("proforma"),
    invoiceDate: today,
    dueDate: today,
    sellerName: "Luxtronics",
    sellerAddress: "Luxtronics Online Store",
    sellerTaxId: "",
    customerCompanyName: "",
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
      const allProducts: WooProduct[] = [];
      let page = 1;
      let totalPages = 1;

      do {
        const params = new URLSearchParams({
          per_page: String(PRODUCTS_PER_PAGE),
          page: String(page),
          status: "publish",
          orderby: "title",
          order: "asc",
        });
        const response = await fetch(`/api/woo/products?${params.toString()}`);
        const data = await response.json();
        if (!response.ok || data.success === false) throw new Error(data.error || "Product fetch failed");

        const pageProducts = Array.isArray(data) ? data : [];
        allProducts.push(...pageProducts);
        totalPages = Math.max(1, Number(response.headers.get("X-WP-TotalPages") || (pageProducts.length === PRODUCTS_PER_PAGE ? page + 1 : page)));
        page += 1;
      } while (page <= totalPages);

      const uniqueProducts = [...new Map(allProducts.map((product) => [product.id, product])).values()];
      setProducts(uniqueProducts);
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
    const taxable = lines.reduce((sum, line) => sum + getLineTaxable(line, invoiceType), 0);
    const tax = lines.reduce((sum, line) => sum + getLineIncludedTax(line, invoiceType), 0);
    const grandTotal = lines.reduce((sum, line) => sum + getLineGross(line), 0);
    return { taxable, tax, grandTotal };
  }, [invoiceType, lines]);

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) =>
      [product.name, product.sku, product.price]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [productSearch, products]);

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
      const gross = getLineGross(line);
      const taxable = getLineTaxable(line, invoiceType);
      const tax = getLineIncludedTax(line, invoiceType);
      return `
        <tr>
          <td>${index + 1}</td>
          <td>
            <strong>${escapeHtml(line.description || "Custom item")}</strong>
            ${line.sku ? `<br><span>SKU: ${escapeHtml(line.sku)}</span>` : ""}
          </td>
          <td>${line.quantity}</td>
          <td>${formatMoney(line.unitPrice, form.currency)}</td>
          ${invoiceType === "tax" ? `<td>${formatMoney(taxable, form.currency)}</td><td>${line.taxRate}%</td><td>${formatMoney(tax, form.currency)}</td>` : ""}
          <td>${formatMoney(gross, form.currency)}</td>
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
            .letterhead { align-items: center; border-bottom: 2px solid #111827; display: flex; justify-content: space-between; gap: 24px; padding-bottom: 16px; }
            .brand { align-items: center; display: flex; gap: 14px; }
            .brand img { border-radius: 12px; height: 64px; object-fit: cover; width: 64px; }
            .brand-name { font-size: 26px; font-weight: 800; letter-spacing: 0.06em; margin: 0; text-transform: uppercase; }
            .letterhead-details { max-width: 320px; text-align: right; }
            .top { align-items: flex-start; display: flex; justify-content: space-between; gap: 32px; margin-top: 22px; }
            h1 { font-size: 30px; margin: 0 0 8px; text-transform: uppercase; }
            h2 { font-size: 15px; margin: 0 0 8px; text-transform: uppercase; }
            p { line-height: 1.45; margin: 4px 0; white-space: pre-line; }
            .muted { color: #6b7280; font-size: 12px; }
            .notice { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; color: #065f46; font-size: 12px; margin-top: 16px; padding: 10px 12px; }
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
          <div class="letterhead">
            <div class="brand">
              <img src="/logo.jpeg" alt="Luxtronics logo">
              <div>
                <p class="brand-name">${escapeHtml(form.sellerName || "Luxtronics")}</p>
                <p class="muted">Premium Electronics & Gadgets</p>
              </div>
            </div>
            <div class="letterhead-details">
              <p>${escapeHtml(form.sellerAddress || "Luxtronics Online Store")}</p>
              ${form.sellerTaxId ? `<p class="muted">Tax ID: ${escapeHtml(form.sellerTaxId)}</p>` : ""}
            </div>
          </div>
          <div class="top">
            <div>
              <h1>${escapeHtml(title)}</h1>
              <p class="muted">Invoice No. ${escapeHtml(form.invoiceNumber)}</p>
              <p class="muted">Date: ${escapeHtml(form.invoiceDate)} · Due: ${escapeHtml(form.dueDate)}</p>
            </div>
            <div class="letterhead-details">
              <h2>From</h2>
              <p><strong>${escapeHtml(form.sellerName || "Luxtronics")}</strong></p>
              <p>${escapeHtml(form.sellerAddress)}</p>
            </div>
          </div>
          <div class="grid panel">
            <div>
              <h2>Bill To</h2>
              ${form.customerCompanyName ? `<p><strong>${escapeHtml(form.customerCompanyName)}</strong></p>` : ""}
              <p><strong>${escapeHtml(form.customerName || "Customer")}</strong></p>
              <p>${escapeHtml(form.customerAddress)}</p>
              ${form.customerTaxId ? `<p class="muted">Tax ID: ${escapeHtml(form.customerTaxId)}</p>` : ""}
            </div>
            <div>
              <h2>Summary</h2>
              <p class="muted">${invoiceType === "tax" ? "Product prices are GST inclusive. Taxable value and GST are reverse-calculated from the displayed price." : "This is a proforma invoice and is not a tax demand until confirmed."}</p>
            </div>
          </div>
          ${invoiceType === "tax" ? `<div class="notice">Prices include GST. Formula shown: taxable value = GST-inclusive amount / (1 + GST rate), GST = GST-inclusive amount - taxable value.</div>` : ""}
          <table>
            <thead>
              <tr>
                <th>#</th><th>Item</th><th>Qty</th><th>Unit Price Incl. GST</th>
                ${invoiceType === "tax" ? "<th>Taxable Value</th><th>GST</th><th>GST Amount</th>" : ""}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="totals">
            <div><span>${invoiceType === "tax" ? "Taxable value" : "Subtotal"}</span><strong>${formatMoney(totals.taxable, form.currency)}</strong></div>
            ${invoiceType === "tax" ? `<div><span>GST included in price</span><strong>${formatMoney(totals.tax, form.currency)}</strong></div>` : ""}
            <div class="grand"><span>Total</span><span>${formatMoney(totals.grandTotal, form.currency)}</span></div>
          </div>
          ${form.notes ? `<div class="panel"><h2>Notes</h2><p>${escapeHtml(form.notes)}</p></div>` : ""}
        </body>
      </html>
    `;
  };

  const saveAsPdf = () => {
    const validLines = lines.filter((line) => line.description.trim() && line.quantity > 0);
    if ((!form.customerName.trim() && !form.customerCompanyName.trim()) || validLines.length === 0) {
      toast({
        title: "Invoice needs details",
        description: "Add a company or customer name and at least one product line before saving.",
        variant: "destructive",
      });
      return;
    }

    const previousFrame = document.getElementById("invoice-print-frame");
    previousFrame?.remove();

    const frame = document.createElement("iframe");
    frame.id = "invoice-print-frame";
    frame.title = "Invoice PDF print frame";
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "0";
    frame.style.height = "0";
    frame.style.border = "0";
    frame.style.visibility = "hidden";
    document.body.appendChild(frame);

    const frameWindow = frame.contentWindow;
    const frameDocument = frame.contentDocument || frameWindow?.document;
    if (!frameWindow || !frameDocument) {
      frame.remove();
      toast({
        title: "PDF preview failed",
        description: "The browser could not prepare the invoice print view.",
        variant: "destructive",
      });
      return;
    }

    frameDocument.open();
    frameDocument.write(buildInvoiceHtml());
    frameDocument.close();

    window.setTimeout(() => {
      frameWindow.focus();
      frameWindow.print();
    }, 250);
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
              {loadingProducts ? "Loading products" : `Products ${products.length ? `(${products.length})` : ""}`}
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
                    <Label htmlFor="customerCompanyName">Company name</Label>
                    <Input id="customerCompanyName" value={form.customerCompanyName} onChange={(event) => setForm({ ...form, customerCompanyName: event.target.value })} />
                  </div>
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
                <div>
                  <CardTitle className="text-lg">Products</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Product prices are GST inclusive. The invoice shows taxable value and GST calculation separately.
                  </p>
                </div>
                <Button size="sm" className="gap-2" onClick={() => setLines((current) => [...current, makeLine()])}>
                  <Plus className="h-4 w-4" />
                  Add line
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                  <div>
                    <Label htmlFor="productSearch">Search products</Label>
                    <Input
                      id="productSearch"
                      value={productSearch}
                      onChange={(event) => setProductSearch(event.target.value)}
                      placeholder="Search all fetched products by name, SKU, or price"
                    />
                  </div>
                  <Button variant="outline" className="gap-2" onClick={fetchProducts} disabled={loadingProducts}>
                    {loadingProducts ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    Fetch all
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[220px]">Product</TableHead>
                      <TableHead className="min-w-[180px]">Description</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit incl. GST</TableHead>
                      {invoiceType === "tax" && <TableHead>Taxable</TableHead>}
                      {invoiceType === "tax" && <TableHead>GST %</TableHead>}
                      {invoiceType === "tax" && <TableHead>GST</TableHead>}
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
                            {line.productId && !filteredProducts.some((product) => String(product.id) === line.productId) && (
                              <option value={line.productId}>
                                {products.find((product) => String(product.id) === line.productId)?.name || "Selected product"}
                              </option>
                            )}
                            {filteredProducts.map((product) => (
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
                          <TableCell className="font-semibold">
                            {formatMoney(getLineTaxable(line, invoiceType), form.currency)}
                          </TableCell>
                        )}
                        {invoiceType === "tax" && (
                          <TableCell>
                            <Input className="w-24" inputMode="decimal" value={line.taxRate} onChange={(event) => updateLine(line.id, { taxRate: Number(event.target.value) || 0 })} />
                          </TableCell>
                        )}
                        {invoiceType === "tax" && (
                          <TableCell className="font-semibold">
                            {formatMoney(getLineIncludedTax(line, invoiceType), form.currency)}
                          </TableCell>
                        )}
                        <TableCell className="text-right font-semibold">
                          {formatMoney(getLineGross(line), form.currency)}
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
                      <TableCell colSpan={invoiceType === "tax" ? 7 : 4}>{invoiceType === "tax" ? "Taxable value" : "Subtotal"}</TableCell>
                      <TableCell className="text-right">{formatMoney(totals.taxable, form.currency)}</TableCell>
                      <TableCell />
                    </TableRow>
                    {invoiceType === "tax" && (
                      <TableRow>
                        <TableCell colSpan={7}>GST included in price</TableCell>
                        <TableCell className="text-right">{formatMoney(totals.tax, form.currency)}</TableCell>
                        <TableCell />
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell colSpan={invoiceType === "tax" ? 7 : 4}>Grand total</TableCell>
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
                {invoiceType === "tax" && (
                  <p className="mt-3 rounded-md bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    Prices include GST. Taxable value = total / (1 + GST rate); GST = total - taxable value.
                  </p>
                )}
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span>{invoiceType === "tax" ? "Taxable value" : "Subtotal"}</span>
                    <strong>{formatMoney(totals.taxable, form.currency)}</strong>
                  </div>
                  {invoiceType === "tax" && <div className="flex justify-between gap-4"><span>GST included</span><strong>{formatMoney(totals.tax, form.currency)}</strong></div>}
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
