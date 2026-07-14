"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SETTINGS = void 0;
exports.readSettings = readSettings;
exports.saveSettings = saveSettings;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const DEFAULT_SETTINGS = {
    port: 3000,
    autoStart: false,
    enableDebugLog: false,
    allowedOrigins: ['*'],
    maxConnections: 10,
    authToken: ''
};
exports.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
function getSettingsPath() {
    return path.join(Editor.Project.path, 'settings', 'mcp-server.json');
}
function ensureSettingsDir() {
    const settingsDir = path.dirname(getSettingsPath());
    if (!fs.existsSync(settingsDir)) {
        fs.mkdirSync(settingsDir, { recursive: true });
    }
}
function readSettings() {
    try {
        ensureSettingsDir();
        const settingsFile = getSettingsPath();
        if (fs.existsSync(settingsFile)) {
            const content = fs.readFileSync(settingsFile, 'utf8');
            return Object.assign(Object.assign({}, DEFAULT_SETTINGS), JSON.parse(content));
        }
    }
    catch (e) {
        console.error('Failed to read settings:', e);
    }
    return DEFAULT_SETTINGS;
}
function saveSettings(settings) {
    try {
        ensureSettingsDir();
        const settingsFile = getSettingsPath();
        fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
    }
    catch (e) {
        console.error('Failed to save settings:', e);
        throw e;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zb3VyY2Uvc2V0dGluZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBd0JBLG9DQVlDO0FBRUQsb0NBU0M7QUEvQ0QsdUNBQXlCO0FBQ3pCLDJDQUE2QjtBQUc3QixNQUFNLGdCQUFnQixHQUFzQjtJQUN4QyxJQUFJLEVBQUUsSUFBSTtJQUNWLFNBQVMsRUFBRSxLQUFLO0lBQ2hCLGNBQWMsRUFBRSxLQUFLO0lBQ3JCLGNBQWMsRUFBRSxDQUFDLEdBQUcsQ0FBQztJQUNyQixjQUFjLEVBQUUsRUFBRTtJQUNsQixTQUFTLEVBQUUsRUFBRTtDQUNoQixDQUFDO0FBc0NPLDRDQUFnQjtBQXBDekIsU0FBUyxlQUFlO0lBQ3BCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztBQUN6RSxDQUFDO0FBRUQsU0FBUyxpQkFBaUI7SUFDdEIsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO0lBQ3BELElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUM7UUFDOUIsRUFBRSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUNuRCxDQUFDO0FBQ0wsQ0FBQztBQUVELFNBQWdCLFlBQVk7SUFDeEIsSUFBSSxDQUFDO1FBQ0QsaUJBQWlCLEVBQUUsQ0FBQztRQUNwQixNQUFNLFlBQVksR0FBRyxlQUFlLEVBQUUsQ0FBQztRQUN2QyxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztZQUM5QixNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQztZQUN0RCx1Q0FBWSxnQkFBZ0IsR0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFHO1FBQzNELENBQUM7SUFDTCxDQUFDO0lBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUNULE9BQU8sQ0FBQyxLQUFLLENBQUMsMEJBQTBCLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUNELE9BQU8sZ0JBQWdCLENBQUM7QUFDNUIsQ0FBQztBQUVELFNBQWdCLFlBQVksQ0FBQyxRQUEyQjtJQUNwRCxJQUFJLENBQUM7UUFDRCxpQkFBaUIsRUFBRSxDQUFDO1FBQ3BCLE1BQU0sWUFBWSxHQUFHLGVBQWUsRUFBRSxDQUFDO1FBQ3ZDLEVBQUUsQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1FBQ1QsT0FBTyxDQUFDLEtBQUssQ0FBQywwQkFBMEIsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM3QyxNQUFNLENBQUMsQ0FBQztJQUNaLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IE1DUFNlcnZlclNldHRpbmdzIH0gZnJvbSAnLi90eXBlcyc7XG5cbmNvbnN0IERFRkFVTFRfU0VUVElOR1M6IE1DUFNlcnZlclNldHRpbmdzID0ge1xuICAgIHBvcnQ6IDMwMDAsXG4gICAgYXV0b1N0YXJ0OiBmYWxzZSxcbiAgICBlbmFibGVEZWJ1Z0xvZzogZmFsc2UsXG4gICAgYWxsb3dlZE9yaWdpbnM6IFsnKiddLFxuICAgIG1heENvbm5lY3Rpb25zOiAxMCxcbiAgICBhdXRoVG9rZW46ICcnXG59O1xuXG5mdW5jdGlvbiBnZXRTZXR0aW5nc1BhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcGF0aC5qb2luKEVkaXRvci5Qcm9qZWN0LnBhdGgsICdzZXR0aW5ncycsICdtY3Atc2VydmVyLmpzb24nKTtcbn1cblxuZnVuY3Rpb24gZW5zdXJlU2V0dGluZ3NEaXIoKTogdm9pZCB7XG4gICAgY29uc3Qgc2V0dGluZ3NEaXIgPSBwYXRoLmRpcm5hbWUoZ2V0U2V0dGluZ3NQYXRoKCkpO1xuICAgIGlmICghZnMuZXhpc3RzU3luYyhzZXR0aW5nc0RpcikpIHtcbiAgICAgICAgZnMubWtkaXJTeW5jKHNldHRpbmdzRGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkU2V0dGluZ3MoKTogTUNQU2VydmVyU2V0dGluZ3Mge1xuICAgIHRyeSB7XG4gICAgICAgIGVuc3VyZVNldHRpbmdzRGlyKCk7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzRmlsZSA9IGdldFNldHRpbmdzUGF0aCgpO1xuICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhzZXR0aW5nc0ZpbGUpKSB7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKHNldHRpbmdzRmlsZSwgJ3V0ZjgnKTtcbiAgICAgICAgICAgIHJldHVybiB7IC4uLkRFRkFVTFRfU0VUVElOR1MsIC4uLkpTT04ucGFyc2UoY29udGVudCkgfTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHJlYWQgc2V0dGluZ3M6JywgZSk7XG4gICAgfVxuICAgIHJldHVybiBERUZBVUxUX1NFVFRJTkdTO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2F2ZVNldHRpbmdzKHNldHRpbmdzOiBNQ1BTZXJ2ZXJTZXR0aW5ncyk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICAgIGVuc3VyZVNldHRpbmdzRGlyKCk7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzRmlsZSA9IGdldFNldHRpbmdzUGF0aCgpO1xuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKHNldHRpbmdzRmlsZSwgSlNPTi5zdHJpbmdpZnkoc2V0dGluZ3MsIG51bGwsIDIpKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBzYXZlIHNldHRpbmdzOicsIGUpO1xuICAgICAgICB0aHJvdyBlO1xuICAgIH1cbn1cblxuZXhwb3J0IHsgREVGQVVMVF9TRVRUSU5HUyB9OyJdfQ==