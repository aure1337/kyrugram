'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

interface ChatUser {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

export default function ChatWindow({
  chatId,
  currentUser,
}: {
  chatId: string | null;
  currentUser: any;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<ChatUser | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setOtherUser(null);
      return;
    }

    loadMessages();
    loadOtherUser();

    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    if (!chatId) return;

    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const loadOtherUser = async () => {
    if (!chatId || !currentUser) return;

    const { data: participants }: { data: any } = await supabase
      .from('chat_participants')
      .select('user_id')
      .eq('chat_id', chatId);

    const otherUserId = participants?.find((p: any) => p.user_id !== currentUser.id)?.user_id;

    if (otherUserId) {
      const { data: user } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherUserId)
        .single();

      if (user) {
        setOtherUser(user);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId || !currentUser || loading) return;

    setLoading(true);

    try {
      const { error } = await supabase.from('messages').insert([{
        chat_id: chatId,
        sender_id: currentUser.id,
        content: newMessage.trim(),
      }]);

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-telegram-chat">
        <div className="text-center text-gray-500">
          <svg
            className="w-24 h-24 mx-auto mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-xl">Выберите чат, чтобы начать общение</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-telegram-chat">
      {otherUser && (
        <div className="p-4 border-b border-gray-700 bg-telegram-sidebar">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-telegram-blue rounded-full flex items-center justify-center text-white font-semibold">
              {otherUser.username[0].toUpperCase()}
            </div>
            <div>
              <div className="text-white font-medium">
                {otherUser.full_name || otherUser.username}
              </div>
              <div className="text-sm text-gray-400">@{otherUser.username}</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.sender_id === currentUser?.id;
          return (
            <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-md px-4 py-2 rounded-2xl ${
                  isOwn
                    ? 'bg-telegram-blue text-white rounded-br-sm'
                    : 'bg-telegram-message text-white rounded-bl-sm'
                }`}
              >
                <p className="break-words">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {format(new Date(message.created_at), 'HH:mm', { locale: ru })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700 bg-telegram-sidebar">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Написать сообщение..."
            className="flex-1 bg-telegram-chat border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-telegram-blue"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || loading}
            className="bg-telegram-blue hover:bg-telegram-darkblue text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
