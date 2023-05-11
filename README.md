# Patch

As described by the repository name, I fixed the problem that coc-sumneko-lua extension was not available on nixos (only for non-nix-managed neovim/vim configurations).

## How did I fix this problem?

I added a new configuration field named `sumneko-lua.bin` to specify the path of lua-language-server command. Because if you use nix to manage `sumneko-lua-server` package, you will find that `/nix/store/xxxx-sumneko-lua-server/share/sumneko-lua-server/bin/lua-language-server` is a read-only file and cannot be executed(I think it maybe case by nix sandbox mechanism). And real executable binary should be in `/nix/store/xxxx-sumneko-lua-server/bin/lua-language-server`. But coc-sumneko-lua can only specify serverDir, and bin is indirectly obtained through serverDir, but NixOS cannot meet this condition. So, I added the `sumneko-lua.bin` field so that user can explicitly specify the location of bin.

## How to use?
First, because I did not publish this package on npm, we need to install it through plugins. If I use `vim-plug` to manager your plugins. I should add `Plug 'PHSix/coc-sumneko-lua-for-nixos', {'do': 'yarn install --frozen-lockfile'}` in my vimrc.

And then, if you use `home-manager` or `nix-env` to install sumneko-lua-server, you can configure it as follows:
```json
{
 "sumneko-lua.bin": "~/.nix-profile/bin/lua-language-server",
 "sumneko-lua.serverDir": "~/.nix-profile/share/lua-language-server"
}
```
If you are not using home-manager to manage your user configuration, you can configure it as follows:

```json
{
 "sumneko-lua.bin": "/run/current-system/sw/bin/lua-language-server",
 "sumneko-lua.serverDir": "/run/current-system/sw/share/lua-language-server"
}
```

I hope this helps! Let me know if you have any other questions.

# coc-sumneko-lua

Lua extension using sumneko lua-language-server for coc.nvim

This extension uses server binaries extracted from [`sumneko/vscode-lua`](https://github.com/sumneko/vscode-lua).
You can also custom the server path([`sumneko-lua.serverDir`](https://github.com/xiyaowong/coc-sumneko-lua/blob/main/settings.md#sumneko-luaserverdir)).

## Features

- Supported features by the server

  ![base](https://user-images.githubusercontent.com/47070852/133086083-a5357ca3-ada6-46d9-953f-f86026c137e4.png)

- Nvim lua development(check setting `sumneko-lua.enableNvimLuaDev`). Credit: [folke/neodev.nvim](https://github.com/folke/neodev.nvim)

  ![nvim-lua-dev](https://user-images.githubusercontent.com/47070852/133085674-2310670d-6129-4aac-86ea-0e475bf09b25.gif)

- Inlay-hints provided by coc.nvim.

## Install

`:CocInstall coc-sumneko-lua`

## [Settings(Click me)](https://github.com/xiyaowong/coc-sumneko-lua/blob/main/settings.md)

## Commands

| Command                                  | Description                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| `sumneko-lua.install`                    | Install or update sumneko lua-language-server                                  |
| `sumneko-lua.restart`                    | Restart server                                                                 |
| `sumneko-lua.version`                    | Echo server version                                                            |
| `sumneko-lua.checkUpdate`                | Check update                                                                   |
| `sumneko-lua.showTooltip`                | Show tooltips                                                                  |
| `sumneko-lua.insertNvimLuaPluginLibrary` | Insert nvim lua plugin to current workspace library                            |
| `sumneko-lua.downloadNvimLuaTypes`       | **Download/Update** nvim lua types(Clone https://github.com/folke/neodev.nvim) |

## Credit

- [`fannheyward/coc-rust-analyzer`](https://github.com/fannheyward/coc-rust-analyzer)
- [`sumneko/vscode-lua`](https://github.com/sumneko/vscode-lua)
- [`josa42/coc-lua`](https://github.com/josa42/coc-lua)

## License

MIT

---

> This extension is built with [create-coc-extension](https://github.com/fannheyward/create-coc-extension)
