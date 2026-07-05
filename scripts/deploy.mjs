import { execSync } from 'node:child_process'

function run(command) {
  execSync(command, { stdio: 'inherit' })
}

function read(command) {
  return execSync(command, { encoding: 'utf8' }).trim()
}

run('npm run build')

const branch = read('git rev-parse --abbrev-ref HEAD')
const status = read('git status --short')

console.log('')
console.log('Build completed.')
console.log('This repository publishes production through GitHub Actions after a push to main.')

if (branch !== 'main') {
  console.log(`Current branch: ${branch}`)
  console.log('Switch to main and push it to trigger the deployment workflow.')
  process.exit(1)
}

if (status) {
  console.log('There are uncommitted changes, so the workflow would still deploy the previous commit.')
  console.log('Commit your changes and run: git push origin main')
  console.log('If GitHub Pages is configured to publish directly from the gh-pages branch, use: npm run deploy:pages')
  process.exit(1)
}

console.log('Next step: git push origin main')
console.log('If your repository is configured for branch-based Pages instead of Actions, use: npm run deploy:pages')
