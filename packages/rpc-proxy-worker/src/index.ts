import { Hono } from "hono";
import { Bindings } from "@/bindings";
import { chainById, sourceChainById } from "@superchain-tools/chains";
import { getRpcUrlId } from "@/getRpcUrlId";

const allChainById = { ...chainById, ...sourceChainById };

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.all("/:chainId/*", async (c) => {
  const chainId = c.req.param("chainId");
  const chain = allChainById[Number(chainId)];

  if (!chain) {
    return c.json({ error: "Chain not supported" }, 400);
  }

  // @ts-expect-error
  const rpcUrl = c.env[getRpcUrlId(chain)];

  if (!rpcUrl) {
    return c.json({ error: "Chain not supported" }, 400);
  }

  try {
    const response = await fetch(rpcUrl, {
      method: c.req.method,
      headers: c.req.header(),
      body: c.req.raw.body,
    });

    // Create a new response with cleaned headers
    const cleanedResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers({
        "content-type":
          response.headers.get("content-type") || "application/json",
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET, POST, OPTIONS",
        "access-control-allow-headers": "Content-Type",
      }),
    });

    return cleanedResponse;
  } catch (error) {
    // Return a generic error without exposing internal details
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;
