import { createBrowserRouter } from "react-router-dom"
import { MainLayout } from "@/components/layout/MainLayout"
import { RegisterPage } from "@/pages/auth/RegisterPage"
import { LoginPage } from "@/pages/auth/LoginPage"
import { HomePage } from "@/pages/home/HomePage"
import { NotFoundPage } from "@/pages/not-found/NotFoundPage"

export const router = createBrowserRouter([
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
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
])
