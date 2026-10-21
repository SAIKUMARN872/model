import type {
    BillingCustomer,
    Plan,
    Subscription,
    Invoice,
    InvoiceLine,
    Payment,
    Refund,
    CreditBalance
} from "./models.js";
import type {
    BillingConfig
} from "./interfaces.js";
import {
    createBillingConfig
} from "./config/config.js";
import {
    CustomerManager
} from "./customers/manager.js";
import {
    PlanCatalog
} from "./plans/catalog.js";
import {
    PricingService
} from "./pricing/pricing.js";
import {
    CreditManager
} from "./credits/manager.js";
import {
    WalletManager
} from "./wallet/wallet.js";
import {
    SubscriptionManager
} from "./subscriptions/manager.js";
import {
    InvoiceManager
} from "./invoices/invoice.js";
import {
    TaxCalculator
} from "./tax/calculator.js";
import {
    InMemoryPaymentGateway,
    PaymentProcessor
} from "./payments/processor.js";
import {
    RefundProcessor
} from "./refunds/processor.js";
import {
    TransactionLedger
} from "./transactions/ledger.js";
import {
    UsageTracker
} from "./usage_metering/tracker.js";
import {
    BillingEventPublisher
} from "./events/publisher.js";
import {
    BillingAuditLogger
} from "./audit/logger.js";
import {
    BillingTracker
} from "./audit/tracker.js";
import {
    CreditService
} from "./services/credit-service.js";
import {
    PlanService
} from "./services/plan-service.js";
import {
    SubscriptionService
} from "./services/subscription-service.js";
import {
    InvoiceService
} from "./services/invoice-service.js";
import {
    CreditController
} from "./api/credit-controller.js";
import {
    PlanController
} from "./api/plan-controller.js";
import {
    SubscriptionController
} from "./api/subscription-controller.js";
import {
    InvoiceController
} from "./api/invoice-controller.js";
import {
    BillingDatabaseConnection
} from "./database/connection.js";

type CustomerInput = Parameters<CustomerManager["create"]>[0];
type PlanInput = Parameters<PlanCatalog["create"]>[0];

export class BillingEngine {
    readonly config: BillingConfig;

    readonly customers: CustomerManager;
    readonly plans: PlanCatalog;
    readonly pricing: PricingService;
    readonly credits: CreditManager;
    readonly wallets: WalletManager;
    readonly subscriptions: SubscriptionManager;
    readonly invoices: InvoiceManager;
    readonly tax: TaxCalculator;
    readonly payments: PaymentProcessor;
    readonly refunds: RefundProcessor;
    readonly transactions: TransactionLedger;
    readonly usage: UsageTracker;
    readonly events: BillingEventPublisher;
    readonly audit: BillingAuditLogger;
    readonly tracker: BillingTracker;
    readonly database: BillingDatabaseConnection;

    readonly creditService: CreditService;
    readonly planService: PlanService;
    readonly subscriptionService: SubscriptionService;
    readonly invoiceService: InvoiceService;

    readonly creditController: CreditController;
    readonly planController: PlanController;
    readonly subscriptionController: SubscriptionController;
    readonly invoiceController: InvoiceController;

    constructor(
        config: Partial<BillingConfig> = {}
    ) {
        this.config =
            createBillingConfig(config);

        this.customers =
            new CustomerManager();

        this.plans =
            new PlanCatalog();

        this.pricing =
            new PricingService();

        this.credits =
            new CreditManager();

        this.wallets =
            new WalletManager();

        this.subscriptions =
            new SubscriptionManager();

        this.invoices =
            new InvoiceManager();

        this.tax =
            new TaxCalculator(
                this.config.taxRate
            );

        this.payments =
            new PaymentProcessor(
                new InMemoryPaymentGateway()
            );

        this.refunds =
            new RefundProcessor(
                this.payments
            );

        this.transactions =
            new TransactionLedger();

        this.usage =
            new UsageTracker();

        this.events =
            new BillingEventPublisher();

        this.audit =
            new BillingAuditLogger();

        this.tracker =
            new BillingTracker();

        this.database =
            new BillingDatabaseConnection();

        this.creditService =
            new CreditService(
                this.credits
            );

        this.planService =
            new PlanService(
                this.plans
            );

        this.subscriptionService =
            new SubscriptionService(
                this.subscriptions,
                this.plans
            );

        this.invoiceService =
            new InvoiceService(
                this.invoices,
                this.tax,
                this.config.invoiceDueDays
            );

        this.creditController =
            new CreditController(
                this.creditService
            );

        this.planController =
            new PlanController(
                this.planService
            );

        this.subscriptionController =
            new SubscriptionController(
                this.subscriptionService
            );

        this.invoiceController =
            new InvoiceController(
                this.invoiceService
            );
    }

