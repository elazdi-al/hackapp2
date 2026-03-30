import { AIPrompt } from "./components/prompt";

export default function Home() {
  return (
    <main className="min-h-svh flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6">
        <AIPrompt />
      </div>
    </main>
  );
}
