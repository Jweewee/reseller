import type { ConversationState, CustomerType, Plan, RejectionReason } from '../types';
import {
  validateNRIC,
  validatePostalCode,
  validateMobile,
  validateEmail,
  validateDateOfBirth,
  validateFullName,
  validateUnitNumber,
  validateRequired,
  extractLast4NRIC,
  calculateWorkingDaysFromToday,
  calculateStartDateFromContractEnd,
  formatDate
} from './validation';

export const plans: Plan[] = [
  {
    type: 'PowerFIX',
    duration: 6,
    rateBeforeGST: 0.2500,
    rateWithGST: 0.2700
  },
  {
    type: 'PowerFIX',
    duration: 12,
    rateBeforeGST: 0.2655,
    rateWithGST: 0.2867
  },
  {
    type: 'PowerFIX',
    duration: 24,
    rateBeforeGST: 0.2420,
    rateWithGST: 0.2768,
    billRebate: 100,
    isHotPick: true
  },
  {
    type: 'PowerFIX',
    duration: 36,
    rateBeforeGST: 0.2542,
    rateWithGST: 0.2747,
    billRebate: 160,
    isRecommended: true
  },
  {
    type: 'PowerDOT',
    duration: 12,
    discountPercentage: 3
  },
  {
    type: 'PowerDOT',
    duration: 24,
    discountPercentage: 5
  }
];

export const retailers = [
  'Geneco',
  'Senoko Energy',
  'Pacific Light',
  'Keppel Electric',
  'Sembcorp Power',
  'Union Power',
  'Sunseap',
  'iSwitch',
  'Ohm Energy',
  'Red Dot Power'
];

export const getStatePrompt = (state: ConversationState, context?: any): string => {
  switch (state) {
    case 'GREETING':
      return `You are a helpful customer service chatbot for Tuas Power Supply. Greet the customer warmly and ask about their current electricity provider. Ask if they are with:
1️⃣ SP Services (the default provider)
2️⃣ Another electricity retailer

Keep it friendly but professional. This is the first message in the conversation.`;

    case 'CUSTOMER_TYPE_IDENTIFICATION':
      return `The customer has indicated their electricity provider. Help identify if they are:
- SP Services customer (simple flow)
- Another retailer customer (need contract end date)

If they mention a retailer name, acknowledge it and ask for their contract end date. Explain that Tuas start date will be 1 day after their contract ends, and remind them to email their current retailer about not auto-renewing.

Be helpful and clear about next steps.`;

    case 'EDGE_CASE_CHECK':
      return `Now ask the customer these screening questions to check for edge cases:
1. "Do you have solar panels installed at your property?"
2. "Are you on a PayU (pay-as-you-use) payment scheme?"
3. "Are you already a Tuas Power customer?"

Ask these one by one, not all at once. If they answer YES to any, you'll need to politely reject them later with appropriate explanations.`;

    case 'PLAN_EDUCATION':
      return `Explain the two types of plans available:

🔒 **PowerFIX** - Fixed rate for entire contract
   Pros: Protected from price increases
   Cons: Won't benefit if prices drop

📉 **PowerDOT** - Always % discount off SP tariff
   Pros: Guaranteed savings vs SP
   Cons: Rate changes quarterly with SP

Current SP rate is 29.98¢/kWh. Ask which type interests them more before showing specific plans.`;

    case 'PLAN_SELECTION':
      return `Present the specific plans based on their interest. Current rates (July 2025):

**PowerFIX Plans:**
- PowerFIX 6: 27.00¢/kWh (6 months)
- PowerFIX 12: 28.67¢/kWh (12 months)
- PowerFIX 24: 27.68¢/kWh + $100 Bill Rebate ⭐ Most Popular
- PowerFIX 36: 27.47¢/kWh + $160 Bill Rebate 💎 Best Value

**PowerDOT Plans:**
- PowerDOT 12: 3% discount off SP
- PowerDOT 24: 5% discount off SP

Highlight savings vs current SP rate (29.98¢/kWh). Explain bill rebates are credited on 2nd/3rd month.`;

    case 'PERSONAL_DETAILS':
      return `Collect personal details one by one:
1. Full name (as per NRIC)
2. NRIC number (explain you'll only store last 4 characters for privacy)
3. Date of birth (DD-MM-YYYY format)
4. Mobile number (8 digits)
5. Email address
6. Are you the SP account holder? (Yes/No - if No, collect account holder name too)

Validate each input and provide helpful error messages with examples if needed.`;

    case 'PREMISE_DETAILS':
      return `Collect premise details:
1. Postal code (6 digits)
2. Unit number (e.g., 01-123)
3. Block number
4. Building name (if any, or "none")
5. Street name
6. Are you Owner or Tenant?
7. Is mailing address same as premise? (if No, collect separate mailing address)

Validate inputs and guide them through the format requirements.`;

    case 'START_DATE':
      return `Handle start date based on customer type:

For SP customers: Default is 14 working days from today (${formatDate(calculateWorkingDaysFromToday(14))}). Ask if this timing is good or if they prefer later.

For Retailer customers: Pre-filled based on contract end date + 1 day. Confirm with customer and remind them to email current retailer about no auto-renewal at least 7 days before contract end.`;

    case 'INSURANCE_OPTIN':
      return `Offer FREE 12-month Singlife Insurance (optional):
🏥 Personal Accident Insurance
🏠 Home Insurance
✈️ Travel Insurance

Note: Only for adults up to 70 years. An insurance agent will contact you ~2 weeks after contract starts.

Ask if they want to opt in and which type, or decline.`;

    case 'CONFIRMATION':
      return `Display a comprehensive summary of all collected information:
- Customer details (name, NRIC last 4, contact info)
- Premise address
- Selected plan with rates and duration
- Start date
- Insurance choice
- Important terms (rebate timing, billing agent, early termination fee)

Ask them to review carefully and confirm if everything is correct.`;

    case 'SIGNATURE':
      return `Request digital signature by asking them to type their full name exactly as shown to confirm the agreement:

"I, [Customer Name], acknowledge that I have read and understood the terms and confirm all information provided is accurate."

Once they provide their name, proceed to completion.`;

    case 'COMPLETED':
      return `Congratulate them on successful signup! Provide:
1. Reference number (TPS-2025-XXXXX format)
2. Next steps:
   - Check email for confirmation
   - Send photo of latest bill to WhatsApp 9818 3310
   - Transfer will be processed in ~14 working days
   - Will receive transfer confirmation email
3. Contact info for questions: 6838 6888 or WhatsApp 9818 3310`;

    case 'REJECTED':
      return getRejectionMessage(context?.rejectionReason);

    default:
      return 'I apologize, but I encountered an error. Please let me know how I can help you.';
  }
};

