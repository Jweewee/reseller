# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the ChatKit JavaScript monorepo, a batteries-included framework for building AI-powered chat experiences. ChatKit provides a complete, production-ready chat interface with deep UI customization, response streaming, tool integration, rich widgets, attachment handling, and thread management.

## Architecture

The repository is structured as a pnpm workspace with three main packages:

- `packages/chatkit/` - Core TypeScript type definitions for the ChatKit Web Component
- `packages/chatkit-react/` - React bindings and hooks for integrating ChatKit into React applications
- `packages/docs/` - Astro-based documentation site using Starlight

The core ChatKit web component is delivered via CDN (`https://cdn.platform.openai.com/deployments/chatkit/chatkit.js`) and consumed through the React bindings in typical usage.

## Development Commands

### Root-level commands (run from repository root):
- `pnpm build` - Build all packages in the workspace
- `pnpm test` - Run tests across all packages
- `pnpm lint` - Lint all packages
- `pnpm types` - Type check all packages
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm clean` - Clean build artifacts from all packages
- `pnpm check` - Run full validation (format check + lint + types + test)

### Documentation development:
- `pnpm dev:docs` - Start the documentation development server

### Package-specific commands:
Run these from within individual package directories or use `pnpm -F <package-name> <command>`:

**chatkit-react package:**
- `pnpm build` - Build the React bindings using tsup
- `pnpm test` - Run tests with Vitest
- `pnpm types` - Type check with TypeScript
- `pnpm lint` - ESLint validation

**chatkit package:**
- `pnpm types` - Generate TypeScript declarations

**docs package:**
- `pnpm dev` - Start Astro development server
- `pnpm build` - Build documentation site
- `pnpm preview` - Preview built documentation

## Key Integration Points

The main integration flow involves:
1. Server-side generation of client tokens via OpenAI's chatkit sessions API
2. Client-side usage of `useChatKit` hook to manage the connection
3. Rendering the `<ChatKit>` component with the control object

The React bindings in `packages/chatkit-react/src/` handle:
- `useChatKit.ts` - Main hook for ChatKit integration and session management
- `ChatKit.tsx` - React wrapper component for the web component
- `useStableOptions.ts` - Utilities for stable option handling

## Testing

The project uses Vitest for testing, primarily in the chatkit-react package. Run individual tests with `pnpm -F chatkit-react test`.

## Package Manager

This project uses pnpm with workspaces. Always use `pnpm` commands rather than npm or yarn. The lockfile is `pnpm-lock.yaml`.

# Tuas Power Supply - Customer Signup Chatbot Prototype

## Project Overview
Build a web-based chatbot to automate the customer signup process for Tuas Power Supply electricity plans. This prototype will handle information gathering, plan selection, and full signup completion for SP customers and other retailer customers.

## Platform & Architecture
- **Frontend**: Web application using OpenAI ChatKit GitHub repo
- **Backend**: In-memory data storage (no persistent database for prototype)
- **Integration**: All systems simulated in-memory

## Core Functionality

### 1. Customer Segmentation & Routing
The bot must identify which type of customer and route accordingly:

#### **SP Customers** (Currently with Singapore Power)
- Simpler flow - no contract end date needed
- Can start immediately (14 working days default)
- Need to verify not existing Tuas customer

#### **Other Retailer Customers** (Currently with Geneco, Senoko, Pacific Light, Keppel, etc.)
- Must collect contract end date
- Tuas start date = 1 day after competitor contract ends
- Must verify retailer name from bill
- Customer should inform current retailer they don't want auto-renewal

#### **Excluded Customers** (Auto-reject with explanation)
- Solar panel customers
- PayU (pay-as-you-use) scheme customers
- Existing Tuas Power customers
- Requests for referral codes at booths

### 2. Information Collection Flow

#### Phase 1: Customer Type Identification
```
1. Greet customer warmly
2. Ask: "Are you currently with SP Services or another electricity retailer?"
3. If "another retailer":
   - Ask which retailer (Geneco, Senoko, Pacific Light, Keppel, Sembcorp, etc.)
   - Ask for contract end date
   - Calculate appropriate start date (contract end date + 1 day)
   - Remind to email current retailer about no auto-renewal
