
"use client";

import { useRouter } from "next/navigation";
import { LogOut, Sparkles, ArrowLeft } from "lucide-react";

export default function LogoutPage() {
  const router = useRouter();

  function handleLogout() {
    const authKeys = [
      "token",
      "accessToken",
      "authToken",
      "user",
      "currentUser",
      "modelnow-demo-user",
    ];

    authKeys.forEach((key) => localStorage.removeItem(key));
    sessionStorage.clear();

    router.replace("/login");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#f7f8fa",
        color: "#171923",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "36px",
          background: "#fff",
          border: "1px solid #e7e9ee",
          borderRadius: "18px",
          boxShadow: "0 15px 45px rgba(18,27,54,0.09)",
          textAlign: "center",
        }}
      >
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "9px",
          marginBottom: "30px",
        }}>
          <Sparkles size={27} color="#315fea" />
          <span style={{ fontSize: "23px", fontWeight: 750 }}>
            ModelNow
          </span>
        </div>

        <div style={{
          width: "66px",
          height: "66px",
          margin: "0 auto 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background: "#edf2ff",
          color: "#315fea",
        }}>
          <LogOut size={29} />
        </div>

        <h1 style={{
          margin: "0 0 12px",
          fontSize: "25px",
          fontWeight: 750,
        }}>
          Log out of ModelNow?
        </h1>

        <p style={{
          margin: "0 0 28px",
          color: "#737887",
          fontSize: "13px",
          lineHeight: 1.7,
        }}>
          Are you sure you want to log out of your current session?
        </p>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            width: "100%",
            minHeight: "46px",
            border: "none",
            borderRadius: "9px",
            background: "#315fea",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <LogOut size={16} style={{ display: "inline", marginRight: "8px" }} />
          Log out
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          style={{
            width: "100%",
            minHeight: "44px",
            marginTop: "11px",
            border: "1px solid #e7e9ee",
            borderRadius: "9px",
            background: "#fff",
            color: "#424858",
            fontSize: "13px",
            fontWeight: 650,
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={16} style={{ display: "inline", marginRight: "8px" }} />
          Cancel
        </button>

        <p style={{
          marginTop: "24px",
          color: "#94a3b8",
          fontSize: "11px",
        }}>
          ModelNow Administration Console
        </p>
      </section>
    </main>
  );
}
