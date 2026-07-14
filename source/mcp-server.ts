import * as http from 'http';
import * as url from 'url';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { MCPServerSettings, ServerStatus, ToolDefinition } from './types';
import { fixCommonJsonIssues } from './utils/json-utils';
import { SceneTools } from './tools/scene-tools';
import { NodeTools } from './tools/node-tools';
import { ComponentTools } from './tools/component-tools';
import { PrefabTools } from './tools/prefab-tools';
import { ProjectTools } from './tools/project-tools';
import { DebugTools } from './tools/debug-tools';
import { PreferencesTools } from './tools/preferences-tools';
import { ServerTools } from './tools/server-tools';
import { BroadcastTools } from './tools/broadcast-tools';
import { SceneViewTools } from './tools/scene-view-tools';
import { ReferenceImageTools } from './tools/reference-image-tools';
import { AssetAdvancedTools } from './tools/asset-advanced-tools';
import { ValidationTools } from './tools/validation-tools';

export class MCPServer {
    private settings: MCPServerSettings;
    private httpServer: http.Server | null = null;
    private tools: Record<string, any> = {};
    private toolsList: ToolDefinition[] = [];
    private enabledTools: any[] = []; // 存储启用的工具列表

    constructor(settings: MCPServerSettings) {
        this.settings = settings;
        this.initializeTools();
    }

    private getVersion(): string {
        try {
            const pkgPath = path.join(__dirname, '..', 'package.json');
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            return pkg.version || '0.0.0';
        } catch {
            return '0.0.0';
        }
    }

    private initializeTools(): void {
        try {
            console.log('[MCPServer] Initializing tools...');
            this.tools.scene = new SceneTools();
            this.tools.node = new NodeTools();
            this.tools.component = new ComponentTools();
            this.tools.prefab = new PrefabTools();
            this.tools.project = new ProjectTools();
            this.tools.debug = new DebugTools();
            this.tools.preferences = new PreferencesTools();
            this.tools.server = new ServerTools();
            this.tools.broadcast = new BroadcastTools();
            this.tools.sceneView = new SceneViewTools();
            this.tools.referenceImage = new ReferenceImageTools();
            this.tools.assetAdvanced = new AssetAdvancedTools();
            this.tools.validation = new ValidationTools();
            console.log('[MCPServer] Tools initialized successfully');
        } catch (error) {
            console.error('[MCPServer] Error initializing tools:', error);
            throw error;
        }
    }

    public async start(): Promise<void> {
        if (this.httpServer) {
            console.log('[MCPServer] Server is already running');
            return;
        }

        try {
            console.log(`[MCPServer] Starting HTTP server on port ${this.settings.port}...`);
            this.httpServer = http.createServer(this.handleHttpRequest.bind(this));

            await new Promise<void>((resolve, reject) => {
                this.httpServer!.listen(this.settings.port, '127.0.0.1', () => {
                    console.log(`[MCPServer] ✅ HTTP server started successfully on http://127.0.0.1:${this.settings.port}`);
                    console.log(`[MCPServer] Health check: http://127.0.0.1:${this.settings.port}/health`);
                    console.log(`[MCPServer] MCP endpoint: http://127.0.0.1:${this.settings.port}/mcp`);
                    resolve();
                });
                this.httpServer!.on('error', (err: any) => {
                    console.error('[MCPServer] ❌ Failed to start server:', err);
                    if (err.code === 'EADDRINUSE') {
                        console.error(`[MCPServer] Port ${this.settings.port} is already in use. Please change the port in settings.`);
                    }
                    reject(err);
                });
            });

            this.setupTools();
            console.log('[MCPServer] 🚀 MCP Server is ready for connections');
        } catch (error) {
            console.error('[MCPServer] ❌ Failed to start server:', error);
            throw error;
        }
    }

