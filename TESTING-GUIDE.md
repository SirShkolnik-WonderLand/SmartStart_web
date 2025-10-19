# 🧪 ISO Studio Integration - Local Testing Guide

## ✅ What's Been Done

### 1. **Created New ISO Studio Page**
- ✅ Replaced `iso-readiness.html` with new React app embed
- ✅ Added Cyber Owl logo loading animation
- ✅ Full-screen iframe integration
- ✅ Smooth loading experience

### 2. **Updated Navigation**
- ✅ Replaced old Quiestioneer link with new ISO Studio
- ✅ Changed "🔒 Free Cyber Health Check" → "🦉 ISO 27001 Readiness Studio"
- ✅ Links to `/iso-readiness.html`

### 3. **Assets**
- ✅ Copied Cyber Owl logo to `website/assets/images/cyber-owl-logo.png`

---

## 🚀 How to Test Locally

### Step 1: Start ISO Studio App

```bash
cd /Users/udishkolnik/website/SmartStart_web/smartstart-platform/iso-studio
npm run dev
```

This will start the ISO Studio on `http://localhost:3347`

### Step 2: Start Main Website

```bash
cd /Users/udishkolnik/website/SmartStart_web/smartstart-platform
node website-server.js
```

This will start the main website on `http://localhost:3000`

### Step 3: Test the Integration

1. **Open the main website:** `http://localhost:3000`
2. **Navigate to Resources menu** in the header
3. **Click "🦉 ISO 27001 Readiness Studio"**
4. **Verify:**
   - ✅ Loading animation with Cyber Owl logo appears
   - ✅ ISO Studio loads in full-screen iframe
   - ✅ No console errors
   - ✅ All features work (welcome screen, framework selector, etc.)
   - ✅ Back button works (if needed)

---

## 🎯 Testing Checklist

### Navigation Testing
- [ ] Click "Resources" in navbar
- [ ] Verify "🦉 ISO 27001 Readiness Studio" appears in dropdown
- [ ] Click the link
- [ ] Verify page loads without errors

### ISO Studio Functionality
- [ ] Welcome screen displays correctly
- [ ] Cyber Owl logo shows with glow effect
- [ ] Framework selector works (ISO 27001 / CMMC)
- [ ] Title changes when switching frameworks
- [ ] Control counts update dynamically
- [ ] Can enter name and start assessment
- [ ] All three options work:
  - [ ] Full Assessment
  - [ ] Quick Bot Mode
  - [ ] Download Checklist

### Visual Alignment
- [ ] No horizontal scroll
- [ ] Full-screen experience
- [ ] Loading animation smooth
- [ ] No white flashes
- [ ] Consistent styling

### Browser Testing
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile responsive

---

## 🔧 Troubleshooting

### Issue: ISO Studio doesn't load
**Solution:** Make sure both servers are running:
```bash
# Terminal 1: ISO Studio
cd smartstart-platform/iso-studio && npm run dev

# Terminal 2: Main Website
cd smartstart-platform && node website-server.js
```

### Issue: CORS errors
**Solution:** The iframe should work locally. If you see CORS errors, check:
- Both servers are running
- ISO Studio is on port 3347
- Main website is on port 3000

### Issue: Logo doesn't show
**Solution:** 
```bash
# Verify logo exists
ls -la smartstart-platform/website/assets/images/cyber-owl-logo.png

# If missing, copy it:
cp "Logo(s)+slogans/Cyber-Owl_logo.png" smartstart-platform/website/assets/images/cyber-owl-logo.png
```

### Issue: Styling conflicts
**Solution:** The ISO Studio is in an iframe, so it should be isolated. If you see conflicts:
- Check browser console for errors
- Verify iframe loads correctly
- Try hard refresh (Cmd+Shift+R)

---

## 📋 Before Deploying

### 1. Update Production URL
When ready to deploy, update `iso-readiness.html`:

**Change:**
```html
<iframe 
    src="http://localhost:3347"
```

**To:**
```html
<iframe 
    src="https://your-production-url.com"
```

### 2. Test Production Build
```bash
cd smartstart-platform/iso-studio
npm run build
npm run preview
```

### 3. Verify All Links
- [ ] Check all internal links work
- [ ] Verify external links are correct
- [ ] Test navigation flow

---

## 🎨 What's Different from Old Version

### Old Quiestioneer:
- ❌ Separate external app
- ❌ Different branding
- ❌ Basic assessment
- ❌ No framework selector

### New ISO Studio:
- ✅ Integrated into main website
- ✅ Cyber Owl branding
- ✅ Multiple assessment modes
- ✅ ISO 27001 & CMMC support
- ✅ Interactive framework selector
- ✅ Download PDF checklists
- ✅ Modern, responsive design

---

## 📞 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Verify both servers are running
3. Try clearing browser cache
4. Check file permissions
5. Review this guide again

---

## 🚀 Ready to Deploy?

Once testing is complete:
1. Update production URL in `iso-readiness.html`
2. Build ISO Studio for production
3. Deploy to your hosting platform
4. Test in production environment
5. Monitor for any issues

---

**Happy Testing! 🎉**

