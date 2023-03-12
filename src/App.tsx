import ChangeSettings from '~/components/change-settings/change-settings'
import Stats from '~/components/stats/stats'

import StartStopBot from './components/start-stop-bot/start-stop-bot'

export default function App() {
  return (
    <main className="mx-auto max-w-xl space-y-4 p-4">
      <Stats />

      <StartStopBot />

      <ChangeSettings />

      <a
        className="fixed bottom-2 right-2 rounded bg-base-100 px-1 pt-1 underline"
        target="_blank"
        href="https://github.com/modagavr"
        rel="noreferrer"
      >
        v1.0.0 With ❤️ by Egor Gavrilov @modagavr
      </a>
    </main>
  )
}
