import { Board } from "@/components/Board";
import { CardModal } from "@/components/CardModal";
import { CommandPalette } from "@/components/CommandPalette";
import { Toasts } from "@/components/Toasts";
import { Toolbar } from "@/components/Toolbar";
import { AppProvider } from "@/lib/store";

export default function Home() {
  return (
    <AppProvider>
      <div className="flex h-screen flex-col">
        <Toolbar />
        <Board />
        <CardModal />
        <CommandPalette />
        <Toasts />
      </div>
    </AppProvider>
  );
}
