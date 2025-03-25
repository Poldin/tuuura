import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
// import { Database } from '@/lib/database.types';
import { Json } from '@/lib/database.types';

// Definizione dei tipi per il body del prodotto
interface ProductBody {
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  checkoutUrl?: string;
  details?: Record<string, unknown>;
}

// Tipo più flessibile per i risultati della query
interface ProductQueryResult {
  id: string;
  uid: string;
  title: string;
  body: Json;
  producer_id: string;
  producers: { name: string } | null;
  // I campi created_at e updated_at potrebbero non essere inclusi nella selezione
  created_at?: string;
  updated_at?: string;
}

// Tipo per l'oggetto Experience trasformato
interface Experience {
  id: string;
  uid: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  checkoutUrl: string;
  producerId: string;
  producerName: string;
}

export async function GET(request: Request) {
  const supabaseAdmin = createAdminClient();
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '4', 10);
  const excludeIds = searchParams.get('exclude')?.split(',') || [];
  
  try {
    // Build the query
    let query = supabaseAdmin
      .from('products')
      .select(`
        id, 
        uid, 
        title, 
        body, 
        producer_id,
        producers:producer_id (name)
      `)
      .order('created_at', { ascending: false });

    // Add exclude filter if there are IDs to exclude
    if (excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`);
    }

    // Add limit
    query = query.limit(limit);
    
    // Execute the query
    const { data: products, error } = await query;
    
    if (error) {
      throw error;
    }

    // Transform the products to match our Experience interface
    const experiences: Experience[] = (products as unknown as ProductQueryResult[]).map(product => {
      // Estrai i valori dal body con type safety
      const body = product.body as unknown as ProductBody;
      
      return {
        id: product.id,
        uid: product.uid,
        title: product.title,
        description: body.description || '',
        price: body.price || 0,
        currency: body.currency || '€',
        imageUrl: body.imageUrl || '/placeholder.jpg',
        checkoutUrl: body.checkoutUrl || '',
        producerId: product.producer_id,
        producerName: product.producers?.name || '',
      };
    });

    return NextResponse.json({ experiences });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}