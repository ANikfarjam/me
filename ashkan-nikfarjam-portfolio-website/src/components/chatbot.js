import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FaComments, FaTimes, FaPaperPlane, FaRobot } from "react-icons/fa";
import "./styling/chatbot.css";

const WELCOME = {
  sender: "bot",
  text: "Hi! I'm Ashkan's AI assistant. Ask me anything about his experience, projects, or skills.",
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([WELCOME]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(
        "https://portfolio-latest-vi63.onrender.com/query",
        { text: input, top_k: 10 }
      );
      const botMessage = {
        sender: "bot",
        text: response.data.response || "No response.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error contacting server." },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-dialog">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <FaRobot size={15} />
              </div>
              <div>
                <div className="chatbot-header-name">Ashkan's Assistant</div>
                <div className="chatbot-header-status">
                  <span className="chatbot-status-dot" />
                  Online
                </div>
              </div>
            </div>
            <button
              className="chatbot-close"
              onClick={toggleChat}
              aria-label="Close chat"
            >
              <FaTimes size={13} />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-message ${msg.sender}`}>
                {msg.sender === "bot" && (
                  <div className="chatbot-msg-avatar">
                    <FaRobot size={10} />
                  </div>
                )}
                <div className="chatbot-bubble">{msg.text}</div>
              </div>
            ))}

            {loading && (
              <div className="chatbot-message bot">
                <div className="chatbot-msg-avatar">
                  <FaRobot size={10} />
                </div>
                <div className="chatbot-bubble">
                  <div className="dot-typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask me anything..."
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              aria-label="Send message"
            >
              <FaPaperPlane size={13} />
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        className="chatbot-fab"
        onClick={toggleChat}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <FaTimes size={20} /> : <FaComments size={20} />}
      </button>
    </div>
  );
};

export default Chatbot;
