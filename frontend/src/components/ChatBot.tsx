import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, ChevronDown, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchSearchSuggestions } from "@/services/store-api";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "bot" | "user";
  text: string;
  time: Date;
  quickReplies?: string[];
  products?: ProductResult[];
  link?: { label: string; to: string };
}

interface ProductResult {
  id: string;
  name: string;
  image: string;
  price: number;
  slug: string;
  category: string;
}

// ─── Knowledge Base ───────────────────────────────────────────────────────────

const KB: Array<{
  patterns: RegExp[];
  response: string;
  quickReplies?: string[];
  link?: { label: string; to: string };
}> = [
  // Greetings
  {
    patterns: [/^(hi|hello|hey|hii|helo|namaste|sup|yo|good morning|good evening|good afternoon)\b/i],
    response: "Hey! 👋 Welcome to Luxtronics. I'm your shopping assistant. How can I help you today?",
    quickReplies: ["Browse products", "Track my order", "Shipping info", "Return policy"],
  },

  // Shipping
  {
    patterns: [/ship|deliver|delivery|dispatch|courier|how long|when.*arrive|arrival/i],
    response:
      "🚚 **Shipping Info:**\n\n• India: 3-7 business days.\n• Australia & New Zealand: 3-5 working days after dispatch.\n• Shipping charges are shown at checkout.\n• Tracking details are shared once the order is dispatched.",
    quickReplies: ["Return policy", "Track my order", "Contact support"],
    link: { label: "Full Shipping Details", to: "/shipping-returns" },
  },

  // Returns & Refunds
  {
    patterns: [/return|refund|exchange|replace|money back|cancel.*order|damaged|broken/i],
    response:
      "↩️ **Return & Refund Policy:**\n\n• Return eligibility depends on product type, condition, and applicable policy.\n• Items generally need original packaging, accessories, and proof of purchase.\n• Refund timelines depend on inspection and payment-provider processing.\n• Damaged or defective cases are reviewed by support.\n\nTo start a request, contact us via WhatsApp or email.",
    quickReplies: ["Contact support", "Shipping info", "Coverage info"],
    link: { label: "Full Return Policy", to: "/return-exchange" },
  },

  // Coverage
  {
    patterns: [/coverage|support.*request|guarantee|quality|authentic|original|genuine/i],
    response:
      "🛡️ **Coverage & Quality:**\n\n• Product coverage varies by item, supplier, and brand terms.\n• We curate products from selected suppliers.\n• Eligible support cases are reviewed with proof of purchase.\n• Brand coverage, where applicable, follows the brand's own terms.\n\nFor coverage questions, reach out to our support team.",
    quickReplies: ["Return policy", "Contact support", "Browse products"],
  },

  // Payment
  {
    patterns: [/pay|payment|cod|cash on delivery|upi|card|emi|credit|debit|razorpay|stripe|wallet/i],
    response:
      "💳 **Payment Options:**\n\n• Credit / Debit Cards (Visa, Mastercard, Amex)\n• UPI (GPay, PhonePe, Paytm) — India only\n• Net Banking\n• EMI may be available on eligible orders\n• Cash on Delivery — select pin codes\n• PayPal — Australia & New Zealand\n\nPayments are processed through encrypted payment partners.",
    quickReplies: ["Shipping info", "Return policy", "Browse products"],
  },

  // Order tracking
  {
    patterns: [/track|order status|where.*order|my order|order.*number/i],
    response:
      "📦 **Track Your Order:**\n\nYou can track your order from your account dashboard. You'll also receive a tracking link via email/SMS once your order is dispatched.\n\nIf you need help, share your order number and we'll look it up for you!",
    quickReplies: ["Go to my account", "Contact support"],
    link: { label: "My Orders", to: "/account/orders" },
  },

  // Contact
  {
    patterns: [/contact|support|help|email|phone|call|reach|talk.*human|agent|customer.*care/i],
    response:
      "📞 **Contact Us:**\n\n• **Email:** support@luxtronics.in\n• **WhatsApp:** Available via the green button (bottom right)\n• **Hours:** Mon–Sat, 9 AM – 7 PM IST\n\nWe typically respond within 2–4 hours.",
    quickReplies: ["Return policy", "Shipping info", "Browse products"],
    link: { label: "Contact Page", to: "/contact" },
  },

  // Discount / Coupon
  {
    patterns: [/discount|coupon|promo|offer|deal|sale|code|voucher|cashback/i],
    response:
      "🎁 **Catalog Updates:**\n\n• Subscribe to our newsletter for new drops and early catalog updates.\n• Follow us on Instagram for product alerts.\n• Check the **Shop** page for current catalog picks and sale items when available.",
    quickReplies: ["Browse sale products", "Newsletter signup", "Browse products"],
    link: { label: "Shop Deals", to: "/shop" },
  },

  // Categories
  {
    patterns: [/categor|type.*product|what.*sell|product.*type|kind.*product/i],
    response:
      "🛍️ **Our Categories:**\n\n• 📱 Smartphones & Accessories\n• 💻 Laptops & Computers\n• 🎧 Audio (Headphones, Earbuds, Speakers)\n• ⌚ Smartwatches & Wearables\n• 📷 Cameras & Photography\n• 🎮 Gaming Accessories\n• 🔌 Cables & Chargers\n• 🏠 Smart Home Devices",
    quickReplies: ["Browse all categories", "Search a product", "Browse products"],
    link: { label: "All Categories", to: "/categories" },
  },

  // About
  {
    patterns: [/about|who.*you|company|brand|luxtronics|founded|story/i],
    response:
      "⚡ **About Luxtronics:**\n\nLuxtronics is a premium electronics store serving India, Australia, and New Zealand. We curate tech products for creators, professionals, and enthusiasts.\n\n• Curated product catalog\n• Regional stores for 3 markets\n• Support for eligible product and order requests",
    quickReplies: ["Browse products", "Contact us", "Shipping info"],
    link: { label: "About Us", to: "/about" },
  },

  // FAQ
  {
    patterns: [/faq|frequent|common.*question|question/i],
    response: "📋 Check out our FAQ page for answers to the most common questions!",
    quickReplies: ["Shipping info", "Return policy", "Contact support"],
    link: { label: "View FAQ", to: "/faq" },
  },

  // Bye
  {
    patterns: [/bye|goodbye|see you|thanks|thank you|thx|ok thanks|that.*all|no.*thanks/i],
    response: "Thanks for chatting! 😊 Happy shopping at Luxtronics. Feel free to come back anytime!",
    quickReplies: ["Browse products", "Contact support"],
  },
];