4. If "SP Services":
   - Explain transfer will take 14 working days
   - Set default start date
```

#### Phase 2: Edge Case Detection
Ask screening questions:
- "Do you have solar panels installed at your property?"
- "Are you on a PayU (pay-as-you-use) payment scheme?"
- "Are you already a Tuas Power customer?"

If YES to any → Politely reject with explanation

#### Phase 3: Plan Selection
Present plans based on current rates (July 2025: SP = 29.98¢/kWh):

**PowerFIX Plans** (Fixed Rate):
- PowerFIX 6 (6 months): $0.2700/kWh
- PowerFIX 12 (12 months): $0.2867/kWh  
- PowerFIX 24 (24 months): $0.2768/kWh + $100 Bill Rebate ⭐ Hot Pick
- PowerFIX 36 (36 months): $0.2747/kWh + $160 Bill Rebate ⭐ Recommended

**PowerDOT Plans** (Discount off SP Tariff):
- PowerDOT 12: 3% discount
- PowerDOT 24: 5% discount

**Explain Key Differences**:
- PowerFIX = locked rate, protect against price increases
- PowerDOT = always pay less than SP (guaranteed savings)
- Bill rebates credited on 2nd/3rd month bill
- Can offset entire bill, not just electricity
- Rolls over if not fully utilized
- Government U-Save rebates still apply

#### Phase 4: Customer Details (PDPA Compliant)

**SP Utilities Account Holder Information**:
```
- Full Name (as per NRIC)
- NRIC/FIN (full for verification, store only last 4 characters: ***1234A)
- Are you the SP account holder? (Yes/No)
  - If No, collect account holder name too
- Date of Birth (format: DD-MM-YYYY)
- Contact Number (Mobile)
- Email Address
```

**Premise Details**:
```
- Postal Code (6 digits)
- Unit Number (e.g., 01-123)
- Block Number
- Building Name (if applicable)
- Street Name
- Premise Type (Owner/Tenant)
- Is mailing address same as premise? (Yes/No)
  - If No, collect separate mailing address
```

**Important Validations**:
- NRIC format: 7 digits + letter (e.g., S1234567A)
- Postal code: 6 digits
- Mobile: 8 digits starting with 8 or 9
- Email: valid email format
- Do NOT collect SP Account Number (not needed for now)

#### Phase 5: Preferred Start Date
For SP customers:
- Default: 14 working days from today
- Allow customer to select date (must be ≥14 working days)

For Retailer customers:
- Pre-filled: Contract end date + 1 day
- Confirm with customer
- Remind: "Please email your current retailer at least 7 days before contract end to inform them you do not want to renew"

#### Phase 6: Insurance Opt-in (Singlife)
```
"Would you like FREE 12 months Singlife Insurance? (Optional)
Choose one:
- Personal Accident Insurance
- Home Insurance  
- Travel Insurance

Note: Only for adults up to 70 years old. An insurance agent will contact you ~2 weeks after your contract starts."

Options: Yes (ask which type) / No thanks
```

#### Phase 7: Confirmation & Digital Signature

**Display Summary**:
```
=== YOUR SIGNUP SUMMARY ===

Customer Type: [SP / Other Retailer Name]
Plan Selected: [PowerFIX 24 + $100 Bill Rebate]
Rate: $0.2768/kWh (with GST)
Contract Duration: 24 months
Start Date: [DD MMM YYYY]

Account Holder: [Full Name]
NRIC: ***[Last 4 chars]
Contact: [Mobile]
Email: [Email]

Premise: 
[Unit]-[Block] [Building Name]
[Street Name]
Singapore [Postal Code]

Insurance: [Yes - Personal Accident / No]

Early Termination Charge: $200
Campaign Code: TPRS25

=== IMPORTANT TERMS ===
✓ Bill rebates credited on 2nd/3rd month after transfer
✓ You will still receive SP bills (SP is our billing agent)
✓ No power disruption during transfer
✓ You remain eligible for Government U-Save rebates
✓ Your current payment method (GIRO/Credit Card) continues
✓ You are entering a legally binding contract

