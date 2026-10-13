import type { Request, Response } from "express";
import type {
  CreateAccountInput,
  UpdateAccountInput,
} from "../schemas/account-schema.js";
import { AccountService } from "../services/account-service.js";

function getParamId(req: Request): string {
  const value = req.params.id;

  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value;
}

export class AccountController {
  constructor(private readonly service: AccountService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const account = await this.service.create(
      req.body as CreateAccountInput,
    );

    res.status(201).json({
      success: true,
      data: account,
    });
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const account = await this.service.getById(
      getParamId(req),
    );

    res.json({
      success: true,
      data: account,
    });
  };

  getByEmail = async (req: Request, res: Response): Promise<void> => {
    const account = await this.service.getByEmail(
      String(req.query.email ?? ""),
    );

    res.json({
      success: true,
      data: account,
    });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const account = await this.service.update(
      getParamId(req),
      req.body as UpdateAccountInput,
    );

    res.json({
      success: true,
      data: account,
    });
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    await this.service.delete(getParamId(req));

    res.status(204).send();
  };

  list = async (_req: Request, res: Response): Promise<void> => {
    const accounts = await this.service.list();

    res.json({
      success: true,
      data: accounts,
    });
  };
}
