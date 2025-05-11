import { auth, provider, signInWithPopup } from "../firebase";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    await signInWithPopup(auth, provider);
    navigate("/main");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Login with Google</h2>
      <button onClick={handleLogin}>Sign in with Google</button>
    </div>
  );
}
