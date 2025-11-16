import { createFileRoute } from '@tanstack/react-router'
import {  useAuthActions} from '@convex-dev/auth/react'
import {
  Zap,
  Server,
  Route as RouteIcon,
  Shield,
  Waves,
  Sparkles,
} from 'lucide-react'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const { signIn } = useAuthActions();

  return(
    <button type="button" onClick={() => void signIn("github")}>Entrar com GitHub</button>
  )
}
