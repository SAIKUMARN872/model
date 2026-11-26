
import { useNavigate } from "react-router-dom";
import { LogOut, ShieldCheck } from "lucide-react";
import "./logout.css";

export default function LogoutPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    const authKeys = [
      "token",
      "authToken",
      "accessToken",
      "modelnow-token",
      "modelnow-auth",
    ];

    authKeys.forEach((key) => localStorage.removeItem(key));

    navigate("/login", { replace: true });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <main className="logout-page">
      <section className="logout-container">
        <div className="logout-icon">
          <LogOut size={23} strokeWidth={1.8} />
        </div>

        <span className="logout-eyebrow">ACCOUNT SESSION</span>

        <h1>Log out of ModelNow?</h1>

        <p className="logout-description">
          Are you sure you want to log out of your account?
        </p>

        <div className="logout-account">
          <div className="logout-avatar">PU</div>

          <div className="logout-account-details">
            <strong>Pujitha</strong>
            <span>pujithamarikanti@gmail.com</span>
          </div>
        </div>

        <div className="logout-security-note">
          <ShieldCheck size={16} />
          <span>You'll need to log in again to access your workspace.</span>
        </div>

        <div className="logout-actions">
          <button
            type="button"
            className="logout-confirm-button"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Log out
          </button>

          <button
            type="button"
            className="logout-cancel-button"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>

        <p className="logout-footer-text">
          Your account will remain safe and secure.
        </p>
      </section>
    </main>
  );
}
