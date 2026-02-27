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

    const response = await fetch("https://toyyibpay.com/index.php/api/createBill", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        userSecretKey: secret,
        categoryCode: category,
        billName: note,
        billDescription: note,
        billPriceSetting: 1,
        billPayorInfo: 1,
        billAmount: amount * 100,
        billReturnUrl: "https://muiz-banner.netlify.app",
        billCallbackUrl: "https://muiz-banner.netlify.app",
        billExternalReferenceNo: "MBE-" + Date.now(),
        billTo: name,
        billEmail: "noemail@muizbanner.com",
        billPhone: phone,
        billPaymentChannel: 0,
      }),
    });

    const data = await response.json();

    if (!Array.isArray(data) || !data[0]?.BillCode) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "ToyyibPay failed", data }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        billcode: data[0].BillCode,
        url: `https://toyyibpay.com/${data[0].BillCode}`,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
