'use client';

import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';

interface Props {
  children: React.ReactNode;
}

export function AuthProvider({ children }: Props) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_FRONTEND_API || '';
  // If no valid publishable key is present (for local builds or placeholder),
  // skip wrapping with ClerkProvider to avoid throwing during prerender.
  if (!publishableKey || publishableKey.includes('your_clerk')) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      {children}
    </ClerkProvider>
  );
}
