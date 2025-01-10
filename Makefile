all:
	cd wasm4/devtools/web && pnpm install && pnpm run build && cd -
	cd wasm4/runtimes/web && pnpm install && pnpm run build && cd -
	cd playground/ && pnpm install && pnpm run build && cd -
