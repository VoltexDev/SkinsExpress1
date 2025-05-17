"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Ticket } from "lucide-react"

export default function SteamLoginButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const authStatus = isAuthenticated()
    setIsLoggedIn(authStatus)

    // Get user data from localStorage if available
    if (authStatus && typeof window !== "undefined") {
      try {
        const storedUser = localStorage.getItem("steamUser")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setUserData(parsedUser)
        }
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }

    // Check for login success in URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const loginStatus = urlParams.get("login")
    const userDataParam = urlParams.get("userData")

    if (loginStatus === "success" && userDataParam) {
      try {
        // Parse and store user data in localStorage
        const parsedUserData = JSON.parse(userDataParam)
        localStorage.setItem("steamUser", JSON.stringify(parsedUserData))
        setIsLoggedIn(true)
        setUserData(parsedUserData)

        // Remove the query parameters from URL
        window.history.replaceState({}, document.title, window.location.pathname)
      } catch (error) {
        console.error("Error storing user data:", error)
      }
    }
  }, [])

  // Get the current origin for the return URL
  const getOrigin = () => {
    if (typeof window !== "undefined") {
      return window.location.origin
    }
    // Fallback for server-side rendering
    return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  }

  // Steam OpenID authentication URL
  const steamAuthUrl = "https://steamcommunity.com/openid/login"
  const realm = getOrigin()
  const returnTo = `${realm}/api/auth/steam/callback`

  // Construct the Steam login URL
  const loginUrl = `${steamAuthUrl}?openid.ns=http://specs.openid.net/auth/2.0&openid.mode=checkid_setup&openid.return_to=${encodeURIComponent(returnTo)}&openid.realm=${encodeURIComponent(realm)}&openid.identity=http://specs.openid.net/auth/2.0/identifier_select&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select`

  const handleLogout = () => {
    localStorage.removeItem("steamUser")
    setIsLoggedIn(false)
    setUserData(null)
    router.refresh()
  }

  const navigateToTickets = () => {
    router.push("/tickets")
  }

  if (isLoggedIn && userData) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-md transition-all duration-200">
          <Avatar className="h-6 w-6">
            <AvatarImage src={userData.avatarmedium || userData.avatar} alt={userData.personaname} />
            <AvatarFallback>{userData.personaname?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{userData.personaname}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={navigateToTickets} className="cursor-pointer">
            <Ticket className="mr-2 h-4 w-4" />
            <span>Mis Tickets</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <a
      href={loginUrl}
      className="flex items-center gap-2 bg-[#1b2838] hover:bg-[#2a475e] text-white px-4 py-2 rounded-md transition-all duration-200 hover:scale-105 shadow-lg"
    >
      <div className="relative w-6 h-6 flex-shrink-0">
        <Image src="/steam-logo.png" alt="Steam Logo" width={24} height={24} className="w-full h-full object-contain" />
      </div>
      <span className="font-medium">Iniciar sesión con Steam</span>
    </a>
  )
}
