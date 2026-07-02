"use strict";
/* eslint-disable vue/one-component-per-file */
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const vue_1 = require("vue");
const panelDataMap = new WeakMap();
module.exports = Editor.Panel.define({
    listeners: {
        show() {
            console.log('[MCP Panel] Panel shown');
        },
        hide() {
            console.log('[MCP Panel] Panel hidden');
        },
    },
    template: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/template/default/index.html'), 'utf-8'),
    style: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/style/default/index.css'), 'utf-8'),
    $: {
        app: '#app',
        panelTitle: '#panelTitle',
    },
    ready() {
        if (this.$.app) {
            const app = (0, vue_1.createApp)({});
            app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ui-');
            // 创建主应用组件
            app.component('McpServerApp', (0, vue_1.defineComponent)({
                setup() {
                    // 响应式数据
                    const activeTab = (0, vue_1.ref)('server');
                    const serverRunning = (0, vue_1.ref)(false);
                    const serverStatus = (0, vue_1.ref)('已停止');
                    const connectedClients = (0, vue_1.ref)(0);
                    const httpUrl = (0, vue_1.ref)('');
                    const isProcessing = (0, vue_1.ref)(false);
                    const settings = (0, vue_1.ref)({
                        port: 3000,
                        autoStart: false,
                        debugLog: false,
                        maxConnections: 10,
                        authToken: ''
                    });
                    const availableTools = (0, vue_1.ref)([]);
                    const toolCategories = (0, vue_1.ref)([]);
                    // 计算属性
                    const statusClass = (0, vue_1.computed)(() => ({
                        'status-running': serverRunning.value,
                        'status-stopped': !serverRunning.value
                    }));
                    const totalTools = (0, vue_1.computed)(() => availableTools.value.length);
                    const enabledTools = (0, vue_1.computed)(() => availableTools.value.filter(t => t.enabled).length);
                    const disabledTools = (0, vue_1.computed)(() => totalTools.value - enabledTools.value);
                    const settingsChanged = (0, vue_1.ref)(false);
                    // 方法
                    const switchTab = (tabName) => {
                        activeTab.value = tabName;
                        if (tabName === 'tools') {
                            loadToolManagerState();
                        }
                    };
                    const toggleServer = async () => {
                        try {
                            if (serverRunning.value) {
                                await Editor.Message.request('cocos-mcp-server', 'stop-server');
                            }
                            else {
                                // 启动服务器时使用当前面板设置
                                const currentSettings = {
                                    port: settings.value.port,
                                    autoStart: settings.value.autoStart,
                                    enableDebugLog: settings.value.debugLog,
                                    maxConnections: settings.value.maxConnections,
                                    authToken: settings.value.authToken
                                };
                                await Editor.Message.request('cocos-mcp-server', 'update-settings', currentSettings);
                                await Editor.Message.request('cocos-mcp-server', 'start-server');
                            }
                            console.log('[Vue App] Server toggled');
                        }
                        catch (error) {
                            console.error('[Vue App] Failed to toggle server:', error);
                        }
                    };
                    const saveSettings = async () => {
                        try {
                            // 创建一个简单的对象，避免克隆错误
                            const settingsData = {
                                port: settings.value.port,
                                autoStart: settings.value.autoStart,
                                enableDebugLog: settings.value.debugLog,
                                maxConnections: settings.value.maxConnections,
                                authToken: settings.value.authToken
                            };
                            const result = await Editor.Message.request('cocos-mcp-server', 'update-settings', settingsData);
                            console.log('[Vue App] Save settings result:', result);
                            settingsChanged.value = false;
                        }
                        catch (error) {
                            console.error('[Vue App] Failed to save settings:', error);
                        }
                    };
                    const copyUrl = async () => {
                        try {
                            await navigator.clipboard.writeText(httpUrl.value);
                            console.log('[Vue App] URL copied to clipboard');
                        }
                        catch (error) {
                            console.error('[Vue App] Failed to copy URL:', error);
                        }
                    };
                    const loadToolManagerState = async () => {
                        try {
                            const result = await Editor.Message.request('cocos-mcp-server', 'getToolManagerState');
                            if (result && result.success) {
                                // 总是加载后端状态，确保数据是最新的
                                availableTools.value = result.availableTools || [];
                                console.log('[Vue App] Loaded tools:', availableTools.value.length);
                                // 更新工具分类
                                const categories = new Set(availableTools.value.map(tool => tool.category));
                                toolCategories.value = Array.from(categories);
                            }
                        }
                        catch (error) {
                            console.error('[Vue App] Failed to load tool manager state:', error);
                        }
                    };
                    const updateToolStatus = async (category, name, enabled) => {
                        try {
                            console.log('[Vue App] updateToolStatus called:', category, name, enabled);
                            // 先更新本地状态
                            const toolIndex = availableTools.value.findIndex(t => t.category === category && t.name === name);
                            if (toolIndex !== -1) {
                                availableTools.value[toolIndex].enabled = enabled;
                                // 强制触发响应式更新
                                availableTools.value = [...availableTools.value];
                                console.log('[Vue App] Local state updated, tool enabled:', availableTools.value[toolIndex].enabled);
                            }
                            // 调用后端更新
                            const result = await Editor.Message.request('cocos-mcp-server', 'updateToolStatus', category, name, enabled);
                            if (!result || !result.success) {
                                // 如果后端更新失败，回滚本地状态
                                if (toolIndex !== -1) {
                                    availableTools.value[toolIndex].enabled = !enabled;
                                    availableTools.value = [...availableTools.value];
                                }
                                console.error('[Vue App] Backend update failed, rolled back local state');
                            }
                            else {
                                console.log('[Vue App] Backend update successful');
                            }
                        }
                        catch (error) {
                            // 如果发生错误，回滚本地状态
                            const toolIndex = availableTools.value.findIndex(t => t.category === category && t.name === name);
                            if (toolIndex !== -1) {
                                availableTools.value[toolIndex].enabled = !enabled;
                                availableTools.value = [...availableTools.value];
                            }
                            console.error('[Vue App] Failed to update tool status:', error);
                        }
                    };
                    const selectAllTools = async () => {
                        try {
                            // 直接更新本地状态，然后保存
                            availableTools.value.forEach(tool => tool.enabled = true);
                            await saveChanges();
                        }
                        catch (error) {
                            console.error('[Vue App] Failed to select all tools:', error);
                        }
                    };
                    const deselectAllTools = async () => {
                        try {
                            // 直接更新本地状态，然后保存
                            availableTools.value.forEach(tool => tool.enabled = false);
                            await saveChanges();
                        }
                        catch (error) {
                            console.error('[Vue App] Failed to deselect all tools:', error);
                        }
                    };
                    const saveChanges = async () => {
                        try {
                            // 创建普通对象，避免Vue3响应式对象克隆错误
                            const updates = availableTools.value.map(tool => ({
                                category: String(tool.category),
                                name: String(tool.name),
                                enabled: Boolean(tool.enabled)
                            }));
                            console.log('[Vue App] Sending updates:', updates.length, 'tools');
                            const result = await Editor.Message.request('cocos-mcp-server', 'updateToolStatusBatch', updates);
                            if (result && result.success) {
                                console.log('[Vue App] Tool changes saved successfully');
                            }
                        }
                        catch (error) {
                            console.error('[Vue App] Failed to save tool changes:', error);
                        }
                    };
                    const toggleCategoryTools = async (category, enabled) => {
                        try {
                            // 直接更新本地状态，然后保存
                            availableTools.value.forEach(tool => {
                                if (tool.category === category) {
                                    tool.enabled = enabled;
                                }
                            });
                            await saveChanges();
                        }
                        catch (error) {
                            console.error('[Vue App] Failed to toggle category tools:', error);
                        }
                    };
                    const getToolsByCategory = (category) => {
                        return availableTools.value.filter(tool => tool.category === category);
                    };
                    const getCategoryDisplayName = (category) => {
                        const categoryNames = {
                            'scene': '场景工具',
                            'node': '节点工具',
                            'component': '组件工具',
                            'prefab': '预制体工具',
                            'project': '项目工具',
                            'debug': '调试工具',
                            'preferences': '偏好设置工具',
                            'server': '服务器工具',
                            'broadcast': '广播工具',
                            'sceneAdvanced': '高级场景工具',
                            'sceneView': '场景视图工具',
                            'referenceImage': '参考图片工具',
                            'assetAdvanced': '高级资源工具',
                            'validation': '验证工具'
                        };
                        return categoryNames[category] || category;
                    };
                    // 监听设置变化
                    (0, vue_1.watch)(settings, () => {
                        settingsChanged.value = true;
                    }, { deep: true });
                    // 组件挂载时加载数据
                    (0, vue_1.onMounted)(async () => {
                        // 加载工具管理器状态
                        await loadToolManagerState();
                        // 从服务器状态获取设置信息
                        try {
                            const serverStatus = await Editor.Message.request('cocos-mcp-server', 'get-server-status');
                            if (serverStatus && serverStatus.settings) {
                                settings.value = {
                                    port: serverStatus.settings.port || 3000,
                                    autoStart: serverStatus.settings.autoStart || false,
                                    debugLog: serverStatus.settings.enableDebugLog || false,
                                    maxConnections: serverStatus.settings.maxConnections || 10,
                                    authToken: serverStatus.settings.authToken || ''
                                };
                                console.log('[Vue App] Server settings loaded from status:', serverStatus.settings);
                            }
                            else if (serverStatus && serverStatus.port) {
                                // 兼容旧版本，只获取端口信息
                                settings.value.port = serverStatus.port;
                                console.log('[Vue App] Port loaded from server status:', serverStatus.port);
                            }
                        }
                        catch (error) {
                            console.error('[Vue App] Failed to get server status:', error);
                            console.log('[Vue App] Using default server settings');
                        }
                        // 定期更新服务器状态
                        setInterval(async () => {
                            try {
                                const result = await Editor.Message.request('cocos-mcp-server', 'get-server-status');
                                if (result) {
                                    serverRunning.value = result.running;
                                    serverStatus.value = result.running ? '运行中' : '已停止';
                                    connectedClients.value = result.clients || 0;
                                    httpUrl.value = result.running ? `http://localhost:${result.port}` : '';
                                    isProcessing.value = false;
                                }
                            }
                            catch (error) {
                                console.error('[Vue App] Failed to get server status:', error);
                            }
                        }, 2000);
                    });
                    return {
                        // 数据
                        activeTab,
                        serverRunning,
                        serverStatus,
                        connectedClients,
                        httpUrl,
                        isProcessing,
                        settings,
                        availableTools,
                        toolCategories,
                        settingsChanged,
                        // 计算属性
                        statusClass,
                        totalTools,
                        enabledTools,
                        disabledTools,
                        // 方法
                        switchTab,
                        toggleServer,
                        saveSettings,
                        copyUrl,
                        loadToolManagerState,
                        updateToolStatus,
                        selectAllTools,
                        deselectAllTools,
                        saveChanges,
                        toggleCategoryTools,
                        getToolsByCategory,
                        getCategoryDisplayName
                    };
                },
                template: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/template/vue/mcp-server-app.html'), 'utf-8'),
            }));
            app.mount(this.$.app);
            panelDataMap.set(this, app);
            console.log('[MCP Panel] Vue3 app mounted successfully');
        }
    },
    beforeClose() { },
    close() {
        const app = panelDataMap.get(this);
        if (app) {
            app.unmount();
        }
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zb3VyY2UvcGFuZWxzL2RlZmF1bHQvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLCtDQUErQzs7QUFFL0MsdUNBQXdDO0FBQ3hDLCtCQUE0QjtBQUM1Qiw2QkFBaUc7QUFFakcsTUFBTSxZQUFZLEdBQUcsSUFBSSxPQUFPLEVBQVksQ0FBQztBQTZCN0MsTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztJQUNqQyxTQUFTLEVBQUU7UUFDUCxJQUFJO1lBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQzNDLENBQUM7UUFDRCxJQUFJO1lBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQzVDLENBQUM7S0FDSjtJQUNELFFBQVEsRUFBRSxJQUFBLHVCQUFZLEVBQUMsSUFBQSxXQUFJLEVBQUMsU0FBUyxFQUFFLDZDQUE2QyxDQUFDLEVBQUUsT0FBTyxDQUFDO0lBQy9GLEtBQUssRUFBRSxJQUFBLHVCQUFZLEVBQUMsSUFBQSxXQUFJLEVBQUMsU0FBUyxFQUFFLHlDQUF5QyxDQUFDLEVBQUUsT0FBTyxDQUFDO0lBQ3hGLENBQUMsRUFBRTtRQUNDLEdBQUcsRUFBRSxNQUFNO1FBQ1gsVUFBVSxFQUFFLGFBQWE7S0FDNUI7SUFDRCxLQUFLO1FBQ0QsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ2IsTUFBTSxHQUFHLEdBQUcsSUFBQSxlQUFTLEVBQUMsRUFBRSxDQUFDLENBQUM7WUFDMUIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsZUFBZSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRTVFLFVBQVU7WUFDVixHQUFHLENBQUMsU0FBUyxDQUFDLGNB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QywyQ0FBMkMsQ0FBQyxDQUFDO1FBQzdELENBQUM7SUFDTCxDQUFDO0lBQ0QsV0FBVyxLQUFLLENBQUM7SUFDakIsS0FBSztRQUNELE1BQU0sR0FBRyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkMsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNOLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNsQixDQUFDO0lBQ0wsQ0FBQztDQUNKLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIHZ1ZS9vbmUtY29tcG9uZW50LXBlci1maWxlICovXG5cbmltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IGNyZWF0ZUFwcCwgQXBwLCBkZWZpbmVDb21wb25lbnQsIHJlZiwgY29tcHV0ZWQsIG9uTW91bnRlZCwgd2F0Y2gsIG5leHRUaWNrIH0gZnJvbSAndnVlJztcblxuY29uc3QgcGFuZWxEYXRhTWFwID0gbmV3IFdlYWtNYXA8YW55LCBBcHA+KCk7XG5cbi8vIOWumuS5ieW3peWFt+mFjee9ruaOpeWPo1xuaW50ZXJmYWNlIFRvb2xDb25maWcge1xuICAgIGNhdGVnb3J5OiBzdHJpbmc7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47XG4gICAgZGVzY3JpcHRpb246IHN0cmluZztcbn1cblxuLy8g5a6a5LmJ6YWN572u5o6l5Y+jXG5pbnRlcmZhY2UgQ29uZmlndXJhdGlvbiB7XG4gICAgaWQ6IHN0cmluZztcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgICB0b29sczogVG9vbENvbmZpZ1tdO1xuICAgIGNyZWF0ZWRBdDogc3RyaW5nO1xuICAgIHVwZGF0ZWRBdDogc3RyaW5nO1xufVxuXG4vLyDlrprkuYnmnI3liqHlmajorr7nva7mjqXlj6NcbmludGVyZmFjZSBTZXJ2ZXJTZXR0aW5ncyB7XG4gICAgcG9ydDogbnVtYmVyO1xuICAgIGF1dG9TdGFydDogYm9vbGVhbjtcbiAgICBkZWJ1Z0xvZzogYm9vbGVhbjtcbiAgICBtYXhDb25uZWN0aW9uczogbnVtYmVyO1xuICAgIGF1dGhUb2tlbjogc3RyaW5nO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRvci5QYW5lbC5kZWZpbmUoe1xuICAgIGxpc3RlbmVyczoge1xuICAgICAgICBzaG93KCkgeyBcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbTUNQIFBhbmVsXSBQYW5lbCBzaG93bicpOyBcbiAgICAgICAgfSxcbiAgICAgICAgaGlkZSgpIHsgXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW01DUCBQYW5lbF0gUGFuZWwgaGlkZGVuJyk7IFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgdGVtcGxhdGU6IHJlYWRGaWxlU3luYyhqb2luKF9fZGlybmFtZSwgJy4uLy4uLy4uL3N0YXRpYy90ZW1wbGF0ZS9kZWZhdWx0L2luZGV4Lmh0bWwnKSwgJ3V0Zi04JyksXG4gICAgc3R5bGU6IHJlYWRGaWxlU3luYyhqb2luKF9fZGlybmFtZSwgJy4uLy4uLy4uL3N0YXRpYy9zdHlsZS9kZWZhdWx0L2luZGV4LmNzcycpLCAndXRmLTgnKSxcbiAgICAkOiB7XG4gICAgICAgIGFwcDogJyNhcHAnLFxuICAgICAgICBwYW5lbFRpdGxlOiAnI3BhbmVsVGl0bGUnLFxuICAgIH0sXG4gICAgcmVhZHkoKSB7XG4gICAgICAgIGlmICh0aGlzLiQuYXBwKSB7XG4gICAgICAgICAgICBjb25zdCBhcHAgPSBjcmVhdGVBcHAoe30pO1xuICAgICAgICAgICAgYXBwLmNvbmZpZy5jb21waWxlck9wdGlvbnMuaXNDdXN0b21FbGVtZW50ID0gKHRhZykgPT4gdGFnLnN0YXJ0c1dpdGgoJ3VpLScpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDliJvlu7rkuLvlupTnlKjnu4Tku7ZcbiAgICAgICAgICAgIGFwcC5jb21wb25lbnQoJ01jcFNlcnZlckFwcCcsIGRlZmluZUNvbXBvbmVudCh7XG4gICAgICAgICAgICAgICAgc2V0dXAoKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOWTjeW6lOW8j+aVsOaNrlxuICAgICAgICAgICAgICAgICAgICBjb25zdCBhY3RpdmVUYWIgPSByZWYoJ3NlcnZlcicpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzZXJ2ZXJSdW5uaW5nID0gcmVmKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VydmVyU3RhdHVzID0gcmVmKCflt7LlgZzmraInKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29ubmVjdGVkQ2xpZW50cyA9IHJlZigwKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaHR0cFVybCA9IHJlZignJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGlzUHJvY2Vzc2luZyA9IHJlZihmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzZXR0aW5ncyA9IHJlZjxTZXJ2ZXJTZXR0aW5ncz4oe1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9ydDogMzAwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9TdGFydDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWJ1Z0xvZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhDb25uZWN0aW9uczogMTAsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRoVG9rZW46ICcnXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYXZhaWxhYmxlVG9vbHMgPSByZWY8VG9vbENvbmZpZ1tdPihbXSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRvb2xDYXRlZ29yaWVzID0gcmVmPHN0cmluZ1tdPihbXSk7XG4gICAgICAgICAgICAgICAgICAgIFxuXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyDorqHnrpflsZ7mgKdcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhdHVzQ2xhc3MgPSBjb21wdXRlZCgoKSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ3N0YXR1cy1ydW5uaW5nJzogc2VydmVyUnVubmluZy52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdzdGF0dXMtc3RvcHBlZCc6ICFzZXJ2ZXJSdW5uaW5nLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRvdGFsVG9vbHMgPSBjb21wdXRlZCgoKSA9PiBhdmFpbGFibGVUb29scy52YWx1ZS5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbmFibGVkVG9vbHMgPSBjb21wdXRlZCgoKSA9PiBhdmFpbGFibGVUb29scy52YWx1ZS5maWx0ZXIodCA9PiB0LmVuYWJsZWQpLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRpc2FibGVkVG9vbHMgPSBjb21wdXRlZCgoKSA9PiB0b3RhbFRvb2xzLnZhbHVlIC0gZW5hYmxlZFRvb2xzLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgXG5cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNldHRpbmdzQ2hhbmdlZCA9IHJlZihmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyDmlrnms5VcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3dpdGNoVGFiID0gKHRhYk5hbWU6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZlVGFiLnZhbHVlID0gdGFiTmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0YWJOYW1lID09PSAndG9vbHMnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZFRvb2xNYW5hZ2VyU3RhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRvZ2dsZVNlcnZlciA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlcnZlclJ1bm5pbmcudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnY29jb3MtbWNwLXNlcnZlcicsICdzdG9wLXNlcnZlcicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOWQr+WKqOacjeWKoeWZqOaXtuS9v+eUqOW9k+WJjemdouadv+iuvue9rlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50U2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3J0OiBzZXR0aW5ncy52YWx1ZS5wb3J0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b1N0YXJ0OiBzZXR0aW5ncy52YWx1ZS5hdXRvU3RhcnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVEZWJ1Z0xvZzogc2V0dGluZ3MudmFsdWUuZGVidWdMb2csXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhDb25uZWN0aW9uczogc2V0dGluZ3MudmFsdWUubWF4Q29ubmVjdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRoVG9rZW46IHNldHRpbmdzLnZhbHVlLmF1dGhUb2tlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdjb2Nvcy1tY3Atc2VydmVyJywgJ3VwZGF0ZS1zZXR0aW5ncycsIGN1cnJlbnRTZXR0aW5ncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2NvY29zLW1jcC1zZXJ2ZXInLCAnc3RhcnQtc2VydmVyJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbVnVlIEFwcF0gU2VydmVyIHRvZ2dsZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignW1Z1ZSBBcHBdIEZhaWxlZCB0byB0b2dnbGUgc2VydmVyOicsIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNhdmVTZXR0aW5ncyA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5Yib5bu65LiA5Liq566A5Y2V55qE5a+56LGh77yM6YG/5YWN5YWL6ZqG6ZSZ6K+vXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2V0dGluZ3NEYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3J0OiBzZXR0aW5ncy52YWx1ZS5wb3J0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvU3RhcnQ6IHNldHRpbmdzLnZhbHVlLmF1dG9TdGFydCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5hYmxlRGVidWdMb2c6IHNldHRpbmdzLnZhbHVlLmRlYnVnTG9nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhDb25uZWN0aW9uczogc2V0dGluZ3MudmFsdWUubWF4Q29ubmVjdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dGhUb2tlbjogc2V0dGluZ3MudmFsdWUuYXV0aFRva2VuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdjb2Nvcy1tY3Atc2VydmVyJywgJ3VwZGF0ZS1zZXR0aW5ncycsIHNldHRpbmdzRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tWdWUgQXBwXSBTYXZlIHNldHRpbmdzIHJlc3VsdDonLCByZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzQ2hhbmdlZC52YWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbVnVlIEFwcF0gRmFpbGVkIHRvIHNhdmUgc2V0dGluZ3M6JywgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29weVVybCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoaHR0cFVybC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tWdWUgQXBwXSBVUkwgY29waWVkIHRvIGNsaXBib2FyZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbVnVlIEFwcF0gRmFpbGVkIHRvIGNvcHkgVVJMOicsIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxvYWRUb29sTWFuYWdlclN0YXRlID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdjb2Nvcy1tY3Atc2VydmVyJywgJ2dldFRvb2xNYW5hZ2VyU3RhdGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOaAu+aYr+WKoOi9veWQjuerr+eKtuaAge+8jOehruS/neaVsOaNruaYr+acgOaWsOeahFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmFpbGFibGVUb29scy52YWx1ZSA9IHJlc3VsdC5hdmFpbGFibGVUb29scyB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tWdWUgQXBwXSBMb2FkZWQgdG9vbHM6JywgYXZhaWxhYmxlVG9vbHMudmFsdWUubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOabtOaWsOW3peWFt+WIhuexu1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjYXRlZ29yaWVzID0gbmV3IFNldChhdmFpbGFibGVUb29scy52YWx1ZS5tYXAodG9vbCA9PiB0b29sLmNhdGVnb3J5KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xDYXRlZ29yaWVzLnZhbHVlID0gQXJyYXkuZnJvbShjYXRlZ29yaWVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tWdWUgQXBwXSBGYWlsZWQgdG8gbG9hZCB0b29sIG1hbmFnZXIgc3RhdGU6JywgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXBkYXRlVG9vbFN0YXR1cyA9IGFzeW5jIChjYXRlZ29yeTogc3RyaW5nLCBuYW1lOiBzdHJpbmcsIGVuYWJsZWQ6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tWdWUgQXBwXSB1cGRhdGVUb29sU3RhdHVzIGNhbGxlZDonLCBjYXRlZ29yeSwgbmFtZSwgZW5hYmxlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5YWI5pu05paw5pys5Zyw54q25oCBXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdG9vbEluZGV4ID0gYXZhaWxhYmxlVG9vbHMudmFsdWUuZmluZEluZGV4KHQgPT4gdC5jYXRlZ29yeSA9PT0gY2F0ZWdvcnkgJiYgdC5uYW1lID09PSBuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodG9vbEluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmFpbGFibGVUb29scy52YWx1ZVt0b29sSW5kZXhdLmVuYWJsZWQgPSBlbmFibGVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDlvLrliLbop6blj5Hlk43lupTlvI/mm7TmlrBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmxlVG9vbHMudmFsdWUgPSBbLi4uYXZhaWxhYmxlVG9vbHMudmFsdWVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW1Z1ZSBBcHBdIExvY2FsIHN0YXRlIHVwZGF0ZWQsIHRvb2wgZW5hYmxlZDonLCBhdmFpbGFibGVUb29scy52YWx1ZVt0b29sSW5kZXhdLmVuYWJsZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDosIPnlKjlkI7nq6/mm7TmlrBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdjb2Nvcy1tY3Atc2VydmVyJywgJ3VwZGF0ZVRvb2xTdGF0dXMnLCBjYXRlZ29yeSwgbmFtZSwgZW5hYmxlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXN1bHQgfHwgIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOWmguaenOWQjuerr+abtOaWsOWksei0pe+8jOWbnua7muacrOWcsOeKtuaAgVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodG9vbEluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmxlVG9vbHMudmFsdWVbdG9vbEluZGV4XS5lbmFibGVkID0gIWVuYWJsZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmFpbGFibGVUb29scy52YWx1ZSA9IFsuLi5hdmFpbGFibGVUb29scy52YWx1ZV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignW1Z1ZSBBcHBdIEJhY2tlbmQgdXBkYXRlIGZhaWxlZCwgcm9sbGVkIGJhY2sgbG9jYWwgc3RhdGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW1Z1ZSBBcHBdIEJhY2tlbmQgdXBkYXRlIHN1Y2Nlc3NmdWwnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOWmguaenOWPkeeUn+mUmeivr++8jOWbnua7muacrOWcsOeKtuaAgVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRvb2xJbmRleCA9IGF2YWlsYWJsZVRvb2xzLnZhbHVlLmZpbmRJbmRleCh0ID0+IHQuY2F0ZWdvcnkgPT09IGNhdGVnb3J5ICYmIHQubmFtZSA9PT0gbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRvb2xJbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmxlVG9vbHMudmFsdWVbdG9vbEluZGV4XS5lbmFibGVkID0gIWVuYWJsZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2YWlsYWJsZVRvb2xzLnZhbHVlID0gWy4uLmF2YWlsYWJsZVRvb2xzLnZhbHVlXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignW1Z1ZSBBcHBdIEZhaWxlZCB0byB1cGRhdGUgdG9vbCBzdGF0dXM6JywgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0QWxsVG9vbHMgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOebtOaOpeabtOaWsOacrOWcsOeKtuaAge+8jOeEtuWQjuS/neWtmFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2YWlsYWJsZVRvb2xzLnZhbHVlLmZvckVhY2godG9vbCA9PiB0b29sLmVuYWJsZWQgPSB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBzYXZlQ2hhbmdlcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbVnVlIEFwcF0gRmFpbGVkIHRvIHNlbGVjdCBhbGwgdG9vbHM6JywgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVzZWxlY3RBbGxUb29scyA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g55u05o6l5pu05paw5pys5Zyw54q25oCB77yM54S25ZCO5L+d5a2YXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmxlVG9vbHMudmFsdWUuZm9yRWFjaCh0b29sID0+IHRvb2wuZW5hYmxlZCA9IGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBzYXZlQ2hhbmdlcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbVnVlIEFwcF0gRmFpbGVkIHRvIGRlc2VsZWN0IGFsbCB0b29sczonLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNhdmVDaGFuZ2VzID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDliJvlu7rmma7pgJrlr7nosaHvvIzpgb/lhY1WdWUz5ZON5bqU5byP5a+56LGh5YWL6ZqG6ZSZ6K+vXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXBkYXRlcyA9IGF2YWlsYWJsZVRvb2xzLnZhbHVlLm1hcCh0b29sID0+ICh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBTdHJpbmcodG9vbC5jYXRlZ29yeSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFN0cmluZyh0b29sLm5hbWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVkOiBCb29sZWFuKHRvb2wuZW5hYmxlZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tWdWUgQXBwXSBTZW5kaW5nIHVwZGF0ZXM6JywgdXBkYXRlcy5sZW5ndGgsICd0b29scycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2NvY29zLW1jcC1zZXJ2ZXInLCAndXBkYXRlVG9vbFN0YXR1c0JhdGNoJywgdXBkYXRlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiByZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW1Z1ZSBBcHBdIFRvb2wgY2hhbmdlcyBzYXZlZCBzdWNjZXNzZnVsbHknKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tWdWUgQXBwXSBGYWlsZWQgdG8gc2F2ZSB0b29sIGNoYW5nZXM6JywgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBcblxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdG9nZ2xlQ2F0ZWdvcnlUb29scyA9IGFzeW5jIChjYXRlZ29yeTogc3RyaW5nLCBlbmFibGVkOiBib29sZWFuKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOebtOaOpeabtOaWsOacrOWcsOeKtuaAge+8jOeEtuWQjuS/neWtmFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2YWlsYWJsZVRvb2xzLnZhbHVlLmZvckVhY2godG9vbCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0b29sLmNhdGVnb3J5ID09PSBjYXRlZ29yeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbC5lbmFibGVkID0gZW5hYmxlZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHNhdmVDaGFuZ2VzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tWdWUgQXBwXSBGYWlsZWQgdG8gdG9nZ2xlIGNhdGVnb3J5IHRvb2xzOicsIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGdldFRvb2xzQnlDYXRlZ29yeSA9IChjYXRlZ29yeTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXZhaWxhYmxlVG9vbHMudmFsdWUuZmlsdGVyKHRvb2wgPT4gdG9vbC5jYXRlZ29yeSA9PT0gY2F0ZWdvcnkpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZ2V0Q2F0ZWdvcnlEaXNwbGF5TmFtZSA9IChjYXRlZ29yeTogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhdGVnb3J5TmFtZXM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3NjZW5lJzogJ+WcuuaZr+W3peWFtycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ25vZGUnOiAn6IqC54K55bel5YW3JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY29tcG9uZW50JzogJ+e7hOS7tuW3peWFtycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3ByZWZhYic6ICfpooTliLbkvZPlt6XlhbcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdwcm9qZWN0JzogJ+mhueebruW3peWFtycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RlYnVnJzogJ+iwg+ivleW3peWFtycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3ByZWZlcmVuY2VzJzogJ+WBj+Wlveiuvue9ruW3peWFtycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3NlcnZlcic6ICfmnI3liqHlmajlt6XlhbcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdicm9hZGNhc3QnOiAn5bm/5pKt5bel5YW3JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc2NlbmVBZHZhbmNlZCc6ICfpq5jnuqflnLrmma/lt6XlhbcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzY2VuZVZpZXcnOiAn5Zy65pmv6KeG5Zu+5bel5YW3JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAncmVmZXJlbmNlSW1hZ2UnOiAn5Y+C6ICD5Zu+54mH5bel5YW3JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYXNzZXRBZHZhbmNlZCc6ICfpq5jnuqfotYTmupDlt6XlhbcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd2YWxpZGF0aW9uJzogJ+mqjOivgeW3peWFtydcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2F0ZWdvcnlOYW1lc1tjYXRlZ29yeV0gfHwgY2F0ZWdvcnk7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIFxuXG4gICAgICAgICAgICAgICAgICAgIFxuXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyDnm5HlkKzorr7nva7lj5jljJZcbiAgICAgICAgICAgICAgICAgICAgd2F0Y2goc2V0dGluZ3MsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzQ2hhbmdlZC52YWx1ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH0sIHsgZGVlcDogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgXG5cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIOe7hOS7tuaMgui9veaXtuWKoOi9veaVsOaNrlxuICAgICAgICAgICAgICAgICAgICBvbk1vdW50ZWQoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5Yqg6L295bel5YW3566h55CG5Zmo54q25oCBXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBsb2FkVG9vbE1hbmFnZXJTdGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDku47mnI3liqHlmajnirbmgIHojrflj5borr7nva7kv6Hmga9cbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VydmVyU3RhdHVzID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnY29jb3MtbWNwLXNlcnZlcicsICdnZXQtc2VydmVyLXN0YXR1cycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZXJ2ZXJTdGF0dXMgJiYgc2VydmVyU3RhdHVzLnNldHRpbmdzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldHRpbmdzLnZhbHVlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9ydDogc2VydmVyU3RhdHVzLnNldHRpbmdzLnBvcnQgfHwgMzAwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9TdGFydDogc2VydmVyU3RhdHVzLnNldHRpbmdzLmF1dG9TdGFydCB8fCBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlYnVnTG9nOiBzZXJ2ZXJTdGF0dXMuc2V0dGluZ3MuZW5hYmxlRGVidWdMb2cgfHwgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhDb25uZWN0aW9uczogc2VydmVyU3RhdHVzLnNldHRpbmdzLm1heENvbm5lY3Rpb25zIHx8IDEwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0aFRva2VuOiBzZXJ2ZXJTdGF0dXMuc2V0dGluZ3MuYXV0aFRva2VuIHx8ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbVnVlIEFwcF0gU2VydmVyIHNldHRpbmdzIGxvYWRlZCBmcm9tIHN0YXR1czonLCBzZXJ2ZXJTdGF0dXMuc2V0dGluZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2VydmVyU3RhdHVzICYmIHNlcnZlclN0YXR1cy5wb3J0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOWFvOWuueaXp+eJiOacrO+8jOWPquiOt+WPluerr+WPo+S/oeaBr1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy52YWx1ZS5wb3J0ID0gc2VydmVyU3RhdHVzLnBvcnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbVnVlIEFwcF0gUG9ydCBsb2FkZWQgZnJvbSBzZXJ2ZXIgc3RhdHVzOicsIHNlcnZlclN0YXR1cy5wb3J0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tWdWUgQXBwXSBGYWlsZWQgdG8gZ2V0IHNlcnZlciBzdGF0dXM6JywgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbVnVlIEFwcF0gVXNpbmcgZGVmYXVsdCBzZXJ2ZXIgc2V0dGluZ3MnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5a6a5pyf5pu05paw5pyN5Yqh5Zmo54q25oCBXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRJbnRlcnZhbChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnY29jb3MtbWNwLXNlcnZlcicsICdnZXQtc2VydmVyLXN0YXR1cycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXJ2ZXJSdW5uaW5nLnZhbHVlID0gcmVzdWx0LnJ1bm5pbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXJ2ZXJTdGF0dXMudmFsdWUgPSByZXN1bHQucnVubmluZyA/ICfov5DooYzkuK0nIDogJ+W3suWBnOatoic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25uZWN0ZWRDbGllbnRzLnZhbHVlID0gcmVzdWx0LmNsaWVudHMgfHwgMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0dHBVcmwudmFsdWUgPSByZXN1bHQucnVubmluZyA/IGBodHRwOi8vbG9jYWxob3N0OiR7cmVzdWx0LnBvcnR9YCA6ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNQcm9jZXNzaW5nLnZhbHVlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbVnVlIEFwcF0gRmFpbGVkIHRvIGdldCBzZXJ2ZXIgc3RhdHVzOicsIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAyMDAwKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5pWw5o2uXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmVUYWIsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXJ2ZXJSdW5uaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VydmVyU3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29ubmVjdGVkQ2xpZW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0dHBVcmwsXG4gICAgICAgICAgICAgICAgICAgICAgICBpc1Byb2Nlc3NpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2YWlsYWJsZVRvb2xzLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbENhdGVnb3JpZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5nc0NoYW5nZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOiuoeeul+WxnuaAp1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ2xhc3MsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFRvb2xzLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5hYmxlZFRvb2xzLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWRUb29scyxcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5pa55rOVXG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2hUYWIsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2dnbGVTZXJ2ZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlU2V0dGluZ3MsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3B5VXJsLFxuICAgICAgICAgICAgICAgICAgICAgICAgbG9hZFRvb2xNYW5hZ2VyU3RhdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVUb29sU3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0QWxsVG9vbHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNlbGVjdEFsbFRvb2xzLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2F2ZUNoYW5nZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2dnbGVDYXRlZ29yeVRvb2xzLFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0VG9vbHNCeUNhdGVnb3J5LFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0Q2F0ZWdvcnlEaXNwbGF5TmFtZVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6IHJlYWRGaWxlU3luYyhqb2luKF9fZGlybmFtZSwgJy4uLy4uLy4uL3N0YXRpYy90ZW1wbGF0ZS92dWUvbWNwLXNlcnZlci1hcHAuaHRtbCcpLCAndXRmLTgnKSxcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYXBwLm1vdW50KHRoaXMuJC5hcHApO1xuICAgICAgICAgICAgcGFuZWxEYXRhTWFwLnNldCh0aGlzLCBhcHApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW01DUCBQYW5lbF0gVnVlMyBhcHAgbW91bnRlZCBzdWNjZXNzZnVsbHknKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgYmVmb3JlQ2xvc2UoKSB7IH0sXG4gICAgY2xvc2UoKSB7XG4gICAgICAgIGNvbnN0IGFwcCA9IHBhbmVsRGF0YU1hcC5nZXQodGhpcyk7XG4gICAgICAgIGlmIChhcHApIHtcbiAgICAgICAgICAgIGFwcC51bm1vdW50KCk7XG4gICAgICAgIH1cbiAgICB9LFxufSk7Il19