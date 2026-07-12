import { redirect } from "next/navigation";

export default function ZomatoOrdersPage() {
  redirect("/admin/orders?source=zomato");
}
