import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Crear tabla de tickets
    const { error: ticketsError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status TEXT NOT NULL,
        type TEXT NOT NULL,
        message TEXT,
        skin TEXT,
        steam_id TEXT,
        steam_name TEXT
      );
    `)

    if (ticketsError) {
      console.error("Error creating tickets table:", ticketsError)
      return NextResponse.json({ error: "Error creating tickets table" }, { status: 500 })
    }

    // Crear tabla de mensajes
    const { error: messagesError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
        sender TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)

    if (messagesError) {
      console.error("Error creating messages table:", messagesError)
      return NextResponse.json({ error: "Error creating messages table" }, { status: 500 })
    }

    // Crear índices
    await supabase.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_ticket_id ON messages(ticket_id);
      CREATE INDEX IF NOT EXISTS idx_tickets_steam_id ON tickets(steam_id);
    `)

    return NextResponse.json({ success: true, message: "Database setup completed" })
  } catch (error) {
    console.error("Error setting up database:", error)
    return NextResponse.json({ error: "Error setting up database" }, { status: 500 })
  }
}
