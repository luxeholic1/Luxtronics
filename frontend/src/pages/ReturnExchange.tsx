import CustomerServiceLayout from "@/components/CustomerServiceLayout";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";

const ReturnExchange = () => {
  return (
    <Layout>
      <SEO
        title="Return Policy | Luxtronics"
        description="Luxtronics return, exchange and refund policy for India, Australia and New Zealand customers."
        keywords="luxtronics return policy, exchange policy, refund electronics"
        url="https://luxtronics.in/return-exchange"
        type="article"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Luxtronics Return and Exchange Policy",
          "url": "https://luxtronics.in/return-exchange",
          "mainEntity": {
            "@type": "MerchantReturnPolicy",
            "applicableCountry": ["IN", "AU", "NZ"],
            "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
            "merchantReturnDays": 14,
            "returnMethod": "https://schema.org/ReturnByMail",
            "returnFees": "https://schema.org/ReturnFeesCustomerResponsibility",
            "refundType": "https://schema.org/FullRefund",
            "merchantReturnLink": "https://luxtronics.in/return-exchange"
          }
        }}
      />

      <CustomerServiceLayout title="Return Policy" heroImage="/a2.jpg" heroAlt="Luxtronics return and exchange support">
        <section>
          <p>
            We want every Luxtronics order to arrive correctly and safely. If something is wrong, our team will help you with a clear return, exchange or refund process. Your statutory consumer rights under applicable law remain fully preserved.
          </p>
        </section>

        <section>
          <h3 className="mb-4 text-xl font-semibold text-neutral-950">Return Window</h3>
          <p>
            India customers can request most returns within 7 days of delivery. Australia and New Zealand customers can request voluntary returns within 14 days of delivery. Some premium products may have product-specific windows shown on the product page.
          </p>
          <div className="mt-6 overflow-x-auto border-y border-neutral-200">
            <table className="w-full min-w-[620px] text-left text-sm sm:text-base">
              <tbody className="divide-y divide-neutral-200">
                <tr>
                  <th className="w-56 py-4 pr-6 font-medium text-neutral-950">India</th>
                  <td className="py-4">7 days from confirmed delivery for most products.</td>
                </tr>
                <tr>
                  <th className="py-4 pr-6 font-medium text-neutral-950">Australia</th>
                  <td className="py-4">14 days from confirmed delivery. Australian Consumer Law rights remain unaffected.</td>
                </tr>
                <tr>
                  <th className="py-4 pr-6 font-medium text-neutral-950">New Zealand</th>
                  <td className="py-4">14 days from confirmed delivery. Consumer Guarantees Act rights remain unaffected.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3 className="mb-4 text-xl font-semibold text-neutral-950">Valid Return Conditions</h3>
          <p>
            Items must be unused, unactivated, unworn and in original condition. Original packaging, manuals, accessories, warranty cards, invoices, serial number labels and manufacturer seals must be intact. A Return Merchandise Authorisation number is required before sending any item back.
          </p>
        </section>

        <section>
          <h3 className="mb-4 text-xl font-semibold text-neutral-950">Non-Returnable Items</h3>
          <p>
            Opened software, activated digital licences, used consumables, damaged products caused by misuse, tampered serial labels, clearance products and products marked final sale are not eligible for voluntary returns unless defective under applicable consumer law.
          </p>
        </section>

        <section>
          <h3 className="mb-4 text-xl font-semibold text-neutral-950">How to Initiate a Return</h3>
          <ol className="list-decimal space-y-3 pl-6">
            <li>Email support@luxtronics.in with subject: Return Request - Order #[Your Order Number].</li>
            <li>Include your order number, item name, reason and photos or video for defective, damaged or wrong products.</li>
            <li>Wait for approval and RMA instructions before shipping anything back.</li>
            <li>Pack the item securely in its original packaging and include the invoice.</li>
          </ol>
        </section>

        <section>
          <h3 className="mb-4 text-xl font-semibold text-neutral-950">Refund Timelines</h3>
          <p>
            Approved refunds are initiated within 2-3 business days after inspection. India payment refunds usually take 5-7 business days, bank transfers may take 7-10 business days, and international card refunds may take 7-14 business days depending on the issuing bank.
          </p>
        </section>

        <section>
          <h3 className="mb-4 text-xl font-semibold text-neutral-950">Return Shipping Fees</h3>
          <p>
            For change-of-mind returns, the customer is responsible for return shipping and original shipping charges are non-refundable. For dead-on-arrival, defective, wrong-item or transit-damaged cases approved by Luxtronics, we cover return pickup or provide return shipping instructions at no extra cost.
          </p>
        </section>

        <section>
          <h3 className="mb-4 text-xl font-semibold text-neutral-950">Contact for Returns</h3>
          <p>
            Email <a className="text-neutral-950 underline" href="mailto:support@luxtronics.in">support@luxtronics.in</a> with your order number before shipping any item back. Phone support is available at +91 92664 33722, Monday to Saturday, 10:00 AM to 6:00 PM IST.
          </p>
        </section>
      </CustomerServiceLayout>
    </Layout>
  );
};

export default ReturnExchange;