    createCustomer(
        input: CustomerInput
    ): BillingCustomer {
        const customer =
            this.customers.create(input);

        this.audit.log(
            "customer.created",
            {
                customerId:
                    customer.id,
                resourceId:
                    customer.id
            }
        );

        this.tracker.increment(
            "customers.created"
        );

        return customer;
    }

    createPlan(
        input: PlanInput
    ): Plan {
        const plan =
            this.plans.create(input);

        this.audit.log(
            "plan.created",
            {
                resourceId: plan.id
            }
        );

        this.tracker.increment(
            "plans.created"
        );

        return plan;
    }

    createSubscription(
        customerId: string,
        planId: string,
        quantity = 1
    ): Subscription {
        const customer =
            this.customers.get(
                customerId
            );

        const plan =
            this.plans.get(planId);

        if (
            customer.status !==
            "active"
        ) {
            throw new Error(
                "Customer is not active"
            );
        }

        const subscription =
            this.subscriptions.create(
                customerId,
                plan,
                quantity
            );

        this.audit.log(
            "subscription.created",
            {
                customerId,
                resourceId:
                    subscription.id
            }
        );

        this.tracker.increment(
            "subscriptions.created"
        );

        return subscription;
    }

    createInvoiceForSubscription(
        subscriptionId: string
    ): Invoice {
        const subscription =
            this.subscriptions.get(
                subscriptionId
            );

        const customer =
            this.customers.get(
                subscription.customerId
            );

        const plan =
            this.plans.get(
                subscription.planId
            );

        const amount =
            this.pricing.calculate(
                plan,
                subscription.quantity
            );

        const line: InvoiceLine = {
            id:
                crypto.randomUUID(),
            description:
                `${plan.name} subscription`,
            quantity:
                subscription.quantity,
            unitPrice:
                plan.price,
            amount,
            metadata: {}
        };

        const invoice =
            this.invoices.create(
                customer.id,
                customer.currency,
                [line],
                this.config.invoiceDueDays,
                subscription.id
            );

        return this.invoices.applyTax(
            invoice.id,
            this.tax.calculate(
                invoice.subtotal
            )
        );
    }

    async payInvoice(
        invoiceId: string
    ): Promise<Payment> {
        const invoice =
            this.invoices.get(
                invoiceId
            );

        if (
            invoice.amountDue <=
            0
        ) {
            throw new Error(
                "Invoice has no amount due"
            );
        }

        const payment =
            await this.payments.process(
                invoice.customerId,
                invoice.amountDue,
                invoice.currency,
                invoice.id
            );

        if (
            payment.status ===
            "succeeded"
        ) {
            this.invoices.markPaid(
                invoice.id,
                payment.amount
            );

            this.transactions.record(
                invoice.customerId,
                "payment",
                payment.amount,
                payment.currency,
                payment.id,
                `Payment for ${invoice.number}`
            );

            this.audit.log(
                "invoice.paid",
                {
                    customerId:
                        invoice.customerId,
                    resourceId:
                        invoice.id
                }
            );

            this.tracker.increment(
                "payments.succeeded"
            );
        }

        return payment;
    }

    refundPayment(
        paymentId: string,
        amount: number,
        reason?: string
    ): Refund {
        const payment =
            this.payments.get(
                paymentId
            );

        const refund =
            this.refunds.process(
                paymentId,
                amount,
                reason
            );

        this.transactions.record(
            payment.customerId,
            "refund",
            amount,
            payment.currency,
            refund.id,
            reason
        );

        this.tracker.increment(
            "refunds.created"
        );

        return refund;
    }

    addCredit(
        customerId: string,
        amount: number,
        currency?: string
    ): CreditBalance {
        return this.credits.add(
            customerId,
            amount,
            currency
        );
    }

    health(): {
        status: "ok";
        database: boolean;
        metrics: Record<string, number>;
    } {
        return {
            status: "ok",
            database:
                this.database.isConnected(),
            metrics:
                this.tracker.snapshot()
        };
    }
}
