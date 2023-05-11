import { ExtensionContext, window } from 'coc.nvim';
import { writeFile, existsSync, mkdirSync, readFile, readFileSync } from 'fs-extra';
import path from 'path';
import * as cmds from './commands';
import { Ctx } from './ctx';
import { downloadServer } from './downloader';

const isNixos = () => {
  return process.platform === 'linux' && readFileSync('/etc/os-release').toString().split('\n').some(line => line === 'ID=nixos');
};

export async function activate(context: ExtensionContext): Promise<void> {
  const ctx = new Ctx(context);
  const _isNixos = isNixos();
  if (!ctx.config.enabled) {
    return;
  }

  const serverRoot = context.storagePath;
  if (!existsSync(serverRoot)) {
    mkdirSync(serverRoot);
  }

  ctx.registerCommand('install', cmds.install);

  const bin = ctx.resolveBin();
  if (!bin && !_isNixos) {
    let ret = 'Yes';
    if (ctx.config.prompt) {
      ret =
        (await window.showInformationMessage(
          'Sumneko lua language server is not found, install now?',
          'Yes',
          'Cancel'
        )) || 'Yes';
    }
    if (ret == 'Yes') {
      try {
        await downloadServer(context);
      } catch (e) {
        console.error(e);
        window.showInformationMessage('Download Sumneko lua language server failed', 'error');
        return;
      }
    } else {
      window.showInformationMessage(
        `You can run ':CocCommand sumneko-lua.install' to install server manually or provide setting 'serverDir'`
      );
      return;
    }
  }
  if (_isNixos && (!ctx.config.bin || !ctx.config.serverDir)) {
    window.showWarningMessage('You current use NixOS, you must set sumneko-lua.bin and sumneko-lua.serverDir manually.');
  } else if (!bin) {
    window.showWarningMessage('You current use NixOS, you sumneko-lua.bin or sumneko-lua.serverDir is wrong, make sure you write a correct path.');
  }

  ctx.registerCommand('version', cmds.version);
  ctx.registerCommand('restart', (ctx) => {
    return async () => {
      window.showInformationMessage(`Reloading sumneko lua-language-server...`);

      for (const sub of ctx.subscriptions) {
        try {
          sub.dispose();
        } catch (e) {
          console.error(e);
        }
      }

      await activate(context);

      window.showInformationMessage(`Reloaded sumneko lua-language-server`);
    };
  });
  ctx.registerCommand('showTooltip', cmds.showTooltip);
  ctx.registerCommand('insertNvimLuaPluginLibrary', cmds.insertNvimLuaPluginLibrary);
  ctx.registerCommand('checkUpdate', () => async () => await ctx.checkUpdate());
  ctx.registerCommand('downloadNvimLuaTypes', cmds.downloadNvimLuaTypes);

  await ctx.startServer();
  if (ctx.config.checkUpdate) {
    const dataPath = path.join(context.storagePath, 'checkUpdate');
    let lastCheck = 0;
    if (existsSync(dataPath)) {
      lastCheck = Number((await readFile(dataPath)).toString());
    }
    const now = Date.now();
    if (now - lastCheck > 4 * 60 * 60 * 1000) {
      await ctx.checkUpdate();
      await writeFile(dataPath, now.toString());
    }
  }
}
