// Layout ini sengaja dibuat sederhana untuk halaman cetak
// agar tidak ada elemen UI lain yang ikut tercetak.
export default function PrintLayout({ children }) {
    return (
        <html>
            <body>
                {children}
            </body>
        </html>
    );
}
