import { Toaster as Sonner } from "sonner";

function Toaster() {
  return (
    <Sonner
      position="top-right"
      theme="light"
      toastOptions={{
        classNames: {
          toast:
            "font-sans bg-card text-card-foreground border-border shadow-card",
          title: "text-foreground",
          description: "text-muted-foreground",
        },
      }}
    />
  );
}

export { Toaster };