Do you confirm all details are correct? (Yes/No)
```

If customer confirms:
```
"Please type your full name exactly as shown above to digitally sign this agreement:

I, [Customer Name], acknowledge that I have read and understood the terms and confirm all information provided is accurate."

[Customer types name]

✓ Thank you! Your application has been submitted.

Next Steps:
1. We'll send a confirmation email to [email] shortly
2. Please send a photo of your latest SP/Retailer bill to WhatsApp 9818 3310 
   (Include your name: [Customer Name])
3. Your transfer will be processed within 14 working days
4. You'll receive a transfer confirmation email once complete

Application Reference: [Generate random ref: TPS-2025-XXXXX]

Need help? Call 6838 6888 or WhatsApp 9818 3310
```

### 3. Edge Cases & Error Handling

#### Rejected Scenarios (with friendly explanations):
```
Solar Panels:
"Unfortunately, we cannot accept customers with solar panel installations at this time. This is due to compatibility with our current billing systems. We apologize for the inconvenience!"

PayU Scheme:
"We're unable to accept customers currently on PayU (pay-as-you-use) payment schemes. You would need to switch to a standard billing arrangement with SP first before transferring to us."

Existing Tuas Customer:
"Great news - you're already enjoying Tuas Power! If you'd like to renew or change your plan, please visit our website at savewithtuas.com/promotions/tprs25/ and click 'Login now' for existing customers."

Referral Code Request:
"Referral codes are not applicable for booth/roadshow signups. However, you still enjoy all our promotional rates and bill rebates! The referral program is only for online signups referred by existing customers."
```

#### Data Validation Errors:
- Invalid NRIC format → "Please provide a valid NRIC format (e.g., S1234567A)"
- Invalid postal code → "Please provide a valid 6-digit Singapore postal code"
- Invalid mobile → "Please provide a valid 8-digit mobile number starting with 8 or 9"
- Invalid email → "Please provide a valid email address"
- Start date too soon → "The earliest transfer date is 14 working days from today: [date]"

#### Missing Information:
If customer skips required fields, prompt specifically:
"I still need your [field name] to complete the signup. Could you provide that?"

#### Conversation Abandonment:
If customer hasn't responded in 5 minutes:
"Are you still there? I've saved your progress. Just let me know when you're ready to continue!"

### 4. Data Storage (In-Memory)

Store completed applications in this structure:
```javascript
{
  referenceId: "TPS-2025-12345",
  timestamp: "2025-11-01T14:30:00Z",
  customerType: "SP" | "RETAILER",
  
  // If retailer customer
  currentRetailer: "Senoko Energy",
  contractEndDate: "2026-04-26",
  
  // Plan details
  planType: "PowerFIX" | "PowerDOT",
  planDuration: 24,
  rateBeforeGST: 0.2420,
  rateWithGST: 0.2768,
  billRebate: 100,
  
  // Customer info
  accountHolder: {
    fullName: "John Tan Wei Ming",
    nricLast4: "234A",
    dateOfBirth: "1985-05-15",
    mobile: "91234567",
    email: "john.tan@email.com",
    isAccountHolder: true
  },
  
  // Premise
  premise: {
    postalCode: "560123",
    unitNumber: "01-234",
    blockNumber: "123",
    buildingName: "",
    streetName: "Ang Mo Kio Avenue 3",
    premiseType: "Owner",
    mailingAddressSame: true
  },
  
  // Dates
  preferredStartDate: "2025-11-20",
  
  // Optional features
  insurance: {
    optedIn: true,
    type: "Personal Accident"
  },
  
  // Agreement
  digitalSignature: "John Tan Wei Ming",
  signatureTimestamp: "2025-11-01T14:45:00Z",
  agreedToTerms: true,
  campaignCode: "TPRS25",
  
  // Status
  status: "PENDING_BILL_SUBMISSION",
  
  // Conversation metadata
  conversationId: "conv_abc123",
  agentId: "BOT_001" // For tracking
}
```

### 5. Conversation Design Principles

#### Tone & Style:
- **Friendly but professional** - not overly casual
- **Singaporean context** - understand local terms (HDB, NRIC, postal code)
- **Clear and concise** - avoid jargon
- **Proactive** - anticipate questions and provide context
- **Patient** - handle confusion gracefully

#### Example Opening:
```
👋 Hello! Welcome to Tuas Power Supply!

