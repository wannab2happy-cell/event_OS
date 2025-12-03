/**
 * SMS Provider
 * 
 * Supports multiple SMS providers:
 * - Solapi (Korea)
 * - Twilio (International)
 */

interface SMSProviderConfig {
  provider: 'solapi' | 'twilio';
  apiKey?: string;
  apiSecret?: string;
  from?: string;
}

interface SendSMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send SMS via configured provider
 */
export async function sendSMS(
  phone: string,
  body: string,
  config?: SMSProviderConfig
): Promise<SendSMSResult> {
  try {
    // Determine provider from config or environment
    const provider = config?.provider || (process.env.SMS_PROVIDER as 'solapi' | 'twilio') || 'solapi';

    if (provider === 'solapi') {
      return await sendViaSolapi(phone, body, config);
    } else if (provider === 'twilio') {
      return await sendViaTwilio(phone, body, config);
    } else {
      return {
        success: false,
        error: `Unknown SMS provider: ${provider}`,
      };
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

/**
 * Send SMS via Solapi (Korea)
 */
async function sendViaSolapi(
  phone: string,
  body: string,
  config?: SMSProviderConfig
): Promise<SendSMSResult> {
  try {
    const apiKey = config?.apiKey || process.env.SOLAPI_API_KEY;
    const apiSecret = config?.apiSecret || process.env.SOLAPI_API_SECRET;
    const from = config?.from || process.env.SOLAPI_FROM_NUMBER;

    if (!apiKey || !apiSecret) {
      return {
        success: false,
        error: 'Solapi API credentials not configured',
      };
    }

    // Solapi API call
    const response = await fetch('https://api.solapi.com/messages/v4/send', {
      method: 'POST',
      headers: {
        'Authorization': `HMAC-SHA256 ApiKey=${apiKey}, Date=${new Date().toISOString()}, Salt=${Date.now()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          to: phone,
          from: from || '01000000000',
          text: body,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Solapi API error: ${errorText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.messageId || data.groupId,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to send SMS via Solapi',
    };
  }
}

/**
 * Send SMS via Twilio (International)
 */
async function sendViaTwilio(
  phone: string,
  body: string,
  config?: SMSProviderConfig
): Promise<SendSMSResult> {
  try {
    const accountSid = config?.apiKey || process.env.TWILIO_ACCOUNT_SID;
    const authToken = config?.apiSecret || process.env.TWILIO_AUTH_TOKEN;
    const from = config?.from || process.env.TWILIO_FROM_NUMBER;

    if (!accountSid || !authToken) {
      return {
        success: false,
        error: 'Twilio credentials not configured',
      };
    }

    // Twilio API call
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: phone,
          From: from || '+1234567890',
          Body: body,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Twilio API error: ${errorText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.sid,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to send SMS via Twilio',
    };
  }
}

