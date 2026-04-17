import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ChatLayout from '@/components/ChatLayout';

export default async function HomePage() {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  return <ChatLayout />;
}
