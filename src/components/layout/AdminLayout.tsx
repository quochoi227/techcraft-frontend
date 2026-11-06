import React from "react"
import { Outlet } from "react-router-dom"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { AdminFooter } from "@/components/admin/AdminFooter"
import { Toaster } from "sonner"

export const AdminLayout: React.FC = () => {
  return (
    <div className="h-screen flex bg-slate-50/50 text-slate-800 antialiased font-sans overflow-hidden">
      {/* Sidebar bên trái */}
      <AdminSidebar />

      {/* Main Container bên phải */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <AdminHeader />
        <div className="flex-1 overflow-y-auto flex flex-col">
          <main className="flex-1 p-8">
            <Outlet />
          </main>
          <AdminFooter />
        </div>
      </div>

      <Toaster richColors position="top-right" closeButton />
    </div>
  )
}
