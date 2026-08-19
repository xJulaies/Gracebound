import { app } from "./app";
import { settings } from "./config/settings";
import { connectMongoDB } from "./db";

const port = Number(settings.PORT ?? 3000);

async function startServer() {
  try {
    await connectMongoDB();
    app.listen(port, () => {
      console.log(`Server booted on port ${port}`);
    });
  } catch (error) {
    console.error("Server boot failed", error);
    process.exit(1);
  }
}

void startServer();
