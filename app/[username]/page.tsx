import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import QRCodeModal from '@/components/QRCodeModal';
import { MessageCircle, Globe } from 'lucide-react';

export default async function UserProfile({
  params,
}: {
  params: Promise<{ username: string }> | { username: string };
}) {
  const resolvedParams = await params;
  const username = resolvedParams.username;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (!profile) {
    notFound();
  }

  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', profile.id)
    .eq('is_active', true)
    .order('position', { ascending: true });

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-md space-y-8 z-10">
        {/* Header con Avatar e Información */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-neutral-900 border-2 border-amber-500 p-1 shadow-xl shadow-amber-500/10 overflow-hidden flex items-center justify-center">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || 'Avatar'}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full bg-neutral-800 rounded-full flex items-center justify-center text-amber-500 text-3xl font-bold">
                  {profile.full_name?.charAt(0) || 'C'}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">{profile.full_name}</h1>
            <p className="text-amber-500 text-sm font-medium">{profile.category}</p>
            {profile.bio && (
              <p className="text-neutral-400 text-sm max-w-xs mx-auto pt-1">{profile.bio}</p>
            )}
          </div>

          {/* Redes Sociales y QR */}
          <div className="flex items-center gap-3 pt-2">
            {profile.instagram_url && (
              <a
                href={profile.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-amber-500/50 hover:text-amber-500 transition-all text-neutral-300"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            )}
            {profile.whatsapp_number && (
              <a
                href={`https://wa.me/${profile.whatsapp_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-amber-500/50 hover:text-amber-500 transition-all text-neutral-300"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            )}
            <QRCodeModal username={profile.username} />
          </div>
        </div>

        {/* Lista de Enlaces */}
        <div className="space-y-3 pt-4">
          {links && links.length > 0 ? (
            links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between w-full p-4 bg-neutral-900/80 border border-neutral-800 hover:border-amber-500 rounded-2xl transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-amber-500/10"
              >
                <span className="font-medium text-sm text-neutral-200 group-hover:text-amber-500 transition-colors">
                  {link.title}
                </span>
                <Globe className="w-4 h-4 text-neutral-500 group-hover:text-amber-500 transition-colors" />
              </a>
            ))
          ) : (
            <p className="text-center text-neutral-500 text-xs py-4">No hay enlaces disponibles aún.</p>
          )}
        </div>

        {/* Footer Branding */}
        <div className="text-center pt-8 border-t border-neutral-900">
          <p className="text-xs text-neutral-600 font-medium">
            Powered by <span className="text-neutral-400 font-semibold">Captome</span>
          </p>
        </div>
      </div>
    </main>
  );
}