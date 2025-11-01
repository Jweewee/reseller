import { addDays, isWeekend, format, isAfter, isBefore } from 'date-fns';
import type { ValidationError } from '../types';

export const validateNRIC = (nric: string): ValidationError | null => {
  const nricRegex = /^[STFG]\d{7}[A-Z]$/i;

  if (!nric) {
    return { field: 'nric', message: 'NRIC is required' };
  }

  if (!nricRegex.test(nric.toUpperCase())) {
    return {
      field: 'nric',
      message: 'Please provide a valid NRIC format (e.g., S1234567A)'
    };
  }

  return null;
};

export const validatePostalCode = (postalCode: string): ValidationError | null => {
  const postalCodeRegex = /^\d{6}$/;

  if (!postalCode) {
    return { field: 'postalCode', message: 'Postal code is required' };
  }

  if (!postalCodeRegex.test(postalCode)) {
    return {
      field: 'postalCode',
      message: 'Please provide a valid 6-digit Singapore postal code'
    };
  }

  return null;
};

export const validateMobile = (mobile: string): ValidationError | null => {
  const mobileRegex = /^[89]\d{7}$/;

  if (!mobile) {
    return { field: 'mobile', message: 'Mobile number is required' };
  }

  if (!mobileRegex.test(mobile)) {
    return {
      field: 'mobile',
      message: 'Please provide a valid 8-digit mobile number starting with 8 or 9'
    };
  }

  return null;
};

export const validateEmail = (email: string): ValidationError | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    return { field: 'email', message: 'Email address is required' };
  }

  if (!emailRegex.test(email)) {
    return {
      field: 'email',
      message: 'Please provide a valid email address'
    };
  }

  return null;
};

export const validateDateOfBirth = (dateOfBirth: string): ValidationError | null => {
  const dateRegex = /^\d{2}-\d{2}-\d{4}$/;

  if (!dateOfBirth) {
    return { field: 'dateOfBirth', message: 'Date of birth is required' };
  }

  if (!dateRegex.test(dateOfBirth)) {
    return {
      field: 'dateOfBirth',
      message: 'Please provide date in DD-MM-YYYY format'
    };
  }

  const [day, month, year] = dateOfBirth.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
    return {
      field: 'dateOfBirth',
      message: 'Please provide a valid date'
    };
  }

  if (isAfter(date, new Date())) {
    return {
      field: 'dateOfBirth',
      message: 'Date of birth cannot be in the future'
    };
  }

  const hundredYearsAgo = new Date();
  hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);

  if (isBefore(date, hundredYearsAgo)) {
    return {
      field: 'dateOfBirth',
      message: 'Please provide a valid date of birth'
    };
  }

  return null;
};

export const validateStartDate = (startDate: string, customerType: 'SP' | 'RETAILER'): ValidationError | null => {
  if (!startDate) {
    return { field: 'startDate', message: 'Start date is required' };
  }

  const selectedDate = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (customerType === 'SP') {
    const minStartDate = calculateWorkingDaysFromToday(14);

    if (isBefore(selectedDate, minStartDate)) {
      return {
        field: 'startDate',
        message: `The earliest transfer date is 14 working days from today: ${format(minStartDate, 'dd MMM yyyy')}`
      };
    }
  }

  return null;
};

export const extractLast4NRIC = (nric: string): string => {
  if (nric.length < 4) return nric;
  return `***${nric.slice(-4).toUpperCase()}`;
};

export const calculateWorkingDaysFromToday = (workingDays: number): Date => {
  let currentDate = new Date();
  let daysAdded = 0;

  while (daysAdded < workingDays) {
    currentDate = addDays(currentDate, 1);

    if (!isWeekend(currentDate)) {
      daysAdded++;
    }
  }

  return currentDate;
};

export const calculateStartDateFromContractEnd = (contractEndDate: string): Date => {
  const endDate = new Date(contractEndDate);
  return addDays(endDate, 1);
};

export const formatDate = (date: Date): string => {
  return format(date, 'dd MMM yyyy');
};

export const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'dd MMM yyyy');
};

export const isValidName = (name: string): boolean => {
  return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name.trim());
};

export const validateFullName = (name: string): ValidationError | null => {
  if (!name) {
    return { field: 'fullName', message: 'Full name is required' };
  }

  if (!isValidName(name)) {
    return {
      field: 'fullName',
      message: 'Please provide a valid full name (letters and spaces only)'
    };
  }

  return null;
};

export const validateUnitNumber = (unitNumber: string): ValidationError | null => {
  const unitRegex = /^\d{2}-\d{3,4}$/;

  if (!unitNumber) {
    return { field: 'unitNumber', message: 'Unit number is required' };
  }

  if (!unitRegex.test(unitNumber)) {
    return {
      field: 'unitNumber',
      message: 'Please provide unit number in format XX-XXX or XX-XXXX (e.g., 01-123)'
    };
  }

  return null;
};

export const validateRequired = (value: string, fieldName: string): ValidationError | null => {
  if (!value || value.trim().length === 0) {
    return { field: fieldName, message: `${fieldName} is required` };
  }
  return null;
};