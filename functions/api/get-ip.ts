export const onRequest: PagesFunction = async (context) => {
  // Cloudflare 会在请求头中自动携带访问者的 IP
  const ip = context.request.headers.get("cf-connecting-ip") || "未知 IP";
  return new Response(
    JSON.stringify({ ip: ip }), 
    {
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
    }
  );
};