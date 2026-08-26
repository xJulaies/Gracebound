import mongoose from "mongoose";
import {
  MongoMemoryReplSet,
  MongoMemoryServer,
} from "mongodb-memory-server";
import { afterAll, afterEach, beforeAll } from "vitest";

export function useMongoMemoryServer(options?: { replicaSet?: boolean }) {
  let mongoServer: MongoMemoryServer | MongoMemoryReplSet;

  beforeAll(async () => {
    mongoServer = options?.replicaSet
      ? await MongoMemoryReplSet.create({ replSet: { count: 1 } })
      : await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri("gracebound_test"));
  }, 60_000);

  afterEach(async () => {
    const collections = await mongoose.connection.db
      ?.listCollections({}, { nameOnly: true })
      .toArray();

    await Promise.all(
      (collections ?? []).map(({ name }) =>
        mongoose.connection.db?.collection(name).deleteMany({}),
      ),
    );
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
}