    private setupTools(): void {
        this.toolsList = [];
        
        // 如果没有启用工具配置，返回所有工具
        if (!this.enabledTools || this.enabledTools.length === 0) {
            for (const [category, toolSet] of Object.entries(this.tools)) {
                const tools = toolSet.getTools();
                for (const tool of tools) {
                    this.toolsList.push({
                        name: `${category}_${tool.name}`,
                        description: tool.description,
                        inputSchema: tool.inputSchema
                    });
                }
            }
        } else {
            // 根据启用的工具配置过滤
            const enabledToolNames = new Set(this.enabledTools.map(tool => `${tool.category}_${tool.name}`));
            
            for (const [category, toolSet] of Object.entries(this.tools)) {
                const tools = toolSet.getTools();
                for (const tool of tools) {
                    const toolName = `${category}_${tool.name}`;
                    if (enabledToolNames.has(toolName)) {
                        this.toolsList.push({
                            name: toolName,
                            description: tool.description,
                            inputSchema: tool.inputSchema
                        });
                    }
                }
            }
        }
        
        console.log(`[MCPServer] Setup tools: ${this.toolsList.length} tools available`);
    }

    public async executeToolCall(toolName: string, args: any): Promise<any> {
        const parts = toolName.split('_');
        const category = parts[0];
        const toolMethodName = parts.slice(1).join('_');
        
        if (this.tools[category]) {
            return await this.tools[category].execute(toolMethodName, args);
        }
        
        throw new Error(`Tool ${toolName} not found`);
    }

    public getAvailableTools(): ToolDefinition[] {
        return this.toolsList;
    }

    public updateEnabledTools(enabledTools: any[]): void {
        console.log(`[MCPServer] Updating enabled tools: ${enabledTools.length} tools`);
        this.enabledTools = enabledTools;
        this.setupTools(); // 重新设置工具列表
    }

    public getSettings(): MCPServerSettings {
        return this.settings;
    }

    /** 只接受 Host 头解析到 loopback 的请求（反 DNS-rebinding，fork 加固）。 */
    private isLocalHost(hostHeader?: string): boolean {
        if (!hostHeader) return false;
        const host = hostHeader.replace(/:\d+$/, '').toLowerCase();
        return host === '127.0.0.1' || host === 'localhost' || host === '::1' || host === '[::1]';
    }

    /** 非浏览器客户端不带 Origin，放行；浏览器 Origin 必须在白名单内（fork 加固）。 */
    private isOriginAllowed(origin?: string): boolean {
        const allowed = this.settings.allowedOrigins || ['*'];
        if (allowed.includes('*')) return true;
        if (!origin) return true;
        return allowed.includes(origin);
    }

    /** Bearer 令牌门；settings.authToken 为空时关闭（fork 加固）。 */
    private checkAuth(req: http.IncomingMessage): boolean {
        const token = this.settings.authToken;
        if (!token) return true;
        return req.headers['authorization'] === `Bearer ${token}`;
    }

    private applyCorsHeaders(req: http.IncomingMessage, res: http.ServerResponse): void {
        const origin = req.headers.origin as string | undefined;
        if (origin && this.isOriginAllowed(origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
        } else if ((this.settings.allowedOrigins || ['*']).includes('*')) {
            res.setHeader('Access-Control-Allow-Origin', '*');
        }
        res.setHeader('Vary', 'Origin');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Content-Type', 'application/json');
    }

    private async handleHttpRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
        const parsedUrl = url.parse(req.url || '', true);
        const pathname = parsedUrl.pathname;

        this.applyCorsHeaders(req, res);

        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }

        // 反 DNS-rebinding：先校验 Host 头（fork 加固）
        if (!this.isLocalHost(req.headers.host)) {
            res.writeHead(403);
            res.end(JSON.stringify({ error: 'Forbidden: invalid Host header (possible DNS rebinding)' }));
            return;
        }

