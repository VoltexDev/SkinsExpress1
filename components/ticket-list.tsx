"use client"

import { Input } from "@/components/ui/input"
import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageCircle, Trash2 } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import {
  getTickets,
  getMessagesByTicketId,
  createMessage,
  subscribeToMessages,
  deleteTicket,
  type Ticket,
  type Message,
} from "@/lib/db"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [showChat, setShowChat] = useState<number | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Cargar tickets desde Supabase
  useEffect(() => {
    async function loadTickets() {
      try {
        // Get current user
        const user = getCurrentUser()
        setCurrentUser(user)

        if (user && user.steamid) {
          const userTickets = await getTickets(user.steamid)
          setTickets(userTickets)
        } else {
          setTickets([])
        }
      } catch (error) {
        console.error("Error loading tickets:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los tickets. Por favor, intenta de nuevo.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadTickets()
  }, [toast])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/80 hover:bg-yellow-600/80"
      case "in-progress":
        return "bg-blue-500/80 hover:bg-blue-600/80"
      case "completed":
        return "bg-green-500/80 hover:bg-green-600/80"
      default:
        return "bg-gray-500/80 hover:bg-gray-600/80"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "in-progress":
        return "En Proceso"
      case "completed":
        return "Completado"
      default:
        return status
    }
  }

  const handleDeleteTicket = async (ticketId: number) => {
    try {
      await deleteTicket(ticketId)
      // Remove the ticket from the state
      setTickets(tickets.filter((ticket) => ticket.id !== ticketId))
      toast({
        title: "Ticket eliminado",
        description: "El ticket ha sido eliminado correctamente.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error deleting ticket:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el ticket. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tickets.length === 0 ? (
        <div className="text-center py-8 backdrop-blur-sm bg-black/30 rounded-lg">
          <p className="text-gray-400 mb-4">No tienes tickets activos</p>
          <Link href="/tickets/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Crear Ticket</Button>
          </Link>
        </div>
      ) : (
        tickets.map((ticket) => (
          <div key={ticket.id} className="backdrop-blur-sm bg-black/40 rounded-lg overflow-hidden">
            <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium text-white">{ticket.title}</h3>
                  <Badge className={`${getStatusColor(ticket.status)}`}>{getStatusText(ticket.status)}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>ID: #{ticket.id}</span>
                  <span>Fecha: {new Date(ticket.created_at).toLocaleDateString()}</span>
                  <span>Tipo: {ticket.type}</span>
                  {ticket.steam_name && <span>Usuario: {ticket.steam_name}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => setShowChat(showChat === ticket.id ? null : ticket.id)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-gray-900 border-gray-800">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">¿Eliminar ticket?</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-400">
                        Esta acción no se puede deshacer. Se eliminará permanentemente el ticket y todos sus mensajes.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-gray-800 text-white hover:bg-gray-700">
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => handleDeleteTicket(ticket.id)}
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {showChat === ticket.id && (
              <div className="border-t border-gray-700 p-4">
                <LiveChat ticketId={ticket.id} />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

function LiveChat({ ticketId }: { ticketId: number }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Cargar mensajes y suscribirse a nuevos mensajes
  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    async function loadMessages() {
      try {
        setLoading(true)
        const ticketMessages = await getMessagesByTicketId(ticketId)
        setMessages(ticketMessages)

        // Suscribirse a nuevos mensajes
        unsubscribe = subscribeToMessages(ticketId, (newMessage) => {
          setMessages((prevMessages) => [...prevMessages, newMessage])
        })
      } catch (error) {
        console.error("Error loading messages:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los mensajes. Por favor, intenta de nuevo.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadMessages()

    // Limpiar suscripción al desmontar
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [ticketId, toast])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      // Enviar mensaje del usuario
      await createMessage({
        ticket_id: ticketId,
        sender: "user",
        content: newMessage,
      })

      // Limpiar campo de mensaje
      setNewMessage("")

      // Enviar respuesta automática después de un segundo
      setTimeout(async () => {
        await createMessage({
          ticket_id: ticketId,
          sender: "trader",
          content: "Gracias por tu mensaje. Un trader te responderá en breve.",
        })
      }, 1000)
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-80">
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 p-3 bg-gray-900/50 rounded-lg">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">No hay mensajes. Envía el primero para iniciar la conversación.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-700 text-white"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{message.sender === "user" ? "Tú" : "Trader"}</span>
                  <span className="text-xs opacity-70 ml-2">
                    {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p>{message.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-gray-800/70 border-gray-700 text-white"
        />
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
          Enviar
        </Button>
      </form>
    </div>
  )
}
