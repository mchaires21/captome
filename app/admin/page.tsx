'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Plus, Trash2, ExternalLink, RefreshCw, Upload, Camera, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface Profile {
  id: string;
  username: string;
  full_name: string;
  category: string;
  bio: string;
  instagram_url: string;
  whatsapp_number: string;
  avatar_url?: string;
}

interface LinkItem {
  id: string;
  title: string;
  url: string;
  is_active: boolean;
  position: number;
}

export default function AdminPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Formulario para agregar nuevo enlace
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [addingLink, setAddingLink] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    const { data: profData } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', 'marcelo')
      .single();

    if (profData) {
      setProfile(profData);
      const { data: linksData } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', profData.id)
        .order('position', { ascending: true });

      if (linksData) setLinks(linksData);
    }
    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !profile) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${profile.id}/avatar.${fileExt}`;

    setUploadingAvatar(true);

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (!uploadError) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      setProfile({ ...profile, avatar_url: publicUrl });
      notify('¡Foto de perfil actualizada!');
    } else {
      notify('Error al subir la imagen');
    }
    setUploadingAvatar(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSavingProfile(true);

    await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        category: profile.category,
        bio: profile.bio,
        instagram_url: profile.instagram_url,
        whatsapp_number: profile.whatsapp_number,
      })
      .eq('id', profile.id);

    setSavingProfile(false);
    notify('¡Información guardada con éxito!');
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl || !profile) return;
    setAddingLink(true);

    const newPos = links.length > 0 ? Math.max(...links.map((l) => l.position)) + 1 : 1;

    const { data } = await supabase
      .from('links')
      .insert([
        {
          user_id: profile.id,
          title: newTitle,
          url: newUrl,
          position: newPos,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (data) {
      setLinks([...links, data]);
      setNewTitle('');
      setNewUrl('');
      notify('¡Nuevo enlace publicado!');
    }
    setAddingLink(false);
  };

  const handleDeleteLink = async (id: string) => {
    await supabase.from('links').delete().eq('id', id);
    setLinks(links.filter((l) => l.id !== id));
    notify('Enlace eliminado');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
        <p className="text-neutral-400 text-sm">Cargando datos de Captome...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-4 py-8 relative">
      {/* Toast Flotante */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-amber-500 text-neutral-950 px-4 py-2.5 rounded-xl font-medium text-sm shadow-xl transition-all animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      <div className="max-w-xl mx-auto space-y-8">
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold">Panel de Administración</h1>
            <p className="text-xs text-amber-500 font-mono mt-0.5">Perfil activo: @{profile?.username}</p>
          </div>
          <Link
            href={`/${profile?.username}`}
            target="_blank"
            className="flex items-center gap-2 px-3 py-1.5 text-xs bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 rounded-lg transition-all text-neutral-300 hover:text-white"
          >
            Ver Mi Perfil <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Sección 1: Foto de Perfil / Avatar */}
        {profile && (
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <h2 className="text-lg font-semibold text-amber-500 border-b border-neutral-800 pb-2">Foto de Perfil</h2>
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-neutral-800 border-2 border-amber-500 overflow-hidden flex items-center justify-center shrink-0">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-amber-500" />
                )}
              </div>
              <div>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl text-xs font-medium text-white transition-all">
                  <Upload className="w-4 h-4 text-amber-500" />
                  {uploadingAvatar ? 'Subiendo imagen...' : 'Seleccionar foto'}
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} className="hidden" />
                </label>
                <p className="text-neutral-500 text-xs mt-2">Formatos recomendados: JPG, PNG o WEBP.</p>
              </div>
            </div>
          </div>
        )}

        {/* Sección 2: Editar Perfil */}
        {profile && (
          <form onSubmit={handleSaveProfile} className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <h2 className="text-lg font-semibold text-amber-500 border-b border-neutral-800 pb-2">Información del Perfil</h2>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Nombre Completo</label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Categoría / Especialidad</label>
              <input
                type="text"
                value={profile.category}
                onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Biografía Corta</label>
              <textarea
                rows={2}
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">URL de Instagram</label>
                <input
                  type="url"
                  value={profile.instagram_url || ''}
                  onChange={(e) => setProfile({ ...profile, instagram_url: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Número de WhatsApp (con clave)</label>
                <input
                  type="text"
                  placeholder="ej. 528110002233"
                  value={profile.whatsapp_number || ''}
                  onChange={(e) => setProfile({ ...profile, whatsapp_number: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-3 bg-amber-500 text-neutral-950 font-semibold text-sm rounded-xl hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {savingProfile ? 'Guardando...' : 'Guardar Cambios de Perfil'}
            </button>
          </form>
        )}

        {/* Sección 3: Agregar Nuevo Enlace */}
        <form onSubmit={handleAddLink} className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <h2 className="text-lg font-semibold text-amber-500 border-b border-neutral-800 pb-2">Agregar Nuevo Botón / Enlace</h2>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">Título del Enlace</label>
            <input
              type="text"
              placeholder="ej. Portafolio de Fotografías MTB 2026"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">URL / Enlace Destino</label>
            <input
              type="url"
              placeholder="https://ejemplo.com"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={addingLink}
            className="w-full py-3 bg-neutral-800 border border-neutral-700 hover:border-amber-500 text-white font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4 text-amber-500" />
            {addingLink ? 'Publicando...' : 'Agregar Enlace'}
          </button>
        </form>

        {/* Sección 4: Lista de Enlaces Activos */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <h2 className="text-lg font-semibold text-amber-500 border-b border-neutral-800 pb-2">Mis Enlaces Publicados ({links.length})</h2>

          {links.length === 0 ? (
            <p className="text-neutral-500 text-xs py-2">No hay enlaces agregados todavía.</p>
          ) : (
            <div className="space-y-3">
              {links.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl">
                  <div className="truncate pr-3">
                    <p className="font-medium text-sm text-neutral-200 truncate">{link.title}</p>
                    <p className="text-xs text-neutral-500 truncate">{link.url}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteLink(link.id)}
                    className="p-2 text-neutral-500 hover:text-red-400 transition-colors rounded-lg hover:bg-neutral-900"
                    title="Eliminar Enlace"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}