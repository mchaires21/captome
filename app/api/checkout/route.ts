import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { fotoId, eventoId, precio = 150 } = await request.json();

    if (!fotoId) {
      return NextResponse.json({ error: 'Falta el ID de la foto' }, { status: 400 });
    }

    const paymentData = {
      success: true,
      checkoutUrl: `/evento/${eventoId}?pago=exito&foto=${fotoId}`,
      monto: precio,
      moneda: 'MXN',
      fotoId,
    };

    return NextResponse.json(paymentData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error al procesar el pago';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}