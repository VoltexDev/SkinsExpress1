import { getSupabaseClient, createServerSupabaseClient } from "./supabase"

// Tipos
export type Ticket = {
  id: number
  title: string
  created_at: string
  status: "pending" | "in-progress" | "completed"
  type: string
  message?: string
  skin?: string
  steam_id?: string
  steam_name?: string
}

export type Message = {
  id: number
  ticket_id: number
  sender: "user" | "trader"
  content: string
  created_at: string
}

// Funciones para tickets
export async function createTicket(ticket: Omit<Ticket, "id" | "created_at">) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("tickets").insert([ticket]).select()

  if (error) {
    console.error("Error creating ticket:", error)
    throw error
  }

  return data?.[0] as Ticket
}

export async function getTickets(steamId?: string) {
  const supabase = getSupabaseClient()

  let query = supabase.from("tickets").select("*").order("created_at", { ascending: false })

  if (steamId) {
    query = query.eq("steam_id", steamId)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching tickets:", error)
    throw error
  }

  return data as Ticket[]
}

export async function getTicketById(id: number) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("tickets").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching ticket:", error)
    throw error
  }

  return data as Ticket
}

export async function updateTicketStatus(id: number, status: "pending" | "in-progress" | "completed") {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("tickets").update({ status }).eq("id", id).select()

  if (error) {
    console.error("Error updating ticket status:", error)
    throw error
  }

  return data?.[0] as Ticket
}

// New function to delete a ticket
export async function deleteTicket(id: number) {
  const supabase = getSupabaseClient()

  // First delete all messages associated with the ticket (due to foreign key constraints)
  const { error: messagesError } = await supabase.from("messages").delete().eq("ticket_id", id)

  if (messagesError) {
    console.error("Error deleting ticket messages:", messagesError)
    throw messagesError
  }

  // Then delete the ticket
  const { error: ticketError } = await supabase.from("tickets").delete().eq("id", id)

  if (ticketError) {
    console.error("Error deleting ticket:", ticketError)
    throw ticketError
  }

  return { success: true }
}

// Funciones para mensajes
export async function createMessage(message: Omit<Message, "id" | "created_at">) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("messages").insert([message]).select()

  if (error) {
    console.error("Error creating message:", error)
    throw error
  }

  return data?.[0] as Message
}

export async function getMessagesByTicketId(ticketId: number) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching messages:", error)
    throw error
  }

  return data as Message[]
}

// Función para suscribirse a nuevos mensajes en tiempo real
export function subscribeToMessages(ticketId: number, callback: (message: Message) => void) {
  const supabase = getSupabaseClient()

  const subscription = supabase
    .channel(`messages:ticket_id=eq.${ticketId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `ticket_id=eq.${ticketId}`,
      },
      (payload) => {
        callback(payload.new as Message)
      },
    )
    .subscribe()

  return () => {
    supabase.removeChannel(subscription)
  }
}

// Función para crear las tablas necesarias (se ejecuta en el servidor)
export async function setupDatabase() {
  const supabase = createServerSupabaseClient()

  // Crear tabla de tickets si no existe
  const { error: ticketsError } = await supabase.rpc("create_tickets_table_if_not_exists", {})

  if (ticketsError) {
    console.error("Error creating tickets table:", ticketsError)

    // Intentar crear la tabla manualmente
    const { error } = await supabase.query(`
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

    if (error) {
      console.error("Error creating tickets table manually:", error)
    }
  }

  // Crear tabla de mensajes si no existe
  const { error: messagesError } = await supabase.rpc("create_messages_table_if_not_exists", {})

  if (messagesError) {
    console.error("Error creating messages table:", messagesError)

    // Intentar crear la tabla manualmente
    const { error } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER NOT NULL,
        sender TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)

    if (error) {
      console.error("Error creating messages table manually:", error)
    }
  }
}

// Add this function to delete all tickets
export async function deleteAllTickets() {
  const supabase = getSupabaseClient()

  // First delete all messages (due to foreign key constraints)
  const { error: messagesError } = await supabase.from("messages").delete().neq("id", 0)

  if (messagesError) {
    console.error("Error deleting messages:", messagesError)
    throw messagesError
  }

  // Then delete all tickets
  const { error: ticketsError } = await supabase.from("tickets").delete().neq("id", 0)

  if (ticketsError) {
    console.error("Error deleting tickets:", ticketsError)
    throw ticketsError
  }

  return { success: true }
}
