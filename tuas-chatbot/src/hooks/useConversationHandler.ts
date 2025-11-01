import { useCallback } from 'react';
import { useConversationStore } from '../store/conversationStore';
import { useOpenAI } from './useOpenAI';
import {
  detectEdgeCase,
  detectCustomerType,
  detectPlanInterest,
  detectPlanSelection,
  extractDataFromMessage,
  plans
} from '../utils/conversationEngine';
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
  formatDate
} from '../utils/validation';
import type { ConversationState, Plan, InsuranceType } from '../types';

export const useConversationHandler = () => {
  const {
    conversation,
    updateState,
    setCustomerType,
    setSelectedPlan,
    updateAccountHolder,
    updatePremise,
    setStartDate,
    setInsurance,
    setDigitalSignature,
    setRejection,
    addValidationError,
    clearValidationErrors,
    addMessage,
    submitApplication,
    isStateComplete
  } = useConversationStore();

  const handleAIResponse = useCallback((response: string) => {
    addMessage('assistant', response);
  }, [addMessage]);

  const handleAIError = useCallback((error: string) => {
    addMessage('assistant', `I apologize, but I encountered an error: ${error}. Please try again or contact our support team at 6838 6888.`);
  }, [addMessage]);

  const { generateResponse, isLoading } = useOpenAI({
    onResponse: handleAIResponse,
    onError: handleAIError
  });

  const processUserMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    clearValidationErrors();
    addMessage('user', message);

    const currentState = conversation.state;
    let nextState: ConversationState = currentState;
    let shouldGenerateAIResponse = true;

    try {
      switch (currentState) {
        case 'GREETING':
        case 'CUSTOMER_TYPE_IDENTIFICATION': {
          const customerTypeInfo = detectCustomerType(message);
          if (customerTypeInfo) {
            setCustomerType(customerTypeInfo.type, customerTypeInfo.retailer);
            nextState = 'EDGE_CASE_CHECK';

            if (customerTypeInfo.type === 'RETAILER' && !customerTypeInfo.retailer) {
              shouldGenerateAIResponse = true;
            }
          } else {
            shouldGenerateAIResponse = true;
          }
          break;
        }

        case 'EDGE_CASE_CHECK': {
          const edgeCase = detectEdgeCase(message);
          if (edgeCase) {
            setRejection(edgeCase);
            nextState = 'REJECTED';
            shouldGenerateAIResponse = true;
          } else {
            const lowerMessage = message.toLowerCase();
            if (lowerMessage.includes('no') || lowerMessage.includes('not')) {
              nextState = 'PLAN_EDUCATION';
            }
          }
          break;
        }

        case 'PLAN_EDUCATION': {
          const planInterest = detectPlanInterest(message);
          if (planInterest) {
            nextState = 'PLAN_SELECTION';
          }
          break;
        }

        case 'PLAN_SELECTION': {
          const selectedPlan = detectPlanSelection(message);
          if (selectedPlan) {
            setSelectedPlan(selectedPlan);
            nextState = 'PERSONAL_DETAILS';
          }
          break;
        }

        case 'PERSONAL_DETAILS': {
          await handlePersonalDetailsCollection(message);
          if (isStateComplete('PERSONAL_DETAILS')) {
            nextState = 'PREMISE_DETAILS';
          }
          break;
        }

        case 'PREMISE_DETAILS': {
          await handlePremiseDetailsCollection(message);
          if (isStateComplete('PREMISE_DETAILS')) {
            nextState = 'START_DATE';
          }
          break;
        }

        case 'START_DATE': {
          await handleStartDateCollection(message);
          if (isStateComplete('START_DATE')) {
            nextState = 'INSURANCE_OPTIN';
          }
          break;
        }

        case 'INSURANCE_OPTIN': {
          handleInsuranceSelection(message);
          if (isStateComplete('INSURANCE_OPTIN')) {
            nextState = 'CONFIRMATION';
          }
          break;
        }

        case 'CONFIRMATION': {
          const lowerMessage = message.toLowerCase();
          if (lowerMessage.includes('yes') || lowerMessage.includes('correct') || lowerMessage.includes('confirm')) {
            nextState = 'SIGNATURE';
          } else if (lowerMessage.includes('no') || lowerMessage.includes('change')) {
            shouldGenerateAIResponse = true;
          }
          break;
        }

        case 'SIGNATURE': {
          const expectedName = conversation.accountHolder?.fullName;
          if (expectedName && message.trim().toLowerCase() === expectedName.toLowerCase()) {
            setDigitalSignature(message.trim());
            const application = submitApplication();
            nextState = 'COMPLETED';

            const completionMessage = `✅ **APPLICATION SUBMITTED SUCCESSFULLY!**

Your Reference Number: **${application.referenceId}**

━━━━━━━━━━━━━━━━━━━━━━
📬 NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━

1️⃣ Check your email (${application.accountHolder?.email}) for confirmation

2️⃣ **IMPORTANT**: Send a photo of your latest ${conversation.customerType === 'SP' ? 'SP' : conversation.currentRetailer} bill to:
   📱 WhatsApp: 9818 3310
   Include your name: "${application.accountHolder?.fullName}"

3️⃣ We'll process your transfer (takes ~14 working days)

4️⃣ You'll receive transfer confirmation email

━━━━━━━━━━━━━━━━━━━━━━
💡 QUESTIONS?
━━━━━━━━━━━━━━━━━━━━━━

📞 Hotline: 6838 6888
💬 WhatsApp: 9818 3310
🌐 Website: savewithtuas.com

Thank you for choosing Tuas Power Supply! We look forward to serving you. 🎉`;

            addMessage('assistant', completionMessage);
            shouldGenerateAIResponse = false;
          } else {
            addValidationError({
              field: 'signature',
              message: `Please type your full name exactly as shown: "${expectedName}"`
            });
          }
          break;
        }

        default:
          break;
      }

      if (nextState !== currentState) {
        updateState(nextState);
      }

      if (shouldGenerateAIResponse && nextState !== 'COMPLETED') {
        await generateResponse(
          message,
          nextState,
          conversation.conversationHistory,
          {
            customerType: conversation.customerType,
            currentRetailer: conversation.currentRetailer,
            selectedPlan: conversation.selectedPlan,
            validationErrors: conversation.validationErrors,
            rejectionReason: conversation.rejectionReason
          }
        );
      }
    } catch (error) {
      console.error('Error processing message:', error);
      addMessage('assistant', 'I apologize, but I encountered an error processing your message. Please try again.');
    }
  }, [
    conversation,
    updateState,
    setCustomerType,
    setSelectedPlan,
    updateAccountHolder,
    updatePremise,
    setStartDate,
    setInsurance,
    setDigitalSignature,
    setRejection,
    addValidationError,
    clearValidationErrors,
    addMessage,
    submitApplication,
    isStateComplete,
    generateResponse
  ]);

  const handlePersonalDetailsCollection = async (message: string) => {
    const accountHolder = conversation.accountHolder || {};

    if (!accountHolder.fullName) {
      const name = message.trim();
      const validation = validateFullName(name);
      if (validation) {
        addValidationError(validation);
      } else {
        updateAccountHolder({ fullName: name });
      }
    } else if (!accountHolder.nricLast4) {
      const nric = extractDataFromMessage(message, 'nric');
      if (nric) {
        const validation = validateNRIC(nric);
        if (validation) {
          addValidationError(validation);
        } else {
          updateAccountHolder({ nricLast4: extractLast4NRIC(nric) });
        }
      } else {
        addValidationError({ field: 'nric', message: 'Please provide a valid NRIC format (e.g., S1234567A)' });
      }
    } else if (!accountHolder.dateOfBirth) {
      const dob = extractDataFromMessage(message, 'dateOfBirth');
      if (dob) {
        const validation = validateDateOfBirth(dob);
        if (validation) {
          addValidationError(validation);
        } else {
          updateAccountHolder({ dateOfBirth: dob });
        }
      } else {
        addValidationError({ field: 'dateOfBirth', message: 'Please provide date in DD-MM-YYYY format' });
      }
    } else if (!accountHolder.mobile) {
      const mobile = extractDataFromMessage(message, 'mobile');
      if (mobile) {
        const validation = validateMobile(mobile);
        if (validation) {
          addValidationError(validation);
        } else {
          updateAccountHolder({ mobile });
        }
      } else {
        addValidationError({ field: 'mobile', message: 'Please provide a valid 8-digit mobile number starting with 8 or 9' });
      }
    } else if (!accountHolder.email) {
      const email = extractDataFromMessage(message, 'email');
      if (email) {
        const validation = validateEmail(email);
        if (validation) {
          addValidationError(validation);
        } else {
          updateAccountHolder({ email });
        }
      } else {
        addValidationError({ field: 'email', message: 'Please provide a valid email address' });
      }
    } else if (accountHolder.isAccountHolder === undefined) {
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes('yes')) {
        updateAccountHolder({ isAccountHolder: true });
      } else if (lowerMessage.includes('no')) {
        updateAccountHolder({ isAccountHolder: false });
      }
    }
  };

  const handlePremiseDetailsCollection = async (message: string) => {
    const premise = conversation.premise || {};

    if (!premise.postalCode) {
      const postalCode = extractDataFromMessage(message, 'postalCode');
      if (postalCode) {
        const validation = validatePostalCode(postalCode);
        if (validation) {
          addValidationError(validation);
        } else {
          updatePremise({ postalCode });
        }
      } else {
        addValidationError({ field: 'postalCode', message: 'Please provide a valid 6-digit postal code' });
      }
    } else if (!premise.unitNumber) {
      const unitNumber = extractDataFromMessage(message, 'unitNumber');
      if (unitNumber) {
        const validation = validateUnitNumber(unitNumber);
        if (validation) {
          addValidationError(validation);
        } else {
          updatePremise({ unitNumber });
        }
      } else {
        addValidationError({ field: 'unitNumber', message: 'Please provide unit number in format XX-XXX (e.g., 01-123)' });
      }
    } else if (!premise.blockNumber) {
      const blockNumber = message.trim();
      const validation = validateRequired(blockNumber, 'Block number');
      if (validation) {
        addValidationError(validation);
      } else {
        updatePremise({ blockNumber });
      }
    } else if (premise.buildingName === undefined) {
      const buildingName = message.trim().toLowerCase() === 'none' ? '' : message.trim();
      updatePremise({ buildingName });
    } else if (!premise.streetName) {
      const streetName = message.trim();
      const validation = validateRequired(streetName, 'Street name');
      if (validation) {
        addValidationError(validation);
      } else {
        updatePremise({ streetName });
      }
    } else if (!premise.premiseType) {
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes('owner')) {
        updatePremise({ premiseType: 'Owner' });
      } else if (lowerMessage.includes('tenant')) {
        updatePremise({ premiseType: 'Tenant' });
      }
    } else if (premise.mailingAddressSame === undefined) {
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes('yes')) {
        updatePremise({ mailingAddressSame: true });
      } else if (lowerMessage.includes('no')) {
        updatePremise({ mailingAddressSame: false });
      }
    }
  };

  const handleStartDateCollection = async (message: string) => {
    const lowerMessage = message.toLowerCase();

    if (conversation.customerType === 'SP') {
      if (lowerMessage.includes('fine') || lowerMessage.includes('good') || lowerMessage.includes('ok') || lowerMessage.includes('yes')) {
        const startDate = formatDate(calculateWorkingDaysFromToday(14));
        setStartDate(startDate);
      }
    } else {
      if (lowerMessage.includes('yes') || lowerMessage.includes('confirm') || lowerMessage.includes('correct')) {
        if (conversation.contractEndDate) {
          const endDate = new Date(conversation.contractEndDate);
          endDate.setDate(endDate.getDate() + 1);
          setStartDate(formatDate(endDate));
        }
      }
    }
  };

  const handleInsuranceSelection = (message: string) => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('no') || lowerMessage.includes('decline')) {
      setInsurance({ optedIn: false });
    } else if (lowerMessage.includes('yes')) {
      let insuranceType: InsuranceType = 'Personal Accident';

      if (lowerMessage.includes('home')) {
        insuranceType = 'Home';
      } else if (lowerMessage.includes('travel')) {
        insuranceType = 'Travel';
      } else if (lowerMessage.includes('personal') || lowerMessage.includes('accident')) {
        insuranceType = 'Personal Accident';
      }

      setInsurance({ optedIn: true, type: insuranceType });
    }
  };

  return {
    processUserMessage,
    isLoading,
    conversation
  };
};