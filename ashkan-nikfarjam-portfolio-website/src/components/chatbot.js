import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FaComments, FaTimes, FaPaperPlane, FaRobot } from "react-icons/fa";
import "./styling/chatbot.css";

const BASE_URL = "https://portfolio-latest-vi63.onrender.com";

const WELCOME = {
  sender: "bot",
  text: "Hi! I'm Ashkan's AI assistant. Ask me anything about his experience, projects, or skills.",
};

const MAINTENANCE_MSG = {
  sender: "bot",
  text: "The assistant is currently down for maintenance. Please check back later.",
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([WELCOME]);
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState("checking"); // "checking" | "online" | "offline"
  const messagesEndRef = useRef(null);

  // Health check on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/health`, { timeout: 10000 });
        setServerStatus(res.status === 200 ? "online" : "offline");
      } catch {
        setServerStatus("offline");
      }
    };
    checkHealth();
  }, []);

  // Update welcome message based on server status
  useEffect(() => {
    if (serverStatus === "offline") {
      setMessages([MAINTENANCE_MSG]);
    } else if (serverStatus === "online") {
      setMessages([WELCOME]);
    }
  }, [serverStatus]);

  const toggleChat = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || serverStatus !== "online") return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${BASE_URL}/query`,
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

  const isOffline = serverStatus === "offline";

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-dialog">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className={`chatbot-avatar ${isOffline ? "offline" : ""}`}>
                <FaRobot size={15} />
              </div>
              <div>
                <div className="chatbot-header-name">Ashkan's Assistant</div>
                <div className="chatbot-header-status">
                  <span className={`chatbot-status-dot ${isOffline ? "offline" : ""}`} />
                  {isOffline ? "Maintenance" : "Online"}
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
              placeholder={isOffline ? "Chatbot is currently unavailable..." : "Ask me anything..."}
              disabled={isOffline}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isOffline}
              aria-label="Send message"
            >
              <FaPaperPlane size={13} />
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        className={`chatbot-fab ${isOffline ? "offline" : ""}`}
        onClick={toggleChat}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <FaTimes size={20} /> : <FaComments size={20} />}
        {isOffline && <span className="chatbot-fab-status-dot" />}
      </button>
    </div>
  );
};

export default Chatbot;
