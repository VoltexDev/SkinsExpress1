import { supabase } from "./supabase"
import type { Database } from "./supabase"

export type Ticket = Database["public"]["Tables"]["tickets"]["Row"]
export type TicketMessage = Database["public"]["Tables"]["ticket_messages"]["Row"]

// Crear un nuevo ticket
export async function createTicket(ticketData: {
  user_id: string
  title: string
  type: string
  message: string
  skin?: string
}) {
  try {
    const { data, error } = await supabase
      .from("tickets")
      .insert({
        ...ticketData,
        status: "open",
      })
      .select()
      .single()

    if (error) {
      console.error("Error al crear ticket:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error al crear ticket:", error)
    return null
  }
}

// Obtener todos los tickets (para administradores)
export async function getAllTickets() {
  try {
    const { data, error } = await supabase
      .from("tickets")
      .select(`
        *,
        user:users(id, username, avatar_url)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error al obtener tickets:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error al obtener tickets:", error)
    return []
  }
}

// Obtener tickets de un usuario
export async function getUserTickets(userId: string) {
  try {
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error al obtener tickets del usuario:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error al obtener tickets del usuario:", error)
    return []
  }
}

// Obtener un ticket específico
export async function getTicket(ticketId: string) {
  try {
    const { data, error } = await supabase
      .from("tickets")
      .select(`
        *,
        user:users(id, username, avatar_url),
        messages:ticket_messages(
          id,
          message,
          created_at,
          user:users(id, username, avatar_url)
        )
      `)
      .eq("id", ticketId)
      .single()

    if (error) {
      console.error("Error al obtener ticket:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error al obtener ticket:", error)
    return null
  }
}

// Actualizar el estado de un ticket
export async function updateTicketStatus(ticketId: string | number, status: string) {
  try {
    const { data, error } = await supabase
      .from("tickets")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", ticketId)
      .select()
      .single()

    if (error) {
      console.error("Error al actualizar estado del ticket:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error al actualizar estado del ticket:", error)
    return null
  }
}

// Obtener mensajes de un ticket
export async function getTicketMessages(ticketId: number | string): Promise<TicketMessage[]> {
  try {
    const { data, error } = await supabase
      .from("ticket_messages")
      .select(`
        *,
        users:user_id (
          username,
          avatar_url,
          is_admin
        )
      `)
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error al obtener mensajes:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error al obtener mensajes:", error)
    return []
  }
}

// Enviar un mensaje a un ticket
export async function sendMessage(ticketId: string, userId: string, message: string, isAdmin = false) {
  try {
    // Insertar mensaje
    const { data, error } = await supabase
      .from("ticket_messages")
      .insert({
        ticket_id: ticketId,
        user_id: userId,
        message,
      })
      .select()
      .single()

    if (error) {
      console.error("Error al enviar mensaje:", error)
      return null
    }

    // Si es un administrador y el ticket está abierto, cambiar estado a "in_progress"
    if (isAdmin) {
      const { data: ticket } = await supabase.from("tickets").select("status").eq("id", ticketId).single()

      if (ticket && ticket.status === "open") {
        await updateTicketStatus(ticketId, "in_progress")
      }
    }

    return data
  } catch (error) {
    console.error("Error al enviar mensaje:", error)
    return null
  }
}

// Suscribirse a mensajes de un ticket en tiempo real
export function subscribeToTicketMessages(ticketId: number | string, callback: (message: any) => void) {
  return supabase
    .channel(`ticket_messages:${ticketId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "ticket_messages",
        filter: `ticket_id=eq.${ticketId}`,
      },
      (payload) => {
        callback(payload.new)
      },
    )
    .subscribe()
}

// Obtener el usuario actual
export async function getCurrentUser() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    const { data } = await supabase.from("users").select("*").eq("id", user.id).single()

    return data
  } catch (error) {
    console.error("Error al obtener usuario actual:", error)
    return null
  }
}
