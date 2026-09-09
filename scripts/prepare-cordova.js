const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const sourceDirectory = path.join(projectRoot, 'client', 'dist');
const targetDirectory = path.join(projectRoot, 'www');

if (!fs.existsSync(sourceDirectory)) {
  throw new Error('client/dist does not exist. Run the client build first.');
}

fs.rmSync(targetDirectory, { recursive: true, force: true });
fs.cpSync(sourceDirectory, targetDirectory, { recursive: true });

console.log(`Prepared Cordova web assets in ${path.relative(projectRoot, targetDirectory)}/`);