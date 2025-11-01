# Tuas Power Supply - Customer Signup Chatbot Prototype

A web-based chatbot prototype that automates the customer signup process for Tuas Power Supply electricity plans. Built with OpenAI ChatKit and React.

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
- **Chat Interface**: OpenAI ChatKit React components
- **AI**: OpenAI GPT-4 for conversation handling
- **State Management**: Zustand for structured data storage
- **Validation**: Custom validation utilities with date-fns
- **Styling**: CSS-in-JS with responsive design

## Installation & Setup

### Prerequisites

- Node.js 18+ and pnpm
- OpenAI API key

### 1. Install Dependencies

From the project root directory:

```bash
cd tuas-chatbot
pnpm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
VITE_OPENAI_API_KEY=your_actual_openai_api_key_here
```

**⚠️ Security Note**: This is a prototype that calls OpenAI directly from the browser. In production, API calls should be made from a secure backend server.

### 3. Install ChatKit React Package

Since this uses the local ChatKit package, install it from the parent workspace:

```bash
cd ../
pnpm install
pnpm build
cd tuas-chatbot
```

### 4. Run Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3001`

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

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking

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

**1. ChatKit Integration Errors**
- Ensure parent workspace packages are built: `cd ../ && pnpm build`
- Check if @openai/chatkit-react is properly installed

**2. OpenAI API Errors**
- Verify API key is correct in .env file
- Check OpenAI account has sufficient credits
- Ensure API key has proper permissions

**3. Build Errors**
- Run `pnpm clean` in parent directory
- Delete node_modules and run `pnpm install` again
- Check TypeScript errors with `pnpm type-check`

**4. Development Server Issues**
- Check if port 3001 is available
- Try running with `--host` flag: `pnpm dev --host`

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

## License

This is a prototype application for demonstration purposes.