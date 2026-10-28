import { createBrowserRouter, Navigate } from "react-router-dom"
import { MainLayout } from "@/components/layout/MainLayout"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { RegisterPage } from "@/pages/auth/RegisterPage"
import { LoginPage } from "@/pages/auth/LoginPage"
import { VerifyEmailPage } from "@/pages/auth/VerifyEmailPage"
import { HomePage } from "@/pages/home/HomePage"
import { NotFoundPage } from "@/pages/not-found/NotFoundPage"
import { ProductListPage } from "@/pages/admin/products/ProductListPage"
import { DashboardPage } from "@/pages/admin/dashboard/DashboardPage"
import { OrderListPage } from "@/pages/admin/orders/OrderListPage"
import { PcCaseListPage } from "@/pages/admin/pc-cases/PcCaseListPage"
import { RagAiPage } from "@/pages/admin/rag-ai/RagAiPage"
import { UserListPage } from "@/pages/admin/users/UserListPage"

export const router = createBrowserRouter([
  // Phân hệ Khách hàng (Client Portal)
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "verify-email",
        element: <VerifyEmailPage />,
      },
    ],
  },

  // Phân hệ Quản trị (Admin Portal)
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/admin/products" replace />,
      },
      {
        path: "products",
        element: <ProductListPage />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "orders",
        element: <OrderListPage />,
      },
      {
        path: "pc-cases",
        element: <PcCaseListPage />,
      },
      {
        path: "rag-ai",
        element: <RagAiPage />,
      },
      {
        path: "users",
        element: <UserListPage />,
      },
    ],
  },

  // 404 Route
  {
    path: "*",
    element: <NotFoundPage />,
  },
])
