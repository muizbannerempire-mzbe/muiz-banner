export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method not allowed" }),
      };
    }

    const { name, phone, note, amount } = JSON.parse(event.body || "{}");

    if (!name || !phone || !note || !amount) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing fields" }),
      };
    }

    const secret = process.env.TOYYIB_SECRET;
    const category = process.env.TOYYIB_CATEGORY;

    if (!secret || !category) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "ToyyibPay env not set" }),
      };
    }

    const resp = await fetch("https://toyyibpay.com/index.php/api/createBill", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    userSecretKey: secret,        // dari process.env.TOYYIB_SECRET
    categoryCode: category,       // dari process.env.TOYYIB_CATEGORY
    billName: note,
    billDescription: note,
    billPriceSetting: 1,
    billPayorInfo: 1,
    billAmount: String(Number(amount) * 100),
    billReturnUrl: "https://muiz-banner.netlify.app",
    billCallbackUrl: "https://muiz-banner.netlify.app/.netlify/functions/callback",
    billExternalReferenceNo: "MBE-" + Date.now(),
    billTo: name,
    billEmail: "noemail@muizbanner.com",
    billPhone: phone,
    billPaymentChannel: 0,
  }),
});

const text = await resp.text();

// cuba parse JSON kalau boleh
let data;
try {
  data = JSON.parse(text);
} catch (e) {
  return {
    statusCode: 400,
    body: JSON.stringify({
      error: "ToyyibPay returned non-JSON",
      raw: text, // ini akan tunjuk mesej KEY DID NOT...
    }),
  };
}

if (!Array.isArray(data) || !data[0]?.BillCode) {
  return {
    statusCode: 400,
    body: JSON.stringify({ error: "ToyyibPay error", data }),
  };
}

return {
  statusCode: 200,
  body: JSON.stringify({
    billcode: data[0].BillCode,
    url: `https://toyyibpay.com/${data[0].BillCode}`,
  }),
};
