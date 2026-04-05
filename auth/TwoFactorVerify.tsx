import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './shared/ui/card';
import { Button } from './shared/ui/button';
import { Input } from './shared/ui/input';
import { Label } from './shared/ui/label';
import { Shield, AlertCircle } from 'lucide-react';

interface TwoFactorVerifyProps {
  username: string;
  password: string;
  onVerified: () => void;
  onCancel: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function TwoFactorVerify({ username, password, onVerified, onCancel }: TwoFactorVerifyProps) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          twoFactorToken: token,
          ipAddress: '0.0.0.0',
          userAgent: navigator.userAgent
        })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        onVerified();
      } else {
        setError('Invalid verification code');
      }
    } catch (err) {
      setError('Verification failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>Enter your 6-digit verification code</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="token">Verification Code</Label>
              <Input
                id="token"
                placeholder="000000"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                maxLength={6}
                autoFocus
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">Verify</Button>
              <Button type="button" onClick={onCancel} variant="outline">Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}