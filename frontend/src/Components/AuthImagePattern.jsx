import { motion } from "framer-motion";

const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-12">
      <div className="max-w-md text-center">
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[...Array(9)].map((_, i) => (
            <motion.div
              key={i}
              className={`aspect-square rounded-xl bg-primary/10 ${
                i % 2 === 0 ? "animate-pulse" : "animate-pulse delay-200"
              }`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
              aria-hidden="true"
            />
          ))}
        </div>
        <h2 className="text-3xl font-bold mb-3 text-primary">{title}</h2>
        <p className="text-base-content/70">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;