I'm here to help you switch to one of Singapore's most competitive electricity rates. The whole signup takes about 5 minutes.

Before we start, let me check - are you currently with:
1️⃣ SP Services (the default provider)
2️⃣ Another electricity retailer (Geneco, Senoko, Pacific Light, etc.)

Just reply with 1 or 2, or tell me your current provider!
```

#### Progressive Disclosure:
Don't overwhelm with all plans at once:
1. First, establish eligibility
2. Then, explain plan types (Fixed vs Discount)
3. Show specific plans with prices
4. Highlight recommended options
5. Explain rebates and terms

#### Confirmation at Key Points:
- After plan selection: "Great choice! PowerFIX 24 at $0.2768/kWh with $100 bill rebate. This means..."
- After personal details: "Let me confirm I have your details correct..."
- Before final signature: "Please review everything one last time..."

### 6. FAQ Handling (Context-Aware)

The bot should be able to answer common questions at any point:

**About Switching**:
- "How long does transfer take?" → 14 working days for SP customers
- "Will my power be cut?" → No power disruption
- "Do I need to tell SP?" → No, we handle it
- "What about my deposit?" → SP maintains it (no additional deposit for SP customers)

**About Billing**:
- "Who sends my bill?" → SP continues as billing agent
- "Can I use GIRO?" → Yes, your current payment method continues
- "What about U-Save?" → You still get government U-Save rebates

**About Plans**:
- "What if SP rate goes down?" → PowerFIX locked, PowerDOT always 5% cheaper
- "Can I change plans?" → Only at renewal, $200 ETC if early termination
- "When do I get rebate?" → 2nd or 3rd month after transfer

**About the Company**:
- "Who is Tuas Power?" → One of Singapore's licensed electricity retailers, part of Tuas Power Generation
- "Are you licensed?" → Yes, licensed by EMA (Energy Market Authority)

### 7. Success Metrics to Track

Even for prototype, track these in memory:
```javascript
{
  totalConversations: 0,
  completedSignups: 0,
  abandonedAtStage: {
    customerType: 0,
    edgeCase: 0,
    planSelection: 0,
    personalDetails: 0,
    confirmation: 0
  },
  rejectedReasons: {
    solarPanels: 0,
    payU: 0,
    existingCustomer: 0
  },
  planDistribution: {
    PowerFIX6: 0,
    PowerFIX12: 0,
    PowerFIX24: 0,
    PowerFIX36: 0,
    PowerDOT12: 0,
    PowerDOT24: 0
  },
  customerTypeDistribution: {
    SP: 0,
    Retailer: 0
  }
}
```

### 8. Testing Scenarios

Test these customer journeys:

#### Happy Path 1: SP Customer
```
1. Customer is with SP
2. No solar panels, not on PayU
3. Selects PowerFIX 24
4. Provides all details correctly
5. Opts in for insurance
6. Confirms and signs
✓ Should complete successfully
```

#### Happy Path 2: Retailer Customer
```
1. Customer with Senoko
2. Contract ends 26 Apr 2026
3. Selects PowerDOT 24
4. Provides all details correctly
5. Declines insurance
6. Confirms and signs
✓ Should complete successfully
✓ Start date should be 27 Apr 2026
```

#### Edge Case 1: Solar Panel Rejection
```
1. Customer is with SP
2. Has solar panels
✓ Should politely reject with explanation
✓ Should not collect any personal data
```

#### Edge Case 2: Existing Customer
```
1. Customer says already with Tuas
✓ Should redirect to renewal portal
✓ Should not proceed with new signup
```

#### Error Handling 1: Invalid NRIC
```
1. Customer provides NRIC as "12345"
✓ Should prompt for correct format
✓ Should give example
✓ Should not proceed until valid
```

#### Error Handling 2: Start Date Too Soon
```
1. SP customer wants to start in 5 days
✓ Should explain 14 working day requirement
✓ Should suggest earliest possible date
✓ Should allow customer to choose later date
```

### 9. Technical Implementation Notes

#### State Management:
Use a conversation state machine with these states:
```
GREETING → CUSTOMER_TYPE_IDENTIFICATION → EDGE_CASE_CHECK → 
PLAN_EDUCATION → PLAN_SELECTION → PERSONAL_DETAILS → 
PREMISE_DETAILS → START_DATE → INSURANCE_OPTIN → 
CONFIRMATION → SIGNATURE → COMPLETED
```

Allow jumping back to previous states if customer wants to change something.

#### Validation Functions Needed:
```javascript
validateNRIC(nric) // Format: 1 letter + 7 digits + 1 letter
validatePostalCode(code) // 6 digits
validateMobile(number) // 8 digits, starts with 8 or 9
validateEmail(email) // Standard email regex
validateDate(date) // Future date, working days calculation
extractLast4NRIC(nric) // Returns last 3 digits + letter (e.g., "234A")
calculateStartDate(contractEndDate) // Add 1 day
```

#### Date Handling:
- Store dates in ISO 8601 format (YYYY-MM-DD)
- Display in friendly format (DD MMM YYYY)
- Calculate working days (exclude weekends, but don't worry about PH for prototype)
- Current date reference: Saturday, November 01, 2025

#### Reference ID Generation:
```javascript
generateReferenceId() {
  // Format: TPS-YYYY-XXXXX
  // Where XXXXX is a random 5-digit number
  return `TPS-2025-${Math.floor(10000 + Math.random() * 90000)}`;
}
```

### 10. UI/UX Considerations

#### For Web Chat Interface:
- Use chat bubbles (bot messages on left, user on right)
- Show typing indicators when bot is "thinking"
- Use numbered options for multiple choice
- Use emojis sparingly but effectively (✓, ⭐, 💡, ⚠️)
- Make clickable buttons for common actions
- Show progress indicator (e.g., "Step 3 of 7")

#### Information Display:
- Use formatted blocks for plan details
- Use tables/cards for plan comparison
- Use collapsible sections for T&Cs
- Highlight key numbers (rates, rebates)

#### Mobile Responsive:
- Since it's a web app, ensure mobile-friendly
- Large touch targets for buttons
- Readable font sizes
- No horizontal scrolling

### 11. Agent Handoff (Breaking Point)

If bot can't handle:
```
"I want to connect you with one of our specialists who can better help with your situation.

