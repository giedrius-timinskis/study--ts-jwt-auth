import { User } from "./entity/User";
import { sign } from "jsonwebtoken";

export const REFRESH_JWT_SECRET = "thisisarefreshrandomstring"; // This should come from env variables
export const ACCESS_JWT_SECRET = "thisisanaccessrandomstring"; // This should come from env variables

export const createAccessToken = (user: User) => {
  return sign({ userId: user.id }, ACCESS_JWT_SECRET, { expiresIn: "15m" }); // This token will be refreshed often
};

export const createRefreshToken = (user: User) => {
  return sign({ userId: user.id }, REFRESH_JWT_SECRET, {
    expiresIn: "7d"
  }); // This cookie expiring will force the user to relog, so has to be longer
};
