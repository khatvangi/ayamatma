// /auth - redirects to GitHub OAuth
export async function onRequest(context) {
  const { env } = context;
  const url = new URL(context.request.url);

  const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
  const CLIENT_ID = env.GITHUB_CLIENT_ID;

  const authUrl = new URL(GITHUB_AUTH_URL);
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', `${url.origin}/callback`);
  authUrl.searchParams.set('scope', 'repo,user');

  return Response.redirect(authUrl.toString(), 302);
}
