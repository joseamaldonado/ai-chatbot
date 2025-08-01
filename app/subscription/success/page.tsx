import { Suspense } from 'react';
import { auth } from '@/app/(auth)/auth';
import { redirect } from 'next/navigation';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

function SuccessContent() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="size-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Welcome to Premium!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Your subscription has been successfully activated. You now have access to:
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-center">
              <CheckCircle className="size-4 text-green-500 mr-2" />
              <span>100 messages per day</span>
            </div>
            <div className="flex items-center justify-center">
              <CheckCircle className="size-4 text-green-500 mr-2" />
              <span>Advanced AI models</span>
            </div>
            <div className="flex items-center justify-center">
              <CheckCircle className="size-4 text-green-500 mr-2" />
              <span>Priority support</span>
            </div>
            <div className="flex items-center justify-center">
              <CheckCircle className="size-4 text-green-500 mr-2" />
              <span>Chat history</span>
            </div>
          </div>
          
          <div className="pt-4">
            <Link href="/">
              <Button className="w-full">
                <ArrowLeft className="size-4 mr-2" />
                Start Chatting
              </Button>
            </Link>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Need help? Contact our support team anytime.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function SubscriptionSuccessPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}