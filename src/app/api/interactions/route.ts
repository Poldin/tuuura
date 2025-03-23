import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function POST(request: Request) {
  const supabaseAdmin = createAdminClient();
  try {
    const body = await request.json();
    const { productId, userId, liked, disliked, clickedBuy, clickedDetails, clickedShare } = body;
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    
    // Collect anonymous data like IP, user agent, etc.
    // Note: Be careful with PII and comply with privacy regulations
    const headers = Object.fromEntries(request.headers);
    const anonymousData = {
      userAgent: headers['user-agent'],
      // Include other non-identifying information if needed
    };
    
    // Insert the interaction record
    const { error } = await supabaseAdmin
      .from('link_stduser_product')
      .insert({
        user_id: userId || null,
        product_id: productId,
        liked: liked || null,
        disliked: disliked || null,
        clicked_buy: clickedBuy || false,
        clicked_details: clickedDetails || false,
        clicked_share: clickedShare || false,
        anonymous_data: userId ? null : anonymousData,
      });
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording interaction:', error);
    return NextResponse.json({ error: 'Failed to record interaction' }, { status: 500 });
  }
}