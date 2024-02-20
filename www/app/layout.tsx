import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@/lib/theme";
import Typography from "@mui/material/Typography";

export const metadata = {
  metadataBase: new URL("https://footballpace-next.vercel.app/"),
  title: "Football Pace",
  description: "Tracking the pace of football clubs towards the championship",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Typography variant="h1" gutterBottom>
              Football Pace
            </Typography>
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
