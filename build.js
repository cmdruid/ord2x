#!/usr/bin/env node

const esbuild = require('esbuild')

const prod = process.argv.indexOf('prod') !== -1

esbuild
  .build({
    bundle: true,
    entryPoints: {
      'background.build' : './src/background.ts',
      'content.build'    : './src/content.ts',
      'popup.build'      : './src/pages/popup.tsx',
      'prompt.build'     : './src/pages/prompt.tsx',
      'provider.build'   : './src/provider.ts',
      'options.build'    : './src/pages/options.tsx'
    },
    outdir: './extension',
    sourcemap: prod ? false : 'inline',
    define: {
      window : 'self',
      global : 'self'
    }
  })
  .then(() => console.log('build success.'))
