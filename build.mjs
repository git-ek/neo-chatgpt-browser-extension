import archiver from 'archiver'
import autoprefixer from 'autoprefixer'
import * as dotenv from 'dotenv'
import esbuild from 'esbuild'
import fs from 'fs-extra'
import * as sass from 'sass'
import postcss from 'postcss'
import tailwindcss from 'tailwindcss'

dotenv.config()

const packageJson = fs.readJsonSync('./package.json')
const outdir = 'build'
const version = packageJson.version

async function deleteOldDir() {
  await fs.remove(outdir)
}

async function processStyles() {
  const processor = postcss([tailwindcss, autoprefixer])

  // Compile content-script styles
  const sassResult = await sass.compileAsync('src/content-script/styles.scss')
  const cssResult = await processor.process(sassResult.css, { from: undefined })
  await fs.outputFile('build/content-script/index.css', cssResult.css)

  // Process base.css for options and popup
  const baseCss = await fs.readFile('src/base.css', 'utf8')
  const baseCssResult = await processor.process(baseCss, { from: undefined })
  await fs.outputFile('build/options/index.css', baseCssResult.css)
  await fs.outputFile('build/popup/index.css', baseCssResult.css)
}

async function runEsbuild() {
  await esbuild.build({
    entryPoints: [
      'src/content-script/index.tsx',
      'src/background/index.ts',
      'src/options/index.tsx',
      'src/popup/index.tsx',
    ],
    bundle: true,
    outdir: outdir,
    treeShaking: true,
    minify: true,
    legalComments: 'none',
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsx: 'automatic',
    loader: {
      '.png': 'dataurl',
    },
    plugins: [],
  })
}

async function zipFolder(dir) {
  const output = fs.createWriteStream(`${dir}.zip`)
  const archive = archiver('zip', {
    zlib: { level: 9 },
  })
  archive.pipe(output)
  archive.directory(dir, false)
  await archive.finalize()
}

async function copyFiles(entryPoints, targetDir) {
  await fs.ensureDir(targetDir)
  await Promise.all(
    entryPoints.map(async (entryPoint) => {
      await fs.copy(entryPoint.src, `${targetDir}/${entryPoint.dst}`)
    }),
  )
}

async function injectManifestVersion(manifestPath, targetDir) {
  const manifest = await fs.readJson(manifestPath)
  manifest.version = version
  await fs.outputJson(`${targetDir}/manifest.json`, manifest, { spaces: 2 })
}

async function build() {
  await deleteOldDir()
  await processStyles()
  await runEsbuild()

  const commonFiles = [
    { src: 'build/content-script/index.js', dst: 'content-script.js' },
    { src: 'build/content-script/index.css', dst: 'content-script.css' },
    { src: 'build/background/index.js', dst: 'background.js' },
    { src: 'build/options/index.js', dst: 'options.js' },
    { src: 'build/options/index.css', dst: 'options.css' },
    { src: 'src/options/index.html', dst: 'options.html' },
    { src: 'build/popup/index.js', dst: 'popup.js' },
    { src: 'build/popup/index.css', dst: 'popup.css' },
    { src: 'src/popup/index.html', dst: 'popup.html' },
    { src: 'src/logo.png', dst: 'logo.png' },
    { src: 'src/_locales', dst: '_locales' },
  ]

  // chromium
  const chromiumDir = `./${outdir}/chromium`
  await copyFiles(commonFiles, chromiumDir)
  await injectManifestVersion('src/manifest.json', chromiumDir)
  await zipFolder(chromiumDir)

  // firefox
  const firefoxDir = `./${outdir}/firefox`
  await copyFiles(commonFiles, firefoxDir)
  await injectManifestVersion('src/manifest.v2.json', firefoxDir)
  await zipFolder(firefoxDir)

  console.log('Build success.')
}

build()
