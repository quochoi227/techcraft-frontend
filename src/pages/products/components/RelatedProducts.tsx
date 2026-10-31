import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Sparkles, ArrowRight } from "lucide-react"
import type { Product, ProductCategory } from "@/types/product"
import { productService } from "@/services/api/productService"
import { MOCK_PRODUCTS } from "@/pages/admin/products/mockData"
import { CATEGORIES_META, formatPrice } from "../constants"
import { Button } from "@/components/ui/button"

interface RelatedProductsProps {
  category: ProductCategory
  currentProductId: string
}

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80"

export const RelatedProducts: React.FC<RelatedProductsProps> = ({
  category,
  currentProductId,
}) => {
  const [related, setRelated] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true
    const fetchRelated = async () => {
      setIsLoading(true)
      try {
        const response = await productService.getProducts({
          category,
          size: 6,
          isActive: true,
        })
        const pageData = response?.data || (response as any)
        if (pageData && Array.isArray(pageData.content)) {
          const filtered = pageData.content.filter(
            (p: Product) => p.id !== currentProductId && p.active !== false
          )
          if (isMounted) setRelated(filtered.slice(0, 4))
          return
        }
        throw new Error("Invalid response format")
      } catch {
        // Fallback to MOCK_PRODUCTS
        const filtered = MOCK_PRODUCTS.filter(
          (p) => p.category === category && p.id !== currentProductId && p.active !== false
        )
        if (isMounted) setRelated(filtered.slice(0, 4))
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchRelated()
    return () => {
      isMounted = false
    }
  }, [category, currentProductId])

  if (!isLoading && related.length === 0) return null

  const categoryMeta = CATEGORIES_META[category]

  return (
    <div className="space-y-4 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
            Sản phẩm cùng danh mục {categoryMeta?.shortLabel || category}
          </h3>
        </div>
        <Button variant="ghost" size="sm" asChild className="text-xs font-bold text-blue-600 hover:text-blue-700">
          <Link to={`/products?category=${category}`}>
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading
          ? [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3 animate-pulse"
              >
                <div className="aspect-square w-full rounded-xl bg-slate-200" />
                <div className="h-4 w-3/4 rounded bg-slate-200" />
                <div className="h-5 w-1/2 rounded bg-slate-200" />
              </div>
            ))
          : related.map((p) => {
              const img =
                p.images?.find((i) => i.primary || i.isPrimary)?.imageUrl ||
                p.images?.[0]?.imageUrl ||
                PLACEHOLDER_IMAGE

              return (
                <Link
                  key={p.id}
                  to={`/products/${p.id}`}
                  className="group bg-white rounded-2xl border border-slate-200/90 p-4 flex flex-col justify-between hover:shadow-lg hover:border-blue-400 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="space-y-3">
                    <div className="aspect-square w-full rounded-xl bg-slate-50 border border-slate-100 p-2 overflow-hidden flex items-center justify-center">
                      <img
                        src={img}
                        alt={p.name}
                        className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-300"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE
                        }}
                      />
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                      {p.name}
                    </h4>
                  </div>

                  <div className="pt-3 border-t border-slate-100 mt-2">
                    <div className="text-[10px] text-slate-400 font-medium">Giá ưu đãi</div>
                    <div className="text-sm sm:text-base font-extrabold text-blue-600">
                      {formatPrice(p.price)}
                    </div>
                  </div>
                </Link>
              )
            })}
      </div>
    </div>
  )
}
