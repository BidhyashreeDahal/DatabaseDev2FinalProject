import { customerRepository } from "../repositories/customerRepository.js";

const MAX_LENGTHS = {
  firstName: 35,
  lastName: 35,
  email: 35,
  phone: 15,
  notes: 300,
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+()\-\s]+$/;

function validationError(message) {
  return Object.assign(new Error(message), { statusCode: 400 });
}

function requireString(value, fieldLabel) {
  if (typeof value !== "string") {
    throw validationError(`${fieldLabel} must be a string`);
  }
  return value.trim();
}

function validateRequiredName(value, fieldLabel, maxLength) {
  if (!value) {
    throw validationError(`${fieldLabel} is required`);
  }
  if (value.length > maxLength) {
    throw validationError(`${fieldLabel} must be at most ${maxLength} characters`);
  }
  return value;
}

function validateOptionalEmail(value) {
  if (!value) return null;
  if (value.length > MAX_LENGTHS.email) {
    throw validationError(`Email must be at most ${MAX_LENGTHS.email} characters`);
  }
  if (!EMAIL_REGEX.test(value)) {
    throw validationError("Enter a valid email address");
  }
  return value;
}

function validateOptionalPhone(value) {
  if (!value) return null;
  if (value.length > MAX_LENGTHS.phone) {
    throw validationError(`Phone must be at most ${MAX_LENGTHS.phone} characters`);
  }
  if (!PHONE_REGEX.test(value)) {
    throw validationError("Phone can only contain digits, spaces, +, -, and parentheses");
  }
  return value;
}

function validateOptionalNotes(value) {
  if (!value) return null;
  if (value.length > MAX_LENGTHS.notes) {
    throw validationError(`Notes must be at most ${MAX_LENGTHS.notes} characters`);
  }
  return value;
}

function formatName(firstName, lastName) {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}

function toListCustomer(customer) {
  const lastSale = customer.sales
    .map((s) => s.sales_date)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

  return {
    customerId: customer.customer_id,
    name: formatName(customer.first_name, customer.last_name),
    email: customer.email,
    phone: customer.phone,
    purchases: customer.sales.length,
    lastPurchase: lastSale ? new Date(lastSale).toISOString() : null,
  };
}

function toDetailCustomer(customer) {
  const lastSale = customer.sales
    .map((s) => s.sales_date)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

  return {
    customerId: customer.customer_id,
    firstName: customer.first_name,
    lastName: customer.last_name,
    name: formatName(customer.first_name, customer.last_name),
    email: customer.email,
    phone: customer.phone,
    notes: customer.notes,
    createdDate: customer.created_date ? new Date(customer.created_date).toISOString() : null,
    purchases: customer.sales.length,
    lastPurchase: lastSale ? new Date(lastSale).toISOString() : null,
    sales: customer.sales.map((sale) => ({
      salesId: sale.sales_id,
      itemId: sale.item_id,
      salePrice: sale.sale_price == null ? null : Number(sale.sale_price),
      salesDate: sale.sales_date ? new Date(sale.sales_date).toISOString() : null,
    })),
  };
}

export const customerService = {
  async listCustomers(filters = {}) {
    const customers = await customerRepository.findMany(filters);
    return customers.map(toListCustomer);
  },

  async getCustomer(id) {
    const customer = await customerRepository.findById(id);
    return toDetailCustomer(customer);
  },

  async createCustomer(payload = {}) {
    const firstName = validateRequiredName(
      requireString(payload.firstName ?? "", "First name"),
      "First name",
      MAX_LENGTHS.firstName
    );
    const lastName = validateRequiredName(
      requireString(payload.lastName ?? "", "Last name"),
      "Last name",
      MAX_LENGTHS.lastName
    );

    const email = validateOptionalEmail(requireString(payload.email ?? "", "Email"));
    const phone = validateOptionalPhone(requireString(payload.phone ?? "", "Phone"));
    const notes = validateOptionalNotes(requireString(payload.notes ?? "", "Notes"));

    const created = await customerRepository.create({
      first_name: firstName,
      last_name: lastName,
      email: email || null,
      phone: phone || null,
      notes: notes || null,
      created_date: new Date(),
    });

    return toDetailCustomer({ ...created, sales: created.sales || [] });
  },

  async updateCustomer(id, payload = {}) {
    await customerRepository.findById(id);

    const updateData = {};

    if (Object.prototype.hasOwnProperty.call(payload, "firstName")) {
      const firstName = validateRequiredName(
        requireString(payload.firstName, "First name"),
        "First name",
        MAX_LENGTHS.firstName
      );
      updateData.first_name = firstName;
    }

    if (Object.prototype.hasOwnProperty.call(payload, "lastName")) {
      const lastName = validateRequiredName(
        requireString(payload.lastName, "Last name"),
        "Last name",
        MAX_LENGTHS.lastName
      );
      updateData.last_name = lastName;
    }

    if (Object.prototype.hasOwnProperty.call(payload, "email")) {
      const email = validateOptionalEmail(requireString(payload.email, "Email"));
      updateData.email = email;
    }

    if (Object.prototype.hasOwnProperty.call(payload, "phone")) {
      const phone = validateOptionalPhone(requireString(payload.phone, "Phone"));
      updateData.phone = phone;
    }

    if (Object.prototype.hasOwnProperty.call(payload, "notes")) {
      const notes = validateOptionalNotes(requireString(payload.notes, "Notes"));
      updateData.notes = notes;
    }

    if (Object.keys(updateData).length === 0) {
      throw Object.assign(new Error("No valid fields provided for update"), { statusCode: 400 });
    }

    const updated = await customerRepository.update(id, updateData);
    return toDetailCustomer(updated);
  },

  async deleteCustomer(id) {
    await customerRepository.findById(id);
    await customerRepository.delete(id);
    return true;
  },
};