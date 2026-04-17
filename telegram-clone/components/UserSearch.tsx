'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function UserSearch({ onSelectUser }: { onSelectUser: (userId: string) => void }) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSearch = async (query: string) => {
    setSearch(query);

    if (query.length < 2) {
      setUsers([]);
      return;
    }

    setLoading(true);

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(10);

    setUsers(data || []);
    setLoading(false);
  };

  return (
    <div className="p-4">
      <input
        type="text"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Поиск по username или имени..."
        className="w-full bg-telegram-chat border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-telegram-blue mb-2"
        autoFocus
      />

      {loading && <div className="text-center text-gray-400 py-2">Поиск...</div>}

      <div className="space-y-1 max-h-64 overflow-y-auto">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => onSelectUser(user.id)}
            className="w-full p-3 flex items-center space-x-3 hover:bg-telegram-hover rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-telegram-blue rounded-full flex items-center justify-center text-white font-semibold">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1 text-left">
              <div className="text-white font-medium">{user.full_name || user.username}</div>
              <div className="text-sm text-gray-400">@{user.username}</div>
            </div>
          </button>
        ))}
      </div>

      {search.length >= 2 && users.length === 0 && !loading && (
        <div className="text-center text-gray-400 py-4">Пользователи не найдены</div>
      )}
    </div>
  );
}
