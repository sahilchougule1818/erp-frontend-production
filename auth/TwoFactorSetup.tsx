import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './shared/ui/card';
import { Button } from './shared/ui/button';
import { Input } from './shared/ui/input';
import { Label } from './shared/ui/label';
import { Shield, AlertCircle, CheckCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function TwoFactorSetup({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<'enable' | 'verify'>('enable');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleEnable = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/2fa/enable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setStep('verify');
        setError('');
      } else {
        setError('Failed to enable 2FA');
      }
    } catch (err) {
      setError('Failed to enable 2FA');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/2fa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ token })
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => onClose(), 2000);
      } else {
        setError('Invalid token. Please try again.');
      }
    } catch (err) {
      setError('Verification failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            {step === 'enable' ? 'Secure your account with 2FA' : 'Scan QR code and verify'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="text-green-600 font-medium">2FA enabled successfully!</p>
            </div>
          ) : step === 'enable' ? (
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md flex items-center gap-2 text-base">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
              <p className="text-base text-gray-600">
                Enable two-factor authentication to add an extra layer of security to your account.
              </p>
              <div className="flex gap-2">
                <Button onClick={handleEnable} className="flex-1">Enable 2FA</Button>
                <Button onClick={onClose} variant="outline">Cancel</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md flex items-center gap-2 text-base">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
              <div className="text-center">
                <p className="text-base text-gray-600 mb-3">Scan this QR code with your authenticator app:</p>
                <img src={qrCode} alt="QR Code" className="mx-auto border rounded-lg p-2" />
                <p className="text-base text-gray-500 mt-2">Or enter this secret manually:</p>
                <code className="text-base bg-gray-100 px-2 py-1 rounded block break-all">{secret}</code>
              </div>
              <div className="space-y-2">
                <Label htmlFor="token">Verification Code</Label>
                <Input
                  id="token"
                  placeholder="Enter 6-digit code"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Verify</Button>
                <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}