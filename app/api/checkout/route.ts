import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Inicialización de Stripe sin forzar apiVersion rígida
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const { photoId, gateway, price, title } = await request.json();
    
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'https://captome-app.vercel.app';

    // 1. Redirección a Stripe
    if (gateway === 'stripe') {
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: 'mxn',
              product_data: {
                name: title || 'Fotografía Captome',
              },
              unit_amount: Math.round((price || 50) * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${origin}/evento/${photoId}?success=true`,
        cancel_url: `${origin}/evento/${photoId}?canceled=true`,
      });

      return NextResponse.json({ url: session.url });
    }

    // 2. Redirección a Mercado Pago
    if (gateway === 'mercadopago') {
      const preference = new Preference(mpClient);
      const res = await preference.create({
        body: {
          items: [
            {
              id: String(photoId),
              title: title || 'Fotografía Captome',
              unit_price: Number(price || 50),
              quantity: 1,
              currency_id: 'MXN',
            },
          ],
          back_urls: {
            success: `${origin}/evento/${photoId}?success=true`,
            failure: `${origin}/evento/${photoId}?failure=true`,
            pending: `${origin}/evento/${photoId}?pending=true`,
          },
          auto_return: 'approved',
        },
      });

      return NextResponse.json({ url: res.init_point });
    }

    return NextResponse.json({ error: 'Pasarela de pago no válida' }, { status: 400 });
  } catch (error: any) {
    console.error('Error en el checkout:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}