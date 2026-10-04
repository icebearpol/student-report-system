const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

// Keep Metro fast on Windows: don't watch Next build output / caches.
config.watcher = {
  ...(config.watcher ?? {}),
  additionalExts: [...(config.watcher?.additionalExts ?? [])],
  healthCheck: {
    ...(config.watcher?.healthCheck ?? {}),
    enabled: false,
  },
};
config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList) ? config.resolver.blockList : []),
  /apps\/admin-web\/\.next\/.*/,
  /apps\/student-mobile\/dist\/.*/,
  /apps\/student-mobile\/\.expo\/.*/,
];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Force a single copy of React for web: Metro otherwise resolves
// workspace-hoisted react@18.3.1 alongside the app's react@18.2.0,
// which produces "Invalid hook call / useMemo of null" and a blank page.
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules ?? {}),
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-dom': path.resolve(projectRoot, 'node_modules/react-dom'),
};

module.exports = config;