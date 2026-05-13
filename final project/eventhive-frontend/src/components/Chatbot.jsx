import React, { useState, useRef, useEffect } from "react";
import { sendMessageToBot } from "../services/chatService";
import "../styles/chatbot.css";

const parseMarkdown = (text) => {
  if (!text) return "";
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/\n/g, '<br/>');
  return html;
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I'm your **EventHive Assistant** 🐝. Need help finding an event, booking tickets, or figuring something out?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    
    // Add user message to state
    const newHistory = [...messages, { role: "user", text: userMsg }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const reply = await sendMessageToBot(userMsg, newHistory.slice(0, -1));
      setMessages(prev => [...prev, { role: "bot", text: reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "bot", text: "Oops, something went wrong on my end! Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>✨ EventHive AI</h3>
            <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <span dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }} />
              </div>
            ))}
            {loading && (
              <div className="message bot">
                <span style={{ opacity: 0.6 }}>Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-area" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Ask me anything..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={!input.trim() || loading}>
              ↑
            </button>
          </form>
        </div>
      )}
      
      <button 
        className={`chatbot-fab ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? "Close Assistant" : "Need help?"}
      >
        {isOpen ? "✕" : "💬"}
      </button>
    </div>
  );
}
