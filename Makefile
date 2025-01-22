all:
	cd wasm4/cli && pnpm install && pnpm run package && cd -
	mkdir playground/src/assets/build && cp wasm4/cli-build/* playground/src/assets/build/
	cd wasm4/devtools/web && pnpm install && pnpm run build && cd -
	cd wasm4/runtimes/web && pnpm install && npx pnpm run build && cd -
	cd playground/ && pnpm install && pnpm run build && cd -
