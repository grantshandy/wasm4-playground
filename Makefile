all:
	cd wasm4/runtimes/web && npm run prepare && npm install && npm run build && cd -
	cd playground/ && npm install && npm run build && cd -
