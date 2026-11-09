import { Search, ChevronDown, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

// Desactiva la caché de Next.js para actualizar los datos al instante
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function ExplorarEventos() {
  const { data: eventos } = await supabase.from("eventos").select("*");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      {/* BARRA DE NAVEGACIÓN */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-[#222] bg-[#0a0a0a]">
        <div className="text-xl font-extrabold tracking-tight text-white">captome</div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
          <a href="#" className="text-white">Explorar</a>
          <a href="#" className="hover:text-white transition-colors">Precios</a>
        </nav>
        <div className="flex items-center gap-5">
          <button className="text-gray-400 hover:text-white transition-colors">
            <ShoppingBag size={20} />
          </button>
          <button className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Entrar</button>
          <button className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors">
            + Crear cuenta
          </button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        {/* ENCABEZADO */}
        <div className="mb-10">
          <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-3">Catálogo</p>
          <h1 className="text-5xl font-bold mb-4 tracking-tight text-white">Todos los eventos</h1>
          <p className="text-gray-400 text-lg">Buscá tu carrera, filtrá por disciplina o zona, y encontrá el álbum donde están tus fotos.</p>
        </div>

        {/* BARRA DE BÚSQUEDA Y FILTROS */}
        <div className="flex flex-col gap-4 mb-10">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Evento, ciudad o fotógrafo"
              className="w-full bg-[#111] border border-[#333] rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-white transition-colors placeholder:text-gray-500"
            />
          </div>

          <div className="flex flex-wrap gap-4 mt-2">
            <button className="flex items-center justify-between bg-[#111] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-gray-300 hover:border-gray-500 w-48 transition-colors">
              Todas las zonas <ChevronDown size={16} />
            </button>
            <button className="flex items-center justify-between bg-[#111] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-gray-300 hover:border-gray-500 w-48 transition-colors">
              Todas las categorías <ChevronDown size={16} />
            </button>
            <button className="flex items-center justify-between bg-[#111] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-gray-300 hover:border-gray-500 w-48 transition-colors">
              Más recientes <ChevronDown size={16} />
            </button>
          </div>
        </div>

        {/* CONTADOR DE EVENTOS */}
        <div className="text-sm text-gray-500 mb-6 font-medium">
          {eventos?.length || 0} eventos encontrados
        </div>
        
        {/* GRID DE EVENTOS REALS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventos?.map((evento) => (
            <Link 
              key={evento.id} 
              href={`/evento/${evento.id}`}
              className="group relative rounded-2xl overflow-hidden bg-[#111] border border-[#222] hover:border-gray-600 transition-all cursor-pointer flex flex-col h-[340px]"
            >
              <div className="relative h-48 w-full bg-black overflow-hidden">
                <div className="absolute top-3 left-3 flex gap-2 z-20">
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-white text-black">Nuevo</span>
                </div>
                
                <div className="w-full h-full bg-[#1a1a1a]" />

                <div className="absolute inset-0 z-10 pointer-events-none opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,rgba(255,255,255,0.15)_20px,rgba(255,255,255,0.15)_40px)]"></div>
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <span className="text-white/20 font-black text-4xl -rotate-12 tracking-widest select-none">
                    CAPTOME
                  </span>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="font-bold text-lg text-white mb-1 uppercase truncate">{evento.titulo}</h3>
                  <p className="text-gray-400 text-sm mb-3">{evento.fecha}</p>
                  <p className="text-white text-sm font-semibold group-hover:underline flex items-center gap-1">Ver álbum <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span></p>
                </div>
                <p className="text-gray-500 text-xs mt-3 pt-3 border-t border-[#222]">
                  Fotos de {evento.fotografo}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}