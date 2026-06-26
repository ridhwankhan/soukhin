import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { executeBkashPayment } from '../../lib/bkashService';
import { completeOrderPayment } from '../../lib/orderService';
import Button from '../../components/ui/Button';

export default function BkashCallbackPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') ?? '';
  const paymentID = searchParams.get('paymentID') ?? '';
  const status = searchParams.get('status') ?? '';

  const [state, setState] = useState<'loading' | 'success' | 'failed'>('loading');
  const [orderNumber, setOrderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const processPayment = async () => {
      if (!orderId || !paymentID) {
        setState('failed');
        setError('Missing payment information.');
        return;
      }

      if (status === 'cancel' || status === 'failure') {
        setState('failed');
        setError('Payment was cancelled or failed.');
        await completeOrderPayment(orderId, '', 'failed').catch(() => {});
        return;
      }

      try {
        const result = await executeBkashPayment(paymentID, orderId);
        setTransactionId(result.transactionId);
        setState('success');

        const pendingOrder = sessionStorage.getItem('soukhin_pending_bkash_order');
        if (pendingOrder) {
          const parsed = JSON.parse(pendingOrder);
          setOrderNumber(parsed.orderNumber ?? '');
          sessionStorage.removeItem('soukhin_pending_bkash_order');
        }
      } catch (err) {
        setState('failed');
        setError(err instanceof Error ? err.message : 'Payment verification failed.');
      }
    };

    processPayment();
  }, [orderId, paymentID, status]);

  return (
    <div className="min-h-screen bg-[#F8F6F3] flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
        {state === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-[#1B4332] animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-2">Processing Payment</h2>
            <p className="text-sm text-[#666666]">Please wait while we confirm your bKash payment...</p>
          </>
        )}

        {state === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-2">Payment Successful!</h2>
            {orderNumber && <p className="text-[#1B4332] font-medium mb-2">Order #{orderNumber}</p>}
            <p className="text-sm text-[#666666] mb-1">Transaction ID:</p>
            <p className="text-sm font-mono bg-[#F8F6F3] p-2 rounded mb-6">{transactionId}</p>
            <div className="flex flex-col gap-3">
              <Link to={`/track-order?order=${encodeURIComponent(orderNumber)}`}>
                <Button className="w-full">Track Order</Button>
              </Link>
              <Link to="/"><Button variant="outline" className="w-full">Continue Shopping</Button></Link>
            </div>
          </>
        )}

        {state === 'failed' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-[#2D2D2D] mb-2">Payment Failed</h2>
            <p className="text-sm text-[#666666] mb-6">{error}</p>
            <Link to="/checkout"><Button className="w-full">Try Again</Button></Link>
          </>
        )}
      </div>
    </div>
  );
}
