import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ComponentPropsWithRef } from "react";

export interface CloseButtonProps extends ComponentPropsWithRef<"button"> {
    size?: "sm" | "md" | "lg";
}

export const CloseButton = ({ size = "md", className, ...props }: CloseButtonProps) => {
    return (
        <button
            type="button"
            className={cn(
                "inline-flex items-center justify-center rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors text-muted-foreground hover:text-foreground",
                size === "sm" && "h-8 w-8",
                size === "md" && "h-10 w-10",
                size === "lg" && "h-12 w-12",
                className
            )}
            {...props}
        >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
        </button>
    );
};
