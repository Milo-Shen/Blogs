const Q = require('q');
const BlueBird = require('bluebird');

Promise.resolve().then(() => console.log('native promise resolved'));
BlueBird.resolve().then(() => console.log('bluebird promise resolved'));
setImmediate(() => console.log('set immediate'));
Q.resolve().then(() => console.log('q promise resolved'));
process.nextTick(() => console.log('next tick'));
setTimeout(() => console.log('set timeout'), 0);
Q.reject().catch(() => console.log('q promise rejected'));
BlueBird.reject().catch(() => console.log('bluebird promise rejected'));
Promise.reject().catch(() => console.log('native promise rejected'));