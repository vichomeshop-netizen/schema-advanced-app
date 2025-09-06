// app/routes/api.schema.targets.jsx
import { json } from "@remix-run/node";
import { prisma } from "~/lib/prisma.server";

const API_VERSION = process.env.SHOPIFY_API_VERSION || "2024-10";

async function shopifyGraphQL(shop, token, q) {
  const r = await fetch(`https://${shop}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query: q }),
  });
  return r.json();
}

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  if (!shop) return json({ ok: false, error: "missing shop", paths: ["/"] }, { status: 400 });

  const rec = await prisma.shop.findUnique({ where: { shop } });
  const token = rec?.accessToken;
  if (!token) return json({ ok: true, paths: ["/"] });

  const q = `
  query Targets {
    products(first:1, query:"status:ACTIVE AND published_status:PUBLISHED", sortKey:UPDATED_AT, reverse:true) {
      edges { node { handle } }
    }
    collections(first:1, query:"published_status:PUBLISHED", sortKey:UPDATED_AT, reverse:true) {
      edges { node { handle } }
    }
    pages(first:1, query:"published_status:PUBLISHED", sortKey:UPDATED_AT, reverse:true) {
      edges { node { handle } }
    }
    blogs(first:1) {
      edges { node { handle articles(first:1, sortKey:PUBLISHED_AT, reverse:true){ edges{ node{ handle } } } } }
    }
  }`;

  try {
    const data = await shopifyGraphQL(shop, token, q);
    const p = data?.data?.products?.edges?.[0]?.node?.handle;
    const c = data?.data?.collections?.edges?.[0]?.node?.handle;
    const pg = data?.data?.pages?.edges?.[0]?.node?.handle;
    const b = data?.data?.blogs?.edges?.[0]?.node;
    const a = b?.articles?.edges?.[0]?.node?.handle;

    const paths = ["/"];
    if (p) paths.push(`/products/${p}`);
    if (c) paths.push(`/collections/${c}`);
    if (pg) paths.push(`/pages/${pg}`);
    if (b?.handle && a) paths.push(`/blogs/${b.handle}/${a}`);

    return json({ ok: true, paths: Array.from(new Set(paths)) });
  } catch (e) {
    return json({ ok: true, paths: ["/"], error: String(e) });
  }
}

