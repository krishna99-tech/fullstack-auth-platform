#!/usr/bin/env node
/**
 * Reads .env → sam build → sam deploy with parameter_overrides.
 *
 * Usage:
 *   node scripts/sam-deploy-env.js
 *   node scripts/sam-deploy-env.js --guided
 *   node scripts/sam-deploy-env.js --env-file .env.production
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { parseEnv, buildParameterOverrides } = require('./env-utils');

const root = path.join(__dirname, '..');
const args = process.argv.slice(2);
const guided = args.includes('--guided');
const envFileArg = args.find((a) => a.startsWith('--env-file='));
const envFile = envFileArg ? envFileArg.split('=')[1] : path.join(root, '.env');

function run(cmd, cmdArgs) {
  console.log(`\n> ${cmd} ${cmdArgs.join(' ')}\n`);
  const result = spawnSync(cmd, cmdArgs, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    cwd: root,
    env: { ...process.env, SAM_CLI_TELEMETRY: '0' },
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const dotenv = path.join(root, '.env');
const envExample = path.join(root, '.env.example');
if (!fs.existsSync(dotenv) && fs.existsSync(envExample)) {
  fs.copyFileSync(envExample, dotenv);
  console.log('Created .env from .env.example — edit secrets before deploy.');
}

const samconfig = path.join(root, 'samconfig.toml');
const samconfigExample = path.join(root, 'samconfig.toml.example');
if (!fs.existsSync(samconfig) && fs.existsSync(samconfigExample)) {
  fs.copyFileSync(samconfigExample, samconfig);
  console.log('Created samconfig.toml from samconfig.toml.example');
}

let env;
try {
  env = parseEnv(envFile);
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

const region = env.AWS_REGION || 'us-east-1';

if (!env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET is empty — set it in .env before deploy.');
}

const overrides = buildParameterOverrides(env);

run('sam', ['build']);

const deployArgs = ['deploy', '--region', region];

if (guided) {
  deployArgs.push('--guided');
} else if (fs.existsSync(path.join(root, 'samconfig.toml'))) {
  deployArgs.push('--no-confirm-changeset');
} else {
  deployArgs.push('--guided');
}

if (overrides) {
  deployArgs.push('--parameter-overrides', overrides);
}

run('sam', deployArgs);

console.log('\nDeploy complete. Update frontend NEXT_PUBLIC_API_URL to:');
console.log(`  ${env.BACKEND_URL || `https://YOUR_API.execute-api.${region}.amazonaws.com/Prod`}/api`);
