// ===== crypto-utils.js (new file) =====
import crypto from 'crypto';
import os from 'os';
import path from 'path';
import fs from 'fs';
import prompts from 'prompts';
import c from 'chalk';
//import { validateGitHubToken, getBranchesWithAuth, getFolderOfBranchWithAuth } from './helpers.js';

const dirname = import.meta.dirname;
const rapideBaseDir = path.join(dirname, '..', '..');
const log = (...x) => console.log(...x);

// Simple encryption using machine-specific key
function getMachineKey() {
  const machineId = os.hostname() + os.platform() + os.arch();
  return crypto.createHash('sha256').update(machineId).digest('hex').slice(0, 32);
}

export function encryptToken(token) {
  const key = getMachineKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;

}

export function decryptToken(encryptedToken) {
  try {
    const key = getMachineKey();
    const [ivHex, encrypted] = encryptedToken.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) {
    return null; // Invalid token file
  }
}

// ===== helpers.js (additions to existing file) =====
// Add these functions to your existing helpers.js

export async function validateGitHubToken(token, testUser = 'ironboy', testRepo = 'react-rapide-teacher') {
  try {
    const response = await fetch(`https://api.github.com/repos/${testUser}/${testRepo}`, {
      headers: { 'Authorization': `token ${token}` }
    });
    return response.status === 200;
  } catch (e) {
    return false;
  }
}

export async function getBranchesWithAuth(gitHubUser, repository, token = null, filter = () => true) {
  const headers = token ? { 'Authorization': `token ${token}` } : {};

  try {
    // Use GitHub API for authenticated requests
    const response = await fetch(`https://api.github.com/repos/${gitHubUser}/${repository}/branches`, {
      headers
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const branches = await response.json();
    return branches
      .map(branch => branch.name)
      .filter(filter)
      .sort();
  } catch (e) {
    // Fallback to original scraping method for public repos
    if (!token) {
      return getBranches(gitHubUser, repository, filter);
    }
    throw e;
  }
}

const teacherTokenFile = path.join(rapideBaseDir, '.teacher-token');
const teacherRepo = 'react-rapide-teacher'; // Your private teacher repo
const teacherUser = 'ironboy'; // Your GitHub username

// Add teacher authentication functions
async function getTeacherToken() {
  if (fs.existsSync(teacherTokenFile)) {
    const encryptedToken = fs.readFileSync(teacherTokenFile, 'utf-8');
    return decryptToken(encryptedToken);
  }
  return null;
}

async function isTeacherAuthenticated() {
  const token = await getTeacherToken();
  if (!token) return false;

  return await validateGitHubToken(token, teacherUser, teacherRepo);
}

export async function teacherLogin() {
  log('');
  log(c.bold(c.green('TEACHER LOGIN')));
  log('');
  log('To access teacher examples, you need a GitHub Personal Access Token');
  log('with access to the private teacher repository.');
  log('');
  log('Generate one at: https://github.com/settings/tokens');
  log('Required permissions: repo (Full control of private repositories)');
  log('');
  const { token } = await prompts({
    type: 'password',
    name: 'token',
    message: 'Enter your GitHub Personal Access Token:'
  });

  if (!token) {
    log(c.yellow('Login cancelled.'));
    return false;
  }

  log('');
  log('Validating token...');

  if (await validateGitHubToken(token, teacherUser, teacherRepo)) {
    // Store encrypted token
    const encrypted = encryptToken(token);
    fs.writeFileSync(teacherTokenFile, encrypted, 'utf-8');

    log(c.green(c.bold('✓ Teacher access enabled!')));
    log('');
    return true;
  } else {
    log(c.red('✗ Invalid token or no access to teacher repository.'));
    log('');
    return false;
  }
}

export async function teacherLogout() {
  if (fs.existsSync(teacherTokenFile)) {
    fs.rmSync(teacherTokenFile, { force: true });
    if (fs.existsSync(teacherTokenFile)) {
      log(c.red("ERROR: COULD NOT LOGOUT"));
    }
    log(c.yellow('Teacher access removed.'));
  } else {
    log('No teacher access to remove.');
  }
  log('');
}
