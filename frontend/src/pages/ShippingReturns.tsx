import CustomerServiceLayout from "@/components/CustomerServiceLayout";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";

const ShippingReturns = () => {
  return (
    <Layout>
      <SEO
        title="Shipping Information | Luxtronics"
        description="Luxtronics shipping destinations, delivery timelines, tracking, customs duties and support details for India, Australia and New Zealand."
        keywords="luxtronics shipping, delivery time, order tracking, electronics delivery"
        url="https://luxtronics.in/shipping-returns"
        type="article"
        modifiedTime="2026-06-15T00:00:00+05:30"
      />

      <CustomerServiceLayout title="Shipping Information" heroImage="/a3.jpg" heroAlt="Luxtronics shipping information for electronics orders">
        <section>
          <p>
            Luxtronics ships electronics and gadgets to customers in India, Australia and New Zealand. Processing normally takes 1-2 business days after order confirmation, in addition to the delivery timeline below.
          </p>
        </section>

        <section>
          <h3 className="mb-4 text-xl font-semibold text-neutral-950">Delivery Timelines</h3>
          <div className="overflow-x-auto border-y border-neutral-200">
            <table className="w-full min-w-[620px] text-left text-sm sm:text-base">
              <tbody className="divide-y divide-neutral-200">
                <tr>
                  <th className="w-56 py-4 pr-6 font-medium text-neutral-950">India</th>
                  <td className="py-4">Standard: 3-7 business days. Express: 1-3 business days in select cities.</td>
                </tr>
                <tr>
                  <th className="py-4 pr-6 font-medium text-neutral-950">Australia</th>
                  <td className="py-4">International standard: 3-5 working days.</td>
                </tr>
                <tr>
                  <th className="py-4 pr-6 font-medium text-neutral-950">New Zealand</th>
                  <td className="py-4">International standard: 3-5 working days.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-6">Remote areas, customs checks, public holidays and peak sale periods may add extra time.</p>
        </section>

        <section>
          <h3 className="mb-4 text-xl font-semibold text-neutral-950">Shipping Charges</h3>
          <p>
            India orders above Rs. 999 qualify for free shipping. Orders below Rs. 999 may carry a flat Rs. 99 shipping fee. Australia and New Zealand shipping charges are calculated at checkout based on weight, dimensions and delivery zone.
          </p>
        </section>

        <section>
          <h3 className="mb-4 text-xl font-semibold text-neutral-950">Shipping Partners and Tracking</h3>
          <p>
            We use partners such as Blue Dart, Delhivery, DTDC, India Post, DHL Express, Australia Post, FedEx, NZ Post and CourierPost depending on destination and package type.
          </p>
          <p className="mt-6">
            Once dispatched, you will receive tracking details by email or SMS. If tracking has no movement for more than 5 business days in India or 10 business days internationally, contact support@luxtronics.in.
          </p>
        </section>

        <section>
          <h3 className="mb-4 text-xl font-semibold text-neutral-950">Customs, Duties and Taxes</h3>
          <p>
            India prices include applicable GST. For Australia and New Zealand, GST and customs duties may apply based on order value and local import rules. Any import charges assessed by customs authorities are the buyer's responsibility unless stated otherwise at checkout.
          </p>
        </section>

        <section>
          <h3 className="mb-4 text-xl font-semibold text-neutral-950">Damaged or Lost Shipments</h3>
          <p>
            If a package arrives damaged, photograph or record the package before and after opening, then contact us within 48 hours of delivery. If a shipment is confirmed lost by the courier, we will arrange a replacement or refund.
          </p>
        </section>
      </CustomerServiceLayout>
    </Layout>
  );
};

export default ShippingReturns;
