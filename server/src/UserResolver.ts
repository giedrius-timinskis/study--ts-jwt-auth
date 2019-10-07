import { Resolver, Query, Mutation, Arg } from "type-graphql";
import { User } from "./entity/User";
import { hash, compare } from "bcryptjs";

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return "hi!";
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

  @Mutation(() => Boolean)
  async login(@Arg("email") email: string, @Arg("password") password: string) {
    // First find if the user exists
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error("could not find user");
    }

    // Check if provided password is corect
    const valid = compare(password, user.password);

    if (!valid) {
      throw new Error("invalid password");
    }

    // Login successful

    return true;
  }
}
