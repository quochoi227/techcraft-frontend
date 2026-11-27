import React from "react"
import { HeroWorkbench } from "./components/HeroWorkbench"
import { CategoryMatrixSection } from "./components/CategoryMatrixSection"
import { FeaturedPcCasesSection } from "./components/FeaturedPcCasesSection"
import { FeaturedProductsSection } from "./components/FeaturedProductsSection"
import { CompatibilityAndRagSection } from "./components/CompatibilityAndRagSection"

export const HomePage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col">
      <HeroWorkbench />
      <CategoryMatrixSection />
      <FeaturedPcCasesSection />
      <FeaturedProductsSection />
      <CompatibilityAndRagSection />
    </div>
  )
}
