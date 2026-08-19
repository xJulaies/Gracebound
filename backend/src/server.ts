import { createApp } from "./app";
import { settings } from "./config/settings";
import { connectMongoDB } from "./db";
import { createClerkAuthentication } from "./infrastructure/auth/authentication";

const port = settings.PORT;
const app = createApp(createClerkAuthentication());

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
