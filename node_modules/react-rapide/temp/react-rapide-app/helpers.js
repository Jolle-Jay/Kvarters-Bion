import * as cheerio from 'cheerio';
import AdmZip from 'adm-zip';

export async function getBranches(gitHubUser, repository, filter = () => true, token) {
  let page = 1;
  const branches = [];
  if (!token) {
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
  }
  if (token) {
    const headers = token ? { 'Authorization': `token ${token}` } : {};
    let url = `https://api.github.com/repos/${gitHubUser}/${repository}/branches?per_page=100`;
    while (url) {
      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const someBranches = await response.json();
      branches.push(...someBranches.map(branch => branch.name));

      // Parse Link header for next page URL
      const linkHeader = response.headers.get('Link');
      url = linkHeader?.match(/<([^>]+)>;\s*rel="next"/)?.[1] || null;
    }
  }
  return branches.filter(filter).sort();
}

export async function getReadMeOfBranch(gitHubUser, repository, branch, token) {
  if (token && branch.includes('teacher-')) { branch = branch.replace(/teacher-/, ''); repository += '-teacher'; }
  const headers = token ? { 'Authorization': `token ${token}` } : {};
  let variants = ['README.md', 'Readme.md', 'readme.md'];
  const url = `https://raw.githubusercontent.com/${gitHubUser}/${repository}/refs/heads/${branch}/`;
  let text = '';
  for (let variant of variants) {
    const response = await fetch(url + variant, { headers }).catch(_e => { });
    if (response.status === 200) { text = (await response.text()); break; }
  }
  return text;
}

export async function getFolderOfBranch(folderPath, gitHubUser, repository, branch, token) {
  if (token && branch.includes('teacher-')) { branch = branch.replace(/teacher-/, ''); repository += '-teacher'; }

  const headers = token ? { 'Authorization': `token ${token}` } : {};
  const url = `https://github.com/${gitHubUser}/${repository}`
    + `/archive/${branch}.zip`;
  try {
    const data = Buffer.from(await (await fetch(url, { headers })).arrayBuffer());
    new AdmZip(data).extractAllTo(folderPath, true);
  }
  catch (_e) { console.log(_e); return false; }
  return true;
}