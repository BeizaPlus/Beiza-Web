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

export const TributeStack = ({ tributes, className }: TributeStackProps) => {
  return (
    <div className={clsx("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
      {tributes.map((tribute, index) => (
        <motion.div
          key={`${tribute.name}-${index}`}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.12, 0.23, 0.5, 1], delay: index * 0.05 }}
          className="glass-panel flex flex-col gap-4 rounded-lg border border-white/10 p-6"
        >
          <div className="flex items-center gap-3">
            <div className="ring-background flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold uppercase text-white">
              {tribute.name
                .split(" ")
                .map((part) => part[0])
                .join("")}
            </div>
            <div>
              <p className="font-medium text-white">{tribute.name}</p>
              <p className="text-xs uppercase tracking-[0.3em] text-subtle">{tribute.relationship}</p>
            </div>
          </div>
          <p className="text-subtle text-sm leading-relaxed">{tribute.message}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default TributeStack;
