import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./UserResolver";
import { createConnection } from "typeorm";
// import { User } from "./entity/User";

(async () => {
  const app = express();

  app.get("/", (_req, res) => res.send("Hi"));

  await createConnection();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver]
    })
  });

  apolloServer.applyMiddleware({ app });
  app.listen(4000, () => {
    console.log("Express server started at port 4000");
  });
})();
