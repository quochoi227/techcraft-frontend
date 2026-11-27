import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import type { PcCase } from "@/types/pcCase"
import { pcCaseService } from "@/services/api/pcCaseService"
import { MOCK_PC_CASES } from "@/pages/pc-cases/mockData"
import { PcCaseCard } from "@/pages/pc-cases/components/PcCaseCard"
import { PcCaseDetailModal } from "@/pages/pc-cases/components/PcCaseDetailModal"
import { PcCaseSkeleton } from "@/pages/pc-cases/components/PcCaseSkeleton"

export const FeaturedPcCasesSection: React.FC = () => {
  const [pcCases, setPcCases] = useState<PcCase[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPcCase, setSelectedPcCase] = useState<PcCase | null>(null)

  useEffect(() => {
    let active = true

    const loadPcCases = async () => {
      setLoading(true)
      try {
        const res = await pcCaseService.getPcCases({
          page: 0,
          size: 3,
          isActive: true,
          sortBy: "createdAt",
          sortDir: "desc",
        })
        const content = res.data?.content
        if (active) {
          if (Array.isArray(content) && content.length > 0) {
            setPcCases(content.slice(0, 3))
          } else {
            setPcCases(MOCK_PC_CASES.slice(0, 3))
          }
        }
      } catch {
        if (active) {
          setPcCases(MOCK_PC_CASES.slice(0, 3))
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadPcCases()
    return () => {
      active = false
    }
  }, [])

  return (
    <section className="py-12 sm:py-16 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Cấu hình PC lắp sẵn nổi bật
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Các bộ máy đã được kỹ thuật viên cân đối hiệu năng và kiểm tra tương thích toàn diện
            </p>
          </div>
          <Link
            to="/pc-cases"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 shrink-0"
          >
            Xem toàn bộ cấu hình PC
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <PcCaseSkeleton key={idx} viewMode="grid" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pcCases.map((pcCase) => (
              <PcCaseCard
                key={pcCase.id}
                pcCase={pcCase}
                viewMode="grid"
                onQuickView={setSelectedPcCase}
              />
            ))}
          </div>
        )}
      </div>

      <PcCaseDetailModal
        pcCase={selectedPcCase}
        isOpen={Boolean(selectedPcCase)}
        onClose={() => setSelectedPcCase(null)}
      />
    </section>
  )
}
