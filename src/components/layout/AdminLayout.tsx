import React from "react"
import { Outlet } from "react-router-dom"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { AdminFooter } from "@/components/admin/AdminFooter"
import { Toaster } from "sonner"

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex bg-slate-50/50 text-slate-800 antialiased font-sans">
      {/* Sidebar bên trái */}
      <AdminSidebar />

      {/* Main Container bên phải */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
        <AdminFooter />
      </div>

      <Toaster richColors position="top-right" closeButton />
    </div>
  )
}
