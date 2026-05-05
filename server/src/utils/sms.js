const hasSmsConfig = () => Boolean(process.env.SMS_API_URL);

export const sendSms = async ({ to, message }) => {
  if (!to || !message || !hasSmsConfig()) {
    return { skipped: true };
  }

  const headers = {
    "Content-Type": "application/json"
  };

  if (process.env.SMS_API_KEY) {
    headers[process.env.SMS_API_AUTH_HEADER || "Authorization"] =
      process.env.SMS_API_AUTH_SCHEME === "Bearer"
        ? `Bearer ${process.env.SMS_API_KEY}`
        : process.env.SMS_API_KEY;
  }

  const response = await fetch(process.env.SMS_API_URL, {
    method: process.env.SMS_API_METHOD || "POST",
    headers,
    body: JSON.stringify({
      to,
      message,
      sender: process.env.SMS_SENDER_ID || undefined
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `SMS request failed with status ${response.status}`);
  }

  return { skipped: false };
};
