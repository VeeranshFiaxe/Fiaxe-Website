/* Live captions for a web call. The page opens a socket to the Worker and
   sends the same audio chunks it is recording; the Worker holds a second
   socket to Deepgram and passes messages both ways, so the Deepgram key never
   reaches the browser and needs no key-minting scope.

   Only the Worker can do this: `next dev` has no WebSocket route, so captions
   are simply absent locally (components/site/LiveCall.tsx copes). */

// Cloudflare's WebSocket extras, declared locally so this file type-checks
// under the Next.js tsconfig without pulling in workers-types.
declare const WebSocketPair: { new (): { 0: WebSocket; 1: WebSocket } };
type CfSocket = WebSocket & { accept(): void };
type CfResponse = Response & { webSocket?: CfSocket };

const DEEPGRAM =
  "https://api.deepgram.com/v1/listen?model=nova-3&language=multi&smart_format=true&punctuate=true&interim_results=true";

const ALLOWED = [/^https?:\/\/localhost(:\d+)?$/, /^https:\/\/([a-z0-9-]+\.)*fiaxe\.com$/];

export async function liveTranscribe(request: Request, env: { DEEPGRAM_API_KEY?: string }): Promise<Response> {
  if (request.headers.get("upgrade")?.toLowerCase() !== "websocket") {
    return new Response("Expected a WebSocket", { status: 426 });
  }
  if (!env.DEEPGRAM_API_KEY) return new Response("Live captions are not configured", { status: 503 });

  const origin = request.headers.get("origin") ?? "";
  if (!ALLOWED.some((re) => re.test(origin))) return new Response("Forbidden", { status: 403 });

  const upstream: CfResponse = await fetch(DEEPGRAM, {
    headers: { Upgrade: "websocket", Authorization: `Token ${env.DEEPGRAM_API_KEY}` },
  });
  const deepgram = upstream.webSocket;
  if (!deepgram) return new Response("Deepgram refused the socket", { status: 502 });
  deepgram.accept();

  const pair = new WebSocketPair();
  const client = pair[0];
  const page = pair[1] as CfSocket;
  page.accept();

  page.addEventListener("message", relay(deepgram)); // audio up
  deepgram.addEventListener("message", relay(page)); // words down

  const bye = (socket: WebSocket) => () => {
    try {
      socket.close();
    } catch {
      // already gone
    }
  };
  page.addEventListener("close", () => {
    try {
      if (deepgram.readyState === WebSocket.OPEN) deepgram.send(JSON.stringify({ type: "CloseStream" }));
    } catch {
      // already gone
    }
    bye(deepgram)();
  });
  page.addEventListener("error", bye(deepgram));
  deepgram.addEventListener("close", bye(page));
  deepgram.addEventListener("error", bye(page));

  return new Response(null, { status: 101, webSocket: client } as ResponseInit & { webSocket: WebSocket });
}

/* Pass a frame on untouched. Binary can arrive as a Blob, which has to be
   read before it can be sent again; the queue keeps those reads in order,
   because an Opus stream is worthless out of sequence. */
function relay(target: WebSocket) {
  let queue: Promise<void> = Promise.resolve();
  const send = (data: string | ArrayBuffer) => {
    if (target.readyState === WebSocket.OPEN) target.send(data);
  };
  return (event: Event) => {
    const data = (event as MessageEvent).data as string | ArrayBuffer | Blob;
    if (typeof data === "string" || data instanceof ArrayBuffer) {
      queue = queue.then(() => send(data));
      return;
    }
    queue = queue.then(() => data.arrayBuffer().then(send)).catch(() => {});
  };
}
