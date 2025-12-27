import { motion } from "framer-motion";

export const ArcReactor = ({
  size = 60,
  className = "",
}: {
  size?: number;
  className?: string;
}) => {
  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
      {/* Outer ring */}
      <div
        className="absolute inset-0 rounded-full border-2 border-arc-blue"
        style={{ boxShadow: "0 0 15px hsl(195 100% 50% / 0.6)" }}
      />

      {/* Middle ring */}
      <div
        className="absolute rounded-full border border-arc-blue/60"
        style={{
          inset: size * 0.15,
          boxShadow: "0 0 10px hsl(195 100% 50% / 0.4)",
        }}
      />

      {/* Inner core */}
      <motion.div
        className="absolute rounded-full bg-arc-blue"
        style={{
          inset: size * 0.35,
          boxShadow:
            "0 0 20px hsl(195 100% 50%), 0 0 40px hsl(195 100% 50% / 0.8)",
        }}
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      {/* Triangle segments */}
      {[0, 120, 240].map((rotation) => (
        <div
          key={rotation}
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <div
            className="w-1 bg-arc-blue/80"
            style={{
              height: size * 0.25,
              marginTop: -size * 0.35,
              boxShadow: "0 0 5px hsl(195 100% 50%)",
            }}
          />
        </div>
      ))}
    </motion.div>
  );
};

export const ArcReactorIcon = ({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <circle
        cx="12"
        cy="12"
        r="6"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.7"
      />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <line
        x1="12"
        y1="2"
        x2="12"
        y2="6"
        stroke="currentColor"
        strokeWidth="1"
      />
      <line
        x1="12"
        y1="18"
        x2="12"
        y2="22"
        stroke="currentColor"
        strokeWidth="1"
      />
      <line
        x1="2"
        y1="12"
        x2="6"
        y2="12"
        stroke="currentColor"
        strokeWidth="1"
      />
      <line
        x1="18"
        y1="12"
        x2="22"
        y2="12"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
};
