const fs = require('fs');
const path = require('path');
const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');

async function main() {
  const args = process.argv.slice(2);
  const repoUrl = args[0] || process.env.GITHUB_REPO_URL;
  const token = args[1] || process.env.GITHUB_TOKEN;
  const branch = args[2] || 'main';

  if (!repoUrl) {
    console.log('Usage: node gitPush.js <github-repo-url> <github-personal-access-token> [branch]');
    console.log('Example: node gitPush.js https://github.com/myusername/smart-pharmacy.git ghp_xxxx main');
    process.exit(1);
  }

  const dir = __dirname;
  console.log(`[Git Push] Pushing branch '${branch}' to remote '${repoUrl}'...`);

  // Set or update remote
  try {
    await git.addRemote({ fs, dir, remote: 'origin', url: repoUrl });
  } catch (err) {
    // If remote already exists, update URL
    await git.deleteRemote({ fs, dir, remote: 'origin' });
    await git.addRemote({ fs, dir, remote: 'origin', url: repoUrl });
  }

  const pushResult = await git.push({
    fs,
    http,
    dir,
    remote: 'origin',
    ref: branch,
    url: repoUrl,
    onAuth: () => ({ username: token || '' })
  });

  console.log('[Git Push] Successfully pushed to GitHub!', pushResult);
}

main().catch(err => {
  console.error('[Git Push Error]:', err.message);
  process.exit(1);
});
