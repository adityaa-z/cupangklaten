import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    const { name, email, password, phone, address } = await req.json();

    // Validasi input
    if (!name || !email || !password || !phone || !address) {
      return NextResponse.json({ error: "Semua kolom wajib diisi" }, { status: 400 });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await query("SELECT id FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Email sudah terdaftar. Silakan gunakan email lain atau login." }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan ke database dengan status pending
    await query(
      "INSERT INTO users (name, email, password, phone, address, status, role) VALUES (?, ?, ?, ?, ?, 'pending', 'member')",
      [name, email, hashedPassword, phone, address]
    );

    return NextResponse.json({ message: "Pendaftaran berhasil! Silakan login." }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server. Coba lagi nanti." }, { status: 500 });
  }
}
