import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import socket from "../services/socket";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginUser = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      // Connect socket only after login
if (!socket.connected) {
  socket.connect();
} 

      alert("Login Successful");

      navigate("/dashboard");
    } catch (err) {

  console.log("FULL ERROR:", err);

  alert(
    "Message: " + err.message +
    "\n\nStatus: " + (err.response?.status || "No Status") +
    "\n\nResponse: " + JSON.stringify(err.response?.data)
  );

}

  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <form
        onSubmit={loginUser}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          width: "350px",
        }}
      >
        <div
  style={{
    textAlign: "center",
    marginBottom: "10px",
  }}
>
  <h1
    style={{
      margin: "0",
      fontSize: "80px",
      lineHeight: "1.1",
    }}
  >
    MeetFlow
  </h1>

  <h2
    style={{
      margin: "12px 0 0",
      fontSize: "50px",
      fontWeight: "500",
    }}
  >
    Login
  </h2>
</div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>

        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;