"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { toUserMessage } from "@/lib/errors";
import { reviewDamage, reviewPriceRequest, createDamageReport, createPriceRequest } from "@/services/approvals";
import { archiveCategory, archiveProduct, createCategory, createProduct, updateProduct } from "@/services/catalog";
import { recordCreditPayment } from "@/services/credit";
import { saveCustomer } from "@/services/customers";
import { archiveExpense, createExpense, updateExpense } from "@/services/expenses";
import { changePassword, createEmployee, resetEmployeeAccess, setEmployeeStatus, updateEmployee, updateProfile } from "@/services/employees";
import { adjustStock, confirmStockTake } from "@/services/inventory";
import { markAllRead, markNotificationRead } from "@/services/notifications";
import { updateOrderStatus } from "@/services/orders";
import { completeSale } from "@/services/sales";
import { updateSettings } from "@/services/settings";
import { imageFromForm } from "@/lib/store-image";

function fail(error: unknown): { ok: false; error: string } {
  unstable_rethrow(error);
  return { ok: false, error: toUserMessage(error) };
}

export async function completeSaleAction(input: unknown) {
  try {
    const result = await completeSale(input);
    revalidatePath("/employee/dashboard");
    revalidatePath("/shop");
    return { ok: true as const, ...result };
  } catch (error) {
    return fail(error);
  }
}

export async function saveProductAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  let uploaded: string | undefined;
  try {
    uploaded = await imageFromForm(formData);
  } catch (error) {
    unstable_rethrow(error);
    const back = id ? `/admin/products/${id}` : "/admin/products";
    redirect(`${back}?error=${encodeURIComponent(toUserMessage(error))}`);
  }
  const payload = {
    name: formData.get("name"),
    sku: formData.get("sku"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    imageUrl: uploaded || (formData.get("removeImage") === "on" ? "" : formData.get("imageUrl")),
    costPrice: formData.get("costPrice"),
    sellingPrice: formData.get("sellingPrice"),
    minimumStock: formData.get("minimumStock"),
    stockQuantity: formData.get("stockQuantity"),
    isActive: formData.get("isActive") === "on",
  };
  try {
    const result = id ? await updateProduct(id, payload) : await createProduct(payload);
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    redirect(`/admin/products?notice=${encodeURIComponent(result?.warning ?? "Product saved.")}`);
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/admin/products?error=${encodeURIComponent(toUserMessage(error))}`);
  }
}

export async function archiveProductAction(formData: FormData) {
  try {
    await archiveProduct(String(formData.get("id")));
    revalidatePath("/admin/products");
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/admin/products?error=${encodeURIComponent(toUserMessage(error))}`);
  }
  redirect("/admin/products?notice=Product archived.");
}

export async function categoryAction(formData: FormData) {
  try {
    await createCategory({ name: formData.get("name"), description: formData.get("description") });
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/admin/products?error=${encodeURIComponent(toUserMessage(error))}`);
  }
  redirect("/admin/products?notice=Category added.");
}

export async function archiveCategoryAction(formData: FormData) {
  try {
    await archiveCategory(String(formData.get("id")));
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/admin/products?error=${encodeURIComponent(toUserMessage(error))}`);
  }
  redirect("/admin/products?notice=Category archived.");
}

export async function stockAction(formData: FormData) {
  try {
    await adjustStock({ productId: formData.get("productId"), quantity: formData.get("quantity"), reason: formData.get("reason") });
    revalidatePath("/admin/inventory");
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/admin/inventory?error=${encodeURIComponent(toUserMessage(error))}`);
  }
  redirect("/admin/inventory?notice=Stock updated.");
}

export async function stockTakeAction(formData: FormData) {
  const items = formData.getAll("productId").map((productId, index) => ({
    productId: String(productId),
    physicalQuantity: Number(formData.getAll("physicalQuantity")[index]),
    reason: String(formData.getAll("reason")[index] ?? ""),
  }));
  try {
    await confirmStockTake({ notes: formData.get("notes"), items });
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/admin/stock-take?error=${encodeURIComponent(toUserMessage(error))}`);
  }
  redirect("/admin/stock-take?notice=Stock take saved.");
}

export async function expenseAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const payload = {
    category: formData.get("category"),
    description: formData.get("description"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    notes: formData.get("notes"),
  };
  try {
    if (id) {
      await updateExpense(id, payload);
    } else {
      await createExpense(payload);
    }
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/admin/expenses?error=${encodeURIComponent(toUserMessage(error))}`);
  }
  redirect("/admin/expenses?notice=Expense saved.");
}

export async function archiveExpenseAction(formData: FormData) {
  await archiveExpense(String(formData.get("id")));
  redirect("/admin/expenses?notice=Expense archived.");
}

export async function creditPaymentAction(formData: FormData) {
  try {
    await recordCreditPayment({
      creditId: formData.get("creditId"),
      amount: formData.get("amount"),
      method: formData.get("method"),
      reference: formData.get("reference"),
    });
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/admin/credit?error=${encodeURIComponent(toUserMessage(error))}`);
  }
  redirect("/admin/credit?notice=Payment recorded.");
}

