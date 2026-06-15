import CustomerServiceLayout from "@/components/CustomerServiceLayout";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "What payment methods do you accept?",
    a: "India customers can pay with UPI, Visa, Mastercard, Amex, RuPay, net banking and bank transfer through PayU. Australia and New Zealand customers can use supported international cards.",
  },
  {
    q: "Is it safe to pay on Luxtronics?",
    a: "Yes. Payments are handled through PCI-DSS compliant gateways with SSL/TLS encryption. We do not store card numbers, CVV codes, UPI PINs or net banking credentials.",
  },
  {
    q: "Can I modify or cancel an order?",
    a: "You can request cancellation within 24 hours of placing an order if it has not been dispatched. Email support@luxtronics.in with your order number.",
  },
  {
    q: "How long does delivery take?",
    a: "India delivery usually takes 3-7 business days. Australia and New Zealand delivery usually takes 3-5 working days after dispatch.",
  },
  {
    q: "How do I start a return?",
    a: "Email support@luxtronics.in with the subject Return Request - Order #[Your Order Number]. Include the reason and photos or video for damaged, wrong or defective items.",
  },
  {
    q: "Are products genuine?",
    a: "Yes. Products are sourced from authorised distributors, brand partners or official importers. Refurbished or clearance products are clearly marked where applicable.",
  },
];

const FAQ = () => {
  return (
    <Layout>
      <SEO
        title="FAQs | Luxtronics"
        description="Answers to common Luxtronics questions about payments, delivery, returns, refunds, warranty and customer support."
        keywords="luxtronics faq, electronics delivery, payment methods, return policy"
        url="https://luxtronics.in/faq"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map((item) => ({
            "@type": "Question",
            "name": item.q,
            "acceptedAnswer": { "@type": "Answer", "text": item.a },
          })),
        }}
      />

      <CustomerServiceLayout title="Frequently Asked Questions" heroImage="/a6.jpg" heroAlt="Luxtronics customer questions and support">
        <Accordion type="single" collapsible className="w-full border-t border-neutral-200">
          {faqs.map((item, index) => (
            <AccordionItem key={item.q} value={`faq-${index}`} className="border-neutral-200">
              <AccordionTrigger className="py-6 text-left text-lg font-semibold leading-snug text-neutral-950 hover:no-underline sm:text-xl">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="pb-7 text-base leading-8 text-neutral-500 sm:text-lg sm:leading-9">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CustomerServiceLayout>
    </Layout>
  );
};

export default FAQ;
