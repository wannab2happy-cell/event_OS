/**
 * Kakao BizMessage Provider
 * 
 * Sends messages via Kakao Business Message API
 */

interface KakaoProviderConfig {
  apiKey?: string;
  templateId?: string;
  senderKey?: string;
}

interface SendKakaoResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send Kakao message
 */
export async function sendKakao(
  phone: string,
  body: string,
  config?: KakaoProviderConfig
): Promise<SendKakaoResult> {
  try {
    const apiKey = config?.apiKey || process.env.KAKAO_API_KEY;
    const templateId = config?.templateId || process.env.KAKAO_TEMPLATE_ID;
    const senderKey = config?.senderKey || process.env.KAKAO_SENDER_KEY;

    if (!apiKey || !templateId || !senderKey) {
      return {
        success: false,
        error: 'Kakao API credentials not configured',
      };
    }

    // Kakao BizMessage API call
    const response = await fetch('https://kapi.kakao.com/v2/api/talk/message/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receiver_uuids: [phone], // Note: Kakao uses UUID, but we'll use phone for now
        template_object: {
          object_type: 'text',
          text: body,
          link: {
            web_url: process.env.NEXT_PUBLIC_SITE_URL || 'https://events.anders.kr',
          },
        },
        sender_key: senderKey,
        template_id: templateId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Kakao API error: ${errorText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.messageId || data.result_code,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to send Kakao message',
    };
  }
}




