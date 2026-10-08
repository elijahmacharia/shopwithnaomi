import { employeeAction, employeeStatusAction, resetAccessAction } from "@/actions/ops";
import { Notice } from "@/components/notice";
import { listEmployees } from "@/services/employees";

export const metadata = { title: "Employees" };

export default async function EmployeesPage({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  const params = await searchParams;
  const employees = await listEmployees();
  return (
    <div className="grid gap-4">
      <h1 className="font-display text-3xl">Employees</h1>
      <Notice error={params.error} notice={params.notice} />
      <ul className="divide-y rounded-md border bg-white">
        {employees.map((employee) => (
          <li key={employee.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <div className="grid flex-1 gap-2">
              <span>{employee.name} · {employee.email} · {employee.role} · {employee.status} · {employee.createdAt.toLocaleDateString("en-KE")}</span>
              <form action={employeeAction} className="grid gap-2 sm:grid-cols-2">
                <input type="hidden" name="id" value={employee.id} />
                <input name="name" required defaultValue={employee.name} aria-label="Name" className="min-h-11 rounded-md border px-3" />
                <input name="phone" required defaultValue={employee.phone ?? ""} aria-label="Phone" className="min-h-11 rounded-md border px-3" />
                <input name="email" type="email" required defaultValue={employee.email} aria-label="Email" className="min-h-11 rounded-md border px-3" />
                <select name="role" defaultValue={employee.role} aria-label="Role" className="min-h-11 rounded-md border px-3"><option value="EMPLOYEE">Employee</option><option value="OWNER">Owner</option></select>
                <button className="min-h-11 rounded-md border px-3">Save employee</button>
              </form>
            </div>
            <span className="flex gap-2">
              <form action={employeeStatusAction}><input type="hidden" name="id" value={employee.id} /><input type="hidden" name="status" value={employee.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"} /><button className="min-h-11 text-sm">{employee.status === "ACTIVE" ? "Deactivate" : "Activate"}</button></form>
              <form action={resetAccessAction}><input type="hidden" name="id" value={employee.id} /><button className="min-h-11 text-sm">Reset access</button></form>
            </span>
          </li>
        ))}
      </ul>
      <form action={employeeAction} className="grid gap-2 rounded-md bg-white p-4 sm:grid-cols-2">
        <input name="name" required placeholder="Name" aria-label="Name" className="min-h-11 rounded-md border px-3" />
        <input name="phone" required placeholder="Phone" aria-label="Phone" className="min-h-11 rounded-md border px-3" />
        <input name="email" type="email" required placeholder="Email" aria-label="Email" className="min-h-11 rounded-md border px-3" />
        <select name="role" aria-label="Role" className="min-h-11 rounded-md border px-3"><option value="EMPLOYEE">Employee</option><option value="OWNER">Owner</option></select>
        <button className="min-h-11 rounded-md bg-brand-ink text-white">Add employee</button>
      </form>
    </div>
  );
}
