import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-background overflow-x-hidden w-full">
    <Navbar />
    <main className="flex-1 w-full overflow-x-hidden">{children}</main>
    <Footer />
  </div>
);

export default Layout;
