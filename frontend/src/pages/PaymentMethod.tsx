import CustomerServiceLayout from "@/components/CustomerServiceLayout";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";

const PaymentMethod = () => {
  return (
    <Layout>
      <SEO
        title="Payment Method | Luxtronics"
        description="Secure payment methods accepted by Luxtronics in India, Australia and New Zealand, including UPI, cards, net banking and PayU."
        keywords="luxtronics payment method, UPI, PayU, cards, net banking"
        url="https://luxtronics.in/payment-method"
        type="article"
      />

      <CustomerServiceLayout title="Payment Method" heroImage="/a6.jpg" heroAlt="Luxtronics secure payment methods">
        <section>
          <p>
            Luxtronics offers secure payment options for customers in India, Australia and New Zealand. All checkout pages are protected by SSL/TLS encryption and processed through PCI-DSS compliant payment gateways.
          </p>
        </section>

        <section>
          <h3 className="mb-4 text-xl font-semibold text-neutral-950">India</h3>
          <p>
            Accepted payment methods include UPI apps such as Google Pay, PhonePe, Paytm and BHIM; Visa, Mastercard, American Express and RuPay cards; net banking for major Indian banks; and verified bank transfer where available.
          </p>
        </section>

        <section>
          <h3 className="mb-4 text-xl font-semibold text-neutral-950">Australia and New Zealand</h3>
          <p>
            International credit and debit cards such as Visa, Mastercard and American Express are accepted where supported by the payment gateway. Currency conversion fees, if any, are charged by your issuing bank and are outside our control.
          </p>
        </section>

        <section>
          <h3 className="mb-4 text-xl font-semibold text-neutral-950">Payment Security</h3>
          <p>
            We do not store card numbers, expiry dates, CVV codes, UPI PINs or net banking passwords. Transactions may be monitored for suspicious activity, and we may contact you for verification before processing high-risk orders.
          </p>
        </section>

        <section>
          <h3 className="mb-4 text-xl font-semibold text-neutral-950">Failed Payments</h3>
          <p>
            If payment fails, check your bank account or UPI app before retrying to avoid duplicate charges. Failed payment deductions are usually auto-reversed by your bank within 5-7 business days.
          </p>
        </section>
      </CustomerServiceLayout>
    </Layout>
  );
};

export default PaymentMethod;
