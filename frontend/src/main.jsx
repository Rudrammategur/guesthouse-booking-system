import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ReactDOM from "react-dom/client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/theme.css";
import "./index.css";
// import "./styles/variables.css";
import App from "./App.jsx";
import UserProvider from "./context/UserProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <UserProvider>
    <App />
    <ToastContainer position="top-right" autoClose={3000} />
  </UserProvider>
);


