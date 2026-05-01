import { useCallback, useRef } from 'react';

export default function useRazorpay() {
  const scriptLoaded = useRef(false);

  const loadScript = useCallback(() => {
    return new Promise((resolve) => {
      if (scriptLoaded.current || window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        scriptLoaded.current = true;
        resolve(true);
      };
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const makePayment = useCallback(async ({ orderId, amount, currency, keyId, user, onSuccess, onFailure }) => {
    const loaded = await loadScript();
    if (!loaded) {
      onFailure?.('Failed to load Razorpay SDK.');
      return;
    }

    const options = {
      key: keyId,
      amount,
      currency: currency || 'INR',
      name: 'ShopElite',
      description: 'Order Payment',
      order_id: orderId,
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
      },
      theme: {
        color: '#6366f1',
      },
      handler: (response) => {
        onSuccess?.(response);
      },
      modal: {
        ondismiss: () => {
          onFailure?.('Payment cancelled by user.');
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      onFailure?.(response.error?.description || 'Payment failed.');
    });
    rzp.open();
  }, [loadScript]);

  return { makePayment };
}
