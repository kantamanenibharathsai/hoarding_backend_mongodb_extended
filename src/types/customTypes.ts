import exp from "constants";

export type User = {
  id: string;
  email: string;
  role: string;
};

type ErrorMessage = { message: string };
export type ErrorT = ErrorMessage[];
