import { NextResponse } from 'next/server';
import { adminMessaging } from '@/lib/firebase-admin';
import { supabase } from '@/lib/supabase';

// Helper to send a notification to a specific user
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, title, body: messageBody, data } = body;

    if (!userId || !title || !messageBody) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!adminMessaging) {
      return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });
    }

    // 1. Fetch user's devices
    const { data: tokensError, error } = await supabase
      .from('fcm_tokens')
      .select('token')
      .eq('user_id', userId);

    if (error || !tokensError || tokensError.length === 0) {
      return NextResponse.json({ error: 'No active device tokens found for user' }, { status: 404 });
    }

    const tokens = tokensError.map(t => t.token);

    // 2. Build Multicast message
    const message = {
      notification: { title, body: messageBody },
      data: data || {},
      tokens,
    };

    // 3. Send using Firebase Admin
    const response = await adminMessaging.sendEachForMulticast(message);
    
    // 4. Handle token cleanup (remove unregistered tokens from DB)
    const failedTokens: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        if (resp.error?.code === 'messaging/invalid-registration-token' ||
            resp.error?.code === 'messaging/registration-token-not-registered') {
          failedTokens.push(tokens[idx]);
        }
      }
    });

    if (failedTokens.length > 0) {
      await supabase.from('fcm_tokens').delete().in('token', failedTokens);
    }

    return NextResponse.json({ 
      success: true, 
      sentCount: response.successCount, 
      failedCount: response.failureCount 
    });

  } catch (err: any) {
    console.error('Error sending push notification:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
