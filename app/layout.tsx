import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';

export const metadata = {
  metadataBase: new URL('https://postgres-prisma.vercel.app'),
  title: 'Football Pace',
  description:
    'Tracking the pace of football clubs towards the championship',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </head>
      <body>
        <AppRouterCacheProvider>
          {children}
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
