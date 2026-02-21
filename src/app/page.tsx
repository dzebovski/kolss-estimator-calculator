"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center gap-8 p-8 font-sans">
      <header className="flex w-full max-w-4xl items-center justify-between border-b pb-4">
        <h1 className="text-2xl font-bold">Kolss Estimator Calculator</h1>
        <ModeToggle />
      </header>

      <main className="flex w-full max-w-4xl flex-grow flex-col gap-8">
        <div className="mt-20 flex flex-col items-center justify-center gap-6">
          <p className="text-muted-foreground text-center">
            Environment is successfully set up with Tailwind v4, Shadcn UI, Dark
            Mode, and Sonner Toasts.
          </p>

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
        </div>
      </main>
    </div>
  );
}
