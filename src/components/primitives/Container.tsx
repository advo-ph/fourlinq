import { cn } from "@/lib/utils";
import { HTMLAttributes, ReactNode } from "react";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  width?: "editorial" | "reading";
  as?: "div" | "section" | "article" | "main";
}

const Container = ({
  children,
  width = "editorial",
  as: Tag = "div",
  className,
  ...rest
}: ContainerProps) => (
  <Tag
    className={cn(
      width === "editorial" ? "container-editorial" : "container-reading",
      className
    )}
    {...rest}
  >
    {children}
  </Tag>
);

export default Container;
