import{r as d,j as e}from"./vendor-query.js";import{L as Pe}from"./vendor-react.js";import{e as w,x as $e,L as De,S as Re}from"./index.js";import{B as A}from"./button.js";import{C as O,b as V,c as H,a as K}from"./card.js";import{L as b,I as v,T as W}from"./textarea.js";import{n as Fe,l as Ge,b as z,o as Le,d as _e,I as Ee,e as Q,h as Me,i as ce,a as ze}from"./vendor-ui.js";import{b as Ue,S as ae,a9 as se,D as re,a8 as qe,a6 as Be,an as Oe}from"./vendor-icons.js";import"./vendor-firebase.js";var U="Tabs",[Ve]=Me(U,[ce]),de=ce(),[He,Y]=Ve(U),le=d.forwardRef((s,n)=>{const{__scopeTabs:i,value:g,onValueChange:p,defaultValue:N,orientation:x="horizontal",dir:y,activationMode:j="automatic",...S}=s,t=Fe(y),[o,T]=Ge({prop:g,onChange:p,defaultProp:N??"",caller:U});return e.jsx(He,{scope:i,baseId:Le(),value:o,onValueChange:T,orientation:x,dir:t,activationMode:j,children:e.jsx(z.div,{dir:t,"data-orientation":x,...S,ref:n})})});le.displayName=U;var me="TabsList",ue=d.forwardRef((s,n)=>{const{__scopeTabs:i,loop:g=!0,...p}=s,N=Y(me,i),x=de(i);return e.jsx(_e,{asChild:!0,...x,orientation:N.orientation,dir:N.dir,loop:g,children:e.jsx(z.div,{role:"tablist","aria-orientation":N.orientation,...p,ref:n})})});ue.displayName=me;var pe="TabsTrigger",xe=d.forwardRef((s,n)=>{const{__scopeTabs:i,value:g,disabled:p=!1,...N}=s,x=Y(pe,i),y=de(i),j=be(x.baseId,g),S=ve(x.baseId,g),t=g===x.value;return e.jsx(Ee,{asChild:!0,...y,focusable:!p,active:t,children:e.jsx(z.button,{type:"button",role:"tab","aria-selected":t,"aria-controls":S,"data-state":t?"active":"inactive","data-disabled":p?"":void 0,disabled:p,id:j,...N,ref:n,onMouseDown:Q(s.onMouseDown,o=>{!p&&o.button===0&&o.ctrlKey===!1?x.onValueChange(g):o.preventDefault()}),onKeyDown:Q(s.onKeyDown,o=>{[" ","Enter"].includes(o.key)&&x.onValueChange(g)}),onFocus:Q(s.onFocus,()=>{const o=x.activationMode!=="manual";!t&&!p&&o&&x.onValueChange(g)})})})});xe.displayName=pe;var he="TabsContent",ge=d.forwardRef((s,n)=>{const{__scopeTabs:i,value:g,forceMount:p,children:N,...x}=s,y=Y(he,i),j=be(y.baseId,g),S=ve(y.baseId,g),t=g===y.value,o=d.useRef(t);return d.useEffect(()=>{const T=requestAnimationFrame(()=>o.current=!1);return()=>cancelAnimationFrame(T)},[]),e.jsx(ze,{present:p||t,children:({present:T})=>e.jsx(z.div,{"data-state":t?"active":"inactive","data-orientation":y.orientation,role:"tabpanel","aria-labelledby":j,hidden:!T,id:S,tabIndex:0,...x,ref:n,style:{...s.style,animationDuration:o.current?"0s":void 0},children:T&&N})})});ge.displayName=he;function be(s,n){return`${s}-trigger-${n}`}function ve(s,n){return`${s}-content-${n}`}var Ke=le,fe=ue,je=xe,Ne=ge;const We=Ke,ye=d.forwardRef(({className:s,...n},i)=>e.jsx(fe,{ref:i,className:w("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",s),...n}));ye.displayName=fe.displayName;const X=d.forwardRef(({className:s,...n},i)=>e.jsx(je,{ref:i,className:w("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",s),...n}));X.displayName=je.displayName;const Qe=d.forwardRef(({className:s,...n},i)=>e.jsx(Ne,{ref:i,className:w("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",s),...n}));Qe.displayName=Ne.displayName;const Te=d.forwardRef(({className:s,...n},i)=>e.jsx("div",{className:"relative w-full overflow-auto",children:e.jsx("table",{ref:i,className:w("w-full caption-bottom text-sm",s),...n})}));Te.displayName="Table";const we=d.forwardRef(({className:s,...n},i)=>e.jsx("thead",{ref:i,className:w("[&_tr]:border-b",s),...n}));we.displayName="TableHeader";const Ce=d.forwardRef(({className:s,...n},i)=>e.jsx("tbody",{ref:i,className:w("[&_tr:last-child]:border-0",s),...n}));Ce.displayName="TableBody";const Se=d.forwardRef(({className:s,...n},i)=>e.jsx("tfoot",{ref:i,className:w("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",s),...n}));Se.displayName="TableFooter";const P=d.forwardRef(({className:s,...n},i)=>e.jsx("tr",{ref:i,className:w("border-b transition-colors data-[state=selected]:bg-muted hover:bg-muted/50",s),...n}));P.displayName="TableRow";const C=d.forwardRef(({className:s,...n},i)=>e.jsx("th",{ref:i,className:w("h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",s),...n}));C.displayName="TableHead";const h=d.forwardRef(({className:s,...n},i)=>e.jsx("td",{ref:i,className:w("p-4 align-middle [&:has([role=checkbox])]:pr-0",s),...n}));h.displayName="TableCell";const Ze=d.forwardRef(({className:s,...n},i)=>e.jsx("caption",{ref:i,className:w("mt-4 text-sm text-muted-foreground",s),...n}));Ze.displayName="TableCaption";const ne=new Date().toISOString().slice(0,10),ie=s=>{const n=s==="tax"?"TAX":"PRO",i=new Date().toISOString().slice(0,10).replace(/-/g,"");return`${n}-${i}-${String(Date.now()).slice(-4)}`},oe=()=>({id:crypto.randomUUID(),productId:"",description:"",sku:"",quantity:1,unitPrice:0,taxRate:18}),Xe=100,Ye=30,f=(s,n)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:n,maximumFractionDigits:2}).format(Number.isFinite(s)?s:0),u=s=>s.replace(/[&<>"']/g,n=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[n]||n),$=s=>s.quantity*s.unitPrice,M=s=>s.taxRate>0?$(s)/(1+s.taxRate/100):$(s),Z=s=>$(s)-M(s);function ct(){const[s,n]=d.useState("proforma"),[i,g]=d.useState([]),[p,N]=d.useState(""),[x,y]=d.useState(!1),[j,S]=d.useState([oe()]),[t,o]=d.useState({invoiceNumber:ie("proforma"),invoiceDate:ne,dueDate:ne,sellerName:"Luxtronics",sellerAddress:"Luxtronics Online Store",sellerTaxId:"",bankAccountName:"",bankAccountNumber:"",bankIfsc:"",customerCompanyName:"",customerName:"",customerAddress:"",customerTaxId:"",currency:"INR",notes:"Thank you for choosing Luxtronics."}),{toast:T}=$e(),D=d.useRef(0),G=d.useCallback(async({search:a="",fetchAll:m=!1}={})=>{const r=D.current+1;D.current=r,y(!0);try{const c=[];let l=1,k=1;const L=m?Xe:Ye,_=a.trim();do{const F=new URLSearchParams({per_page:String(L),page:String(l),status:"publish",orderby:"title",order:"asc"});_&&F.set("search",_);const B=await fetch(`/api/woo/products?${F.toString()}`),E=await B.json();if(!B.ok||E.success===!1)throw new Error(E.error||"Product fetch failed");const te=Array.isArray(E)?E:[];c.push(...te),k=Math.max(1,Number(B.headers.get("X-WP-TotalPages")||(te.length===L?l+1:l))),l+=1}while(m&&l<=k);const q=[...new Map(c.map(F=>[F.id,F])).values()];if(r!==D.current)return;g(q)}catch(c){if(r!==D.current)return;g([]),T({title:"Products unavailable",description:c instanceof Error?c.message:"Could not search WooCommerce products.",variant:"destructive"})}finally{r===D.current&&y(!1)}},[T]);d.useEffect(()=>{const a=window.setTimeout(()=>{G({search:p,fetchAll:!1})},p.trim()?350:0);return()=>window.clearTimeout(a)},[G,p]);const I=d.useMemo(()=>{const a=j.reduce((c,l)=>c+M(l),0),m=j.reduce((c,l)=>c+Z(l),0),r=j.reduce((c,l)=>c+$(l),0);return{taxable:a,tax:m,grandTotal:r}},[j]),J=d.useMemo(()=>{const a=p.trim().toLowerCase();return a?i.filter(m=>[m.name,m.sku,m.price].filter(Boolean).some(r=>String(r).toLowerCase().includes(a))):i},[p,i]),R=(a,m)=>{S(r=>r.map(c=>c.id===a?{...c,...m}:c))},Ie=(a,m)=>{const r=i.find(c=>String(c.id)===m);R(a,{productId:m,description:(r==null?void 0:r.name)||"",sku:(r==null?void 0:r.sku)||"",unitPrice:Number((r==null?void 0:r.price)||(r==null?void 0:r.regular_price)||0)})},ke=a=>{const m=a;n(m),o(r=>({...r,invoiceNumber:ie(m)}))},Ae=()=>{const a=s==="tax"?"Tax Invoice":"Proforma Invoice",m=s==="tax"?"/paid-letter-rubber-stamp-template_29794-1263.avif":"/unpaid-rubber-stamp-260nw-1203367513.webp",r=s==="tax"?"Paid stamp":"Unpaid stamp",c=j.map((l,k)=>{const L=$(l),_=M(l),q=Z(l);return`
        <tr>
          <td>${k+1}</td>
          <td>
            <strong>${u(l.description||"Custom item")}</strong>
            ${l.sku?`<br><span>SKU: ${u(l.sku)}</span>`:""}
          </td>
          <td>${l.quantity}</td>
          <td>${f(l.unitPrice,t.currency)}</td>
          <td>${f(_,t.currency)}</td><td>${l.taxRate}%</td><td>${f(q,t.currency)}</td>
          <td>${f(L,t.currency)}</td>
        </tr>
      `}).join("");return`
      <!doctype html>
      <html>
        <head>
          <title>${u(a)} ${u(t.invoiceNumber)}</title>
          <style>
            @page { margin: 10mm; size: A4; }
            * { box-sizing: border-box; }
            body { color: #111827; font-family: Arial, sans-serif; font-size: 11px; margin: 0; }
            .letterhead { align-items: center; display: flex; justify-content: space-between; gap: 18px; padding-bottom: 10px; }
            .brand { align-items: center; display: flex; gap: 14px; }
            .logo-box { align-items: center; border: 1px solid #e5e7eb; border-radius: 12px; display: flex; height: 58px; justify-content: center; overflow: hidden; padding: 5px; width: 58px; }
            .brand img { display: block; height: 100%; object-fit: contain; width: 100%; }
            .brand-name { font-size: 22px; font-weight: 800; letter-spacing: 0.06em; margin: 0; text-transform: uppercase; }
            .letterhead-details { max-width: 300px; text-align: right; }
            .invoice-banner { align-items: center; background: #111827; border-radius: 10px; color: #ffffff; display: flex; justify-content: space-between; gap: 18px; margin-top: 10px; padding: 12px 16px; }
            .invoice-banner h1 { color: #ffffff; font-size: 23px; letter-spacing: 0.06em; margin: 0; text-transform: uppercase; }
            .invoice-banner p { color: #d1d5db; margin: 3px 0 0; }
            .invoice-stamp { align-items: center; background: rgba(255,255,255,0.96); border: 1px solid #e5e7eb; border-radius: 10px; display: flex; height: 78px; justify-content: center; overflow: hidden; padding: 0; transform: rotate(-8deg); width: 142px; }
            .invoice-stamp img { display: block; height: 108px; object-fit: cover; object-position: center 38%; width: 154px; }
            .invoice-stamp.unpaid img { height: 118px; object-position: center 22%; transform: translateY(-8px); }
            .invoice-stamp.paid img { height: 96px; object-fit: contain; width: 132px; }
            .invoice-meta { min-width: 220px; text-align: right; }
            .invoice-meta strong { color: #ffffff; display: block; font-size: 15px; }
            .top { align-items: flex-start; display: flex; justify-content: space-between; gap: 24px; margin-top: 12px; }
            h1 { font-size: 24px; margin: 0 0 6px; text-transform: uppercase; }
            h2 { font-size: 13px; margin: 0 0 5px; text-transform: uppercase; }
            p { line-height: 1.35; margin: 3px 0; white-space: pre-line; }
            .muted { color: #6b7280; font-size: 10px; }
            .notice { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 7px; color: #065f46; font-size: 10px; margin-top: 8px; padding: 7px 9px; }
            .panel { border: 1px solid #d1d5db; border-radius: 8px; margin-top: 10px; padding: 10px; break-inside: avoid; }
            .grid { display: grid; gap: 10px; grid-template-columns: 1fr 1fr; }
            table { border-collapse: collapse; margin-top: 10px; width: 100%; }
            th, td { border-bottom: 1px solid #e5e7eb; font-size: 10px; padding: 6px; text-align: left; vertical-align: top; }
            th { background: #f9fafb; color: #374151; text-transform: uppercase; }
            .totals { margin-left: auto; margin-top: 8px; width: 300px; break-inside: avoid; }
            .totals div { display: flex; justify-content: space-between; padding: 5px 0; }
            .grand { border-top: 2px solid #111827; font-size: 15px; font-weight: 700; }
            .footer-row { align-items: flex-end; display: flex; justify-content: flex-end; gap: 24px; margin-top: 12px; break-inside: avoid; }
            .status-block { align-items: center; display: flex; flex-direction: column; gap: 4px; }
            .status-label { color: #6b7280; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="letterhead">
            <div class="brand">
              <div class="logo-box">
                <img src="/logo.jpeg" alt="Luxtronics logo">
              </div>
              <div>
                <p class="brand-name">${u(t.sellerName||"Luxtronics")}</p>
                <p class="muted">Premium Electronics & Gadgets</p>
              </div>
            </div>
            <div class="letterhead-details">
              <p>${u(t.sellerAddress||"Luxtronics Online Store")}</p>
              ${t.sellerTaxId?`<p class="muted">Tax ID: ${u(t.sellerTaxId)}</p>`:""}
            </div>
          </div>
          <div class="invoice-banner">
            <div>
              <h1>${u(a)}</h1>
              <p>GST-inclusive pricing with tax calculation</p>
            </div>
            <div class="invoice-meta">
              <strong>${u(t.invoiceNumber)}</strong>
              <p>Date: ${u(t.invoiceDate)}</p>
              <p>Due: ${u(t.dueDate)}</p>
            </div>
          </div>
          <div class="top">
            <div>
              <h2>Invoice Details</h2>
              <p class="muted">Invoice No. ${u(t.invoiceNumber)}</p>
              <p class="muted">Date: ${u(t.invoiceDate)} · Due: ${u(t.dueDate)}</p>
            </div>
            <div class="letterhead-details">
              <h2>From</h2>
              <p><strong>${u(t.sellerName||"Luxtronics")}</strong></p>
              <p>${u(t.sellerAddress)}</p>
            </div>
          </div>
          <div class="grid panel">
            <div>
              <h2>Bill To</h2>
              ${t.customerCompanyName?`<p><strong>${u(t.customerCompanyName)}</strong></p>`:""}
              <p><strong>${u(t.customerName||"Customer")}</strong></p>
              <p>${u(t.customerAddress)}</p>
              ${t.customerTaxId?`<p class="muted">Tax ID: ${u(t.customerTaxId)}</p>`:""}
            </div>
            <div>
              <h2>Summary</h2>
              <p class="muted">${s==="tax"?"Product prices are GST inclusive. Taxable value and GST are reverse-calculated from the displayed price.":"This proforma includes GST breakup for payment reference and is not a tax demand until confirmed."}</p>
            </div>
          </div>
          <div class="notice">Prices include GST. Formula shown: taxable value = GST-inclusive amount / (1 + GST rate), GST = GST-inclusive amount - taxable value.</div>
          <table>
            <thead>
              <tr>
                <th>#</th><th>Item</th><th>Qty</th><th>Unit Price Incl. GST</th>
                <th>Taxable Value</th><th>GST</th><th>GST Amount</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>${c}</tbody>
          </table>
          <div class="totals">
            <div><span>Taxable value</span><strong>${f(I.taxable,t.currency)}</strong></div>
            <div><span>GST included in price</span><strong>${f(I.tax,t.currency)}</strong></div>
            <div class="grand"><span>Total</span><span>${f(I.grandTotal,t.currency)}</span></div>
          </div>
          ${s==="proforma"&&(t.bankAccountName||t.bankAccountNumber||t.bankIfsc)?`
            <div class="panel">
              <h2>Payment Details</h2>
              ${t.bankAccountName?`<p><strong>Account Name:</strong> ${u(t.bankAccountName)}</p>`:""}
              ${t.bankAccountNumber?`<p><strong>Account No:</strong> ${u(t.bankAccountNumber)}</p>`:""}
              ${t.bankIfsc?`<p><strong>IFSC:</strong> ${u(t.bankIfsc)}</p>`:""}
            </div>
          `:""}
          ${t.notes?`<div class="panel"><h2>Notes</h2><p>${u(t.notes)}</p></div>`:""}
          <div class="footer-row">
            <div class="status-block">
              <div class="status-label">Payment Status</div>
              <div class="invoice-stamp ${s==="tax"?"paid":"unpaid"}">
                <img src="${m}" alt="${r}">
              </div>
            </div>
          </div>
        </body>
      </html>
    `},ee=()=>{const a=j.filter(k=>k.description.trim()&&k.quantity>0);if(!t.customerName.trim()&&!t.customerCompanyName.trim()||a.length===0){T({title:"Invoice needs details",description:"Add a company or customer name and at least one product line before saving.",variant:"destructive"});return}const m=document.getElementById("invoice-print-frame");m==null||m.remove();const r=document.createElement("iframe");r.id="invoice-print-frame",r.title="Invoice PDF print frame",r.style.position="fixed",r.style.right="0",r.style.bottom="0",r.style.width="0",r.style.height="0",r.style.border="0",r.style.visibility="hidden",document.body.appendChild(r);const c=r.contentWindow,l=r.contentDocument||(c==null?void 0:c.document);if(!c||!l){r.remove(),T({title:"PDF preview failed",description:"The browser could not prepare the invoice print view.",variant:"destructive"});return}l.open(),l.write(Ae()),l.close(),window.setTimeout(()=>{c.focus(),c.print()},250)};return e.jsxs(De,{children:[e.jsx(Re,{title:"Admin Invoices",description:"Admin-only invoice generator.",canonical:"https://luxtronics.in/admin/invoices",noindex:!0,nofollow:!0}),e.jsxs("section",{className:"container py-8",children:[e.jsxs("div",{className:"mb-6 flex flex-col justify-between gap-4 border-b border-border pb-5 lg:flex-row lg:items-end",children:[e.jsxs("div",{children:[e.jsxs(Pe,{to:"/admin",className:"mb-3 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary",children:[e.jsx(Ue,{className:"h-4 w-4"}),"Back to dashboard"]}),e.jsx("p",{className:"text-xs font-black uppercase tracking-[0.24em] text-primary",children:"Admin invoice tools"}),e.jsx("h1",{className:"mt-2 font-display text-3xl font-black tracking-tight md:text-4xl",children:"Invoice Generator"}),e.jsx("p",{className:"mt-2 text-sm text-muted-foreground",children:"Create proforma and tax invoices from WooCommerce products, then save them as PDF."})]}),e.jsxs("div",{className:"flex flex-wrap gap-2",children:[e.jsxs(A,{variant:"outline",className:"gap-2",onClick:()=>G({search:p,fetchAll:!0}),disabled:x,children:[x?e.jsx(ae,{className:"h-4 w-4 animate-spin"}):e.jsx(se,{className:"h-4 w-4"}),x?"Searching products":`Products ${i.length?`(${i.length})`:""}`]}),e.jsxs(A,{className:"gap-2",onClick:ee,children:[e.jsx(re,{className:"h-4 w-4"}),"Save as PDF"]})]})]}),e.jsxs("div",{className:"grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_420px]",children:[e.jsxs("div",{className:"space-y-5",children:[e.jsxs(O,{className:"border-border/80 bg-card/90",children:[e.jsx(V,{children:e.jsxs(H,{className:"flex items-center gap-2 text-lg",children:[e.jsx(qe,{className:"h-5 w-5 text-primary"}),"Invoice Details"]})}),e.jsxs(K,{className:"space-y-4",children:[e.jsx(We,{value:s,onValueChange:ke,children:e.jsxs(ye,{children:[e.jsx(X,{value:"proforma",children:"Proforma"}),e.jsx(X,{value:"tax",children:"Tax Invoice"})]})}),e.jsxs("div",{className:"grid gap-4 md:grid-cols-3",children:[e.jsxs("div",{children:[e.jsx(b,{htmlFor:"invoiceNumber",children:"Invoice number"}),e.jsx(v,{id:"invoiceNumber",value:t.invoiceNumber,onChange:a=>o({...t,invoiceNumber:a.target.value})})]}),e.jsxs("div",{children:[e.jsx(b,{htmlFor:"invoiceDate",children:"Invoice date"}),e.jsx(v,{id:"invoiceDate",type:"date",value:t.invoiceDate,onChange:a=>o({...t,invoiceDate:a.target.value})})]}),e.jsxs("div",{children:[e.jsx(b,{htmlFor:"dueDate",children:"Due date"}),e.jsx(v,{id:"dueDate",type:"date",value:t.dueDate,onChange:a=>o({...t,dueDate:a.target.value})})]})]}),e.jsxs("div",{className:"grid gap-4 md:grid-cols-2",children:[e.jsxs("div",{children:[e.jsx(b,{htmlFor:"sellerName",children:"Seller name"}),e.jsx(v,{id:"sellerName",value:t.sellerName,onChange:a=>o({...t,sellerName:a.target.value})})]}),e.jsxs("div",{children:[e.jsx(b,{htmlFor:"sellerTaxId",children:"Seller tax ID"}),e.jsx(v,{id:"sellerTaxId",value:t.sellerTaxId,onChange:a=>o({...t,sellerTaxId:a.target.value}),placeholder:"GSTIN / ABN / NZBN"})]}),e.jsxs("div",{className:"md:col-span-2",children:[e.jsx(b,{htmlFor:"sellerAddress",children:"Seller address"}),e.jsx(W,{id:"sellerAddress",rows:3,value:t.sellerAddress,onChange:a=>o({...t,sellerAddress:a.target.value})})]}),e.jsxs("div",{children:[e.jsx(b,{htmlFor:"bankAccountName",children:"Account name"}),e.jsx(v,{id:"bankAccountName",value:t.bankAccountName,onChange:a=>o({...t,bankAccountName:a.target.value}),placeholder:"Shown on proforma only"})]}),e.jsxs("div",{children:[e.jsx(b,{htmlFor:"bankAccountNumber",children:"Account number"}),e.jsx(v,{id:"bankAccountNumber",value:t.bankAccountNumber,onChange:a=>o({...t,bankAccountNumber:a.target.value}),placeholder:"Shown on proforma only"})]}),e.jsxs("div",{children:[e.jsx(b,{htmlFor:"bankIfsc",children:"IFSC"}),e.jsx(v,{id:"bankIfsc",value:t.bankIfsc,onChange:a=>o({...t,bankIfsc:a.target.value}),placeholder:"Shown on proforma only"})]})]}),e.jsxs("div",{className:"grid gap-4 md:grid-cols-2",children:[e.jsxs("div",{children:[e.jsx(b,{htmlFor:"customerCompanyName",children:"Company name"}),e.jsx(v,{id:"customerCompanyName",value:t.customerCompanyName,onChange:a=>o({...t,customerCompanyName:a.target.value})})]}),e.jsxs("div",{children:[e.jsx(b,{htmlFor:"customerName",children:"Customer name"}),e.jsx(v,{id:"customerName",value:t.customerName,onChange:a=>o({...t,customerName:a.target.value})})]}),e.jsxs("div",{children:[e.jsx(b,{htmlFor:"customerTaxId",children:"Customer tax ID"}),e.jsx(v,{id:"customerTaxId",value:t.customerTaxId,onChange:a=>o({...t,customerTaxId:a.target.value}),placeholder:"Optional"})]}),e.jsxs("div",{className:"md:col-span-2",children:[e.jsx(b,{htmlFor:"customerAddress",children:"Customer address"}),e.jsx(W,{id:"customerAddress",rows:3,value:t.customerAddress,onChange:a=>o({...t,customerAddress:a.target.value})})]})]})]})]}),e.jsxs(O,{className:"border-border/80 bg-card/90",children:[e.jsxs(V,{className:"flex flex-row items-center justify-between gap-3",children:[e.jsxs("div",{children:[e.jsx(H,{className:"text-lg",children:"Products"}),e.jsx("p",{className:"mt-1 text-xs text-muted-foreground",children:"Product prices are GST inclusive. The invoice shows taxable value and GST calculation separately."})]}),e.jsxs(A,{size:"sm",className:"gap-2",onClick:()=>S(a=>[...a,oe()]),children:[e.jsx(Be,{className:"h-4 w-4"}),"Add line"]})]}),e.jsxs(K,{children:[e.jsxs("div",{className:"mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end",children:[e.jsxs("div",{children:[e.jsx(b,{htmlFor:"productSearch",children:"Search WooCommerce products"}),e.jsx(v,{id:"productSearch",value:p,onChange:a=>N(a.target.value),placeholder:"Type product name or SKU"})]}),e.jsxs(A,{variant:"outline",className:"gap-2",onClick:()=>G({search:p,fetchAll:!0}),disabled:x,children:[x?e.jsx(ae,{className:"h-4 w-4 animate-spin"}):e.jsx(se,{className:"h-4 w-4"}),"Fetch all matches"]})]}),e.jsxs(Te,{children:[e.jsx(we,{children:e.jsxs(P,{children:[e.jsx(C,{className:"min-w-[220px]",children:"Product"}),e.jsx(C,{className:"min-w-[180px]",children:"Description"}),e.jsx(C,{children:"Qty"}),e.jsx(C,{children:"Unit incl. GST"}),e.jsx(C,{children:"Taxable"}),e.jsx(C,{children:"GST %"}),e.jsx(C,{children:"GST"}),e.jsx(C,{className:"text-right",children:"Total"}),e.jsx(C,{})]})}),e.jsx(Ce,{children:j.map(a=>{var m;return e.jsxs(P,{children:[e.jsx(h,{children:e.jsxs("select",{value:a.productId,onChange:r=>Ie(a.id,r.target.value),className:"h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary",children:[e.jsx("option",{value:"",children:"Custom item"}),a.productId&&!J.some(r=>String(r.id)===a.productId)&&e.jsx("option",{value:a.productId,children:((m=i.find(r=>String(r.id)===a.productId))==null?void 0:m.name)||"Selected product"}),J.map(r=>e.jsx("option",{value:r.id,children:r.name},r.id))]})}),e.jsx(h,{children:e.jsx(v,{value:a.description,onChange:r=>R(a.id,{description:r.target.value}),placeholder:"Item description"})}),e.jsx(h,{children:e.jsx(v,{className:"w-20",inputMode:"numeric",value:a.quantity,onChange:r=>R(a.id,{quantity:Number(r.target.value)||0})})}),e.jsx(h,{children:e.jsx(v,{className:"w-28",inputMode:"decimal",value:a.unitPrice,onChange:r=>R(a.id,{unitPrice:Number(r.target.value)||0})})}),e.jsx(h,{className:"font-semibold",children:f(M(a),t.currency)}),e.jsx(h,{children:e.jsx(v,{className:"w-24",inputMode:"decimal",value:a.taxRate,onChange:r=>R(a.id,{taxRate:Number(r.target.value)||0})})}),e.jsx(h,{className:"font-semibold",children:f(Z(a),t.currency)}),e.jsx(h,{className:"text-right font-semibold",children:f($(a),t.currency)}),e.jsx(h,{className:"text-right",children:e.jsx(A,{variant:"ghost",size:"icon",disabled:j.length===1,onClick:()=>S(r=>r.filter(c=>c.id!==a.id)),children:e.jsx(Oe,{className:"h-4 w-4"})})})]},a.id)})}),e.jsxs(Se,{children:[e.jsxs(P,{children:[e.jsx(h,{colSpan:7,children:"Taxable value"}),e.jsx(h,{className:"text-right",children:f(I.taxable,t.currency)}),e.jsx(h,{})]}),e.jsxs(P,{children:[e.jsx(h,{colSpan:7,children:"GST included in price"}),e.jsx(h,{className:"text-right",children:f(I.tax,t.currency)}),e.jsx(h,{})]}),e.jsxs(P,{children:[e.jsx(h,{colSpan:7,children:"Grand total"}),e.jsx(h,{className:"text-right text-base font-black",children:f(I.grandTotal,t.currency)}),e.jsx(h,{})]})]})]})]})]})]}),e.jsxs(O,{className:"h-fit border-primary/20 bg-primary/5",children:[e.jsx(V,{children:e.jsx(H,{className:"text-lg",children:"Preview Summary"})}),e.jsxs(K,{className:"space-y-4",children:[e.jsxs("div",{className:"grid gap-3 sm:grid-cols-2 xl:grid-cols-1",children:[e.jsxs("div",{children:[e.jsx(b,{htmlFor:"currency",children:"Currency"}),e.jsxs("select",{id:"currency",value:t.currency,onChange:a=>o({...t,currency:a.target.value}),className:"h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary",children:[e.jsx("option",{value:"INR",children:"INR"}),e.jsx("option",{value:"AUD",children:"AUD"}),e.jsx("option",{value:"NZD",children:"NZD"}),e.jsx("option",{value:"USD",children:"USD"})]})]}),e.jsxs("div",{children:[e.jsx(b,{htmlFor:"notes",children:"Notes"}),e.jsx(W,{id:"notes",rows:4,value:t.notes,onChange:a=>o({...t,notes:a.target.value})})]})]}),e.jsxs("div",{className:"rounded-lg border border-border bg-background p-4",children:[e.jsx("p",{className:"text-xs font-black uppercase tracking-widest text-muted-foreground",children:s==="tax"?"Tax Invoice":"Proforma Invoice"}),e.jsx("h2",{className:"mt-1 break-words font-display text-2xl font-black",children:t.invoiceNumber}),e.jsx("p",{className:"mt-3 rounded-md bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300",children:"Prices include GST. Taxable value = total / (1 + GST rate); GST = total - taxable value."}),e.jsxs("div",{className:"mt-4 space-y-2 text-sm",children:[e.jsxs("div",{className:"flex justify-between gap-4",children:[e.jsx("span",{children:"Taxable value"}),e.jsx("strong",{children:f(I.taxable,t.currency)})]}),e.jsxs("div",{className:"flex justify-between gap-4",children:[e.jsx("span",{children:"GST included"}),e.jsx("strong",{children:f(I.tax,t.currency)})]}),e.jsxs("div",{className:"flex justify-between gap-4 border-t border-border pt-3 text-base",children:[e.jsx("span",{children:"Total"}),e.jsx("strong",{children:f(I.grandTotal,t.currency)})]})]})]}),e.jsxs(A,{className:"w-full gap-2",onClick:ee,children:[e.jsx(re,{className:"h-4 w-4"}),"Save as PDF"]}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"The PDF opens in the browser print dialog. Choose Save as PDF as the destination."})]})]})]})]})]})}export{ct as default};
