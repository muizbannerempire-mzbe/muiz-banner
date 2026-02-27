export async function handler(event) {
  try {
    // Only POST
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Method not allowed" }),
      };
    }

    // Parse body safely
    let payload = {};
    try {
      payload = JSON.parse(event.body || "{}");
    } catch {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Invalid JSON body" }),
      };
    }

    const { name, phone, note, amount } = payload;

    // Validate fields
    if (!name || !phone || !note || amount === undefined || amount === null || amount === "") {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing fields", need: ["name", "phone", "note", "amount"] }),
      };
    }

    // Amount validation
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Invalid amount" }),
      };
    }

    // ENV (Netlify)
    const secret = process.env.TOYYIB_SECRET;
    const category = process.env.TOYYIB_CATEGORY;

    if (!secret || !category) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "ToyyibPay env not set",
          missing: {
            TOYYIB_SECRET: !secret,
            TOYYIB_CATEGORY: !category,
          },
        }),
      };
    }

    // Optional: normalize phone (basic)
    const cleanPhone = String(phone).replace(/[^0-9+]/g, "");

    // Build form data
    const form = new URLSearchParams({
      userSecretKey: secret,
      categoryCode: category,
      billName: String(note),
      billDescription: String(note),
      billPriceSetting: "1",
      billPayorInfo: "1",
      billAmount: String(Math.round(amt * 100)), // sen
      billReturnUrl: "https://muiz-banner.netlify.app",
      billCallbackUrl: "https://muiz-banner.netlify.app/.netlify/functions/callback",
      billExternalReferenceNo: "MBE-" + Date.now(),
      billTo: String(name),
      billEmail: "noemail@muizbanner.com",
      billPhone: cleanPhone,
      billPaymentChannel: "0",
    });

    // Call ToyyibPay
    const resp = await fetch("https://toyyibpay.com/index.php/api/createBill", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });

    const text = await resp.text();

    // If ToyyibPay returns HTML/text error, show raw (debug)
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "ToyyibPay returned non-JSON",
          httpStatus: resp.status,
          raw: text,
        }),
      };
    }

    // ToyyibPay usually returns array: [{ BillCode: "xxxxx", ... }]
    const billCode = Array.isArray(data) ? data?.[0]?.BillCode : null;

    if (!billCode) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "ToyyibPay error response",
          httpStatus: resp.status,
          data,
        }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        billcode: billCode,
        url: `https://toyyibpay.com/${billCode}`,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Server error",
        message: err?.message || String(err),
      }),
    };
  }
}
