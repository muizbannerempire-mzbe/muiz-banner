// netlify/functions/create-bill.js
export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { name, phone, product, amount } = JSON.parse(event.body || "{}");

    if (!name || !phone || !product || !amount) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, message: "Missing fields" }),
      };
    }

    const secretKey = process.env.TOYYIB_SECRET;
    const categoryCode = process.env.TOYYIB_CATEGORY;

    if (!secretKey || !categoryCode) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          ok: false,
          message: "Missing env vars: TOYYIB_SECRET / TOYYIB_CATEGORY",
        }),
      };
    }

    // ToyyibPay expects amount in cents (RM * 100)
    const amountSen = Math.round(Number(amount) * 100);

    // Use Netlify site URL for callback/return
    const siteUrl =
      process.env.URL || "https://muiz-banner.netlify.app";

    const billName = `Tempahan: ${product}`;
    const billDescription = `Nama: ${name} | Tel: ${phone} | Produk: ${product}`;

    const params = new URLSearchParams();
    params.append("userSecretKey", secretKey);
    params.append("categoryCode", categoryCode);
    params.append("billName", billName);
    params.append("billDescription", billDescription);
    params.append("billAmount", String(amountSen));
    params.append("billTo", name);
    params.append("billEmail", "muizbannerempire@gmail.com"); // boleh tukar
    params.append("billPhone", phone);

    // Lepas bayar -> ToyyibPay redirect sini
    params.append("billReturnUrl", `${siteUrl}/?paid=1`);

    // ToyyibPay callback (server-to-server) -> function callback.js (awak dah ada)
    params.append("billCallbackUrl", `${siteUrl}/.netlify/functions/callback`);

    const resp = await fetch("https://toyyibpay.com/index.php/api/createBill", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = await resp.json();

    // ToyyibPay usually returns array like: [{ BillCode: "xxxx" }]
    const billCode = Array.isArray(data) && data[0] && data[0].BillCode;

    if (!billCode) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          ok: false,
          message: "ToyyibPay createBill failed",
          raw: data,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        billCode,
        paymentUrl: `https://toyyibpay.com/${billCode}`,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, message: err.message }),
    };
  }
}
