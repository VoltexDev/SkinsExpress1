import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import TicketList from "@/components/ticket-list"
import { ArrowLeft } from "lucide-react"

export default function TicketsPage() {
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
                <span>Volver</span>
              </Link>
              <h1 className="text-2xl font-bold text-blue-400">SkinsExpress</h1>
            </div>
          </div>
        </header>

        {/* Tickets Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-blue-400">Mis Tickets</h1>
                <Link href="/tickets/new">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium shadow-lg transition-all duration-200 hover:scale-105">
                    Nuevo Ticket
                  </Button>
                </Link>
              </div>

              <TicketList />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
