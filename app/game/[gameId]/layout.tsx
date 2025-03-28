import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Game | Ping Pong",
  description: "Game",
};

export default function GameLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section>
      {children}
    </section>
  );
}
