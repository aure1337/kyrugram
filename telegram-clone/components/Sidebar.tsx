'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import UserSearch from './UserSearch';

interface Chat {
  id: string;
  other_user: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  last_message: {
    content: string;
    created_at: string;
  } | null;
}

export default function Sidebar({
  selectedChatId,
  onSelectChat,
  onShowProfile,
  onLogout,
  currentUser,
}: {
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onShowProfile: () => void;
  onLogout: () => void;
  currentUser: any;
}) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadChats();

    const channel = supabase
      .channel('chats-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => {
          loadChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadChats = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return;

    const { data: chatParticipants } = await supabase
      .from('chat_participants')
      .select('chat_id')
      .eq('user_id', session.user.id);

    if (!chatParticipants) return;

    const chatIds = chatParticipants.map((cp) => cp.chat_id);

    const chatsData: Chat[] = [];

    for (const chatId of chatIds) {
      const { data: participants } = await supabase
        .from('chat_participants')
        .select('user_id')
        .eq('chat_id', chatId);

      const otherUserId = participants?.find((p) => p.user_id !== session.user.id)?.user_id;

      if (!otherUserId) continue;

      const { data: otherUser } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherUserId)
        .single();

      const { data: lastMessage } = await supabase
        .from('messages')
        .select('content, created_at')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (otherUser) {
        chatsData.push({
          id: chatId,
          other_user: otherUser,
          last_message: lastMessage,
        });
      }
    }

    chatsData.sort((a, b) => {
      const aTime = a.last_message?.created_at || '0';
      const bTime = b.last_message?.created_at || '0';
      return bTime.localeCompare(aTime);
    });

    setChats(chatsData);
  };

  return (
    <div className="w-80 bg-telegram-sidebar border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <button
          onClick={onShowProfile}
          className="flex items-center space-x-3 hover:bg-telegram-hover rounded-lg p-2 transition-colors"
        >
          <div className="w-10 h-10 bg-telegram-blue rounded-full flex items-center justify-center text-white font-semibold">
            {currentUser?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="text-left">
            <div className="text-white font-medium">{currentUser?.full_name || currentUser?.username}</div>
            <div className="text-gray-400 text-sm">@{currentUser?.username}</div>
          </div>
        </button>
        <button
          onClick={onLogout}
          className="p-2 hover:bg-telegram-hover rounded-lg transition-colors text-gray-400 hover:text-white"
          title="Выйти"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      <div className="p-4 border-b border-gray-700">
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="w-full bg-telegram-chat hover:bg-telegram-hover text-gray-400 rounded-lg px-4 py-2 text-left transition-colors"
        >
          Поиск пользователей...
        </button>
      </div>

      {showSearch && (
        <div className="border-b border-gray-700">
          <UserSearch
            onSelectUser={(userId) => {
              setShowSearch(false);
              // Создаем или открываем чат
              supabase.rpc('get_or_create_direct_chat', { other_user_id: userId }).then(({ data }) => {
                if (data) {
                  onSelectChat(data);
                  loadChats();
                }
              });
            }}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`w-full p-4 flex items-start space-x-3 hover:bg-telegram-hover transition-colors border-b border-gray-700/50 ${
              selectedChatId === chat.id ? 'bg-telegram-hover' : ''
            }`}
          >
            <div className="w-12 h-12 bg-telegram-blue rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
              {chat.other_user.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-1">
                <div className="text-white font-medium truncate">
                  {chat.other_user.full_name || chat.other_user.username}
                </div>
                {chat.last_message && (
                  <div className="text-xs text-gray-500 ml-2">
                    {formatDistanceToNow(new Date(chat.last_message.created_at), {
                      addSuffix: true,
                      locale: ru,
                    })}
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-400 truncate">
                {chat.last_message?.content || 'Нет сообщений'}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
