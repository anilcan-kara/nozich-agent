const { contextBridge, ipcRenderer, webUtils } = require('electron')

contextBridge.exposeInMainWorld('nozichDesktop', {
  getConnection: profile => ipcRenderer.invoke('nozich:connection', profile),
  revalidateConnection: () => ipcRenderer.invoke('nozich:connection:revalidate'),
  touchBackend: profile => ipcRenderer.invoke('nozich:backend:touch', profile),
  getGatewayWsUrl: profile => ipcRenderer.invoke('nozich:gateway:ws-url', profile),
  openSessionWindow: (sessionId, opts) => ipcRenderer.invoke('nozich:window:openSession', sessionId, opts),
  openNewSessionWindow: () => ipcRenderer.invoke('nozich:window:openNewSession'),
  getBootProgress: () => ipcRenderer.invoke('nozich:boot-progress:get'),
  getConnectionConfig: profile => ipcRenderer.invoke('nozich:connection-config:get', profile),
  saveConnectionConfig: payload => ipcRenderer.invoke('nozich:connection-config:save', payload),
  applyConnectionConfig: payload => ipcRenderer.invoke('nozich:connection-config:apply', payload),
  testConnectionConfig: payload => ipcRenderer.invoke('nozich:connection-config:test', payload),
  probeConnectionConfig: remoteUrl => ipcRenderer.invoke('nozich:connection-config:probe', remoteUrl),
  oauthLoginConnectionConfig: remoteUrl => ipcRenderer.invoke('nozich:connection-config:oauth-login', remoteUrl),
  oauthLogoutConnectionConfig: remoteUrl => ipcRenderer.invoke('nozich:connection-config:oauth-logout', remoteUrl),
  profile: {
    get: () => ipcRenderer.invoke('nozich:profile:get'),
    set: name => ipcRenderer.invoke('nozich:profile:set', name)
  },
  api: request => ipcRenderer.invoke('nozich:api', request),
  notify: payload => ipcRenderer.invoke('nozich:notify', payload),
  requestMicrophoneAccess: () => ipcRenderer.invoke('nozich:requestMicrophoneAccess'),
  readFileDataUrl: filePath => ipcRenderer.invoke('nozich:readFileDataUrl', filePath),
  readFileText: filePath => ipcRenderer.invoke('nozich:readFileText', filePath),
  selectPaths: options => ipcRenderer.invoke('nozich:selectPaths', options),
  writeClipboard: text => ipcRenderer.invoke('nozich:writeClipboard', text),
  saveImageFromUrl: url => ipcRenderer.invoke('nozich:saveImageFromUrl', url),
  saveImageBuffer: (data, ext) => ipcRenderer.invoke('nozich:saveImageBuffer', { data, ext }),
  saveClipboardImage: () => ipcRenderer.invoke('nozich:saveClipboardImage'),
  getPathForFile: file => {
    try {
      return webUtils.getPathForFile(file) || ''
    } catch {
      return ''
    }
  },
  normalizePreviewTarget: (target, baseDir) => ipcRenderer.invoke('nozich:normalizePreviewTarget', target, baseDir),
  watchPreviewFile: url => ipcRenderer.invoke('nozich:watchPreviewFile', url),
  stopPreviewFileWatch: id => ipcRenderer.invoke('nozich:stopPreviewFileWatch', id),
  setTitleBarTheme: payload => ipcRenderer.send('nozich:titlebar-theme', payload),
  setNativeTheme: mode => ipcRenderer.send('nozich:native-theme', mode),
  setTranslucency: payload => ipcRenderer.send('nozich:translucency', payload),
  setPreviewShortcutActive: active => ipcRenderer.send('nozich:previewShortcutActive', Boolean(active)),
  openExternal: url => ipcRenderer.invoke('nozich:openExternal', url),
  fetchLinkTitle: url => ipcRenderer.invoke('nozich:fetchLinkTitle', url),
  sanitizeWorkspaceCwd: cwd => ipcRenderer.invoke('nozich:workspace:sanitize', cwd),
  settings: {
    getDefaultProjectDir: () => ipcRenderer.invoke('nozich:setting:defaultProjectDir:get'),
    setDefaultProjectDir: dir => ipcRenderer.invoke('nozich:setting:defaultProjectDir:set', dir),
    pickDefaultProjectDir: () => ipcRenderer.invoke('nozich:setting:defaultProjectDir:pick')
  },
  revealLogs: () => ipcRenderer.invoke('nozich:logs:reveal'),
  getRecentLogs: () => ipcRenderer.invoke('nozich:logs:recent'),
  readDir: dirPath => ipcRenderer.invoke('nozich:fs:readDir', dirPath),
  gitRoot: startPath => ipcRenderer.invoke('nozich:fs:gitRoot', startPath),
  worktrees: cwds => ipcRenderer.invoke('nozich:fs:worktrees', cwds),
  terminal: {
    dispose: id => ipcRenderer.invoke('nozich:terminal:dispose', id),
    resize: (id, size) => ipcRenderer.invoke('nozich:terminal:resize', id, size),
    start: options => ipcRenderer.invoke('nozich:terminal:start', options),
    write: (id, data) => ipcRenderer.invoke('nozich:terminal:write', id, data),
    onData: (id, callback) => {
      const channel = `nozich:terminal:${id}:data`
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on(channel, listener)
      return () => ipcRenderer.removeListener(channel, listener)
    },
    onExit: (id, callback) => {
      const channel = `nozich:terminal:${id}:exit`
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on(channel, listener)
      return () => ipcRenderer.removeListener(channel, listener)
    }
  },
  onClosePreviewRequested: callback => {
    const listener = () => callback()
    ipcRenderer.on('nozich:close-preview-requested', listener)
    return () => ipcRenderer.removeListener('nozich:close-preview-requested', listener)
  },
  onOpenUpdatesRequested: callback => {
    const listener = () => callback()
    ipcRenderer.on('nozich:open-updates', listener)
    return () => ipcRenderer.removeListener('nozich:open-updates', listener)
  },
  onDeepLink: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('nozich:deep-link', listener)
    return () => ipcRenderer.removeListener('nozich:deep-link', listener)
  },
  signalDeepLinkReady: () => ipcRenderer.invoke('nozich:deep-link-ready'),
  onWindowStateChanged: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('nozich:window-state-changed', listener)
    return () => ipcRenderer.removeListener('nozich:window-state-changed', listener)
  },
  onFocusSession: callback => {
    const listener = (_event, sessionId) => callback(sessionId)
    ipcRenderer.on('nozich:focus-session', listener)
    return () => ipcRenderer.removeListener('nozich:focus-session', listener)
  },
  onNotificationAction: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('nozich:notification-action', listener)
    return () => ipcRenderer.removeListener('nozich:notification-action', listener)
  },
  onPreviewFileChanged: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('nozich:preview-file-changed', listener)
    return () => ipcRenderer.removeListener('nozich:preview-file-changed', listener)
  },
  onBackendExit: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('nozich:backend-exit', listener)
    return () => ipcRenderer.removeListener('nozich:backend-exit', listener)
  },
  onPowerResume: callback => {
    const listener = () => callback()
    ipcRenderer.on('nozich:power-resume', listener)
    return () => ipcRenderer.removeListener('nozich:power-resume', listener)
  },
  onBootProgress: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('nozich:boot-progress', listener)
    return () => ipcRenderer.removeListener('nozich:boot-progress', listener)
  },
  // First-launch bootstrap progress -- emitted by the install.ps1 stage
  // runner in main.cjs (apps/desktop/electron/bootstrap-runner.cjs).
  // Renderer's install overlay subscribes to live events and queries the
  // current snapshot via getBootstrapState() to recover after a devtools
  // reload mid-bootstrap.
  getBootstrapState: () => ipcRenderer.invoke('nozich:bootstrap:get'),
  resetBootstrap: () => ipcRenderer.invoke('nozich:bootstrap:reset'),
  repairBootstrap: () => ipcRenderer.invoke('nozich:bootstrap:repair'),
  cancelBootstrap: () => ipcRenderer.invoke('nozich:bootstrap:cancel'),
  onBootstrapEvent: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('nozich:bootstrap:event', listener)
    return () => ipcRenderer.removeListener('nozich:bootstrap:event', listener)
  },
  getVersion: () => ipcRenderer.invoke('nozich:version'),
  uninstall: {
    summary: () => ipcRenderer.invoke('nozich:uninstall:summary'),
    run: mode => ipcRenderer.invoke('nozich:uninstall:run', { mode })
  },
  updates: {
    check: () => ipcRenderer.invoke('nozich:updates:check'),
    apply: opts => ipcRenderer.invoke('nozich:updates:apply', opts),
    getBranch: () => ipcRenderer.invoke('nozich:updates:branch:get'),
    setBranch: name => ipcRenderer.invoke('nozich:updates:branch:set', name),
    onProgress: callback => {
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on('nozich:updates:progress', listener)
      return () => ipcRenderer.removeListener('nozich:updates:progress', listener)
    }
  },
  themes: {
    fetchMarketplace: id => ipcRenderer.invoke('nozich:vscode-theme:fetch', id),
    searchMarketplace: query => ipcRenderer.invoke('nozich:vscode-theme:search', query)
  }
})
