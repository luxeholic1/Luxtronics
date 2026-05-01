import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SplashScreen from "./components/SplashScreen.tsx";
import { CurrencyProvider, CountryInfo } from "./context/CurrencyContext.tsx";
import Index from "./pages/Index.tsx";
import Shop from "./pages/Shop.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import Categories from "./pages/Categories.tsx";
import Cart from "./pages/Cart.tsx";
import Checkout from "./pages/Checkout.tsx";
import Blog from "./pages/Blog.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import Contact from "./pages/Contact.tsx";
import About from "./pages/About.tsx";
import FAQ from "./pages/FAQ.tsx";
import ShippingReturns from "./pages/ShippingReturns.tsx";
import Privacy from "./pages/Privacy.tsx";
import Terms from "./pages/Terms.tsx";
import AccountLogin from "./pages/AccountLogin.tsx";
import AccountRegister from "./pages/AccountRegister.tsx";
import AccountDashboard from "./pages/AccountDashboard.tsx";
import AccountOrders from "./pages/AccountOrders.tsx";
import AccountProfile from "./pages/AccountProfile.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(false); // Temporarily disabled

  const handleSplashEnter = (country: CountryInfo) => {
    sessionStorage.setItem("lux_country", JSON.stringify(country));
    setShowSplash(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {showSplash && <SplashScreen onEnter={handleSplashEnter} />}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/shipping-returns" element={<ShippingReturns />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/account" element={<AccountDashboard />} />
            <Route path="/account/login" element={<AccountLogin />} />
            <Route path="/account/register" element={<AccountRegister />} />
            <Route path="/account/orders" element={<AccountOrders />} />
            <Route path="/account/profile" element={<AccountProfile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CurrencyProvider>
    </QueryClientProvider>
  );
};

export default App;
