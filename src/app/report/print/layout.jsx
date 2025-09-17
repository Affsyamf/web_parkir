export const metadata = {
    title: 'Cetak Laporan Parkirin',
};

export default function PrintLayout({ children }) {
    return (
        <html>
            <body>
                {children}
            </body>
        </html>
    );
}

