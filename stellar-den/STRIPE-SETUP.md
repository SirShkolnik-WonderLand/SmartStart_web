# Stripe Checkout Setup

## ✅ Stripe Integration Added

All **$98.80 USD subscription buttons** now link to Stripe checkout. The buttons are configured via environment variable.

## 🔧 Configuration

### Environment Variable
Add this to your `.env` or Render environment variables:

```bash
VITE_STRIPE_CHECKOUT_URL=https://buy.stripe.com/your-actual-checkout-link
```

### Where Stripe Buttons Are Located

1. **SmartStart Page** (`/smartstart`):
   - Hero section: "Join SmartStart" button
   - Pricing section: "Join Now" button ($98.80 plan)
   - CTA section: "Join SmartStart Today" button

2. **SmartStart30Days Component**:
   - "Join SmartStart ($98.80/mo)" button

## 🔗 How to Get Your Stripe Checkout URL

1. Go to Stripe Dashboard → Products
2. Create or select your $98.80/month subscription product
3. Create a Payment Link or Checkout Session
4. Copy the checkout URL (format: `https://buy.stripe.com/...`)
5. Add it to your environment variables as `VITE_STRIPE_CHECKOUT_URL`

## 🚀 Current Status

- ✅ Buttons are connected to Stripe checkout
- ✅ Environment variable configuration added
- ⚠️ **You need to add your actual Stripe checkout URL** to `.env` or Render environment variables

## 📝 Notes

- If the environment variable is not set, buttons will show a placeholder URL
- All buttons open Stripe checkout in a new tab
- The $98.80 subscription is configured for monthly billing


