import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

function App() {
  const [nama, setNama] = useState("muslim");
  const [telefon, setTelefon] = useState("0122223333");
  const [nota, setNota] = useState("banner");
  const [jumlah, setJumlah] = useState("50");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("OK. UI dah siap ✅ (Next: sambung Netlify function create-bill).");
  const [last, setLast] = useState(null);

  const amountNumber = useMemo(() => {
    const n = Number(jumlah);
    return Number.isFinite(n) ? n : NaN;
  }, [jumlah]);

  async function onCreateBill() {
    // basic validation
    if (!nama.trim()) return setMsg("❌ Sila isi Nama.");
    if (!telefon.trim()) return setMsg("❌ Sila isi No Telefon.");
    if (!nota.trim()) return setMsg("❌ Sila isi Produk/Catatan.");
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) return setMsg("❌ Jumlah (RM) mesti nombor > 0.");

    setLoading(true);
    setMsg("⏳ Sedang create bil ToyyibPay...");
    setLast(null);

    try {
      const res = await fetch("/.netlify/functions/create-bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nama.trim(),
          phone: telefon.trim(),
          note: nota.trim(),
          amount: amountNumber,
        }),
      });

      // Netlify function biasanya pulangkan JSON
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errText = data?.error || data?.message || `HTTP ${res.status}`;
        throw new Error(errText);
      }

      // Jangkaan: function pulangkan { ok:true, billcode, url }
      const billcode = data?.billcode || data?.BillCode || data?.data?.BillCode;
      const url =
        data?.url ||
        (billcode ? `https://toyyibpay.com/${billcode}` : null);

      setLast({ billcode, url, raw: data });
      setMsg("✅ Bil berjaya dibuat. Redirect ke ToyyibPay...");

      if (url) {
        // redirect terus
        window.location.href = url;
      } else {
        setMsg("✅ Bil dibuat, tapi URL tak jumpa. Sila semak response di bawah.");
      }
    } catch (e) {
      setMsg(`❌ Gagal create bil: ${e?.message || e}`);
      console.error("create-bill error:", e);
    } finally {
      setLoading(false);
    }
  }

  function onReset() {
    setNama("");
    setTelefon("");
    setNota("");
    setJumlah("");
    setMsg("Reset ✅");
    setLast(null);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-center">
          Muiz Banner Empire
        </h1>
        <p className="text-center text-slate-600 mt-1">
          Sistem Tempahan + ToyyibPay (demo UI)
        </p>

        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Maklumat Tempahan</h2>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama</label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Ali"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">No Telefon</label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                value={telefon}
                onChange={(e) => setTelefon(e.target.value)}
                placeholder="Contoh: 011xxxxxxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Produk / Catatan</label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Contoh: Banner 2x5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah (RM)</label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value)}
                inputMode="decimal"
                placeholder="Contoh: 50"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={onCreateBill}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-white font-medium hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? "Sedang Proses..." : "Buat Bil (ToyyibPay)"}
            </button>

            <button
              onClick={onReset}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg bg-white border border-slate-300 px-4 py-2 text-slate-800 font-medium hover:bg-slate-50 disabled:opacity-60"
            >
              Reset
            </button>
          </div>

          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900 text-sm">
            {msg}
          </div>

          {last?.url && (
            <div className="mt-3 text-sm">
              <div className="text-slate-700">Link bil:</div>
              <a className="text-blue-600 underline" href={last.url} target="_blank" rel="noreferrer">
                {last.url}
              </a>
            </div>
          )}

          {last?.raw && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-slate-600">Lihat response (debug)</summary>
              <pre className="mt-2 text-xs bg-slate-100 border border-slate-200 rounded-lg p-3 overflow-auto">
{JSON.stringify(last.raw, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("app"));
root.render(<App />);
