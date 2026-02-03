import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CornerDotsBoxProps {
  children: ReactNode;
  className?: string;
  dotClassName?: string;
  dotSize?: "xs" | "sm" | "md" | "lg" | number;
  dotColor?: string;
  borderColor?: string;
  bgColor?: string;
  textColor?: string;
  as?: "span" | "div" | "button" | "h1" | "h2" | "h3" | "p" | "section";
}

const dotSizes = {
  xs: "h-[2px] w-[2px]",
  sm: "h-[3px] w-[3px]",
  md: "h-1 w-1",
  lg: "h-1.5 w-1.5",
};

export function CornerDotsBox({
  children,
  className,
  dotClassName,
  dotSize = "sm",
  dotColor = "bg-white",
  borderColor = "border-[#E8602E]",
  bgColor = "bg-[#E8602E21]",
textColor = "text-white",
  as: Component = "span",
}: CornerDotsBoxProps) {
  const sizeClass = typeof dotSize === "number" ? "" : dotSizes[dotSize];
  const customSizeStyle = typeof dotSize === "number" ? { width: dotSize, height: dotSize } : undefined;

  const dotBase = cn("absolute z-10", sizeClass, dotColor, dotClassName);

  return (
    <Component
      className={cn(
        "relative inline-flex " + textColor + " items-center justify-center px-2 sm:px-3 border",
        borderColor,
        bgColor,
        className
      )}
    >
      {children}
      {/* Top Left */}
      <span
        className={cn(dotBase, "top-0 left-0 -translate-x-1/2 -translate-y-1/2")}
        style={customSizeStyle}
      />
      {/* Top Right */}
      <span
        className={cn(dotBase, "top-0 right-0 translate-x-1/2 -translate-y-1/2")}
        style={customSizeStyle}
      />
      {/* Bottom Left */}
      <span
        className={cn(dotBase, "bottom-0 left-0 -translate-x-1/2 translate-y-1/2")}
        style={customSizeStyle}
      />
      {/* Bottom Right */}
      <span
        className={cn(dotBase, "bottom-0 right-0 translate-x-1/2 translate-y-1/2")}
        style={customSizeStyle}
      />
    </Component>
  );
}

interface CornerDotsProps {
  className?: string;
  dotSize?: "xs" | "sm" | "md" | "lg" | number;
  dotColor?: string;
}

// Export just the dots as a separate component for more flexibility
export function CornerDots({
  className,
  dotSize = "sm",
  dotColor = "bg-white",
}: CornerDotsProps) {
  const sizeClass = typeof dotSize === "number" ? "" : dotSizes[dotSize];
  const customSizeStyle = typeof dotSize === "number" ? { width: dotSize, height: dotSize } : undefined;

  const dotBase = cn("absolute z-10", sizeClass, dotColor, className);

  return (
    <>
      <span
        className={cn(dotBase, "top-0 left-0 -translate-x-1/2 -translate-y-1/2")}
        style={customSizeStyle}
      />
      <span
        className={cn(dotBase, "top-0 right-0 translate-x-1/2 -translate-y-1/2")}
        style={customSizeStyle}
      />
      <span
        className={cn(dotBase, "bottom-0 left-0 -translate-x-1/2 translate-y-1/2")}
        style={customSizeStyle}
      />
      <span
        className={cn(dotBase, "bottom-0 right-0 translate-x-1/2 translate-y-1/2")}
        style={customSizeStyle}
      />
    </>
  );
}

export default CornerDotsBox;
