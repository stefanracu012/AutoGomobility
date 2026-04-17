import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

async function main() {
  const bookings = await p.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: 3,
    select: {
      id: true,
      clientName: true,
      status: true,
      driverToken: true,
      token: true,
      driverOnline: true,
      driverLat: true,
      driverLon: true,
    },
  });
  console.log(JSON.stringify(bookings, null, 2));
  await p.$disconnect();
}
main();
