import { NextResponse } from "next/server"
import { deleteTicket } from "@/lib/db"

export async function POST(request: Request) {
  try {
    // Parse the request body to get the ticket ID
    const body = await request.json()
    const { ticketId } = body

    if (!ticketId) {
      return NextResponse.json({ success: false, error: "Ticket ID is required" }, { status: 400 })
    }

    // Delete the ticket
    await deleteTicket(ticketId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting ticket:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
