import { useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

export type Tribute = {
  name: string;
  relationship: string;
  message: string;
};

export type TributeStackProps = {
  tributes: Tribute[];
  className?: string;
};

const TributeCard = ({ tribute, index }: { tribute: Tribute; index: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 140;
  const isLong = tribute.message.length > maxLength;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.12, 0.23, 0.5, 1], delay: index * 0.05 }}
      className={clsx(
        "glass-panel flex flex-col gap-4 rounded-lg border border-white/10 p-6 transition-all",
        !isExpanded && "h-64"
      )}
    >
      <div className="flex items-center gap-3 shrink-0">
        <div className="ring-background flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold uppercase text-white shrink-0">
          {tribute.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-white truncate">{tribute.name}</p>
          <p className="text-xs uppercase tracking-[0.3em] text-subtle truncate">{tribute.relationship}</p>
        </div>
      </div>
      <div className="text-subtle text-sm leading-relaxed whitespace-pre-wrap flex-1 overflow-hidden relative">
        {isExpanded || !isLong
          ? tribute.message
          : `${tribute.message.slice(0, maxLength).trim()}...`}
        {isLong && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 mt-1 text-white hover:text-white/80 transition-colors font-medium border-b border-white/30 hover:border-white focus:outline-none shrink-0"
          >
            {isExpanded ? "Read less" : "Read more"}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export const TributeStack = ({ tributes, className }: TributeStackProps) => {
  return (
    <div className={clsx("grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
      {tributes.map((tribute, index) => (
        <TributeCard key={`${tribute.name}-${index}`} tribute={tribute} index={index} />
      ))}
    </div>
  );
};

export default TributeStack;
