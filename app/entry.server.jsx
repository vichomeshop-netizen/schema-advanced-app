// app/entry.server.jsx
import { RemixServer } from "@remix-run/react";
import { renderToString } from "react-dom/server";

export default function handleRequest(request, statusCode, headers, context) {
  const markup = renderToString(<RemixServer context={context} url={request.url} />);
  headers.set("Content-Type", "text/html");
  return new Response("<!DOCTYPE html>" + markup, { status: statusCode, headers });
}
