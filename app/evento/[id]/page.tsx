'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Photo {
  id: string;
  url: string;
  dorsal: string;
  precio: number;
}

function EventoContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params?.id as string;
  
  const isSuccess = searchParams.get('success') === 'true';

  const [dorsalSearch, setDorsalSearch] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [loadingGateway, setLoadingGateway] = useState<string | null>(null);

  // Fotos de ejemplo / producción
  const [photos] = useState<Photo[]>([
    { id: '1', url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5', dorsal: '412', precio: 50 },
    { id: '2', url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635', dorsal: '1089', precio: 50 },
    { id: '3', url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211', dorsal: '412', precio: 50 },
    { id: '4', url: 'https://images.unsplash.com/photo-1517649763962-0c623266010b', dorsal: '520', precio: 50 },
  ]);

  const filteredPhotos = photos.filter((photo) =>
    dorsalSearch ? photo.dorsal.includes(dorsalSearch.trim()) : true
  );

  const handlePayment = async (gateway: 'stripe' | 'mercadopago') => {
    if (!selectedPhoto) return;
    setLoadingGateway(gateway);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoId: selectedPhoto.id,
          gateway,
          price: selectedPhoto.precio,
          title: `Fotografía Dorsal #${selectedPhoto.dorsal}`,
        }),
      });

      const data = await res.json();

      if (data.url) {
        // Redirección directa al sitio oficial de cobro
        window.location.href = data.url;
      } else {
        alert('Error al generar la pasarela de pago: ' + (data.error || 'Intenta de nuevo'));
        setLoadingGateway(null);
      }
    } catch (err) {
      console.error('Error procesando pago:', err);
      alert('Ocurrió un error al conectar con el servidor.');
      setLoadingGateway(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans">
      {/* Header */}
      <header className="max-w-5xl mx-auto flex justify-between items-center py-4 border-b border-zinc-800">
        <h1 className="text-2xl font-bold tracking-tight">captome</h1>
        <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
          ← Volver al catálogo
        </Link>
      </header>

      <main className="max-w-5xl mx-auto mt-6 space-y-6">
        {/* Banner de compra exitosa */}
        {isSuccess && (
          <div className="bg-emerald-950/80 border border-emerald-600/50 text-emerald-200 p-4 rounded-xl text-center shadow-lg">
            🎉 <strong>¡Pago completado con éxito!</strong> Tu fotografía sin marca de agua se ha desbloqueado.
          </div>
        )}

        {/* Info del evento */}
        <div>
          <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Galería de Evento</span>
          <h2 className="text-3xl font-extrabold capitalize mt-1">{eventId || 'Adidas'}</h2>
          <p className="text-sm text-zinc-400">octubre 20</p>
        </div>

        {/* Buscador de dorsal */}
        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl space-y-2">
          <label className="text-sm font-medium text-zinc-200 flex items-center gap-2">
            🔍 Buscar por tu Número de Dorsal
          </label>
          <input
            type="text"
            placeholder="Ejemplo: 412, 1089"
            value={dorsalSearch}
            onChange={(e) => setDorsalSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white transition-colors"
          />
        </div>

        {/* Lista de fotos */}
        <div>
          <p className="text-xs text-zinc-400 mb-4">Mostrando {filteredPhotos.length} foto(s)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((photo) => (
              <div key={photo.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group">
                <div className="relative aspect-square">
                  <img src={photo.url} alt={`Dorsal ${photo.dorsal}`} className="w-full h-full object-cover" />
                  
                  {isSuccess ? (
                    <span className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                      ✓ Adquirida
                    </span>
                  ) : (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white/20 text-3xl font-black uppercase tracking-widest select-none pointer-events-none">
                        CAPTOME
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-zinc-400">Dorsal #{photo.dorsal}</span>
                    <p className="font-bold text-lg">${photo.precio} MXN</p>
                  </div>
                  {!isSuccess && (
                    <button
                      onClick={() => setSelectedPhoto(photo)}
                      className="bg-white text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
                    >
                      Comprar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal de Pago */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Selecciona tu método de pago</h3>
              <button onClick={() => setSelectedPhoto(null)} className="text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <button
                disabled={loadingGateway !== null}
                onClick={() => handlePayment('mercadopago')}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                {loadingGateway === 'mercadopago' ? 'Cargando Mercado Pago...' : '💙 Pagar con Mercado Pago'}
              </button>

              <button
                disabled={loadingGateway !== null}
                onClick={() => handlePayment('stripe')}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                {loadingGateway === 'stripe' ? 'Cargando Stripe...' : '💳 Pagar con Stripe (Tarjeta)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EventoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white p-8">Cargando evento...</div>}>
      <EventoContent />
    </Suspense>
  );
}