import { NextResponse } from "next/server"
import { deleteAllTickets } from "@/lib/db"

export async function POST() {
  try {
    // Check if the user is a trader/admin
    // Note: This is a server-side function, so we can't use the client-side isTrader function
    // In a real application, you would verify the user's session and permissions here

    // Delete all tickets
    await deleteAllTickets()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting tickets:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
