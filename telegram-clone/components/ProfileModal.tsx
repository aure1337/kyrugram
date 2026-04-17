'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ProfileModal({
  user,
  onClose,
  onUpdate,
}: {
  user: any;
  onClose: () => void;
  onUpdate: (user: any) => void;
}) {
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          bio: bio,
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      onUpdate(data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ошибка обновления профиля');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-telegram-sidebar rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Редактировать профиль</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-center">
            <div className="w-24 h-24 bg-telegram-blue rounded-full flex items-center justify-center text-white text-3xl font-semibold">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
            <input
              type="text"
              value={user?.username || ''}
              disabled
              className="w-full px-4 py-3 bg-telegram-chat border border-gray-600 rounded-lg text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Username нельзя изменить</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Полное имя</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 bg-telegram-chat border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-telegram-blue"
              placeholder="Ваше имя"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">О себе</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-telegram-chat border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-telegram-blue resize-none"
              placeholder="Расскажите о себе..."
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-700 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-telegram-chat hover:bg-telegram-hover text-white rounded-lg transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-telegram-blue hover:bg-telegram-darkblue text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}
