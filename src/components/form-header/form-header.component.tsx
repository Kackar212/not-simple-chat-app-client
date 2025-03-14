import { HTMLProps, PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

type AS = Extract<
  keyof JSX.IntrinsicElements,
  "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
>;

interface FormHeaderProps extends HTMLProps<HTMLHeadingElement> {
  Heading: AS;
}

export function FormHeader({
  children,
  Heading,
  ...attrs
}: PropsWithChildren<FormHeaderProps>) {
  return (
    <Heading
      {...attrs}
      className={twMerge(
        "text-center font-bold size text-lg text-white-500 mb-4",
        attrs.className
      )}
    >
      {children}
    </Heading>
  );
}
