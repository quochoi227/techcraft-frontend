import React from "react"
import { Outlet } from "react-router-dom"
import { Header } from "@/components/common/Header"
import { Footer } from "@/components/common/Footer"
import { Toaster } from "sonner"

export const MainLayout: React.FC = () => {
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
