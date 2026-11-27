import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import type { Product } from "@/types/product"
import { productService } from "@/services/api/productService"
import { MOCK_PRODUCTS_PAGE } from "@/pages/admin/products/mockData"
import { ProductCard } from "@/pages/products/components/ProductCard"
import { ProductQuickViewModal } from "@/pages/products/components/ProductQuickViewModal"
import { ProductSkeleton } from "@/pages/products/components/ProductSkeleton"

export const FeaturedProductsSection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)

  useEffect(() => {
    let active = true

    const loadProducts = async () => {
      setLoading(true)
      try {
        const res = await productService.getProducts({
          page: 0,
          size: 4,
          isActive: true,
          sortBy: "createdAt",
          sortDir: "desc",
        })
        const content = res.data?.content
        if (active) {
          if (Array.isArray(content) && content.length > 0) {
            setProducts(content.slice(0, 4))
          } else {
            setProducts(
              MOCK_PRODUCTS_PAGE.content
                .filter((p) => (p.stockQuantity ?? 0) > 0)
                .slice(0, 4)
            )
          }
        }
      } catch {
        if (active) {
          setProducts(
            MOCK_PRODUCTS_PAGE.content
              .filter((p) => (p.stockQuantity ?? 0) > 0)
              .slice(0, 4)
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadProducts()
    return () => {
      active = false
    }
  }, [])

  return (
    <section className="py-12 sm:py-16 bg-slate-50/70 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Linh kiện mới cập nhật
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Sản phẩm chính hãng sẵn kho, hiển thị rõ thông số kỹ thuật và tồn kho thực tế
            </p>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 shrink-0"
          >
            Khám phá kho linh kiện
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, idx) => (
              <ProductSkeleton key={idx} viewMode="grid" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                viewMode="grid"
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        )}
      </div>

      <ProductQuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />
    </section>
  )
}
