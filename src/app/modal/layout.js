export const metadata = {
    title: 'Kalkulator Modal Internal',
    description: 'Halaman perhitungan modal internal Cupang Klaten.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function ModalLayout({ children }) {
    return <section>{children}</section>;
}
