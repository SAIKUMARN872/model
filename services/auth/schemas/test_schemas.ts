import {
  assertValidAccount,
  assertValidProfile,
  isValidAccount,
  isValidCreateAccount,
  isValidCreateProfile,
  isValidProfile,
  isValidUpdateAccount,
  isValidUpdateProfile,
  validateAccount,
  validateCreateAccount,
  validateCreateProfile,
  validateProfile,
  validateUpdateAccount,
  validateUpdateProfile,
} from "./index.js";

let passed = 0;

function assert(
  condition: boolean,
  message: string,
): void {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }

  console.log(`PASS: ${message}`);
  passed++;
}

function assertThrows(
  callback: () => void,
  message: string,
): void {
  let thrown = false;

  try {
    callback();
  } catch {
    thrown = true;
  }

  assert(thrown, message);
}

const validCreateAccount = {
  userId: "user-001",
  type: "user" as const,
  status: "active" as const,
  emailVerified: true,
  phoneVerified: false,
};

const createAccountResult =
  validateCreateAccount(validCreateAccount);

assert(
  createAccountResult.valid,
  "Valid account creation passes",
);

assert(
  createAccountResult.data?.userId === "user-001",
  "Account user ID is preserved",
);

assert(
  isValidCreateAccount(validCreateAccount),
  "Account creation type guard works",
);

const invalidAccount =
  validateCreateAccount({
    userId: "",
    type: "invalid",
    status: "invalid",
    emailVerified: "yes",
    phoneVerified: "no",
  });

assert(
  !invalidAccount.valid,
  "Invalid account creation fails",
);

assert(
  invalidAccount.errors.length >= 4,
  "Account validation returns multiple errors",
);

const validUpdateAccount =
  validateUpdateAccount({
    status: "locked",
    emailVerified: true,
  });

assert(
  validUpdateAccount.valid,
  "Valid account update passes",
);

assert(
  validUpdateAccount.data?.status === "locked",
  "Account update status is preserved",
);

assert(
  isValidUpdateAccount({
    type: "admin",
  }),
  "Account update type guard works",
);

assert(
  !isValidUpdateAccount({
    status: "wrong",
  }),
  "Invalid account update is rejected",
);

const accountNow = new Date();

const completeAccount = {
  id: "account-001",
  userId: "user-001",
  type: "user" as const,
  status: "active" as const,
  emailVerified: true,
  phoneVerified: false,
  createdAt: accountNow,
  updatedAt: accountNow,
};

const accountResult =
  validateAccount(completeAccount);

assert(
  accountResult.valid,
  "Complete account passes validation",
);

assert(
  isValidAccount(completeAccount),
  "Account type guard works",
);

assert(
  accountResult.data?.id === "account-001",
  "Account ID is preserved",
);

assertValidAccount(completeAccount);
assert(
  true,
  "Valid account assertion succeeds",
);

const invalidCompleteAccount =
  validateAccount({
    id: "",
    userId: "",
    type: "invalid",
    status: "invalid",
    emailVerified: "true",
    phoneVerified: "false",
    createdAt: "invalid",
    updatedAt: "invalid",
  });

assert(
  !invalidCompleteAccount.valid,
  "Invalid complete account is rejected",
);

const validCreateProfile = {
  userId: "user-001",
  firstName: "Prasanth",
  lastName: "User",
  displayName: "Prasanth User",
  phone: "9999999999",
  bio: "AI Engineer",
  metadata: {
    department: "AI",
  },
};

const createProfileResult =
  validateCreateProfile(validCreateProfile);

assert(
  createProfileResult.valid,
  "Valid profile creation passes",
);

assert(
  createProfileResult.data?.firstName ===
    "Prasanth",
  "Profile first name is preserved",
);

assert(
  createProfileResult.data?.metadata?.department ===
    "AI",
  "Profile metadata is preserved",
);

assert(
  isValidCreateProfile(validCreateProfile),
  "Profile creation type guard works",
);

const invalidProfile =
  validateCreateProfile({
    userId: "",
    firstName: "",
    phone: 12345,
    metadata: "invalid",
  });

assert(
  !invalidProfile.valid,
  "Invalid profile creation fails",
);

assert(
  invalidProfile.errors.length >= 3,
  "Profile validation returns multiple errors",
);

const validUpdateProfile =
  validateUpdateProfile({
    firstName: "Updated",
    bio: "Updated bio",
    metadata: {
      role: "AI Engineer",
    },
  });

assert(
  validUpdateProfile.valid,
  "Valid profile update passes",
);

assert(
  validUpdateProfile.data?.firstName ===
    "Updated",
  "Profile update first name is preserved",
);

assert(
  isValidUpdateProfile({
    displayName: "User",
  }),
  "Profile update type guard works",
);

assert(
  !isValidUpdateProfile({
    firstName: 123,
  }),
  "Invalid profile update is rejected",
);

const profileNow = new Date();

const completeProfile = {
  id: "profile-001",
  userId: "user-001",
  firstName: "Prasanth",
  lastName: "User",
  displayName: "Prasanth",
  phone: "9999999999",
  avatarUrl: "https://example.com/avatar.png",
  bio: "AI Engineer",
  metadata: {
    department: "AI",
  },
  createdAt: profileNow,
  updatedAt: profileNow,
};

const profileResult =
  validateProfile(completeProfile);

assert(
  profileResult.valid,
  "Complete profile passes validation",
);

assert(
  isValidProfile(completeProfile),
  "Profile type guard works",
);

assert(
  profileResult.data?.id === "profile-001",
  "Profile ID is preserved",
);

const copiedProfile =
  profileResult.data?.metadata;

if (copiedProfile) {
  copiedProfile.department = "Modified";
}

assert(
  completeProfile.metadata.department === "AI",
  "Profile validation does not mutate input metadata",
);

assert(
  copiedProfile?.department === "Modified",
  "Validated metadata is a separate copy",
);

assertValidProfile(completeProfile);
assert(
  true,
  "Valid profile assertion succeeds",
);

const invalidCompleteProfile =
  validateProfile({
    id: "",
    userId: "",
    firstName: "",
    metadata: "invalid",
    createdAt: "invalid",
    updatedAt: "invalid",
  });

assert(
  !invalidCompleteProfile.valid,
  "Invalid complete profile is rejected",
);

assert(
  invalidCompleteProfile.errors.length >= 5,
  "Complete profile returns detailed errors",
);

console.log(`\nAll schema tests passed: ${passed}`);






