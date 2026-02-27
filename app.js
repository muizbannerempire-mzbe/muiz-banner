import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Calculator, ShoppingCart, Image as ImageIcon,
  ArrowRight, ArrowLeft, Package, Plus, Trash2,
  Truck, Store, ExternalLink, Lock
} from "lucide-react";

const App = () => {
  // --- STATE UTAMA ---
  const [currentView, setCurrentView] = useState("home");
  const [shopTab, setShopTab] = useState("banner");
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // --- STATE KALKULATOR BANNER ---
  const [lebar, setLebar] = useState(3);
  const [panjang, setPanjang] = useState(10);
  const [bahan, setBahan] = useState("tarpaulin");
  const [servis, setServis] = useState("print_design");
  const [kuantiti, setKuantiti] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState("pickup");

  // --- DATA READY STOCK ---
  const [products] = useState([
    { id: "P1", name: "T-Stand Bunting (Besi)", price: 25.0, desc: "Tahan lasak & stabil" },
    { id: "P2", name: "X-Stand Bunting", price: 15.0, desc: "Ringan & mudah dibawa" },
    { id: "P3", name: "Roll Up Stand", price: 45.0, desc: "Professional look" },
    { id: "P4", name: "Double Sided Tape (Kuat)", price: 5.0, desc: "Untuk lekat banner" },
    { id: "P5", name: "Tali Banner (10 meter)", price: 8.0, desc: "Tali nylon berkualiti" }
  ]);

  // --- HARGA BAHAN ---
  const hargaBahan = {
    tarpaulin: { nama: "Tarpaulin (Standard)", harga: 4.0 },
    bunting: { nama: "Bunting (Halus)", harga: 3.5 },
    mesh: { nama: "Mesh (Berlubang)", harga: 5.5 }
  };
  const cajDesign = 50.0;

  const sqft = lebar * panjang;

  // Nota: ikut struktur asal mu (price = line total)
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const shippingFee = deliveryMethod === "delivery" ? 15.0 : 0;
  const cartTotal = cartSubtotal + shippingFee;

  // === TOYYIBPAY: CREATE BILL → REDIRECT ===
  const handleToyyibPay = async () => {
    if (!customerName || !customerPhone) {
      alert("Sila masukkan nama dan nombor telefon.");
      return;
    }
    if (cart.length === 0) {
      alert("Troli anda kosong.");
      return;
    }

    try {
      const res = await fetch("/api/create-bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customerName,
          phone: customerPhone,
          amount: cartTotal
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Gagal create bill ToyyibPay. Semak log Netlify.");
        console.log("Create Bill Error:", data);
        return;
      }

      window.location.href = data.paymentUrl;
    } catch (err) {
      alert("Network error. Cuba lagi.");
      console.log(err);
    }
  };

  // === ADD BANNER ===
  const addBannerToCart = () => {
    const price = (sqft * hargaBahan[bahan].harga * kuantiti) + (servis === "print_design" ? cajDesign : 0);
    const newItem = {
      id: `banner-${Date.now()}`,
      name: `Banner ${hargaBahan[bahan].nama}`,
      details: `${lebar}x${panjang} kaki | ${servis === "print_design" ? "Design" : "Cetak"}`,
      price,
      qty: kuantiti,
      type: "banner"
    };
    setCart([...cart, newItem]);
    alert("Banner ditambah ke troli!");
  };

  // === ADD PRODUCT READY STOCK ===
  const addProductToCart = (prod) => {
    const existing = cart.find((item) => item.prodId === prod.id);
    if (existing) {
      setCart(cart.map((item) =>
        item.prodId === prod.id ? { ...item, qty: item.qty + 1, price: item.price + prod.price } : item
      ));
    } else {
      setCart([...cart, {
        id: `prod-${Date.now()}`,
        prodId: prod.id,
        name: prod.name,
        details: "Ready Stock",
        price: prod.price,
        qty: 1,
        type: "product"
      }]);
    }
    alert(`${prod.name} ditambah!`);
  };

  const removeFromCart = (id) => setCart(cart.filter((item) => item.id !== id));

  // === VIEW: HOME ===
  if (currentView === "home") {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-6 rounded-full mb-6 shadow-xl border-4 border-blue-500">
          <ImageIcon size={60} className="text-blue-600" />
        </div>
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight uppercase italic">
          Muiz Banner Empire
        </h1>
        <p className="text-slate-400 mb-10 font-bold uppercase tracking-widest text-sm">
          Sistem Tempahan (ToyyibPay Dynamic)
        </p>
        <button
          onClick={() => setCurrentView("enter_phone")}
          className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-6 rounded-3xl font-black text-2xl shadow-2xl transition-all transform hover:-translate-y-2 flex items-center gap-4"
        >
          MULA TEMPAHAN <ArrowRight size={30} />
        </button>
      </div>
    );
  }

  // === VIEW: ENTER PHONE ===
  if (currentView === "enter_phone") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-100">
          <button
            onClick={() => setCurrentView("home")}
            className="mb-6 text-slate-400 hover:text-blue-600 flex items-center gap-2 font-bold transition-colors"
          >
            <ArrowLeft size={20} /> Kembali
          </button>

          <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">
            Maklumat Anda
          </h2>
          <p className="text-slate-500 mb-8 text-sm font-medium">
            Nama & telefon untuk rekod tempahan.
          </p>

          <div className="space-y-4 mb-8">
            <input
              type="text"
              placeholder="Nama Penuh"
              className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-lg"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <input
              type="tel"
              placeholder="No Telefon"
              className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-lg"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>

          <button
            onClick={() => setCurrentView("shop")}
            className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl text-xl shadow-lg hover:bg-blue-500 transition-all"
          >
            Masuk Kedai
          </button>
        </div>
      </div>
    );
  }

  // === VIEW: SHOP ===
  if (currentView === "shop") {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
          <h2 className="font-black text-xl italic text-blue-600 tracking-tighter">MUIZ BANNER</h2>

          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button
              onClick={() => setShopTab("banner")}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                shopTab === "banner" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
              }`}
            >
              BANNER
            </button>
            <button
              onClick={() => setShopTab("ready_stock")}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                shopTab === "ready_stock" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
              }`}
            >
              READY STOCK
            </button>
          </div>

          <button
            onClick={() => setCurrentView("cart")}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 relative transition-all hover:bg-slate-800"
          >
            <ShoppingCart size={20} />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-4 border-white animate-bounce">
                {cart.length}
              </span>
            )}
          </button>
        </header>

        <main className="max-w-6xl mx-auto p-6">
          {shopTab === "banner" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-8">
                <div className="flex items-center justify-between border-b pb-4">
                  <h3 className="text-2xl font-black flex items-center gap-3">
                    <Calculator className="text-blue-600" size={30} /> Kalkulator Banner
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-500 uppercase tracking-tighter">Lebar (kaki)</label>
                    <input
                      type="number"
                      value={lebar}
                      onChange={(e) => setLebar(Number(e.target.value))}
                      className="w-full p-5 bg-slate-50 rounded-2xl font-black text-xl border-2 border-transparent focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-500 uppercase tracking-tighter">Panjang (kaki)</label>
                    <input
                      type="number"
                      value={panjang}
                      onChange={(e) => setPanjang(Number(e.target.value))}
                      className="w-full p-5 bg-slate-50 rounded-2xl font-black text-xl border-2 border-transparent focus:border-blue-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-black text-slate-500 uppercase tracking-tighter">Kuantiti</label>
                    <input
                      type="number"
                      min={1}
                      value={kuantiti}
                      onChange={(e) => setKuantiti(Math.max(1, Number(e.target.value)))}
                      className="w-full p-5 bg-slate-50 rounded-2xl font-black text-xl border-2 border-transparent focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Pilih Jenis Bahan</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {Object.entries(hargaBahan).map(([k, v]) => (
                      <button
                        key={k}
                        onClick={() => setBahan(k)}
                        className={`p-4 rounded-2xl border-2 font-black transition-all text-sm flex flex-col items-center gap-1 ${
                          bahan === k ? "border-blue-600 bg-blue-50 text-blue-700 shadow-md" : "border-slate-100 text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        <span>{v.nama}</span>
                        <span className="text-[10px] opacity-60">RM {v.harga.toFixed(2)} / kaki²</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Servis Design</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setServis("print")}
                      className={`p-5 rounded-2xl border-2 font-black transition-all ${
                        servis === "print" ? "border-blue-600 bg-blue-50 text-blue-700 shadow-md" : "border-slate-100 text-slate-500"
                      }`}
                    >
                      Cetak Sahaja
                    </button>
                    <button
                      onClick={() => setServis("print_design")}
                      className={`p-5 rounded-2xl border-2 font-black transition-all ${
                        servis === "print_design" ? "border-blue-600 bg-blue-50 text-blue-700 shadow-md" : "border-slate-100 text-slate-500"
                      }`}
                    >
                      Cetak + Design (+RM50)
                    </button>
                  </div>
                </div>

                <button
                  onClick={addBannerToCart}
                  className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-blue-500 transition-all flex items-center justify-center gap-3"
                >
                  <Plus size={24} /> TAMBAH KE TROLI
                </button>
              </div>

              <div className="lg:col-span-1 bg-slate-900 rounded-[2.5rem] p-8 text-white h-fit shadow-2xl sticky top-24 border border-slate-800">
                <h4 className="text-slate-500 font-bold uppercase text-xs mb-4 tracking-widest border-b border-slate-800 pb-2">
                  Anggaran Banner
                </h4>
                <div className="text-5xl font-black text-blue-400 mb-6 tracking-tighter">
                  RM {((sqft * hargaBahan[bahan].harga * kuantiti) + (servis === "print_design" ? cajDesign : 0)).toFixed(2)}
                </div>
                <div className="space-y-3 text-xs font-bold text-slate-400 uppercase">
                  <div className="flex justify-between"><span>Saiz:</span><span className="text-white">{sqft} Kaki²</span></div>
                  <div className="flex justify-between"><span>Bahan:</span><span className="text-white">{bahan}</span></div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Package className="text-blue-600" size={32} />
                <h3 className="text-3xl font-black text-slate-800">Produk Ready Stock</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <div key={p.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col hover:shadow-xl transition-all">
                    <div className="bg-slate-50 w-full h-40 rounded-2xl mb-4 flex items-center justify-center">
                      <Package className="text-slate-200" size={60} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-xl text-slate-800 mb-1">{p.name}</h4>
                      <p className="text-sm text-slate-400 mb-4 font-medium">{p.desc}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-2xl font-black text-blue-600">RM {p.price.toFixed(2)}</div>
                      <button onClick={() => addProductToCart(p)} className="bg-slate-900 text-white p-3 rounded-xl hover:bg-blue-600 transition-colors">
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // === VIEW: CART ===
  if (currentView === "cart") {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setCurrentView("shop")}
            className="mb-8 flex items-center gap-2 text-slate-400 font-black uppercase text-sm hover:text-blue-600 transition-all"
          >
            <ArrowLeft size={18} /> Tambah Lagi
          </button>

          <h2 className="text-4xl font-black mb-10 text-slate-800 tracking-tight">Troli Tempahan</h2>

          <div className="space-y-4 mb-10">
            {cart.length === 0 ? (
              <div className="bg-white p-20 rounded-[2.5rem] text-center border-2 border-dashed border-slate-200 shadow-inner">
                <ShoppingCart size={60} className="mx-auto text-slate-100 mb-4" />
                <p className="text-slate-400 font-black">Troli kosong. Mari beli sesuatu!</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-3xl flex justify-between items-center shadow-sm border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${item.type === "banner" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"}`}>
                      {item.type === "banner" ? <ImageIcon size={24} /> : <Package size={24} />}
                    </div>
                    <div>
                      <div className="font-black text-xl text-slate-800 leading-tight">
                        {item.name} <span className="text-sm font-normal text-slate-400">x{item.qty}</span>
                      </div>
                      <div className="text-sm text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                        {item.details}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="font-black text-2xl text-slate-800 tracking-tight text-right">
                      RM {item.price.toFixed(2)}
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-slate-200 hover:text-red-500 transition-colors p-2">
                      <Trash2 size={24} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-10">
            <h3 className="font-black text-xl mb-6 flex items-center gap-2">
              <Truck size={24} className="text-blue-600" /> Kaedah Penerimaan
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setDeliveryMethod("pickup")}
                className={`p-6 rounded-2xl border-2 font-black flex flex-col items-center gap-2 transition-all ${
                  deliveryMethod === "pickup" ? "border-blue-600 bg-blue-50 text-blue-700 shadow-md" : "border-slate-50 text-slate-400"
                }`}
              >
                <Store size={30} /> <span>Ambil Kedai</span>
              </button>

              <button
                onClick={() => setDeliveryMethod("delivery")}
                className={`p-6 rounded-2xl border-2 font-black flex flex-col items-center gap-2 transition-all ${
                  deliveryMethod === "delivery" ? "border-blue-600 bg-blue-50 text-blue-700 shadow-md" : "border-slate-50 text-slate-400"
                }`}
              >
                <Truck size={30} /> <span>Penghantaran (+RM15)</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white shadow-2xl relative border border-slate-800">
            <div className="flex justify-between items-end mb-10">
              <div>
                <p className="text-slate-500 font-black uppercase text-xs tracking-widest mb-2">Jumlah Keseluruhan</p>
                <div className="text-7xl font-black text-blue-400 tracking-tighter">RM {cartTotal.toFixed(2)}</div>
              </div>
            </div>

            <button
              onClick={handleToyyibPay}
              disabled={cart.length === 0}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-white py-6 rounded-2xl font-black text-2xl shadow-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105"
            >
              <ExternalLink size={28} /> TERUSKAN KE BAYARAN (TOYYIBPAY)
            </button>

            <div className="mt-8 flex items-center justify-center gap-3 text-slate-600 font-black text-[10px] uppercase tracking-widest opacity-80">
              <Lock size={12} /> Dynamic Amount via ToyyibPay
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

createRoot(document.getElementById("root")).render(<App />);