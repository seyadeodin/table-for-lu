import { createFileRoute } from '@tanstack/react-router'
import {  useAuthActions} from '@convex-dev/auth/react'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const { signIn } = useAuthActions();

  return(
    <div>
    </div>
  )
}