        // /mcp 与 /api/* 有副作用 → origin 白名单 + 可选 token 门（fork 加固）
        const isSensitive = pathname === '/mcp' || (pathname?.startsWith('/api/') ?? false);
        if (isSensitive) {
            if (!this.isOriginAllowed(req.headers.origin as string | undefined)) {
                res.writeHead(403);
                res.end(JSON.stringify({ error: 'Forbidden: origin not allowed' }));
                return;
            }
            if (!this.checkAuth(req)) {
                res.writeHead(401);
                res.end(JSON.stringify({ error: 'Unauthorized: missing or invalid bearer token' }));
                return;
            }
        }

        try {
            if (pathname === '/mcp' && req.method === 'POST') {
                await this.handleMCPRequest(req, res);
            } else if (pathname === '/health' && req.method === 'GET') {
                res.writeHead(200);
                res.end(JSON.stringify({ status: 'ok', tools: this.toolsList.length }));
            } else if (pathname === '/api/tools' && req.method === 'GET') {
                res.writeHead(200);
                res.end(JSON.stringify({ tools: this.getSimplifiedToolsList() }));
            } else if (pathname?.startsWith('/api/') && req.method === 'POST') {
                await this.handleSimpleAPIRequest(req, res, pathname);
            } else {
                res.writeHead(404);
                res.end(JSON.stringify({ error: 'Not found' }));
            }
        } catch (error) {
            console.error('HTTP request error:', error);
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    }
    
