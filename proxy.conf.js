const { fixRequestBody, responseInterceptor } = require('http-proxy-middleware');
const fs = require('fs');

const credentialsPath = process.env.OPENSKY_CREDENTIALS_PATH || '';
const tokenUrl =
  'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';

const tokenState = {
  accessToken: process.env.OPENSKY_ACCESS_TOKEN || '',
  expiresAt: process.env.OPENSKY_ACCESS_TOKEN ? Number.MAX_SAFE_INTEGER : 0,
  pending: null,
};

function readOpenSkyCredentials() {
  if (process.env.OPENSKY_CLIENT_ID && process.env.OPENSKY_CLIENT_SECRET) {
    return {
      clientId: process.env.OPENSKY_CLIENT_ID,
      clientSecret: process.env.OPENSKY_CLIENT_SECRET,
    };
  }

  if (!credentialsPath) {
    return null;
  }

  if (!fs.existsSync(credentialsPath)) {
    return null;
  }
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  return {
    clientId: credentials.clientId || credentials.client_id,
    clientSecret: credentials.clientSecret || credentials.client_secret,
  };
}

function getCachedToken() {
  return Date.now() < tokenState.expiresAt ? tokenState.accessToken : '';
}

async function refreshOpenSkyToken() {
  if (getCachedToken()) {
    return tokenState.accessToken;
  }
  if (tokenState.pending) {
    return tokenState.pending;
  }

  const credentials = readOpenSkyCredentials();
  if (!credentials?.clientId || !credentials?.clientSecret) {
    return '';
  }

  tokenState.pending = fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`OpenSky token request failed with status ${response.status}`);
      }
      return response.json();
    })
    .then((tokenResponse) => {
      tokenState.accessToken = tokenResponse.access_token || '';
      tokenState.expiresAt =
        Date.now() + Math.max((tokenResponse.expires_in || 1800) - 60, 60) * 1000;
      return tokenState.accessToken;
    })
    .catch((error) => {
      console.warn(error.message);
      tokenState.accessToken = '';
      tokenState.expiresAt = 0;
      return '';
    })
    .finally(() => {
      tokenState.pending = null;
    });

  return tokenState.pending;
}

refreshOpenSkyToken();

module.exports = {
  '/opensky': {
    target: 'https://opensky-network.org',
    secure: true,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
      '^/opensky': '',
    },
    headers: {
      Accept: 'application/json',
    },
    onProxyReq: (proxyReq, req, res) => {
      fixRequestBody(proxyReq, req, res);
      const token = getCachedToken();
      if (token) {
        proxyReq.setHeader('Authorization', `Bearer ${token}`);
      } else {
        refreshOpenSkyToken();
      }
    },
  },
  '/adsbdb': {
    target: 'https://api.adsbdb.com',
    secure: true,
    changeOrigin: true,
    selfHandleResponse: true,
    logLevel: 'debug',
    pathRewrite: {
      '^/adsbdb': '',
    },
    headers: {
      Accept: 'application/json',
    },
    onProxyReq: fixRequestBody,
    onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
      if (proxyRes.statusCode === 404) {
        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.setHeader('content-type', 'application/json');
        return JSON.stringify({ response: null });
      }
      return responseBuffer;
    }),
  },
};
