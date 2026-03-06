import { forwardRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type CTAButtonBaseProps = {
  label: string;
  className?: string;
  icon?: ReactNode;
};

type CTAButtonLinkProps = CTAButtonBaseProps & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  to: string;
  href?: never;
  external?: never;
};

type CTAButtonAnchorProps = CTAButtonBaseProps & React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  external?: boolean;
  to?: never;
};

type CTAButtonButtonProps = CTAButtonBaseProps & React.ButtonHTMLAttributes<HTMLButtonElement> & {
  to?: never;
  href?: never;
  external?: never;
};

export type CTAButtonProps = CTAButtonLinkProps | CTAButtonAnchorProps | CTAButtonButtonProps;

const DefaultArrow = () => (
  <span className="ring-background flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 12L12 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 4H12V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

export const CTAButton = forwardRef<HTMLElement, CTAButtonProps>(
  ({ label, className, icon, ...rest }, ref) => {
    const classes = cn("button-pill bg-white text-black", className);
    const trailingIcon = icon ?? <DefaultArrow />;

    if ("to" in rest && rest.to)
    {
      const { to, external, ...props } = rest as any;
      return (
        <Link ref={ref as any} to={to} className={classes} {...props}>
          <span>{label}</span>
          {trailingIcon}
        </Link>
      );
    }

    if ("href" in rest && rest.href)
    {
      const { href, external, to, ...props } = rest as any;
      return (
        <a
          ref={ref as any}
          href={href!}
          className={classes}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          {...props}
        >
          <span>{label}</span>
          {trailingIcon}
        </a>
      );
    }

    const { to, href, external, ...props } = rest as any;
    return (
      <button ref={ref as any} className={classes} {...props}>
        <span>{label}</span>
        {trailingIcon}
      </button>
    );
  }
);

CTAButton.displayName = "CTAButton";
