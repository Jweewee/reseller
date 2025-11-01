export type CustomerType = 'SP' | 'RETAILER';

export type ConversationState =
  | 'GREETING'
  | 'CUSTOMER_TYPE_IDENTIFICATION'
  | 'EDGE_CASE_CHECK'
  | 'PLAN_EDUCATION'
  | 'PLAN_SELECTION'
  | 'PERSONAL_DETAILS'
  | 'PREMISE_DETAILS'
  | 'START_DATE'
  | 'INSURANCE_OPTIN'
  | 'CONFIRMATION'
  | 'SIGNATURE'
  | 'COMPLETED'
  | 'REJECTED';

export type PlanType = 'PowerFIX' | 'PowerDOT';

export type PowerFIXPlan = {
  type: 'PowerFIX';
  duration: 6 | 12 | 24 | 36;
  rateBeforeGST: number;
  rateWithGST: number;
  billRebate?: number;
  isRecommended?: boolean;
  isHotPick?: boolean;
};

export type PowerDOTPlan = {
  type: 'PowerDOT';
  duration: 12 | 24;
  discountPercentage: number;
};

export type Plan = PowerFIXPlan | PowerDOTPlan;

export type InsuranceType = 'Personal Accident' | 'Home' | 'Travel';

export type AccountHolder = {
  fullName: string;
  nricLast4: string;
  dateOfBirth: string;
  mobile: string;
  email: string;
  isAccountHolder: boolean;
  spAccountHolderName?: string;
};

export type Premise = {
  postalCode: string;
  unitNumber: string;
  blockNumber: string;
  buildingName?: string;
  streetName: string;
  premiseType: 'Owner' | 'Tenant';
  mailingAddressSame: boolean;
  mailingAddress?: {
    postalCode: string;
    unitNumber: string;
    blockNumber: string;
    buildingName?: string;
    streetName: string;
  };
};

export type Insurance = {
  optedIn: boolean;
  type?: InsuranceType;
};

export type CustomerApplication = {
  referenceId: string;
  timestamp: string;
  customerType: CustomerType;

  currentRetailer?: string;
  contractEndDate?: string;

  selectedPlan?: Plan;

  accountHolder?: AccountHolder;
  premise?: Premise;

  preferredStartDate?: string;
  insurance?: Insurance;

  digitalSignature?: string;
  signatureTimestamp?: string;
  agreedToTerms: boolean;
  campaignCode: string;

  status: 'PENDING_BILL_SUBMISSION' | 'COMPLETED';

  conversationId: string;
  agentId: string;
};

export type ValidationError = {
  field: string;
  message: string;
};

export type RejectionReason =
  | 'SOLAR_PANELS'
  | 'PAYU_SCHEME'
  | 'EXISTING_CUSTOMER'
  | 'REFERRAL_CODE_REQUEST';

export type ConversationData = {
  state: ConversationState;
  customerType?: CustomerType;
  currentRetailer?: string;
  contractEndDate?: string;
  selectedPlan?: Plan;
  accountHolder?: Partial<AccountHolder>;
  premise?: Partial<Premise>;
  preferredStartDate?: string;
  insurance?: Insurance;
  digitalSignature?: string;
  rejectionReason?: RejectionReason;
  validationErrors: ValidationError[];
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
};

export type AppMetrics = {
  totalConversations: number;
  completedSignups: number;
  abandonedAtStage: Record<ConversationState, number>;
  rejectedReasons: Record<RejectionReason, number>;
  planDistribution: Record<string, number>;
  customerTypeDistribution: Record<CustomerType, number>;
};