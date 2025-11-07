import { forwardRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";

type CTAButtonBaseProps = {
  label: string;
  className?: string;
  icon?: ReactNode;
};

type CTAButtonLinkProps = CTAButtonBaseProps & {
  to: string;
  href?: never;
  external?: never;
};

type CTAButtonAnchorProps = CTAButtonBaseProps & {
  href: string;
  external?: boolean;
  to?: never;
};

export type CTAButtonProps = CTAButtonLinkProps | CTAButtonAnchorProps;

const DefaultArrow = () => (
  <span className="ring-background flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 12L12 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 4H12V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

export const CTAButton = forwardRef<HTMLAnchorElement, CTAButtonProps>(
  ({ label, className, icon, ...rest }, ref) => {
    const classes = clsx("button-pill bg-white text-black", className);
    const trailingIcon = icon ?? <DefaultArrow />;

    if ("to" in rest)
    {
      return (
        <Link ref={ref} to={rest.to} className={classes}>
          <span>{label}</span>
          {trailingIcon}
        </Link>
      );
    }

    const { href, external } = rest;
    return (
      <a
        ref={ref}
        href={href}
        className={classes}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        <span>{label}</span>
        {trailingIcon}
      </a>
    );
  }
);

CTAButton.displayName = "CTAButton";
