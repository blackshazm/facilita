'use client';

import React, { useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function PayoutControls() {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  const handleAction = async () => {
    if (confirmText !== 'CONFIRMAR') return;
    
    const endpoint = isPaused ? '/api/payments/bulk/resume' : '/api/payments/bulk/pause';
    await fetch(endpoint, { method: 'POST' });
    
    setIsPaused(!isPaused);
    setIsOpen(false);
    setConfirmText('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className={buttonVariants({ variant: isPaused ? "default" : "destructive" })}>
        {isPaused ? 'Resume Payouts' : 'Halt Payouts'}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isPaused ? 'Resume All Payouts' : 'Halt All Payouts'}</DialogTitle>
          <DialogDescription>
            {isPaused 
              ? 'This action will resume all pending payouts. To proceed, please type "CONFIRMAR" below.'
              : 'This action will pause all pending payouts immediately. To proceed, please type "CONFIRMAR" below.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Label htmlFor="confirmText" className="sr-only">Confirm Text</Label>
          <Input 
            id="confirmText" 
            value={confirmText} 
            onChange={(e) => setConfirmText(e.target.value)} 
            placeholder="CONFIRMAR"
            className="mt-2"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button 
            variant={isPaused ? "default" : "destructive"} 
            disabled={confirmText !== 'CONFIRMAR'}
            onClick={handleAction}
          >
            {isPaused ? 'Resume' : 'Halt'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
