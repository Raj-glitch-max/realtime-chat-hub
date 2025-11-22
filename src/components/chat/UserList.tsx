import { Profile } from "@/pages/Chat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users } from "lucide-react";

interface UserListProps {
  profiles: Profile[];
  onlineUsers: Set<string>;
  currentUserId: string;
}

export const UserList = ({ profiles, onlineUsers, currentUserId }: UserListProps) => {
  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>Users ({profiles.length})</span>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {profiles.map((profile) => {
            const isOnline = onlineUsers.has(profile.user_id);
            const isCurrentUser = profile.user_id === currentUserId;
            
            return (
              <div
                key={profile.user_id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="relative">
                  <Avatar className="w-10 h-10 border-2 border-border">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getInitials(profile.username)}
                    </AvatarFallback>
                  </Avatar>
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-online rounded-full border-2 border-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {profile.username}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};