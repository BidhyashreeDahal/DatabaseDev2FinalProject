import { db } from "../lib/db";

export const customerRepository = {
  async findMany(filters = {}) {
    const search = (filters.search || "").trim();

    return db.customer.findMany({
      where: search
        ? {
            OR: [
              { first_name: { contains: search, mode: "insensitive" } },
              { last_name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      include: {
        sales: {
          select: { sales_date: true },
        },
      },
      orderBy: { customer_id: "desc" },
      take: 50,
    });
  },

  async findById(id) {
    const customer = await db.customer.findUnique({
      where: { customer_id: id },
      include: {
        sales: {
          select: {
            sales_id: true,
            sales_date: true,
            sale_price: true,
            item_id: true,
          },
          orderBy: { sales_date: "desc" },
        },
      },
    });

    if (!customer) {
      const error = new Error(`Customer with id ${id} not found`);
      error.statusCode = 404;
      throw error;
    }

    return customer;
  },

  async create(data) {
    return db.customer.create({
      data,
      include: {
        sales: {
          select: { sales_id: true },
        },
      },
    });
  },

  async update(id, data) {
    return db.customer.update({
      where: { customer_id: id },
      data,
      include: {
        sales: {
          select: {
            sales_id: true,
            sales_date: true,
            sale_price: true,
            item_id: true,
          },
          orderBy: { sales_date: "desc" },
        },
      },
    });
  },

  async delete(id) {
    return db.customer.delete({
      where: { customer_id: id },
    });
  },
};