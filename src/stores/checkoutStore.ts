import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { CheckoutItem } from "@/types/order"

interface CheckoutState {
  items: CheckoutItem[]
  
  // Actions
  setCheckoutItems: (items: CheckoutItem[]) => void
  addItem: (item: CheckoutItem) => void
  updateItemQuantity: (index: number, quantity: number) => void
  removeItem: (index: number) => void
  clearCheckout: () => void

  // Calculations
  getTotalAmount: () => number
  getTotalCount: () => number
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set, get) => ({
      items: [],

      setCheckoutItems: (items: CheckoutItem[]) => {
        set({ items })
      },

      addItem: (item: CheckoutItem) => {
        set((state) => ({ items: [...state.items, item] }))
      },

      updateItemQuantity: (index: number, quantity: number) => {
        set((state) => {
          if (index < 0 || index >= state.items.length) return state
          if (quantity <= 0) {
            return { items: state.items.filter((_, i) => i !== index) }
          }
          const updated = [...state.items]
          updated[index] = { ...updated[index], quantity }
          return { items: updated }
        })
      },

      removeItem: (index: number) => {
        set((state) => ({
          items: state.items.filter((_, i) => i !== index),
        }))
      },

      clearCheckout: () => {
        set({ items: [] })
      },

      getTotalAmount: () => {
        return get().items.reduce(
          (sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 1),
          0
        )
      },

      getTotalCount: () => {
        return get().items.reduce((sum, item) => sum + (item.quantity || 1), 0)
      },
    }),
    {
      name: "techcraft_checkout_items",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
