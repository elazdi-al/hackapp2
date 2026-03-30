import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-svh">
      <header className="flex items-center justify-end gap-2 px-4 py-3">
        <Button variant="ghost" size="sm">Sign in</Button>
        <Button size="sm">Get started</Button>
      </header>
    </main>
  );
}