Before I transfer you, let me save what we've discussed so far:

[Summary of collected information]

Please hold on while I find an available agent... 

[In prototype: Just display this message + collected data]
```

Trigger handoff scenarios:
- Customer asks complex questions 3+ times
- Customer explicitly requests human agent
- Unusual situation not covered in rules
- Customer seems frustrated (detect keywords: "frustrated", "annoyed", "forget it")

### 12. Sample Conversation Flow

```
BOT: 👋 Hello! Welcome to Tuas Power Supply!

I'm here to help you switch to one of Singapore's most competitive electricity rates. The whole signup takes about 5 minutes.

Before we start, are you currently with:
1️⃣ SP Services (the default provider)
2️⃣ Another electricity retailer (Geneco, Senoko, Pacific Light, etc.)

USER: I'm with SP

BOT: Perfect! Switching from SP is straightforward and takes about 14 working days.

Before we proceed, I need to check a few things:

Do you have solar panels installed at your property?

USER: No

BOT: Great! One more quick check - are you on a PayU (pay-as-you-use) payment scheme?

USER: No

BOT: Excellent! You're eligible to switch. ✓

Now, let me explain your options. We have 2 types of plans:

🔒 **PowerFIX** - Fixed rate for your entire contract
   Pros: Protected from price increases
   Cons: Won't benefit if prices drop

📉 **PowerDOT** - Always % off the SP tariff  
   Pros: Guaranteed savings vs SP
   Cons: Rate changes quarterly with SP

Current SP rate is 29.98¢/kWh. Which type interests you more?

