import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AnnouncementBar from "./AnnouncementBar";
import ChatBot from "./ChatBot";
import Breadcrumb from "./Breadcrumb";

// WhatsApp number — update to your actual number (country code + number, no + or spaces)
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "919999999999";
const WHATSAPP_MESSAGE = encodeURIComponent("Hi! I have a question about a product.");

const WhatsAppButton = () => (
  <a
    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat with us on WhatsApp"
    className="fixed bottom-6 left-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95"
    style={{ backgroundColor: "#25D366" }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width="30"
      height="30"
      fill="white"
      aria-hidden="true"
    >
      <path d="M16.003 2.667C8.637 2.667 2.667 8.637 2.667 16c0 2.363.627 4.674 1.817 6.693L2.667 29.333l6.84-1.793A13.27 13.27 0 0 0 16.003 29.333C23.37 29.333 29.333 23.363 29.333 16S23.37 2.667 16.003 2.667zm0 24.267a11.01 11.01 0 0 1-5.617-1.543l-.403-.24-4.06 1.063 1.083-3.953-.263-.413A10.987 10.987 0 0 1 5.003 16c0-6.067 4.933-11 11-11s11 4.933 11 11-4.933 11-11 11zm6.04-8.24c-.33-.167-1.953-.963-2.257-1.073-.303-.11-.523-.167-.743.167-.22.33-.853 1.073-1.047 1.293-.193.22-.387.247-.717.083-.33-.167-1.393-.513-2.653-1.637-.98-.873-1.643-1.953-1.837-2.283-.193-.33-.02-.51.147-.673.15-.147.33-.387.497-.58.167-.193.22-.33.33-.55.11-.22.057-.413-.027-.58-.083-.167-.743-1.793-1.017-2.453-.267-.643-.54-.557-.743-.567l-.633-.013c-.22 0-.577.083-.88.413-.303.33-1.153 1.127-1.153 2.747s1.18 3.187 1.343 3.407c.167.22 2.32 3.54 5.62 4.967.787.34 1.4.543 1.877.693.787.25 1.503.217 2.07.133.633-.093 1.953-.797 2.227-1.567.273-.77.273-1.43.193-1.567-.08-.137-.3-.22-.63-.387z" />
    </svg>
  </a>
);

type LayoutProps = {
  children: ReactNode;
  hideBreadcrumb?: boolean;
};

const Layout = ({ children, hideBreadcrumb = false }: LayoutProps) => (
  <div className="min-h-screen flex flex-col bg-background overflow-x-hidden w-full">
    <AnnouncementBar />
    <Navbar />
    {!hideBreadcrumb && <Breadcrumb />}
    <main className="flex-1 w-full overflow-x-hidden">{children}</main>
    <Footer />
    <WhatsAppButton />
    <ChatBot />
  </div>
);

export default Layout;
