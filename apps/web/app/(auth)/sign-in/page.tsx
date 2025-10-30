'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useAuth } from '../../../lib/auth';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with:', { email, password });
    setIsLoading(true);
    setError('');

    try {
      console.log('Calling signIn...');
      await signIn(email, password);
      console.log('SignIn successful, redirecting to /create');

      // Try both router.push and window.location
      setTimeout(() => {
        console.log('Attempting redirect...');
        router.push('/create');
        // Fallback
        setTimeout(() => {
          window.location.href = '/create';
        }, 1000);
      }, 100);
    } catch (error) {
      console.error('Sign in error:', error);
      setError(error instanceof Error ? error.message : 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = () => {
    setEmail('admin@dockeryai.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to BuildRunner
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your project management workspace
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>

          <div className="text-center space-y-3">
            <div className="border-t border-gray-200 pt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleAdminLogin}
              >
                Fill Admin Credentials
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Admin: admin@dockeryai.com / admin123
            </p>
            <p className="text-xs text-gray-500">
              Or use any other email/password for demo mode
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
