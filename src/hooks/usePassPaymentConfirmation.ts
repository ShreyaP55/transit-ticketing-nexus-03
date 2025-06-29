
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { passesAPI } from '@/services/api';
import { toast } from 'sonner';

export const usePassPaymentConfirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const status = searchParams.get("status");
  const sessionId = searchParams.get("session_id");
  
  const confirmPayment = async (sessionId: string) => {
    try {
      setIsProcessing(true);
      const result = await passesAPI.confirmPassPayment(sessionId);
      if (result.success) {
        toast.success("Monthly pass purchased successfully!");
        queryClient.invalidateQueries({ queryKey: ["activePass"] });
        navigate("/pass");
      } else {
        toast.error("Failed to create pass after payment");
      }
    } catch (error) {
      toast.error("Failed to process payment confirmation");
    } finally {
      setIsProcessing(false);
    }
  };
  
  useEffect(() => {
    if (status === "success" && sessionId) {
      toast.success("Payment successful! Processing your pass...");
      confirmPayment(sessionId);
    } else if (status === "cancel") {
      toast.error("Payment was canceled.");
    }
  }, [status, sessionId]);
  
  return { isProcessing };
};
