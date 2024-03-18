import prisma from "./src/db/db";



// create a new user
await prisma.user.create({
  data: {
    name: "John Dough",
    email: `john-${Math.random()}@example.com`,
    password: "password",
  },
});

// read all users
const allUsers = await prisma.user.findMany();
console.table(allUsers);
