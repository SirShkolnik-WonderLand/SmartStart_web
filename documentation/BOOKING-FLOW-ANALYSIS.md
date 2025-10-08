# Complete Booking Flow Analysis

**Date:** October 8, 2025  
**Status:** Investigation Complete

---

## 🔍 Current State Analysis

### **Pages That Link to booking.html:**

#### **1. Teaching & Training Page** (`services/teaching-training.html`)
Links to booking.html with service parameters:
- `booking.html?service=cissp` (Book CISSP Mentorship)
- `booking.html?service=cism` (Book CISM Workshop)
- `booking.html?service=iso27001` (Book ISO 27001 Training)
- `booking.html?service=corporate` (Book Corporate Training)
- `booking.html?service=educational` (Request Educational Support)
- `booking.html?service=privacy` (Book Privacy Training)
- `booking.html?service=tabletop` (Book Tabletop Exercise)
- `booking.html?service=ai-security` (Book AI Security Training)
- `booking.html?service=pro-bono` (Request Pro-Bono Workshop)
- `booking.html` (general - in hero and final CTA)

#### **2. Cybersecurity & Compliance Page** (`services/cybersecurity-compliance.html`)
Links to booking.html:
- `booking.html` (Hero: "Secure Your Organization")
- `booking.html` (Final CTA: "Get Security Assessment")
- `booking.html` (Final CTA: "Book a Consultation")

#### **3. Advisory & Audits Page** (`services/advisory-audits.html`)
Links to booking.html:
- `booking.html` (Hero: "Start Advisory Engagement")
- `booking.html` (Final CTA: "Start Advisory Engagement")
- `booking.html` (Final CTA: "Book a Consultation")

#### **4. Automation & AI Page** (`services/automation-ai.html`)
Links to booking.html:
- `booking.html` (Hero: "Start Automation Project")
- `booking.html` (Final CTA: "Start Automation Project")
- `booking.html` (Final CTA: "Book a Consultation")

---

## ❌ Problems Identified

### **Problem 1: booking.html Only Shows TRAINING Services**
The booking page we just created ONLY has training services:
- CISSP Exam Mentorship
- ISO 27001 Audit Readiness Bootcamp
- Security Awareness Starter
- PHIPA/PIPEDA Privacy Workshop
- Executive Tabletop
- AI Security & Safe Data Handling
- Student & Educational Programs
- Ad-hoc Mentorship

**BUT** these pages link to booking.html for non-training services:
- "Start Advisory Engagement" (Advisory page)
- "Start Automation Project" (Automation page)
- "Secure Your Organization" (Cybersecurity page)

### **Problem 2: contact.html Redirects to smartstart.html**
```javascript
// Redirect to SmartStart page where people can actually get in touch
window.location.replace('smartstart.html');
```
This is WRONG! Contact form should exist for general inquiries.

### **Problem 3: No Service Categories in booking.html**
The booking page doesn't differentiate between:
- **Training** (CISSP, ISO courses, workshops)
- **Advisory** (strategic engagements, audits)
- **Implementation** (CISO services, automation projects)
- **Assessment** (security audits, gap analysis)

### **Problem 4: Confusing CTAs**
Different service pages use different button text for the same destination:
- "Start Advisory Engagement" → booking.html
- "Start Automation Project" → booking.html
- "Get Security Assessment" → booking.html
- "Book a Consultation" → booking.html
- "Book Training" → booking.html

ALL go to the same page, but that page only shows training services!

---

## ✅ Recommended Solution

### **Option A: Single Unified Booking Page (Recommended)**
**booking.html** becomes a comprehensive inquiry/booking form with service categories:

**Categories:**
1. **Training & Workshops**
   - CISSP Mentorship, ISO Bootcamp, Privacy Workshops, etc.
   - Multi-step booking (date/time selection needed)
   
2. **Advisory & Consulting**
   - Advisory Engagements, Audit Readiness, Strategy Sessions
   - Simple contact form (flexible scheduling needed)
   
3. **Implementation Projects**
   - CISO-as-a-Service, Automation Projects, Security Implementations
   - Custom quote form (project scoping needed)
   
4. **Assessments & Audits**
   - Security Assessments, Gap Analysis, Compliance Reviews
   - Quote request form

**User Flow:**
1. Land on booking.html
2. Select category (Training / Advisory / Implementation / Assessment)
3. Based on category:
   - **Training** → Show calendar/time picker
   - **Others** → Show contact form for custom quote

### **Option B: Separate Pages**
- **booking.html** → Training workshops only (keep as-is)
- **contact.html** → Advisory, Implementation, Assessments (create proper form)
- Update all service page CTAs to link correctly

---

## 🎯 Immediate Actions Needed

1. **Fix contact.html**
   - Remove redirect to smartstart.html
   - Create proper contact form for general inquiries

2. **Decide on approach:**
   - **Option A:** Expand booking.html to handle all service types
   - **Option B:** Keep booking.html for training, use contact.html for other services

3. **Update service page CTAs:**
   - Advisory/Automation/Cybersecurity pages should link to appropriate destination
   - Teaching & Training can keep specific booking.html?service= links

4. **Add service type detection to booking.html:**
   - If `?service=advisory` or `?type=consultation` → Show contact form
   - If `?service=cissp` or training-related → Show calendar/booking flow

---

## 📊 Current Issues Summary

| Issue | Impact | Fix Needed |
|-------|--------|-----------|
| contact.html redirects to smartstart.html | Users can't contact for general inquiries | Remove redirect, create contact form |
| booking.html only shows training | Advisory/Automation CTAs lead to wrong page | Add service categories or split pages |
| Mixed CTA text | Confusing user expectations | Standardize button text per service type |
| No advisory/project booking flow | Can't actually book advisory or automation | Add forms or route to contact |

---

## 💡 Recommendation

**Use Option A** - Create a smart booking.html that:
1. Detects service type from URL parameter
2. Shows appropriate form:
   - Training services → Calendar + multi-step
   - Advisory/Projects → Contact form for quote
3. All CTAs work correctly
4. Single entry point, simpler to maintain

**Also:**
- Fix contact.html to be a real contact form
- Update service page CTAs to be consistent
- Add proper service type parameters to all links

---

**Next Step:** Should we implement Option A (unified smart booking page) or Option B (separate pages)?