export const getRejectionMessage = (reason: RejectionReason): string => {
  switch (reason) {
    case 'SOLAR_PANELS':
      return `Unfortunately, we cannot accept customers with solar panel installations at this time. This is due to compatibility with our current billing systems. We apologize for the inconvenience!

For questions, please contact us at 6838 6888 or WhatsApp 9818 3310.`;

    case 'PAYU_SCHEME':
      return `We're unable to accept customers currently on PayU (pay-as-you-use) payment schemes. You would need to switch to a standard billing arrangement with SP first before transferring to us.

For assistance with switching payment schemes, please contact SP at 1800 111 3333.`;

    case 'EXISTING_CUSTOMER':
      return `Great news - you're already enjoying Tuas Power! 🎉

If you'd like to renew or change your plan, please visit our website at savewithtuas.com/promotions/tprs25/ and click 'Login now' for existing customers.

For account queries, call us at 6838 6888 or WhatsApp 9818 3310.`;

    case 'REFERRAL_CODE_REQUEST':
      return `Referral codes are not applicable for booth/roadshow signups. However, you still enjoy all our promotional rates and bill rebates!

The referral program is only for online signups referred by existing customers. You can still get great savings with our current campaign rates.

Shall we proceed with your signup?`;

    default:
      return 'We apologize, but we cannot proceed with your application at this time.';
  }
};

export const detectEdgeCase = (message: string): RejectionReason | null => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('solar') || lowerMessage.includes('panel')) {
    return 'SOLAR_PANELS';
  }

  if (lowerMessage.includes('payu') || lowerMessage.includes('pay u') || lowerMessage.includes('pay-u')) {
    return 'PAYU_SCHEME';
  }

  if (lowerMessage.includes('already') && (lowerMessage.includes('tuas') || lowerMessage.includes('customer'))) {
    return 'EXISTING_CUSTOMER';
  }

  if (lowerMessage.includes('referral') && lowerMessage.includes('code')) {
    return 'REFERRAL_CODE_REQUEST';
  }

  return null;
};

