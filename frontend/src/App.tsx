import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { CurrencyProvider } from "./context/CurrencyContext.tsx";
import { CartProvider } from "./context/CartContext.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { StoreProvider } from "./context/StoreContext.tsx";
import AppPreloader from "./components/AppPreloader.tsx";
import FootballCursor from "./components/FootballCursor.tsx";

// Eager load critical pages
import Index from "./pages/Index.tsx";
import Shop from "./pages/Shop.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import GeoRedirectPopup from "./components/GeoRedirectPopup.tsx";
import CookieConsent from "./components/CookieConsent.tsx";

// Lazy load non-critical pages
const Categories = lazy(() => import("./pages/Categories.tsx"));
const LatestArrivals = lazy(() => import("./pages/LatestArrivals.tsx"));
const Cart = lazy(() => import("./pages/Cart.tsx"));
const Blog = lazy(() => import("./pages/Blog.tsx"));
const BlogPost = lazy(() => import("./pages/BlogPost.tsx"));
const Contact = lazy(() => import("./pages/Contact.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const FAQ = lazy(() => import("./pages/FAQ.tsx"));
const ShippingReturns = lazy(() => import("./pages/ShippingReturns.tsx"));
const PaymentMethod = lazy(() => import("./pages/PaymentMethod.tsx"));
const ReturnExchange = lazy(() => import("./pages/ReturnExchange.tsx"));
const Privacy = lazy(() => import("./pages/Privacy.tsx"));
const Terms = lazy(() => import("./pages/Terms.tsx"));
const AccountLogin = lazy(() => import("./pages/AccountLogin.tsx"));
const AccountRegister = lazy(() => import("./pages/AccountRegister.tsx"));
const AccountDashboard = lazy(() => import("./pages/AccountDashboard.tsx"));
const AccountOrders = lazy(() => import("./pages/AccountOrders.tsx"));
const AccountProfile = lazy(() => import("./pages/AccountProfile.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.tsx"));
const AdminProducts = lazy(() => import("./pages/AdminProducts.tsx"));
const AdminInvoices = lazy(() => import("./pages/AdminInvoices.tsx"));
const AdminBlogs = lazy(() => import("./pages/AdminBlogs.tsx"));
const AdminGuard = lazy(() => import("./components/AdminGuard.tsx"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <StoreProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <CurrencyProvider>
              <CartProvider>
                <TooltipProvider>
                  <AppPreloader />
                  <FootballCursor />
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <GeoRedirectPopup />
                    <CookieConsent />
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/latest-arrivals" element={<LatestArrivals />} />
                        <Route path="/product/:slug" element={<ProductDetail />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/blog/:slug" element={<BlogPost />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/faq" element={<FAQ />} />
                        <Route path="/shipping-returns" element={<ShippingReturns />} />
                        <Route path="/payment-method" element={<PaymentMethod />} />
                        <Route path="/return-exchange" element={<ReturnExchange />} />
                        <Route path="/return-policy" element={<ReturnExchange />} />
                        <Route path="/returns" element={<ReturnExchange />} />
                        <Route path="/refund-policy" element={<ReturnExchange />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/account" element={<AccountDashboard />} />
                        <Route path="/account/login" element={<AccountLogin />} />
                        <Route path="/account/register" element={<AccountRegister />} />
                        <Route path="/account/orders" element={<AccountOrders />} />
                        <Route path="/account/profile" element={<AccountProfile />} />
                        <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
                        <Route path="/admin/products" element={<AdminGuard><AdminProducts /></AdminGuard>} />
                        <Route path="/admin/invoices" element={<AdminGuard><AdminInvoices /></AdminGuard>} />
                        <Route path="/admin/blogs" element={<AdminGuard><AdminBlogs /></AdminGuard>} />
                        <Route path="/invoices" element={<AdminGuard><AdminInvoices /></AdminGuard>} />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </BrowserRouter>
                </TooltipProvider>
              </CartProvider>
            </CurrencyProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </StoreProvider>
  );
};

export default App;
