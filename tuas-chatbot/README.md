# Tuas Power Supply - Customer Signup Chatbot Prototype

A web-based chatbot prototype that automates the customer signup process for Tuas Power Supply electricity plans. Built with React, TypeScript, and OpenAI GPT-4 for intelligent conversation handling.

## Features

- **Complete Signup Flow**: Handles customer type identification, plan selection, and full application submission
- **Intelligent Routing**: Automatically routes SP customers vs other retailer customers with appropriate flows
- **Edge Case Handling**: Detects and politely rejects ineligible customers (solar panels, PayU schemes, etc.)
- **Plan Selection**: Interactive presentation of PowerFIX and PowerDOT electricity plans
- **Data Validation**: Comprehensive validation for NRIC, postal codes, mobile numbers, emails, etc.
- **Digital Signature**: Secure digital signature capture for legal agreements
- **Mobile Responsive**: Optimized for both desktop and mobile devices
- **Real-time Processing**: Powered by OpenAI GPT-4 for natural conversation flow

## Customer Types Supported

### SP Customers (Singapore Power)
- Simpler flow with default 14 working day transfer
- No contract end date needed
- Automatic eligibility verification

### Other Retailer Customers
- Requires contract end date collection
- Calculates start date as contract end + 1 day
- Reminds customers to notify current retailer

### Edge Cases (Auto-rejection)
- Solar panel customers
- PayU (pay-as-you-use) scheme customers
- Existing Tuas Power customers
- Referral code requests at booths

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Chat Interface**: Custom React chat UI with responsive design
- **AI**: OpenAI GPT-4 for intelligent conversation handling
- **State Management**: Zustand for structured data storage
- **Validation**: Custom validation utilities with date-fns
- **Styling**: CSS-in-JS with responsive mobile-first design

## Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key

### 1. Install Dependencies

```bash
cd tuas-chatbot
npm install
```

### 2. Environment Configuration

Edit the `.env` file and add your OpenAI API key:

```env
VITE_OPENAI_API_KEY=your_actual_openai_api_key_here
```

**⚠️ Security Note**: This is a prototype that calls OpenAI directly from the browser. In production, API calls should be made from a secure backend server.

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3001`

### 🚀 Quick Start

1. Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Edit `.env` file and paste your API key
3. Run `npm run dev`
4. Open http://localhost:3001 in your browser
5. Start testing with: "I'm with SP Services" or "I'm with Senoko Energy"

## Usage

1. **Start Conversation**: The bot greets customers and asks about their current electricity provider
2. **Customer Type**: Identifies if customer is with SP Services or another retailer
3. **Eligibility Check**: Screens for edge cases (solar panels, PayU, existing customers)
4. **Plan Education**: Explains PowerFIX vs PowerDOT plan types
5. **Plan Selection**: Customer chooses specific plan with rates and rebates
6. **Personal Details**: Collects name, NRIC, contact information
7. **Premise Details**: Gathers address and premise type
8. **Start Date**: Confirms transfer date based on customer type
9. **Insurance**: Optional Singlife insurance selection
10. **Confirmation**: Reviews all details with customer
11. **Digital Signature**: Captures agreement signature
12. **Completion**: Provides reference number and next steps

## Testing Scenarios

### Happy Path 1: SP Customer
```
Customer: "I'm with SP Services"
→ No edge cases
→ Selects PowerFIX 24
→ Provides all details correctly
→ Opts for Personal Accident insurance
→ Confirms and signs
✅ Should complete successfully
```

### Happy Path 2: Retailer Customer
```
Customer: "I'm with Senoko Energy"
→ Contract ends April 26, 2026
→ Selects PowerDOT 24
→ Provides all details correctly
→ Declines insurance
→ Confirms and signs
✅ Should complete successfully with start date April 27, 2026
```

### Edge Case: Solar Panel Rejection
```
Customer: "I have solar panels"
✅ Should politely reject with explanation
✅ Should not collect personal data
```

### Validation Error: Invalid NRIC
```
Customer provides NRIC as "12345"
✅ Should prompt for correct format with example
✅ Should not proceed until valid NRIC provided
```

## Data Storage

The prototype uses in-memory storage with the following structure:

```typescript
interface CustomerApplication {
  referenceId: string;           // TPS-2025-XXXXX format
  timestamp: string;
  customerType: 'SP' | 'RETAILER';
  currentRetailer?: string;
  contractEndDate?: string;
  selectedPlan: Plan;
  accountHolder: AccountHolder;
  premise: Premise;
  preferredStartDate: string;
  insurance: Insurance;
  digitalSignature: string;
  // ... additional fields
}
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## API Integration

