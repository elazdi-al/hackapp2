import { Button } from "@/components/ui/button";
import { AIPrompt } from "./components/prompt";

export default function Home() {
  return (
    <main className="min-h-svh flex flex-col">
      <header className="flex items-center justify-end gap-2 px-4 py-3">
        <Button variant="ghost" size="sm">Sign in</Button>
        <Button size="sm">Get started</Button>
      </header>
      <div className="flex-1 flex items-center justify-center px-6">
        <AIPrompt />
      </div>
    </main>
  );
}
