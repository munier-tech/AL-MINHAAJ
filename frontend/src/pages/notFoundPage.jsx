import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  return (
    <motion.div
      className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-white  to-white via-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <AlertTriangle className="text-red-500 mx-auto mb-4" size={50} />
        <h1 className="text-4xl font-bold text-gray-800 mb-2">404 - Not Found</h1>
        <p className="text-gray-600 mb-6">
          The page you are looking for does not exist.
        </p>
        <Link
          to="/"
          className="px-6 py-2 text-white bg-emerald-500 hover:bg-emerald-600 transition duration-300 rounded-md"
        >
          Go Back Home
        </Link>
      </div>
    </motion.div>
  );
};

export default NotFound;
