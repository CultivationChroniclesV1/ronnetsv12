import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Add some extra styles
const style = document.createElement('style');
style.textContent = `
  body {
    background-color: #FAF3E0;
    background-image: url('https://images.unsplash.com/photo-1596644462290-4d00b33c1f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80');
    background-blend-mode: overlay;
    background-size: cover;
    background-attachment: fixed;
  }
  
  .bg-scroll {
    background-color: rgba(250, 243, 224, 0.9);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
  
  .font-serif {
    font-family: 'Cinzel', serif;
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: rgba(250, 243, 224, 0.5);
  }
  
  ::-webkit-scrollbar-thumb {
    background: rgba(156, 14, 14, 0.6);
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(156, 14, 14, 0.8);
  }
`;
document.head.appendChild(style);
