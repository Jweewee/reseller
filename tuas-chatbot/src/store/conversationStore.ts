import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  ConversationData,
  ConversationState,
  CustomerApplication,
  AppMetrics,
  ValidationError,
  CustomerType,
  Plan,
  AccountHolder,
  Premise,
  Insurance,
  RejectionReason
} from '../types';

interface ConversationStore {
  conversation: ConversationData;
  applications: CustomerApplication[];
  metrics: AppMetrics;

  // Actions
  initializeConversation: () => void;
  updateState: (state: ConversationState) => void;
  setCustomerType: (type: CustomerType, retailer?: string, contractEndDate?: string) => void;
  setSelectedPlan: (plan: Plan) => void;
  updateAccountHolder: (data: Partial<AccountHolder>) => void;
  updatePremise: (data: Partial<Premise>) => void;
  setStartDate: (date: string) => void;
  setInsurance: (insurance: Insurance) => void;
  setDigitalSignature: (signature: string) => void;
  setRejection: (reason: RejectionReason) => void;
  addValidationError: (error: ValidationError) => void;
  clearValidationErrors: () => void;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  submitApplication: () => CustomerApplication;
  resetConversation: () => void;

  // Getters
  getCurrentApplication: () => Partial<CustomerApplication>;
  getValidationErrors: () => ValidationError[];
  isStateComplete: (state: ConversationState) => boolean;
}

const initialConversation: ConversationData = {
  state: 'GREETING',
  validationErrors: [],
  conversationHistory: []
};

const initialMetrics: AppMetrics = {
  totalConversations: 0,
  completedSignups: 0,
  abandonedAtStage: {
    GREETING: 0,
    CUSTOMER_TYPE_IDENTIFICATION: 0,
    EDGE_CASE_CHECK: 0,
    PLAN_EDUCATION: 0,
    PLAN_SELECTION: 0,
    PERSONAL_DETAILS: 0,
    PREMISE_DETAILS: 0,
    START_DATE: 0,
    INSURANCE_OPTIN: 0,
    CONFIRMATION: 0,
    SIGNATURE: 0,
    COMPLETED: 0,
    REJECTED: 0
  },
  rejectedReasons: {
    SOLAR_PANELS: 0,
    PAYU_SCHEME: 0,
    EXISTING_CUSTOMER: 0,
    REFERRAL_CODE_REQUEST: 0
  },
  planDistribution: {},
  customerTypeDistribution: {
    SP: 0,
    RETAILER: 0
  }
};

