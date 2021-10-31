./node_modules/.bin/esbuild src/extension/background.ts --outdir=build/dist --bundle
./node_modules/.bin/esbuild src/extension/popup/app.tsx --outfile=build/dist/popup/app.js --bundle
cp src/extension/manifest.json build/dist/manifest.json
cp src/extension/popup/popup.html build/dist/popup/popup.html
cp -R src/extension/icons build/dist