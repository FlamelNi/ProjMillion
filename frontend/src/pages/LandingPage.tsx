import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>My Calendar App</h1>
      <button style={{ position: "absolute", top: 10, right: 10 }} onClick={() => navigate("/login")}>
        Login
      </button>
    </div>
  );
}
