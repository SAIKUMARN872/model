import assert from "node:assert/strict";
import test from "node:test";

import {
  ConflictError,
  NotFoundError,
  ValidationError
} from "../shared/errors.js";

import {
  PayoutRepository,
  PayoutService
} from "../developer_payouts/index.js";

import {
  InstallationRepository,
  InstallationService
} from "../installations/index.js";

import {
  ListingRepository,
  ListingService
} from "../listings/index.js";

import {
  PublishingRepository,
  PublishingService
} from "../publishing/index.js";

import {
  ReviewRepository,
  ReviewService
} from "../reviews/index.js";

import {
  SubscriptionRepository,
  SubscriptionService
} from "../subscriptions/index.js";

async function expectError(
  operation: () => Promise<unknown>,
  errorType: typeof ValidationError | typeof NotFoundError | typeof ConflictError
): Promise<void> {
  await assert.rejects(operation, errorType);
}

async function runStep(
  name: string,
  operation: () => Promise<void>
): Promise<void> {
  await operation();
  console.log(`? ${name}`);
}

test("AI Marketplace complete mock test", async () => {
  const payoutRepository = new PayoutRepository();
  const payoutService = new PayoutService(payoutRepository);

  const installationRepository = new InstallationRepository();
  const installationService = new InstallationService(
    installationRepository
  );

  const listingRepository = new ListingRepository();
  const listingService = new ListingService(listingRepository);

  const publishingRepository = new PublishingRepository();
  const publishingService = new PublishingService(
    publishingRepository
  );

  const reviewRepository = new ReviewRepository();
  const reviewService = new ReviewService(reviewRepository);

  const subscriptionRepository = new SubscriptionRepository();
  const subscriptionService = new SubscriptionService(
    subscriptionRepository
  );

  let listingId = "";
  let installationId = "";
  let publishingId = "";
  let reviewId = "";
  let subscriptionId = "";
  let payoutId = "";

  await runStep("listing creation", async () => {
    const listing = await listingService.create({
      developerId: "developer-001",
      name: "AI Document Assistant",
      slug: "ai-document-assistant",
      description: "AI powered document analysis",
      version: "1.0.0",
      category: "productivity",
      price: 29,
      currency: "USD",
      tags: ["ai", "documents", "productivity"],
      configurationSchema: {
        apiKey: {
          type: "string"
        }
      },
      metadata: {
        source: "mock-test"
      }
    });

    listingId = listing.id;

    assert.ok(listing.id.startsWith("listing_"));
    assert.equal(listing.name, "AI Document Assistant");
    assert.equal(listing.slug, "ai-document-assistant");
    assert.equal(listing.status, "draft");
    assert.equal(listing.price, 29);
    assert.equal(listing.currency, "USD");
    assert.deepEqual(listing.tags, [
      "ai",
      "documents",
      "productivity"
    ]);
  });

  await runStep("listing get by id", async () => {
    const listing = await listingService.getById(listingId);

    assert.equal(listing.id, listingId);
    assert.equal(listing.developerId, "developer-001");
  });

  await runStep("listing get by slug", async () => {
    const listing = await listingService.getBySlug(
      "ai-document-assistant"
    );

    assert.equal(listing.id, listingId);
  });

  await runStep("listing list", async () => {
    const listings = await listingService.list({
      developerId: "developer-001"
    });

    assert.equal(listings.length, 1);
    assert.equal(listings[0].id, listingId);
  });

  await runStep("listing update", async () => {
    const listing = await listingService.update(listingId, {
      description: "Updated AI document analysis assistant",
      version: "1.1.0",
      tags: ["ai", "documents", "productivity", "automation"]
    });

    assert.equal(
      listing.description,
      "Updated AI document analysis assistant"
    );
    assert.equal(listing.version, "1.1.0");
    assert.equal(listing.tags.length, 4);
  });

  await runStep("listing duplicate slug protection", async () => {
    await expectError(
      () =>
        listingService.create({
          developerId: "developer-002",
          name: "Another Assistant",
          slug: "ai-document-assistant"
        }),
      ConflictError
    );
  });

  await runStep("listing validation", async () => {
    await expectError(
      () =>
        listingService.create({
          developerId: "",
          name: "Invalid",
          slug: "invalid"
        }),
      ValidationError
    );

    await expectError(
      () =>
        listingService.create({
          developerId: "developer-001",
          name: "Invalid",
          slug: "Invalid Slug"
        }),
      ValidationError
    );

    await expectError(
      () =>
        listingService.create({
          developerId: "developer-001",
          name: "Invalid",
          slug: "invalid-price",
          price: -1
        }),
      ValidationError
    );
  });

  await runStep("listing submit for review", async () => {
    const listing = await listingService.submitForReview(listingId);

    assert.equal(listing.status, "pending_review");
  });

  await runStep("listing publish", async () => {
    const listing = await listingService.publish(listingId);

    assert.equal(listing.status, "published");
    assert.ok(listing.publishedAt instanceof Date);
  });

  await runStep("listing published update", async () => {
    const listing = await listingService.update(listingId, {
      description: "Published listing description"
    });

    assert.equal(
      listing.description,
      "Published listing description"
    );
  });

  await runStep("listing suspend", async () => {
    const listing = await listingService.suspend(listingId);

    assert.equal(listing.status, "suspended");
  });

  await runStep("listing archive", async () => {
    const listing = await listingService.archive(listingId);

    assert.equal(listing.status, "archived");
  });

  await runStep("archived listing protection", async () => {
    await expectError(
      () =>
        listingService.update(listingId, {
          description: "Should fail"
        }),
      ConflictError
    );
  });

  await runStep("installation creation", async () => {
    const installation = await installationService.create({
      listingId,
      developerId: "developer-001",
      tenantId: "tenant-001",
      installedBy: "user-001",
      version: "1.1.0",
      configuration: {
        apiKey: "mock-key",
        region: "us-east"
      }
    });

    installationId = installation.id;

    assert.ok(installation.id.startsWith("installation_"));
    assert.equal(installation.listingId, listingId);
    assert.equal(installation.tenantId, "tenant-001");
    assert.equal(installation.status, "pending");
    assert.equal(installation.version, "1.1.0");
  });

  await runStep("installation activation", async () => {
    const installation =
      await installationService.activate(installationId);

    assert.equal(installation.status, "active");
  });

  await runStep("installation list", async () => {
    const installations = await installationService.list({
      tenantId: "tenant-001"
    });

    assert.equal(installations.length, 1);
    assert.equal(installations[0].id, installationId);
  });

  await runStep("installation update", async () => {
    const installation = await installationService.update(
      installationId,
      {
        version: "1.2.0",
        configuration: {
          apiKey: "updated-key",
          region: "eu-west"
        }
      }
    );

    assert.equal(installation.version, "1.2.0");
    assert.equal(
      installation.configuration["region"],
      "eu-west"
    );
  });

  await runStep("installation duplicate protection", async () => {
    await expectError(
      () =>
        installationService.create({
          listingId,
          developerId: "developer-001",
          tenantId: "tenant-001",
          installedBy: "user-002"
        }),
      ConflictError
    );
  });

  await runStep("installation tenant isolation", async () => {
    const installation = await installationService.create({
      listingId,
      developerId: "developer-001",
      tenantId: "tenant-002",
      installedBy: "user-003"
    });

    assert.notEqual(installation.id, installationId);
    assert.equal(installation.tenantId, "tenant-002");
  });

  await runStep("installation suspend", async () => {
    const installation =
      await installationService.suspend(installationId);

    assert.equal(installation.status, "suspended");
  });

  await runStep("installation uninstall", async () => {
    const installation =
      await installationService.uninstall(installationId);

    assert.equal(installation.status, "uninstalled");
    assert.ok(installation.uninstalledAt instanceof Date);
  });

  await runStep("uninstalled installation protection", async () => {
    await expectError(
      () => installationService.activate(installationId),
      ConflictError
    );
  });

  await runStep("publishing request creation", async () => {
    const request = await publishingService.create({
      listingId: "listing-publish-001",
      developerId: "developer-001",
      submittedBy: "developer-user",
      version: "2.0.0",
      notes: "Ready for marketplace publication"
    });

    publishingId = request.id;

    assert.ok(request.id.startsWith("publish_"));
    assert.equal(request.status, "queued");
    assert.equal(request.version, "2.0.0");
  });

  await runStep("publishing request get", async () => {
    const request =
      await publishingService.getById(publishingId);

    assert.equal(request.id, publishingId);
    assert.equal(request.status, "queued");
  });

  await runStep("publishing request list", async () => {
    const requests = await publishingService.list({
      developerId: "developer-001"
    });

    assert.equal(requests.length, 1);
  });

  await runStep("publishing review start", async () => {
    const request =
      await publishingService.startReview(publishingId);

    assert.equal(request.status, "in_review");
  });

  await runStep("publishing approval", async () => {
    const request = await publishingService.approve(
      publishingId,
      "reviewer-001",
      "Looks good"
    );

    assert.equal(request.status, "approved");
    assert.equal(request.reviewer, "reviewer-001");
    assert.equal(request.reviewNotes, "Looks good");
  });

  await runStep("publishing completion", async () => {
    const request =
      await publishingService.publish(publishingId);

    assert.equal(request.status, "published");
    assert.ok(request.completedAt instanceof Date);
  });

  await runStep("publishing duplicate protection", async () => {
    const request = await publishingService.create({
      listingId: "listing-publish-002",
      developerId: "developer-001",
      submittedBy: "developer-user",
      version: "1.0.0"
    });

    await expectError(
      () =>
        publishingService.create({
          listingId: request.listingId,
          developerId: "developer-001",
          submittedBy: "developer-user",
          version: "1.1.0"
        }),
      ConflictError
    );
  });

  await runStep("publishing rejection workflow", async () => {
    const request = await publishingService.create({
      listingId: "listing-publish-003",
      developerId: "developer-001",
      submittedBy: "developer-user",
      version: "1.0.0"
    });

    await publishingService.startReview(request.id);

    const rejected = await publishingService.reject(
      request.id,
      "reviewer-002",
      "Missing documentation"
    );

    assert.equal(rejected.status, "rejected");
    assert.equal(
      rejected.reviewNotes,
      "Missing documentation"
    );
  });

  await runStep("publishing validation", async () => {
    await expectError(
      () =>
        publishingService.create({
          listingId: "",
          developerId: "developer-001",
          submittedBy: "developer-user",
          version: "1.0.0"
        }),
      ValidationError
    );

    await expectError(
      () =>
        publishingService.create({
          listingId: "listing-invalid",
          developerId: "developer-001",
          submittedBy: "developer-user",
          version: ""
        }),
      ValidationError
    );
  });

  await runStep("review creation", async () => {
    const review = await reviewService.create({
      listingId,
      reviewerId: "reviewer-user-001",
      installationId,
      rating: 5,
      title: "Excellent assistant",
      comment: "The document analysis works very well."
    });

    reviewId = review.id;

    assert.ok(review.id.startsWith("review_"));
    assert.equal(review.rating, 5);
    assert.equal(review.status, "published");
    assert.equal(review.listingId, listingId);
  });

  await runStep("review get", async () => {
    const review = await reviewService.getById(reviewId);

    assert.equal(review.id, reviewId);
    assert.equal(review.reviewerId, "reviewer-user-001");
  });

  await runStep("review list", async () => {
    const reviews = await reviewService.list({
      listingId
    });

    assert.equal(reviews.length, 1);
    assert.equal(reviews[0].id, reviewId);
  });

  await runStep("review duplicate protection", async () => {
    await expectError(
      () =>
        reviewService.create({
          listingId,
          reviewerId: "reviewer-user-001",
          rating: 4,
          comment: "Duplicate review"
        }),
      ConflictError
    );
  });

  await runStep("review update", async () => {
    const review = await reviewService.update(reviewId, {
      rating: 4,
      title: "Very good assistant",
      comment: "Updated review comment"
    });

    assert.equal(review.rating, 4);
    assert.equal(review.title, "Very good assistant");
    assert.equal(review.comment, "Updated review comment");
  });

  await runStep("developer review response", async () => {
    const review = await reviewService.respond(
      reviewId,
      "Thank you for your feedback."
    );

    assert.equal(
      review.developerResponse,
      "Thank you for your feedback."
    );
  });

  await runStep("review hide", async () => {
    const review = await reviewService.hide(reviewId);

    assert.equal(review.status, "hidden");
  });

  await runStep("review republish", async () => {
    const review = await reviewService.publish(reviewId);

    assert.equal(review.status, "published");
  });

  await runStep("review remove", async () => {
    const review = await reviewService.remove(reviewId);

    assert.equal(review.status, "removed");
  });

  await runStep("removed review protection", async () => {
    await expectError(
      () =>
        reviewService.update(reviewId, {
          comment: "Should fail"
        }),
      ConflictError
    );
  });

  await runStep("review validation", async () => {
    await expectError(
      () =>
        reviewService.create({
          listingId,
          reviewerId: "reviewer-invalid",
          rating: 6,
          comment: "Invalid rating"
        }),
      ValidationError
    );

    await expectError(
      () =>
        reviewService.create({
          listingId,
          reviewerId: "reviewer-invalid",
          rating: 0,
          comment: "Invalid rating"
        }),
      ValidationError
    );

    await expectError(
      () =>
        reviewService.create({
          listingId,
          reviewerId: "reviewer-invalid",
          rating: 5,
          comment: ""
        }),
      ValidationError
    );
  });

  await runStep("subscription creation", async () => {
    const subscription = await subscriptionService.create({
      tenantId: "tenant-sub-001",
      listingId: "listing-sub-001",
      planId: "pro",
      quantity: 2,
      price: 49,
      currency: "USD",
      periodDays: 30,
      metadata: {
        source: "mock-test"
      }
    });

    subscriptionId = subscription.id;

    assert.ok(subscription.id.startsWith("subscription_"));
    assert.equal(subscription.status, "active");
    assert.equal(subscription.quantity, 2);
    assert.equal(subscription.price, 49);
    assert.equal(subscription.currency, "USD");
    assert.ok(subscription.currentPeriodEnd > subscription.currentPeriodStart);
  });

  await runStep("subscription get", async () => {
    const subscription =
      await subscriptionService.getById(subscriptionId);

    assert.equal(subscription.id, subscriptionId);
    assert.equal(subscription.planId, "pro");
  });

  await runStep("subscription list", async () => {
    const subscriptions = await subscriptionService.list({
      tenantId: "tenant-sub-001"
    });

    assert.equal(subscriptions.length, 1);
    assert.equal(subscriptions[0].id, subscriptionId);
  });

  await runStep("subscription duplicate protection", async () => {
    await expectError(
      () =>
        subscriptionService.create({
          tenantId: "tenant-sub-001",
          listingId: "listing-sub-001",
          planId: "basic",
          price: 19
        }),
      ConflictError
    );
  });

  await runStep("subscription update", async () => {
    const subscription = await subscriptionService.update(
      subscriptionId,
      {
        quantity: 3,
        price: 59,
        metadata: {
          source: "updated-test"
        }
      }
    );

    assert.equal(subscription.quantity, 3);
    assert.equal(subscription.price, 59);
    assert.equal(
      subscription.metadata["source"],
      "updated-test"
    );
  });

  await runStep("subscription pause", async () => {
    const subscription =
      await subscriptionService.pause(subscriptionId);

    assert.equal(subscription.status, "paused");
  });

  await runStep("subscription resume", async () => {
    const subscription =
      await subscriptionService.resume(subscriptionId);

    assert.equal(subscription.status, "active");
  });

  await runStep("subscription past due", async () => {
    const subscription =
      await subscriptionService.markPastDue(subscriptionId);

    assert.equal(subscription.status, "past_due");
  });

  await runStep("subscription renewal", async () => {
    const subscription =
      await subscriptionService.renew(subscriptionId, 30);

    assert.equal(subscription.status, "active");
    assert.ok(
      subscription.currentPeriodEnd >
        subscription.currentPeriodStart
    );
  });

  await runStep("subscription cancellation", async () => {
    const subscription =
      await subscriptionService.cancel(subscriptionId);

    assert.equal(subscription.status, "cancelled");
    assert.ok(subscription.cancelledAt instanceof Date);
  });

  await runStep("cancelled subscription protection", async () => {
    await expectError(
      () =>
        subscriptionService.update(subscriptionId, {
          price: 100
        }),
      ConflictError
    );
  });

  await runStep("subscription validation", async () => {
    await expectError(
      () =>
        subscriptionService.create({
          tenantId: "",
          listingId: "listing-invalid",
          planId: "basic",
          price: 10
        }),
      ValidationError
    );

    await expectError(
      () =>
        subscriptionService.create({
          tenantId: "tenant-invalid",
          listingId: "listing-invalid",
          planId: "basic",
          price: -10
        }),
      ValidationError
    );

    await expectError(
      () =>
        subscriptionService.create({
          tenantId: "tenant-invalid",
          listingId: "listing-invalid",
          planId: "basic",
          price: 10,
          quantity: 0
        }),
      ValidationError
    );
  });

  await runStep("payout creation", async () => {
    const payout = await payoutService.create({
      developerId: "developer-001",
      installationId,
      listingId,
      amount: 125.5,
      currency: "USD",
      metadata: {
        source: "marketplace"
      }
    });

    payoutId = payout.id;

    assert.ok(payout.id.startsWith("payout_"));
    assert.equal(payout.status, "pending");
    assert.equal(payout.amount, 125.5);
    assert.equal(payout.currency, "USD");
  });

  await runStep("payout get", async () => {
    const payout = await payoutService.getById(payoutId);

    assert.equal(payout.id, payoutId);
    assert.equal(payout.developerId, "developer-001");
  });

  await runStep("payout list", async () => {
    const payouts = await payoutService.list({
      developerId: "developer-001"
    });

    assert.equal(payouts.length, 1);
    assert.equal(payouts[0].id, payoutId);
  });

  await runStep("payout process", async () => {
    const payout = await payoutService.process(payoutId);

    assert.equal(payout.status, "processing");
  });

  await runStep("payout mark paid", async () => {
    const payout = await payoutService.markPaid(payoutId);

    assert.equal(payout.status, "paid");
    assert.ok(payout.paidAt instanceof Date);
  });

  await runStep("paid payout protection", async () => {
    await expectError(
      () =>
        payoutService.update(payoutId, {
          status: "processing"
        }),
      ConflictError
    );
  });

  await runStep("payout validation", async () => {
    await expectError(
      () =>
        payoutService.create({
          developerId: "",
          amount: 10
        }),
      ValidationError
    );

    await expectError(
      () =>
        payoutService.create({
          developerId: "developer-invalid",
          amount: 0
        }),
      ValidationError
    );

    await expectError(
      () =>
        payoutService.create({
          developerId: "developer-invalid",
          amount: 10,
          currency: "INVALID"
        }),
      ValidationError
    );
  });

  await runStep("missing listing handling", async () => {
    await expectError(
      () => listingService.getById("missing-listing"),
      NotFoundError
    );
  });

  await runStep("missing installation handling", async () => {
    await expectError(
      () => installationService.getById("missing-installation"),
      NotFoundError
    );
  });

  await runStep("missing publishing request handling", async () => {
    await expectError(
      () => publishingService.getById("missing-publishing"),
      NotFoundError
    );
  });

  await runStep("missing review handling", async () => {
    await expectError(
      () => reviewService.getById("missing-review"),
      NotFoundError
    );
  });

  await runStep("missing subscription handling", async () => {
    await expectError(
      () => subscriptionService.getById("missing-subscription"),
      NotFoundError
    );
  });

  await runStep("missing payout handling", async () => {
    await expectError(
      () => payoutService.getById("missing-payout"),
      NotFoundError
    );
  });

  await runStep("listing repository clone protection", async () => {
    const listing = await listingRepository.getById(listingId);

    assert.ok(listing);

    listing.tags.push("mutated-outside");

    const fresh = await listingRepository.getById(listingId);

    assert.ok(fresh);
    assert.equal(
      fresh.tags.includes("mutated-outside"),
      false
    );
  });

  await runStep("installation repository clone protection", async () => {
    const installation =
      await installationRepository.getById(installationId);

    assert.ok(installation);

    installation.configuration["mutated"] = true;

    const fresh =
      await installationRepository.getById(installationId);

    assert.ok(fresh);
    assert.equal(
      fresh.configuration["mutated"],
      undefined
    );
  });

  await runStep("review repository clone protection", async () => {
    const review = await reviewRepository.getById(reviewId);

    assert.ok(review);

    const originalComment = review.comment;
    review.comment = "external mutation";

    const fresh = await reviewRepository.getById(reviewId);

    assert.ok(fresh);
    assert.equal(fresh.comment, originalComment);
  });

  await runStep("subscription repository clone protection", async () => {
    const subscription =
      await subscriptionRepository.getById(subscriptionId);

    assert.ok(subscription);

    subscription.metadata["mutated"] = true;

    const fresh =
      await subscriptionRepository.getById(subscriptionId);

    assert.ok(fresh);
    assert.equal(
      fresh.metadata["mutated"],
      undefined
    );
  });

  await runStep("payout repository clone protection", async () => {
    const payout = await payoutRepository.getById(payoutId);

    assert.ok(payout);

    payout.metadata["mutated"] = true;

    const fresh = await payoutRepository.getById(payoutId);

    assert.ok(fresh);
    assert.equal(
      fresh.metadata["mutated"],
      undefined
    );
  });

  await runStep("publishing repository clone protection", async () => {
    const request =
      await publishingRepository.getById(publishingId);

    assert.ok(request);

    const originalNotes = request.notes;
    request.notes = "external mutation";

    const fresh =
      await publishingRepository.getById(publishingId);

    assert.ok(fresh);
    assert.equal(fresh.notes, originalNotes);
  });

  await runStep("listing delete protection", async () => {
    const deleteCandidate = await listingService.create({
      developerId: "developer-delete",
      name: "Delete Candidate",
      slug: "delete-candidate"
    });

    await listingService.delete(deleteCandidate.id);

    await expectError(
      () => listingService.getById(deleteCandidate.id),
      NotFoundError
    );
  });

  await runStep("installation delete protection", async () => {
    const candidate = await installationService.create({
      listingId: "listing-delete-installation",
      developerId: "developer-delete",
      tenantId: "tenant-delete",
      installedBy: "user-delete"
    });

    await installationService.activate(candidate.id);

    await expectError(
      () => installationService.delete(candidate.id),
      ConflictError
    );

    await installationService.uninstall(candidate.id);
    await installationService.delete(candidate.id);

    await expectError(
      () => installationService.getById(candidate.id),
      NotFoundError
    );
  });

  await runStep("publishing delete protection", async () => {
    const candidate = await publishingService.create({
      listingId: "listing-delete-publishing",
      developerId: "developer-delete",
      submittedBy: "developer-user",
      version: "1.0.0"
    });

    await publishingService.delete(candidate.id);

    await expectError(
      () => publishingService.getById(candidate.id),
      NotFoundError
    );
  });

  await runStep("review delete protection", async () => {
    const candidate = await reviewService.create({
      listingId: "listing-delete-review",
      reviewerId: "reviewer-delete",
      rating: 3,
      comment: "Delete candidate"
    });

    await expectError(
      () => reviewService.delete(candidate.id),
      ConflictError
    );

    await reviewService.remove(candidate.id);
    await reviewService.delete(candidate.id);

    await expectError(
      () => reviewService.getById(candidate.id),
      NotFoundError
    );
  });

  await runStep("subscription delete protection", async () => {
    const candidate = await subscriptionService.create({
      tenantId: "tenant-delete-sub",
      listingId: "listing-delete-sub",
      planId: "basic",
      price: 10
    });

    await expectError(
      () => subscriptionService.delete(candidate.id),
      ConflictError
    );

    await subscriptionService.cancel(candidate.id);
    await subscriptionService.delete(candidate.id);

    await expectError(
      () => subscriptionService.getById(candidate.id),
      NotFoundError
    );
  });

  await runStep("payout delete protection", async () => {
    const candidate = await payoutService.create({
      developerId: "developer-delete-payout",
      amount: 25
    });

    await payoutService.delete(candidate.id);

    await expectError(
      () => payoutService.getById(candidate.id),
      NotFoundError
    );
  });
});

console.log("");
console.log("All ModelNow AI Marketplace mock tests passed.");
