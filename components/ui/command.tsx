"use client";

import * as React from "react";
import { Dialog } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";

type CommandElement = React.ElementRef<typeof CommandPrimitive>;
type CommandProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive>;

const Command = React.forwardRef<CommandElement, CommandProps>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-xs border border-mbg-black/10 bg-white text-sm",
      className,
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

type DialogProps = React.ComponentPropsWithoutRef<typeof Dialog>;
const CommandDialog: React.FC<DialogProps> = ({ children, ...props }) => (
  <Dialog {...props}>
    <Command className="shadow-lg sm:rounded-lg">{children}</Command>
  </Dialog>
);

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b border-mbg-black/10 px-3" cmdk-input-wrapper="">
    <MagnifyingGlassIcon className="mr-2 h-4 w-4 shrink-0 text-mbg-darkgrey" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-mbg-darkgrey disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  </div>
));
CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-60 overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
));
CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className={cn("py-6 text-center text-sm", className)}
    {...props}
  />
));
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-mbg-darkgrey [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
      className,
    )}
    {...props}
  />
));
CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 h-px bg-mbg-black/10", className)}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-xs px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[selected]:bg-mbg-black/10",
      className,
    )}
    {...props}
  />
));
CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ className, ...props }) => (
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