export const useConversationStore = create<ConversationStore>((set, get) => ({
  conversation: { ...initialConversation },
  applications: [],
  metrics: { ...initialMetrics },

  initializeConversation: () => {
    const conversationId = uuidv4();
    set(state => ({
      conversation: {
        ...initialConversation,
        conversationHistory: [{
          role: 'assistant',
          content: '👋 Hello! Welcome to Tuas Power Supply!\n\nI\'m here to help you switch to one of Singapore\'s most competitive electricity rates. The whole signup takes about 5 minutes.\n\nBefore we start, are you currently with:\n1️⃣ SP Services (the default provider)\n2️⃣ Another electricity retailer (Geneco, Senoko, Pacific Light, etc.)\n\nJust reply with 1 or 2, or tell me your current provider!',
          timestamp: new Date().toISOString()
        }]
      },
      metrics: {
        ...state.metrics,
        totalConversations: state.metrics.totalConversations + 1
      }
    }));
  },

  updateState: (state: ConversationState) => {
    set(store => ({
      conversation: {
        ...store.conversation,
        state
      }
    }));
  },

  setCustomerType: (type: CustomerType, retailer?: string, contractEndDate?: string) => {
    set(store => ({
      conversation: {
        ...store.conversation,
        customerType: type,
        currentRetailer: retailer,
        contractEndDate: contractEndDate
      },
      metrics: {
        ...store.metrics,
        customerTypeDistribution: {
          ...store.metrics.customerTypeDistribution,
          [type]: store.metrics.customerTypeDistribution[type] + 1
        }
      }
    }));
  },

  setSelectedPlan: (plan: Plan) => {
    set(store => {
      const planKey = plan.type === 'PowerFIX'
        ? `${plan.type}${plan.duration}`
        : `${plan.type}${plan.duration}`;

      return {
        conversation: {
          ...store.conversation,
          selectedPlan: plan
        },
        metrics: {
          ...store.metrics,
          planDistribution: {
            ...store.metrics.planDistribution,
            [planKey]: (store.metrics.planDistribution[planKey] || 0) + 1
          }
        }
      };
    });
  },

  updateAccountHolder: (data: Partial<AccountHolder>) => {
    set(store => ({
      conversation: {
        ...store.conversation,
        accountHolder: {
          ...store.conversation.accountHolder,
          ...data
        }
      }
    }));
  },

  updatePremise: (data: Partial<Premise>) => {
    set(store => ({
      conversation: {
        ...store.conversation,
        premise: {
          ...store.conversation.premise,
          ...data
        }
      }
    }));
  },

  setStartDate: (date: string) => {
    set(store => ({
      conversation: {
        ...store.conversation,
        preferredStartDate: date
      }
    }));
  },

  setInsurance: (insurance: Insurance) => {
    set(store => ({
      conversation: {
        ...store.conversation,
        insurance
      }
    }));
  },

  setDigitalSignature: (signature: string) => {
    set(store => ({
      conversation: {
        ...store.conversation,
        digitalSignature: signature
      }
    }));
  },

  setRejection: (reason: RejectionReason) => {
    set(store => ({
      conversation: {
        ...store.conversation,
        state: 'REJECTED',
        rejectionReason: reason
      },
      metrics: {
        ...store.metrics,
        rejectedReasons: {
          ...store.metrics.rejectedReasons,
          [reason]: store.metrics.rejectedReasons[reason] + 1
        }
      }
    }));
  },

  addValidationError: (error: ValidationError) => {
    set(store => ({
      conversation: {
        ...store.conversation,
        validationErrors: [...store.conversation.validationErrors, error]
      }
    }));
  },

  clearValidationErrors: () => {
    set(store => ({
      conversation: {
        ...store.conversation,
        validationErrors: []
      }
    }));
  },

  addMessage: (role: 'user' | 'assistant', content: string) => {
    set(store => ({
      conversation: {
        ...store.conversation,
        conversationHistory: [
          ...store.conversation.conversationHistory,
          {
            role,
            content,
            timestamp: new Date().toISOString()
          }
        ]
      }
    }));
  },

  submitApplication: () => {
    const { conversation } = get();
    const referenceId = `TPS-2025-${Math.floor(10000 + Math.random() * 90000)}`;

    const application: CustomerApplication = {
      referenceId,
      timestamp: new Date().toISOString(),
      customerType: conversation.customerType!,
      currentRetailer: conversation.currentRetailer,
      contractEndDate: conversation.contractEndDate,
      selectedPlan: conversation.selectedPlan!,
      accountHolder: conversation.accountHolder as AccountHolder,
      premise: conversation.premise as Premise,
      preferredStartDate: conversation.preferredStartDate!,
      insurance: conversation.insurance!,
      digitalSignature: conversation.digitalSignature!,
      signatureTimestamp: new Date().toISOString(),
      agreedToTerms: true,
      campaignCode: 'TPRS25',
      status: 'PENDING_BILL_SUBMISSION',
      conversationId: uuidv4(),
      agentId: 'BOT_001'
    };

    set(store => ({
      applications: [...store.applications, application],
      metrics: {
        ...store.metrics,
        completedSignups: store.metrics.completedSignups + 1
      }
    }));

    return application;
  },

  resetConversation: () => {
    set({
      conversation: { ...initialConversation }
    });
  },

  getCurrentApplication: () => {
    const { conversation } = get();
    return {
      customerType: conversation.customerType,
      currentRetailer: conversation.currentRetailer,
      contractEndDate: conversation.contractEndDate,
      selectedPlan: conversation.selectedPlan,
      accountHolder: conversation.accountHolder,
      premise: conversation.premise,
      preferredStartDate: conversation.preferredStartDate,
      insurance: conversation.insurance,
      digitalSignature: conversation.digitalSignature
    };
  },

  getValidationErrors: () => {
    return get().conversation.validationErrors;
  },

  isStateComplete: (state: ConversationState) => {
    const { conversation } = get();

    switch (state) {
      case 'CUSTOMER_TYPE_IDENTIFICATION':
        return !!conversation.customerType;
      case 'PLAN_SELECTION':
        return !!conversation.selectedPlan;
      case 'PERSONAL_DETAILS':
        return !!(conversation.accountHolder?.fullName &&
                 conversation.accountHolder?.nricLast4 &&
                 conversation.accountHolder?.dateOfBirth &&
                 conversation.accountHolder?.mobile &&
                 conversation.accountHolder?.email);
      case 'PREMISE_DETAILS':
        return !!(conversation.premise?.postalCode &&
                 conversation.premise?.unitNumber &&
                 conversation.premise?.blockNumber &&
                 conversation.premise?.streetName &&
                 conversation.premise?.premiseType);
      case 'START_DATE':
        return !!conversation.preferredStartDate;
      case 'INSURANCE_OPTIN':
        return conversation.insurance !== undefined;
      case 'SIGNATURE':
        return !!conversation.digitalSignature;
      default:
        return false;
    }
  }
}));