import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./UserResolver";
import { createConnection } from "typeorm";
import cookieParser from "cookie-parser";

import { verify } from "jsonwebtoken";

import {
  REFRESH_JWT_SECRET,
  createAccessToken,
  createRefreshToken
} from "./auth";
import { User } from "./entity/User";
import { sendRefreshToken } from "./sendRefreshToken";

(async () => {
  const app = express();

  app.use(cookieParser());

  app.get("/", (_req, res) => res.send("Hi"));

  app.post("/refresh_token", async (req, res) => {
    const token = req.cookies.jid;
    if (!token) {
      return res.send({ ok: false, accessToken: "" });
    }

    let payload: any = null;

    try {
      // Make sure token is valid, and not expired
      payload = verify(token, REFRESH_JWT_SECRET);
    } catch (e) {
      console.log(e);
      return res.send({ ok: false, accessToken: "" });
    }

    // Token is valid and we can send back an access token
    const user = await User.findOne({ id: payload.userId });
    if (!user) {
      return res.send({ ok: false, accessToken: "" });
    }

    // If DB user's token version is not the same as token version in the payload, invalidate the token
    if (user.tokenVersion !== payload.tokenVersion) {
      return res.send({ ok: false, accessToken: "" });
    }

    // Set the refresh token. It will expire after 7 days of user inactivity.
    sendRefreshToken(res, createRefreshToken(user));
    // Return the access token
    return res.send({ ok: true, accessToken: createAccessToken(user) });
  });

  await createConnection();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver]
    }),
    context: ({ req, res }) => ({ req, res })
  });

  apolloServer.applyMiddleware({ app });
  app.listen(4000, () => {
    console.log("Express server started at port 4000");
  });
})();
