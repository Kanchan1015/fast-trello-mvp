import React, { useEffect } from "react";

export default function Dashboard() {
  useEffect(() => {
    document.getElementById("main-heading")?.focus();
  }, []);
  return <div>Dashboard</div>;
}
