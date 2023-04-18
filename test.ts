import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("> Hello world");

  const results = await prisma.job.count({
    where: {
      RunTime: {
        gt: 0,
      },
    },
  });

  console.log("> results: ", results);
}

main();
