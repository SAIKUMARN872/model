import type {
  Profile,
  UpdateProfileInput,
} from "../schemas/profile-schema.js";
import type { ProfileRepository } from "../repository/profile-repository.js";
import type { AccountRepository } from "../repository/account-repository.js";
import { AccountEventBus } from "../events/account-events.js";

export class ProfileService {
  constructor(
    private readonly profiles: ProfileRepository,
    private readonly accounts: AccountRepository,
    private readonly events: AccountEventBus,
  ) {}

  async get(accountId: string): Promise<Profile> {
    await this.requireAccount(accountId);

    const profile = await this.profiles.findByAccountId(accountId);

    if (!profile) {
      return this.profiles.create(accountId, "");
    }

    return profile;
  }

  async update(
    accountId: string,
    input: UpdateProfileInput,
  ): Promise<Profile> {
    const account = await this.requireAccount(accountId);

    let profile = await this.profiles.findByAccountId(accountId);

    if (!profile) {
      profile = await this.profiles.create(
        accountId,
        account.name,
      );
    }

    const updated = await this.profiles.update(accountId, input);

    if (!updated) {
      throw new Error("Unable to update profile");
    }

    this.events.publish("profile.updated", updated);

    return updated;
  }

  private async requireAccount(accountId: string) {
    const account = await this.accounts.findById(accountId);

    if (!account) {
      throw new Error("Account not found");
    }

    return account;
  }
}
