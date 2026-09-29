import React from 'react';
import './globals.css';

export const metadata = {
  title: 'O Que Não Gastei?',
  description: 'Controle de finanças',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  );
}

