"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function HomeClient() {
  return (
    <Button
      onClick={() => {
        toast("Setup Complete", {
          description: "The environment is fully configured and ready.",
          action: {
            label: "Close",
            onClick: () => console.log("Toast closed"),
          },
        });
      }}
    >
      Test Sonner Toast
    </Button>
  );
}
