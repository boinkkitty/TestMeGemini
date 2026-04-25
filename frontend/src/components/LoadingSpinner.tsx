import React from "react";

function LoadingSpinner({ message = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <div
        className="w-8 h-8 rounded-full border-2 border-border border-t-primary animate-spin"
        style={{ animationDuration: "0.75s" }}
      />
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  );
}

export default LoadingSpinner;
