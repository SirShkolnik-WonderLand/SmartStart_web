# 🚨 Billing Issues Diagnosis

**Date:** November 3, 2025  
**Issues Reported:**
1. Subscription link not working
2. Billing message about a problem
3. QuickBooks sync not working

---

## 🔍 **ISSUE 1: SUBSCRIPTION LINK NOT WORKING**

### **Current Configuration:**
- **Plan Code:** Plan010
- **Plan Name:** SmartStart Enthusiastic
- **Price:** $99.8 CAD/month (in Zoho) vs $98.80 CAD/month (on website)
- **Link Format:** `https://billing.zohosecure.ca/subscribe/{account-id}/Plan010`

### **Potential Issues:**

#### **1. Price Mismatch** ⚠️
- **Zoho Plan:** $99.8 CAD
- **Website Shows:** $98.80 CAD
- **Problem:** Price discrepancy may cause checkout issues

#### **2. Link Configuration** ⚠️
The subscription link should be:
```
https://billing.zohosecure.ca/subscribe/80acd4f75fc11ade8382abc9ca5c205ef35c7564ff13c9670befed3afeaa53b9/Plan010
```

**Check:**
- Is the account ID correct?
- Is Plan010 active and published?
- Is the pricing widget enabled for the plan?

#### **3. Plan Status** ⚠️
From your Zoho screen:
- Plan010 is configured
- But need to verify:
  - ✅ Plan is "Active" (not draft)
  - ✅ Plan is published to Customer Portal
  - ✅ Pricing widget is enabled (if using widget)

---

## 🔍 **ISSUE 2: QUICKBOOKS SYNC NOT WORKING**

### **Current Setup:**
- ✅ Stripe → Zoho Billing: Working (payments coming through)
- ❌ Zoho Billing → QuickBooks: Not syncing

### **Why QuickBooks Sync Might Fail:**

#### **1. QuickBooks Integration Not Connected**
**Check in Zoho:**
1. Go to: Zoho Billing → Settings → Integrations
2. Look for: QuickBooks integration
3. Verify: Connection status is "Connected"

#### **2. Sync Settings Not Configured**
**What to check:**
- Are invoices set to auto-sync?
- Are payments set to auto-sync?
- Is the sync schedule enabled?
- Are the account mappings correct?

#### **3. QuickBooks App Not Installed**
**Action needed:**
1. Go to QuickBooks App Store
2. Search for "Zoho Billing" app
3. Install and connect
4. Authorize Zoho access to QuickBooks

#### **4. Account Mapping Issues**
**Check:**
- Revenue accounts mapped correctly?
- Tax accounts mapped correctly?
- Payment accounts mapped correctly?
- Chart of accounts synced?

---

## 🔧 **SOLUTIONS**

### **Fix 1: Subscription Link**

#### **Step 1: Verify Plan Price**
1. Go to Zoho Billing → Items → Subscription Items → Plan010
2. Check price: Should be $98.80 CAD (not $99.8)
3. Update if needed
4. Save changes

#### **Step 2: Verify Plan is Published**
1. Go to Plan010 settings
2. Check "Pricing Widget" section
3. Enable "Display this plan in the pricing widget"
4. Save

#### **Step 3: Test Link**
```
https://billing.zohosecure.ca/subscribe/80acd4f75fc11ade8382abc9ca5c205ef35c7564ff13c9670befed3afeaa53b9/Plan010
```

**Test:**
1. Open link in incognito/private browser
2. Verify plan shows correctly
3. Verify price matches website ($98.80)
4. Test checkout flow

#### **Step 4: Update Website Buttons**
If price changed in Zoho, update website to match:
- Current website: $98.80 CAD
- Zoho shows: $99.8 CAD
- **Action:** Update website to $99.80 CAD OR update Zoho to $98.80 CAD

---

### **Fix 2: QuickBooks Integration**

#### **Step 1: Check Integration Status**
1. Zoho Billing → Settings → Integrations
2. Find QuickBooks integration
3. Check connection status

#### **Step 2: Install QuickBooks App** (if not installed)
1. Go to: https://apps.intuit.com/
2. Search: "Zoho Billing"
3. Install app
4. Connect to your QuickBooks account
5. Authorize Zoho access

#### **Step 3: Configure Sync Settings**
In Zoho Billing → Settings → Integrations → QuickBooks:

1. **Enable Auto-Sync:**
   - ✅ Invoices
   - ✅ Payments
   - ✅ Customers
   - ✅ Products

2. **Set Sync Schedule:**
   - Real-time (recommended)
   - Or daily at specific time

3. **Map Accounts:**
   - Revenue account: Your income account in QuickBooks
   - Tax account: Your tax liability account
   - Payment account: Your bank/Stripe account

#### **Step 4: Test Sync**
1. Create a test invoice in Zoho
2. Check if it appears in QuickBooks
3. Process a test payment
4. Verify it syncs to QuickBooks

---

## 📋 **CHECKLIST**

### **Subscription Link:**
- [ ] Verify Plan010 is active in Zoho
- [ ] Check price matches website ($98.80 vs $99.8)
- [ ] Enable pricing widget for Plan010
- [ ] Test subscription link in browser
- [ ] Verify checkout flow works end-to-end
- [ ] Update website buttons if price changed

### **QuickBooks Sync:**
- [ ] Check QuickBooks app installed
- [ ] Verify Zoho-QuickBooks connection
- [ ] Enable auto-sync for invoices
- [ ] Enable auto-sync for payments
- [ ] Map revenue accounts correctly
- [ ] Test sync with sample invoice
- [ ] Check sync logs for errors

---

## 🔗 **LINKS TO CHECK**

### **Zoho Billing:**
- Subscription link: `https://billing.zohosecure.ca/subscribe/80acd4f75fc11ade8382abc9ca5c205ef35c7564ff13c9670befed3afeaa53b9/Plan010`
- Plan settings: Zoho Billing → Items → Subscription Items → Plan010
- Integrations: Zoho Billing → Settings → Integrations

### **QuickBooks:**
- App Store: https://apps.intuit.com/
- Connect apps: QuickBooks → Apps → Find apps by Zoho

---

## 🎯 **IMMEDIATE ACTIONS**

1. **Fix Price Discrepancy:**
   - Decide: $98.80 or $99.80 CAD
   - Update Zoho plan price
   - Update website if needed

2. **Test Subscription Link:**
   - Copy link from Zoho Billing
   - Test in browser
   - Verify checkout works

3. **Check QuickBooks Integration:**
   - Verify connection status
   - Install app if missing
   - Enable auto-sync

4. **Check Sync Logs:**
   - Look for error messages
   - Check last successful sync
   - Review failed sync attempts

---

## 💡 **COMMON ISSUES & FIXES**

### **Link Not Working:**
- **Cause:** Plan not published or inactive
- **Fix:** Enable plan in Customer Portal settings

### **Price Mismatch:**
- **Cause:** Website shows different price than Zoho
- **Fix:** Sync prices between website and Zoho

### **QuickBooks Not Syncing:**
- **Cause:** Integration not connected or sync disabled
- **Fix:** Reconnect integration and enable auto-sync

---

**Last Updated:** November 3, 2025

