import { User } from "../customTypes";

declare global {
  namespace Express {
    export interface Request {
      user: User;
    }
  }
}
