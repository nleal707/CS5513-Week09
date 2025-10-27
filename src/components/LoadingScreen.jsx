"use client";

import { useState, useEffect } from "react";

export default function LoadingScreen({ message = "Generating your recipe...", className = "" }) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  
  const cookingMessages = [
    "Mixing ingredients...",
    "Preheating the oven...",
    "Adding final touches...",
    "AI is cooking up something delicious...",
    "Almost ready...",
    "Finalizing your recipe..."
  ];

  // Rotate through cooking messages every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => 
        (prevIndex + 1) % cookingMessages.length
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`loading-screen ${className}`}>
      <div className="loading-screen__content">
        <div className="chef-hat-icon">
          <div className="chef-hat"></div>
        </div>
        <p className="loading-screen__message">{cookingMessages[currentMessageIndex]}</p>
        <p className="loading-screen__submessage">This may take a few seconds</p>
      </div>
    </div>
  );
}
