import { useState, useRef, useEffect } from "react";
import Message from "../components/Message";
import MessageInput from "../components/MessageInput";
import axios from "axios";

function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messageEndRef = useRef(null);

  const handleSend = async (text) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [...prev, { type: "user", text, timestamp }]);
    setIsTyping(true);

    try {


const response = await axios.post(
  "http://localhost:5000/api/coach/get_advice",
  {
    question: text,
    history: messages,
  },
  {
    headers: {
      "Content-Type": "application/json",
    },
  }
);

console.log(response);


      if (response.status !== 200) throw new Error(`sfdServer error: ${response.status}`);
      const data = response.data;
      const botTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setMessages((prev) => [
        ...prev,
        { type: "bot", text: data.advice || "No response from server.", timestamp: botTimestamp }
      ]);
    } catch (error) {
      const errorTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: `Error: ${error.message}`, timestamp: errorTimestamp }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      maxWidth: "800px",
      height: "90vh",
      margin: "20px auto",
      border: "1px solid #ddd",
      borderRadius: "10px",
      backgroundColor: "#ffffff",
      overflow: "hidden",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
    }}>
      <div style={{
        padding: "16px",
        borderBottom: "1px solid #ddd",
        backgroundColor: "#007BFF",
        color: "#fff",
        fontWeight: "bold",
        textAlign: "center",
        fontSize: "18px"
      }}>
        Coach Chat
      </div>

      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "20px",
        backgroundColor: "#F9F9F9"
      }}>
        {messages.map((msg, index) => (
          <Message key={index} type={msg.type} text={msg.text} timestamp={msg.timestamp} />
        ))}
        {isTyping && (
          <div style={{ margin: "8px 0", color: "#888", fontStyle: "italic" }}>
            Bot is typing...
          </div>
        )}
        <div ref={messageEndRef}></div>
      </div>

      <div style={{ padding: "10px 20px", borderTop: "1px solid #ddd", backgroundColor: "#fff" }}>
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  );
}

export default ChatWindow;
