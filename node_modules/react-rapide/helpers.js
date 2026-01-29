import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import AdmZip from 'adm-zip';

export async function getBranches(gitHubUser, repository, filter = () => true) {
  let page = 1;
  const branches = [];
  while (true) {
    const url = `https://github.com/${gitHubUser}/${repository}/branches/all?page=${page}`;
    const html = await (await fetch(url)).text();
    const $ = cheerio.load(html);
    if (!$('div[title]').length) { break; }
    $('div[title]').each(function () {
      branches.push($(this).text());
    });
    page++;
  }
  return branches.filter(filter).sort();
}

export async function getReadMeOfBranch(gitHubUser, repository, branch, shortenTo = Infinity) {
  let variants = ['README.md', 'Readme.md', 'readme.md'];
  const url = `https://raw.githubusercontent.com/${gitHubUser}/${repository}/refs/heads/${branch}/`;
  let text = '';
  for (let variant of variants) {
    const response = await fetch(url + variant).catch(_e => { });
    if (response.status === 200) { text = (await response.text()).slice(0, shortenTo); break; }
  }
  return text;
}

export async function getFolderOfBranch(folderPath, gitHubUser, repository, branch) {
  const url = `https://github.com/${gitHubUser}/${repository}`
    + `/archive/${branch}.zip`;
  try {
    const data = Buffer.from(await (await fetch(url)).arrayBuffer());
    new AdmZip(data).extractAllTo(folderPath, true);
    packageDiffPatch(path.join(folderPath, repository + '-' + branch));
  }
  catch (_e) { console.log(_e); return false; }
  return true;
}

function packageDiffPatch(packageJsonFolder) {
  // Note: Patchning our package json!
  let ourPackageJsonPath = path.join(import.meta.dirname, 'package.json');
  let one = JSON.parse(fs.readFileSync(ourPackageJsonPath, 'utf-8'));
  let two = JSON.parse(fs.readFileSync(path.join(packageJsonFolder, 'package.json'), 'utf-8'));
  let oldOneDeps = JSON.stringify(one.dependencies);
  let oldOneDevDeps = JSON.stringify(one.devDependencies);
  one.dependencies = { ...(one.dependencies || {}), ...(two.dependencies || {}) };
  one.devDependencies = { ...(one.devDependencies || {}), ...(two.devdDependencies || {}) };
  fs.writeFileSync(ourPackageJsonPath, JSON.stringify(one, null, '  '));
  let changes = oldOneDeps !== JSON.stringify(one.dependencies)
    || oldOneDevDeps !== JSON.stringify(one.devDependencies);
  changes && execSync('npm install');
}