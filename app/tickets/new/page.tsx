"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { isAuthenticated, getCurrentUser } from "@/lib/auth"
import { createTicket } from "@/lib/db"
import { useToast } from "@/hooks/use-toast"

export default function NewTicketPage() {
  const [ticketType, setTicketType] = useState("purchase")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in
    const authenticated = isAuthenticated()
    setIsLoggedIn(authenticated)

    // Get current user data
    if (authenticated) {
      const user = getCurrentUser()
      setCurrentUser(user)
    }

    // If not logged in, redirect to home page
    if (!authenticated) {
      router.push("/?login=required")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUser) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear un ticket",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Get form data
      const formData = new FormData(e.target as HTMLFormElement)
      const title = formData.get("title") as string
      const message = formData.get("message") as string
      const skin = (formData.get("skin") as string) || ""

      // Create ticket in Supabase
      await createTicket({
        title,
        status: "pending",
        type:
          ticketType === "purchase"
            ? "Compra"
            : ticketType === "sale"
              ? "Venta"
              : ticketType === "trade"
                ? "Intercambio"
                : "Soporte",
        message,
        skin,
        steam_id: currentUser.steamid || "",
        steam_name: currentUser.personaname || "",
      })

      // Show success message
      toast({
        title: "Ticket creado",
        description: "Tu ticket ha sido creado con éxito. Un miembro del staff se pondrá en contacto contigo pronto.",
        variant: "default",
      })

      // Redirect to tickets page
      router.push("/tickets")
    } catch (error) {
      console.error("Error creating ticket:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el ticket. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // If not logged in, don't render the form
  if (!isLoggedIn) {
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

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="backdrop-blur-sm bg-black/40 p-8 rounded-lg text-center max-w-md">
            <h1 className="text-3xl font-bold text-blue-400 mb-4">Acceso Restringido</h1>
            <p className="text-white mb-6">Debes iniciar sesión con Steam para crear un ticket.</p>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Volver al Inicio</Button>
            </Link>
          </div>
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
                href="/tickets"
                className="flex items-center text-blue-400 hover:text-blue-300 transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span>Volver a Tickets</span>
              </Link>
              <h1 className="text-2xl font-bold text-blue-400">SkinsExpress</h1>
            </div>
            {currentUser && (
              <div className="text-sm text-gray-300">
                Creando ticket como: <span className="font-medium text-blue-400">{currentUser.personaname}</span>
              </div>
            )}
          </div>
        </header>

        {/* New Ticket Form */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto backdrop-blur-sm bg-black/40 p-8 rounded-lg">
              <h1 className="text-3xl font-bold text-blue-400 mb-6">Crear Nuevo Ticket</h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                    Título
                  </label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Título del ticket"
                    required
                    className="bg-gray-800/50 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-1">
                    Tipo de Ticket
                  </label>
                  <Select defaultValue={ticketType} onValueChange={setTicketType} name="type">
                    <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                      <SelectValue placeholder="Selecciona el tipo de ticket" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="purchase">Compra de Skins</SelectItem>
                      <SelectItem value="sale">Venta de Skins</SelectItem>
                      <SelectItem value="trade">Intercambio de Skins</SelectItem>
                      <SelectItem value="support">Soporte Técnico</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {ticketType === "purchase" && (
                  <div>
                    <label htmlFor="skin" className="block text-sm font-medium text-gray-300 mb-1">
                      Skin que deseas comprar
                    </label>
                    <Input
                      id="skin"
                      name="skin"
                      placeholder="Ej: AWP Dragon Lore (Factory New)"
                      className="bg-gray-800/50 border-gray-700 text-white"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                    Mensaje
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Describe tu consulta en detalle"
                    rows={5}
                    required
                    className="bg-gray-800/50 border-gray-700 text-white"
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <Link href="/tickets">
                    <Button type="button" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                      Cancelar
                    </Button>
                  </Link>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                        Creando...
                      </>
                    ) : (
                      "Crear Ticket"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
