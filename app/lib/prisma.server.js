// Prisma client reutilizable en Vercel/Remix (JS, ESM)
// Requiere: npm i @prisma/client (y haber ejecutado `npx prisma generate`)
import { PrismaClient } from "@prisma/client";


let prisma;


// Evita instancias duplicadas en dev (HMR) y en funciones serverless
if (process.env.NODE_ENV === "production") {
prisma = new PrismaClient();
} else {
// Nota: usar propiedad global con nombre poco probable para colisiones
if (!global.__PRISMA__) global.__PRISMA__ = new PrismaClient();
prisma = global.__PRISMA__;
}


export { prisma };