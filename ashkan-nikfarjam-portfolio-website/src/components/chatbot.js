import { useState, useRef, useEffect, useCallback } from "react";
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

const DISCONNECTED_MSG = {
  sender: "bot",
  text: "The connection to the chatbot was closed due to inactivity. Click \"Reconnect\" to start a new session.",
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([WELCOME]);
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState("checking"); // "checking" | "online" | "offline"
  const messagesEndRef = useRef(null);
  const activityTimerRef = useRef(null);

  const HEALTH_RETRY_DELAYS_MS = [3000, 6000, 12000, 20000]; // ~1 initial + 4 retries, ~50s total budget

  // Retry/backoff to ride out Render cold starts. Reused by the mount check and the Reconnect button.
  const checkHealth = useCallback(async () => {
    setServerStatus("checking");
    for (let attempt = 0; attempt <= HEALTH_RETRY_DELAYS_MS.length; attempt++) {
      try {
        const res = await axios.get(`${BASE_URL}/health`, { timeout: 10000 });
        if (res.status === 200) {
          setServerStatus("online");
          return;
        }
      } catch {
        // fall through to retry
      }
      if (attempt < HEALTH_RETRY_DELAYS_MS.length) {
        await sleep(HEALTH_RETRY_DELAYS_MS[attempt]);
      }
    }
    setServerStatus("offline");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  // Update welcome message based on server status
  useEffect(() => {
    if (serverStatus === "offline") {
      setMessages([MAINTENANCE_MSG]);
    } else if (serverStatus === "disconnected") {
      setMessages([DISCONNECTED_MSG]);
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

  const QUERY_TIMEOUT_MS = 60000;
  const MAX_QUERY_ATTEMPTS = 3;
  const QUERY_RETRY_DELAY_MS = 1500;
  const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // disconnect after 5 idle minutes

  // Resets the idle timer. Call on any user activity while a session is online.
  const scheduleDisconnect = () => {
    if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
    activityTimerRef.current = setTimeout(() => {
      setServerStatus("disconnected");
    }, INACTIVITY_TIMEOUT_MS);
  };

  useEffect(() => {
    if (serverStatus === "online") {
      scheduleDisconnect();
    } else if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current);
    }
    return () => {
      if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverStatus]);

  const handleReconnect = () => {
    checkHealth();
  };

  const postQuery = () =>
    axios.post(
      `${BASE_URL}/query`,
      { text: input, top_k: 10 },
      { timeout: QUERY_TIMEOUT_MS }
    );

  const sendMessage = async () => {
    if (!input.trim() || serverStatus !== "online") return;

    scheduleDisconnect(); // sending a message counts as activity — push out the idle timeout

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      let response;
      let lastErr = null;
      for (let attempt = 1; attempt <= MAX_QUERY_ATTEMPTS; attempt++) {
        try {
          response = await postQuery();
          lastErr = null;
          break;
        } catch (err) {
          lastErr = err;
          // Only retry on network/timeout errors — not on server-returned error responses
          if (err.response) break;
          if (attempt < MAX_QUERY_ATTEMPTS) await sleep(QUERY_RETRY_DELAY_MS);
        }
      }
      if (lastErr) throw lastErr;

      const botMessage = {
        sender: "bot",
        text: response.data.response || "No response.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const serverMessage = err.response?.data?.response;
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: serverMessage || "Error contacting server. Please try again in a moment.",
        },
      ]);
    }

    setLoading(false);
  };

  const isOffline = serverStatus === "offline";
  const isDisconnected = serverStatus === "disconnected";
  const isUnavailable = isOffline || isDisconnected;

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-dialog">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className={`chatbot-avatar ${isUnavailable ? "offline" : ""}`}>
                <FaRobot size={15} />
              </div>
              <div>
                <div className="chatbot-header-name">Ashkan's Assistant</div>
                <div className="chatbot-header-status">
                  <span className={`chatbot-status-dot ${isUnavailable ? "offline" : ""}`} />
                  {isDisconnected ? "Disconnected" : isOffline ? "Maintenance" : "Online"}
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
            {isDisconnected ? (
              <button className="chatbot-reconnect-btn" onClick={handleReconnect}>
                Reconnect
              </button>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        className={`chatbot-fab ${isUnavailable ? "offline" : ""}`}
        onClick={toggleChat}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <FaTimes size={20} /> : <FaComments size={20} />}
        {isUnavailable && <span className="chatbot-fab-status-dot" />}
      </button>
    </div>
  );
};

export default Chatbot;
