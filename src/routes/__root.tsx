import type { ReactNode } from 'react'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import '../global.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      links: [
        { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      ],
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      { title: 'PLP Risk Console' },
      {
        name: 'description',
        content:
          'DeepBook Predict LP Risk Console — vault risk dashboard for PLP liquidity providers',
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="min-h-screen bg-background">{children}</div>
        <Scripts />
      </body>
    </html>
  )
}
