import {
  Resolver,
  Query,
  Mutation,
  Arg,
  ObjectType,
  Field,
  Ctx,
  UseMiddleware,
  Int
} from "type-graphql";
import { User } from "./entity/User";
import { hash, compare } from "bcryptjs";
import { MyContext } from "./MyContext";
import { createAccessToken, createRefreshToken } from "./auth";
import { isAuth } from "./isAuth";
import { sendRefreshToken } from "./sendRefreshToken";
import { getConnection } from "typeorm";

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;
}

@Resolver()
export class UserResolver {
  @Query(() => String)
  // This will run on every request
  @UseMiddleware(isAuth)
  bye(@Ctx() { payload }: MyContext) {
    // payload will always be there, if it's not it would fail in the isAuth middleware before we get to this point
    return `your used id is ${payload!.userId}`;
  }

  // This will return User(s) entity defined in /entity/User
  @Query(() => [User])
  users() {
    return User.find();
  }

  @Mutation(() => Boolean)
  async register(
    @Arg("email") email: string,
    @Arg("password") password: string
  ) {
    const hashedPassword = await hash(password, 12);
    try {
      await User.insert({
        email,
        password: hashedPassword
      });
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  // NOTE: This should not actually be exposed to Graphql, this is for testing purposes only
  @Mutation(() => Boolean)
  async revokeRefreshTokensForUser(@Arg("userId", () => Int) userId: number) {
    // Increment the tokenVersion of the user to invalidate their token
    await getConnection()
      .getRepository(User)
      .increment({ id: userId }, "tokenVersion", 1);

    return true;
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { res }: MyContext
  ): Promise<LoginResponse> {
    // First find if the user exists
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error("could not find user");
    }

    // Check if provided password is correct
    const valid = await compare(password, user.password);

    if (!valid) {
      throw new Error("invalid password");
    }

    // Login successful
    // Set the refresh token. It will expire after 7 days of user inactivity.
    sendRefreshToken(res, createRefreshToken(user));

    return {
      accessToken: createAccessToken(user)
    };
  }
}
