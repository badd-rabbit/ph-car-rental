import PublicNavbar from '../components/PublicNavbar';
import Footer from '../components/Footer';

const FAQ = () => {
  const faqs = [
    { q: "What documents do I need to rent a car?", a: "You need a valid driver's license, a government-issued ID (like Passport or UMID), and a credit card or cash deposit." },
    { q: "Can I cancel my booking?", a: "Yes, you can cancel your booking anytime from your 'My Bookings' dashboard. If cancelled by an admin, a reason will be provided." },
    { q: "What payment methods do you accept?", a: "We accept Cash upon pickup, GCash, Maya, and Bank Transfer." },
    { q: "Is there a mileage limit?", a: "Most of our rentals come with unlimited mileage within the island. Cross-island rentals may have specific terms." },
    { q: "How do I book a car?", a: "Simply create an account, browse our available cars, click 'Book Now', select your dates and payment method, and confirm!" },
    { q: "What happens if I return the car late?", a: "Late returns may incur additional charges based on our hourly/daily rate policy. Please contact us if you need to extend your rental." },
    { q: "Are the cars insured?", a: "Yes, all our vehicles come with comprehensive insurance coverage for your peace of mind." }
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-blue-200">Find answers to common questions about our services</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-8">
        <div className="bg-white p-10 rounded-lg shadow-md -mt-8">
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b pb-4 last:border-0">
                <h3 className="text-lg font-bold text-textDark mb-2">{faq.q}</h3>
                <p className="text-textLight leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FAQ;