// ─── Bot Logic ────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2);
}

function botReply(input: string): Omit<Message, "id" | "time" | "role"> | null {
  const trimmed = input.trim().toLowerCase();

  for (const entry of KB) {
    if (entry.patterns.some((p) => p.test(trimmed))) {
      return {
        text: entry.response,
        quickReplies: entry.quickReplies,
        link: entry.link,
      };
    }
  }
  return null;
}

const WELCOME: Message = {
  id: "welcome",
  role: "bot",
  text: "Hi there! 👋 I'm the Luxtronics assistant. Ask me anything about products, shipping, returns, payments, or just search for a product!",
  time: new Date(),
  quickReplies: ["Shipping info", "Return policy", "Payment options", "About Luxtronics"],
};

// ─── Markdown-lite renderer ───────────────────────────────────────────────────

function renderText(text: string) {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    // Line breaks
    return part.split("\n").map((line, j, arr) => (
      <span key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </span>
    ));
  });
}

// ─── ChatBot Component ────────────────────────────────────────────────────────

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { addItem } = useCart();

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  const addMessage = (msg: Omit<Message, "id" | "time">) => {
    const full: Message = { ...msg, id: uid(), time: new Date() };
    setMessages((prev) => [...prev, full]);
    if (!open && msg.role === "bot") setUnread((n) => n + 1);
  };

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setInput("");
    addMessage({ role: "user", text: trimmed });
    setTyping(true);

    // Simulate thinking delay
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));

    // Check KB first
    const kb = botReply(trimmed);
    if (kb) {
      setTyping(false);
      addMessage({ role: "bot", ...kb });
      return;
    }

    // Product search fallback
    const searchTerms = trimmed.replace(/find|search|show|looking for|want|need|buy|get/gi, "").trim();
    if (searchTerms.length >= 2) {
      try {
        const results = await fetchSearchSuggestions(searchTerms);
        setTyping(false);
        if (results.length > 0) {
          addMessage({
            role: "bot",
            text: `Found ${results.length} product${results.length > 1 ? "s" : ""} matching **"${searchTerms}"**:`,
            products: results.slice(0, 3).map((p) => ({
              id: p.id,
              name: p.name,
              image: p.image,
              price: p.price,
              slug: p.slug,
              category: p.category,
            })),
            quickReplies: ["See all results", "Search something else", "Shipping info"],
            link: { label: `See all results for "${searchTerms}"`, to: `/shop?q=${encodeURIComponent(searchTerms)}` },
          });
        } else {
          addMessage({
            role: "bot",
            text: `I couldn't find products matching **"${searchTerms}"**. Try a different keyword or browse our categories.`,
            quickReplies: ["Browse categories", "Browse products", "Contact support"],
            link: { label: "Browse All Products", to: "/shop" },
          });
        }
      } catch {
        setTyping(false);
        addMessage({
          role: "bot",
          text: "Sorry, I had trouble searching right now. Please try browsing the shop directly.",
          quickReplies: ["Browse products", "Contact support"],
          link: { label: "Go to Shop", to: "/shop" },
        });
      }
      return;
    }

    setTyping(false);
    addMessage({
      role: "bot",
      text: "I'm not sure about that. Here are some things I can help with:",
      quickReplies: ["Shipping info", "Return policy", "Payment options", "Contact support"],
    });
  };

  const handleQuickReply = (reply: string) => {
    const map: Record<string, string> = {
      "Browse products": "show me products",
      "Browse all categories": "show categories",
      "Browse categories": "show categories",
      "Browse sale products": "show deals",
      "Newsletter signup": "newsletter",
      "Go to my account": "track my order",
      "Contact support": "contact",
      "Contact us": "contact",
      "See all results": "show me products",
      "Search something else": "",
      "Coverage info": "coverage",
    };
    const mapped = map[reply] ?? reply;
    if (mapped) handleSend(mapped);
  };

  const handleAddToCart = (product: ProductResult) => {
    addItem(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        category: product.category,
        price: product.price,
        image: product.image,
        description: product.name,
        rating: 0,
        reviews: 0,
        categories: [],
      } as any,
      1
    );

    toast.success(`${product.name} added to cart`, { duration: 1800 });
  };

  const handleBuyNow = (product: ProductResult) => {
    handleAddToCart(product);
    navigate("/checkout");
  };

  const reset = () => {
    setMessages([WELCOME]);
    setInput("");
    setTyping(false);
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat assistant"}
        className={cn(
          "fixed bottom-24 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300",
          "bg-gradient-to-br from-primary to-accent hover:scale-110 active:scale-95",
          open && "rotate-90"
        )}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="h-6 w-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle className="h-6 w-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Unread badge */}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "fixed bottom-44 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)]",
              "rounded-3xl border border-border shadow-2xl overflow-hidden",
              "dark:bg-black/90 bg-white/95 backdrop-blur-2xl flex flex-col",
            )}
            style={{ height: "520px" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10 shrink-0">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow shrink-0">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Luxtronics Assistant</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[11px] text-muted-foreground">Online · Replies instantly</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={reset}
                  aria-label="Reset chat"
                  className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hidden">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  onQuickReply={handleQuickReply}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                />
              ))}

              {/* Typing indicator */}
              {typing && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-end gap-2"
                >
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="rounded-2xl rounded-bl-sm px-4 py-3 dark:bg-white/10 bg-black/5 border border-border">
                    <div className="flex gap-1 items-center h-4">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-border shrink-0">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                className="flex items-center gap-2 rounded-2xl border border-border dark:bg-white/5 bg-black/5 px-4 py-2"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything…"
                  className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
                  maxLength={200}
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  aria-label="Send message"
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center transition-all",
                    input.trim()
                      ? "bg-gradient-to-br from-primary to-accent text-white shadow-glow hover:scale-110"
                      : "text-muted-foreground cursor-not-allowed"
                  )}
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
              <p className="text-center text-[10px] text-muted-foreground/50 mt-2">
                Powered by Luxtronics · Type or tap a suggestion
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── Message Bubble ───────────────────────────────────────────────────────────

