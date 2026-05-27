// tsc emits `exports.default = Badge` for default exports in CJS mode.
// Consumers using require() expect `module.exports = Badge` directly.
// This script appends the bridge so both patterns work.
const fs = require('fs');
const path = './lib/cjs/index.js';
const content = fs.readFileSync(path, 'utf8');
fs.writeFileSync(path, content + '\nmodule.exports = exports.default;\nmodule.exports.default = exports.default;\n');
