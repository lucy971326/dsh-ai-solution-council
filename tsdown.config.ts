/**
 * Independent copy of the DSH client-bundle contract.
 *
 * The plugin must be buildable outside the DSH checkout, so this file keeps
 * the loader wrapper, platform externals, purity guard, and CSS-module
 * injection locally instead of importing the main repository's build config.
 */
import { readFile } from 'node:fs/promises'
import { basename, dirname, relative, resolve as resolvePath, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { UserConfig } from 'tsdown'
import { transform } from 'lightningcss'

const CSS_VIRTUAL_PREFIX = '\0dsh-css:'
const CSS_VIRTUAL_SUFFIX = '.mjs'

const PLATFORM_MODULES = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-web-react',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-ui-attachment',
  '@deepseek-ai/dsh-client-schema-form',
] as const

const CLIENT_EXTERNALS = [...PLATFORM_MODULES, '@deepseek-ai/dsh-client-runtime/client']
const INLINE_SAFE = /^@deepseek-ai\/dsh-(host-apiproxy|session|llm|tools|brand)(\/|$)/
const VENDORED_LIBRARY = /^@deepseek-ai\/(cosmokit|schemastery)(\/|$)/
const GENERATED_REMOTE = /^@deepseek-ai\/dsh-[a-z0-9]+(?:-[a-z0-9]+)*\/remote$/
const REPOSITORY_ROOT = resolvePath(dirname(fileURLToPath(import.meta.url)), '..', 'deepseek-harness')

function browserSourcePath(source: string, sourcemapPath: string): string {
  if (!source.startsWith('.')) return source
  const physicalSource = resolvePath(dirname(sourcemapPath), source)
  const repositoryPath = relative(REPOSITORY_ROOT, physicalSource).split(sep).join('/')
  return repositoryPath.startsWith('packages/') ? `../../../${repositoryPath}` : source
}

function nodeConfig(id: string, entries: readonly string[]): UserConfig {
  return {
    name: id,
    entry: [...entries],
    outDir: 'lib',
    format: ['esm'],
    platform: 'node',
    target: 'es2024',
    fixedExtension: false,
    dts: false,
    clean: false,
  }
}

function clientConfig(id: string): UserConfig {
  return {
    name: `${id}/client`,
    entry: { client: 'src/client/index.ts' },
    outDir: 'lib',
    format: 'cjs',
    platform: 'browser',
    sourcemap: true,
    dts: false,
    clean: false,
    external: CLIENT_EXTERNALS,
    noExternal: (specifier: string) => CLIENT_EXTERNALS.includes(specifier) ? undefined : true,
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
      'import.meta.env.MODE': JSON.stringify(process.env.NODE_ENV ?? 'production'),
      'import.meta.env': JSON.stringify({ MODE: process.env.NODE_ENV ?? 'production' }),
    },
    plugins: [{
      name: 'dsh-client-bundle-purity',
      resolveId(specifier: string) {
        if (!specifier.startsWith('@deepseek-ai/')) return null
        if (CLIENT_EXTERNALS.includes(specifier)) return null
        if (VENDORED_LIBRARY.test(specifier) || INLINE_SAFE.test(specifier) || GENERATED_REMOTE.test(specifier)) return null
        throw new Error(`client bundle purity: unexpected value import ${specifier}`)
      },
    }, {
      name: 'dsh-css-modules-inline',
      resolveId(specifier: string, importer: string | undefined) {
        if (!specifier.endsWith('.module.css')) return null
        const physical = importer === undefined ? specifier : resolvePath(dirname(importer), specifier)
        return CSS_VIRTUAL_PREFIX + physical + CSS_VIRTUAL_SUFFIX
      },
      async load(virtualId: string) {
        if (!virtualId.startsWith(CSS_VIRTUAL_PREFIX)) return null
        const fileId = virtualId.slice(CSS_VIRTUAL_PREFIX.length, -CSS_VIRTUAL_SUFFIX.length)
        this.addWatchFile(fileId)
        const source = await readFile(fileId)
        const compiled = transform({
          filename: fileId,
          code: source,
          cssModules: { pattern: '[hash]_[local]' },
          minify: true,
        })
        const classMap: Record<string, string> = {}
        for (const [local, value] of Object.entries(compiled.exports ?? {})) classMap[local] = value.name
        const tagId = `${id}/${basename(fileId)}`
        return [
          `const css = ${JSON.stringify(compiled.code.toString())};`,
          `const tagId = ${JSON.stringify(tagId)};`,
          'if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {',
          '  const tag = document.createElement("style");',
          `  tag.dataset.plugin = ${JSON.stringify(id)};`,
          '  tag.dataset.pluginCss = tagId;',
          '  tag.textContent = css;',
          '  document.head.appendChild(tag);',
          '}',
          `export default ${JSON.stringify(classMap)};`,
        ].join('\n')
      },
    }],
    outputOptions: {
      entryFileNames: 'client.js',
      sourcemapPathTransform: browserSourcePath,
      banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(id)}, factory: (require) => {`,
      footer: 'return module.exports; } });',
      intro: 'var module = { exports: {} }; var exports = module.exports;',
    },
  }
}

export default ({ env }: { env?: Record<string, unknown> }): UserConfig[] => {
  const face = env?.DSH_BUILD_FACE
  if (face !== undefined && face !== 'host' && face !== 'client') {
    throw new Error(`invalid DSH_BUILD_FACE: ${String(face)}`)
  }
  const host = nodeConfig('dsh-ai-solution-council', [
    'src/index.ts',
    'src/remote.ts',
    'src/remote-service.ts',
  ])
  const client = clientConfig('dsh-ai-solution-council')
  if (face === 'host') return [host]
  if (face === 'client') return [client]
  return [host, client]
}
