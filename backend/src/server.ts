import { app } from "./app";
import { initDatabase } from "./database/init";

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "127.0.0.1";

initDatabase()
  .then(() => {
    const server = app.listen(port, host, () => {
      console.log(`Backend server running at http://${host}:${port}`);
    });

    server.on("error", (error) => {
      throw error;
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database", error);
    process.exit(1);
  });
