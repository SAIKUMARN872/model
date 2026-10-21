import type { Request, Response } from "express";
import type { UpdateProfileInput } from "../schemas/profile-schema.js";
import { ProfileService } from "../services/profile-service.js";

function getParamId(req: Request): string {
  const value = req.params.id;

  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value;
}

export class ProfileController {
  constructor(private readonly service: ProfileService) {}

  get = async (req: Request, res: Response): Promise<void> => {
    const profile = await this.service.get(
      getParamId(req),
    );

    res.json({
      success: true,
      data: profile,
    });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const profile = await this.service.update(
      getParamId(req),
      req.body as UpdateProfileInput,
    );

    res.json({
      success: true,
      data: profile,
    });
  };
}
