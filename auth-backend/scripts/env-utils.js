const fs = require('fs');

function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing env file: ${filePath}\nCopy .env.example to .env and fill in values.`);
  }

  const env = {};
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

/** .env keys → CloudFormation Parameters in template.yaml */
const ENV_TO_PARAM = {
  FRONTEND_URL: 'FrontendUrl',
  BACKEND_URL: 'BackendUrl',
  JWT_SECRET: 'JwtSecret',
  SMTP_HOST: 'SmtpHost',
  SMTP_PORT: 'SmtpPort',
  SMTP_USER: 'SmtpUser',
  SMTP_PASS: 'SmtpPass',
  SMTP_FROM: 'MailFrom',
  GOOGLE_CLIENT_ID: 'GoogleClientId',
  GOOGLE_CLIENT_SECRET: 'GoogleClientSecret',
  GITHUB_CLIENT_ID: 'GithubClientId',
  GITHUB_CLIENT_SECRET: 'GithubClientSecret',
};

function quoteOverrideValue(value) {
  if (/[\s"{}]/.test(value)) {
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  return value;
}

function buildParameterOverrides(env) {
  const pairs = [];
  for (const [envKey, paramName] of Object.entries(ENV_TO_PARAM)) {
    const value = env[envKey];
    if (value !== undefined && value !== '') {
      pairs.push(`${paramName}=${quoteOverrideValue(value)}`);
    }
  }
  return pairs.join(' ');
}

module.exports = { parseEnv, ENV_TO_PARAM, buildParameterOverrides };
