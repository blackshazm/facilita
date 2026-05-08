import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Monitoramento de Payouts | FACILITA Admin',
  description: 'Gestão operacional de liquidações financeiras.',
};

export default function PayoutsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
