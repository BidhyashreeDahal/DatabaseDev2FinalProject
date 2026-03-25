import 'dotenv/config';
import ws from 'ws';
import { neonConfig, Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '../src/generated/prisma/client';

// 1. Assign WebSocket for Port 443 tunneling
neonConfig.webSocketConstructor = ws;

// 2. Grab the URL and force it to be a clean string
const connectionString = (process.env.DIRECT_URL || process.env.DATABASE_URL || "").trim();

if (!connectionString) {
  throw new Error("❌ DATABASE_URL or DIRECT_URL is missing from .env");
}

// 3. Pass the string DIRECTLY (not as an object property)
// This is a workaround for the 'localhost' fallback bug
const pool = new Pool({ connectionString: connectionString }); 

const adapter = new PrismaNeon(pool as any);
const prisma = new PrismaClient({ adapter });

// ... rest of your main() function
async function main() {

  console.log('--- Cleaning up database ---');
  // Delete in reverse order of dependencies to avoid foreign key errors
  await prisma.book.deleteMany();
  await prisma.map.deleteMany();
  await prisma.periodical.deleteMany();
  await prisma.item.deleteMany();
  await prisma.author.deleteMany();
  await prisma.cartographer.deleteMany();
  await prisma.publisher.deleteMany();
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