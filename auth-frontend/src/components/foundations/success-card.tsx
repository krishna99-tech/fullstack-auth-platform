import React from 'react';
import { Card } from '@/components/ui/card';
import { Illustration } from '@/components/shared-assets/illustrations';
import { Button } from '@/components/base/buttons/button';
import { Check } from 'lucide-react';

export interface SuccessCardProps {
  title?: string;
  description?: string;
  onContinue?: () => void;
  continueText?: string;
}

export function SuccessCard({ 
  title = "2FA Enabled Successfully!", 
  description = "Your account is now protected with two-factor authentication. You will be required to enter a code from your authenticator app whenever you log in.",
  onContinue,
  continueText = "Continue to Dashboard"
}: SuccessCardProps) {
  return (
    <Card className="max-w-md mx-auto p-8 flex flex-col items-center text-center space-y-6 bg-background/50 backdrop-blur-md border-border/50 shadow-xl">
      <div className="relative">
        {/* Glow effect behind the illustration */}
        <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-150" />
        <Illustration 
          type="shield-check" 
          size="xl" 
          variant="success" 
        />
      </div>
      
      <div className="space-y-3">
        <h3 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      <div className="w-full pt-4">
        <Button 
          color="primary" 
          size="lg" 
          className="w-full h-12 text-md shadow-lg shadow-primary/20"
          onClick={onContinue}
          iconLeading={<Check className="w-5 h-5 mr-1" />}
        >
          {continueText}
        </Button>
      </div>
    </Card>
  );
}
