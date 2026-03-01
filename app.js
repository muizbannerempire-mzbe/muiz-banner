// --- app.js ---
// Anda boleh gunakan kod ini untuk menggantikan kod sedia ada dalam app.js jika ia belum berfungsi.

document.addEventListener('DOMContentLoaded', () => {
    // Ambil elemen dari borang
    const btnBuatBil = document.querySelector('button'); // Pastikan ini butang "Buat Bil" anda
    
    if(btnBuatBil) {
        btnBuatBil.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Gantikan querySelector ini dengan ID atau Class sebenar input anda di index.html
            // Contoh di bawah mengandaikan anda ada input dengan nama-nama class ini
            const nama = document.querySelector('input[placeholder*="Nama"]')?.value || 'Pelanggan';
            const telefon = document.querySelector('input[placeholder*="Telefon"]')?.value || '0123456789';
            const produk = document.querySelector('input[placeholder*="Produk"]')?.value || 'Banner';
            const jumlah = document.querySelector('input[placeholder*="Jumlah"]')?.value || '50';

            // Tukar teks butang semasa loading
            const originalText = btnBuatBil.innerText;
            btnBuatBil.innerText = "Memproses...";
            btnBuatBil.disabled = true;

            const orderData = {
                name: nama,
                phone: telefon,
                note: produk,
                amount: parseFloat(jumlah)
            };

            try {
                // Panggil Netlify Function menggunakan URL relatif yang selamat
                const response = await fetch('/.netlify/functions/create-bill', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(orderData)
                });

                const result = await response.json();

                if (response.ok && result.url) {
                    // Berjaya! Arahkan ke ToyyibPay
                    window.location.href = result.url;
                } else {
                    alert(`Ralat: ${result.error || 'Sistem sibuk. Sila cuba lagi.'}`);
                    btnBuatBil.innerText = originalText;
                    btnBuatBil.disabled = false;
                }
            } catch (error) {
                console.error("Ralat panggil function:", error);
                alert("Ralat sistem. Sila pastikan Netlify Functions telah berjaya deploy.");
                btnBuatBil.innerText = originalText;
                btnBuatBil.disabled = false;
            }
        });
    }
});
