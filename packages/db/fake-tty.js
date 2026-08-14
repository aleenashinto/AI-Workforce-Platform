Object.defineProperty(process.stdout, 'isTTY', {value: true});
Object.defineProperty(process.stdin, 'isTTY', {value: true});
require('drizzle-kit/bin.cjs');