USER: Fixed rate sounds good

BOT: Smart choice! Here are our PowerFIX plans:

**PowerFIX 24** ⭐ Most Popular
├─ Rate: 27.68¢/kWh (with GST)
├─ Duration: 24 months
├─ **Bonus: $100 Bill Rebate**
└─ Savings: ~2.30¢/kWh vs SP = $230+ per year for avg household!

**PowerFIX 36** 💎 Best Value
├─ Rate: 27.47¢/kWh (with GST)  
├─ Duration: 36 months
├─ **Bonus: $160 Bill Rebate**
└─ Even better long-term savings!

**PowerFIX 12**
├─ Rate: 28.67¢/kWh (with GST)
├─ Duration: 12 months
└─ Shortest commitment

Which plan would you like? (24, 36, or 12?)

USER: 24

BOT: Excellent choice! PowerFIX 24 is our most popular plan. ✓

Here's what you get:
💰 27.68¢/kWh (vs SP's 29.98¢/kWh)
🎁 $100 bill rebate (credited on 2nd/3rd month)
🔒 Fixed rate for 24 months
✅ Government U-Save rebates still apply

Important notes:
⚠️ Early termination: $200 charge
📅 Contract starts ~14 working days from today

Ready to proceed with signup?

USER: Yes

BOT: Perfect! Let's get your details.

First, what's your full name as shown on your NRIC?

USER: Sarah Lim Mei Ling

BOT: Thank you, Sarah!

Next, I need your NRIC number for verification. 

For your privacy, I'll only store the last 4 characters (last 3 digits + letter). Please provide your full NRIC:

USER: S8512345B

BOT: Got it! (I've securely stored ***345B)

What's your date of birth? (Format: DD-MM-YYYY)

USER: 15-03-1985

BOT: Thanks! Now I need your contact details.

Mobile number (8 digits):

USER: 91234567

BOT: Perfect!

Email address:

USER: sarah.lim@email.com

BOT: Great! ✓

Are you the SP Utilities account holder for this premise? (Yes/No)

USER: Yes

BOT: Excellent! Now let's get your premise details.

What's your postal code? (6 digits)

USER: 560123

BOT: Got it!

Unit number (e.g., 01-234):

USER: 05-678

BOT: Block number:

USER: 123

BOT: Building name (if any, or type "none"):

USER: none

BOT: Street name:

USER: Ang Mo Kio Avenue 6

BOT: Are you the Owner or Tenant?

USER: Owner

BOT: Is your mailing address the same as your premise address? (Yes/No)

USER: Yes

BOT: Perfect! ✓

Your transfer will take approximately 14 working days from today.

Based on today (1 Nov 2025), the earliest start date would be around **20 Nov 2025**.

Is this timing good for you, or would you prefer a later date?

USER: That's fine

BOT: Great! We'll target **20 Nov 2025** as your start date. ✓

One more thing - we're offering **FREE 12-month Singlife Insurance** (optional):

🏥 Personal Accident Insurance
🏠 Home Insurance  
✈️ Travel Insurance

Would you like to opt in? 

Note: Only for adults up to 70 years. An agent will contact you ~2 weeks after contract starts.

(Reply: "Yes + type" or "No thanks")

USER: Yes personal accident

BOT: Excellent choice! Personal Accident Insurance selected. ✓

━━━━━━━━━━━━━━━━━━━━━━
📋 YOUR SIGNUP SUMMARY
━━━━━━━━━━━━━━━━━━━━━━

**CUSTOMER DETAILS**
Name: Sarah Lim Mei Ling
NRIC: ***345B
Mobile: 91234567
Email: sarah.lim@email.com

**PREMISE**
05-678, Block 123
Ang Mo Kio Avenue 6
Singapore 560123
Type: Owner

**PLAN SELECTED**
PowerFIX 24 + $100 Bill Rebate
Rate: 27.68¢/kWh (with GST)
Duration: 24 months
Start Date: ~20 Nov 2025

**INSURANCE**
Personal Accident (12 months FREE)

**IMPORTANT TERMS**
✓ Bill rebate credited 2nd/3rd month
✓ SP continues as billing agent
✓ No power disruption
✓ Current payment method continues
✓ Early termination: $200
✓ Campaign: TPRS25

━━━━━━━━━━━━━━━━━━━━━━

Please review carefully. Is everything correct? (Yes/No)

USER: Yes

BOT: Perfect! Final step - Digital Signature

Please type your full name exactly as shown to confirm this agreement:

"I, Sarah Lim Mei Ling, acknowledge that I have read and understood the terms and confirm all information provided is accurate."

Type your name to sign:

USER: Sarah Lim Mei Ling

BOT: ✅ **APPLICATION SUBMITTED SUCCESSFULLY!**

Your Reference Number: **TPS-2025-47823**

━━━━━━━━━━━━━━━━━━━━━━
📬 NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━

1️⃣ Check your email (sarah.lim@email.com) for confirmation

2️⃣ **IMPORTANT**: Send a photo of your latest SP bill to:
   📱 WhatsApp: 9818 3310
   Include your name: "Sarah Lim Mei Ling"

3️⃣ We'll process your transfer (takes ~14 working days)

4️⃣ You'll receive transfer confirmation email

━━━━━━━━━━━━━━━━━━━━━━
💡 QUESTIONS?
━━━━━━━━━━━━━━━━━━━━━━

📞 Hotline: 6838 6888
💬 WhatsApp: 9818 3310
🌐 Website: savewithtuas.com

Thank you for choosing Tuas Power Supply! We look forward to serving you. 🎉

[End of conversation]
```

---

## Development Checklist

- [ ] Set up OpenAI ChatKit web interface
- [ ] Implement conversation state machine
- [ ] Create validation functions (NRIC, postal code, mobile, email, date)
- [ ] Build in-memory data storage structure
- [ ] Implement customer type routing logic
- [ ] Create edge case detection & rejection flows
- [ ] Design plan presentation & selection UI
- [ ] Build progressive form collection
- [ ] Implement date calculations (working days, contract end date + 1)
- [ ] Create confirmation summary display
- [ ] Implement digital signature capture
- [ ] Build reference ID generator
- [ ] Create FAQ response library
- [ ] Implement error handling & retry logic
- [ ] Add conversation abandonment handling
- [ ] Create metrics tracking (in-memory)
- [ ] Design mobile-responsive chat UI
- [ ] Test all happy path scenarios
- [ ] Test all edge case rejections
- [ ] Test validation error handling
- [ ] Create agent handoff display
- [ ] Add final summary export for agents
- [ ] Document API structure for future integrations

---

## Future Enhancements (Post-Prototype)

1. **Persistent Database**: Replace in-memory storage with proper DB
2. **Document Upload**: Handle bill uploads directly in chat
3. **OCR Integration**: Auto-extract details from uploaded bills
4. **Payment Integration**: Collect credit card for recurring payment
5. **Calendar Integration**: Real public holiday-aware working day calculation
6. **CRM Integration**: Sync with customer management system
7. **Agent Dashboard**: Live monitoring of bot conversations
8. **Analytics Dashboard**: Track conversion rates, abandonment points
9. **A/B Testing**: Test different conversation flows
10. **Multi-language**: Support Chinese, Malay, Tamil
11. **Voice Integration**: Add speech-to-text capability
12. **WhatsApp Bot**: Port to WhatsApp Business API
13. **Renewal Automation**: Proactive renewal reminders
14. **Verification Integration**: Auto-verify NRIC with government APIs
15. **Smart Recommendations**: ML-based plan recommendations based on usage

---

## Notes for Developers

- Keep conversation natural and flowing
- Don't make users feel like they're filling a form
- Validate early, validate often
- Provide helpful error messages with examples
- Always confirm understanding before moving forward
- Use progressive disclosure - don't overwhelm
- Make it easy to go back and correct mistakes
- Celebrate milestones (✓ checkmarks, emojis)
- Be transparent about what happens next
- Provide multiple contact options for help

**Remember**: This is a prototype. Focus on core happy path first, then handle edge cases. The goal is to prove the concept works before building production-ready features.