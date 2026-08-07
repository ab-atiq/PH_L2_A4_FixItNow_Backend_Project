import "dotenv/config";
import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";

const PORT = config.port;

// async function main() {
//   try {
//     await prisma.$connect();
//     console.log("Connected to the database successfully.");
//     if (config.node_env === "development") {
//       app.listen(PORT, () => {
//         console.log(`Server is running on port ${PORT}`);
//       });
//     } else {
//       console.log("Server is running in production mode");
//     }
//   } catch (error) {
//     console.error("Error starting the server:", error);
//     await prisma.$disconnect();
//     process.exit(1);
//   }
// }

// main();

if (config.node_env === "development") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;