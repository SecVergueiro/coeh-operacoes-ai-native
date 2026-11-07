const {copyFileSync, mkdirSync, readFileSync, writeFileSync} = require('node:fs');
const {join} = require('node:path');

const root = join(__dirname, '..');
const panel = join(root, 'painel');
const output = join(root, 'work', 'vercel-public');

// Only these files belong in the public artifact. The editable server and its
// data directory are deliberately outside it.
const assets = ['styles.css', 'app.js', 'data.js', 'mensagens.js', 'assets/coeh.svg'];
mkdirSync(join(output, 'assets'), {recursive: true});
for (const asset of assets) {
  copyFileSync(join(panel, asset), join(output, asset));
}

const html = readFileSync(join(panel, 'index.html'), 'utf8')
  .replace('<head>', '<head>\n  <meta name="coeh-mode" content="public-demo">')
  .replace(/^  <script src="api\.js"><\/script>\r?\n/m, '');
writeFileSync(join(output, 'index.html'), html);
