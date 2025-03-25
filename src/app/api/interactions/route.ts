import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function POST(request: Request) {
  const supabaseAdmin = createAdminClient();
  try {
    const body = await request.json();
    const { productId, userId, action } = body;
    
    if (!productId || !action) {
      return NextResponse.json({ error: 'Product ID and action are required' }, { status: 400 });
    }
    
    // Map the interaction type to a descriptive action
    let actionDescription = '';
    if (action === 'User liked the product') {
      actionDescription = 'LIKE';
    } else if (action === 'User disliked the product') {
      actionDescription = 'DISLIKE';
    } else if (action === 'User viewed product details') {
      actionDescription = 'VIEW_DETAILS';
    } else if (action === 'User shared the product') {
      actionDescription = 'SHARE';
    } else if (action === 'User clicked buy button') {
      actionDescription = 'CLICK_BUY';
    } else {
      actionDescription = action.toUpperCase();
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
        action: actionDescription,
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