import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createClient()

    // Crear tabla de tickets
    const { error: ticketsError } = await supabase.rpc("create_tickets_table")
    if (ticketsError && !ticketsError.message.includes("already exists")) {
      return NextResponse.json({ success: false, error: ticketsError.message }, { status: 500 })
    }

    // Crear tabla de mensajes
    const { error: messagesError } = await supabase.rpc("create_messages_table")
    if (messagesError && !messagesError.message.includes("already exists")) {
      return NextResponse.json({ success: false, error: messagesError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error initializing database:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
