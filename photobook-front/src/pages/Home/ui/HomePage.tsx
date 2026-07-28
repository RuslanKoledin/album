import { HomeConstructorSection } from './HomeConstructorSection'
import { HomeHero } from './HomeHero'
import { HomePathSection } from './HomePathSection'
import { HomeReferenceProductSection } from './HomeReferenceProductSection'

export function HomePage() {
  return (
    <main
      id="main-content"
      className="overflow-x-clip focus:outline-none"
      tabIndex={-1}
    >
      <HomeHero />
      <HomePathSection />
      <HomeConstructorSection />
      <HomeReferenceProductSection />
    </main>
  )
}
