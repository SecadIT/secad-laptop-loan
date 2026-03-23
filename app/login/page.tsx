'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { BrandingLogo } from '@/components/branding/logo';

export default function LoginPage() {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send OTP');
        return;
      }

      setStep('otp');
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Send OTP error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (otpValue?: string) => {
    const codeToVerify = otpValue || otp;
    if (codeToVerify.length !== 6) return;

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: codeToVerify }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid OTP');
        setOtp('');
        return;
      }

      // Trigger storage event to notify other tabs/components
      localStorage.setItem('session-changed', Date.now().toString());
      localStorage.removeItem('session-changed');

      // Redirect to home page on success
      router.push('/');
      router.refresh();
    } catch (err) {
      setError('Network error. Please try again.');
      setOtp('');
      console.error('Verify OTP error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-verify when OTP is complete
  const handleOtpChange = (value: string) => {
    setOtp(value);
    if (value.length === 6) {
      handleVerifyOtp(value);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <BrandingLogo />
          </div>
          <div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              {step === 'email'
                ? 'Sign in to SECAD Internal Forms'
                : 'Enter the code sent to your email'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">SECAD Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.name@secad.ie"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  pattern=".*@secad\.ie$"
                  title="Please use your @secad.ie email address"
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Login Code'}
              </Button>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                A verification code will be sent to your email
              </p>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-center block">Enter 6-Digit Code</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={handleOtpChange}
                      disabled={loading}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  {loading ? (
                    <span className="text-blue-600 dark:text-blue-400">Verifying...</span>
                  ) : otp === '' ? (
                    <>
                      Code sent to <strong>{email}</strong>
                    </>
                  ) : otp.length < 6 ? (
                    <>Enter all 6 digits</>
                  ) : null}
                </div>

                {error && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md text-center">
                    {error}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setStep('email');
                    setOtp('');
                    setError('');
                  }}
                  disabled={loading}
                >
                  Use Different Email
                </Button>

                <Button
                  variant="ghost"
                  className="w-full text-sm"
                  onClick={() => {
                    setError('');
                    handleSendOtp(new Event('submit') as any);
                  }}
                  disabled={loading}
                >
                  Resend Code
                </Button>
              </div>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Code expires in 5 minutes
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
