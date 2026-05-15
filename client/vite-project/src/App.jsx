import { useEffect, useState } from "react";
import { socket } from "./socket";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const userId = new URLSearchParams(window.location.search).get("user");
  const otherUser = userId === "user1" ? "user2" : "user1";

  useEffect(() => {
    if (!userId) return;

    socket.emit("addUser", userId);

    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("receiveMessage");
  }, [userId]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const data = {
      senderId: userId,
      receiverId: otherUser,
      message,
    };

    socket.emit("sendMessage", data);

    setMessages((prev) => [...prev, data]);
    setMessage("");
  };

  return (
    <div style={styles.container}>
      {/* LEFT SIDE */}
      <div style={styles.sidebar}>
        <h3>Users</h3>
        <div style={styles.user}>
          {userId}
        </div>
        <div style={styles.user}>
          {otherUser}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div style={styles.chatBox}>
        <h3>Chat with {otherUser}</h3>

        {/* messages */}
        <div style={styles.messages}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                ...styles.message,
                alignSelf:
                  msg.senderId === userId ? "flex-end" : "flex-start",
                background:
                  msg.senderId === userId ? "#DCF8C6" : "#fff",
              }}
            >
              {msg.message}
            </div>
          ))}
        </div>

        {/* input */}
        <div style={styles.inputBox}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={styles.input}
            placeholder="Type message..."
          />
          <button onClick={sendMessage} style={styles.button}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "Arial",
  },

  sidebar: {
    width: "25%",
    background: "#f0f0f0",
    padding: "10px",
    borderRight: "1px solid #ccc",
  },

  user: {
    padding: "10px",
    margin: "5px 0",
    background: "#fff",
    cursor: "pointer",
  },

  chatBox: {
    width: "75%",
    display: "flex",
    flexDirection: "column",
  },

  messages: {
    flex: 1,
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    gap: "8px",
  },

  message: {
    padding: "8px 12px",
    borderRadius: "10px",
    maxWidth: "60%",
  },

  inputBox: {
    display: "flex",
    padding: "10px",
    borderTop: "1px solid #ccc",
  },

  input: {
    flex: 1,
    padding: "10px",
  },

  button: {
    padding: "10px 15px",
    marginLeft: "10px",
    cursor: "pointer",
  },
};