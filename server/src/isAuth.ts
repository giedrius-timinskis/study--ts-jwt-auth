import { MiddlewareFn } from "type-graphql";
import { MyContext } from "./MyContext";
import { verify } from "jsonwebtoken";
import { ACCESS_JWT_SECRET } from "./auth";

// This function will run on every request
export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  // Should look like
  // Bearer 123456asdfgh01
  const authorization = context.req.headers["authorization"];

  if (!authorization) {
    throw new Error("not authenticated");
  }
  try {
    // We don't care about the Bearer part here
    const token = authorization.split(" ")[1];
    // Check that the acccess token is valid
    const payload = verify(token, ACCESS_JWT_SECRET);

    // If the access token is verified, pass the payload to context.payload, so it's available to Graphql requests via context
    context.payload = payload as any;
  } catch (e) {
    console.log(e);
    throw new Error("not authenticated");
  }
  return next();
};
