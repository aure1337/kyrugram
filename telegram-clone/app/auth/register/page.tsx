'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Проверяем уникальность username
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        throw new Error('Этот username уже занят');
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName,
          },
        },
      });

      if (signUpError) throw signUpError;

      router.push('/');
      router.refresh();
    } catch (error: any) {
      setError(error.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-telegram-bg flex items-center justify-center p-4">
      <div className="bg-telegram-sidebar rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Регистрация</h1>
          <p className="text-gray-400">Создайте новый аккаунт</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              required
              minLength={3}
              maxLength={30}
              className="w-full px-4 py-3 bg-telegram-chat border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-telegram-blue"
              placeholder="username"
            />
            <p className="text-xs text-gray-500 mt-1">Только латиница, цифры и подчеркивание</p>
          </div>

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
              Полное имя
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 bg-telegram-chat border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-telegram-blue"
              placeholder="Иван Иванов"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-telegram-chat border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-telegram-blue"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-telegram-chat border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-telegram-blue"
              placeholder="••••••••"
            />
            <p className="text-xs text-gray-500 mt-1">Минимум 6 символов</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-telegram-blue hover:bg-telegram-darkblue text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Уже есть аккаунт?{' '}
            <Link href="/auth/login" className="text-telegram-blue hover:text-telegram-lightblue">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
