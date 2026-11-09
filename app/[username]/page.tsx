import { supabase } from '@/lib/supabase';
import QRCodeModal from '@/components/QRCodeModal';
import { Camera, Phone, Share2 } from 'lucide-react';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ username: string }>;
}

export default async function UserProfile({ params }: Props) {
  const { username } = await params;

  // 1. Obtener perfil de la base de datos
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (!profile) {
    notFound();
  }

  // 2. Obtener enlaces del usuario
  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', profile.id)
    .eq('is_active', true)
    .order('position', { ascending: true });

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-md flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="w-28 h-28 rounded-full bg-neutral-800 border-2 border-amber-500 overflow-hidden flex items-center justify-center mb-4 shadow-lg shadow-amber-500/10">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
          ) : (
            <Camera className="w-12 h-12 text-amber-500" />
          )}
        </div>

        {/* Info */}
        <h1 className="text-2xl font-bold tracking-tight">{profile.full_name}</h1>
        <p className="text-amber-500 font-medium text-sm mt-1">{profile.category}</p>
        {profile.bio && <p className="text-neutral-400 text-sm mt-3 px-2">{profile.bio}</p>}

        {/* Enlaces Rápidos (Instagram / WhatsApp / QR) */}
        <div className="flex gap-4 mt-6">
          {profile.instagram_url && (
            <a
              href={profile.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="p-3 bg-neutral-900 rounded-full border border-neutral-800 text-neutral-300 hover:text-white hover:border-amber-500 transition-all"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          )}
          {profile.whatsapp_number && (
            <a
              href={`https://wa.me/${profile.whatsapp_number}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="p-3 bg-neutral-900 rounded-full border border-neutral-800 text-neutral-300 hover:text-white hover:border-amber-500 transition-all"
            >
              <Phone className="w-5 h-5" />
            </a>
          )}

          {/* Modal del Código QR */}
          <QRCodeModal username={profile.username} />
        </div>

        {/* Lista de Botones / Links */}
        <div className="w-full mt-8 space-y-4">
          {links && links.length > 0 ? (
            links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 bg-neutral-900/90 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-800/80 rounded-xl font-medium text-neutral-100 flex items-center justify-between transition-all group shadow-sm"
              >
                <span>{link.title}</span>
                <Share2 className="w-4 h-4 text-neutral-500 group-hover:text-amber-500 transition-colors" />
              </a>
            ))
          ) : (
            <p className="text-neutral-500 text-sm py-4">No hay enlaces publicados aún.</p>
          )}
        </div>
      </div>
    </main>
  );
}