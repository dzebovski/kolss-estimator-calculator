import React from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";

import Image from "next/image";

interface OptionCardProps {
  id: string;
  title: string;
  description?: string;
  priceDelta?: string;
  image?: string;
  selected: boolean;
  onSelect: () => void;
  className?: string;
}

export function OptionCard({
  id,
  title,
  description,
  priceDelta,
  image,
  selected,
  onSelect,
  className,
}: OptionCardProps) {
  return (
    <Card
      className={cn(
        "relative flex cursor-pointer flex-col overflow-hidden border-2 transition-all",
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-muted hover:border-primary/50",
        className
      )}
      onClick={onSelect}
    >
      <div className="absolute top-4 left-4 z-10">
        <div
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
            selected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input bg-background"
          )}
        >
          {selected && <Check className="h-3 w-3" />}
        </div>
      </div>

      <CardHeader className="flex-grow p-4 pt-10 pb-2">
        {image && (
          <div className="mb-4 flex h-28 items-center justify-center rounded-md p-2 mix-blend-multiply dark:mix-blend-screen">
            <Image
              src={image}
              alt={title}
              width={160}
              height={100}
              className={cn(
                "h-full w-auto object-contain transition-opacity",
                selected ? "opacity-100" : "opacity-60"
              )}
            />
          </div>
        )}
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {description && (
          <CardDescription className="mt-1 text-sm">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      {priceDelta && (
        <CardContent className="p-4 pt-0">
          <p className="text-muted-foreground text-sm font-medium">
            {priceDelta}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
