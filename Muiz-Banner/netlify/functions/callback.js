export async function handler(event) {
  try {
    // ToyyibPay akan POST data callback
    const body = event.body || "";
    // Netlify kadang hantar x-www-form-urlencoded, kadang JSON
    // Kita log sahaja dulu:
    console.log("ToyyibPay Callback RAW:", body);

    return { statusCode: 200, body: "OK" };
  } catch (e) {
    return { statusCode: 200, body: "OK" };
  }
}