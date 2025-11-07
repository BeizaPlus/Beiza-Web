import clsx from "clsx";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

type FeatureCardProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  chips?: string[];
  className?: string;
};

export const FeatureCard = ({ title, description, icon, chips, className }: FeatureCardProps) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.12, 0.23, 0.5, 1] }}
      viewport={{ once: true, margin: "-100px" }}
      className={clsx(
        "glass-panel flex h-full flex-col gap-4 rounded-[30px] border border-white/10 p-6 md:p-8",
        className
      )}
    >
      {icon ? (
        <div className="ring-background mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/60 text-white">
          {icon}
        </div>
      ) : null}
      <h3 className="text-xl font-semibold tracking-tight text-white md:text-2xl">{title}</h3>
      <p className="text-subtle text-sm leading-relaxed md:text-base">{description}</p>
      {chips && chips.length > 0 ? (
        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          {chips.map((chip) => (
            <span key={chip} className="chip text-xs">
              {chip}
            </span>
          ))}
        </div>
      ) : null}
    </motion.article>
  );
};

export default FeatureCard;
