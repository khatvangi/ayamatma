// /callback - exchanges code for token and returns to CMS
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const code = url.searchParams.get('code');
  if (!code) {
    return new Response('Missing code', { status: 400 });
  }

  const CLIENT_ID = env.GITHUB_CLIENT_ID;
  const CLIENT_SECRET = env.GITHUB_CLIENT_SECRET;

  // Exchange code for token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: code,
    }),
  });

  const data = await tokenRes.json();

  if (data.error) {
    return new Response(`Error: ${data.error_description}`, { status: 400 });
  }

  // Return token to CMS via postMessage
  const html = `<!DOCTYPE html>
<html>
<head><title>Authenticating...</title></head>
<body>
<script>
(function() {
  function sendMessage(msg) {
    window.opener.postMessage(msg, "*");
  }
  sendMessage("authorizing:github");
  sendMessage('authorization:github:success:{"token":"${data.access_token}","provider":"github"}');
  setTimeout(function() { window.close(); }, 1000);
})();
</script>
<p>Authenticating with GitHub... You can close this window.</p>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
