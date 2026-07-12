import { redirect } from "next/navigation";

export default function SwiggyOrdersPage() {
  redirect("/admin/orders?source=swiggy");
}
