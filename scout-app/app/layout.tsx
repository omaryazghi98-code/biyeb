import "./globals.css";

export const metadata = {
  title: "Scoutboard",
  description: "Personal football scouting watchlist and match calendar",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
