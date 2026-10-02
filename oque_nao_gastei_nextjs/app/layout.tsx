import React from 'react';
import './globals.css';
import { Toaster } from 'sonner';

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
        <Toaster theme='dark' position='top-right' richColors closeButton/>
      </body>
    </html>
  );
}

