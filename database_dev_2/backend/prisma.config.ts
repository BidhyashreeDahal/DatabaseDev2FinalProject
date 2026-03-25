import "dotenv/config"
import { defineConfig } from "prisma/config"

export default defineConfig({
  migrations: {
    // This command triggers when you run 'npx prisma db seed'
    seed: 'tsx prisma/seed.ts', 
  },
  datasource: {
    // Use the pooled URL to help with connection stability
    url: process.env.DATABASE_URL, 
  },
})