const MessageBubble = ({
  msg,
  onQuickReply,
  onAddToCart,
  onBuyNow,
}: {
  msg: Message;
  onQuickReply: (r: string) => void;
  onAddToCart: (product: ProductResult) => void;
  onBuyNow: (product: ProductResult) => void;
}) => {
  const isBot = msg.role === "bot";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex items-end gap-2", !isBot && "flex-row-reverse")}
    >
      {/* Avatar */}
      {isBot && (
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 mb-0.5">
          <Bot className="h-3.5 w-3.5 text-white" />
        </div>
      )}

      <div className={cn("flex flex-col gap-2 max-w-[85%]", !isBot && "items-end")}>
        {/* Text bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isBot
              ? "rounded-bl-sm dark:bg-white/10 bg-black/5 border border-border text-foreground"
              : "rounded-br-sm bg-gradient-to-br from-primary to-accent text-white"
          )}
        >
          {renderText(msg.text)}
        </div>

        {/* Product cards */}
        {msg.products && msg.products.length > 0 && (
          <div className="flex flex-col gap-2 w-full">
            {msg.products.map((p) => (
              <div key={p.id} className="rounded-xl border border-border dark:bg-white/5 bg-black/5 p-2.5">
                <Link
                  to={`/product/${p.slug}`}
                  className="flex items-center gap-3 hover:border-primary/40 transition-colors"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-12 w-12 rounded-lg object-cover shrink-0 border border-border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{p.category}</p>
                  </div>
                  <p className="text-xs font-bold text-primary shrink-0">₹{p.price.toLocaleString()}</p>
                </Link>

                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onAddToCart(p)}
                    className="flex-1 rounded-full border border-border px-3 py-1.5 text-[11px] font-semibold hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    Add to cart
                  </button>
                  <button
                    type="button"
                    onClick={() => onBuyNow(p)}
                    className="flex-1 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1.5 text-[11px] font-semibold text-white shadow-glow"
                  >
                    Buy now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Link button */}
        {msg.link && (
          <Link
            to={msg.link.to}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            {msg.link.label} →
          </Link>
        )}

        {/* Quick replies */}
        {msg.quickReplies && msg.quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {msg.quickReplies.map((r) => (
              <button
                key={r}
                onClick={() => onQuickReply(r)}
                className="rounded-full border border-border dark:bg-white/5 bg-black/5 px-3 py-1 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
              >
                {r}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-muted-foreground/50 px-1">
          {msg.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </motion.div>
  );
};

export default ChatBot;
