export type CustomerFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
};

export type CustomerFormErrors = Partial<Record<keyof CustomerFormData, string>>;

export const CUSTOMER_MAX_LENGTHS = {
  firstName: 35,
  lastName: 35,
  email: 35,
  phone: 15,
  notes: 300,
};

export function validateCustomerForm(values: CustomerFormData): CustomerFormErrors {
  const errors: CustomerFormErrors = {};

  if (!values.firstName.trim()) {
    errors.firstName = "First name is required";
  } else if (values.firstName.trim().length > CUSTOMER_MAX_LENGTHS.firstName) {
    errors.firstName = `First name must be at most ${CUSTOMER_MAX_LENGTHS.firstName} characters`;
  }

  if (!values.lastName.trim()) {
    errors.lastName = "Last name is required";
  } else if (values.lastName.trim().length > CUSTOMER_MAX_LENGTHS.lastName) {
    errors.lastName = `Last name must be at most ${CUSTOMER_MAX_LENGTHS.lastName} characters`;
  }

  const email = values.email.trim();
  if (email.length > CUSTOMER_MAX_LENGTHS.email) {
    errors.email = `Email must be at most ${CUSTOMER_MAX_LENGTHS.email} characters`;
  } else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address";
  }

  const phone = values.phone.trim();
  if (phone.length > CUSTOMER_MAX_LENGTHS.phone) {
    errors.phone = `Phone must be at most ${CUSTOMER_MAX_LENGTHS.phone} characters`;
  } else if (phone && !/^[0-9+()\-\s]+$/.test(phone)) {
    errors.phone = "Phone can only contain digits, spaces, +, -, and parentheses";
  }

  if (values.notes.trim().length > CUSTOMER_MAX_LENGTHS.notes) {
    errors.notes = `Notes must be at most ${CUSTOMER_MAX_LENGTHS.notes} characters`;
  }

  return errors;
}

export function normalizeCustomerForm(values: CustomerFormData): CustomerFormData {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    notes: values.notes.trim(),
  };
}