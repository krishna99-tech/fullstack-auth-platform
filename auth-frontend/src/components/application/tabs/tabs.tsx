import * as React from "react";
import { cn } from "@/lib/utils";
import type { Key } from "react-aria-components";

interface TabItemData {
  id: string;
  label: string;
  badge?: number;
}

interface TabsProps {
  selectedKey?: Key;
  onSelectionChange?: (key: Key) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs = ({ selectedKey, onSelectionChange, children, className }: TabsProps) => {
  return (
    <div className={cn("w-full", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            selectedKey,
            onSelectionChange,
          });
        }
        return child;
      })}
    </div>
  );
};

interface TabsListProps {
  type?: "button-minimal" | "underline" | "pills";
  items: TabItemData[];
  children: (item: TabItemData) => React.ReactElement<any>;
  selectedKey?: Key;
  onSelectionChange?: (key: Key) => void;
}

const TabsList = ({
  type = "button-minimal",
  items,
  children,
  selectedKey,
  onSelectionChange,
}: TabsListProps) => {
  return (
    <div className="flex gap-2 p-1 bg-muted/50 rounded-xl w-max border border-border">
      {items.map((item) => {
        const child = children(item);
        return React.cloneElement(child, {
          key: item.id,
          isActive: selectedKey === item.id,
          onClick: () => onSelectionChange?.(item.id),
        });
      })}
    </div>
  );
};

interface TabsItemProps extends TabItemData {
  isActive?: boolean;
  onClick?: () => void;
}

const TabsItem = ({ id, label, badge, isActive, onClick }: TabsItemProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer",
        isActive
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
      )}
    >
      {label}
      {badge !== undefined && (
        <span
          className={cn(
            "ml-1 px-1.5 py-0.5 text-xs rounded-full font-bold",
            isActive
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );
};

Tabs.List = TabsList;
Tabs.Item = TabsItem;
