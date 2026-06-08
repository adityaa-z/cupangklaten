import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAB from '@/components/FAB';
import CaraOrder from '@/components/CaraOrder';

export default function CaraOrderPage() {
    return (
        <>
            <Navbar />
            <CaraOrder />
            <Footer />
            <FAB />
        </>
    );
}
