import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Board from "./pages/Board";

function App() {
  return (
    <>
      <h1 className="text-3xl font-bold text-red-500">Tailwind works!</h1>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/board" element={<Board />} />
      </Routes>
    </>
  );
}

export default App;
