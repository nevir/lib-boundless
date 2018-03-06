#!/usr/bin/env node
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
    const data = redirectMatch ? JSON.parse(fs.readFileSync(redirectMatch[1])) : JSON.parse(chunkData);

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

const jestPath = path.resolve(__dirname, '..', 'node_modules', '.bin', 'jest');
const jest = spawn(jestPath, args, { stdio: [process.stdin, 'pipe', 'pipe'] });
jest.stdout.pipe(jsonTransformer).pipe(process.stdout);
jest.stderr.pipe(prettyTransformer).pipe(process.stderr);
