'use client';

import React from 'react';
import { SignInButton, UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export function AuthButtons() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_FRONTEND_API || '';

  // If Clerk is not configured (placeholder), show a fallback button
  if (!publishableKey || publishableKey.includes('your_clerk')) {
    return (
      <div>
        <Button variant="primary" onClick={() => window.alert('Authentication not configured. Please set Clerk keys in .env.local')}>
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="primary">Sign In</Button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
}
