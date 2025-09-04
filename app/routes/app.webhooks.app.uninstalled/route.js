export { action } from "../webhooks.app_uninstalled/route";
export const loader = () => new Response("Not Found", { status: 404 });
