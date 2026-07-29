"use client";

import React, { ComponentPropsWithRef, createContext, useContext } from "react";
import { Folder, File, Search, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface RootContextProps {
    size?: "sm" | "md" | "lg";
}

const RootContext = createContext<RootContextProps>({ size: "lg" });

interface RootProps extends ComponentPropsWithRef<"div">, RootContextProps {}

const Root = React.forwardRef<HTMLDivElement, RootProps>(({ size = "lg", className, ...props }, ref) => {
    return (
        <RootContext.Provider value={{ size }}>
            <div ref={ref} {...props} className={cn("mx-auto flex w-full max-w-lg flex-col items-center justify-center", className)} />
        </RootContext.Provider>
    );
});
Root.displayName = "EmptyState";

interface FeaturedIconProps extends ComponentPropsWithRef<"div"> {
    icon?: LucideIcon;
    size?: "sm" | "md" | "lg" | "xl";
}

const FeaturedIcon = React.forwardRef<HTMLDivElement, FeaturedIconProps>(({ icon: Icon = Search, size, className, ...props }, ref) => {
    const { size: rootSize } = useContext(RootContext);
    const computedSize = size || (!size && rootSize === "lg" ? "xl" : "lg");
    
    return (
        <div 
          ref={ref} 
          {...props} 
          className={cn(
              "flex items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900",
              computedSize === "sm" ? "size-10" : computedSize === "md" ? "size-12" : computedSize === "lg" ? "size-14" : "size-16",
              className
          )}
        >
            <Icon className={cn(
                "text-zinc-600 dark:text-zinc-400",
                computedSize === "sm" ? "size-5" : computedSize === "md" ? "size-6" : computedSize === "lg" ? "size-7" : "size-8"
            )} />
        </div>
    );
});
FeaturedIcon.displayName = "EmptyStateFeaturedIcon";

const FileTypeIcon = React.forwardRef<HTMLDivElement, ComponentPropsWithRef<"div"> & { type?: "folder" | "file" }>(({ type = "folder", className, ...props }, ref) => {
    const Icon = type === "folder" ? Folder : File;
    return (
        <div ref={ref} {...props} className={cn("relative z-10 flex rounded-full bg-gradient-to-b from-neutral-50 to-neutral-200 dark:from-zinc-800 dark:to-zinc-900 p-8", className)}>
            <Icon className="size-10 text-zinc-500 drop-shadow-sm" />
        </div>
    );
});
FileTypeIcon.displayName = "EmptyStateFileTypeIcon";

interface HeaderProps extends ComponentPropsWithRef<"header"> {
    pattern?: "none" | "circle";
}

const Header = React.forwardRef<HTMLElement, HeaderProps>(({ pattern = "circle", className, children, ...props }, ref) => {
    const { size } = useContext(RootContext);
    
    return (
        <header
            ref={ref}
            {...props}
            className={cn("relative mb-4 flex items-center justify-center", (size === "md" || size === "lg") && "mb-5", className)}
        >
            {pattern === "circle" && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[120%] min-w-[200px] rounded-full bg-[radial-gradient(circle_at_center,theme(colors.zinc.100)_0%,transparent_70%)] dark:bg-[radial-gradient(circle_at_center,theme(colors.zinc.800/50)_0%,transparent_70%)] -z-10" />
            )}
            {children}
        </header>
    );
});
Header.displayName = "EmptyStateHeader";

const Content = React.forwardRef<HTMLElement, ComponentPropsWithRef<"main">>(({ className, ...props }, ref) => {
    const { size } = useContext(RootContext);

    return (
        <main
            ref={ref}
            {...props}
            className={cn(
                "z-10 mb-6 flex w-full max-w-md flex-col items-center justify-center gap-1",
                (size === "md" || size === "lg") && "mb-8 gap-2",
                className,
            )}
        />
    );
});
Content.displayName = "EmptyStateContent";

const Footer = React.forwardRef<HTMLElement, ComponentPropsWithRef<"footer">>(({ className, ...props }, ref) => {
    return <footer ref={ref} {...props} className={cn("z-10 flex gap-3", className)} />;
});
Footer.displayName = "EmptyStateFooter";

const Title = React.forwardRef<HTMLHeadingElement, ComponentPropsWithRef<"h1">>(({ className, ...props }, ref) => {
    const { size } = useContext(RootContext);

    return (
        <h1
            ref={ref}
            {...props}
            className={cn(
                "text-base font-semibold text-zinc-900 dark:text-zinc-100",
                size === "md" && "text-lg font-semibold",
                size === "lg" && "text-xl font-semibold",
                className,
            )}
        />
    );
});
Title.displayName = "EmptyStateTitle";

const Description = React.forwardRef<HTMLParagraphElement, ComponentPropsWithRef<"p">>(({ className, ...props }, ref) => {
    const { size } = useContext(RootContext);

    return <p ref={ref} {...props} className={cn("text-center text-sm text-zinc-500 dark:text-zinc-400", size === "lg" && "text-base", className)} />;
});
Description.displayName = "EmptyStateDescription";

const EmptyState = Object.assign(Root, {
    Title,
    Header,
    Footer,
    Content,
    Description,
    FeaturedIcon,
    FileTypeIcon,
});

export { EmptyState };
