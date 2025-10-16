import archiver from 'archiver'
import * as dotenv from 'dotenv'
import fs from 'fs-extra'

dotenv.config()

const packageJson = fs.readJsonSync('./package.json')
const outdir = 'build'
const version = packageJson.version

async function deleteOldDir() {
  await fs.remove(outdir)
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
  try {
    await deleteOldDir()

    // esbuild is now imported dynamically inside the try block
    const esbuild = await import('esbuild')

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
        '.css': 'css',
      },
    })

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
  } catch (error) {
    console.error('Build failed:', error)
    process.exit(1)
  }
}

build()
