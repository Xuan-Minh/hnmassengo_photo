import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const LoadingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const colors = ["#C8C7C6", "#F4F3F2", "#E0DFDE", "#D1D0CF"];

  // Change background every 800ms
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % colors.length);
    }, 800);

    return () => clearInterval(interval);
  }, [colors.length]);

  // Handle click to trigger exit animation
  const [isExiting, setIsExiting] = useState(false);
  const handleExit = () => setIsExiting(true);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: colors[currentIndex] }}
      initial={{ y: 0 }}
      animate={isExiting ? { y: "-100%", opacity: 0 } : {}}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      onMouseMove={() => setHovered(true)}
    >
      <button
        onClick={handleExit}
        className="px-6 py-3 border rounded-full text-lg font-medium"
        style={{
          color: hovered ? "#F4F3F2" : "#C8C7C6",
          borderColor: hovered ? "#F4F3F2" : "#C8C7C6",
        }}
      >
        Next →
      </button>
    </motion.div>
  );
};

export default LoadingScreen;
