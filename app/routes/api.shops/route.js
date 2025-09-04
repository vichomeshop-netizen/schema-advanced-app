import { json } from "@remix-run/node";
import { listShops } from "~/lib/shop.server";

export async function loader() {
  const shops = await listShops();
  return json({ shops });
}