    private async handleMCPRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
        let body = '';
        
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        
        req.on('end', async () => {
            try {
                // Enhanced JSON parsing with better error handling
                let message;
                try {
                    message = JSON.parse(body);
                } catch (parseError: any) {
                    // Try to fix common JSON issues
                    const fixedBody = fixCommonJsonIssues(body);
                    try {
                        message = JSON.parse(fixedBody);
                        console.log('[MCPServer] Fixed JSON parsing issue');
                    } catch (secondError) {
                        throw new Error(`JSON parsing failed: ${parseError.message}. Original body: ${body.substring(0, 500)}...`);
                    }
                }
                
                const response = await this.handleMessage(message);
                if (response === null) {
                    // 通知消息（无 id）：JSON-RPC 禁止返回响应体（fork 修正）
                    res.writeHead(202);
                    res.end();
                    return;
                }
                res.writeHead(200);
                res.end(JSON.stringify(response));
            } catch (error: any) {
                console.error('Error handling MCP request:', error);
                res.writeHead(400);
                res.end(JSON.stringify({
                    jsonrpc: '2.0',
                    id: null,
                    error: {
                        code: -32700,
                        message: `Parse error: ${error.message}`
                    }
                }));
            }
        });
    }

    /** 返回 JSON-RPC 响应对象；通知消息（无 id）返回 null（fork 修正）。 */
    private async handleMessage(message: any): Promise<any | null> {
        const { id, method, params } = message;
        const isNotification = id === undefined;

        try {
            let result: any;

            switch (method) {
                case 'initialize':
                    // MCP initialization
                    result = {
                        // 回显客户端请求的协议版本（fork 修正）
                        protocolVersion: (params && params.protocolVersion) || '2024-11-05',
                        capabilities: {
                            tools: {}
                        },
                        serverInfo: {
                            name: 'cocos-mcp-server',
                            version: this.getVersion()
                        }
                    };
                    break;
                case 'tools/list':
                    result = { tools: this.getAvailableTools() };
                    break;
                case 'tools/call': {
                    const { name, arguments: args } = params;
                    const toolResult = await this.executeToolCall(name, args);
                    result = { content: [{ type: 'text', text: JSON.stringify(toolResult) }] };
                    break;
                }
                case 'ping':
                    result = {};
                    break;
                case 'notifications/initialized':
                case 'notifications/cancelled':
                    return null; // 已知通知：不回响应（fork 修正）
                default:
                    if (isNotification) return null; // 未知通知静默忽略
                    throw new Error(`Unknown method: ${method}`);
            }

            if (isNotification) return null;
            return { jsonrpc: '2.0', id, result };
        } catch (error: any) {
            if (isNotification) return null;
            return {
                jsonrpc: '2.0',
                id,
                error: {
                    code: -32603,
                    message: error.message
                }
            };
        }
    }

    public stop(): Promise<void> {
        return new Promise<void>((resolve) => {
            if (this.httpServer) {
                const srv = this.httpServer;
                this.httpServer = null; // 立即翻转状态，后续 start() 可直接进行（fork 修 EADDRINUSE 重启竞态）
                srv.close(() => {
                    console.log('[MCPServer] HTTP server stopped');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    public getStatus(): ServerStatus {
        return {
            running: !!this.httpServer,
            port: this.settings.port
        };
    }

    private async handleSimpleAPIRequest(req: http.IncomingMessage, res: http.ServerResponse, pathname: string): Promise<void> {
        let body = '';
        
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        
        req.on('end', async () => {
            try {
                // Extract tool name from path like /api/node/set_position
                const pathParts = pathname.split('/').filter(p => p);
                if (pathParts.length < 3) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'Invalid API path. Use /api/{category}/{tool_name}' }));
                    return;
                }
                
                const category = pathParts[1];
                const toolName = pathParts[2];
                const fullToolName = `${category}_${toolName}`;
                
                // Parse parameters with enhanced error handling
                let params;
                try {
                    params = body ? JSON.parse(body) : {};
                } catch (parseError: any) {
                    // Try to fix JSON issues
                    const fixedBody = fixCommonJsonIssues(body);
                    try {
                        params = JSON.parse(fixedBody);
                        console.log('[MCPServer] Fixed API JSON parsing issue');
                    } catch (secondError: any) {
                        res.writeHead(400);
                        res.end(JSON.stringify({
                            error: 'Invalid JSON in request body',
                            details: parseError.message,
                            receivedBody: body.substring(0, 200)
                        }));
                        return;
                    }
                }
                
                // Execute tool
                const result = await this.executeToolCall(fullToolName, params);
                
                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    tool: fullToolName,
                    result: result
                }));
                
            } catch (error: any) {
                console.error('Simple API error:', error);
                res.writeHead(500);
                res.end(JSON.stringify({
                    success: false,
                    error: error.message,
                    tool: pathname
                }));
            }
        });
    }

    private getSimplifiedToolsList(): any[] {
        return this.toolsList.map(tool => {
            const parts = tool.name.split('_');
            const category = parts[0];
            const toolName = parts.slice(1).join('_');
            
            return {
                name: tool.name,
                category: category,
                toolName: toolName,
                description: tool.description,
                apiPath: `/api/${category}/${toolName}`,
                curlExample: this.generateCurlExample(category, toolName, tool.inputSchema)
            };
        });
    }

    private generateCurlExample(category: string, toolName: string, schema: any): string {
        // Generate sample parameters based on schema
        const sampleParams = this.generateSampleParams(schema);
        const jsonString = JSON.stringify(sampleParams, null, 2);
        
        return `curl -X POST http://127.0.0.1:${this.settings.port}/api/${category}/${toolName} \\
  -H "Content-Type: application/json" \\
  -d '${jsonString}'`;
    }

    private generateSampleParams(schema: any): any {
        if (!schema || !schema.properties) return {};
        
        const sample: any = {};
        for (const [key, prop] of Object.entries(schema.properties as any)) {
            const propSchema = prop as any;
            switch (propSchema.type) {
                case 'string':
                    sample[key] = propSchema.default || 'example_string';
                    break;
                case 'number':
                    sample[key] = propSchema.default || 42;
                    break;
                case 'boolean':
                    sample[key] = propSchema.default || true;
                    break;
                case 'object':
                    sample[key] = propSchema.default || { x: 0, y: 0, z: 0 };
                    break;
                default:
                    sample[key] = 'example_value';
            }
        }
        return sample;
    }

    public async updateSettings(settings: MCPServerSettings): Promise<void> {
        this.settings = settings;
        if (this.httpServer) {
            await this.stop();   // 等端口真正释放再重新绑定（fork 修竞态）
            await this.start();
        }
    }
}