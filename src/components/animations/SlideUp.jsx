import React from "react";
import { motion } from "framer-motion";

export default function SlideUp({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      className={className}
      initial={{ y: 14, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: "spring", stiffness: 220, damping: 20, delay }}
    >
      {children}
    </motion.div>
  );
}
