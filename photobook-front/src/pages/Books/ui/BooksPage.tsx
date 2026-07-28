import { BooksHero } from './BooksHero'
import { ProductionStatusSection } from './ProductionStatusSection'
import { ReferenceFormatSection } from './ReferenceFormatSection'

export function BooksPage() {
  return (
    <main
      id="main-content"
      className="overflow-x-clip focus:outline-none"
      tabIndex={-1}
    >
      <BooksHero />
      <ReferenceFormatSection />
      <ProductionStatusSection />
    </main>
  )
}
