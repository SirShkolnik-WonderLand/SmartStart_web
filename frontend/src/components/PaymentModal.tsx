/**
 * Payment Modal Component
 * Handles BUZ token purchases and subscription payments
 */

import React, { useState, useEffect } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'buz-purchase' | 'subscription';
  amount?: number;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
}

interface PaymentMethod {
  id: string;
  type: string;
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  type,
  amount = 0,
  onSuccess,
  onError
}) => {
  const [step, setStep] = useState<'method' | 'details' | 'processing' | 'success' | 'error'>('method');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [buzAmount, setBuzAmount] = useState<number>(amount);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    exp_month: '',
    exp_year: '',
    cvc: '',
    name: ''
  });
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US'
    }
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load payment methods on mount
  useEffect(() => {
    if (isOpen) {
      loadPaymentMethods();
    }
  }, [isOpen]);

  const loadPaymentMethods = async () => {
    try {
      const response = await fetch('/api/stripe/customers/user-123/payment-methods', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data.paymentMethods || []);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const handleBuzAmountChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    setBuzAmount(numValue);
  };

  const calculateTotal = () => {
    const buzPrice = 0.01; // $0.01 per BUZ token
    const subtotal = buzAmount * buzPrice;
    const tax = subtotal * 0.13; // 13% tax
    return subtotal + tax;
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setStep('details');
  };

  const handleCardDetailsChange = (field: string, value: string) => {
    setCardDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBillingDetailsChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setBillingDetails(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setBillingDetails(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (type === 'buz-purchase') {
        await handleBuzPurchase();
      } else {
        await handleSubscription();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Payment failed');
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuzPurchase = async () => {
    if (selectedMethod) {
      // Use existing payment method
      const response = await fetch('/api/stripe/buz/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: buzAmount,
          paymentMethodId: selectedMethod
        })
      });

      if (response.ok) {
        const result = await response.json();
        setStep('success');
        onSuccess?.(result);
      } else {
        throw new Error('Payment failed');
      }
    } else {
      // Create new payment method first
      const paymentMethodResponse = await fetch('/api/stripe/customers/user-123/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          card: {
            number: cardDetails.number,
            exp_month: parseInt(cardDetails.exp_month),
            exp_year: parseInt(cardDetails.exp_year),
            cvc: cardDetails.cvc
          },
          billing_details: billingDetails
        })
      });

      if (paymentMethodResponse.ok) {
        const paymentMethodData = await paymentMethodResponse.json();
        
        // Now make the purchase
        const purchaseResponse = await fetch('/api/stripe/buz/purchase', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            amount: buzAmount,
            paymentMethodId: paymentMethodData.paymentMethod.id
          })
        });

        if (purchaseResponse.ok) {
          const result = await purchaseResponse.json();
          setStep('success');
          onSuccess?.(result);
        } else {
          throw new Error('Payment failed');
        }
      } else {
        throw new Error('Failed to create payment method');
      }
    }
  };

  const handleSubscription = async () => {
    // Subscription logic would go here
    console.log('Subscription payment not implemented yet');
  };

  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value: string) => {
    return value.replace(/\D/g, '').replace(/(.{2})/, '$1/');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {type === 'buz-purchase' ? 'Purchase BUZ Tokens' : 'Subscribe to Plan'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        {step === 'method' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Payment Method
              </label>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handlePaymentMethodSelect(method.id)}
                    className="w-full p-3 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {method.card.brand.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {method.card.brand.toUpperCase()} •••• {method.card.last4}
                        </p>
                        <p className="text-sm text-gray-500">
                          Expires {method.card.exp_month}/{method.card.exp_year}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => setStep('details')}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-sm font-medium">+</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Add New Card</p>
                      <p className="text-sm text-gray-500">Use a different payment method</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'details' && (
          <div className="space-y-4">
            {type === 'buz-purchase' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  BUZ Token Amount
                </label>
                <input
                  type="number"
                  value={buzAmount}
                  onChange={(e) => handleBuzAmountChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                />
                <p className="text-sm text-gray-500 mt-1">
                  ${buzAmount * 0.01} + ${(buzAmount * 0.01 * 0.13).toFixed(2)} tax = ${calculateTotal().toFixed(2)}
                </p>
              </div>
            )}

            {!selectedMethod && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardDetails.number}
                    onChange={(e) => handleCardDetailsChange('number', formatCardNumber(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry
                    </label>
                    <input
                      type="text"
                      value={cardDetails.exp_month}
                      onChange={(e) => handleCardDetailsChange('exp_month', formatExpiry(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVC
                    </label>
                    <input
                      type="text"
                      value={cardDetails.cvc}
                      onChange={(e) => handleCardDetailsChange('cvc', e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardDetails.name}
                    onChange={(e) => handleCardDetailsChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setStep('method')}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || (type === 'buz-purchase' && buzAmount <= 0)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Processing payment...</p>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h3>
            <p className="text-gray-600 mb-4">
              {type === 'buz-purchase' 
                ? `${buzAmount} BUZ tokens have been added to your account.`
                : 'Your subscription has been activated.'
              }
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Failed</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setStep('method')}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
