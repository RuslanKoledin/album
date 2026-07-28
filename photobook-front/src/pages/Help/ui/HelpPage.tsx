import { HelpFaqSection } from './HelpFaqSection'
import { HelpHero } from './HelpHero'
import { HelpPhotoGuide } from './HelpPhotoGuide'
import { HelpStartSection } from './HelpStartSection'
import { HelpStatusSection } from './HelpStatusSection'

export function HelpPage() {
  return (
    <main
      id="main-content"
      className="overflow-x-clip focus:outline-none"
      tabIndex={-1}
    >
      <HelpHero />
      <HelpStartSection />
      <HelpPhotoGuide />
      <HelpFaqSection />
      <HelpStatusSection />
    </main>
  )
}
