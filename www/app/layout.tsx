import "@mantine/core/styles.css";
import "@mantine/charts/styles.css";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import Shell from "../components/shell/shell";
import theme from "@/lib/theme";

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
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <Shell>{children}</Shell>
        </MantineProvider>
      </body>
    </html>
  );
}
