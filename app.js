// app.js (vanilla)
const el = (tag, attrs = {}, children = []) => {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
    else node.setAttribute(k, v);
  }
  for (const c of children) node.append(c);
  return node;
};

const app = document.getElementById("app");

app.innerHTML = "";
app.append(
  el("div", { class: "min-h-screen bg-slate-50" }, [
    el("div", { class: "max-w-3xl mx-auto p-6" }, [
      el("h1", { class: "text-2xl font-bold text-slate-900" }, ["Muiz Banner Empire"]),
      el("p", { class: "text-slate-600 mt-1" }, ["Sistem Tempahan + ToyyibPay (demo UI)"]),
      
      el("div", { class: "mt-6 bg-white rounded-2xl shadow p-5 border" }, [
        el("h2", { class: "text-lg font-semibold text-slate-900" }, ["Maklumat Tempahan"]),
        
        el("div", { class: "grid grid-cols-1 md:grid-cols-2 gap-4 mt-4" }, [
          el("div", {}, [
            el("label", { class: "text-sm text-slate-700" }, ["Nama"]),
            el("input", { id: "nama", class: "mt-1 w-full border rounded-xl px-3 py-2", placeholder: "Contoh: Ustaz Muslim" })
          ]),
          el("div", {}, [
            el("label", { class: "text-sm text-slate-700" }, ["No Telefon"]),
            el("input", { id: "telefon", class: "mt-1 w-full border rounded-xl px-3 py-2", placeholder: "Contoh: 01157872059" })
          ]),
          el("div", {}, [
            el("label", { class: "text-sm text-slate-700" }, ["Produk / Catatan"]),
            el("input", { id: "produk", class: "mt-1 w-full border rounded-xl px-3 py-2", placeholder: "Banner, Sticker, dll" })
          ]),
          el("div", {}, [
            el("label", { class: "text-sm text-slate-700" }, ["Jumlah (RM)"]),
            el("input", { id: "jumlah", type: "number", step: "0.01", class: "mt-1 w-full border rounded-xl px-3 py-2", placeholder: "Contoh: 50.00" })
          ]),
        ]),

        el("div", { class: "mt-5 flex flex-col md:flex-row gap-3" }, [
          el("button", {
            class: "px-4 py-2 rounded-xl bg-slate-900 text-white hover:opacity-90",
            onclick: async () => {
              const nama = document.getElementById("nama").value.trim();
              const telefon = document.getElementById("telefon").value.trim();
              const produk = document.getElementById("produk").value.trim();
              const jumlah = document.getElementById("jumlah").value.trim();

              if (!nama || !telefon || !produk || !jumlah) {
                setStatus("Sila isi semua field dulu.", "error");
                return;
              }

              // next step: call Netlify function create-bill
              setStatus("OK. UI dah siap ✅ (Next: sambung Netlify function create-bill).", "ok");
            }
          }, ["Buat Bil (ToyyibPay)"]),
          
          el("button", {
            class: "px-4 py-2 rounded-xl bg-white border hover:bg-slate-50",
            onclick: () => {
              document.getElementById("nama").value = "";
              document.getElementById("telefon").value = "";
              document.getElementById("produk").value = "";
              document.getElementById("jumlah").value = "";
              setStatus("Reset.", "info");
            }
          }, ["Reset"])
        ]),

        el("div", { id: "status", class: "mt-4 text-sm" }, [""])
      ])
    ])
  ])
);

function setStatus(msg, type) {
  const s = document.getElementById("status");
  const base = "mt-4 text-sm p-3 rounded-xl border";
  if (type === "ok") s.className = base + " bg-emerald-50 border-emerald-200 text-emerald-800";
  else if (type === "error") s.className = base + " bg-red-50 border-red-200 text-red-800";
  else s.className = base + " bg-slate-50 border-slate-200 text-slate-700";
  s.textContent = msg;
}
