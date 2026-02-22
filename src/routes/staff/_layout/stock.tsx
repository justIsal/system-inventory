import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/staff/_layout/stock')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/staff/_layout/stock"!</div>
}
