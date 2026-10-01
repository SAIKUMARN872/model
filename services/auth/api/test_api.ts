import {
  AccountController,
  type ApiResponse,
} from "./account-controller.js";

import { ProfileController } from "./profile-controller.js";

import {
  accountService,
} from "../account/index.js";

import {
  userService,
} from "../users/user.js";

function assert(
  condition: boolean,
  message: string,
): void {
  if (!condition) {
    throw new Error(message);
  }

  console.log(`PASS: ${message}`);
}

console.log("Running authentication API tests...");

accountService.clear();
userService.clear();

const accountController = new AccountController();
const profileController = new ProfileController();

/*
 * Create test user.
 */
const user = userService.create({
  email: "api-test@example.com",
  name: "API Test User",
  roles: ["user"],
});

assert(
  Boolean(user.id),
  "Test user is created",
);

/*
 * Account creation.
 */
const createAccount = accountController.create({
  userId: user.id,
  type: "user",
});

assert(
  createAccount.success,
  "Account creation succeeds",
);

assert(
  createAccount.data?.userId === user.id,
  "Account contains correct user ID",
);

const accountId = createAccount.data?.id;

assert(
  typeof accountId === "string" && accountId.length > 0,
  "Account ID is generated",
);

/*
 * Account retrieval.
 */
const account = accountController.get(accountId!);

assert(
  account.success,
  "Account retrieval succeeds",
);

assert(
  account.data?.id === accountId,
  "Account ID is correct",
);

/*
 * Get account by user ID.
 */
const accountByUser = accountController.getByUserId(user.id);

assert(
  accountByUser.success,
  "Account lookup by user ID succeeds",
);

assert(
  accountByUser.data?.userId === user.id,
  "Account lookup returns correct user",
);

/*
 * Account update.
 */
const updatedAccount = accountController.update(
  accountId!,
  {
    emailVerified: true,
    phoneVerified: true,
  },
);

assert(
  updatedAccount.success,
  "Account update succeeds",
);

assert(
  updatedAccount.data?.emailVerified === true,
  "Email verification is updated",
);

assert(
  updatedAccount.data?.phoneVerified === true,
  "Phone verification is updated",
);

/*
 * Account status changes.
 */
const inactive = accountController.deactivate(accountId!);

assert(
  inactive.success && inactive.data?.status === "inactive",
  "Account deactivation succeeds",
);

const locked = accountController.lock(accountId!);

assert(
  locked.success && locked.data?.status === "locked",
  "Account locking succeeds",
);

const suspended = accountController.suspend(accountId!);

assert(
  suspended.success && suspended.data?.status === "suspended",
  "Account suspension succeeds",
);

const active = accountController.activate(accountId!);

assert(
  active.success && active.data?.status === "active",
  "Account activation succeeds",
);

/*
 * Verification.
 */
const emailVerified = accountController.verifyEmail(accountId!);

assert(
  emailVerified.success &&
    emailVerified.data?.emailVerified === true,
  "Email verification succeeds",
);

const phoneVerified = accountController.verifyPhone(accountId!);

assert(
  phoneVerified.success &&
    phoneVerified.data?.phoneVerified === true,
  "Phone verification succeeds",
);

/*
 * Record activity.
 */
const activity = accountController.recordActivity(accountId!);

assert(
  activity.success &&
    activity.data?.lastActivityAt instanceof Date,
  "Account activity is recorded",
);

/*
 * Account listing.
 */
const accounts = accountController.list();

assert(
  accounts.success,
  "Account listing succeeds",
);

assert(
  Array.isArray(accounts.data) &&
    accounts.data.length === 1,
  "Account list contains one account",
);

/*
 * Account health.
 */
const health = accountController.health();

assert(
  health.success,
  "Account health succeeds",
);

assert(
  health.data?.healthy === true,
  "Account health is healthy",
);

/*
 * Missing account.
 */
const missingAccount = accountController.get(
  "missing-account-id",
);

assert(
  !missingAccount.success,
  "Missing account returns failure",
);

/*
 * Duplicate account prevention.
 */
const duplicateAccount = accountController.create({
  userId: user.id,
  type: "user",
});

assert(
  !duplicateAccount.success,
  "Duplicate account is rejected",
);

/*
 * Profile API.
 */
const profile = profileController.getProfile(user.id);

assert(
  profile.success,
  "Profile retrieval succeeds",
);

assert(
  profile.data?.id === user.id,
  "Profile ID is correct",
);

/*
 * Profile update.
 */
const updatedProfile = profileController.updateProfile(
  user.id,
  {
    name: "Updated API User",
    metadata: {
      source: "api-test",
    },
  },
);

assert(
  updatedProfile.success,
  "Profile update succeeds",
);

assert(
  updatedProfile.data?.name === "Updated API User",
  "Profile name is updated",
);

/*
 * Profile name update.
 */
const updatedName = profileController.updateName(
  user.id,
  "Final API User",
);

assert(
  updatedName.success &&
    updatedName.data?.name === "Final API User",
  "Profile name update succeeds",
);

/*
 * Profile email update.
 */
const updatedEmail = profileController.updateEmail(
  user.id,
  "final-api@example.com",
);

assert(
  updatedEmail.success &&
    updatedEmail.data?.email === "final-api@example.com",
  "Profile email update succeeds",
);

/*
 * Profile metadata.
 */
const updatedMetadata =
  profileController.updateMetadata(
    user.id,
    {
      environment: "test",
      source: "api",
    },
  );

assert(
  updatedMetadata.success &&
    updatedMetadata.data?.metadata.environment === "test",
  "Profile metadata update succeeds",
);

/*
 * Profile roles.
 */
const addedRole = profileController.addRole(
  user.id,
  "admin",
);

assert(
  addedRole.success === true &&
    addedRole.data !== undefined &&
    addedRole.data.roles.includes("admin"),
  "Profile role addition succeeds",
);

const removedRole = profileController.removeRole(
  user.id,
  "admin",
);

assert(
  removedRole.success &&
    !removedRole.data?.roles.includes("admin"),
  "Profile role removal succeeds",
);

/*
 * Profile login.
 */
const loginProfile = profileController.recordLogin(
  user.id,
);

assert(
  loginProfile.success &&
    loginProfile.data?.lastLoginAt instanceof Date,
  "Profile login activity succeeds",
);

/*
 * Missing profile.
 */
const missingProfile =
  profileController.getProfile(
    "missing-user-id",
  );

assert(
  !missingProfile.success,
  "Missing profile returns failure",
);

/*
 * Account deletion.
 */
const deleted = accountController.delete(
  accountId!,
);

assert(
  deleted.success && deleted.data === true,
  "Account deletion succeeds",
);

const deletedLookup =
  accountController.get(accountId!);

assert(
  !deletedLookup.success,
  "Deleted account cannot be retrieved",
);

console.log("All authentication API tests passed.");

