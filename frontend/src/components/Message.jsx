import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // optional: GitHub-style markdown (tables, strikethrough, etc.)

function Message({ type, text, timestamp }) {
  const isUser = type === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        margin: "8px 0",
      }}
    >
      <div
        style={{
          backgroundColor: isUser ? "#DCF8C6" : "#ffffff",
          color: "#000",
          padding: "12px 16px",
          borderRadius: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          maxWidth: "70%",
          wordBreak: "break-word",
          position: "relative",
        }}
      >
        {/* Render Markdown instead of plain text */}
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>

        {timestamp && (
          <div
            style={{
              fontSize: "10px",
              color: "#888",
              marginTop: "4px",
              textAlign: "right",
            }}
          >
            {timestamp}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default Message;
