"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { PlusCircle, Image as ImageIcon, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PanelFotografo() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState("");
  
  // Formulario de Evento
  const [titulo, setTitulo] = useState("");
  const [fecha, setFecha] = useState("");
  const [fotografo, setFotografo] = useState("");

  // Formulario de Foto
  const [eventoSeleccionado, setEventoSeleccionado] = useState("");
  const [urlFoto, setUrlFoto] = useState("");
  const [precioFoto, setPrecioFoto] = useState("150");

  useEffect(() => {
    cargarEventos();
  }, []);

  async function cargarEventos() {
    const { data } = await supabase.from("eventos").select("*").order("id", { ascending: false });
    setEventos(data || []);
    if (data && data.length > 0 && !eventoSeleccionado) {
      setEventoSeleccionado(data[0].id.toString());
    }
  }

  async function crearEvento(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo || !fecha || !fotografo) return;

    const { error } = await supabase
      .from("eventos")
      .insert([{ titulo, fecha, fotografo }]);

    if (error) {
      setMensaje("Error al crear el evento: " + error.message);
    } else {
      setMensaje("¡Evento creado con éxito!");
      setTitulo("");
      setFecha("");
      setFotografo("");
      cargarEventos();
    }
  }

  async function agregarFoto(e: React.FormEvent) {
    e.preventDefault();
    if (!urlFoto || !eventoSeleccionado) return;

    const { error } = await supabase
      .from("fotos")
      .insert([{ 
        evento_id: parseInt(eventoSeleccionado), 
        url: urlFoto, 
        precio: parseFloat(precioFoto) 
      }]);

    if (error) {
      setMensaje("Error al subir foto: " + error.message);
    } else {
      setMensaje("¡Foto agregada al evento correctamente!");
      setUrlFoto("");
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Panel del Fotógrafo</h1>
            <p className="text-gray-400 text-sm">Gestiona tus eventos y sube nuevas fotografías.</p>
          </div>
        </div>

        {mensaje && (
          <div className="mb-6 p-4 rounded-xl bg-white/10 border border-white/20 text-white flex items-center gap-2">
            <CheckCircle className="text-green-400" size={20} />
            <span>{mensaje}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* SECCIÓN 1: CREAR EVENTO */}
          <div className="bg-[#111] border border-[#222] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6 text-xl font-bold">
              <PlusCircle className="text-white" size={22} />
              <h2>1. Crear Nuevo Evento</h2>
            </div>
            
            <form onSubmit={crearEvento} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Título del Evento</label>
                <input
                  type="text"
                  placeholder="Ej: MARATÓN MONTERREY 2026"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3 text-sm focus:outline-none focus:border-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Fecha / Ubicación</label>
                <input
                  type="text"
                  placeholder="Ej: 15 nov - MONTERREY"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3 text-sm focus:outline-none focus:border-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Nombre del Fotógrafo</label>
                <input
                  type="text"
                  placeholder="Ej: Yolanda Pérez"
                  value={fotografo}
                  onChange={(e) => setFotografo(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3 text-sm focus:outline-none focus:border-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Guardar Evento
              </button>
            </form>
          </div>

          {/* SECCIÓN 2: AGREGAR FOTO A UN EVENTO */}
          <div className="bg-[#111] border border-[#222] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6 text-xl font-bold">
              <ImageIcon className="text-white" size={22} />
              <h2>2. Subir Fotos al Album</h2>
            </div>

            <form onSubmit={agregarFoto} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Seleccionar Evento</label>
                <select
                  value={eventoSeleccionado}
                  onChange={(e) => setEventoSeleccionado(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3 text-sm focus:outline-none focus:border-white"
                >
                  {eventos.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.titulo} (ID: {ev.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">URL de la Imagen</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={urlFoto}
                  onChange={(e) => setUrlFoto(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3 text-sm focus:outline-none focus:border-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Precio (MXN)</label>
                <input
                  type="number"
                  placeholder="150"
                  value={precioFoto}
                  onChange={(e) => setPrecioFoto(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl p-3 text-sm focus:outline-none focus:border-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Vincular Foto
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}