import { withAuth } from "next-auth/middleware";
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Hanya izinkan zidanp13794@gmail.com untuk mengakses rute admin
        return token?.email === 'zidanp13794@gmail.com';
      },
    },
  }
);

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
