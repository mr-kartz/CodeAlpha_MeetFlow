import { useEffect, useRef, useState } from "react";
import socket from "../services/socket";
import "../styles/chat.css";

function Chat({ roomId ,  roomJoined }) {

  const currentUser =
    JSON.parse(localStorage.getItem("user"));

  const myName =
    currentUser?.name || "You";

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([]);

  const messagesEndRef = useRef(null);

  // ============================
  // Receive Messages
  // ============================

  useEffect(() => {

    const receiveMessage = (data) => {

      const newMessage = {

        ...data,

        time: new Date().toLocaleTimeString([],{

          hour:"2-digit",

          minute:"2-digit",

        }),

      };

      setMessages(prev=>[...prev,newMessage]);

    };

    socket.on("receive-message", receiveMessage);

    return ()=>{

      socket.off("receive-message", receiveMessage);

    };

  }, []);

  // ============================
  // Auto Scroll
  // ============================

  useEffect(()=>{

    messagesEndRef.current?.scrollIntoView({

      behavior:"smooth",

    });

  },[messages]);

  // ============================
  // Send Message
  // ============================

const sendMessage = () => {

  if (!roomJoined) {
  alert("Please wait... joining meeting");
  return;
}

  console.log("📤 Send button clicked");

  if (!message.trim()) return;

  const data = {
    roomId,
    sender: myName,
    message,
  };

  console.log("Sending:", data);

  socket.emit("send-message", data);

  setMessage("");

};

  // ============================
  // Enter Key
  // ============================

  const handleKeyDown=(e)=>{

    if(e.key==="Enter"){

      sendMessage();

    }

  };

  return(

    <div className="chat-container">

      <div className="chat-header">

        💬 MeetFlow Chat

      </div>

      <div className="chat-box">

        {

          messages.length===0?

          (

            <div className="empty-chat">

              <h3>

                No messages yet

              </h3>

              <p>

                Start chatting 👋

              </p>

            </div>

          )

          :

          messages.map((msg,index)=>(

            <div

              key={index}

              className={`message ${
                msg.sender===myName
                ? "my-message"
                : "other-message"
              }`}

            >

              <div className="sender">

                {msg.sender}

              </div>

              <div className="text">

                {msg.message}

              </div>

              <div className="time">

                {msg.time}

              </div>

            </div>

          ))

        }

        <div ref={messagesEndRef}></div>

      </div>

      <div className="chat-input">

        <input

          placeholder="Type a message..."

          value={message}

          onChange={(e)=>setMessage(e.target.value)}

          onKeyDown={handleKeyDown}

        />

        <button onClick={sendMessage}>

          ➤

        </button>

      </div>

    </div>

  );

}

export default Chat;