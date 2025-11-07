import clsx from "clsx";
import { motion, type Variants } from "framer-motion";

export type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  variant?: "dark" | "light";
};

const container: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.12, 0.23, 0.5, 1], staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.12, 0.23, 0.5, 1] } },
};

export const SectionHeader = ({ eyebrow, title, description, align = "left", className, variant = "dark" }: SectionHeaderProps) => {
  const alignment = align === "center" ? "items-center text-center" : "items-start text-left";
  const titleColor = variant === "light" ? "text-neutral-900" : "text-white";
  const eyebrowColor = variant === "light" ? "text-neutral-500" : "text-subtle";
  const descriptionColor = variant === "light" ? "text-neutral-600" : "text-subtle";

  return (
    <motion.div
      className={clsx("flex flex-col gap-3", alignment, variant === "light" ? "text-neutral-900" : "text-white", className)}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {eyebrow ? (
        <motion.span variants={item} className={clsx("text-eyebrow", eyebrowColor)}>
          {eyebrow}
        </motion.span>
      ) : null}
      <motion.h2 variants={item} className={clsx("text-display-lg", titleColor)}>
        {title}
      </motion.h2>
      {description ? (
        <motion.p variants={item} className={clsx("max-w-2xl", descriptionColor)}>
          {description}
        </motion.p>
      ) : null}
    </motion.div>
  );
};

export default SectionHeader;
