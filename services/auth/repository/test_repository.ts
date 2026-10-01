import {
  AccountRepository,
  ProfileRepository,
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

const accounts = new AccountRepository();

const account = accounts.create({
  userId: "user-001",
  type: "user",
});

assert(
  account.id.length > 0,
  "Account ID is generated",
);

assert(
  account.userId === "user-001",
  "Account user ID is correct",
);

assert(
  account.status === "active",
  "Account defaults to active",
);

assert(
  account.type === "user",
  "Account type is correct",
);

assert(
  accounts.count() === 1,
  "Account count is correct",
);

const foundAccount = accounts.findById(account.id);

assert(
  foundAccount !== undefined,
  "Account can be found by ID",
);

assert(
  foundAccount?.id === account.id,
  "Found account has correct ID",
);

const userAccount =
  accounts.findByUserId("user-001");

assert(
  userAccount?.userId === "user-001",
  "Account can be found by user ID",
);

const updatedAccount = accounts.update(
  account.id,
  {
    status: "locked",
    emailVerified: true,
  },
);

assert(
  updatedAccount.status === "locked",
  "Account status can be updated",
);

assert(
  updatedAccount.emailVerified === true,
  "Account verification can be updated",
);

assert(
  accounts.countByStatus("locked") === 1,
  "Account status filtering works",
);

const copiedAccount = accounts.findById(
  account.id,
);

if (copiedAccount) {
  copiedAccount.status = "active";
}

assert(
  accounts.findById(account.id)?.status ===
    "locked",
  "Account objects are protected from mutation",
);

assert(
  accounts.exists(account.id),
  "Account existence check works",
);

const accountHealth = accounts.health();

assert(
  accountHealth.healthy === true,
  "Account repository health is healthy",
);

assertThrows(
  () =>
    accounts.create({
      userId: "user-001",
    }),
  "Duplicate account is rejected",
);

assertThrows(
  () =>
    accounts.create({
      userId: "",
    }),
  "Empty account user ID is rejected",
);

assertThrows(
  () => accounts.findRequiredById("missing"),
  "Missing account throws an error",
);

const secondAccount = accounts.create({
  userId: "user-002",
  type: "admin",
  status: "suspended",
});

assert(
  accounts.count() === 2,
  "Multiple accounts are stored",
);

assert(
  accounts.findByStatus("suspended").length ===
    1,
  "Suspended account filtering works",
);

assert(
  accounts.findAll().length === 2,
  "All accounts can be retrieved",
);

assert(
  accounts.delete(secondAccount.id),
  "Account deletion succeeds",
);

assert(
  accounts.count() === 1,
  "Account count updates after deletion",
);

const profiles = new ProfileRepository();

const profile = profiles.create({
  userId: "user-001",
  firstName: "Prasanth",
  lastName: "User",
  displayName: "Prasanth",
  phone: "9999999999",
  metadata: {
    department: "AI",
  },
});

assert(
  profile.id.length > 0,
  "Profile ID is generated",
);

assert(
  profile.userId === "user-001",
  "Profile user ID is correct",
);

assert(
  profile.firstName === "Prasanth",
  "Profile first name is correct",
);

assert(
  profile.lastName === "User",
  "Profile last name is correct",
);

assert(
  profile.metadata.department === "AI",
  "Profile metadata is stored",
);

assert(
  profiles.count() === 1,
  "Profile count is correct",
);

const foundProfile = profiles.findById(
  profile.id,
);

assert(
  foundProfile !== undefined,
  "Profile can be found by ID",
);

const userProfile =
  profiles.findByUserId("user-001");

assert(
  userProfile?.userId === "user-001",
  "Profile can be found by user ID",
);

const updatedProfile = profiles.update(
  profile.id,
  {
    firstName: "Updated",
    bio: "AI Engineer",
    metadata: {
      experience: 2,
    },
  },
);

assert(
  updatedProfile.firstName === "Updated",
  "Profile first name can be updated",
);

assert(
  updatedProfile.bio === "AI Engineer",
  "Profile bio can be updated",
);

assert(
  updatedProfile.metadata.department === "AI",
  "Existing metadata is preserved",
);

assert(
  updatedProfile.metadata.experience === 2,
  "New metadata is merged",
);

const replacedProfile =
  profiles.replaceMetadata(
    profile.id,
    {
      role: "AI Engineer",
    },
  );

assert(
  replacedProfile.metadata.role ===
    "AI Engineer",
  "Profile metadata can be replaced",
);

assert(
  replacedProfile.metadata.department ===
    undefined,
  "Metadata replacement removes old fields",
);

const copiedProfile =
  profiles.findById(profile.id);

if (copiedProfile) {
  copiedProfile.firstName = "Changed";
  copiedProfile.metadata.changed = true;
}

const originalProfile =
  profiles.findById(profile.id);

assert(
  originalProfile?.firstName !== "Changed",
  "Profile object is protected from mutation",
);

assert(
  originalProfile?.metadata.changed !== true,
  "Profile metadata is protected from mutation",
);

assert(
  profiles.exists(profile.id),
  "Profile existence check works",
);

const profileHealth = profiles.health();

assert(
  profileHealth.healthy === true,
  "Profile repository health is healthy",
);

assertThrows(
  () =>
    profiles.create({
      userId: "user-001",
      firstName: "Duplicate",
    }),
  "Duplicate profile is rejected",
);

assertThrows(
  () =>
    profiles.create({
      userId: "user-002",
      firstName: "",
    }),
  "Empty profile first name is rejected",
);

assertThrows(
  () => profiles.findRequiredById("missing"),
  "Missing profile throws an error",
);

const secondProfile = profiles.create({
  userId: "user-002",
  firstName: "Second",
});

assert(
  profiles.count() === 2,
  "Multiple profiles are stored",
);

assert(
  profiles.findAll().length === 2,
  "All profiles can be retrieved",
);

assert(
  profiles.delete(secondProfile.id),
  "Profile deletion succeeds",
);

assert(
  profiles.count() === 1,
  "Profile count updates after deletion",
);

accounts.clear();
profiles.clear();

assert(
  accounts.count() === 0,
  "Account repository can be cleared",
);

assert(
  profiles.count() === 0,
  "Profile repository can be cleared",
);

console.log(`\nAll repository tests passed: ${passed}`);
