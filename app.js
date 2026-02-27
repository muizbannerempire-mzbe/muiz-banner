onclick: async () => {
  const nama = document.getElementById("nama").value.trim();
  const telefon = document.getElementById("telefon").value.trim();
  const produk = document.getElementById("produk").value.trim();
  const jumlah = document.getElementById("jumlah").value.trim();

  if (!nama || !telefon || !produk || !jumlah) {
    setStatus("Sila isi semua field dulu.", "error");
    return;
  }

  setStatus("Sedang create bil ToyyibPay...", "info");

  try {
    const r = await fetch("/.netlify/functions/create-bill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nama,
        phone: telefon,
        product: produk,
        amount: jumlah,
      }),
    });

    const data = await r.json();

    if (!data.ok) {
      setStatus("Gagal create bil: " + (data.message || "unknown"), "error");
      console.log("ToyyibPay error raw:", data);
      return;
    }

    setStatus("Berjaya ✅ Redirect ke payment...", "ok");
    window.location.href = data.paymentUrl;
  } catch (e) {
    setStatus("Error: " + e.message, "error");
  }
}
