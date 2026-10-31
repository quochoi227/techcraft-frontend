import React, { useEffect } from "react"
import { Outlet } from "react-router-dom"
import { Header } from "@/components/common/Header"
import { Footer } from "@/components/common/Footer"
import { Toaster } from "sonner"
import { useAuthStore } from "@/stores/authStore"
import { useCartStore } from "@/stores/cartStore"

export const MainLayout: React.FC = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const fetchCart = useCartStore((s) => s.fetchCart)

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    }
  }, [isAuthenticated, fetchCart])

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 font-sans antialiased text-slate-800">
      <Header />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
      <Toaster richColors position="top-right" closeButton />
    </div>
  )
}
