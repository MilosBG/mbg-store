"use client";

import * as React from "react";
import { Dialog } from "@radix-ui/react-dialog";
import * as CommandPrimitive from "@radix-ui/react-command";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";

const Command = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Command>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.Command
      ref={ref}
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-xs border border-mbg-black/10 bg-white text-sm",
        className,
      )}
      {...props}
    />
  ),
);
Command.displayName = CommandPrimitive.Command.displayName;

const CommandDialog = ({ children, ...props }: React.ComponentPropsWithoutRef<typeof Dialog>) => (
  <Dialog {...props}>
    <Command className="shadow-lg sm:rounded-lg">{children}</Command>
  </Dialog>
);

const CommandInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.CommandInput>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b border-mbg-black/10 px-3" cmdk-input-wrapper="">
    <MagnifyingGlassIcon className="mr-2 h-4 w-4 shrink-0 text-mbg-darkgrey" />
    <CommandPrimitive.CommandInput
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-mbg-darkgrey disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  </div>
));
CommandInput.displayName = CommandPrimitive.CommandInput.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.CommandList>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.CommandList>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.CommandList
    ref={ref}
    className={cn("max-h-60 overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
));
CommandList.displayName = CommandPrimitive.CommandList.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.CommandEmpty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.CommandEmpty>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.CommandEmpty
    ref={ref}
    className={cn("py-6 text-center text-sm", className)}
    {...props}
  />
));
CommandEmpty.displayName = CommandPrimitive.CommandEmpty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.CommandGroup>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.CommandGroup>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.CommandGroup
    ref={ref}
    className={cn("overflow-hidden p-1 text-mbg-darkgrey [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium", className)}
    {...props}
  />
));
CommandGroup.displayName = CommandPrimitive.CommandGroup.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.CommandSeparator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.CommandSeparator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.CommandSeparator
    ref={ref}
    className={cn("-mx-1 h-px bg-mbg-black/10", className)}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.CommandSeparator.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.CommandItem>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.CommandItem>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.CommandItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-xs px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[selected]:bg-mbg-black/5",
      className,
    )}
    {...props}
  />
));
CommandItem.displayName = CommandPrimitive.CommandItem.displayName;

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn("ml-auto text-xs tracking-widest text-mbg-darkgrey", className)}
    {...props}
  />
);
CommandShortcut.displayName = "CommandShortcut";

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
};
