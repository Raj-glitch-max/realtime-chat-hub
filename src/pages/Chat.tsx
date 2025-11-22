import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { UserList } from "@/components/chat/UserList";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { useToast } from "@/hooks/use-toast";

export type Message = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
};

export type Profile = {
  user_id: string;
  username: string;
  avatar_url: string | null;
};

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const channelRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    // Fetch initial messages
    const fetchMessages = async () => {
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(100);

      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        toast({
          title: "Error loading messages",
          description: messagesError.message,
          variant: "destructive",
        });
        return;
      }

      if (!messagesData) return;

      // Fetch profiles for all user_ids in messages
      const userIds = [...new Set(messagesData.map(m => m.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url")
        .in("user_id", userIds);

      // Create a map of user_id to profile
      const profileMap = new Map(
        profilesData?.map(p => [p.user_id, p]) || []
      );

      // Combine messages with profiles
      const messagesWithProfiles = messagesData.map(msg => ({
        ...msg,
        profiles: profileMap.get(msg.user_id) || {
          username: "Unknown",
          avatar_url: null,
        },
      }));

      setMessages(messagesWithProfiles as Message[]);
    };

    fetchMessages();

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          // Fetch profile data for the new message
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("user_id", payload.new.user_id)
            .single();

          const newMessage = {
            ...payload.new,
            profiles: profile,
          } as Message;

          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [user, toast]);

  useEffect(() => {
    if (!user) return;

    // Fetch all profiles
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url");

      if (error) {
        console.error("Error fetching profiles:", error);
      } else if (data) {
        setProfiles(data as Profile[]);
      }
    };

    fetchProfiles();

    // Set up presence channel for online status and typing indicators
    const presenceChannel = supabase.channel("room:lobby");
    channelRef.current = presenceChannel;

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const online = new Set<string>();
        
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            online.add(presence.user_id);
            
            if (presence.typing && presence.user_id !== user.id) {
              setTypingUsers((prev) => {
                const newMap = new Map(prev);
                newMap.set(presence.user_id, presence.username);
                return newMap;
              });
              
              // Clear typing indicator after 3 seconds
              setTimeout(() => {
                setTypingUsers((prev) => {
                  const newMap = new Map(prev);
                  newMap.delete(presence.user_id);
                  return newMap;
                });
              }, 3000);
            } else if (!presence.typing) {
              setTypingUsers((prev) => {
                const newMap = new Map(prev);
                newMap.delete(presence.user_id);
                return newMap;
              });
            }
          });
        });
        
        setOnlineUsers(online);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Track initial presence
          await presenceChannel.track({
            user_id: user.id,
            username: profiles.find(p => p.user_id === user.id)?.username || "User",
            online_at: new Date().toISOString(),
            typing: false,
          });
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [user, profiles]);

  const handleSendMessage = async (content: string) => {
    if (!user || !content.trim()) return;

    const { error } = await supabase.from("messages").insert({
      user_id: user.id,
      content: content.trim(),
    });

    if (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    }

    // Stop typing indicator after sending
    if (channelRef.current) {
      await channelRef.current.track({
        user_id: user.id,
        username: profiles.find(p => p.user_id === user.id)?.username || "User",
        online_at: new Date().toISOString(),
        typing: false,
      });
    }
  };

  const handleTyping = async () => {
    if (!user || !channelRef.current) return;

    // Update presence to show typing
    await channelRef.current.track({
      user_id: user.id,
      username: profiles.find(p => p.user_id === user.id)?.username || "User",
      online_at: new Date().toISOString(),
      typing: true,
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(async () => {
      if (channelRef.current) {
        await channelRef.current.track({
          user_id: user.id,
          username: profiles.find(p => p.user_id === user.id)?.username || "User",
          online_at: new Date().toISOString(),
          typing: false,
        });
      }
    }, 2000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-chat-bg">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-72 bg-card border-r border-border flex-col">
        <ChatHeader onLogout={handleLogout} username={profiles.find(p => p.user_id === user.id)?.username || "User"} />
        <UserList profiles={profiles} onlineUsers={onlineUsers} currentUserId={user.id} />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        <div className="md:hidden">
          <ChatHeader onLogout={handleLogout} username={profiles.find(p => p.user_id === user.id)?.username || "User"} />
        </div>
        
        <MessageList 
          messages={messages} 
          currentUserId={user.id} 
          typingUsers={Array.from(typingUsers.values())}
        />
        
        <MessageInput 
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
        />
      </div>
    </div>
  );
};

export default Chat;