### Current State (Prototype)
- OpenAI API calls made directly from browser
- No persistent database
- In-memory storage only

### Production Considerations
- Move OpenAI API calls to secure backend
- Implement proper authentication
- Add persistent database (PostgreSQL/MongoDB)
- Add file upload for electricity bills
- Integrate with CRM systems
- Add proper logging and monitoring

## Conversation Flow States

```
GREETING → CUSTOMER_TYPE_IDENTIFICATION → EDGE_CASE_CHECK →
PLAN_EDUCATION → PLAN_SELECTION → PERSONAL_DETAILS →
PREMISE_DETAILS → START_DATE → INSURANCE_OPTIN →
CONFIRMATION → SIGNATURE → COMPLETED
```

## Key Features

### Validation Functions
- **NRIC**: Format S1234567A validation
- **Postal Code**: 6-digit Singapore postal codes
- **Mobile**: 8-digit numbers starting with 8 or 9
- **Email**: Standard email format validation
- **Dates**: Working day calculations, contract end dates

### Plan Offerings (July 2025 Rates)
- **PowerFIX 6**: 27.00¢/kWh (6 months)
- **PowerFIX 12**: 28.67¢/kWh (12 months)
- **PowerFIX 24**: 27.68¢/kWh + $100 rebate (Most Popular)
- **PowerFIX 36**: 27.47¢/kWh + $160 rebate (Best Value)
- **PowerDOT 12**: 3% discount off SP tariff
- **PowerDOT 24**: 5% discount off SP tariff

### Smart Detection
- Customer type from natural language
- Edge case scenarios for auto-rejection
- Plan preferences and selections
- Data extraction from user messages

## Troubleshooting

### Common Issues

**1. OpenAI API Errors**
- Verify API key is correct in .env file
- Check OpenAI account has sufficient credits
- Ensure API key has proper permissions
- Check browser console for detailed error messages

**2. Build Errors**
- Delete node_modules and run `npm install` again
- Check TypeScript errors with `npm run type-check`
- Ensure all dependencies are properly installed

**3. Development Server Issues**
- Check if port 3001 is available
- Try running with `--host` flag: `npm run dev --host`
- Clear browser cache and restart the server

**4. Environment Variables**
- Ensure `.env` file exists in the project root
- Verify VITE_OPENAI_API_KEY is set correctly
- Restart the development server after changing environment variables

## Future Enhancements

- **Persistent Database**: Replace in-memory storage
- **Document Upload**: Handle bill uploads directly in chat
- **OCR Integration**: Auto-extract details from uploaded bills
- **Multi-language Support**: Chinese, Malay, Tamil
- **Voice Integration**: Speech-to-text capability
- **WhatsApp Integration**: Port to WhatsApp Business API
- **Agent Dashboard**: Live monitoring of conversations
- **Analytics**: Conversion tracking and optimization

## Support

For technical issues or questions about this prototype:

- Check the troubleshooting section above
- Review the conversation flow states
- Test with the provided scenarios
- Ensure environment variables are properly set

## Project Status

✅ **Complete Prototype Ready for Testing**

This prototype includes:
- Complete 7-step conversation flow
- Smart customer routing (SP vs Retailer)
- Edge case detection and rejection
- Plan selection with current rates
- Full data validation suite
- Digital signature capture
- Responsive mobile-friendly UI
- OpenAI GPT-4 integration

## Demo Instructions

1. **SP Customer Flow**: Start with "I'm with SP Services"
2. **Retailer Customer Flow**: Try "I'm with Senoko Energy"
3. **Edge Case Testing**: Test "I have solar panels"
4. **Validation Testing**: Try invalid NRIC like "12345"

## License

This is a prototype application for demonstration purposes.