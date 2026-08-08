import PublicNavbar from '../components/PublicNavbar';
import Footer from '../components/Footer';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">About PH Car Rental</h1>
          <p className="text-xl text-blue-200">
            Your trusted partner for exploring the beautiful islands of the Philippines
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white p-10 rounded-lg shadow-md -mt-8">
          <p className="text-textLight text-lg mb-8 leading-relaxed">
            Welcome to PH Car Rental, your trusted partner for exploring the beautiful islands of the Philippines.
            We provide top-quality vehicles to ensure your journey is safe, comfortable, and memorable.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-8 bg-blue-50 rounded-lg border-l-4 border-primary">
              <h2 className="text-2xl font-bold text-primary mb-3">Our Mission</h2>
              <p className="text-textLight leading-relaxed">
                To provide reliable, affordable, and exceptional car rental services that empower travelers
                to explore the Philippines with freedom, safety, and confidence.
              </p>
            </div>
            <div className="p-8 bg-orange-50 rounded-lg border-l-4 border-secondary">
              <h2 className="text-2xl font-bold text-secondary mb-3">Our Vision</h2>
              <p className="text-textLight leading-relaxed">
                To be the leading car rental provider in the Philippines, recognized for our commitment to
                customer satisfaction, operational excellence, and sustainable tourism.
              </p>
            </div>
          </div>

          {/* Values Section */}
          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold text-primary mb-6 text-center">Our Core Values</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6">
                <div className="text-4xl mb-3">🤝</div>
                <h3 className="font-bold mb-2">Integrity</h3>
                <p className="text-textLight text-sm">Honest and transparent in all our dealings</p>
              </div>
              <div className="text-center p-6">
                <div className="text-4xl mb-3">⭐</div>
                <h3 className="font-bold mb-2">Excellence</h3>
                <p className="text-textLight text-sm">Committed to providing the best service</p>
              </div>
              <div className="text-center p-6">
                <div className="text-4xl mb-3">🌱</div>
                <h3 className="font-bold mb-2">Sustainability</h3>
                <p className="text-textLight text-sm">Promoting eco-friendly travel options</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;