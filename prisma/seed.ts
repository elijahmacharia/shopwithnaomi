import { Prisma, PrismaClient, type PaymentMethod } from "@prisma/client";
import bcrypt from "bcryptjs";
import { centsToDecimalString, parseMoneyToCents } from "../lib/domain/money";
import { paymentStanding } from "../lib/domain/payment";
import { changeStock, money, nextNumber, notifyOwners, upsertCustomer, writeAudit } from "../services/common";

const prisma = new PrismaClient();

const categories = [
  ["Household", "household", "Daily household goods"],
  ["Kitchen", "kitchen", "Pots, tools, and storage"],
  ["Food & Cereals", "food-cereals", "Flour, rice, sugar, and oil"],
  ["Cleaning", "cleaning", "Soaps and cleaners"],
  ["Poultry", "poultry", "Chicken and eggs"],
  ["Home Essentials", "home-essentials", "Light and power"],
  ["Other", "other", "Everything else for the house"],
];

const products = [
  ["Multipurpose cleaner 1L", "CLN-001", "cleaning", "280", "350", 30, 8],
  ["Dishwashing liquid", "CLN-002", "cleaning", "110", "180", 40, 10],
  ["Laundry bar soap", "CLN-003", "cleaning", "70", "120", 50, 12],
  ["Toilet tissue 10 pack", "HHD-001", "household", "300", "450", 24, 6],
  ["Broom and dustpan", "HHD-002", "household", "250", "400", 15, 4],
  ["Bucket 20L", "HHD-003", "household", "220", "350", 18, 4],
  ["Steel wool pack", "KIT-001", "kitchen", "40", "80", 40, 8],
  ["Non-stick frying pan", "KIT-002", "kitchen", "1200", "1890", 10, 3],
  ["Storage container set", "KIT-003", "kitchen", "480", "750", 12, 3],
  ["Maize flour 2kg", "FOOD-001", "food-cereals", "160", "210", 40, 10],
  ["Rice 2kg", "FOOD-002", "food-cereals", "280", "380", 30, 8],
  ["Sugar 1kg", "FOOD-003", "food-cereals", "140", "180", 36, 8],
  ["Cooking oil 1L", "FOOD-004", "food-cereals", "240", "320", 28, 6],
  ["Dressed broiler", "PLT-001", "poultry", "480", "650", 16, 4],
  ["Eggs tray of 30", "PLT-002", "poultry", "420", "550", 20, 5],
  ["LED bulb 9W", "HOME-001", "home-essentials", "140", "250", 25, 6],
  ["Extension cable", "HOME-002", "home-essentials", "620", "890", 8, 2],
] as const;

