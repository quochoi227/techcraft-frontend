import React, { useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { Header } from "@/components/common/Header"
import { Footer } from "@/components/common/Footer"
import { FloatingAiButton } from "@/components/common/FloatingAiButton"
import { Toaster } from "sonner"
import { useAuthStore } from "@/stores/authStore"
import { useCartStore } from "@/stores/cartStore"

export const MainLayout: React.FC = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const fetchCart = useCartStore((s) => s.fetchCart)
  const location = useLocation()

  const isChatPage =
    location.pathname.startsWith("/ai-consultant") ||
    location.pathname.startsWith("/chat")

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    }
  }, [isAuthenticated, fetchCart])

  return (
    <div
      className={
        isChatPage
          ? "h-screen flex flex-col bg-slate-50/60 font-sans antialiased text-slate-800 overflow-hidden"
          : "min-h-screen flex flex-col bg-slate-50/60 font-sans antialiased text-slate-800"
      }
    >
      <Header />
      <main
        className={
          isChatPage
            ? "flex-1 flex flex-col min-h-0 overflow-hidden"
            : "flex-1 flex flex-col"
        }
      >
        <Outlet />
      </main>
      {!isChatPage && <Footer />}
      <FloatingAiButton />
      <Toaster richColors position="top-right" closeButton />
    </div>
  )
}
