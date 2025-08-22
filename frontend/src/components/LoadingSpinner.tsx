import React from "react";

export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem" }}>
      <div className="spinner" style={{
        width: "40px",
        height: "40px",
        border: "4px solid #ccc",
        borderTop: "4px solid #0070f3",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
      }} />
      <div style={{ marginTop: "1rem", color: "#555" }}>{message}</div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      `}</style>
    </div>
  );
}
