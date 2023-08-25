import { Response } from "express";

export const StatusService = {
  OK(res: Response, options?: any) {
    return res.status(200).send(options);
  },

  UnprocessableEntity(
    res: Response,
    options: {
      verified?: boolean;
      error: string;
    }
  ) {
    return res.status(422).send(options);
  },

  InternalServerError(res: Response, error: Error) {
    console.log(error);

    return res.status(500).send({ error: error.message, code: "00168" });
  },
};
