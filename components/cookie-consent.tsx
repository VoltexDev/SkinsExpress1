"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem("cookieConsent")
    if (!hasConsented) {
      setShowConsent(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true")
    setShowConsent(false)
  }

  const handleDeny = () => {
    localStorage.setItem("cookieConsent", "false")
    setShowConsent(false)
  }

  if (!showConsent) return null

  return (
    <div className="fixed bottom-4 right-4 max-w-md backdrop-blur-sm bg-black/70 p-6 rounded-lg shadow-lg z-50">
      <p className="text-sm mb-4">
        Este sitio web utiliza cookies esenciales para mantener su sesión activa. Sin estas cookies, no podrá utilizar
        nuestro sitio. Al hacer clic en Aceptar, consiente el uso de estas cookies. Por el contrario si lo deniega puede
        experimentar un incorrecto funcionamiento de la web
      </p>
      <a href="#" className="text-blue-400 text-sm hover:underline block mb-4">
        Política de Cookies
      </a>
      <div className="flex justify-end gap-2">
        <Button
          variant="destructive"
          onClick={handleDeny}
          className="bg-red-600 hover:bg-red-700 transition-all duration-200 hover:scale-105 shadow-lg"
        >
          Denegar
        </Button>
        <Button
          variant="default"
          onClick={handleAccept}
          className="bg-green-600 hover:bg-green-700 transition-all duration-200 hover:scale-105 shadow-lg"
        >
          Aceptar
        </Button>
      </div>
    </div>
  )
}
