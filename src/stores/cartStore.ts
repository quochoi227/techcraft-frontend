import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { CartItem } from "@/types/cart"
import type { Product } from "@/types/product"
import type { PcCase } from "@/types/pcCase"
import { cartService } from "@/services/api/cartService"
import { useAuthStore } from "./authStore"

interface CartState {
  items: CartItem[]
  isLoading: boolean
  isSyncing: boolean

  // Actions
  fetchCart: () => Promise<void>
  addProduct: (product: Product, quantity?: number) => Promise<boolean>
  addPcCase: (pcCase: PcCase, quantity?: number) => Promise<boolean>
  updateItemQuantity: (item: CartItem, quantity: number) => Promise<boolean>
  removeItem: (item: CartItem) => Promise<boolean>
  clearCart: () => Promise<void>

  // Aliases for compatibility
  addItem: (product: Product, quantity?: number) => Promise<boolean>

  // Calculations
  getTotalCount: () => number
  getTotalAmount: () => number
  getTotalPrice: () => number // alias
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      isSyncing: false,

      /**
       * Tải giỏ hàng từ máy chủ nếu người dùng đã đăng nhập
       */
      fetchCart: async () => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated
        if (!isAuthenticated) return

        try {
          set({ isLoading: true })
          const response = await cartService.getCart()
          const cartData = response?.data || (response as any)
          if (cartData && Array.isArray(cartData.items)) {
            set({ items: cartData.items })
          }
        } catch (error) {
          console.warn("Không thể tải giỏ hàng từ máy chủ Backend:", error)
        } finally {
          set({ isLoading: false })
        }
      },

      /**
       * Thêm linh kiện máy tính vào giỏ hàng (hỗ trợ cả Authenticated & Guest)
       */
      addProduct: async (product: Product, quantity = 1): Promise<boolean> => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated

        if (isAuthenticated) {
          try {
            set({ isSyncing: true })
            await cartService.addCartItem({
              productId: product.id,
              quantity,
            })
            // Tải lại giỏ hàng đồng bộ mới nhất từ backend
            await get().fetchCart()
            return true
          } catch (error) {
            console.error("Lỗi khi thêm linh kiện vào giỏ hàng qua API:", error)
            throw error
          } finally {
            set({ isSyncing: false })
          }
        }

        // Chế độ Guest (chưa đăng nhập): Lưu trữ giỏ hàng tại LocalStorage
        const currentItems = get().items
        const existingIdx = currentItems.findIndex(
          (i) => i.itemType === "PRODUCT" && (i.productId === product.id || i.product?.id === product.id)
        )

        const primaryImage =
          product.images?.find((img) => img.primary || img.isPrimary)?.imageUrl ||
          product.images?.[0]?.imageUrl ||
          ""

        if (existingIdx > -1) {
          const updated = [...currentItems]
          const existing = updated[existingIdx]
          const maxStock = product.stockQuantity ?? 999
          const newQty = Math.min(existing.quantity + quantity, maxStock)
          updated[existingIdx] = {
            ...existing,
            quantity: newQty,
            subtotal: existing.unitPrice * newQty,
          }
          set({ items: updated })
        } else {
          const newItem: CartItem = {
            id: `local-prod-${product.id}`,
            itemType: "PRODUCT",
            productId: product.id,
            productName: product.name,
            productPrice: product.price,
            productImage: primaryImage,
            category: product.category,
            product,
            unitPrice: product.price,
            stockQuantity: product.stockQuantity ?? 1,
            quantity: Math.min(quantity, product.stockQuantity ?? 1),
            subtotal: product.price * quantity,
          }
          set({ items: [newItem, ...currentItems] })
        }

        return true
      },

      /**
       * Thêm Cấu hình PC (PC Case) vào giỏ hàng
       */
      addPcCase: async (pcCase: PcCase, quantity = 1): Promise<boolean> => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated

        if (isAuthenticated) {
          try {
            set({ isSyncing: true })
            await cartService.addPcCaseToCart({
              pcCaseId: pcCase.id,
              quantity,
            })
            await get().fetchCart()
            return true
          } catch (error) {
            console.error("Lỗi khi thêm PC Case vào giỏ hàng qua API:", error)
            throw error
          } finally {
            set({ isSyncing: false })
          }
        }

        // Chế độ Guest: Lưu trữ PC Case tại LocalStorage
        const currentItems = get().items
        const existingIdx = currentItems.findIndex(
          (i) => i.itemType === "PC_CASE" && (i.pcCaseId === pcCase.id || i.pcCase?.id === pcCase.id)
        )

        // Tính tồn kho tối đa có thể lắp ráp từ các linh kiện
        let availableStock = 99
        if (pcCase.items && pcCase.items.length > 0) {
          const stocks = pcCase.items
            .map((item) => item.product?.stockQuantity)
            .filter((s): s is number => typeof s === "number")
          if (stocks.length > 0) {
            availableStock = Math.min(...stocks)
          }
        }

        if (existingIdx > -1) {
          const updated = [...currentItems]
          const existing = updated[existingIdx]
          const newQty = Math.min(existing.quantity + quantity, availableStock)
          updated[existingIdx] = {
            ...existing,
            quantity: newQty,
            subtotal: existing.unitPrice * newQty,
          }
          set({ items: updated })
        } else {
          const newItem: CartItem = {
            id: `local-pccase-${pcCase.id}`,
            itemType: "PC_CASE",
            pcCaseId: pcCase.id,
            pcCaseName: pcCase.name,
            useCase: pcCase.useCase,
            pcCase,
            unitPrice: pcCase.totalPrice,
            stockQuantity: availableStock,
            quantity: Math.min(quantity, availableStock),
            subtotal: pcCase.totalPrice * quantity,
          }
          set({ items: [newItem, ...currentItems] })
        }

        return true
      },

      /**
       * Cập nhật số lượng của mục trong giỏ (Linh kiện hoặc PC Case)
       */
      updateItemQuantity: async (item: CartItem, quantity: number): Promise<boolean> => {
        if (quantity <= 0) {
          return get().removeItem(item)
        }

        const isAuthenticated = useAuthStore.getState().isAuthenticated

        if (isAuthenticated) {
          try {
            set({ isSyncing: true })
            if (item.itemType === "PC_CASE") {
              await cartService.updateCartPcCaseQuantity(item.id, { quantity })
            } else {
              await cartService.updateCartItemQuantity(item.id, { quantity })
            }
            await get().fetchCart()
            return true
          } catch (error) {
            console.error("Lỗi khi cập nhật số lượng qua API:", error)
            throw error
          } finally {
            set({ isSyncing: false })
          }
        }

        // Chế độ Guest
        const currentItems = get().items
        const updated = currentItems.map((cartItem) => {
          if (cartItem.id === item.id) {
            const max = cartItem.stockQuantity ?? 999
            const safeQty = Math.min(quantity, max)
            return {
              ...cartItem,
              quantity: safeQty,
              subtotal: cartItem.unitPrice * safeQty,
            }
          }
          return cartItem
        })

        set({ items: updated })
        return true
      },

      /**
       * Xoá một mục khỏi giỏ hàng
       */
      removeItem: async (item: CartItem): Promise<boolean> => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated

        if (isAuthenticated) {
          try {
            set({ isSyncing: true })
            if (item.itemType === "PC_CASE") {
              await cartService.deleteCartPcCase(item.id)
            } else {
              await cartService.deleteCartItem(item.id)
            }
            await get().fetchCart()
            return true
          } catch (error) {
            console.error("Lỗi khi xoá mục khỏi giỏ hàng qua API:", error)
            throw error
          } finally {
            set({ isSyncing: false })
          }
        }

        // Chế độ Guest
        const currentItems = get().items
        set({ items: currentItems.filter((cartItem) => cartItem.id !== item.id) })
        return true
      },

      /**
       * Xoá sạch toàn bộ giỏ hàng
       */
      clearCart: async () => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated
        const items = get().items

        if (isAuthenticated) {
          try {
            set({ isSyncing: true })
            for (const item of items) {
              if (item.itemType === "PC_CASE") {
                await cartService.deleteCartPcCase(item.id).catch(() => {})
              } else {
                await cartService.deleteCartItem(item.id).catch(() => {})
              }
            }
            await get().fetchCart()
          } catch (err) {
            console.warn("Lỗi khi làm sạch giỏ hàng qua API:", err)
          } finally {
            set({ isSyncing: false })
          }
        }

        set({ items: [] })
      },

      /**
       * Tương thích ngược với các component cũ
       */
      addItem: async (product: Product, quantity = 1) => {
        return get().addProduct(product, quantity)
      },

      getTotalCount: () => {
        return get().items.reduce((total, item) => total + (item.quantity || 0), 0)
      },

      getTotalAmount: () => {
        return get().items.reduce(
          (total, item) => total + (item.subtotal || item.unitPrice * (item.quantity || 1)),
          0
        )
      },

      getTotalPrice: () => {
        return get().getTotalAmount()
      },
    }),
    {
      name: "techcraft_cart",
      storage: createJSONStorage(() => localStorage),
      // Chỉ lưu trữ items vào localStorage khi chạy chế độ offline / guest
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
)
