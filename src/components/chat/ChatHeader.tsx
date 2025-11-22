import { Button } from "@/components/ui/button";
import { LogOut, MessageCircle } from "lucide-react";

interface ChatHeaderProps {
  onLogout: () => void;
  username: string;
}

export const ChatHeader = ({ onLogout, username }: ChatHeaderProps) => {
  return (
    <div className="p-4 border-b border-border bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary rounded-xl p-2">
            <MessageCircle className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">ChatFlow</h1>
            <p className="text-xs text-muted-foreground">@{username}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onLogout}
          className="hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};