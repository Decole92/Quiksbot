import { initEdgeStore } from "@edgestore/server";
import { initEdgeStoreClient } from "@edgestore/server/core";

const es = initEdgeStore.create();

const edgeStoreRouter = es.router({
  myPublicImages: es.imageBucket(),
  // Add other buckets as needed
});

export const backendClient = initEdgeStoreClient({
  router: edgeStoreRouter,
});
