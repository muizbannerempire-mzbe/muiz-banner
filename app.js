document.addEventListener('DOMContentLoaded', () => {
    // Cari butang yang mempunyai perkataan "ToyyibPay" atau "Buat Bil"
    const btnBuatBil = Array.from(document.querySelectorAll('button')).find(b => 
        b.innerText.includes('ToyyibPay') || b.innerText.includes('Buat Bil')
    );
    
    if(btnBuatBil) {
        btnBuatBil.addEventListener('click', async (e) => {
            e.preventDefault(); // Menghalang browser daripada memuat semula halaman
            
            // Ambil data dari input UI (pastikan placeholder sepadan dengan HTML anda)
            const nama = document.querySelector('input[placeholder*="Nama"]')?.value || 'Pelanggan';
            const telefon = document.querySelector('input[placeholder*="Telefon"]')?.value || '0123456789';
            const produk = document.querySelector('input[placeholder*="Produk"]')?.value || 'Banner';
            const jumlah = document.querySelector('input[placeholder*="Jumlah"]')?.value || '50';

            // Tukar teks butang semasa proses 'loading'
            const originalText = btnBuatBil.innerText;
            btnBuatBil.innerText = "Memproses Bil...";
            btnBuatBil.disabled = true;

            const orderData = {
                name: nama,
                phone: telefon,
                note: produk,
                amount: parseFloat(jumlah)
            };

            try {
                // Panggil Netlify Function
                // Pastikan anda mempunyai fail create-bill.js di dalam folder netlify/functions
                const response = await fetch('/.netlify/functions/create-bill', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                });

                const textResult = await response.text();
                let result;
                
                try {
                    result = JSON.parse(textResult);
                } catch(err) {
                    console.error("Ralat Server:", textResult);
                    alert("Fungsi backend belum sedia. Sila semak log deployment di Netlify.");
                    btnBuatBil.innerText = originalText;
                    btnBuatBil.disabled = false;
                    return;
                }

                if (response.ok && result.url) {
                    // Berjaya! Membawa pelanggan terus ke halaman pembayaran ToyyibPay
                    window.location.href = result.url;
                } else {
                    alert(`Ralat: ${result.error || 'Gagal mencipta bil.'}`);
                    btnBuatBil.innerText = originalText;
                    btnBuatBil.disabled = false;
                }
            } catch (error) {
                console.error("Ralat panggilan fungsi:", error);
                alert("Gagal menyambung ke pelayan. Pastikan sambungan internet anda stabil.");
                btnBuatBil.innerText = originalText;
                btnBuatBil.disabled = false;
            }
        });
    }
});
