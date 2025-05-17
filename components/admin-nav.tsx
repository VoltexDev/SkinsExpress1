"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { isTrader } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { LayoutDashboard } from "lucide-react"

export default function AdminNav() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    setIsAdmin(isTrader())
  }, [])

  if (!isAdmin) return null

  return (
    <div className="fixed top-20 right-4 z-20">
      <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
        <Link href="/admin/dashboard">
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Panel de Administración
        </Link>
      </Button>
    </div>
  )
}
