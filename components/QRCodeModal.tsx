'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, X } from 'lucide-react';

export default function QRCodeModal({ username }: { username: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const profileUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/${username}`
    : `https://captome.com/${username}`;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-3 bg-neutral-900 rounded-full border border-neutral-800 text-neutral-300 hover:text-white hover:border-amber-500 transition-all"
        title="Mostrar Código QR"
      >
        <QrCode className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-sm w-full flex flex-col items-center relative text-center">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Escanea para abrir</h3>
            <p className="text-xs text-amber-500 mb-6">@{username}</p>

            <div className="p-4 bg-white rounded-xl shadow-lg">
              <QRCodeSVG value={profileUrl} size={200} />
            </div>

            <p className="text-neutral-400 text-xs mt-6">
              Muestra este código a atletas o clientes para compartir tu perfil al instante.
            </p>
          </div>
        </div>
      )}
    </>
  );
}