import { cn } from "@/lib/utils";

const H1 = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <h1
      className={cn("uppercase font-black text-6xl text-mbg-black", className)}
    >
      {children}
    </h1>
  );
};

export { H1 };
