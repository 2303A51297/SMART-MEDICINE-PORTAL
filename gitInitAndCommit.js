const fs = require('fs');
const path = require('path');
const git = require('isomorphic-git');

async function run() {
  const dir = __dirname;
  console.log('[Git] Initializing repository in:', dir);
  
  await git.init({ fs, dir });
  console.log('[Git] Initialized .git directory successfully.');

  // Read .gitignore
  const gitignoreContent = fs.existsSync(path.join(dir, '.gitignore'))
    ? fs.readFileSync(path.join(dir, '.gitignore'), 'utf8')
    : '';

  // Get status of all files
  const statusMatrix = await git.statusMatrix({
    fs,
    dir,
    filter: (f) => !f.startsWith('.git/') && !f.includes('node_modules') && !f.includes('dist') && !f.includes('.env')
  });

  console.log(`[Git] Found ${statusMatrix.length} files to track.`);

  for (const [filepath, head, worktree, stage] of statusMatrix) {
    if (worktree === 1 || worktree === 2) {
      await git.add({ fs, dir, filepath });
    }
  }

  const sha = await git.commit({
    fs,
    dir,
    author: {
      name: 'Rahul',
      email: 'student@medipharm.local'
    },
    message: 'feat: complete smart medicine ordering & pharmacy management portal with docker and k8s'
  });

  console.log('[Git] Committed with commit SHA:', sha);
}

run().catch(console.error);
