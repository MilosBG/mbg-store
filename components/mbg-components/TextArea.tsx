import React from "react";
import { cn } from "@/lib/utils";

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}
const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "text-mbg-green bg-mbg-rgbablank border-mbg-rgbalight focus:ring-mbg-green w-full rounded-xs border px-3 py-2 text-xs focus:ring-2 focus:outline-none",
          className,
        )}
        {...props}
      />
    );
  },
);

TextArea.displayName = "TextArea";
export default TextArea;
