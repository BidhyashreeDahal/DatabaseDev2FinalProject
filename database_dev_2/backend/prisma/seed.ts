import 'dotenv/config';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from '../generated/prisma/client';
import bcrypt from "bcryptjs";

// 2. Grab the URL and force it to be a clean string
const rawConnectionString = (process.env.DIRECT_URL || process.env.DATABASE_URL || "").trim();
const connectionString = rawConnectionString.replace(/^["']|["']$/g, "");

if (!connectionString) {
  throw new Error("❌ DATABASE_URL or DIRECT_URL is missing from .env");
}

// 3. Pass the string DIRECTLY (not as an object property)
// This is a workaround for the 'localhost' fallback bug
const pool = new Pool({ connectionString: connectionString }); 

const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

// ... rest of your main() function
async function main() {

  console.log('--- Cleaning up database ---');
  // Reset seeded tables in one pass to avoid FK-order issues.
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "sales",
      "acquisition",
      "price_history",
      "provenance",
      "book",
      "map",
      "periodical",
      "item",
      "user",
      "role",
      "author",
      "cartographer",
      "publisher",
      "payment_method",
      "customer_address",
      "address",
      "customer",
      "dealer",
      "collector",
      "estate",
      "source"
    RESTART IDENTITY CASCADE
  `);
  console.log('--- Cleanup complete ---');


  // AUTHORS
  const tolkien  = await prisma.author.create({ data: { name: 'J.R.R. Tolkien' }})
  const dickens  = await prisma.author.create({ data: { name: 'Charles Dickens' }})
  const shelley  = await prisma.author.create({ data: { name: 'Mary Shelley' }})
  const austen   = await prisma.author.create({ data: { name: 'Jane Austen' }})

  // CARTOGRAPHERS
  const arrowsmith = await prisma.cartographer.create({ data: { name: 'John Arrowsmith' }})
  const moll       = await prisma.cartographer.create({ data: { name: 'Herman Moll' }})

  // PUBLISHERS
  const allenUnwin   = await prisma.publisher.create({ data: { name: 'George Allen & Unwin' }})
  const chapmanHall  = await prisma.publisher.create({ data: { name: 'Chapman and Hall' }})
  const lackington   = await prisma.publisher.create({ data: { name: 'Lackington, Hughes' }})
  const egerton      = await prisma.publisher.create({ data: { name: 'T. Egerton' }})
  const arrowsmithCo = await prisma.publisher.create({ data: { name: 'John Arrowsmith & Co.' }})

  // AUTH ROLES + USERS
  const adminRole = await prisma.role.create({
    data: { role_name: "admin", description: "System administrator" },
  });
  const managerRole = await prisma.role.create({
    data: { role_name: "manager", description: "Store manager" },
  });
  const employeeRole = await prisma.role.create({
    data: { role_name: "employee", description: "Store employee" },
  });

  const connorPassword = await bcrypt.hash("Connor123!", 10);
  const luciiaPassword = await bcrypt.hash("Luciia123!", 10);
  const derekPassword = await bcrypt.hash("Derek123!", 10);

  await prisma.user.createMany({
    data: [
      {
        role_id: adminRole.role_id,
        first_name: "Connor",
        last_name: "Whyte",
        email: "connor@britannicus.local",
        password_hash: connorPassword,
        is_active: true,
        created_date: new Date(),
      },
      {
        role_id: managerRole.role_id,
        first_name: "Luciia",
        last_name: "Whyte",
        email: "luciia@britannicus.local",
        password_hash: luciiaPassword,
        is_active: true,
        created_date: new Date(),
      },
      {
        role_id: employeeRole.role_id,
        first_name: "Derek",
        last_name: "Arthurs",
        email: "derek@britannicus.local",
        password_hash: derekPassword,
        is_active: true,
        created_date: new Date(),
      },
    ],
  });

  // ITEMS
  const hobbit = await prisma.item.create({ data: {
    title: 'The Hobbit',
    description: 'First edition of Tolkien\'s beloved fantasy novel.',
    condition: 'Moderate wear on spine, foxing on title page',
    acquisition_date: new Date('2024-03-10'), acquisition_cost: 3200.00, selling_price: 5500.00,
    note: 'Dust jacket absent. Lending library stamp on inside front cover.'
  }})
  const taleOfTwoCities = await prisma.item.create({ data: {
    title: 'A Tale of Two Cities',
    description: 'First edition in original cloth.',
    condition: 'Tight binding, minor shelf wear, light toning',
    acquisition_date: new Date('2024-06-22'), acquisition_cost: 1800.00, selling_price: 3200.00,
    note: 'Ownership inscription dated 1860 on half-title page.'
  }})
  const frankenstein = await prisma.item.create({ data: {
    title: 'Frankenstein',
    description: 'Third edition of Mary Shelley\'s gothic masterpiece.',
    condition: 'Rebacked, original boards reattached, internally clean',
    acquisition_date: new Date('2023-11-05'), acquisition_cost: 4500.00, selling_price: 8000.00,
    note: 'Provenance from a London estate.'
  }})
  const prideAndPrejudice = await prisma.item.create({ data: {
    title: 'Pride and Prejudice',
    description: 'Early 19th century edition.',
    condition: 'Good condition, hinges cracked but holding',
    acquisition_date: new Date('2025-04-02'), acquisition_cost: 2200.00, selling_price: 4000.00,
    note: 'Pencil annotations throughout.'
  }})
  const britishMap = await prisma.item.create({ data: {
    title: 'Map of British North America',
    description: 'Detailed map of Canada and surrounding territories.',
    condition: 'Minor foxing at edges, central fold clean',
    acquisition_date: new Date('2023-08-18'), acquisition_cost: 700.00, selling_price: 1400.00,
    note: 'Hand-coloured. Some edge chipping not affecting image.'
  }})
  const worldMap = await prisma.item.create({ data: {
    title: 'A New Map of the World',
    description: 'Double hemisphere world map with decorative border.',
    condition: 'Age toning, small repaired tear at centrefold',
    acquisition_date: new Date('2024-02-27'), acquisition_cost: 1100.00, selling_price: 2200.00,
    note: 'Original outline colour. Laid paper with watermark visible.'
  }})
  const illustratedLondon = await prisma.item.create({ data: {
    title: 'The Illustrated London News',
    description: 'First volume of the world\'s first illustrated weekly newspaper.',
    condition: 'Some soiling to covers, contents complete',
    acquisition_date: new Date('2024-09-14'), acquisition_cost: 350.00, selling_price: 750.00,
    note: 'Issues bound together.'
  }})
  const punchMag = await prisma.item.create({ data: {
    title: 'Punch Magazine 1843',
    description: 'Bound annual collection of the satirical magazine.',
    condition: 'Spine worn, pages intact, illustrations clear',
    acquisition_date: new Date('2025-02-10'), acquisition_cost: 280.00, selling_price: 600.00,
    note: 'Contains original Punch cartoon plates.'
  }})

// 7. SOURCES
const dealerSource = await prisma.source.create({
  data: {
    name: "Rare Books Dealer Ltd",
    email: "dealer@example.com",
    phone: "1234567890",
  },
});
const collectorSource = await prisma.source.create({
  data: {
    name: "Montreal Private Collector",
    email: "collector@example.com",
    phone: "5142221199",
  },
});
const estateSource = await prisma.source.create({
  data: {
    name: "Hastings Estate Holdings",
    email: "estate@example.com",
    phone: "4167654321",
  },
});

await prisma.dealer.create({
  data: {
    source_id: dealerSource.source_id,
    specialty: "Rare first editions",
    reliability_rating: 5,
    price_range_notes: "Mid to high value inventory",
    negotiation_notes: "Bulk discounts available",
  },
});
await prisma.collector.create({
  data: {
    source_id: collectorSource.source_id,
    collecting_interests: "Victorian maps and periodicals",
    notes: "Open to yearly consignments",
  },
});
await prisma.estate.create({
  data: {
    source_id: estateSource.source_id,
    estate_name: "Hastings Family Estate",
    contact_person: "Margaret Hastings",
    notes: "Prefers complete lot appraisals",
  },
});

// 8. CUSTOMERS
const customer1 = await prisma.customer.create({
  data: {
    first_name: "Alice",
    last_name: "Johnson",
    email: "alice@example.com",
    phone: "6471234567",
    created_date: new Date()
  }
});
const customer2 = await prisma.customer.create({
  data: {
    first_name: "Bob",
    last_name: "Smith",
    email: "bob@example.com",
    phone: "4169876543",
    created_date: new Date()
  }
});
const customer3 = await prisma.customer.create({
  data: {
    first_name: "Charlie",
    last_name: "Brown",
    email: "charlie@example.com",
    phone: "4161234567",
    created_date: new Date()
  }
});
const customer4 = await prisma.customer.create({
  data: {
    first_name: "David",
    last_name: "Wilson",
    email: "david@example.com",
    phone: "4165551234",
    created_date: new Date()
  }
});

// 9. PAYMENT METHODS
const cash = await prisma.payment_method.create({
  data: { payment_method: "Cash" }
});
const creditCard = await prisma.payment_method.create({
  data: { payment_method: "Credit Card" }
});
const bankTransfer = await prisma.payment_method.create({
  data: { payment_method: "Bank Transfer" }
});

// 10. ACQUISITIONS (link source → item)
await prisma.acquisition.createMany({
  data: [
    { item_id: hobbit.item_id, source_id: dealerSource.source_id },
    { item_id: taleOfTwoCities.item_id, source_id: estateSource.source_id },
    { item_id: frankenstein.item_id, source_id: dealerSource.source_id },
    { item_id: prideAndPrejudice.item_id, source_id: collectorSource.source_id },
    { item_id: britishMap.item_id, source_id: collectorSource.source_id },
    { item_id: worldMap.item_id, source_id: estateSource.source_id },
    { item_id: illustratedLondon.item_id, source_id: dealerSource.source_id },
    { item_id: punchMag.item_id, source_id: collectorSource.source_id },
  ],
});

// 11. SALES (core business logic)
await prisma.sales.createMany({
  data: [
    {
      item_id: hobbit.item_id,
      customer_id: customer1.customer_id,
      user_id: 1,
      payment_method_id: cash.payment_method_id,
      sale_price: 5000,
      sales_date: new Date("2025-10-05"),
    },
    {
      item_id: britishMap.item_id,
      customer_id: customer2.customer_id,
      user_id: 2,
      payment_method_id: creditCard.payment_method_id,
      sale_price: 1299,
      sales_date: new Date("2026-01-14"),
    },
    {
      item_id: illustratedLondon.item_id,
      customer_id: customer3.customer_id,
      user_id: 2,
      payment_method_id: bankTransfer.payment_method_id,
      sale_price: 700,
      sales_date: new Date("2026-02-22"),
    },
  ],
});

// 12. PRICE HISTORY
await prisma.price_history.createMany({
  data: [
    { item_id: hobbit.item_id, market_value: 5200, recorded_date: new Date("2025-06-01"), source: "Sotheby's index" },
    { item_id: hobbit.item_id, market_value: 5500, recorded_date: new Date("2025-11-01"), source: "In-house appraisal" },
    { item_id: frankenstein.item_id, market_value: 7600, recorded_date: new Date("2025-09-18"), source: "Dealer comp set" },
    { item_id: worldMap.item_id, market_value: 2100, recorded_date: new Date("2026-01-03"), source: "Map fair comps" },
    { item_id: punchMag.item_id, market_value: 590, recorded_date: new Date("2026-02-01"), source: "Auction notes" },
  ],
});

// 13. PROVENANCE
await prisma.provenance.createMany({
  data: [
    {
      item_id: hobbit.item_id,
      previous_owner: "Windsor Reading Club",
      start_date: new Date("1950-01-01"),
      end_date: new Date("1988-12-31"),
      verified_status: true,
      note: "Stamped ex-libris on front pastedown",
    },
    {
      item_id: frankenstein.item_id,
      previous_owner: "Dr. E. Lang Collection",
      start_date: new Date("1928-01-01"),
      end_date: new Date("1974-12-31"),
      verified_status: true,
      note: "Documented in estate inventory",
    },
    {
      item_id: worldMap.item_id,
      previous_owner: "Bristol Nautical Archives",
      start_date: new Date("1895-01-01"),
      end_date: null,
      verified_status: false,
      note: "Attributed by marginal annotation only",
    },
  ],
});

  // BOOKS
  await prisma.book.createMany({ data: [
    { item_id: hobbit.item_id,            author_id: tolkien.author_id,  publisher_id: allenUnwin.publisher_id,  publishing_year: new Date('1937-09-21'), edition: '1st Edition', isbn: '978-0-04-823046-8', binding_type: 'Hardcover', genre: 'Fantasy' },
    { item_id: taleOfTwoCities.item_id,   author_id: dickens.author_id,  publisher_id: chapmanHall.publisher_id, publishing_year: new Date('1859-01-01'), edition: '1st Edition', isbn: '978-0-14-143960-0', binding_type: 'Hardcover', genre: 'Historical Fiction' },
    { item_id: frankenstein.item_id,      author_id: shelley.author_id,  publisher_id: lackington.publisher_id,  publishing_year: new Date('1831-01-01'), edition: '3rd Edition', isbn: '978-0-19-953979-6', binding_type: 'Hardcover', genre: 'Gothic Fiction' },
    { item_id: prideAndPrejudice.item_id, author_id: austen.author_id,   publisher_id: egerton.publisher_id,     publishing_year: new Date('1813-01-28'), edition: '1st Edition', isbn: '978-0-19-953556-9', binding_type: 'Hardcover', genre: 'Romance' },
  ]})

  // MAPS
  await prisma.map.createMany({ data: [
    { item_id: britishMap.item_id, cartographer_id: arrowsmith.cartographer_id, publisher_id: arrowsmithCo.publisher_id, publishing_year: new Date('1854-01-01'), scale: '1 inch = 50 miles', map_type: 'Political' },
    { item_id: worldMap.item_id,   cartographer_id: moll.cartographer_id,       publisher_id: arrowsmithCo.publisher_id, publishing_year: new Date('1709-01-01'), scale: null,               map_type: 'World' },
  ]})

  // PERIODICALS
  await prisma.periodical.createMany({ data: [
    { item_id: illustratedLondon.item_id, publisher_id: chapmanHall.publisher_id, issue_date: new Date('1842-05-14'), issue_number: 'Vol. 1',      subject_coverage: 'News, politics, culture, illustrations' },
    { item_id: punchMag.item_id,          publisher_id: chapmanHall.publisher_id, issue_date: new Date('1843-12-30'), issue_number: '1843 Annual', subject_coverage: 'Satire, politics, cartoons' },
  ]})

  console.log('✅ Items, books, maps and periodicals inserted successfully!')
}


main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })