const el = document.getElementById("app");

el.innerHTML = `
  <div style="max-width:720px;margin:40px auto;font-family:system-ui;">
    <h1>Muiz Banner Empire</h1>
    <p>Sistem Tempahan + ToyyibPay (demo UI)</p>

    <div style="background:#fff;border:1px solid #ddd;padding:16px;border-radius:12px;">
      <h3>Maklumat Tempahan</h3>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div>
          <label>Nama</label><br/>
          <input id="nama" style="width:100%;padding:8px" value="muslim"/>
        </div>
        <div>
          <label>No Telefon</label><br/>
          <input id="telefon" style="width:100%;padding:8px" value="0122223333"/>
        </div>
        <div>
          <label>Produk / Catatan</label><br/>
          <input id="nota" style="width:100%;padding:8px" value="banner"/>
        </div>
        <div>
          <label>Jumlah (RM)</label><br/>
          <input id="jumlah" style="width:100%;padding:8px" value="50"/>
        </div>
      </div>

      <div style="margin-top:14px;display:flex;gap:10px;">
        <button id="btn" style="padding:10px 14px;background:#111;color:#fff;border:0;border-radius:8px;cursor:pointer;">
          Buat Bil (ToyyibPay)
        </button>
        <button id="reset" style="padding:10px 14px;background:#fff;border:1px solid #bbb;border-radius:8px;cursor:pointer;">
          Reset
        </button>
      </div>

      <div id="msg" style="margin-top:14px;padding:10px;border-radius:10px;background:#e8fff1;border:1px solid #b7f5cf;">
        OK. UI dah siap ✅ (Next: sambung Netlify function create-bill).
      </div>

      <div id="debug" style="margin-top:10px;font-size:12px;white-space:pre-wrap;"></div>
    </div>
  </div>
`;

const $ = (id) => document.getElementById(id);

$("reset").onclick = () => {
  $("nama").value = "";
  $("telefon").value = "";
  $("nota").value = "";
  $("jumlah").value = "";
  $("msg").textContent = "Reset ✅";
  $("debug").textContent = "";
};

$("btn").onclick = async () => {
  const name = $("nama").value.trim();
  const phone = $("telefon").value.trim();
  const note = $("nota").value.trim();
  const amount = Number($("jumlah").value);

  if (!name) return ($("msg").textContent = "❌ Sila isi Nama.");
  if (!phone) return ($("msg").textContent = "❌ Sila isi No Telefon.");
  if (!note) return ($("msg").textContent = "❌ Sila isi Produk/Catatan.");
  if (!Number.isFinite(amount) || amount <= 0) return ($("msg").textContent = "❌ Jumlah (RM) mesti nombor > 0.");

  $("msg").textContent = "⏳ Sedang create bil ToyyibPay...";
  $("debug").textContent = "";

  try {
    const res = await fetch("/.netlify/functions/create-bill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, note, amount }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);

    const billcode = data?.billcode || data?.BillCode || data?.data?.BillCode;
    const url = data?.url || (billcode ? `https://toyyibpay.com/${billcode}` : null);

    $("debug").textContent = JSON.stringify(data, null, 2);

    if (url) {
      $("msg").textContent = "✅ Bil berjaya. Redirect ke ToyyibPay...";
      window.location.href = url;
    } else {
      $("msg").textContent = "✅ Bil dibuat tapi URL tak jumpa (rujuk debug).";
    }
  } catch (e) {
    $("msg").textContent = `❌ Gagal create bil: ${e.message || e}`;
    console.error(e);
  }
};
