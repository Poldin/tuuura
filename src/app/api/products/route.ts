import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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
}

// Add this function before the GET function
async function getRandomProduct(): Promise<ProductQueryResult | null> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, 
      uid, 
      title, 
      body, 
      producer_id
    `)
    .limit(1)
    .order('random()');

  if (error) {
    console.error('Error getting random product:', error);
    return null;
  }

  return data?.[0] || null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const loadedIds = [...new Set(searchParams.get('loadedIds')?.split(',').filter(Boolean) || [])];
  const limit = parseInt(searchParams.get('limit') || '2');
  const productUid = searchParams.get('p');

  console.log('API Request params:', { loadedIds, limit, productUid });

  try {
    let query = supabase
      .from('products')
      .select(`
        id, 
        uid, 
        title, 
        body, 
        producer_id
      `);

    // If productUid is provided, try to find that specific product
    if (productUid) {
      const { data: specificProduct, error: specificError } = await query.eq('uid', productUid);

      if (specificError) {
        console.error('Error fetching specific product:', specificError);
        throw specificError;
      }

      // If product not found, get a random one
      if (!specificProduct || specificProduct.length === 0) {
        console.log('Specific product not found, getting random product');
        const randomProduct = await getRandomProduct();
        if (!randomProduct) {
          return NextResponse.json({ experiences: [], hasMore: false });
        }

        const body = randomProduct.body as unknown as ProductBody;
        const experience: Experience = {
          id: randomProduct.id,
          uid: randomProduct.uid,
          title: randomProduct.title,
          description: body.description || '',
          price: body.price || 0,
          currency: body.currency || '€',
          imageUrl: body.imageUrl || '/placeholder.jpg',
          checkoutUrl: body.checkoutUrl || '',
          producerId: randomProduct.producer_id,
        };

        // Get subsequent products
        const { data: subsequentProducts, error: subsequentError } = await supabase
          .from('products')
          .select(`
            id, 
            uid, 
            title, 
            body, 
            producer_id
          `)
          .not('id', 'eq', randomProduct.id)
          .not('id', 'in', `(${loadedIds.join(',')})`)
          .limit(limit - 1);

        if (subsequentError) {
          console.error('Error fetching subsequent products:', subsequentError);
          throw subsequentError;
        }

        const subsequentExperiences: Experience[] = (subsequentProducts || []).map(product => {
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
          };
        });

        // Get total count for hasMore calculation
        const { count } = await supabase
          .from('products')
          .select('id', { count: 'exact' });

        const totalLoaded = loadedIds.length + 1 + subsequentExperiences.length;
        const hasMore = count ? totalLoaded < count : false;

        return NextResponse.json({ 
          experiences: [experience, ...subsequentExperiences],
          hasMore
        });
      }

      // If specific product found, get subsequent products
      const { data: subsequentProducts, error: subsequentError } = await supabase
        .from('products')
        .select(`
          id, 
          uid, 
          title, 
          body, 
          producer_id
        `)
        .not('id', 'eq', specificProduct[0].id)
        .not('id', 'in', `(${loadedIds.join(',')})`)
        .limit(limit - 1);

      if (subsequentError) {
        console.error('Error fetching subsequent products:', subsequentError);
        throw subsequentError;
      }

      // Transform the specific product
      const body = specificProduct[0].body as unknown as ProductBody;
      const specificExperience: Experience = {
        id: specificProduct[0].id,
        uid: specificProduct[0].uid,
        title: specificProduct[0].title,
        description: body.description || '',
        price: body.price || 0,
        currency: body.currency || '€',
        imageUrl: body.imageUrl || '/placeholder.jpg',
        checkoutUrl: body.checkoutUrl || '',
        producerId: specificProduct[0].producer_id,
      };

      // Transform subsequent products
      const subsequentExperiences: Experience[] = (subsequentProducts || []).map(product => {
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
        };
      });

      // Get total count for hasMore calculation
      const { count } = await supabase
        .from('products')
        .select('id', { count: 'exact' });

      const totalLoaded = loadedIds.length + 1 + subsequentExperiences.length;
      const hasMore = count ? totalLoaded < count : false;

      return NextResponse.json({ 
        experiences: [specificExperience, ...subsequentExperiences],
        hasMore
      });
    }

    // Normal pagination without p parameter
    if (loadedIds.length > 0) {
      console.log('Excluding products:', loadedIds);
      query = query.not('id', 'in', `(${loadedIds.join(',')})`);
    }

    // Apply limit
    query = query.limit(limit);

    // Get total count of products for better hasMore calculation
    const { count } = await supabase
      .from('products')
      .select('id', { count: 'exact' });

    // Get the products
    const { data: products, error } = await query;

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('Found products:', products?.length || 0, 'Total products:', count);

    // If no products found, we've reached the end
    if (!products || products.length === 0) {
      console.log('No more products to return');
      return NextResponse.json({ experiences: [], hasMore: false });
    }

    // Transform the products to match our Experience interface
    const experiences: Experience[] = (products as unknown as ProductQueryResult[]).map(product => {
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
      };
    });

    // We have more products if the total number of loaded products is less than the total count
    const totalLoaded = loadedIds.length + experiences.length;
    const hasMore = count ? totalLoaded < count : false;
    
    console.log('Response:', { 
      experiencesCount: experiences.length, 
      hasMore,
      totalLoaded,
      totalProducts: count
    });

    return NextResponse.json({ 
      experiences,
      hasMore
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}