
import { useState } from "react";

function MessageInput({ onSend }) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() === "") return;
    onSend(input);
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
        aria-label="Type your message"
        style={{
          flex: 1,
          padding: "14px",
          borderRadius: "25px",
          border: "1px solid #ccc",
          outline: "none",
          fontSize: "16px",
          transition: "border-color 0.3s ease"
        }}
        onFocus={(e) => e.currentTarget.style.borderColor = "#007BFF"}
        onBlur={(e) => e.currentTarget.style.borderColor = "#ccc"}
      />
      <button
        onClick={handleSend}
        style={{
          padding: "12px 20px",
          borderRadius: "25px",
          border: "none",
          backgroundColor: "#007BFF",
          color: "#fff",
          cursor: "pointer"
        }}
      >
        Send
      </button>
    </div>
  );
}

export default MessageInput;