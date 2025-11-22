import { useEffect, useRef } from "react";
import { Message } from "@/pages/Chat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  typingUsers: string[];
}

export const MessageList = ({ messages, currentUserId, typingUsers }: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
      <div className="space-y-4 max-w-4xl mx-auto">
        {messages.map((message) => {
          const isOwnMessage = message.user_id === currentUserId;
          const username = message.profiles?.username || "Unknown User";

          return (
            <div
              key={message.id}
              className={`flex gap-3 animate-slide-in ${
                isOwnMessage ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <Avatar className="w-8 h-8 border-2 border-border shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {getInitials(username)}
                </AvatarFallback>
              </Avatar>
              
              <div
                className={`flex flex-col gap-1 max-w-[70%] ${
                  isOwnMessage ? "items-end" : "items-start"
                }`}
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-medium text-foreground">
                    {username}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </span>
                </div>
                
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    isOwnMessage
                      ? "bg-chat-sent text-primary-foreground rounded-tr-sm"
                      : "bg-chat-received text-foreground rounded-tl-sm border border-border"
                  }`}
                >
                  <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {typingUsers.length > 0 && (
          <div className="flex gap-3 animate-fade-in">
            <Avatar className="w-8 h-8 border-2 border-border">
              <AvatarFallback className="bg-typing text-xs">
                ✎
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                {typingUsers.join(", ")}
              </span>
              <div className="bg-chat-received text-foreground px-4 py-2 rounded-2xl rounded-tl-sm border border-border">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-typing rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-typing rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-typing rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
};