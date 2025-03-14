import { Link, LinkProps } from "@components/link/link.component";
import { twMerge } from "tailwind-merge";

export function TextLink({ children, className, ...props }: LinkProps) {
  return (
    <Link
      {...props}
      className={twMerge(
        "px-1 shadow-bottom hover:shadow-bottom-2 font-normal text-white-500 hover:text-yellow-500",
        className
      )}
    >
      {children}
    </Link>
  );
}
