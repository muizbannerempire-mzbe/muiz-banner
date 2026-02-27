export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { name, phone, amount } = JSON.parse(event.body || "{}");

    if (!name || !phone || !amount) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing name/phone/amount" }) };
    }

    const billReturnUrl = "https://REPLACE_ME.netlify.app/success";
    const billCallbackUrl = "https://REPLACE_ME.netlify.app/api/callback";

    const resp = await fetch("https://toyyibpay.com/index.php/api/createBill", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        userSecretKey: process.env.TOYYIB_SECRET,
        categoryCode: process.env.TOYYIB_CATEGORY,

        billName: "Tempahan Muiz Banner Empire",
        billDescription: "Tempahan Printing (Dynamic Amount)",
        billPriceSetting: 1,
        billPayorInfo: 1,

        // ToyyibPay guna SEN
        billAmount: String(Math.round(Number(amount) * 100)),

        billReturnUrl,
        billCallbackUrl,

        billExternalReferenceNo: String(Date.now()),
        billTo: name,
        billEmail: "customer@noemail.com",
        billPhone: phone
      })
    });

    const data = await resp.json();

    // ToyyibPay biasanya return array: [{ BillCode: "xxxx" }]
    const billCode = data?.[0]?.BillCode;
    if (!billCode) {
      return { statusCode: 500, body: JSON.stringify({ error: "ToyyibPay tidak pulang BillCode", data }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        billCode,
        paymentUrl: `https://toyyibpay.com/${billCode}`
      })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: "Server error", message: String(e) }) };
  }
}