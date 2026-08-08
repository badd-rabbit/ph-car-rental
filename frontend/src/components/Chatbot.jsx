import { useState, useRef, useEffect } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! Welcome to PH Car Rental. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickReplies = [
    "How to book a car?",
    "What are the requirements?",
    "What payment methods do you accept?",
    "How do I cancel a booking?",
    "What is your cancellation policy?",
    "Do you offer long-term rentals?",
    "What areas do you serve?",
    "How do I contact support?"
  ];

  const getBotResponse = (userMessage) => {
    const msg = userMessage.toLowerCase();

    if (msg.includes('book') || msg.includes('reservation')) {
      return "To book a car: 1) Register/Login to your account. 2) Browse available cars on the dashboard. 3) Click 'Book Now' on your preferred car. 4) Select your rental dates and payment method. 5) Confirm your booking. An admin will review and approve your request.";
    }
    if (msg.includes('requirement') || msg.includes('need') || msg.includes('documents')) {
      return "Requirements for renting: 1) Valid Philippine Driver's License (or International Driving Permit). 2) Minimum age of 21 years old. 3) Valid government-issued ID. 4) Proof of billing (for verification). 5) Security deposit may be required depending on the vehicle.";
    }
    if (msg.includes('payment') || msg.includes('pay') || msg.includes('gcash') || msg.includes('maya')) {
      return "We accept the following payment methods: 1) Cash (upon pickup). 2) GCash (mobile wallet). 3) Maya (formerly PayMaya). 4) Bank Transfer (BDO, BPI, Metrobank). Full payment is required before vehicle release.";
    }
    if (msg.includes('cancel')) {
      return "To cancel a booking: 1) Go to 'My Bookings' page. 2) Find the booking you want to cancel. 3) Click 'Cancel Booking' (available within 3 minutes after approval). 4) Provide a cancellation reason. Note: Cancellations made 24 hours before pickup receive a full refund. Within 24 hours are subject to a 20% processing fee.";
    }
    if (msg.includes('policy')) {
      return "Our policies: 1) Vehicles must be returned with the same fuel level (or ₱500 refueling fee applies). 2) Late returns beyond 2 hours incur 50% of daily rate. Beyond 6 hours = full day charge. 3) Traffic violations during rental are the renter's responsibility. 4) Feedback can be edited within 24 hours of submission.";
    }
    if (msg.includes('long-term') || msg.includes('monthly') || msg.includes('weekly')) {
      return "Yes! We offer long-term rentals with special discounted rates. For weekly or monthly rentals, please contact our admin directly through the Settings page or email us at support@phcarrental.com for a custom quote.";
    }
    if (msg.includes('area') || msg.includes('location') || msg.includes('where') || msg.includes('serve')) {
      return "We currently serve Metro Manila and nearby provinces including Cavite, Laguna, Bulacan, and Rizal. For rentals outside these areas, please contact our support team to check availability and delivery fees.";
    }
    if (msg.includes('contact') || msg.includes('support') || msg.includes('help') || msg.includes('email') || msg.includes('phone')) {
      return "You can reach our support team through: 1) Email: support@phcarrental.com 2) Phone: (02) 8123-4567 3) Mobile: 0912-345-6789 4) Visit our office: 123 Rizal Avenue, Manila. Operating hours: Mon-Sat, 8AM-6PM.";
    }
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      return "Hello! How can I assist you with your car rental needs today?";
    }
    if (msg.includes('thank')) {
      return "You're welcome! Is there anything else I can help you with?";
    }
    if (msg.includes('price') || msg.includes('cost') || msg.includes('how much') || msg.includes('rate')) {
      return "Our rental rates vary by vehicle type: Sedans start at ₱2,500/day, SUVs at ₱3,000/day, Vans at ₱3,500/day, and Pickups at 3,000/day. Prices may vary based on season and availability. Check our dashboard for real-time pricing!";
    }

    return "I'm not sure about that. Could you please rephrase your question? You can also contact our support team at support@phcarrental.com for more specific inquiries.";
  };

  const handleSend = (text) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: getBotResponse(messageText),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-secondary text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition transform hover:scale-110 z-50"
        >
          <FaComments size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-blue-800 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <FaRobot size={20} />
              </div>
              <div>
                <h3 className="font-bold">PH Car Rental Assistant</h3>
                <p className="text-xs text-blue-200">Online • Ready to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.sender === 'bot' ? 'bg-primary text-white' : 'bg-secondary text-white'
                  }`}>
                    {msg.sender === 'bot' ? <FaRobot size={14} /> : <FaUser size={14} />}
                  </div>
                  <div className={`rounded-2xl px-4 py-2 shadow-sm ${
                    msg.sender === 'bot' 
                      ? 'bg-white text-gray-800 rounded-tl-none' 
                      : 'bg-primary text-white rounded-tr-none'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${
                      msg.sender === 'bot' ? 'text-gray-400' : 'text-blue-200'
                    }`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                    <FaRobot size={14} />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies - VERTICAL LAYOUT */}
          {messages.length <= 2 && (
            <div className="border-t border-gray-200 p-3 bg-white max-h-32 overflow-y-auto">
              <p className="text-xs font-bold text-gray-500 mb-2">Quick Questions:</p>
              <div className="flex flex-col gap-2">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(reply)}
                    className="text-left text-sm bg-blue-50 text-primary border border-blue-200 px-3 py-2 rounded-lg hover:bg-blue-100 transition w-full"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 p-3 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="bg-primary text-white p-2 rounded-lg hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaPaperPlane size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;