async function main() {
  const ownerPassword = process.env.SEED_OWNER_PASSWORD;
  const employeePassword = process.env.SEED_EMPLOYEE_PASSWORD;
  if (!ownerPassword || !employeePassword) {
    throw new Error("Set SEED_OWNER_PASSWORD and SEED_EMPLOYEE_PASSWORD before seeding.");
  }

  await prisma.creditPayment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.creditRecord.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.order.deleteMany();
  await prisma.stockTakeItem.deleteMany();
  await prisma.stockTake.deleteMany();
  await prisma.damageReport.deleteMany();
  await prisma.priceChangeRequest.deleteMany();
  await prisma.productPriceHistory.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.session.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.counter.deleteMany();
  await prisma.businessSetting.deleteMany();

  const ownerRole = await prisma.role.create({ data: { name: "OWNER" } });
  const employeeRole = await prisma.role.create({ data: { name: "EMPLOYEE" } });
  const owner = await prisma.user.create({
    data: { name: "Náomé Wanjiku", email: "owner@example.com", phone: "254711000001", passwordHash: await bcrypt.hash(ownerPassword, 12), roleId: ownerRole.id },
  });
  const employee = await prisma.user.create({
    data: { name: "Brian Otieno", email: "employee@example.com", phone: "254711000002", passwordHash: await bcrypt.hash(employeePassword, 12), roleId: employeeRole.id },
  });

  await prisma.businessSetting.create({
    data: {
      id: "default",
      businessName: "SHOP WITH NÁOMÉ",
      phone: "254700000000",
      whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "254700000000",
      email: "hello@shopwithnaome.test",
      address: "Ngong Road, Nairobi",
      openingHours: "Monday to Saturday, 8:00 to 19:00",
      receiptFooter: "Thank you for shopping with Náomé.",
      lowStockDefault: 5,
    },
  });

  const categoryIds = new Map<string, string>();
  for (const [name, slug, description] of categories) {
    const category = await prisma.category.create({ data: { name, slug, description } });
    categoryIds.set(slug, category.id);
  }

  const createdProducts: Prisma.ProductGetPayload<object>[] = [];
  for (const [name, sku, category, cost, selling, stock, minimum] of products) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        sku,
        categoryId: categoryIds.get(category)!,
        description: `${name} from SHOP WITH NÁOMÉ.`,
        imageUrl: `/products/${category}.svg`,
        costPrice: cost,
        sellingPrice: selling,
        stockQuantity: 0,
        minimumStock: minimum,
      },
    });
    await changeStock(prisma, {
      productId: product.id,
      productName: product.name,
      delta: stock,
      movementType: "STOCK_ADDITION",
      userId: owner.id,
      reason: "Opening stock",
    });
    createdProducts.push(product);
  }

  await prisma.product.update({ where: { sku: "HOME-002" }, data: { minimumStock: 10 } });

  async function sell(actorId: string, sku: string, quantity: number, method: PaymentMethod, paid: string, customer?: { name: string; phone: string }, due?: string) {
    const product = createdProducts.find((item) => item.sku === sku)!;
    const fresh = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    const unit = parseMoneyToCents(fresh.sellingPrice.toFixed(2));
    const total = unit * quantity;
    const paidCents = parseMoneyToCents(paid);
    const balance = total - paidCents;
    await prisma.$transaction(async (tx) => {
      const person = customer ? await upsertCustomer(tx, customer) : null;
      const saleNumber = await nextNumber(tx, "sale", "S");
      const sale = await tx.sale.create({
        data: {
          saleNumber,
          employeeId: actorId,
          customerId: person?.id,
          subtotal: money(total),
          total: money(total),
          amountPaid: money(paidCents),
          balance: money(balance),
          paymentStatus: paymentStanding(total, paidCents),
          paymentMethod: method,
        },
      });
      await changeStock(tx, { productId: fresh.id, productName: fresh.name, delta: -quantity, movementType: "SALE", userId: actorId, reason: `Sale ${saleNumber}`, referenceId: sale.id });
      await tx.saleItem.create({
        data: {
          saleId: sale.id,
          productId: fresh.id,
          quantity,
          unitPrice: fresh.sellingPrice,
          costPriceSnapshot: fresh.costPrice,
          subtotal: money(total),
        },
      });
      if (paidCents > 0) {
        await tx.payment.create({ data: { saleId: sale.id, customerId: person?.id, method: method === "CREDIT" ? "CASH" : method, amount: money(paidCents), recordedBy: actorId } });
      }
      if (balance > 0 && person && due) {
        await tx.creditRecord.create({
          data: { saleId: sale.id, customerId: person.id, amount: money(balance), amountPaid: money(0), balance: money(balance), dueDate: new Date(due), status: "UNPAID" },
        });
      }
      await writeAudit(tx, { userId: actorId, action: "sale.completed", entityType: "sale", entityId: sale.id, description: `Completed sale ${saleNumber}.` });
    });
  }

  await sell(employee.id, "FOOD-001", 2, "CASH", "420", { name: "Amina Yusuf", phone: "0712000001" });
  await sell(employee.id, "FOOD-002", 1, "MPESA", "380", { name: "Peter Kamau", phone: "0722000002" });
  await sell(employee.id, "KIT-002", 1, "CREDIT", "0", { name: "Grace Achieng", phone: "0733000003" }, "2026-10-20");
  await sell(owner.id, "CLN-001", 3, "CASH", "700", { name: "Amina Yusuf", phone: "0712000001" });
  await sell(employee.id, "PLT-002", 1, "MPESA", "300", { name: "John Mwangi", phone: "0744000004" }, "2026-09-01");

  await prisma.expense.createMany({
    data: [
      { category: "TRANSPORT", description: "Market run", amount: "800.00", date: new Date(), createdBy: owner.id },
      { category: "ELECTRICITY", description: "Shop power", amount: "2500.00", date: new Date(), createdBy: owner.id },
      { category: "PACKAGING", description: "Paper bags", amount: "450.00", date: new Date(), createdBy: owner.id },
    ],
  });

  const rice = await prisma.product.findUniqueOrThrow({ where: { sku: "FOOD-002" } });
  const customer = await prisma.customer.findUniqueOrThrow({ where: { phone: "254712000001" } });
  const order = await prisma.order.create({
    data: {
      orderNumber: "O-1001",
      customerId: customer.id,
      subtotal: rice.sellingPrice,
      total: rice.sellingPrice,
      deliveryMethod: "DELIVERY",
      deliveryAddress: "Kilimani",
      landmark: "Near the stage",
      status: "NEW",
      paymentStatus: "UNPAID",
      items: { create: { productId: rice.id, quantity: 1, unitPrice: rice.sellingPrice, subtotal: rice.sellingPrice } },
      delivery: { create: { status: "NEW", address: "Kilimani", landmark: "Near the stage" } },
    },
  });
  await prisma.counter.create({ data: { id: "order", value: 1001 } });
  await writeAudit(prisma, { action: "order.created", entityType: "order", entityId: order.id, description: "Amina Yusuf placed online order O-1001." });

  const cleaner = createdProducts.find((item) => item.sku === "CLN-001")!;
  await prisma.damageReport.create({ data: { productId: cleaner.id, quantity: 1, reason: "BROKEN", description: "Bottle leaked in the store.", reportedBy: employee.id } });
  await prisma.priceChangeRequest.create({
    data: { productId: cleaner.id, currentPrice: cleaner.sellingPrice, requestedPrice: "390.00", reason: "Supplier price went up.", requestedBy: employee.id },
  });
  await notifyOwners(prisma, { type: "damage", title: "Damage report", message: "Multipurpose cleaner" });
  await notifyOwners(prisma, { type: "order", title: "New online order", message: "O-1001 from Amina Yusuf" });

  console.log(`Seeded ${createdProducts.length} products. Demo owner owner@example.com and employee employee@example.com.`);
  console.log(centsToDecimalString(42000));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
