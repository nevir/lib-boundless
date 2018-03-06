#!/usr/bin/env node
/**
 * @fileoverview
 * A wrapper around Jest that transforms all references to .js files with their
 * primary .ts path.
 *
 * Why not ts-jest, you ask? Indeed! Well, so…
 *
 *   …ts-jest makes use of TypeScript's _incremental_ compilation API, which has
 *    a number of inconsistencies with regular compilation passes:
 *
 *        * https://github.com/kulshekhar/ts-jest#known-limitations-for-hoisting
 *        * https://github.com/kulshekhar/ts-jest/issues/281
 *        * https://github.com/kulshekhar/ts-jest/pull/362 (pending)
 *        * etc
 *
 *   …jest supports source maps in most places, which means fewer moving parts
 *    to juggle. (except https://github.com/facebook/jest/issues/5730)
 *
 */
const fs = require('fs');
const path = require('path');
const { Transform } = require('stream');
const { spawn } = require('child_process');

const prettyTransformer = new Transform({
  transform(chunk, _encoding, callback) {
    const cleanChunk = chunk.toString().replace(/\.js\b/gi, '.ts');
    callback(null, cleanChunk);
  },
});

const jsonTransformer = new Transform({
  transform(chunk, _encoding, callback) {
    const chunkData = chunk.toString();
    const redirectMatch = /Test results written to: (.+)/.exec(chunkData);

    let data;
    try {
      data = redirectMatch ? JSON.parse(fs.readFileSync(redirectMatch[1])) : JSON.parse(chunkData);
    } catch (error) {
      callback(null, chunkData);
      return;
    }
    const cleanData = transformChunkData(data);

    if (redirectMatch) {
      fs.writeFileSync(redirectMatch[1], JSON.stringify(cleanData));
      callback(null, chunkData);
    } else {
      callback(null, JSON.stringify(chunkData));
    }
  },
});

function transformChunkData(data) {
  if (data.testResults) {
    for (const result of data.testResults) {
      result.name = result.name.replace(/\.js\b/gi, '.ts');
    }
  }
  return data;
}

let args = process.argv.slice(2).map(arg => {
  if (arg.endsWith('.ts')) {
    return `${arg.slice(0, arg.length - 3)}.js`;
  } else {
    return arg;
  }
});

if (!args.includes('--color')) {
  args = ['--color', ...args];
}

// https://github.com/facebook/jest/issues/5730
const watchIndex = args.indexOf('--watch');
if (watchIndex >= 0) {
  args[watchIndex] = '--watchAll';
}

const jestPath = path.resolve(__dirname, '..', 'node_modules', '.bin', 'jest');
const jest = spawn(jestPath, args, { stdio: [process.stdin, 'pipe', 'pipe'] });
jest.stdout.pipe(jsonTransformer).pipe(process.stdout);
jest.stderr.pipe(prettyTransformer).pipe(process.stderr);