export async function orderStatusAction(formData: FormData) {
  try {
    await updateOrderStatus(String(formData.get("id")), String(formData.get("status")));
    revalidatePath("/admin/orders");
    revalidatePath("/shop");
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/admin/orders?error=${encodeURIComponent(toUserMessage(error))}`);
  }
  redirect("/admin/orders?notice=Order updated.");
}

export async function damageAction(formData: FormData) {
  let photoUrl: string | undefined;
  try {
    photoUrl = await imageFromForm(formData, "photo");
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/employee/damage-reports?error=${encodeURIComponent(toUserMessage(error))}`);
  }
  try {
    await createDamageReport({
      productId: formData.get("productId"),
      quantity: formData.get("quantity"),
      reason: formData.get("reason"),
      description: formData.get("description"),
      photoUrl,
    });
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/employee/damage-reports?error=${encodeURIComponent(toUserMessage(error))}`);
  }
  redirect("/employee/damage-reports?notice=Damage report submitted.");
}

export async function priceRequestAction(formData: FormData) {
  try {
    await createPriceRequest({
      productId: formData.get("productId"),
      requestedPrice: formData.get("requestedPrice"),
      reason: formData.get("reason"),
    });
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/employee/price-requests?error=${encodeURIComponent(toUserMessage(error))}`);
  }
  redirect("/employee/price-requests?notice=Price change request submitted.");
}

export async function reviewDamageAction(formData: FormData) {
  try {
    await reviewDamage(String(formData.get("id")), String(formData.get("decision")) as "APPROVED" | "REJECTED", String(formData.get("note") ?? ""));
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/admin/approvals?error=${encodeURIComponent(toUserMessage(error))}`);
  }
  redirect("/admin/approvals?notice=Damage report updated.");
}

export async function reviewPriceAction(formData: FormData) {
  try {
    await reviewPriceRequest(String(formData.get("id")), String(formData.get("decision")) as "APPROVED" | "REJECTED", String(formData.get("note") ?? ""));
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/admin/approvals?error=${encodeURIComponent(toUserMessage(error))}`);
  }
  redirect("/admin/approvals?notice=Price request updated.");
}

export async function employeeAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const payload = { name: formData.get("name"), phone: formData.get("phone"), email: formData.get("email"), role: formData.get("role") };
  try {
    if (id) {
      await updateEmployee(id, payload);
      redirect("/admin/employees?notice=Employee updated.");
    }
    const created = await createEmployee(payload);
    redirect(`/admin/employees?notice=${encodeURIComponent(`Temporary password: ${created.temporaryPassword}`)}`);
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/admin/employees?error=${encodeURIComponent(toUserMessage(error))}`);
  }
}

export async function employeeStatusAction(formData: FormData) {
  await setEmployeeStatus(String(formData.get("id")), String(formData.get("status")) as "ACTIVE" | "INACTIVE");
  redirect("/admin/employees?notice=Employee updated.");
}

export async function resetAccessAction(formData: FormData) {
  const password = await resetEmployeeAccess(String(formData.get("id")));
  redirect(`/admin/employees?notice=${encodeURIComponent(`Temporary password: ${password}`)}`);
}

export async function settingsAction(formData: FormData) {
  try {
    await updateSettings({
      businessName: formData.get("businessName"),
      phone: formData.get("phone"),
      whatsappNumber: formData.get("whatsappNumber"),
      email: formData.get("email"),
      address: formData.get("address"),
      openingHours: formData.get("openingHours"),
      receiptFooter: formData.get("receiptFooter"),
      lowStockDefault: formData.get("lowStockDefault"),
    });
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/admin/settings?error=${encodeURIComponent(toUserMessage(error))}`);
  }
  redirect("/admin/settings?notice=Settings saved.");
}

export async function customerAction(formData: FormData) {
  const id = String(formData.get("id") ?? "") || undefined;
  try {
    await saveCustomer(
      {
        name: formData.get("name"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        address: formData.get("address"),
        landmark: formData.get("landmark"),
      },
      id,
    );
  } catch (error) {
    unstable_rethrow(error);
    redirect(`${id ? `/admin/customers/${id}` : "/admin/customers"}?error=${encodeURIComponent(toUserMessage(error))}`);
  }
  redirect(id ? `/admin/customers/${id}?notice=Customer saved.` : "/admin/customers?notice=Customer saved.");
}

function profilePath(formData: FormData) {
  const next = String(formData.get("returnTo") ?? "");
  return next === "/admin/profile" ? "/admin/profile" : "/employee/profile";
}

export async function profileAction(formData: FormData) {
  try {
    await updateProfile({ name: formData.get("name"), phone: formData.get("phone") });
  } catch (error) {
    unstable_rethrow(error);
    redirect(`${profilePath(formData)}?error=${encodeURIComponent(toUserMessage(error))}`);
  }
  redirect(`${profilePath(formData)}?notice=Profile saved.`);
}

export async function passwordAction(formData: FormData) {
  try {
    await changePassword({ currentPassword: formData.get("currentPassword"), nextPassword: formData.get("nextPassword") });
  } catch (error) {
    unstable_rethrow(error);
    redirect(`${profilePath(formData)}?error=${encodeURIComponent(toUserMessage(error))}`);
  }
  redirect(`${profilePath(formData)}?notice=Password updated.`);
}

export async function readNotificationAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (id === "all") {
    await markAllRead();
  } else {
    await markNotificationRead(id);
  }
  const next = String(formData.get("next") ?? "/employee/notifications");
  redirect(next.startsWith("/") ? next : "/employee/notifications");
}
