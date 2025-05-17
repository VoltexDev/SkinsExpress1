"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { isTrader } from "@/lib/auth"
import { ArrowLeft, Search, MessageCircle, CheckCircle, Clock, User, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  getTickets,
  updateTicketStatus,
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

export default function AdminDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        // Check if user is a trader/admin
        const traderStatus = isTrader()
        setIsAdmin(traderStatus)

        // If not a trader, redirect to home page
        if (!traderStatus) {
          router.push("/")
          return
        }

        // Load tickets from Supabase
        const allTickets = await getTickets()
        setTickets(allTickets)
        setFilteredTickets(allTickets)
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

    loadData()
  }, [router, toast])

  // Filter tickets based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTickets(tickets)
      return
    }

    const filtered = tickets.filter(
      (ticket) =>
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.id.toString().includes(searchTerm) ||
        ticket.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.steam_name && ticket.steam_name.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    setFilteredTickets(filtered)
  }, [searchTerm, tickets])

  const handleStatusChange = async (ticketId: number, newStatus: "pending" | "in-progress" | "completed") => {
    try {
      // Update ticket status in Supabase
      const updatedTicket = await updateTicketStatus(ticketId, newStatus)

      // Update local state
      setTickets(tickets.map((ticket) => (ticket.id === ticketId ? updatedTicket : ticket)))
      setFilteredTickets(filteredTickets.map((ticket) => (ticket.id === ticketId ? updatedTicket : ticket)))

      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(updatedTicket)
      }

      toast({
        title: "Estado actualizado",
        description: `El ticket ha sido marcado como ${getStatusText(newStatus)}.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error updating ticket status:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del ticket. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTicket = async (ticketId: number) => {
    try {
      await deleteTicket(ticketId)

      // Update local state
      const updatedTickets = tickets.filter((ticket) => ticket.id !== ticketId)
      setTickets(updatedTickets)
      setFilteredTickets(filteredTickets.filter((ticket) => ticket.id !== ticketId))

      // If the deleted ticket was selected, clear the selection
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(null)
      }

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

  // If not an admin, don't render the dashboard
  if (!isAdmin) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen relative text-white flex items-center justify-center">
        <div className="fixed inset-0 z-0">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-0Is4KdsfvT3ztXg6dmbWOfHrVS64xu.png"
            alt="Mediterranean Courtyard Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative text-white">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-0Is4KdsfvT3ztXg6dmbWOfHrVS64xu.png"
          alt="Mediterranean Courtyard Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <header className="border-b border-gray-800/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center text-blue-400 hover:text-blue-300 transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span>Volver al Inicio</span>
              </Link>
              <h1 className="text-2xl font-bold text-blue-400">Panel de Administración</h1>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                if (
                  window.confirm(
                    "¿Estás seguro de que deseas eliminar todos los tickets? Esta acción no se puede deshacer.",
                  )
                ) {
                  try {
                    await fetch("/api/admin/delete-tickets", { method: "POST" })
                    toast({
                      title: "Tickets eliminados",
                      description: "Todos los tickets han sido eliminados correctamente.",
                      variant: "default",
                    })
                    window.location.reload()
                  } catch (error) {
                    console.error("Error deleting tickets:", error)
                    toast({
                      title: "Error",
                      description: "No se pudieron eliminar los tickets. Por favor, intenta de nuevo.",
                      variant: "destructive",
                    })
                  }
                }
              }}
            >
              Eliminar Todos los Tickets
            </Button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="backdrop-blur-sm bg-black/40 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-blue-400">Tickets</h2>

                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar tickets..."
                    className="pl-10 bg-gray-800/50 border-gray-700 text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Ticket Filters */}
                <Tabs defaultValue="all" className="mb-6">
                  <TabsList className="w-full bg-gray-800/50">
                    <TabsTrigger value="all" className="flex-1">
                      Todos
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="flex-1">
                      Pendientes
                    </TabsTrigger>
                    <TabsTrigger value="in-progress" className="flex-1">
                      En Proceso
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="flex-1">
                      Completados
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto">
                    {filteredTickets.length === 0 ? (
                      <p className="text-gray-400 text-center py-4">No hay tickets disponibles</p>
                    ) : (
                      filteredTickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedTicket?.id === ticket.id
                              ? "bg-blue-900/50 border border-blue-500"
                              : "bg-gray-800/50 hover:bg-gray-700/50"
                          }`}
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium truncate">{ticket.title}</h3>
                            <Badge className={`${getStatusColor(ticket.status)}`}>{getStatusText(ticket.status)}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span>#{ticket.id}</span>
                            <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                            <span>{ticket.type}</span>
                          </div>
                          {ticket.steam_name && (
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                              <User className="h-3 w-3" />
                              <span>{ticket.steam_name}</span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="pending" className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto">
                    {filteredTickets.filter((t) => t.status === "pending").length === 0 ? (
                      <p className="text-gray-400 text-center py-4">No hay tickets pendientes</p>
                    ) : (
                      filteredTickets
                        .filter((t) => t.status === "pending")
                        .map((ticket) => (
                          <div
                            key={ticket.id}
                            className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                              selectedTicket?.id === ticket.id
                                ? "bg-blue-900/50 border border-blue-500"
                                : "bg-gray-800/50 hover:bg-gray-700/50"
                            }`}
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="font-medium truncate">{ticket.title}</h3>
                              <Badge className="bg-yellow-500/80">Pendiente</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span>#{ticket.id}</span>
                              <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                              <span>{ticket.type}</span>
                            </div>
                            {ticket.steam_name && (
                              <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                                <User className="h-3 w-3" />
                                <span>{ticket.steam_name}</span>
                              </div>
                            )}
                          </div>
                        ))
                    )}
                  </TabsContent>

                  <TabsContent value="in-progress" className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto">
                    {filteredTickets.filter((t) => t.status === "in-progress").length === 0 ? (
                      <p className="text-gray-400 text-center py-4">No hay tickets en proceso</p>
                    ) : (
                      filteredTickets
                        .filter((t) => t.status === "in-progress")
                        .map((ticket) => (
                          <div
                            key={ticket.id}
                            className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                              selectedTicket?.id === ticket.id
                                ? "bg-blue-900/50 border border-blue-500"
                                : "bg-gray-800/50 hover:bg-gray-700/50"
                            }`}
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="font-medium truncate">{ticket.title}</h3>
                              <Badge className="bg-blue-500/80">En Proceso</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span>#{ticket.id}</span>
                              <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                              <span>{ticket.type}</span>
                            </div>
                            {ticket.steam_name && (
                              <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                                <User className="h-3 w-3" />
                                <span>{ticket.steam_name}</span>
                              </div>
                            )}
                          </div>
                        ))
                    )}
                  </TabsContent>

                  <TabsContent value="completed" className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto">
                    {filteredTickets.filter((t) => t.status === "completed").length === 0 ? (
                      <p className="text-gray-400 text-center py-4">No hay tickets completados</p>
                    ) : (
                      filteredTickets
                        .filter((t) => t.status === "completed")
                        .map((ticket) => (
                          <div
                            key={ticket.id}
                            className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                              selectedTicket?.id === ticket.id
                                ? "bg-blue-900/50 border border-blue-500"
                                : "bg-gray-800/50 hover:bg-gray-700/50"
                            }`}
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="font-medium truncate">{ticket.title}</h3>
                              <Badge className="bg-green-500/80">Completado</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span>#{ticket.id}</span>
                              <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                              <span>{ticket.type}</span>
                            </div>
                            {ticket.steam_name && (
                              <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                                <User className="h-3 w-3" />
                                <span>{ticket.steam_name}</span>
                              </div>
                            )}
                          </div>
                        ))
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              {selectedTicket ? (
                <div className="backdrop-blur-sm bg-black/40 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-blue-400">{selectedTicket.title}</h2>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mt-2">
                        <span>ID: #{selectedTicket.id}</span>
                        <span>Fecha: {new Date(selectedTicket.created_at).toLocaleDateString()}</span>
                        <span>Tipo: {selectedTicket.type}</span>
                        <Badge className={`${getStatusColor(selectedTicket.status)}`}>
                          {getStatusText(selectedTicket.status)}
                        </Badge>
                      </div>

                      {/* User information */}
                      {selectedTicket.steam_name && (
                        <div className="flex items-center gap-2 mt-3 p-2 bg-gray-800/50 rounded-md">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{selectedTicket.steam_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{selectedTicket.steam_name}</div>
                            {selectedTicket.steam_id && (
                              <div className="text-xs text-gray-400">Steam ID: {selectedTicket.steam_id}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-yellow-600 hover:bg-yellow-700"
                        onClick={() => handleStatusChange(selectedTicket.id, "pending")}
                        disabled={selectedTicket.status === "pending"}
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Pendiente
                      </Button>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleStatusChange(selectedTicket.id, "in-progress")}
                        disabled={selectedTicket.status === "in-progress"}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        En Proceso
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleStatusChange(selectedTicket.id, "completed")}
                        disabled={selectedTicket.status === "completed"}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completado
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Eliminar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-gray-900 border-gray-800">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">¿Eliminar ticket?</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                              Esta acción no se puede deshacer. Se eliminará permanentemente el ticket y todos sus
                              mensajes.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-800 text-white hover:bg-gray-700">
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700 text-white"
                              onClick={() => handleDeleteTicket(selectedTicket.id)}
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {selectedTicket.skin && (
                    <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-300 mb-2">Skin Solicitada:</h3>
                      <p className="text-white">{selectedTicket.skin}</p>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Mensaje del Usuario:</h3>
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <p className="text-white">{selectedTicket.message || "No hay mensaje disponible."}</p>
                    </div>
                  </div>

                  {/* Chat Section */}
                  <div className="border-t border-gray-700 pt-6">
                    <h3 className="text-lg font-medium mb-4">Conversación</h3>
                    <AdminTicketChat ticketId={selectedTicket.id} userName={selectedTicket.steam_name} />
                  </div>
                </div>
              ) : (
                <div className="backdrop-blur-sm bg-black/40 rounded-lg p-6 flex flex-col items-center justify-center min-h-[400px]">
                  <MessageCircle className="h-16 w-16 text-gray-500 mb-4" />
                  <h2 className="text-xl font-medium text-gray-300 mb-2">Selecciona un ticket</h2>
                  <p className="text-gray-400 text-center">
                    Selecciona un ticket de la lista para ver los detalles y responder al usuario.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AdminTicketChat({ ticketId, userName }: { ticketId: number; userName?: string }) {
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
      // Enviar mensaje del trader
      await createMessage({
        ticket_id: ticketId,
        sender: "trader",
        content: newMessage,
      })

      // Limpiar campo de mensaje
      setNewMessage("")
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
    <div className="flex flex-col h-96">
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 p-3 bg-gray-900/50 rounded-lg">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">No hay mensajes en este ticket.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "trader" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.sender === "trader" ? "bg-blue-600 text-white" : "bg-gray-700 text-white"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">
                    {message.sender === "trader" ? "Tú (Trader)" : userName || "Usuario"}
                  </span>
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
