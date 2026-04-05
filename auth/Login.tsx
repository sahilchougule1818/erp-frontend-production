import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './shared/ui/card';
import { Button } from './shared/ui/button';
import { Input } from './shared/ui/input';
import { Label } from './shared/ui/label';
import { FlaskConical, LogIn, AlertCircle, UserPlus } from 'lucide-react';
import { useAuth } from './AuthContext';
import { TwoFactorVerify } from './TwoFactorVerify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const result = await login(email, password);
      if (result.requires2FA) {
        setCredentials({ username: email, password });
        setShow2FA(true);
      } else if (!result.success) {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/register-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: email,
          password,
          email,
          firstName,
          lastName
        })
      });
      
      if (res.ok) {
        setIsRegister(false);
        setError('');
        alert('Admin account created successfully! Please login.');
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
      } else {
        const data = await res.json();
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed');
    }
  };

  return (
    <>
      {show2FA && (
        <TwoFactorVerify
          username={credentials.username}
          password={credentials.password}
          onVerified={() => window.location.reload()}
          onCancel={() => setShow2FA(false)}
        />
      )}
      <div className="min-h-screen flex">
        {/* Left side - Image */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <img
            src="/login-bg.png"
            alt="Seema Biotech"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Right side - Login Card */}
        <div className="w-full lg:w-1/2 bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 rounded-full mb-3">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Seema Biotech</h1>
              <p className="text-sm text-gray-600">ERP System</p>
            </div>

            <Card className="shadow-md border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-semibold text-center">
                  {isRegister ? 'Create Admin Account' : 'Sign In'}
                </CardTitle>
                <CardDescription className="text-center text-xs text-gray-500">
                  {isRegister ? 'Setup the first administrator account' : 'Enter your credentials to access your account'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <form onSubmit={isRegister ? handleRegisterAdmin : handleLogin} className="space-y-3">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md flex items-center gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {isRegister && (
                    <>
                      <div className="space-y-1.5">
                        <Label htmlFor="firstName" className="text-sm">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          className="h-9 text-sm"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm">
                      {isRegister ? 'Username/Email' : 'Username'}
                    </Label>
                    <Input
                      id="email"
                      type="text"
                      placeholder={isRegister ? 'admin' : 'admin'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-sm">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-9 text-sm"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 h-9 text-sm mt-4">
                    {isRegister ? (
                      <><UserPlus className="w-4 h-4 mr-2" />Create Admin Account</>
                    ) : (
                      <><LogIn className="w-4 h-4 mr-2" />Sign In</>
                    )}
                  </Button>
                </form>

                <div className="text-center mt-4">
                  <button
                    onClick={() => { setIsRegister(!isRegister); setError(''); }}
                    className="text-xs text-green-600 hover:text-green-700 underline"
                  >
                    {isRegister ? 'Already have an account? Sign in' : 'Create Admin Account'}
                  </button>
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-xs text-gray-400 mt-4">
              © 2024 Seema Biotech. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
