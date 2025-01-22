let
  nixpkgs = fetchTarball "https://github.com/NixOS/nixpkgs/tarball/nixos-24.11";
  pkgs = import nixpkgs { };
in pkgs.mkShellNoCC {
  packages = with pkgs; [ pnpm nodejs esbuild wine64 wine64Packages.wayland ];
}