export const detectCustomerType = (message: string): { type: CustomerType; retailer?: string } | null => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('1') || lowerMessage.includes('sp') || lowerMessage.includes('singapore power')) {
    return { type: 'SP' };
  }

  if (lowerMessage.includes('2') || lowerMessage.includes('another') || lowerMessage.includes('retailer')) {
    return { type: 'RETAILER' };
  }

  // Check for specific retailer names
  for (const retailer of retailers) {
    if (lowerMessage.includes(retailer.toLowerCase())) {
      return { type: 'RETAILER', retailer };
    }
  }

  return null;
};

export const detectPlanInterest = (message: string): 'PowerFIX' | 'PowerDOT' | null => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('fix') || lowerMessage.includes('fixed') || lowerMessage.includes('lock')) {
    return 'PowerFIX';
  }

  if (lowerMessage.includes('dot') || lowerMessage.includes('discount') || lowerMessage.includes('%')) {
    return 'PowerDOT';
  }

  return null;
};

export const detectPlanSelection = (message: string): Plan | null => {
  const lowerMessage = message.toLowerCase();

  // PowerFIX plans
  if (lowerMessage.includes('24') && (lowerMessage.includes('fix') || lowerMessage.includes('month'))) {
    return plans.find(p => p.type === 'PowerFIX' && p.duration === 24) || null;
  }
  if (lowerMessage.includes('36') && (lowerMessage.includes('fix') || lowerMessage.includes('month'))) {
    return plans.find(p => p.type === 'PowerFIX' && p.duration === 36) || null;
  }
  if (lowerMessage.includes('12') && (lowerMessage.includes('fix') || lowerMessage.includes('month'))) {
    return plans.find(p => p.type === 'PowerFIX' && p.duration === 12) || null;
  }
  if (lowerMessage.includes('6') && (lowerMessage.includes('fix') || lowerMessage.includes('month'))) {
    return plans.find(p => p.type === 'PowerFIX' && p.duration === 6) || null;
  }

  // PowerDOT plans
  if (lowerMessage.includes('24') && (lowerMessage.includes('dot') || lowerMessage.includes('discount'))) {
    return plans.find(p => p.type === 'PowerDOT' && p.duration === 24) || null;
  }
  if (lowerMessage.includes('12') && (lowerMessage.includes('dot') || lowerMessage.includes('discount'))) {
    return plans.find(p => p.type === 'PowerDOT' && p.duration === 12) || null;
  }

  // Simple number selection
  if (lowerMessage.trim() === '24') {
    return plans.find(p => p.type === 'PowerFIX' && p.duration === 24) || null;
  }
  if (lowerMessage.trim() === '36') {
    return plans.find(p => p.type === 'PowerFIX' && p.duration === 36) || null;
  }
  if (lowerMessage.trim() === '12') {
    return plans.find(p => p.type === 'PowerFIX' && p.duration === 12) || null;
  }
  if (lowerMessage.trim() === '6') {
    return plans.find(p => p.type === 'PowerFIX' && p.duration === 6) || null;
  }

  return null;
};

export const extractDataFromMessage = (message: string, expectedField: string): string | null => {
  const trimmedMessage = message.trim();

  switch (expectedField) {
    case 'nric':
      const nricMatch = trimmedMessage.match(/[STFG]\d{7}[A-Z]/i);
      return nricMatch ? nricMatch[0].toUpperCase() : null;

    case 'postalCode':
      const postalMatch = trimmedMessage.match(/\d{6}/);
      return postalMatch ? postalMatch[0] : null;

    case 'mobile':
      const mobileMatch = trimmedMessage.match(/[89]\d{7}/);
      return mobileMatch ? mobileMatch[0] : null;

    case 'email':
      const emailMatch = trimmedMessage.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
      return emailMatch ? emailMatch[0] : null;

    case 'dateOfBirth':
      const dateMatch = trimmedMessage.match(/\d{1,2}[-\/]\d{1,2}[-\/]\d{4}/);
      if (dateMatch) {
        const date = dateMatch[0].replace(/\//g, '-');
        const parts = date.split('-');
        if (parts[0].length === 4) {
          return `${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[0]}`;
        } else {
          return `${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[2]}`;
        }
      }
      return null;

    case 'unitNumber':
      const unitMatch = trimmedMessage.match(/\d{2}-\d{3,4}/);
      return unitMatch ? unitMatch[0] : null;

    default:
      return trimmedMessage.length > 0 ? trimmedMessage : null;
  }
};