"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrefabTools = void 0;
class PrefabTools {
    getTools() {
        return [
            // 1. Browse prefabs - Query and information
            {
                name: 'prefab_browse',
                description: 'PREFAB BROWSER: Query and analyze prefab files in your project. WORKFLOW: Use "list" to discover all prefabs → "info" to get detailed prefab data → "validate" to check file integrity. Essential for prefab management and debugging. Common use: finding prefabs before instantiation.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        action: {
                            type: 'string',
                            enum: ['list', 'info', 'validate'],
                            description: 'Browse operation: "list" = get all prefabs in folder (optional folder parameter) | "info" = get detailed prefab data (requires prefabPath) | "validate" = check prefab file integrity (requires prefabPath)'
                        },
                        folder: {
                            type: 'string',
                            description: 'Search directory for prefabs (list action). Default: "db://assets" searches entire project. Examples: "db://assets/prefabs" for main prefabs, "db://assets/ui" for UI prefabs. Use specific folders for focused searches.',
                            default: 'db://assets'
                        },
                        prefabPath: {
                            type: 'string',
                            description: 'Prefab file path (REQUIRED for info/validate actions). Must be valid Cocos asset path ending in .prefab. Examples: "db://assets/prefabs/Player.prefab", "db://assets/ui/MenuPanel.prefab". Get paths from list action first.'
                        }
                    },
                    required: ['action']
                }
            },
            // 2. Prefab lifecycle - Create, duplicate, delete
            {
                name: 'prefab_lifecycle',
                description: 'PREFAB LIFECYCLE: Create prefabs from existing nodes or delete prefab files. WORKFLOW: For create → select source node → specify name and save path → creates reusable prefab. For delete → specify prefab path → removes file permanently. Use with caution for delete operations.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        action: {
                            type: 'string',
                            enum: ['create', 'delete'],
                            description: 'Lifecycle operation: "create" = convert scene node into reusable prefab (requires nodeUuid+prefabName+savePath) | "delete" = permanently remove prefab file (requires prefabPath - WARNING: irreversible)'
                        },
                        nodeUuid: {
                            type: 'string',
                            description: 'Source node UUID for prefab creation (REQUIRED for create action). Use node_query to find target node UUID first. The node and all its children will be converted into a prefab. Format: "12345678-abcd-1234-5678-123456789abc"'
                        },
                        prefabName: {
                            type: 'string',
                            description: 'New prefab name (REQUIRED for create action). Choose descriptive names without .prefab extension. Examples: "PlayerCharacter", "UIButton", "EnemyTank". System adds .prefab extension automatically.'
                        },
                        savePath: {
                            type: 'string',
                            description: 'Destination path for new prefab (REQUIRED for create action). Must include .prefab extension. Examples: "db://assets/prefabs/Player.prefab", "db://assets/ui/CustomButton.prefab". Ensure parent folder exists.'
                        },
                        prefabPath: {
                            type: 'string',
                            description: 'Prefab file to delete (REQUIRED for delete action). WARNING: This permanently removes the prefab file. Examples: "db://assets/prefabs/OldPlayer.prefab". Use prefab_browse list to find exact paths first.'
                        }
                    },
                    required: ['action']
                }
            },
            // 3. Scene prefab instances - Instantiate, unlink, apply, revert
            {
                name: 'prefab_instance',
                description: 'PREFAB INSTANCES: Manage prefab instances in the scene. WORKFLOW: "instantiate" to create instances → modify as needed → "apply" to save changes back to prefab OR "unlink" to break connection OR "revert" to restore original. Critical for prefab-based development.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        action: {
                            type: 'string',
                            enum: ['instantiate', 'unlink', 'apply', 'revert'],
                            description: 'Instance operation: "instantiate" = create prefab instance in scene (requires prefabPath+parentUuid) | "unlink" = break prefab connection, make independent (requires nodeUuid) | "apply" = save instance changes to prefab (requires nodeUuid) | "revert" = restore to prefab state (requires nodeUuid)'
                        },
                        prefabPath: {
                            type: 'string',
                            description: 'Prefab file path (REQUIRED for instantiate action). Must be valid .prefab file. Examples: "db://assets/prefabs/Player.prefab", "db://assets/ui/MenuPanel.prefab". Use prefab_browse to find available prefabs.'
                        },
                        parentUuid: {
                            type: 'string',
                            description: 'Parent node UUID for new instance (REQUIRED for instantiate action). Use node_query to find parent node first. The prefab instance will be created as a child of this node. Format: "12345678-abcd-1234-5678-123456789abc"'
                        },
                        position: {
                            type: 'object',
                            properties: { x: { type: 'number' }, y: { type: 'number' }, z: { type: 'number' } },
                            description: 'Starting position for new instance (instantiate action). Sets initial transform after creation. Example: {"x": 100, "y": 200, "z": 0}. Optional - defaults to prefab\'s original position if omitted.'
                        },
                        nodeUuid: {
                            type: 'string',
                            description: 'Prefab instance node UUID (REQUIRED for unlink/apply/revert actions). Must be a node that was created from a prefab. Use node_query to find prefab instance nodes. Format: "12345678-abcd-1234-5678-123456789abc"'
                        }
                    },
                    required: ['action']
                }
            },
            // 4. Prefab edit mode - IMPORTANT: Complete workflow for editing prefabs
            {
                name: 'prefab_edit',
                description: 'PREFAB EDIT WORKFLOW: Edit prefab content in dedicated editing mode. CRITICAL WORKFLOW: 1) "enter" edit mode (switches to prefab scene) → 2) make modifications using other tools → 3) "save" changes → 4) "exit" back to main scene. IMPORTANT: Always save before exit to persist changes.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        action: {
                            type: 'string',
                            enum: ['enter', 'save', 'exit', 'test'],
                            description: 'Edit operation: "enter" = start editing prefab in dedicated scene (requires prefabPath) | "save" = persist current changes to prefab file | "exit" = return to main scene (REMEMBER to save first) | "test" = create test instance to verify changes (requires parentUuid)'
                        },
                        prefabPath: {
                            type: 'string',
                            description: 'Prefab file path (REQUIRED for enter/save/exit actions). Must be valid .prefab file. Examples: "db://assets/prefabs/Player.prefab". For enter: opens prefab for editing. For save/exit: specifies which prefab to save/close.'
                        },
                        parentUuid: {
                            type: 'string',
                            description: 'Parent node for test instance (test action only). Use node_query to find parent UUID. Creates temporary instance to verify prefab changes work correctly. Format: "12345678-abcd-1234-5678-123456789abc"'
                        }
                    },
                    required: ['action', 'prefabPath']
                }
            }
        ];
    }
    async execute(toolName, args) {
        switch (toolName) {
            case 'prefab_browse':
                return await this.handlePrefabBrowse(args);
            case 'prefab_lifecycle':
                return await this.handlePrefabLifecycle(args);
            case 'prefab_instance':
                return await this.handlePrefabInstance(args);
            case 'prefab_edit':
                return await this.handlePrefabEdit(args);
            default:
                throw new Error(`Unknown tool: ${toolName}`);
        }
    }
    async getPrefabList(folder = 'db://assets') {
        try {
            const pattern = folder.endsWith('/') ?
                `${folder}**/*.prefab` : `${folder}/**/*.prefab`;
            const results = await Editor.Message.request('asset-db', 'query-assets', {
                pattern: pattern
            });
            const prefabs = results.map(asset => ({
                name: asset.name,
                path: asset.url,
                uuid: asset.uuid,
                folder: asset.url.substring(0, asset.url.lastIndexOf('/'))
            }));
            return { success: true, data: prefabs };
        }
        catch (err) {
            return { success: false, error: err.message };
        }
    }
    async loadPrefab(prefabPath) {
        try {
            const assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', prefabPath);
            if (!assetInfo) {
                throw new Error('Prefab not found');
            }
            const prefabData = await Editor.Message.request('scene', 'load-asset', {
                uuid: assetInfo.uuid
            });
            return {
                success: true,
                data: {
                    uuid: prefabData.uuid,
                    name: prefabData.name,
                    message: 'Prefab loaded successfully'
                }
            };
        }
        catch (err) {
            return { success: false, error: err.message };
        }
    }
    async instantiatePrefab(args) {
        try {
            // 获取预制体资源信息
            const assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', args.prefabPath);
            if (!assetInfo) {
                throw new Error('预制体未找到');
            }
            // 记录撤销操作
            await this.recordUndoOperation('instantiate-prefab', args.parentUuid || 'scene');
            // 使用编辑器标准流程
            const result = await this.instantiatePrefabStandard(args, assetInfo);
            if (result.success) {
                // 实例化预制体不需要刷新全部资源
                return result;
            }
            // 回退方法
            console.log('标准方法失败，使用简化方法...');
            const fallbackResult = await this.instantiatePrefabSimple(args, assetInfo);
            // 实例化预制体不需要刷新全部资源
            return fallbackResult;
        }
        catch (err) {
            return {
                success: false,
                error: `预制体实例化失败: ${err.message}`,
                instruction: '请检查预制体路径是否正确，确保预制体文件格式正确'
            };
        }
    }
    /**
     * 建立节点与预制体的关联关系
     * 这个方法创建必要的PrefabInfo和PrefabInstance结构
     */
    async establishPrefabConnection(nodeUuid, prefabUuid, prefabPath) {
        try {
            // 读取预制体文件获取根节点的fileId
            const prefabContent = await this.readPrefabFile(prefabPath);
            if (!prefabContent || !prefabContent.data || !prefabContent.data.length) {
                throw new Error('无法读取预制体文件内容');
            }
            // 找到预制体根节点的fileId (通常是第二个对象，即索引1)
            const rootNode = prefabContent.data.find((item) => item.__type === 'cc.Node' && item._parent === null);
            if (!rootNode || !rootNode._prefab) {
                throw new Error('无法找到预制体根节点或其预制体信息');
            }
            // 获取根节点的PrefabInfo
            const rootPrefabInfo = prefabContent.data[rootNode._prefab.__id__];
            if (!rootPrefabInfo || rootPrefabInfo.__type !== 'cc.PrefabInfo') {
                throw new Error('无法找到预制体根节点的PrefabInfo');
            }
            const rootFileId = rootPrefabInfo.fileId;
            // 使用scene API建立预制体连接
            const prefabConnectionData = {
                node: nodeUuid,
                prefab: prefabUuid,
                fileId: rootFileId
            };
            // 尝试使用多种API方法建立预制体连接
            const connectionMethods = [
                () => Editor.Message.request('scene', 'connect-prefab-instance', prefabConnectionData),
                () => Editor.Message.request('scene', 'set-prefab-connection', prefabConnectionData),
                () => Editor.Message.request('scene', 'apply-prefab-link', prefabConnectionData)
            ];
            let connected = false;
            for (const method of connectionMethods) {
                try {
                    await method();
                    connected = true;
                    break;
                }
                catch (error) {
                    console.warn('预制体连接方法失败，尝试下一个方法:', error);
                }
            }
            if (!connected) {
                // 如果所有API方法都失败，尝试手动修改场景数据
                console.warn('所有预制体连接API都失败，尝试手动建立连接');
                await this.manuallyEstablishPrefabConnection(nodeUuid, prefabUuid, rootFileId);
            }
        }
        catch (error) {
            console.error('建立预制体连接失败:', error);
            throw error;
        }
    }
    /**
     * 手动建立预制体连接（当API方法失败时的备用方案）
     */
    async manuallyEstablishPrefabConnection(nodeUuid, prefabUuid, rootFileId) {
        try {
            // 尝试使用dump API修改节点的_prefab属性
            const prefabConnectionData = {
                [nodeUuid]: {
                    '_prefab': {
                        '__uuid__': prefabUuid,
                        '__expectedType__': 'cc.Prefab',
                        'fileId': rootFileId
                    }
                }
            };
            await Editor.Message.request('scene', 'set-property', {
                uuid: nodeUuid,
                path: '_prefab',
                dump: {
                    value: {
                        '__uuid__': prefabUuid,
                        '__expectedType__': 'cc.Prefab'
                    }
                }
            });
        }
        catch (error) {
            console.error('手动建立预制体连接也失败:', error);
            // 不抛出错误，因为基本的节点创建已经成功
        }
    }
    /**
     * 读取预制体文件内容
     */
    async readPrefabFile(prefabPath) {
        try {
            // 尝试使用asset-db API读取文件内容
            let assetContent;
            try {
                assetContent = await Editor.Message.request('asset-db', 'query-asset-info', prefabPath);
                if (assetContent && assetContent.source) {
                    // 如果有source路径，直接读取文件
                    const fs = require('fs');
                    const path = require('path');
                    const fullPath = path.resolve(assetContent.source);
                    const fileContent = fs.readFileSync(fullPath, 'utf8');
                    return JSON.parse(fileContent);
                }
            }
            catch (error) {
                console.warn('使用asset-db读取失败，尝试其他方法:', error);
            }
            // 备用方法：转换db://路径为实际文件路径
            const fsPath = prefabPath.replace('db://assets/', 'assets/').replace('db://assets', 'assets');
            const fs = require('fs');
            const path = require('path');
            // 尝试多个可能的项目根路径
            const possiblePaths = [
                path.resolve(process.cwd(), '../../NewProject_3', fsPath),
                path.resolve('/Users/lizhiyong/NewProject_3', fsPath),
                path.resolve(fsPath),
                // 如果是根目录下的文件，也尝试直接路径
                path.resolve('/Users/lizhiyong/NewProject_3/assets', path.basename(fsPath))
            ];
            console.log('尝试读取预制体文件，路径转换:', {
                originalPath: prefabPath,
                fsPath: fsPath,
                possiblePaths: possiblePaths
            });
            for (const fullPath of possiblePaths) {
                try {
                    console.log(`检查路径: ${fullPath}`);
                    if (fs.existsSync(fullPath)) {
                        console.log(`找到文件: ${fullPath}`);
                        const fileContent = fs.readFileSync(fullPath, 'utf8');
                        const parsed = JSON.parse(fileContent);
                        console.log('文件解析成功，数据结构:', {
                            hasData: !!parsed.data,
                            dataLength: parsed.data ? parsed.data.length : 0
                        });
                        return parsed;
                    }
                    else {
                        console.log(`文件不存在: ${fullPath}`);
                    }
                }
                catch (readError) {
                    console.warn(`读取文件失败 ${fullPath}:`, readError);
                }
            }
            throw new Error('无法找到或读取预制体文件');
        }
        catch (error) {
            console.error('读取预制体文件失败:', error);
            throw error;
        }
    }
    async tryCreateNodeWithPrefab(args) {
        try {
            const assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', args.prefabPath);
            if (!assetInfo) {
                throw new Error('预制体未找到');
            }
            // 方法2: 使用 create-node 指定预制体资源
            const createNodeOptions = {
                assetUuid: assetInfo.uuid
            };
            // 设置父节点
            if (args.parentUuid) {
                createNodeOptions.parent = args.parentUuid;
            }
            const nodeUuid = await Editor.Message.request('scene', 'create-node', createNodeOptions);
            const uuid = Array.isArray(nodeUuid) ? nodeUuid[0] : nodeUuid;
            // 如果指定了位置，设置节点位置
            if (args.position && uuid) {
                try {
                    await Editor.Message.request('scene', 'set-property', {
                        uuid: uuid,
                        path: 'position',
                        dump: { value: args.position }
                    });
                    return {
                        success: true,
                        data: {
                            nodeUuid: uuid,
                            prefabPath: args.prefabPath,
                            position: args.position,
                            message: '预制体实例化成功（备用方法）并设置了位置'
                        }
                    };
                }
                catch (_a) {
                    return {
                        success: true,
                        data: {
                            nodeUuid: uuid,
                            prefabPath: args.prefabPath,
                            message: '预制体实例化成功（备用方法）但位置设置失败'
                        }
                    };
                }
            }
            else {
                return {
                    success: true,
                    data: {
                        nodeUuid: uuid,
                        prefabPath: args.prefabPath,
                        message: '预制体实例化成功（备用方法）'
                    }
                };
            }
        }
        catch (err) {
            return {
                success: false,
                error: `备用预制体实例化方法也失败: ${err.message}`
            };
        }
    }
    async tryAlternativeInstantiateMethods(args) {
        try {
            // 方法1: 尝试使用 create-node 然后设置预制体
            const assetInfo = await this.getAssetInfo(args.prefabPath);
            if (!assetInfo) {
                return { success: false, error: '无法获取预制体信息' };
            }
            // 创建空节点
            const createResult = await this.createNode(args.parentUuid, args.position);
            if (!createResult.success) {
                return createResult;
            }
            // 尝试将预制体应用到节点
            const applyResult = await this.applyPrefabToNode(createResult.data.nodeUuid, assetInfo.uuid);
            if (applyResult.success) {
                return {
                    success: true,
                    data: {
                        nodeUuid: createResult.data.nodeUuid,
                        name: createResult.data.name,
                        message: '预制体实例化成功（使用备选方法）'
                    }
                };
            }
            else {
                return {
                    success: false,
                    error: '无法将预制体应用到节点',
                    data: {
                        nodeUuid: createResult.data.nodeUuid,
                        message: '已创建节点，但无法应用预制体数据'
                    }
                };
            }
        }
        catch (error) {
            return { success: false, error: `备选实例化方法失败: ${error}` };
        }
    }
    async getAssetInfo(prefabPath) {
        try {
            const assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', prefabPath);
            return assetInfo;
        }
        catch (_a) {
            return null;
        }
    }
    async createNode(parentUuid, position) {
        try {
            const createNodeOptions = {
                name: 'PrefabInstance'
            };
            // 设置父节点
            if (parentUuid) {
                createNodeOptions.parent = parentUuid;
            }
            // 设置位置
            if (position) {
                createNodeOptions.dump = {
                    position: position
                };
            }
            const nodeUuid = await Editor.Message.request('scene', 'create-node', createNodeOptions);
            const uuid = Array.isArray(nodeUuid) ? nodeUuid[0] : nodeUuid;
            return {
                success: true,
                data: {
                    nodeUuid: uuid,
                    name: 'PrefabInstance'
                }
            };
        }
        catch (error) {
            return { success: false, error: error.message || '创建节点失败' };
        }
    }
    async applyPrefabToNode(nodeUuid, prefabUuid) {
        // 尝试多种方法来应用预制体数据
        const methods = [
            () => Editor.Message.request('scene', 'apply-prefab', { node: nodeUuid, prefab: prefabUuid }),
            () => Editor.Message.request('scene', 'set-prefab', { node: nodeUuid, prefab: prefabUuid }),
            () => Editor.Message.request('scene', 'load-prefab-to-node', { node: nodeUuid, prefab: prefabUuid })
        ];
        for (const method of methods) {
            try {
                await method();
                return { success: true };
            }
            catch (_a) {
                // try next method
            }
        }
        return { success: false, error: '无法应用预制体数据' };
    }
    /**
     * 使用 asset-db API 创建预制体的新方法
     * 深度整合引擎的资源管理系统，实现完整的预制体创建流程
     */
    /**
     * 使用 asset-db API 创建预制体的新方法
     * 深度整合引擎的资源管理系统，实现完整的预制体创建流程
     */
    async createPrefabWithAssetDB(nodeUuid, savePath, prefabName, includeChildren, includeComponents) {
        var _a;
        try {
            console.log('=== 使用 Asset-DB API 创建预制体 ===');
            console.log(`节点UUID: ${nodeUuid}`);
            console.log(`保存路径: ${savePath}`);
            console.log(`预制体名称: ${prefabName}`);
            // 第一步：获取节点数据（包括变换属性）
            const nodeData = await this.getNodeData(nodeUuid);
            if (!nodeData) {
                return {
                    success: false,
                    error: '无法获取节点数据'
                };
            }
            console.log('获取到节点数据，子节点数量:', nodeData.children ? nodeData.children.length : 0);
            // 第二步：先创建资源文件以获取引擎分配的UUID
            console.log('创建预制体资源文件...');
            const tempPrefabContent = JSON.stringify([{ "__type__": "cc.Prefab", "_name": prefabName }], null, 2);
            const createResult = await this.createAssetWithAssetDB(savePath, tempPrefabContent);
            if (!createResult.success) {
                return createResult;
            }
            // 获取引擎分配的实际UUID
            const actualPrefabUuid = (_a = createResult.data) === null || _a === void 0 ? void 0 : _a.uuid;
            if (!actualPrefabUuid) {
                return {
                    success: false,
                    error: '无法获取引擎分配的预制体UUID'
                };
            }
            console.log('引擎分配的UUID:', actualPrefabUuid);
            // 第三步：使用实际UUID重新生成预制体内容
            const prefabContent = await this.createStandardPrefabContent(nodeData, prefabName, actualPrefabUuid, includeChildren, includeComponents);
            const prefabContentString = JSON.stringify(prefabContent, null, 2);
            // 第四步：更新预制体文件内容
            console.log('更新预制体文件内容...');
            const updateResult = await this.updateAssetWithAssetDB(savePath, prefabContentString);
            // 第五步：创建对应的meta文件（使用实际UUID）
            console.log('创建预制体meta文件...');
            const metaContent = this.createStandardMetaContent(prefabName, actualPrefabUuid);
            const metaResult = await this.createMetaWithAssetDB(savePath, metaContent);
            // 第六步：重新导入资源以更新引用
            console.log('重新导入预制体资源...');
            const reimportResult = await this.reimportAssetWithAssetDB(savePath);
            // 第七步：尝试将原始节点转换为预制体实例
            console.log('尝试将原始节点转换为预制体实例...');
            const convertResult = await this.convertNodeToPrefabInstance(nodeUuid, actualPrefabUuid, savePath);
            return {
                success: true,
                data: {
                    prefabUuid: actualPrefabUuid,
                    prefabPath: savePath,
                    nodeUuid: nodeUuid,
                    prefabName: prefabName,
                    convertedToPrefabInstance: convertResult.success,
                    createAssetResult: createResult,
                    updateResult: updateResult,
                    metaResult: metaResult,
                    reimportResult: reimportResult,
                    convertResult: convertResult,
                    message: convertResult.success ? '预制体创建并成功转换原始节点' : '预制体创建成功，但节点转换失败'
                }
            };
        }
        catch (error) {
            console.error('创建预制体时发生错误:', error);
            return {
                success: false,
                error: `创建预制体失败: ${error}`
            };
        }
    }
    async createPrefab(args) {
        try {
            // 支持 prefabPath 和 savePath 两种参数名
            const pathParam = args.prefabPath || args.savePath;
            if (!pathParam) {
                return {
                    success: false,
                    error: '缺少预制体路径参数。请提供 prefabPath 或 savePath。'
                };
            }
            const prefabName = args.prefabName || 'NewPrefab';
            const fullPath = pathParam.endsWith('.prefab') ?
                pathParam : `${pathParam}/${prefabName}.prefab`;
            // 记录撤销操作
            await this.recordUndoOperation('create-prefab', args.nodeUuid);
            // 优先使用编辑器标准方法: scene.create-prefab
            console.log('使用编辑器标准方法创建预制体...');
            const sceneResult = await this.createPrefabWithScene(args.nodeUuid, fullPath, prefabName);
            if (sceneResult.success) {
                // 创建成功后立即刷新资源
                await this.refreshAssets(fullPath);
                return sceneResult;
            }
            // 回退到 asset-db 方法
            console.log('scene方法失败，使用asset-db方法...');
            const assetDbResult = await this.createPrefabWithAssetDB(args.nodeUuid, fullPath, prefabName, true, // includeChildren
            true // includeComponents
            );
            if (assetDbResult.success) {
                await this.refreshAssets(fullPath);
                return assetDbResult;
            }
            // 最后使用自定义实现
            console.log('asset-db方法失败，使用自定义实现...');
            const customResult = await this.createPrefabCustom(args.nodeUuid, fullPath, prefabName);
            if (customResult.success) {
                await this.refreshAssets(fullPath);
            }
            return customResult;
        }
        catch (error) {
            return {
                success: false,
                error: `创建预制体时发生错误: ${error}`
            };
        }
    }
    // 使用编辑器标准的 scene.create-prefab 方法
    // 使用编辑器标准的 scene.create-prefab 方法
    async createPrefabWithScene(nodeUuid, prefabPath, prefabName) {
        try {
            console.log(`[DEBUG] Creating prefab with scene API: nodeUuid=${nodeUuid}, prefabPath=${prefabPath}`);
            // 确保目录存在
            const dirPath = prefabPath.substring(0, prefabPath.lastIndexOf('/'));
            console.log(`[DEBUG] Ensuring directory exists: ${dirPath}`);
            try {
                await Editor.Message.request('asset-db', 'create-asset', dirPath, null);
                console.log(`[DEBUG] Directory creation attempted: ${dirPath}`);
            }
            catch (dirError) {
                console.log(`[DEBUG] Directory creation failed or already exists: ${dirError}`);
            }
            const result = await Editor.Message.request('scene', 'create-prefab', {
                nodeUuid: nodeUuid,
                url: prefabPath
            });
            console.log('[DEBUG] scene.create-prefab result:', result);
            // 验证预制体是否真的创建成功
            await new Promise(resolve => setTimeout(resolve, 500)); // 等待文件系统同步
            try {
                const assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', prefabPath);
                console.log('[DEBUG] Asset verification result:', assetInfo);
                if (assetInfo && assetInfo.uuid) {
                    console.log('[DEBUG] Prefab creation verified successfully');
                    return {
                        success: true,
                        data: {
                            prefabPath: prefabPath,
                            prefabName: prefabName,
                            nodeUuid: nodeUuid,
                            assetUuid: assetInfo.uuid,
                            message: 'Prefab created successfully with scene API'
                        }
                    };
                }
                else {
                    console.log('[DEBUG] Prefab creation failed - asset not found after creation');
                    return {
                        success: false,
                        error: 'Prefab creation appeared successful but asset was not found. File may not have been created.'
                    };
                }
            }
            catch (verifyError) {
                console.log('[DEBUG] Asset verification failed:', verifyError);
                return {
                    success: false,
                    error: `Prefab creation verification failed: ${verifyError}`
                };
            }
        }
        catch (error) {
            console.log('[DEBUG] scene.create-prefab failed:', error);
            return {
                success: false,
                error: `Scene API prefab creation failed: ${error.message || error}`
            };
        }
    }
    // 记录撤销操作 - 暂时禁用，因为API不存在
    async recordUndoOperation(operation, nodeUuid) {
        try {
            // 暂时注释掉不存在的API调用
            // await Editor.Message.request('scene', 'undo.record', {
            //     operation: operation,
            //     nodeUuid: nodeUuid,
            //     timestamp: Date.now()
            // });
            console.log(`撤销记录跳过 (API不存在): ${operation} for ${nodeUuid}`);
        }
        catch (error) {
            console.log(`撤销记录保存失败: ${error}`);
            // 不阻断主流程
        }
    }
    // 刷新资源 - 优化版本，避免不必要的全局刷新
    async refreshAssets(assetPath) {
        try {
            if (assetPath) {
                // 刷新特定资源
                await Editor.Message.request('asset-db', 'refresh-asset', assetPath);
                console.log(`资源刷新成功: ${assetPath}`);
            }
            else {
                // 避免全局刷新，只刷新资源目录
                console.log('跳过全局资源刷新，避免编辑器重新加载');
                // 如果确实需要刷新，可以手动调用：
                // await Editor.Message.request('asset-db', 'refresh');
            }
        }
        catch (error) {
            console.log(`资源刷新失败: ${error}`);
            // 不阻断主流程
        }
    }
    // 使用编辑器标准流程实例化预制体
    // 使用编辑器标准流程实例化预制体
    async instantiatePrefabStandard(args, assetInfo) {
        try {
            const parentUuid = args.parentUuid || 'ae46a3bb-5483-43dc-8152-8c5e42a0a9aa'; // 默认场景根节点
            // 1. 开始记录
            await Editor.Message.request('scene', 'begin-recording', [parentUuid]);
            // 2. 创建节点（使用assetUuid参数）
            const createNodeOptions = {
                parent: parentUuid,
                assetUuid: assetInfo.uuid,
                name: args.name || assetInfo.name || 'PrefabInstance',
                type: 'cc.Prefab'
            };
            const nodeUuid = await Editor.Message.request('scene', 'create-node', createNodeOptions);
            const uuid = Array.isArray(nodeUuid) ? nodeUuid[0] : nodeUuid;
            // 3. 如果有位置参数，调整节点位置
            if (args.position) {
                await Editor.Message.request('scene', 'set-property', {
                    uuid: uuid,
                    path: 'position',
                    dump: { value: args.position }
                });
            }
            // 4. 如果需要调整在父节点中的顺序
            if (args.siblingIndex !== undefined && args.siblingIndex >= 0) {
                await Editor.Message.request('scene', 'move-array-element', {
                    uuid: parentUuid,
                    path: 'children',
                    target: args.siblingIndex,
                    offset: 0
                });
            }
            // 5. 结束记录
            await Editor.Message.request('scene', 'end-recording', [`instantiate-${Date.now()}`]);
            return {
                success: true,
                data: {
                    nodeUuid: uuid,
                    prefabPath: args.prefabPath,
                    parentUuid: parentUuid,
                    position: args.position,
                    message: '预制体实例化成功（使用编辑器标准流程）'
                }
            };
        }
        catch (error) {
            console.log('编辑器标准流程失败:', error);
            return {
                success: false,
                error: `编辑器标准流程失败: ${error}`
            };
        }
    }
    // 简化的实例化方法
    // 简化的实例化方法
    async instantiatePrefabSimple(args, assetInfo) {
        try {
            // 使用简化的 create-node API
            const createNodeOptions = {
                assetUuid: assetInfo.uuid
            };
            // 设置父节点
            if (args.parentUuid) {
                createNodeOptions.parent = args.parentUuid;
            }
            // 设置节点名称
            if (args.name) {
                createNodeOptions.name = args.name;
            }
            else if (assetInfo.name) {
                createNodeOptions.name = assetInfo.name;
            }
            // 设置初始属性（如位置）
            if (args.position) {
                createNodeOptions.dump = {
                    position: {
                        value: args.position
                    }
                };
            }
            // 创建节点
            const nodeUuid = await Editor.Message.request('scene', 'create-node', createNodeOptions);
            const uuid = Array.isArray(nodeUuid) ? nodeUuid[0] : nodeUuid;
            console.log('简化方法预制体节点创建成功:', {
                nodeUuid: uuid,
                prefabUuid: assetInfo.uuid,
                prefabPath: args.prefabPath
            });
            return {
                success: true,
                data: {
                    nodeUuid: uuid,
                    prefabPath: args.prefabPath,
                    parentUuid: args.parentUuid,
                    position: args.position,
                    message: '预制体实例化成功（使用简化方法）'
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `简化方法失败: ${error}`
            };
        }
    }
    // 1. Prefab browse handler
    async handlePrefabBrowse(args) {
        try {
            const { action } = args;
            switch (action) {
                case 'list':
                    return await this.getPrefabList(args.folder);
                case 'info':
                    if (!args.prefabPath) {
                        return { success: false, error: 'prefabPath required for info action' };
                    }
                    return await this.getPrefabInfo(args.prefabPath);
                case 'validate':
                    if (!args.prefabPath) {
                        return { success: false, error: 'prefabPath required for validate action' };
                    }
                    return await this.validatePrefab(args.prefabPath);
                default:
                    return { success: false, error: `Unsupported browse action: ${action}` };
            }
        }
        catch (error) {
            return { success: false, error: `Browse operation failed: ${error}` };
        }
    }
    // 2. Prefab lifecycle handler
    async handlePrefabLifecycle(args) {
        try {
            const { action } = args;
            switch (action) {
                case 'create':
                    if (!args.nodeUuid || !args.prefabName || !args.savePath) {
                        return { success: false, error: 'nodeUuid, prefabName, savePath required for create' };
                    }
                    const createResult = await this.createPrefab({
                        nodeUuid: args.nodeUuid,
                        prefabName: args.prefabName,
                        savePath: args.savePath
                    });
                    if (createResult.success) {
                        return {
                            success: true,
                            data: {
                                prefabPath: args.savePath,
                                message: '✅ Prefab created'
                            }
                        };
                    }
                    return createResult;
                case 'delete':
                    if (!args.prefabPath) {
                        return { success: false, error: 'prefabPath required for delete' };
                    }
                    try {
                        await Editor.Message.request('asset-db', 'delete-asset', args.prefabPath);
                        await this.refreshAssets();
                        return {
                            success: true,
                            data: { message: '✅ Prefab deleted' }
                        };
                    }
                    catch (error) {
                        return { success: false, error: `Delete failed: ${error}` };
                    }
                default:
                    return { success: false, error: `Unsupported lifecycle action: ${action}` };
            }
        }
        catch (error) {
            return { success: false, error: `Lifecycle operation failed: ${error}` };
        }
    }
    // 3. Prefab instance handler
    async handlePrefabInstance(args) {
        try {
            const { action } = args;
            switch (action) {
                case 'instantiate':
                    if (!args.prefabPath) {
                        return { success: false, error: 'prefabPath required for instantiate' };
                    }
                    const instantiateResult = await this.instantiatePrefab({
                        prefabPath: args.prefabPath,
                        parentUuid: args.parentUuid,
                        position: args.position
                    });
                    if (instantiateResult.success) {
                        return {
                            success: true,
                            data: {
                                nodeUuid: instantiateResult.data.nodeUuid,
                                message: '✅ Prefab instantiated'
                            }
                        };
                    }
                    return instantiateResult;
                case 'unlink':
                    if (!args.nodeUuid) {
                        return { success: false, error: 'nodeUuid required for unlink' };
                    }
                    const unlinkResult = await this.unlinkPrefab(args.nodeUuid);
                    if (unlinkResult.success) {
                        return {
                            success: true,
                            data: { message: '✅ Prefab unlinked' }
                        };
                    }
                    return unlinkResult;
                case 'apply':
                    if (!args.nodeUuid) {
                        return { success: false, error: 'nodeUuid required for apply' };
                    }
                    const applyResult = await this.applyPrefab(args.nodeUuid);
                    if (applyResult.success) {
                        return {
                            success: true,
                            data: { message: '✅ Changes applied to prefab' }
                        };
                    }
                    return applyResult;
                case 'revert':
                    if (!args.nodeUuid) {
                        return { success: false, error: 'nodeUuid required for revert' };
                    }
                    return await this.revertPrefab(args.nodeUuid);
                default:
                    return { success: false, error: `Unsupported instance action: ${action}` };
            }
        }
        catch (error) {
            return { success: false, error: `Instance operation failed: ${error}` };
        }
    }
    // 4. Prefab edit workflow handler
    async handlePrefabEdit(args) {
        try {
            const { action, prefabPath } = args;
            switch (action) {
                case 'enter':
                    const enterResult = await this.enterPrefabEditMode(prefabPath);
                    if (enterResult.success) {
                        return {
                            success: true,
                            data: {
                                status: 'editing',
                                prefabPath: prefabPath,
                                message: '✅ Entered prefab edit mode',
                                reminder: '⚠️  IMPORTANT: After making changes, you MUST call save action, then exit action to return to scene'
                            }
                        };
                    }
                    return enterResult;
                case 'save':
                    const saveResult = await this.savePrefabDirect(prefabPath);
                    if (saveResult.success) {
                        return {
                            success: true,
                            data: {
                                status: 'saved',
                                prefabPath: prefabPath,
                                message: '✅ Prefab saved',
                                reminder: '⚠️  IMPORTANT: You MUST call exit action now to return to scene view'
                            }
                        };
                    }
                    return saveResult;
                case 'exit':
                    const exitResult = await this.exitPrefabEditMode(prefabPath);
                    if (exitResult.success) {
                        return {
                            success: true,
                            data: {
                                status: 'scene',
                                message: '✅ Returned to scene view',
                                note: 'Prefab editing complete'
                            }
                        };
                    }
                    return exitResult;
                case 'test':
                    return await this.testPrefabChanges(prefabPath, args.parentUuid);
                default:
                    return { success: false, error: `Unsupported edit action: ${action}` };
            }
        }
        catch (error) {
            return { success: false, error: `Prefab edit failed: ${error}` };
        }
    }
    // 参数验证方法
    validatePrefabOperation(operation, args) {
        const requiredParams = {
            'create': ['nodeUuid', 'prefabName'],
            'instantiate': ['prefabPath'],
            'update': ['prefabPath', 'nodeUuid'],
            'delete': ['prefabPath'],
            'revert': ['nodeUuid'],
            'get_info': ['prefabPath'],
            'validate': ['prefabPath'],
            'unlink': ['nodeUuid'],
            'apply': ['nodeUuid'],
            'edit': ['prefabPath'],
            'save': ['prefabPath'],
            'exit_edit': [],
            'test_changes': ['prefabPath']
        };
        const required = requiredParams[operation];
        if (!required) {
            return { valid: false, error: `不支持的操作类型: ${operation}` };
        }
        for (const param of required) {
            if (!args[param]) {
                return { valid: false, error: `操作 '${operation}' 缺少必需参数: ${param}` };
            }
        }
        // 特殊验证规则
        if (operation === 'create' && !args.savePath && !args.prefabPath) {
            return { valid: false, error: `操作 'create' 需要 savePath 或 prefabPath 参数` };
        }
        return { valid: true };
    }
    // 统一的预制体管理方法
    async managePrefab(args) {
        try {
            // 验证操作类型
            const operation = args.operation;
            if (!operation) {
                return {
                    success: false,
                    error: '缺少必需参数: operation'
                };
            }
            // 验证各操作所需的参数
            const validationResult = this.validatePrefabOperation(operation, args);
            if (!validationResult.valid) {
                return {
                    success: false,
                    error: validationResult.error
                };
            }
            switch (operation) {
                case 'create':
                    return await this.createPrefab({
                        nodeUuid: args.nodeUuid,
                        savePath: args.savePath || args.prefabPath,
                        prefabName: args.prefabName
                    });
                case 'instantiate':
                    return await this.instantiatePrefab({
                        prefabPath: args.prefabPath,
                        parentUuid: args.parentUuid,
                        position: args.position,
                        siblingIndex: args.siblingIndex
                    });
                case 'update':
                    return await this.updatePrefab(args.prefabPath, args.nodeUuid);
                case 'delete':
                    // 删除预制体资源
                    try {
                        await Editor.Message.request('asset-db', 'delete-asset', args.prefabPath);
                        await this.refreshAssets();
                        return {
                            success: true,
                            data: {
                                prefabPath: args.prefabPath,
                                message: '预制体删除成功'
                            }
                        };
                    }
                    catch (error) {
                        return {
                            success: false,
                            error: `预制体删除失败: ${error}`
                        };
                    }
                case 'revert':
                    return await this.revertPrefab(args.nodeUuid);
                case 'get_info':
                    return await this.getPrefabInfo(args.prefabPath);
                case 'validate':
                    return await this.validatePrefab(args.prefabPath);
                case 'unlink':
                    return await this.unlinkPrefab(args.nodeUuid);
                case 'apply':
                    return await this.applyPrefab(args.nodeUuid);
                case 'edit':
                    return await this.enterPrefabEditMode(args.prefabPath);
                case 'save':
                    return await this.savePrefabDirect(args.prefabPath);
                case 'exit_edit':
                    return await this.exitPrefabEditMode(args.prefabPath);
                case 'test_changes':
                    return await this.testPrefabChanges(args.prefabPath, args.parentUuid);
                default:
                    return {
                        success: false,
                        error: `不支持的预制体操作: ${operation}`
                    };
            }
        }
        catch (error) {
            return {
                success: false,
                error: `预制体管理操作失败: ${error}`
            };
        }
    }
    async createPrefabCustom(nodeUuid, prefabPath, prefabName) {
        var _a, _b;
        try {
            // 1. 获取源节点的完整数据
            const nodeData = await this.getNodeData(nodeUuid);
            if (!nodeData) {
                return {
                    success: false,
                    error: `无法找到节点: ${nodeUuid}`
                };
            }
            // 2. 生成预制体UUID
            const prefabUuid = this.generateUUID();
            // 3. 创建预制体数据结构
            const prefabData = this.createPrefabData(nodeData, prefabName, prefabUuid);
            // 4. 基于官方格式创建预制体数据结构
            console.log('=== 开始创建预制体 ===');
            console.log('节点名称:', ((_a = nodeData.name) === null || _a === void 0 ? void 0 : _a.value) || '未知');
            console.log('节点UUID:', ((_b = nodeData.uuid) === null || _b === void 0 ? void 0 : _b.value) || '未知');
            console.log('预制体保存路径:', prefabPath);
            console.log(`开始创建预制体，节点数据:`, nodeData);
            const prefabJsonData = await this.createStandardPrefabContent(nodeData, prefabName, prefabUuid, true, true);
            // 5. 创建标准meta文件数据
            const standardMetaData = this.createStandardMetaData(prefabName, prefabUuid);
            // 6. 保存预制体和meta文件
            const saveResult = await this.savePrefabWithMeta(prefabPath, prefabJsonData, standardMetaData);
            if (saveResult.success) {
                // 保存成功后，将原始节点转换为预制体实例
                const convertResult = await this.convertNodeToPrefabInstance(nodeUuid, prefabPath, prefabUuid);
                return {
                    success: true,
                    data: {
                        prefabUuid: prefabUuid,
                        prefabPath: prefabPath,
                        nodeUuid: nodeUuid,
                        prefabName: prefabName,
                        convertedToPrefabInstance: convertResult.success,
                        message: convertResult.success ?
                            '自定义预制体创建成功，原始节点已转换为预制体实例' :
                            '预制体创建成功，但节点转换失败'
                    }
                };
            }
            else {
                return {
                    success: false,
                    error: saveResult.error || '保存预制体文件失败'
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: `创建预制体时发生错误: ${error}`
            };
        }
    }
    async getNodeData(nodeUuid) {
        try {
            // 首先获取基本节点信息
            const nodeInfo = await Editor.Message.request('scene', 'query-node', nodeUuid);
            if (!nodeInfo) {
                return null;
            }
            console.log(`获取节点 ${nodeUuid} 的基本信息成功`);
            // 使用query-node-tree获取包含子节点的完整结构
            const nodeTree = await this.getNodeWithChildren(nodeUuid);
            if (nodeTree) {
                console.log(`获取节点 ${nodeUuid} 的完整树结构成功`);
                return nodeTree;
            }
            else {
                console.log(`使用基本节点信息`);
                return nodeInfo;
            }
        }
        catch (error) {
            console.warn(`获取节点数据失败 ${nodeUuid}:`, error);
            return null;
        }
    }
    // 使用query-node-tree获取包含子节点的完整节点结构
    async getNodeWithChildren(nodeUuid) {
        try {
            // 获取整个场景树
            const tree = await Editor.Message.request('scene', 'query-node-tree');
            if (!tree) {
                return null;
            }
            // 在树中查找指定的节点
            const targetNode = this.findNodeInTree(tree, nodeUuid);
            if (targetNode) {
                console.log(`在场景树中找到节点 ${nodeUuid}，子节点数量: ${targetNode.children ? targetNode.children.length : 0}`);
                // 增强节点树，获取每个节点的正确组件信息
                const enhancedTree = await this.enhanceTreeWithMCPComponents(targetNode);
                return enhancedTree;
            }
            return null;
        }
        catch (error) {
            console.warn(`获取节点树结构失败 ${nodeUuid}:`, error);
            return null;
        }
    }
    // 在节点树中递归查找指定UUID的节点
    findNodeInTree(node, targetUuid) {
        var _a;
        if (!node)
            return null;
        // 检查当前节点
        if (node.uuid === targetUuid || ((_a = node.value) === null || _a === void 0 ? void 0 : _a.uuid) === targetUuid) {
            return node;
        }
        // 递归检查子节点
        if (node.children && Array.isArray(node.children)) {
            for (const child of node.children) {
                const found = this.findNodeInTree(child, targetUuid);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }
    /**
     * 使用MCP接口增强节点树，获取正确的组件信息
     */
    async enhanceTreeWithMCPComponents(node) {
        if (!node || !node.uuid) {
            return node;
        }
        try {
            // 修复(fork)：原实现 fetch(`http://localhost:${port}/mcp`) 自调用本机 MCP 端点——
            // 带 authToken 鉴权时该自调用不带 Authorization 头会被 401 挡掉，且有性能/自锁风险。
            // 改为进程内直调 query-node（与 buildBasicNodeInfo 同源），__comps__ 的 __type__/cid 即脚本组件压缩UUID。
            const nodeData = await Editor.Message.request('scene', 'query-node', node.uuid);
            if (nodeData && nodeData.__comps__) {
                node.components = nodeData.__comps__.map((comp) => {
                    var _a;
                    return ({
                        type: comp.__type__ || comp.cid || comp.type || 'Unknown',
                        uuid: ((_a = comp.uuid) === null || _a === void 0 ? void 0 : _a.value) || comp.uuid || null,
                        enabled: comp.enabled !== undefined ? comp.enabled : true,
                        properties: comp.value || {}
                    });
                });
                console.log(`节点 ${node.uuid} 获取到 ${node.components.length} 个组件(query-node直调,脚本组件为压缩UUID类型)`);
            }
        }
        catch (error) {
            console.warn(`获取节点 ${node.uuid} 的组件信息失败:`, error);
        }
        // 递归处理子节点
        if (node.children && Array.isArray(node.children)) {
            for (let i = 0; i < node.children.length; i++) {
                node.children[i] = await this.enhanceTreeWithMCPComponents(node.children[i]);
            }
        }
        return node;
    }
    async buildBasicNodeInfo(nodeUuid) {
        try {
            // 构建基本的节点信息
            const nodeInfo = await Editor.Message.request('scene', 'query-node', nodeUuid);
            if (!nodeInfo) {
                return null;
            }
            // 简化版本：只返回基本节点信息，不获取子节点和组件
            // 这些信息将在后续的预制体处理中根据需要添加
            const basicInfo = Object.assign(Object.assign({}, nodeInfo), { children: [], components: [] });
            return basicInfo;
        }
        catch (_a) {
            return null;
        }
    }
    // 验证节点数据是否有效
    isValidNodeData(nodeData) {
        if (!nodeData)
            return false;
        if (typeof nodeData !== 'object')
            return false;
        // 检查基本属性 - 适配query-node-tree的数据格式
        return nodeData.hasOwnProperty('uuid') ||
            nodeData.hasOwnProperty('name') ||
            nodeData.hasOwnProperty('__type__') ||
            (nodeData.value && (nodeData.value.hasOwnProperty('uuid') ||
                nodeData.value.hasOwnProperty('name') ||
                nodeData.value.hasOwnProperty('__type__')));
    }
    // 提取子节点UUID的统一方法
    extractChildUuid(childRef) {
        if (!childRef)
            return null;
        // 方法1: 直接字符串
        if (typeof childRef === 'string') {
            return childRef;
        }
        // 方法2: value属性包含字符串
        if (childRef.value && typeof childRef.value === 'string') {
            return childRef.value;
        }
        // 方法3: value.uuid属性
        if (childRef.value && childRef.value.uuid) {
            return childRef.value.uuid;
        }
        // 方法4: 直接uuid属性
        if (childRef.uuid) {
            return childRef.uuid;
        }
        // 方法5: __id__引用 - 这种情况需要特殊处理
        if (childRef.__id__ !== undefined) {
            console.log(`发现__id__引用: ${childRef.__id__}，可能需要从数据结构中查找`);
            return null; // 暂时返回null，后续可以添加引用解析逻辑
        }
        console.warn('无法提取子节点UUID:', JSON.stringify(childRef));
        return null;
    }
    // 获取需要处理的子节点数据
    getChildrenToProcess(nodeData) {
        var _a;
        const children = [];
        // 方法1: 直接从children数组获取（从query-node-tree返回的数据）
        if (nodeData.children && Array.isArray(nodeData.children)) {
            console.log(`从children数组获取子节点，数量: ${nodeData.children.length}`);
            for (const child of nodeData.children) {
                // query-node-tree返回的子节点通常已经是完整的数据结构
                if (this.isValidNodeData(child)) {
                    children.push(child);
                    console.log(`添加子节点: ${child.name || ((_a = child.value) === null || _a === void 0 ? void 0 : _a.name) || '未知'}`);
                }
                else {
                    console.log('子节点数据无效:', JSON.stringify(child, null, 2));
                }
            }
        }
        else {
            console.log('节点没有子节点或children数组为空');
        }
        return children;
    }
    generateUUID() {
        // 生成符合Cocos Creator格式的UUID
        const chars = '0123456789abcdef';
        let uuid = '';
        for (let i = 0; i < 32; i++) {
            if (i === 8 || i === 12 || i === 16 || i === 20) {
                uuid += '-';
            }
            uuid += chars[Math.floor(Math.random() * chars.length)];
        }
        return uuid;
    }
    createPrefabData(nodeData, prefabName, prefabUuid) {
        // 创建标准的预制体数据结构
        const prefabAsset = {
            "__type__": "cc.Prefab",
            "_name": prefabName,
            "_objFlags": 0,
            "__editorExtras__": {},
            "_native": "",
            "data": {
                "__id__": 1
            },
            "optimizationPolicy": 0,
            "persistent": false
        };
        // 处理节点数据，确保符合预制体格式
        const processedNodeData = this.processNodeForPrefab(nodeData, prefabUuid);
        return [prefabAsset, ...processedNodeData];
    }
    processNodeForPrefab(nodeData, prefabUuid) {
        // 处理节点数据以符合预制体格式
        const processedData = [];
        let idCounter = 1;
        // 递归处理节点和组件
        const processNode = (node, parentId = 0) => {
            const nodeId = idCounter++;
            // 创建节点对象
            const processedNode = {
                "__type__": "cc.Node",
                "_name": node.name || "Node",
                "_objFlags": 0,
                "__editorExtras__": {},
                "_parent": parentId > 0 ? { "__id__": parentId } : null,
                "_children": node.children ? node.children.map(() => ({ "__id__": idCounter++ })) : [],
                "_active": node.active !== false,
                "_components": node.components ? node.components.map(() => ({ "__id__": idCounter++ })) : [],
                "_prefab": {
                    "__id__": idCounter++
                },
                "_lpos": {
                    "__type__": "cc.Vec3",
                    "x": 0,
                    "y": 0,
                    "z": 0
                },
                "_lrot": {
                    "__type__": "cc.Quat",
                    "x": 0,
                    "y": 0,
                    "z": 0,
                    "w": 1
                },
                "_lscale": {
                    "__type__": "cc.Vec3",
                    "x": 1,
                    "y": 1,
                    "z": 1
                },
                "_mobility": 0,
                "_layer": 1073741824,
                "_euler": {
                    "__type__": "cc.Vec3",
                    "x": 0,
                    "y": 0,
                    "z": 0
                },
                "_id": ""
            };
            processedData.push(processedNode);
            // 处理组件
            if (node.components) {
                node.components.forEach((component) => {
                    const componentId = idCounter++;
                    const processedComponents = this.processComponentForPrefab(component, componentId);
                    processedData.push(...processedComponents);
                });
            }
            // 处理子节点
            if (node.children) {
                node.children.forEach((child) => {
                    processNode(child, nodeId);
                });
            }
            return nodeId;
        };
        processNode(nodeData);
        return processedData;
    }
    processComponentForPrefab(component, componentId) {
        // 处理组件数据以符合预制体格式
        const processedComponent = Object.assign({ "__type__": component.type || "cc.Component", "_name": "", "_objFlags": 0, "__editorExtras__": {}, "node": {
                "__id__": componentId - 1
            }, "_enabled": component.enabled !== false, "__prefab": {
                "__id__": componentId + 1
            } }, component.properties);
        // 添加组件特定的预制体信息
        const compPrefabInfo = {
            "__type__": "cc.CompPrefabInfo",
            "fileId": this.generateFileId()
        };
        return [processedComponent, compPrefabInfo];
    }
    generateFileId() {
        // 生成文件ID（简化版本）
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/';
        let fileId = '';
        for (let i = 0; i < 22; i++) {
            fileId += chars[Math.floor(Math.random() * chars.length)];
        }
        return fileId;
    }
    createMetaData(prefabName, prefabUuid) {
        return {
            "ver": "1.1.50",
            "importer": "prefab",
            "imported": true,
            "uuid": prefabUuid,
            "files": [
                ".json"
            ],
            "subMetas": {},
            "userData": {
                "syncNodeName": prefabName
            }
        };
    }
    async savePrefabFiles(prefabPath, prefabData, metaData) {
        try {
            // 使用Editor API保存预制体文件
            const prefabContent = JSON.stringify(prefabData, null, 2);
            const metaContent = JSON.stringify(metaData, null, 2);
            // 尝试使用更可靠的保存方法
            await this.saveAssetFile(prefabPath, prefabContent);
            // 再创建meta文件
            const metaPath = `${prefabPath}.meta`;
            await this.saveAssetFile(metaPath, metaContent);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message || '保存预制体文件失败' };
        }
    }
    async saveAssetFile(filePath, content) {
        // 尝试多种保存方法
        const methods = [
            () => Editor.Message.request('asset-db', 'create-asset', filePath, content),
            () => Editor.Message.request('asset-db', 'save-asset', filePath, content),
            () => Editor.Message.request('asset-db', 'write-asset', filePath, content)
        ];
        for (const method of methods) {
            try {
                await method();
                return;
            }
            catch (_a) {
                // try next method
            }
        }
        throw new Error('所有保存方法都失败了');
    }
    async updatePrefab(prefabPath, nodeUuid) {
        try {
            console.log(`开始更新预制体: prefabPath=${prefabPath}, nodeUuid=${nodeUuid}`);
            // 1. 首先验证节点是预制体实例
            const nodeInfo = await Editor.Message.request('scene', 'query-node', nodeUuid);
            if (!nodeInfo || !nodeInfo.__prefab__) {
                return {
                    success: false,
                    error: '指定的节点不是预制体实例'
                };
            }
            const prefabInfo = nodeInfo.__prefab__;
            console.log(`预制体实例信息:`, prefabInfo);
            // 2. 使用正确的 apply-prefab API 格式（基于编辑器日志）
            console.log('调用 scene.apply-prefab API...');
            const applyResult = await Editor.Message.request('scene', 'apply-prefab', [nodeUuid]);
            console.log('apply-prefab API 调用结果:', applyResult);
            // 3. 等待编辑器处理
            await new Promise(resolve => setTimeout(resolve, 200));
            // 4. 获取预制体资源信息并刷新
            try {
                const assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', prefabPath);
                if (assetInfo && assetInfo.source) {
                    // 刷新特定的预制体资源
                    await this.refreshAssets(assetInfo.source);
                    console.log(`预制体资源已刷新: ${assetInfo.source}`);
                }
            }
            catch (assetError) {
                console.log('获取或刷新预制体资源失败:', assetError);
            }
            return {
                success: true,
                data: {
                    nodeUuid: nodeUuid,
                    prefabPath: prefabPath,
                    prefabAssetUuid: prefabInfo.asset,
                    message: '预制体实例的修改已成功应用到预制体资源',
                    applyResult: applyResult
                }
            };
        }
        catch (error) {
            console.error('更新预制体失败:', error);
            return {
                success: false,
                error: `更新预制体失败: ${error.message || error}`,
                instruction: '请确认节点是有效的预制体实例且存在未应用的修改'
            };
        }
    }
    async revertPrefab(nodeUuid) {
        try {
            // 先获取节点信息以确定预制体资源UUID
            const nodeInfo = await Editor.Message.request('scene', 'query-node', nodeUuid);
            if (!nodeInfo || !nodeInfo.__prefab__) {
                return {
                    success: false,
                    error: 'Node is not a prefab instance'
                };
            }
            const prefabAssetUuid = nodeInfo.__prefab__.uuid;
            // 使用正确的API: restore-prefab
            Editor.Message.request('scene', 'restore-prefab', nodeUuid, prefabAssetUuid);
            return {
                success: true,
                data: {
                    message: 'Prefab reverted',
                    nodeUuid: nodeUuid
                }
            };
        }
        catch (error) {
            return { success: false, error: `Failed to get node info: ${error}` };
        }
    }
    async getPrefabInfo(prefabPath) {
        try {
            const assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', prefabPath);
            if (!assetInfo) {
                throw new Error('Prefab not found');
            }
            const metaInfo = await Editor.Message.request('asset-db', 'query-asset-meta', assetInfo.uuid);
            const info = {
                name: metaInfo.name,
                uuid: metaInfo.uuid,
                path: prefabPath,
                folder: prefabPath.substring(0, prefabPath.lastIndexOf('/')),
                createTime: metaInfo.createTime,
                modifyTime: metaInfo.modifyTime,
                dependencies: metaInfo.depends || []
            };
            return { success: true, data: info };
        }
        catch (err) {
            return { success: false, error: err.message };
        }
    }
    async createPrefabFromNode(args) {
        var _a;
        // 从 prefabPath 提取名称
        const prefabPath = args.prefabPath;
        const prefabName = ((_a = prefabPath.split('/').pop()) === null || _a === void 0 ? void 0 : _a.replace('.prefab', '')) || 'NewPrefab';
        // 调用原来的 createPrefab 方法
        return await this.createPrefab({
            nodeUuid: args.nodeUuid,
            savePath: prefabPath,
            prefabName: prefabName
        });
    }
    async validatePrefab(prefabPath) {
        try {
            // 读取预制体文件内容
            const assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', prefabPath);
            if (!assetInfo) {
                return {
                    success: false,
                    error: '预制体文件不存在'
                };
            }
            // 获取预制体文件的磁盘路径
            const diskPath = await Editor.Message.request('asset-db', 'query-path', prefabPath);
            if (!diskPath) {
                return {
                    success: false,
                    error: 'Cannot get prefab disk path'
                };
            }
            // 使用Node.js fs读取文件
            const fs = require('fs');
            try {
                const content = fs.readFileSync(diskPath, 'utf8');
                const prefabData = JSON.parse(content);
                const validationResult = this.validatePrefabFormat(prefabData);
                return {
                    success: true,
                    data: {
                        isValid: validationResult.isValid,
                        issues: validationResult.issues,
                        nodeCount: validationResult.nodeCount,
                        componentCount: validationResult.componentCount,
                        message: validationResult.isValid ? '预制体格式有效' : '预制体格式存在问题'
                    }
                };
            }
            catch (parseError) {
                return {
                    success: false,
                    error: '预制体文件格式错误，无法解析JSON'
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: `验证预制体时发生错误: ${error.message || error}`
            };
        }
    }
    validatePrefabFormat(prefabData) {
        const issues = [];
        let nodeCount = 0;
        let componentCount = 0;
        // 检查基本结构
        if (!Array.isArray(prefabData)) {
            issues.push('预制体数据必须是数组格式');
            return { isValid: false, issues, nodeCount, componentCount };
        }
        if (prefabData.length === 0) {
            issues.push('预制体数据为空');
            return { isValid: false, issues, nodeCount, componentCount };
        }
        // 检查第一个元素是否为预制体资产
        const firstElement = prefabData[0];
        if (!firstElement || firstElement.__type__ !== 'cc.Prefab') {
            issues.push('第一个元素必须是cc.Prefab类型');
        }
        // 统计节点和组件
        prefabData.forEach((item, index) => {
            if (item.__type__ === 'cc.Node') {
                nodeCount++;
            }
            else if (item.__type__ && item.__type__.includes('cc.')) {
                componentCount++;
            }
        });
        // 检查必要的字段
        if (nodeCount === 0) {
            issues.push('预制体必须包含至少一个节点');
        }
        return {
            isValid: issues.length === 0,
            issues,
            nodeCount,
            componentCount
        };
    }
    async readPrefabContent(prefabPath) {
        try {
            // 获取磁盘路径
            const diskPath = await Editor.Message.request('asset-db', 'query-path', prefabPath);
            if (!diskPath) {
                return { success: false, error: 'Cannot get prefab disk path' };
            }
            // 使用fs读取文件
            const fs = require('fs');
            try {
                const content = fs.readFileSync(diskPath, 'utf8');
                const prefabData = JSON.parse(content);
                return { success: true, data: prefabData };
            }
            catch (parseError) {
                return { success: false, error: '预制体文件格式错误' };
            }
        }
        catch (error) {
            return { success: false, error: error.message || '读取预制体文件失败' };
        }
    }
    /**
     * 使用 asset-db API 创建资源文件
     */
    /**
     * 使用 asset-db API 创建资源文件
     */
    async createAssetWithAssetDB(assetPath, content) {
        try {
            const assetInfo = await Editor.Message.request('asset-db', 'create-asset', assetPath, content, {
                overwrite: true,
                rename: false
            });
            console.log('创建资源文件成功:', assetInfo);
            return { success: true, data: assetInfo };
        }
        catch (error) {
            console.error('创建资源文件失败:', error);
            return { success: false, error: error.message || '创建资源文件失败' };
        }
    }
    /**
     * 使用 asset-db API 创建 meta 文件
     */
    /**
     * 使用 asset-db API 创建 meta 文件
     */
    async createMetaWithAssetDB(assetPath, metaContent) {
        try {
            const metaContentString = JSON.stringify(metaContent, null, 2);
            const assetInfo = await Editor.Message.request('asset-db', 'save-asset-meta', assetPath, metaContentString);
            console.log('创建meta文件成功:', assetInfo);
            return { success: true, data: assetInfo };
        }
        catch (error) {
            console.error('创建meta文件失败:', error);
            return { success: false, error: error.message || '创建meta文件失败' };
        }
    }
    /**
     * 使用 asset-db API 重新导入资源
     */
    /**
     * 使用 asset-db API 重新导入资源
     */
    async reimportAssetWithAssetDB(assetPath) {
        try {
            const result = await Editor.Message.request('asset-db', 'reimport-asset', assetPath);
            console.log('重新导入资源成功:', result);
            return { success: true, data: result };
        }
        catch (error) {
            console.error('重新导入资源失败:', error);
            return { success: false, error: error.message || '重新导入资源失败' };
        }
    }
    /**
     * 使用 asset-db API 更新资源文件内容
     */
    /**
     * 使用 asset-db API 更新资源文件内容
     */
    async updateAssetWithAssetDB(assetPath, content) {
        try {
            const result = await Editor.Message.request('asset-db', 'save-asset', assetPath, content);
            console.log('更新资源文件成功:', result);
            return { success: true, data: result };
        }
        catch (error) {
            console.error('更新资源文件失败:', error);
            return { success: false, error: error.message || '更新资源文件失败' };
        }
    }
    /**
     * 创建符合 Cocos Creator 标准的预制体内容
     * 完整实现递归节点树处理，匹配引擎标准格式
     */
    async createStandardPrefabContent(nodeData, prefabName, prefabUuid, includeChildren, includeComponents) {
        console.log('开始创建引擎标准预制体内容...');
        const prefabData = [];
        let currentId = 0;
        // 1. 创建预制体资产对象 (index 0)
        const prefabAsset = {
            "__type__": "cc.Prefab",
            "_name": prefabName || "", // 确保预制体名称不为空
            "_objFlags": 0,
            "__editorExtras__": {},
            "_native": "",
            "data": {
                "__id__": 1
            },
            "optimizationPolicy": 0,
            "persistent": false
        };
        prefabData.push(prefabAsset);
        currentId++;
        // 2. 递归创建完整的节点树结构
        const context = {
            prefabData,
            currentId: currentId + 1, // 根节点占用索引1，子节点从索引2开始
            prefabAssetIndex: 0,
            nodeFileIds: new Map(), // 存储节点ID到fileId的映射
            nodeUuidToIndex: new Map(), // 存储节点UUID到索引的映射
            componentUuidToIndex: new Map() // 存储组件UUID到索引的映射
        };
        // 创建根节点和整个节点树 - 注意：根节点的父节点应该是null，不是预制体对象
        await this.createCompleteNodeTree(nodeData, null, 1, context, includeChildren, includeComponents, prefabName);
        console.log(`预制体内容创建完成，总共 ${prefabData.length} 个对象`);
        console.log('节点fileId映射:', Array.from(context.nodeFileIds.entries()));
        return prefabData;
    }
    /**
     * 递归创建完整的节点树，包括所有子节点和对应的PrefabInfo
     */
    async createCompleteNodeTree(nodeData, parentNodeIndex, nodeIndex, context, includeChildren, includeComponents, nodeName) {
        const { prefabData } = context;
        // 创建节点对象
        const node = this.createEngineStandardNode(nodeData, parentNodeIndex, nodeName);
        // 确保节点在指定的索引位置
        while (prefabData.length <= nodeIndex) {
            prefabData.push(null);
        }
        console.log(`设置节点到索引 ${nodeIndex}: ${node._name}, _parent:`, node._parent, `_children count: ${node._children.length}`);
        prefabData[nodeIndex] = node;
        // 为当前节点生成fileId并记录UUID到索引的映射
        const nodeUuid = this.extractNodeUuid(nodeData);
        const fileId = nodeUuid || this.generateFileId();
        context.nodeFileIds.set(nodeIndex.toString(), fileId);
        // 记录节点UUID到索引的映射
        if (nodeUuid) {
            context.nodeUuidToIndex.set(nodeUuid, nodeIndex);
            console.log(`记录节点UUID映射: ${nodeUuid} -> ${nodeIndex}`);
        }
        // 先处理子节点（保持与手动创建的索引顺序一致）
        const childrenToProcess = this.getChildrenToProcess(nodeData);
        if (includeChildren && childrenToProcess.length > 0) {
            console.log(`处理节点 ${node._name} 的 ${childrenToProcess.length} 个子节点`);
            // 为每个子节点分配索引
            const childIndices = [];
            console.log(`准备为 ${childrenToProcess.length} 个子节点分配索引，当前ID: ${context.currentId}`);
            for (let i = 0; i < childrenToProcess.length; i++) {
                console.log(`处理第 ${i + 1} 个子节点，当前currentId: ${context.currentId}`);
                const childIndex = context.currentId++;
                childIndices.push(childIndex);
                node._children.push({ "__id__": childIndex });
                console.log(`✅ 添加子节点引用到 ${node._name}: {__id__: ${childIndex}}`);
            }
            console.log(`✅ 节点 ${node._name} 最终的子节点数组:`, node._children);
            // 递归创建子节点
            for (let i = 0; i < childrenToProcess.length; i++) {
                const childData = childrenToProcess[i];
                const childIndex = childIndices[i];
                await this.createCompleteNodeTree(childData, nodeIndex, childIndex, context, includeChildren, includeComponents, childData.name || `Child${i + 1}`);
            }
        }
        // 然后处理组件
        if (includeComponents && nodeData.components && Array.isArray(nodeData.components)) {
            console.log(`处理节点 ${node._name} 的 ${nodeData.components.length} 个组件`);
            const componentIndices = [];
            for (const component of nodeData.components) {
                const componentIndex = context.currentId++;
                componentIndices.push(componentIndex);
                node._components.push({ "__id__": componentIndex });
                // 记录组件UUID到索引的映射
                const componentUuid = component.uuid || (component.value && component.value.uuid);
                if (componentUuid) {
                    context.componentUuidToIndex.set(componentUuid, componentIndex);
                    console.log(`记录组件UUID映射: ${componentUuid} -> ${componentIndex}`);
                }
                // 创建组件对象，传入context以处理引用
                const componentObj = this.createComponentObject(component, nodeIndex, context);
                prefabData[componentIndex] = componentObj;
                // 为组件创建 CompPrefabInfo
                const compPrefabInfoIndex = context.currentId++;
                prefabData[compPrefabInfoIndex] = {
                    "__type__": "cc.CompPrefabInfo",
                    "fileId": this.generateFileId()
                };
                // 如果组件对象有 __prefab 属性，设置引用
                if (componentObj && typeof componentObj === 'object') {
                    componentObj.__prefab = { "__id__": compPrefabInfoIndex };
                }
            }
            console.log(`✅ 节点 ${node._name} 添加了 ${componentIndices.length} 个组件`);
        }
        // 为当前节点创建PrefabInfo
        const prefabInfoIndex = context.currentId++;
        node._prefab = { "__id__": prefabInfoIndex };
        const prefabInfo = {
            "__type__": "cc.PrefabInfo",
            "root": { "__id__": 1 },
            "asset": { "__id__": context.prefabAssetIndex },
            "fileId": fileId,
            "targetOverrides": null,
            "nestedPrefabInstanceRoots": null
        };
        // 根节点的特殊处理
        if (nodeIndex === 1) {
            // 根节点没有instance，但可能有targetOverrides
            prefabInfo.instance = null;
        }
        else {
            // 子节点通常有instance为null
            prefabInfo.instance = null;
        }
        prefabData[prefabInfoIndex] = prefabInfo;
        context.currentId = prefabInfoIndex + 1;
    }
    /**
     * 将UUID转换为Cocos Creator的压缩格式
     * 基于真实Cocos Creator编辑器的压缩算法实现
     * 前5个hex字符保持不变，剩余27个字符压缩成18个字符
     */
    uuidToCompressedId(uuid) {
        const BASE64_KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        // 移除连字符并转为小写
        const cleanUuid = uuid.replace(/-/g, '').toLowerCase();
        // 确保UUID有效
        if (cleanUuid.length !== 32) {
            return uuid; // 如果不是有效的UUID，返回原始值
        }
        // Cocos Creator的压缩算法：前5个字符保持不变，剩余27个字符压缩成18个字符
        let result = cleanUuid.substring(0, 5);
        // 剩余27个字符需要压缩成18个字符
        const remainder = cleanUuid.substring(5);
        // 每3个hex字符压缩成2个字符
        for (let i = 0; i < remainder.length; i += 3) {
            const hex1 = remainder[i] || '0';
            const hex2 = remainder[i + 1] || '0';
            const hex3 = remainder[i + 2] || '0';
            // 将3个hex字符(12位)转换为2个base64字符
            const value = parseInt(hex1 + hex2 + hex3, 16);
            // 12位分成两个6位
            const high6 = (value >> 6) & 63;
            const low6 = value & 63;
            result += BASE64_KEYS[high6] + BASE64_KEYS[low6];
        }
        return result;
    }
    /**
     * 创建组件对象
     */
    createComponentObject(componentData, nodeIndex, context) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14;
        let componentType = componentData.type || componentData.__type__ || 'cc.Component';
        const enabled = componentData.enabled !== undefined ? componentData.enabled : true;
        // console.log(`创建组件对象 - 原始类型: ${componentType}`);
        // console.log('组件完整数据:', JSON.stringify(componentData, null, 2));
        // 处理脚本组件：正常应已是压缩UUID(query-node 直调保证)；防御兜底(fork)——
        // 若拿到的是明文类名(非 5hex+18base64),prefab 导入会反序列化成 null 组件，
        // 尝试从 __scriptAsset 脚本资产 uuid 推导压缩UUID；推不出则告警。
        if (componentType && !componentType.startsWith('cc.') && !/^[0-9a-f]{5}[0-9A-Za-z+/]{18}$/.test(componentType)) {
            const scriptUuid = ((_c = (_b = (_a = componentData.properties) === null || _a === void 0 ? void 0 : _a.__scriptAsset) === null || _b === void 0 ? void 0 : _b.value) === null || _c === void 0 ? void 0 : _c.uuid)
                || ((_e = (_d = componentData.__scriptAsset) === null || _d === void 0 ? void 0 : _d.value) === null || _e === void 0 ? void 0 : _e.uuid)
                || ((_h = (_g = (_f = componentData.value) === null || _f === void 0 ? void 0 : _f.__scriptAsset) === null || _g === void 0 ? void 0 : _g.value) === null || _h === void 0 ? void 0 : _h.uuid);
            if (scriptUuid && typeof scriptUuid === 'string') {
                componentType = this.uuidToCompressedId(scriptUuid);
                console.log(`脚本组件明文类名已转压缩UUID: ${componentType}`);
            }
            else {
                console.warn(`脚本组件 __type__ 为明文类名(${componentType})且无脚本uuid可推导，prefab 导入后该组件可能为 null`);
            }
        }
        // 基础组件结构
        const component = {
            "__type__": componentType,
            "_name": "",
            "_objFlags": 0,
            "__editorExtras__": {},
            "node": { "__id__": nodeIndex },
            "_enabled": enabled
        };
        // 提前设置 __prefab 属性占位符，后续会被正确设置
        component.__prefab = null;
        // 根据组件类型添加特定属性
        if (componentType === 'cc.UITransform') {
            const contentSize = ((_k = (_j = componentData.properties) === null || _j === void 0 ? void 0 : _j.contentSize) === null || _k === void 0 ? void 0 : _k.value) || { width: 100, height: 100 };
            const anchorPoint = ((_m = (_l = componentData.properties) === null || _l === void 0 ? void 0 : _l.anchorPoint) === null || _m === void 0 ? void 0 : _m.value) || { x: 0.5, y: 0.5 };
            component._contentSize = {
                "__type__": "cc.Size",
                "width": contentSize.width,
                "height": contentSize.height
            };
            component._anchorPoint = {
                "__type__": "cc.Vec2",
                "x": anchorPoint.x,
                "y": anchorPoint.y
            };
        }
        else if (componentType === 'cc.Sprite') {
            // 处理Sprite组件的spriteFrame引用
            const spriteFrameProp = ((_o = componentData.properties) === null || _o === void 0 ? void 0 : _o._spriteFrame) || ((_p = componentData.properties) === null || _p === void 0 ? void 0 : _p.spriteFrame);
            if (spriteFrameProp) {
                component._spriteFrame = this.processComponentProperty(spriteFrameProp, context);
            }
            else {
                component._spriteFrame = null;
            }
            component._type = (_s = (_r = (_q = componentData.properties) === null || _q === void 0 ? void 0 : _q._type) === null || _r === void 0 ? void 0 : _r.value) !== null && _s !== void 0 ? _s : 0;
            component._fillType = (_v = (_u = (_t = componentData.properties) === null || _t === void 0 ? void 0 : _t._fillType) === null || _u === void 0 ? void 0 : _u.value) !== null && _v !== void 0 ? _v : 0;
            component._sizeMode = (_y = (_x = (_w = componentData.properties) === null || _w === void 0 ? void 0 : _w._sizeMode) === null || _x === void 0 ? void 0 : _x.value) !== null && _y !== void 0 ? _y : 1;
            component._fillCenter = { "__type__": "cc.Vec2", "x": 0, "y": 0 };
            component._fillStart = (_1 = (_0 = (_z = componentData.properties) === null || _z === void 0 ? void 0 : _z._fillStart) === null || _0 === void 0 ? void 0 : _0.value) !== null && _1 !== void 0 ? _1 : 0;
            component._fillRange = (_4 = (_3 = (_2 = componentData.properties) === null || _2 === void 0 ? void 0 : _2._fillRange) === null || _3 === void 0 ? void 0 : _3.value) !== null && _4 !== void 0 ? _4 : 0;
            component._isTrimmedMode = (_7 = (_6 = (_5 = componentData.properties) === null || _5 === void 0 ? void 0 : _5._isTrimmedMode) === null || _6 === void 0 ? void 0 : _6.value) !== null && _7 !== void 0 ? _7 : true;
            component._useGrayscale = (_10 = (_9 = (_8 = componentData.properties) === null || _8 === void 0 ? void 0 : _8._useGrayscale) === null || _9 === void 0 ? void 0 : _9.value) !== null && _10 !== void 0 ? _10 : false;
            // 调试：打印Sprite组件的所有属性（已注释）
            // console.log('Sprite组件属性:', JSON.stringify(componentData.properties, null, 2));
            component._atlas = null;
            component._id = "";
        }
        else if (componentType === 'cc.Button') {
            component._interactable = true;
            component._transition = 3;
            component._normalColor = { "__type__": "cc.Color", "r": 255, "g": 255, "b": 255, "a": 255 };
            component._hoverColor = { "__type__": "cc.Color", "r": 211, "g": 211, "b": 211, "a": 255 };
            component._pressedColor = { "__type__": "cc.Color", "r": 255, "g": 255, "b": 255, "a": 255 };
            component._disabledColor = { "__type__": "cc.Color", "r": 124, "g": 124, "b": 124, "a": 255 };
            component._normalSprite = null;
            component._hoverSprite = null;
            component._pressedSprite = null;
            component._disabledSprite = null;
            component._duration = 0.1;
            component._zoomScale = 1.2;
            // 处理Button的target引用
            const targetProp = ((_11 = componentData.properties) === null || _11 === void 0 ? void 0 : _11._target) || ((_12 = componentData.properties) === null || _12 === void 0 ? void 0 : _12.target);
            if (targetProp) {
                component._target = this.processComponentProperty(targetProp, context);
            }
            else {
                component._target = { "__id__": nodeIndex }; // 默认指向自身节点
            }
            component._clickEvents = [];
            component._id = "";
        }
        else if (componentType === 'cc.Label') {
            component._string = ((_14 = (_13 = componentData.properties) === null || _13 === void 0 ? void 0 : _13._string) === null || _14 === void 0 ? void 0 : _14.value) || "Label";
            component._horizontalAlign = 1;
            component._verticalAlign = 1;
            component._actualFontSize = 20;
            component._fontSize = 20;
            component._fontFamily = "Arial";
            component._lineHeight = 25;
            component._overflow = 0;
            component._enableWrapText = true;
            component._font = null;
            component._isSystemFontUsed = true;
            component._spacingX = 0;
            component._isItalic = false;
            component._isBold = false;
            component._isUnderline = false;
            component._underlineHeight = 2;
            component._cacheMode = 0;
            component._id = "";
        }
        else if (componentData.properties) {
            // 处理所有组件的属性（包括内置组件和自定义脚本组件）
            for (const [key, value] of Object.entries(componentData.properties)) {
                if (key === 'node' || key === 'enabled' || key === '__type__' ||
                    key === 'uuid' || key === 'name' || key === '__scriptAsset' || key === '_objFlags') {
                    continue; // 跳过这些特殊属性，包括_objFlags
                }
                // 对于以下划线开头的属性，需要特殊处理
                if (key.startsWith('_')) {
                    // 确保属性名保持原样（包括下划线）
                    const propValue = this.processComponentProperty(value, context);
                    if (propValue !== undefined) {
                        component[key] = propValue;
                    }
                }
                else {
                    // 非下划线开头的属性正常处理
                    const propValue = this.processComponentProperty(value, context);
                    if (propValue !== undefined) {
                        component[key] = propValue;
                    }
                }
            }
        }
        // 确保 _id 在最后位置
        const _id = component._id || "";
        delete component._id;
        component._id = _id;
        return component;
    }
    /**
     * 处理组件属性值，确保格式与手动创建的预制体一致
     */
    processComponentProperty(propData, context) {
        var _a, _b;
        if (!propData || typeof propData !== 'object') {
            return propData;
        }
        const value = propData.value;
        const type = propData.type;
        // 处理null值
        if (value === null || value === undefined) {
            return null;
        }
        // 处理空UUID对象，转换为null
        if (value && typeof value === 'object' && value.uuid === '') {
            return null;
        }
        // 处理节点引用
        if (type === 'cc.Node' && (value === null || value === void 0 ? void 0 : value.uuid)) {
            // 在预制体中，节点引用需要转换为 __id__ 形式
            if ((context === null || context === void 0 ? void 0 : context.nodeUuidToIndex) && context.nodeUuidToIndex.has(value.uuid)) {
                // 内部引用：转换为__id__格式
                return {
                    "__id__": context.nodeUuidToIndex.get(value.uuid)
                };
            }
            // 外部引用：设置为null，因为外部节点不属于预制体结构
            console.warn(`Node reference UUID ${value.uuid} not found in prefab context, setting to null (external reference)`);
            return null;
        }
        // 处理资源引用（预制体、纹理、精灵帧等）
        if ((value === null || value === void 0 ? void 0 : value.uuid) && (type === 'cc.Prefab' ||
            type === 'cc.Texture2D' ||
            type === 'cc.SpriteFrame' ||
            type === 'cc.Material' ||
            type === 'cc.AnimationClip' ||
            type === 'cc.AudioClip' ||
            type === 'cc.Font' ||
            type === 'cc.Asset')) {
            // 对于预制体引用，保持原始UUID格式
            const uuidToUse = type === 'cc.Prefab' ? value.uuid : this.uuidToCompressedId(value.uuid);
            return {
                "__uuid__": uuidToUse,
                "__expectedType__": type
            };
        }
        // 处理组件引用（包括具体的组件类型如cc.Label, cc.Button等）
        if ((value === null || value === void 0 ? void 0 : value.uuid) && (type === 'cc.Component' ||
            type === 'cc.Label' || type === 'cc.Button' || type === 'cc.Sprite' ||
            type === 'cc.UITransform' || type === 'cc.RigidBody2D' ||
            type === 'cc.BoxCollider2D' || type === 'cc.Animation' ||
            type === 'cc.AudioSource' || ((type === null || type === void 0 ? void 0 : type.startsWith('cc.')) && !type.includes('@')))) {
            // 在预制体中，组件引用也需要转换为 __id__ 形式
            if ((context === null || context === void 0 ? void 0 : context.componentUuidToIndex) && context.componentUuidToIndex.has(value.uuid)) {
                // 内部引用：转换为__id__格式
                console.log(`Component reference ${type} UUID ${value.uuid} found in prefab context, converting to __id__`);
                return {
                    "__id__": context.componentUuidToIndex.get(value.uuid)
                };
            }
            // 外部引用：设置为null，因为外部组件不属于预制体结构
            console.warn(`Component reference ${type} UUID ${value.uuid} not found in prefab context, setting to null (external reference)`);
            return null;
        }
        // 处理复杂类型，添加__type__标记
        if (value && typeof value === 'object') {
            if (type === 'cc.Color') {
                return {
                    "__type__": "cc.Color",
                    "r": Math.min(255, Math.max(0, Number(value.r) || 0)),
                    "g": Math.min(255, Math.max(0, Number(value.g) || 0)),
                    "b": Math.min(255, Math.max(0, Number(value.b) || 0)),
                    "a": value.a !== undefined ? Math.min(255, Math.max(0, Number(value.a))) : 255
                };
            }
            else if (type === 'cc.Vec3') {
                return {
                    "__type__": "cc.Vec3",
                    "x": Number(value.x) || 0,
                    "y": Number(value.y) || 0,
                    "z": Number(value.z) || 0
                };
            }
            else if (type === 'cc.Vec2') {
                return {
                    "__type__": "cc.Vec2",
                    "x": Number(value.x) || 0,
                    "y": Number(value.y) || 0
                };
            }
            else if (type === 'cc.Size') {
                return {
                    "__type__": "cc.Size",
                    "width": Number(value.width) || 0,
                    "height": Number(value.height) || 0
                };
            }
            else if (type === 'cc.Quat') {
                return {
                    "__type__": "cc.Quat",
                    "x": Number(value.x) || 0,
                    "y": Number(value.y) || 0,
                    "z": Number(value.z) || 0,
                    "w": value.w !== undefined ? Number(value.w) : 1
                };
            }
        }
        // 处理数组类型
        if (Array.isArray(value)) {
            // 节点数组
            if (((_a = propData.elementTypeData) === null || _a === void 0 ? void 0 : _a.type) === 'cc.Node') {
                return value.map(item => {
                    var _a;
                    if ((item === null || item === void 0 ? void 0 : item.uuid) && ((_a = context === null || context === void 0 ? void 0 : context.nodeUuidToIndex) === null || _a === void 0 ? void 0 : _a.has(item.uuid))) {
                        return { "__id__": context.nodeUuidToIndex.get(item.uuid) };
                    }
                    return null;
                }).filter(item => item !== null);
            }
            // 资源数组
            if (((_b = propData.elementTypeData) === null || _b === void 0 ? void 0 : _b.type) && propData.elementTypeData.type.startsWith('cc.')) {
                return value.map(item => {
                    if (item === null || item === void 0 ? void 0 : item.uuid) {
                        return {
                            "__uuid__": this.uuidToCompressedId(item.uuid),
                            "__expectedType__": propData.elementTypeData.type
                        };
                    }
                    return null;
                }).filter(item => item !== null);
            }
            // 基础类型数组
            return value.map(item => (item === null || item === void 0 ? void 0 : item.value) !== undefined ? item.value : item);
        }
        // 其他复杂对象类型，保持原样但确保有__type__标记
        if (value && typeof value === 'object' && type && type.startsWith('cc.')) {
            return Object.assign({ "__type__": type }, value);
        }
        return value;
    }
    /**
     * 创建符合引擎标准的节点对象
     */
    createEngineStandardNode(nodeData, parentNodeIndex, nodeName) {
        // 调试：打印原始节点数据（已注释）
        // console.log('原始节点数据:', JSON.stringify(nodeData, null, 2));
        var _a, _b, _c, _d, _e, _f, _g, _h;
        // 提取节点的基本属性
        const getValue = (prop) => {
            if ((prop === null || prop === void 0 ? void 0 : prop.value) !== undefined)
                return prop.value;
            if (prop !== undefined)
                return prop;
            return null;
        };
        const position = getValue(nodeData.position) || getValue((_a = nodeData.value) === null || _a === void 0 ? void 0 : _a.position) || { x: 0, y: 0, z: 0 };
        const rotation = getValue(nodeData.rotation) || getValue((_b = nodeData.value) === null || _b === void 0 ? void 0 : _b.rotation) || { x: 0, y: 0, z: 0, w: 1 };
        const scale = getValue(nodeData.scale) || getValue((_c = nodeData.value) === null || _c === void 0 ? void 0 : _c.scale) || { x: 1, y: 1, z: 1 };
        const active = (_f = (_d = getValue(nodeData.active)) !== null && _d !== void 0 ? _d : getValue((_e = nodeData.value) === null || _e === void 0 ? void 0 : _e.active)) !== null && _f !== void 0 ? _f : true;
        const name = nodeName || getValue(nodeData.name) || getValue((_g = nodeData.value) === null || _g === void 0 ? void 0 : _g.name) || 'Node';
        const layer = getValue(nodeData.layer) || getValue((_h = nodeData.value) === null || _h === void 0 ? void 0 : _h.layer) || 1073741824;
        // 调试输出
        console.log(`创建节点: ${name}, parentNodeIndex: ${parentNodeIndex}`);
        const parentRef = parentNodeIndex !== null ? { "__id__": parentNodeIndex } : null;
        console.log(`节点 ${name} 的父节点引用:`, parentRef);
        return {
            "__type__": "cc.Node",
            "_name": name,
            "_objFlags": 0,
            "__editorExtras__": {},
            "_parent": parentRef,
            "_children": [], // 子节点引用将在递归过程中动态添加
            "_active": active,
            "_components": [], // 组件引用将在处理组件时动态添加
            "_prefab": { "__id__": 0 }, // 临时值，后续会被正确设置
            "_lpos": {
                "__type__": "cc.Vec3",
                "x": position.x,
                "y": position.y,
                "z": position.z
            },
            "_lrot": {
                "__type__": "cc.Quat",
                "x": rotation.x,
                "y": rotation.y,
                "z": rotation.z,
                "w": rotation.w
            },
            "_lscale": {
                "__type__": "cc.Vec3",
                "x": scale.x,
                "y": scale.y,
                "z": scale.z
            },
            "_mobility": 0,
            "_layer": layer,
            "_euler": {
                "__type__": "cc.Vec3",
                "x": 0,
                "y": 0,
                "z": 0
            },
            "_id": ""
        };
    }
    /**
     * 从节点数据中提取UUID
     */
    extractNodeUuid(nodeData) {
        var _a, _b, _c;
        if (!nodeData)
            return null;
        // 尝试多种方式获取UUID
        const sources = [
            nodeData.uuid,
            (_a = nodeData.value) === null || _a === void 0 ? void 0 : _a.uuid,
            nodeData.__uuid__,
            (_b = nodeData.value) === null || _b === void 0 ? void 0 : _b.__uuid__,
            nodeData.id,
            (_c = nodeData.value) === null || _c === void 0 ? void 0 : _c.id
        ];
        for (const source of sources) {
            if (typeof source === 'string' && source.length > 0) {
                return source;
            }
        }
        return null;
    }
    /**
     * 创建最小化的节点对象，不包含任何组件以避免依赖问题
     */
    createMinimalNode(nodeData, nodeName) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        // 提取节点的基本属性
        const getValue = (prop) => {
            if ((prop === null || prop === void 0 ? void 0 : prop.value) !== undefined)
                return prop.value;
            if (prop !== undefined)
                return prop;
            return null;
        };
        const position = getValue(nodeData.position) || getValue((_a = nodeData.value) === null || _a === void 0 ? void 0 : _a.position) || { x: 0, y: 0, z: 0 };
        const rotation = getValue(nodeData.rotation) || getValue((_b = nodeData.value) === null || _b === void 0 ? void 0 : _b.rotation) || { x: 0, y: 0, z: 0, w: 1 };
        const scale = getValue(nodeData.scale) || getValue((_c = nodeData.value) === null || _c === void 0 ? void 0 : _c.scale) || { x: 1, y: 1, z: 1 };
        const active = (_f = (_d = getValue(nodeData.active)) !== null && _d !== void 0 ? _d : getValue((_e = nodeData.value) === null || _e === void 0 ? void 0 : _e.active)) !== null && _f !== void 0 ? _f : true;
        const name = nodeName || getValue(nodeData.name) || getValue((_g = nodeData.value) === null || _g === void 0 ? void 0 : _g.name) || 'Node';
        const layer = getValue(nodeData.layer) || getValue((_h = nodeData.value) === null || _h === void 0 ? void 0 : _h.layer) || 33554432;
        return {
            "__type__": "cc.Node",
            "_name": name,
            "_objFlags": 0,
            "_parent": null,
            "_children": [],
            "_active": active,
            "_components": [], // 空的组件数组，避免组件依赖问题
            "_prefab": {
                "__id__": 2
            },
            "_lpos": {
                "__type__": "cc.Vec3",
                "x": position.x,
                "y": position.y,
                "z": position.z
            },
            "_lrot": {
                "__type__": "cc.Quat",
                "x": rotation.x,
                "y": rotation.y,
                "z": rotation.z,
                "w": rotation.w
            },
            "_lscale": {
                "__type__": "cc.Vec3",
                "x": scale.x,
                "y": scale.y,
                "z": scale.z
            },
            "_layer": layer,
            "_euler": {
                "__type__": "cc.Vec3",
                "x": 0,
                "y": 0,
                "z": 0
            },
            "_id": ""
        };
    }
    /**
     * 创建标准的 meta 文件内容
     */
    createStandardMetaContent(prefabName, prefabUuid) {
        return {
            "ver": "2.0.3",
            "importer": "prefab",
            "imported": true,
            "uuid": prefabUuid,
            "files": [
                ".json"
            ],
            "subMetas": {},
            "userData": {
                "syncNodeName": prefabName,
                "hasIcon": false
            }
        };
    }
    /**
     * 尝试将原始节点转换为预制体实例
     */
    /**
     * 尝试将原始节点转换为预制体实例
     */
    async convertNodeToPrefabInstance(nodeUuid, prefabUuid, prefabPath) {
        // 这个功能需要深入的场景编辑器集成，暂时返回失败
        // 在实际的引擎中，这涉及到复杂的预制体实例化和节点替换逻辑
        console.log('节点转换为预制体实例的功能需要更深入的引擎集成');
        return {
            success: false,
            error: '节点转换为预制体实例需要更深入的引擎集成支持'
        };
    }
    async restorePrefabNode(nodeUuid, assetUuid) {
        try {
            // 使用官方API restore-prefab 还原预制体节点
            await Editor.Message.request('scene', 'restore-prefab', nodeUuid, assetUuid);
            return {
                success: true,
                data: {
                    nodeUuid: nodeUuid,
                    assetUuid: assetUuid,
                    message: '预制体节点还原成功'
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `预制体节点还原失败: ${error.message}`
            };
        }
    }
    // 基于官方预制体格式的新实现方法
    // 基于官方预制体格式的新实现方法
    async getNodeDataForPrefab(nodeUuid) {
        try {
            const nodeData = await Editor.Message.request('scene', 'query-node', nodeUuid);
            if (!nodeData) {
                return { success: false, error: '节点不存在' };
            }
            return { success: true, data: nodeData };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async createStandardPrefabData(nodeData, prefabName, prefabUuid) {
        // 基于官方Canvas.prefab格式创建预制体数据结构
        const prefabData = [];
        let currentId = 0;
        // 第一个元素：cc.Prefab 资源对象
        const prefabAsset = {
            "__type__": "cc.Prefab",
            "_name": prefabName,
            "_objFlags": 0,
            "__editorExtras__": {},
            "_native": "",
            "data": {
                "__id__": 1
            },
            "optimizationPolicy": 0,
            "persistent": false
        };
        prefabData.push(prefabAsset);
        currentId++;
        // 第二个元素：根节点
        const rootNode = await this.createNodeObject(nodeData, null, prefabData, currentId);
        prefabData.push(rootNode.node);
        currentId = rootNode.nextId;
        // 添加根节点的 PrefabInfo - 修复asset引用使用UUID
        const rootPrefabInfo = {
            "__type__": "cc.PrefabInfo",
            "root": {
                "__id__": 1
            },
            "asset": {
                "__uuid__": prefabUuid
            },
            "fileId": this.generateFileId(),
            "instance": null,
            "targetOverrides": [],
            "nestedPrefabInstanceRoots": []
        };
        prefabData.push(rootPrefabInfo);
        return prefabData;
    }
    async createNodeObject(nodeData, parentId, prefabData, currentId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const nodeId = currentId++;
        // 提取节点的基本属性 - 适配query-node-tree的数据格式
        const getValue = (prop) => {
            if ((prop === null || prop === void 0 ? void 0 : prop.value) !== undefined)
                return prop.value;
            if (prop !== undefined)
                return prop;
            return null;
        };
        const position = getValue(nodeData.position) || getValue((_a = nodeData.value) === null || _a === void 0 ? void 0 : _a.position) || { x: 0, y: 0, z: 0 };
        const rotation = getValue(nodeData.rotation) || getValue((_b = nodeData.value) === null || _b === void 0 ? void 0 : _b.rotation) || { x: 0, y: 0, z: 0, w: 1 };
        const scale = getValue(nodeData.scale) || getValue((_c = nodeData.value) === null || _c === void 0 ? void 0 : _c.scale) || { x: 1, y: 1, z: 1 };
        const active = (_f = (_d = getValue(nodeData.active)) !== null && _d !== void 0 ? _d : getValue((_e = nodeData.value) === null || _e === void 0 ? void 0 : _e.active)) !== null && _f !== void 0 ? _f : true;
        const name = getValue(nodeData.name) || getValue((_g = nodeData.value) === null || _g === void 0 ? void 0 : _g.name) || 'Node';
        const layer = getValue(nodeData.layer) || getValue((_h = nodeData.value) === null || _h === void 0 ? void 0 : _h.layer) || 33554432;
        const node = {
            "__type__": "cc.Node",
            "_name": name,
            "_objFlags": 0,
            "__editorExtras__": {},
            "_parent": parentId !== null ? { "__id__": parentId } : null,
            "_children": [],
            "_active": active,
            "_components": [],
            "_prefab": parentId === null ? {
                "__id__": currentId++
            } : null,
            "_lpos": {
                "__type__": "cc.Vec3",
                "x": position.x,
                "y": position.y,
                "z": position.z
            },
            "_lrot": {
                "__type__": "cc.Quat",
                "x": rotation.x,
                "y": rotation.y,
                "z": rotation.z,
                "w": rotation.w
            },
            "_lscale": {
                "__type__": "cc.Vec3",
                "x": scale.x,
                "y": scale.y,
                "z": scale.z
            },
            "_mobility": 0,
            "_layer": layer,
            "_euler": {
                "__type__": "cc.Vec3",
                "x": 0,
                "y": 0,
                "z": 0
            },
            "_id": ""
        };
        // 暂时跳过UITransform组件以避免_getDependComponent错误
        // 后续通过Engine API动态添加
        console.log(`节点 ${name} 暂时跳过UITransform组件，避免引擎依赖错误`);
        // 处理其他组件（暂时跳过，专注于修复UITransform问题）
        const components = this.extractComponentsFromNode(nodeData);
        if (components.length > 0) {
            console.log(`节点 ${name} 包含 ${components.length} 个其他组件，暂时跳过以专注于UITransform修复`);
        }
        // 处理子节点 - 使用query-node-tree获取的完整结构
        const childrenToProcess = this.getChildrenToProcess(nodeData);
        if (childrenToProcess.length > 0) {
            console.log(`=== 处理子节点 ===`);
            console.log(`节点 ${name} 包含 ${childrenToProcess.length} 个子节点`);
            for (let i = 0; i < childrenToProcess.length; i++) {
                const childData = childrenToProcess[i];
                const childName = childData.name || ((_j = childData.value) === null || _j === void 0 ? void 0 : _j.name) || '未知';
                console.log(`处理第${i + 1}个子节点: ${childName}`);
                try {
                    const childId = currentId;
                    node._children.push({ "__id__": childId });
                    // 递归创建子节点
                    const childResult = await this.createNodeObject(childData, nodeId, prefabData, currentId);
                    prefabData.push(childResult.node);
                    currentId = childResult.nextId;
                    // 子节点不需要PrefabInfo，只有根节点需要
                    // 子节点的_prefab应该设置为null
                    childResult.node._prefab = null;
                    console.log(`✅ 成功添加子节点: ${childName}`);
                }
                catch (error) {
                    console.error(`处理子节点 ${childName} 时出错:`, error);
                }
            }
        }
        return { node, nextId: currentId };
    }
    // 从节点数据中提取组件信息
    extractComponentsFromNode(nodeData) {
        var _a, _b;
        const components = [];
        // 从不同位置尝试获取组件数据
        const componentSources = [
            nodeData.__comps__,
            nodeData.components,
            (_a = nodeData.value) === null || _a === void 0 ? void 0 : _a.__comps__,
            (_b = nodeData.value) === null || _b === void 0 ? void 0 : _b.components
        ];
        for (const source of componentSources) {
            if (Array.isArray(source)) {
                components.push(...source.filter(comp => comp && (comp.__type__ || comp.type)));
                break; // 找到有效的组件数组就退出
            }
        }
        return components;
    }
    // 创建标准的组件对象
    createStandardComponentObject(componentData, nodeId, prefabInfoId) {
        const componentType = componentData.__type__ || componentData.type;
        if (!componentType) {
            console.warn('组件缺少类型信息:', componentData);
            return null;
        }
        // 基础组件结构 - 基于官方预制体格式
        const component = {
            "__type__": componentType,
            "_name": "",
            "_objFlags": 0,
            "node": {
                "__id__": nodeId
            },
            "_enabled": this.getComponentPropertyValue(componentData, 'enabled', true),
            "__prefab": {
                "__id__": prefabInfoId
            }
        };
        // 根据组件类型添加特定属性
        this.addComponentSpecificProperties(component, componentData, componentType);
        // 添加_id属性
        component._id = "";
        return component;
    }
    // 添加组件特定的属性
    addComponentSpecificProperties(component, componentData, componentType) {
        switch (componentType) {
            case 'cc.UITransform':
                this.addUITransformProperties(component, componentData);
                break;
            case 'cc.Sprite':
                this.addSpriteProperties(component, componentData);
                break;
            case 'cc.Label':
                this.addLabelProperties(component, componentData);
                break;
            case 'cc.Button':
                this.addButtonProperties(component, componentData);
                break;
            default:
                // 对于未知类型的组件，复制所有安全的属性
                this.addGenericProperties(component, componentData);
                break;
        }
    }
    // UITransform组件属性
    addUITransformProperties(component, componentData) {
        component._contentSize = this.createSizeObject(this.getComponentPropertyValue(componentData, 'contentSize', { width: 100, height: 100 }));
        component._anchorPoint = this.createVec2Object(this.getComponentPropertyValue(componentData, 'anchorPoint', { x: 0.5, y: 0.5 }));
    }
    // Sprite组件属性
    addSpriteProperties(component, componentData) {
        component._visFlags = 0;
        component._customMaterial = null;
        component._srcBlendFactor = 2;
        component._dstBlendFactor = 4;
        component._color = this.createColorObject(this.getComponentPropertyValue(componentData, 'color', { r: 255, g: 255, b: 255, a: 255 }));
        component._spriteFrame = this.getComponentPropertyValue(componentData, 'spriteFrame', null);
        component._type = this.getComponentPropertyValue(componentData, 'type', 0);
        component._fillType = 0;
        component._sizeMode = this.getComponentPropertyValue(componentData, 'sizeMode', 1);
        component._fillCenter = this.createVec2Object({ x: 0, y: 0 });
        component._fillStart = 0;
        component._fillRange = 0;
        component._isTrimmedMode = true;
        component._useGrayscale = false;
        component._atlas = null;
    }
    // Label组件属性
    addLabelProperties(component, componentData) {
        component._visFlags = 0;
        component._customMaterial = null;
        component._srcBlendFactor = 2;
        component._dstBlendFactor = 4;
        component._color = this.createColorObject(this.getComponentPropertyValue(componentData, 'color', { r: 0, g: 0, b: 0, a: 255 }));
        component._string = this.getComponentPropertyValue(componentData, 'string', 'Label');
        component._horizontalAlign = 1;
        component._verticalAlign = 1;
        component._actualFontSize = 20;
        component._fontSize = this.getComponentPropertyValue(componentData, 'fontSize', 20);
        component._fontFamily = 'Arial';
        component._lineHeight = 40;
        component._overflow = 1;
        component._enableWrapText = false;
        component._font = null;
        component._isSystemFontUsed = true;
        component._isItalic = false;
        component._isBold = false;
        component._isUnderline = false;
        component._underlineHeight = 2;
        component._cacheMode = 0;
    }
    // Button组件属性
    addButtonProperties(component, componentData) {
        component.clickEvents = [];
        component._interactable = true;
        component._transition = 2;
        component._normalColor = this.createColorObject({ r: 214, g: 214, b: 214, a: 255 });
        component._hoverColor = this.createColorObject({ r: 211, g: 211, b: 211, a: 255 });
        component._pressedColor = this.createColorObject({ r: 255, g: 255, b: 255, a: 255 });
        component._disabledColor = this.createColorObject({ r: 124, g: 124, b: 124, a: 255 });
        component._duration = 0.1;
        component._zoomScale = 1.2;
    }
    // 添加通用属性
    addGenericProperties(component, componentData) {
        // 只复制安全的、已知的属性
        const safeProperties = ['enabled', 'color', 'string', 'fontSize', 'spriteFrame', 'type', 'sizeMode'];
        for (const prop of safeProperties) {
            if (componentData.hasOwnProperty(prop)) {
                const value = this.getComponentPropertyValue(componentData, prop);
                if (value !== undefined) {
                    component[`_${prop}`] = value;
                }
            }
        }
    }
    // 创建Vec2对象
    createVec2Object(data) {
        return {
            "__type__": "cc.Vec2",
            "x": (data === null || data === void 0 ? void 0 : data.x) || 0,
            "y": (data === null || data === void 0 ? void 0 : data.y) || 0
        };
    }
    // 创建Vec3对象
    createVec3Object(data) {
        return {
            "__type__": "cc.Vec3",
            "x": (data === null || data === void 0 ? void 0 : data.x) || 0,
            "y": (data === null || data === void 0 ? void 0 : data.y) || 0,
            "z": (data === null || data === void 0 ? void 0 : data.z) || 0
        };
    }
    // 创建Size对象
    createSizeObject(data) {
        return {
            "__type__": "cc.Size",
            "width": (data === null || data === void 0 ? void 0 : data.width) || 100,
            "height": (data === null || data === void 0 ? void 0 : data.height) || 100
        };
    }
    // 创建Color对象
    createColorObject(data) {
        var _a, _b, _c, _d;
        return {
            "__type__": "cc.Color",
            "r": (_a = data === null || data === void 0 ? void 0 : data.r) !== null && _a !== void 0 ? _a : 255,
            "g": (_b = data === null || data === void 0 ? void 0 : data.g) !== null && _b !== void 0 ? _b : 255,
            "b": (_c = data === null || data === void 0 ? void 0 : data.b) !== null && _c !== void 0 ? _c : 255,
            "a": (_d = data === null || data === void 0 ? void 0 : data.a) !== null && _d !== void 0 ? _d : 255
        };
    }
    // 判断是否应该复制组件属性
    shouldCopyComponentProperty(key, value) {
        // 跳过内部属性和已处理的属性
        if (key.startsWith('__') || key === '_enabled' || key === 'node' || key === 'enabled') {
            return false;
        }
        // 跳过函数和undefined值
        if (typeof value === 'function' || value === undefined) {
            return false;
        }
        return true;
    }
    // 获取组件属性值 - 重命名以避免冲突
    getComponentPropertyValue(componentData, propertyName, defaultValue) {
        // 尝试直接获取属性
        if (componentData[propertyName] !== undefined) {
            return this.extractValue(componentData[propertyName]);
        }
        // 尝试从value属性中获取
        if (componentData.value && componentData.value[propertyName] !== undefined) {
            return this.extractValue(componentData.value[propertyName]);
        }
        // 尝试带下划线前缀的属性名
        const prefixedName = `_${propertyName}`;
        if (componentData[prefixedName] !== undefined) {
            return this.extractValue(componentData[prefixedName]);
        }
        return defaultValue;
    }
    // 提取属性值
    extractValue(data) {
        if (data === null || data === undefined) {
            return data;
        }
        // 如果有value属性，优先使用value
        if (typeof data === 'object' && data.hasOwnProperty('value')) {
            return data.value;
        }
        // 如果是引用对象，保持原样
        if (typeof data === 'object' && (data.__id__ !== undefined || data.__uuid__ !== undefined)) {
            return data;
        }
        return data;
    }
    createStandardMetaData(prefabName, prefabUuid) {
        return {
            "ver": "1.1.50",
            "importer": "prefab",
            "imported": true,
            "uuid": prefabUuid,
            "files": [
                ".json"
            ],
            "subMetas": {},
            "userData": {
                "syncNodeName": prefabName
            }
        };
    }
    async savePrefabWithMeta(prefabPath, prefabData, metaData) {
        try {
            const prefabContent = JSON.stringify(prefabData, null, 2);
            const metaContent = JSON.stringify(metaData, null, 2);
            // 确保路径以.prefab结尾
            const finalPrefabPath = prefabPath.endsWith('.prefab') ? prefabPath : `${prefabPath}.prefab`;
            const metaPath = `${finalPrefabPath}.meta`;
            // 使用asset-db API创建预制体文件
            await Editor.Message.request('asset-db', 'create-asset', finalPrefabPath, prefabContent);
            // 创建meta文件
            await Editor.Message.request('asset-db', 'create-asset', metaPath, metaContent);
            console.log(`=== 预制体保存完成 ===`);
            console.log(`预制体文件已保存: ${finalPrefabPath}`);
            console.log(`Meta文件已保存: ${metaPath}`);
            console.log(`预制体数组总长度: ${prefabData.length}`);
            console.log(`预制体根节点索引: ${prefabData.length - 1}`);
            return { success: true };
        }
        catch (error) {
            console.error('保存预制体文件时出错:', error);
            return { success: false, error: error.message };
        }
    }
    // 解除预制体链接，将预制体实例转换为普通节点
    // 解除预制体链接，将预制体实例转换为普通节点
    async unlinkPrefab(nodeUuid) {
        try {
            console.log(`开始解除预制体链接: ${nodeUuid}`);
            // 使用 Editor.Message.request 调用场景 API 的 unlink-prefab 方法
            console.log('尝试解除预制体链接，参数: [nodeUuid, true]');
            try {
                const result = await Editor.Message.request('scene', 'unlink-prefab', [
                    nodeUuid,
                    true
                ]);
                console.log('解除预制体链接API调用完成，返回值:', result);
                // 等待一小段时间让编辑器处理变化
                await new Promise(resolve => setTimeout(resolve, 100));
                // 手动清除预制体属性
                try {
                    console.log('手动清除预制体属性...');
                    await Editor.Message.request('scene', 'set-property', {
                        uuid: nodeUuid,
                        path: '__prefab__',
                        dump: { value: null }
                    });
                    console.log('预制体属性已清除');
                }
                catch (clearError) {
                    console.log('清除预制体属性失败:', clearError);
                }
                // 再次等待处理
                await new Promise(resolve => setTimeout(resolve, 100));
                // 验证节点是否真的解除了预制体链接
                try {
                    const nodeInfo = await Editor.Message.request('scene', 'query-node', nodeUuid);
                    console.log('最终验证 - 节点预制体状态:', nodeInfo && nodeInfo.__prefab__ ? '仍是预制体' : '已解除链接');
                    // 检查节点是否还有预制体属性
                    const isPrefabInstance = nodeInfo && nodeInfo.__prefab__ && nodeInfo.__prefab__.uuid;
                    return {
                        success: true,
                        data: {
                            nodeUuid: nodeUuid,
                            message: isPrefabInstance ?
                                '预制体链接解除可能未完全成功，请检查编辑器界面' :
                                '预制体实例已成功转换为普通节点',
                            result: result,
                            isPrefabInstance: isPrefabInstance,
                            nodeInfo: nodeInfo,
                            note: '已验证节点状态'
                        }
                    };
                }
                catch (verifyError) {
                    console.log('验证节点状态时出错:', verifyError);
                    return {
                        success: true,
                        data: {
                            nodeUuid: nodeUuid,
                            message: '预制体链接解除API调用成功，但无法验证最终状态',
                            result: result,
                            verifyError: String(verifyError)
                        }
                    };
                }
            }
            catch (error) {
                console.error('解除预制体链接失败:', error);
                // 尝试备用方法：通过设置节点的prefab属性为null
                const altResult = await this.tryAlternativeUnlink(nodeUuid);
                if (altResult.success) {
                    return altResult;
                }
                else {
                    return {
                        success: false,
                        error: `解除预制体链接失败: ${error.message || error}`,
                        instruction: '请确认节点是预制体实例且在当前场景中存在'
                    };
                }
            }
        }
        catch (error) {
            console.error('解除预制体链接异常:', error);
            return {
                success: false,
                error: `解除预制体链接异常: ${error}`
            };
        }
    }
    // 备用解除预制体链接方法：通过修改节点属性
    // 备用解除预制体链接方法：通过修改节点属性
    async tryAlternativeUnlink(nodeUuid) {
        try {
            // 尝试通过设置节点属性来解除预制体链接
            await Editor.Message.request('scene', 'set-property', {
                uuid: nodeUuid,
                path: '_prefab',
                dump: { value: null }
            });
            // 同时移除预制体实例标记
            await Editor.Message.request('scene', 'set-property', {
                uuid: nodeUuid,
                path: '_prefab.instance',
                dump: { value: null }
            });
            console.log('备用方法解除预制体链接成功');
            return {
                success: true,
                data: {
                    nodeUuid: nodeUuid,
                    message: '预制体实例已通过备用方法转换为普通节点',
                    method: 'alternative'
                }
            };
        }
        catch (error) {
            console.error('备用方法失败:', error);
            return {
                success: false,
                error: `备用方法失败: ${error.message || error}`
            };
        }
    }
    // 应用预制体实例的修改回预制体资源
    // 应用预制体实例的修改回预制体资源
    async applyPrefab(nodeUuid) {
        try {
            console.log(`开始应用预制体实例修改: ${nodeUuid}`);
            // 1. 首先验证节点是预制体实例
            const nodeInfo = await Editor.Message.request('scene', 'query-node', nodeUuid);
            if (!nodeInfo || !nodeInfo.__prefab__) {
                return {
                    success: false,
                    error: '指定的节点不是预制体实例'
                };
            }
            const prefabInfo = nodeInfo.__prefab__;
            const prefabAssetUuid = prefabInfo.asset;
            console.log(`预制体实例信息:`, prefabInfo);
            console.log(`关联的预制体资源 UUID: ${prefabAssetUuid}`);
            // 2. 调用 scene.apply-prefab API 应用修改
            console.log('调用 scene.apply-prefab API...');
            const applyResult = await Editor.Message.request('scene', 'apply-prefab', [nodeUuid]);
            console.log('apply-prefab API 调用结果:', applyResult);
            // 3. 等待编辑器处理
            await new Promise(resolve => setTimeout(resolve, 200));
            // 4. 获取预制体资源路径进行更新
            try {
                const assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', prefabAssetUuid);
                console.log('预制体资源信息:', assetInfo);
                if (assetInfo && assetInfo.source) {
                    const prefabPath = assetInfo.source;
                    console.log(`预制体资源路径: ${prefabPath}`);
                    // 5. 刷新特定的预制体资源
                    await this.refreshAssets(prefabPath);
                    return {
                        success: true,
                        data: {
                            nodeUuid: nodeUuid,
                            prefabAssetUuid: prefabAssetUuid,
                            prefabPath: prefabPath,
                            message: '预制体实例的修改已成功应用到预制体资源',
                            applyResult: applyResult
                        }
                    };
                }
                else {
                    return {
                        success: true,
                        data: {
                            nodeUuid: nodeUuid,
                            prefabAssetUuid: prefabAssetUuid,
                            message: '预制体修改已应用，但无法获取资源路径信息',
                            applyResult: applyResult
                        }
                    };
                }
            }
            catch (assetError) {
                console.log('获取预制体资源信息失败:', assetError);
                return {
                    success: true,
                    data: {
                        nodeUuid: nodeUuid,
                        prefabAssetUuid: prefabAssetUuid,
                        message: '预制体修改已应用，但获取资源信息时出错',
                        applyResult: applyResult,
                        assetError: String(assetError)
                    }
                };
            }
        }
        catch (error) {
            console.error('应用预制体修改异常:', error);
            return {
                success: false,
                error: `应用预制体修改异常: ${error.message || error}`
            };
        }
    }
    // 进入预制体编辑模式 - 基于编辑器日志实现
    // 进入预制体编辑模式 - 基于编辑器日志实现
    async enterPrefabEditMode(prefabPath) {
        try {
            console.log(`开始进入预制体编辑模式: ${prefabPath}`);
            // 1. 查询预制体资源信息
            const assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', prefabPath);
            if (!assetInfo) {
                return {
                    success: false,
                    error: '预制体资源不存在'
                };
            }
            const prefabUuid = assetInfo.uuid;
            console.log(`预制体 UUID: ${prefabUuid}`);
            // 2. 根据编辑器日志，首先打开预制体资源 (就像双击预制体文件)
            try {
                await Editor.Message.request('asset-db', 'open-asset', prefabPath);
                console.log('预制体资源打开请求已发送');
            }
            catch (openError) {
                console.log('打开预制体资源失败:', openError);
            }
            // 3. 等待编辑器处理资源打开
            await new Promise(resolve => setTimeout(resolve, 800));
            // 4. 设置预制体预览模式 (基于日志中的 call-preview-function)
            try {
                await Editor.Message.request('scene', 'call-preview-function', [
                    'scene:prefab-preview',
                    'setPrefab',
                    prefabUuid
                ]);
                console.log('预制体预览模式设置成功');
            }
            catch (previewError) {
                console.log('预制体预览模式设置失败:', previewError);
            }
            // 5. 设置hierarchy面板为预制体编辑模式 (基于日志中的 hierarchy.staging)
            try {
                await Editor.Message.request('hierarchy', 'staging', {
                    assetUuid: prefabUuid,
                    animationUuid: '',
                    expandLevels: ['0']
                });
                console.log('Hierarchy预制体编辑模式设置成功');
            }
            catch (hierarchyError) {
                console.log('设置Hierarchy预制体编辑模式失败:', hierarchyError);
            }
            // 6. 等待编辑器完全处理
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                success: true,
                data: {
                    prefabPath: prefabPath,
                    prefabUuid: prefabUuid,
                    message: '已进入预制体编辑模式',
                    mode: 'prefab-edit',
                    editSession: {
                        prefabPath: prefabPath,
                        prefabUuid: prefabUuid,
                        startTime: Date.now()
                    },
                    note: '编辑器界面应该已切换到预制体编辑模式'
                }
            };
        }
        catch (error) {
            console.error('进入预制体编辑模式失败:', error);
            return {
                success: false,
                error: `进入预制体编辑模式失败: ${error.message || error}`
            };
        }
    }
    // 保存预制体 - 基于编辑器日志中的 save-asset 调用
    // 保存预制体 - 基于编辑器日志中的 save-asset 调用
    async savePrefabDirect(prefabPath) {
        try {
            console.log(`开始保存预制体: ${prefabPath}`);
            // 1. 查询预制体资源信息
            const assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', prefabPath);
            if (!assetInfo) {
                return {
                    success: false,
                    error: '预制体资源不存在'
                };
            }
            const prefabUuid = assetInfo.uuid;
            console.log(`预制体 UUID: ${prefabUuid}`);
            // 2. 调用 scene.save-scene 保存当前编辑状态 (基于日志)
            // 这会将当前场景的编辑状态保存到内存中
            try {
                await Editor.Message.request('scene', 'save-scene');
                console.log('场景状态已保存到内存');
            }
            catch (saveSceneError) {
                console.log('保存场景状态失败:', saveSceneError);
            }
            // 3. 查询预制体元数据
            try {
                const metaInfo = await Editor.Message.request('asset-db', 'query-asset-meta', prefabUuid);
                console.log('预制体元数据:', metaInfo);
            }
            catch (metaError) {
                console.log('获取预制体元数据失败:', metaError);
            }
            // 4. 基于编辑器日志，直接触发保存操作
            // 在预制体编辑模式下，scene.save-scene 会自动处理预制体内容的保存
            // 不需要手动调用 asset-db.save-asset，编辑器会自动处理
            // 5. 等待编辑器处理资源变化
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                success: true,
                data: {
                    prefabPath: prefabPath,
                    prefabUuid: prefabUuid,
                    message: '预制体保存请求已发送，编辑器将自动处理保存流程',
                    timestamp: Date.now(),
                    note: '基于编辑器日志，预制体编辑模式下scene.save-scene会自动保存预制体内容'
                }
            };
        }
        catch (error) {
            console.error('保存预制体失败:', error);
            return {
                success: false,
                error: `保存预制体失败: ${error.message || error}`
            };
        }
    }
    // 退出预制体编辑模式 - 切换回场景
    // 退出预制体编辑模式 - 切换回场景
    async exitPrefabEditMode(scenePath) {
        try {
            console.log(`开始退出预制体编辑模式，切换到场景: ${scenePath || 'db://assets/scene.scene'}`);
            // 1. 确定目标场景路径
            const targetScene = scenePath || 'db://assets/scene.scene';
            // 2. 查询目标场景信息
            const sceneAssetInfo = await Editor.Message.request('asset-db', 'query-asset-info', targetScene);
            if (!sceneAssetInfo) {
                return {
                    success: false,
                    error: '目标场景不存在'
                };
            }
            const sceneUuid = sceneAssetInfo.uuid;
            console.log(`目标场景 UUID: ${sceneUuid}`);
            // 3. 调用 asset-db.open-asset 打开场景资源 (基于日志)
            try {
                await Editor.Message.request('asset-db', 'open-asset', targetScene);
                console.log('场景资源打开请求已发送');
            }
            catch (openError) {
                console.log('打开场景资源失败:', openError);
            }
            // 4. 调用 scene.open-scene 切换场景 (基于日志)
            try {
                await Editor.Message.request('scene', 'open-scene', sceneUuid);
                console.log('场景切换请求已发送');
            }
            catch (openSceneError) {
                console.log('切换场景失败:', openSceneError);
            }
            // 5. 等待编辑器处理场景切换
            await new Promise(resolve => setTimeout(resolve, 1000));
            // 6. 查询当前场景状态确认切换成功
            try {
                const currentScene = await Editor.Message.request('scene', 'query-current-scene');
                console.log('当前场景:', currentScene);
            }
            catch (queryError) {
                console.log('查询当前场景失败:', queryError);
            }
            return {
                success: true,
                data: {
                    message: '已退出预制体编辑模式并切换到场景',
                    previousMode: 'prefab-edit',
                    currentMode: 'scene',
                    targetScene: targetScene,
                    sceneUuid: sceneUuid,
                    timestamp: Date.now()
                }
            };
        }
        catch (error) {
            console.error('退出预制体编辑模式失败:', error);
            return {
                success: false,
                error: `退出预制体编辑模式失败: ${error.message || error}`
            };
        }
    }
    // 开始记录编辑操作 - 基于日志中的 begin-recording
    // 开始记录编辑操作 - 基于日志中的 begin-recording
    async beginRecording(nodeUuids) {
        try {
            console.log(`开始记录编辑操作，节点: ${nodeUuids.join(', ')}`);
            const result = await Editor.Message.request('scene', 'begin-recording', nodeUuids, null);
            console.log('开始记录结果:', result);
            return {
                success: true,
                data: {
                    nodeUuids: nodeUuids,
                    recordingId: result,
                    message: '编辑记录已开始',
                    timestamp: Date.now()
                }
            };
        }
        catch (error) {
            console.error('开始记录编辑操作失败:', error);
            return {
                success: false,
                error: `开始记录编辑操作失败: ${error.message || error}`
            };
        }
    }
    // 结束记录编辑操作 - 基于日志中的 end-recording
    // 结束记录编辑操作 - 基于日志中的 end-recording
    async endRecording(recordingId) {
        try {
            console.log(`结束记录编辑操作，记录ID: ${recordingId}`);
            const result = await Editor.Message.request('scene', 'end-recording', recordingId);
            console.log('结束记录结果:', result);
            return {
                success: true,
                data: {
                    recordingId: recordingId,
                    result: result,
                    message: '编辑记录已结束',
                    timestamp: Date.now()
                }
            };
        }
        catch (error) {
            console.error('结束记录编辑操作失败:', error);
            return {
                success: false,
                error: `结束记录编辑操作失败: ${error.message || error}`
            };
        }
    }
    // 测试预制体修改 - 实例化预制体验证修改是否成功
    // 测试预制体修改 - 实例化预制体验证修改是否成功
    async testPrefabChanges(prefabPath, parentUuid) {
        try {
            console.log(`开始测试预制体修改: ${prefabPath}`);
            // 1. 首先确保我们在场景模式
            try {
                await this.exitPrefabEditMode();
                console.log('已确保在场景模式');
            }
            catch (exitError) {
                console.log('切换到场景模式时出错:', exitError);
            }
            // 2. 获取场景根节点作为父节点（如果没有指定parentUuid）
            let targetParentUuid = parentUuid;
            if (!targetParentUuid) {
                try {
                    const nodeTree = await Editor.Message.request('scene', 'query-node-tree');
                    if (nodeTree && nodeTree.children && nodeTree.children.length > 0) {
                        // 使用Canvas节点作为父节点
                        const canvasNode = nodeTree.children.find((child) => child.name && (child.name.includes('Canvas') || (child.__comps__ && child.__comps__.some((comp) => comp.__type__ === 'cc.Canvas'))));
                        if (canvasNode) {
                            targetParentUuid = canvasNode.uuid.value;
                            console.log(`找到Canvas节点作为父节点: ${targetParentUuid}`);
                        }
                        else {
                            targetParentUuid = nodeTree.uuid.value; // 使用场景根节点
                            console.log(`使用场景根节点作为父节点: ${targetParentUuid}`);
                        }
                    }
                }
                catch (treeError) {
                    console.log('获取节点树失败:', treeError);
                }
            }
            // 3. 实例化预制体到场景中
            console.log(`实例化预制体到节点: ${targetParentUuid}`);
            const instantiateResult = await this.instantiatePrefab({
                prefabPath: prefabPath,
                parentUuid: targetParentUuid,
                position: { x: 0, y: 0, z: 0 }
            });
            if (!instantiateResult.success) {
                return {
                    success: false,
                    error: `实例化预制体失败: ${instantiateResult.error}`
                };
            }
            const instanceNodeUuid = instantiateResult.data.nodeUuid;
            console.log(`预制体实例化成功，节点UUID: ${instanceNodeUuid}`);
            // 4. 等待实例化完成
            await new Promise(resolve => setTimeout(resolve, 1000));
            // 5. 查询实例化后的节点信息，验证修改
            try {
                const instanceInfo = await Editor.Message.request('scene', 'query-node', instanceNodeUuid);
                console.log('实例化节点信息:', JSON.stringify(instanceInfo, null, 2));
                // 6. 查询节点树获取子节点信息
                const nodeTree = await Editor.Message.request('scene', 'query-node-tree');
                const findInstanceInTree = (tree, targetUuid) => {
                    if (tree.uuid && tree.uuid.value === targetUuid) {
                        return tree;
                    }
                    if (tree.children) {
                        for (const child of tree.children) {
                            const found = findInstanceInTree(child, targetUuid);
                            if (found)
                                return found;
                        }
                    }
                    return null;
                };
                const instanceNode = findInstanceInTree(nodeTree, instanceNodeUuid);
                console.log('节点树中的实例信息:', JSON.stringify(instanceNode, null, 2));
                return {
                    success: true,
                    data: {
                        message: 'Test completed - prefab instantiated successfully',
                        instanceNodeUuid: instanceNodeUuid,
                        prefabPath: prefabPath,
                        note: 'Check editor Hierarchy panel to verify changes'
                    }
                };
            }
            catch (queryError) {
                console.log('查询实例节点信息失败:', queryError);
                return {
                    success: true,
                    data: {
                        prefabPath: prefabPath,
                        instanceNodeUuid: instanceNodeUuid,
                        parentUuid: targetParentUuid,
                        message: '预制体实例化成功，但查询详细信息失败',
                        note: '请手动检查编辑器中的预制体实例'
                    }
                };
            }
        }
        catch (error) {
            console.error('测试预制体修改失败:', error);
            return {
                success: false,
                error: `测试预制体修改失败: ${error.message || error}`
            };
        }
    }
}
exports.PrefabTools = PrefabTools;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmFiLXRvb2xzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc291cmNlL3Rvb2xzL3ByZWZhYi10b29scy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFHQSxNQUFhLFdBQVc7SUFDcEIsUUFBUTtRQUNKLE9BQU87WUFDSCw0Q0FBNEM7WUFDNUM7Z0JBQ0ksSUFBSSxFQUFFLGVBQWU7Z0JBQ3JCLFdBQVcsRUFBRSwwUkFBMFI7Z0JBQ3ZTLFdBQVcsRUFBRTtvQkFDVCxJQUFJLEVBQUUsUUFBUTtvQkFDZCxVQUFVLEVBQUU7d0JBQ1IsTUFBTSxFQUFFOzRCQUNKLElBQUksRUFBRSxRQUFROzRCQUNkLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDOzRCQUNsQyxXQUFXLEVBQUUsNk1BQTZNO3lCQUM3Tjt3QkFDRCxNQUFNLEVBQUU7NEJBQ0osSUFBSSxFQUFFLFFBQVE7NEJBQ2QsV0FBVyxFQUFFLDJOQUEyTjs0QkFDeE8sT0FBTyxFQUFFLGFBQWE7eUJBQ3pCO3dCQUNELFVBQVUsRUFBRTs0QkFDUixJQUFJLEVBQUUsUUFBUTs0QkFDZCxXQUFXLEVBQUUsOE5BQThOO3lCQUM5TztxQkFDSjtvQkFDRCxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUM7aUJBQ3ZCO2FBQ0o7WUFFRCxrREFBa0Q7WUFDbEQ7Z0JBQ0ksSUFBSSxFQUFFLGtCQUFrQjtnQkFDeEIsV0FBVyxFQUFFLHFSQUFxUjtnQkFDbFMsV0FBVyxFQUFFO29CQUNULElBQUksRUFBRSxRQUFRO29CQUNkLFVBQVUsRUFBRTt3QkFDUixNQUFNLEVBQUU7NEJBQ0osSUFBSSxFQUFFLFFBQVE7NEJBQ2QsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQzs0QkFDMUIsV0FBVyxFQUFFLDJNQUEyTTt5QkFDM047d0JBQ0QsUUFBUSxFQUFFOzRCQUNOLElBQUksRUFBRSxRQUFROzRCQUNkLFdBQVcsRUFBRSxpT0FBaU87eUJBQ2pQ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LENBQUM7Z0JBRWpFLE9BQU87b0JBQ0gsT0FBTyxFQUFFLElBQUk7b0JBQ2IsSUFBSSxFQUFFO3dCQUNGLE9BQU8sRUFBRSxtREFBbUQ7d0JBQzVELGdCQUFnQixFQUFFLGdCQUFnQjt3QkFDbEMsVUFBVSxFQUFFLFVBQVU7d0JBQ3RCLElBQUksRUFBRSxnREFBZ0Q7cUJBQ3pEO2lCQUNKLENBQUM7WUFFTixDQUFDO1lBQUMsT0FBTyxVQUFVLEVBQUUsQ0FBQztnQkFDbEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBQ3ZDLE9BQU87b0JBQ0gsT0FBTyxFQUFFLElBQUk7b0JBQ2IsSUFBSSxFQUFFO3dCQUNGLFVBQVUsRUFBRSxVQUFVO3dCQUN0QixnQkFBZ0IsRUFBRSxnQkFBZ0I7d0JBQ2xDLFVBQVUsRUFBRSxnQkFBZ0I7d0JBQzVCLE9BQU8sRUFBRSxvQkFBb0I7d0JBQzdCLElBQUksRUFBRSxpQkFBaUI7cUJBQzFCO2lCQUNKLENBQUM7WUFDTixDQUFDO1FBRUwsQ0FBQztRQUFDLE9BQU8sS0FBVSxFQUFFLENBQUM7WUFDbEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDbkMsT0FBTztnQkFDSCxPQUFPLEVBQUUsS0FBSztnQkFDZCxLQUFLLEVBQUUsY0FBYyxLQUFLLENBQUMsT0FBTyxJQUFJLEtBQUssRUFBRTthQUNoRCxDQUFDO1FBQ04sQ0FBQztJQUNMLENBQUM7Q0FFSjtBQWx2SEQsa0NBa3ZIQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFRvb2xEZWZpbml0aW9uLCBUb29sUmVzcG9uc2UsIFRvb2xFeGVjdXRvciwgUHJlZmFiSW5mbyB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCB7IHJlYWRTZXR0aW5ncyB9IGZyb20gJy4uL3NldHRpbmdzJztcblxuZXhwb3J0IGNsYXNzIFByZWZhYlRvb2xzIGltcGxlbWVudHMgVG9vbEV4ZWN1dG9yIHtcbiAgICBnZXRUb29scygpOiBUb29sRGVmaW5pdGlvbltdIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIC8vIDEuIEJyb3dzZSBwcmVmYWJzIC0gUXVlcnkgYW5kIGluZm9ybWF0aW9uXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ3ByZWZhYl9icm93c2UnLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUFJFRkFCIEJST1dTRVI6IFF1ZXJ5IGFuZCBhbmFseXplIHByZWZhYiBmaWxlcyBpbiB5b3VyIHByb2plY3QuIFdPUktGTE9XOiBVc2UgXCJsaXN0XCIgdG8gZGlzY292ZXIgYWxsIHByZWZhYnMg4oaSIFwiaW5mb1wiIHRvIGdldCBkZXRhaWxlZCBwcmVmYWIgZGF0YSDihpIgXCJ2YWxpZGF0ZVwiIHRvIGNoZWNrIGZpbGUgaW50ZWdyaXR5LiBFc3NlbnRpYWwgZm9yIHByZWZhYiBtYW5hZ2VtZW50IGFuZCBkZWJ1Z2dpbmcuIENvbW1vbiB1c2U6IGZpbmRpbmcgcHJlZmFicyBiZWZvcmUgaW5zdGFudGlhdGlvbi4nLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnVtOiBbJ2xpc3QnLCAnaW5mbycsICd2YWxpZGF0ZSddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQnJvd3NlIG9wZXJhdGlvbjogXCJsaXN0XCIgPSBnZXQgYWxsIHByZWZhYnMgaW4gZm9sZGVyIChvcHRpb25hbCBmb2xkZXIgcGFyYW1ldGVyKSB8IFwiaW5mb1wiID0gZ2V0IGRldGFpbGVkIHByZWZhYiBkYXRhIChyZXF1aXJlcyBwcmVmYWJQYXRoKSB8IFwidmFsaWRhdGVcIiA9IGNoZWNrIHByZWZhYiBmaWxlIGludGVncml0eSAocmVxdWlyZXMgcHJlZmFiUGF0aCknXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9sZGVyOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdTZWFyY2ggZGlyZWN0b3J5IGZvciBwcmVmYWJzIChsaXN0IGFjdGlvbikuIERlZmF1bHQ6IFwiZGI6Ly9hc3NldHNcIiBzZWFyY2hlcyBlbnRpcmUgcHJvamVjdC4gRXhhbXBsZXM6IFwiZGI6Ly9hc3NldHMvcHJlZmFic1wiIGZvciBtYWluIHByZWZhYnMsIFwiZGI6Ly9hc3NldHMvdWlcIiBmb3IgVUkgcHJlZmFicy4gVXNlIHNwZWNpZmljIGZvbGRlcnMgZm9yIGZvY3VzZWQgc2VhcmNoZXMuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiAnZGI6Ly9hc3NldHMnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiUGF0aDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUHJlZmFiIGZpbGUgcGF0aCAoUkVRVUlSRUQgZm9yIGluZm8vdmFsaWRhdGUgYWN0aW9ucykuIE11c3QgYmUgdmFsaWQgQ29jb3MgYXNzZXQgcGF0aCBlbmRpbmcgaW4gLnByZWZhYi4gRXhhbXBsZXM6IFwiZGI6Ly9hc3NldHMvcHJlZmFicy9QbGF5ZXIucHJlZmFiXCIsIFwiZGI6Ly9hc3NldHMvdWkvTWVudVBhbmVsLnByZWZhYlwiLiBHZXQgcGF0aHMgZnJvbSBsaXN0IGFjdGlvbiBmaXJzdC4nXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBbJ2FjdGlvbiddXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLy8gMi4gUHJlZmFiIGxpZmVjeWNsZSAtIENyZWF0ZSwgZHVwbGljYXRlLCBkZWxldGVcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAncHJlZmFiX2xpZmVjeWNsZScsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdQUkVGQUIgTElGRUNZQ0xFOiBDcmVhdGUgcHJlZmFicyBmcm9tIGV4aXN0aW5nIG5vZGVzIG9yIGRlbGV0ZSBwcmVmYWIgZmlsZXMuIFdPUktGTE9XOiBGb3IgY3JlYXRlIOKGkiBzZWxlY3Qgc291cmNlIG5vZGUg4oaSIHNwZWNpZnkgbmFtZSBhbmQgc2F2ZSBwYXRoIOKGkiBjcmVhdGVzIHJldXNhYmxlIHByZWZhYi4gRm9yIGRlbGV0ZSDihpIgc3BlY2lmeSBwcmVmYWIgcGF0aCDihpIgcmVtb3ZlcyBmaWxlIHBlcm1hbmVudGx5LiBVc2Ugd2l0aCBjYXV0aW9uIGZvciBkZWxldGUgb3BlcmF0aW9ucy4nLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnVtOiBbJ2NyZWF0ZScsICdkZWxldGUnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0xpZmVjeWNsZSBvcGVyYXRpb246IFwiY3JlYXRlXCIgPSBjb252ZXJ0IHNjZW5lIG5vZGUgaW50byByZXVzYWJsZSBwcmVmYWIgKHJlcXVpcmVzIG5vZGVVdWlkK3ByZWZhYk5hbWUrc2F2ZVBhdGgpIHwgXCJkZWxldGVcIiA9IHBlcm1hbmVudGx5IHJlbW92ZSBwcmVmYWIgZmlsZSAocmVxdWlyZXMgcHJlZmFiUGF0aCAtIFdBUk5JTkc6IGlycmV2ZXJzaWJsZSknXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVV1aWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1NvdXJjZSBub2RlIFVVSUQgZm9yIHByZWZhYiBjcmVhdGlvbiAoUkVRVUlSRUQgZm9yIGNyZWF0ZSBhY3Rpb24pLiBVc2Ugbm9kZV9xdWVyeSB0byBmaW5kIHRhcmdldCBub2RlIFVVSUQgZmlyc3QuIFRoZSBub2RlIGFuZCBhbGwgaXRzIGNoaWxkcmVuIHdpbGwgYmUgY29udmVydGVkIGludG8gYSBwcmVmYWIuIEZvcm1hdDogXCIxMjM0NTY3OC1hYmNkLTEyMzQtNTY3OC0xMjM0NTY3ODlhYmNcIidcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVmYWJOYW1lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdOZXcgcHJlZmFiIG5hbWUgKFJFUVVJUkVEIGZvciBjcmVhdGUgYWN0aW9uKS4gQ2hvb3NlIGRlc2NyaXB0aXZlIG5hbWVzIHdpdGhvdXQgLnByZWZhYiBleHRlbnNpb24uIEV4YW1wbGVzOiBcIlBsYXllckNoYXJhY3RlclwiLCBcIlVJQnV0dG9uXCIsIFwiRW5lbXlUYW5rXCIuIFN5c3RlbSBhZGRzIC5wcmVmYWIgZXh0ZW5zaW9uIGF1dG9tYXRpY2FsbHkuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhdmVQYXRoOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdEZXN0aW5hdGlvbiBwYXRoIGZvciBuZXcgcHJlZmFiIChSRVFVSVJFRCBmb3IgY3JlYXRlIGFjdGlvbikuIE11c3QgaW5jbHVkZSAucHJlZmFiIGV4dGVuc2lvbi4gRXhhbXBsZXM6IFwiZGI6Ly9hc3NldHMvcHJlZmFicy9QbGF5ZXIucHJlZmFiXCIsIFwiZGI6Ly9hc3NldHMvdWkvQ3VzdG9tQnV0dG9uLnByZWZhYlwiLiBFbnN1cmUgcGFyZW50IGZvbGRlciBleGlzdHMuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZWZhYlBhdGg6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1ByZWZhYiBmaWxlIHRvIGRlbGV0ZSAoUkVRVUlSRUQgZm9yIGRlbGV0ZSBhY3Rpb24pLiBXQVJOSU5HOiBUaGlzIHBlcm1hbmVudGx5IHJlbW92ZXMgdGhlIHByZWZhYiBmaWxlLiBFeGFtcGxlczogXCJkYjovL2Fzc2V0cy9wcmVmYWJzL09sZFBsYXllci5wcmVmYWJcIi4gVXNlIHByZWZhYl9icm93c2UgbGlzdCB0byBmaW5kIGV4YWN0IHBhdGhzIGZpcnN0LidcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IFsnYWN0aW9uJ11cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAvLyAzLiBTY2VuZSBwcmVmYWIgaW5zdGFuY2VzIC0gSW5zdGFudGlhdGUsIHVubGluaywgYXBwbHksIHJldmVydFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdwcmVmYWJfaW5zdGFuY2UnLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUFJFRkFCIElOU1RBTkNFUzogTWFuYWdlIHByZWZhYiBpbnN0YW5jZXMgaW4gdGhlIHNjZW5lLiBXT1JLRkxPVzogXCJpbnN0YW50aWF0ZVwiIHRvIGNyZWF0ZSBpbnN0YW5jZXMg4oaSIG1vZGlmeSBhcyBuZWVkZWQg4oaSIFwiYXBwbHlcIiB0byBzYXZlIGNoYW5nZXMgYmFjayB0byBwcmVmYWIgT1IgXCJ1bmxpbmtcIiB0byBicmVhayBjb25uZWN0aW9uIE9SIFwicmV2ZXJ0XCIgdG8gcmVzdG9yZSBvcmlnaW5hbC4gQ3JpdGljYWwgZm9yIHByZWZhYi1iYXNlZCBkZXZlbG9wbWVudC4nLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnVtOiBbJ2luc3RhbnRpYXRlJywgJ3VubGluaycsICdhcHBseScsICdyZXZlcnQnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0luc3RhbmNlIG9wZXJhdGlvbjogXCJpbnN0YW50aWF0ZVwiID0gY3JlYXRlIHByZWZhYiBpbnN0YW5jZSBpbiBzY2VuZSAocmVxdWlyZXMgcHJlZmFiUGF0aCtwYXJlbnRVdWlkKSB8IFwidW5saW5rXCIgPSBicmVhayBwcmVmYWIgY29ubmVjdGlvbiwgbWFrZSBpbmRlcGVuZGVudCAocmVxdWlyZXMgbm9kZVV1aWQpIHwgXCJhcHBseVwiID0gc2F2ZSBpbnN0YW5jZSBjaGFuZ2VzIHRvIHByZWZhYiAocmVxdWlyZXMgbm9kZVV1aWQpIHwgXCJyZXZlcnRcIiA9IHJlc3RvcmUgdG8gcHJlZmFiIHN0YXRlIChyZXF1aXJlcyBub2RlVXVpZCknXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiUGF0aDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUHJlZmFiIGZpbGUgcGF0aCAoUkVRVUlSRUQgZm9yIGluc3RhbnRpYXRlIGFjdGlvbikuIE11c3QgYmUgdmFsaWQgLnByZWZhYiBmaWxlLiBFeGFtcGxlczogXCJkYjovL2Fzc2V0cy9wcmVmYWJzL1BsYXllci5wcmVmYWJcIiwgXCJkYjovL2Fzc2V0cy91aS9NZW51UGFuZWwucHJlZmFiXCIuIFVzZSBwcmVmYWJfYnJvd3NlIHRvIGZpbmQgYXZhaWxhYmxlIHByZWZhYnMuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudFV1aWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1BhcmVudCBub2RlIFVVSUQgZm9yIG5ldyBpbnN0YW5jZSAoUkVRVUlSRUQgZm9yIGluc3RhbnRpYXRlIGFjdGlvbikuIFVzZSBub2RlX3F1ZXJ5IHRvIGZpbmQgcGFyZW50IG5vZGUgZmlyc3QuIFRoZSBwcmVmYWIgaW5zdGFuY2Ugd2lsbCBiZSBjcmVhdGVkIGFzIGEgY2hpbGQgb2YgdGhpcyBub2RlLiBGb3JtYXQ6IFwiMTIzNDU2NzgtYWJjZC0xMjM0LTU2NzgtMTIzNDU2Nzg5YWJjXCInXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7IHg6IHsgdHlwZTogJ251bWJlcicgfSwgeTogeyB0eXBlOiAnbnVtYmVyJyB9LCB6OiB7IHR5cGU6ICdudW1iZXInIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1N0YXJ0aW5nIHBvc2l0aW9uIGZvciBuZXcgaW5zdGFuY2UgKGluc3RhbnRpYXRlIGFjdGlvbikuIFNldHMgaW5pdGlhbCB0cmFuc2Zvcm0gYWZ0ZXIgY3JlYXRpb24uIEV4YW1wbGU6IHtcInhcIjogMTAwLCBcInlcIjogMjAwLCBcInpcIjogMH0uIE9wdGlvbmFsIC0gZGVmYXVsdHMgdG8gcHJlZmFiXFwncyBvcmlnaW5hbCBwb3NpdGlvbiBpZiBvbWl0dGVkLidcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlVXVpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUHJlZmFiIGluc3RhbmNlIG5vZGUgVVVJRCAoUkVRVUlSRUQgZm9yIHVubGluay9hcHBseS9yZXZlcnQgYWN0aW9ucykuIE11c3QgYmUgYSBub2RlIHRoYXQgd2FzIGNyZWF0ZWQgZnJvbSBhIHByZWZhYi4gVXNlIG5vZGVfcXVlcnkgdG8gZmluZCBwcmVmYWIgaW5zdGFuY2Ugbm9kZXMuIEZvcm1hdDogXCIxMjM0NTY3OC1hYmNkLTEyMzQtNTY3OC0xMjM0NTY3ODlhYmNcIidcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IFsnYWN0aW9uJ11cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAvLyA0LiBQcmVmYWIgZWRpdCBtb2RlIC0gSU1QT1JUQU5UOiBDb21wbGV0ZSB3b3JrZmxvdyBmb3IgZWRpdGluZyBwcmVmYWJzXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ3ByZWZhYl9lZGl0JyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1BSRUZBQiBFRElUIFdPUktGTE9XOiBFZGl0IHByZWZhYiBjb250ZW50IGluIGRlZGljYXRlZCBlZGl0aW5nIG1vZGUuIENSSVRJQ0FMIFdPUktGTE9XOiAxKSBcImVudGVyXCIgZWRpdCBtb2RlIChzd2l0Y2hlcyB0byBwcmVmYWIgc2NlbmUpIOKGkiAyKSBtYWtlIG1vZGlmaWNhdGlvbnMgdXNpbmcgb3RoZXIgdG9vbHMg4oaSIDMpIFwic2F2ZVwiIGNoYW5nZXMg4oaSIDQpIFwiZXhpdFwiIGJhY2sgdG8gbWFpbiBzY2VuZS4gSU1QT1JUQU5UOiBBbHdheXMgc2F2ZSBiZWZvcmUgZXhpdCB0byBwZXJzaXN0IGNoYW5nZXMuJyxcbiAgICAgICAgICAgICAgICBpbnB1dFNjaGVtYToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW51bTogWydlbnRlcicsICdzYXZlJywgJ2V4aXQnLCAndGVzdCddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnRWRpdCBvcGVyYXRpb246IFwiZW50ZXJcIiA9IHN0YXJ0IGVkaXRpbmcgcHJlZmFiIGluIGRlZGljYXRlZCBzY2VuZSAocmVxdWlyZXMgcHJlZmFiUGF0aCkgfCBcInNhdmVcIiA9IHBlcnNpc3QgY3VycmVudCBjaGFuZ2VzIHRvIHByZWZhYiBmaWxlIHwgXCJleGl0XCIgPSByZXR1cm4gdG8gbWFpbiBzY2VuZSAoUkVNRU1CRVIgdG8gc2F2ZSBmaXJzdCkgfCBcInRlc3RcIiA9IGNyZWF0ZSB0ZXN0IGluc3RhbmNlIHRvIHZlcmlmeSBjaGFuZ2VzIChyZXF1aXJlcyBwYXJlbnRVdWlkKSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVmYWJQYXRoOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdQcmVmYWIgZmlsZSBwYXRoIChSRVFVSVJFRCBmb3IgZW50ZXIvc2F2ZS9leGl0IGFjdGlvbnMpLiBNdXN0IGJlIHZhbGlkIC5wcmVmYWIgZmlsZS4gRXhhbXBsZXM6IFwiZGI6Ly9hc3NldHMvcHJlZmFicy9QbGF5ZXIucHJlZmFiXCIuIEZvciBlbnRlcjogb3BlbnMgcHJlZmFiIGZvciBlZGl0aW5nLiBGb3Igc2F2ZS9leGl0OiBzcGVjaWZpZXMgd2hpY2ggcHJlZmFiIHRvIHNhdmUvY2xvc2UuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudFV1aWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1BhcmVudCBub2RlIGZvciB0ZXN0IGluc3RhbmNlICh0ZXN0IGFjdGlvbiBvbmx5KS4gVXNlIG5vZGVfcXVlcnkgdG8gZmluZCBwYXJlbnQgVVVJRC4gQ3JlYXRlcyB0ZW1wb3JhcnkgaW5zdGFuY2UgdG8gdmVyaWZ5IHByZWZhYiBjaGFuZ2VzIHdvcmsgY29ycmVjdGx5LiBGb3JtYXQ6IFwiMTIzNDU2NzgtYWJjZC0xMjM0LTU2NzgtMTIzNDU2Nzg5YWJjXCInXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBbJ2FjdGlvbicsICdwcmVmYWJQYXRoJ11cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG4gICAgfVxuXG4gICAgYXN5bmMgZXhlY3V0ZSh0b29sTmFtZTogc3RyaW5nLCBhcmdzOiBhbnkpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICBzd2l0Y2ggKHRvb2xOYW1lKSB7XG4gICAgICAgICAgICBjYXNlICdwcmVmYWJfYnJvd3NlJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5oYW5kbGVQcmVmYWJCcm93c2UoYXJncyk7XG4gICAgICAgICAgICBjYXNlICdwcmVmYWJfbGlmZWN5Y2xlJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5oYW5kbGVQcmVmYWJMaWZlY3ljbGUoYXJncyk7XG4gICAgICAgICAgICBjYXNlICdwcmVmYWJfaW5zdGFuY2UnOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmhhbmRsZVByZWZhYkluc3RhbmNlKGFyZ3MpO1xuICAgICAgICAgICAgY2FzZSAncHJlZmFiX2VkaXQnOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmhhbmRsZVByZWZhYkVkaXQoYXJncyk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biB0b29sOiAke3Rvb2xOYW1lfWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBnZXRQcmVmYWJMaXN0KGZvbGRlcjogc3RyaW5nID0gJ2RiOi8vYXNzZXRzJyk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBwYXR0ZXJuID0gZm9sZGVyLmVuZHNXaXRoKCcvJykgP1xuICAgICAgICAgICAgICAgIGAke2ZvbGRlcn0qKi8qLnByZWZhYmAgOiBgJHtmb2xkZXJ9LyoqLyoucHJlZmFiYDtcblxuICAgICAgICAgICAgY29uc3QgcmVzdWx0czogYW55W10gPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdxdWVyeS1hc3NldHMnLCB7XG4gICAgICAgICAgICAgICAgcGF0dGVybjogcGF0dGVyblxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCBwcmVmYWJzOiBQcmVmYWJJbmZvW10gPSByZXN1bHRzLm1hcChhc3NldCA9PiAoe1xuICAgICAgICAgICAgICAgIG5hbWU6IGFzc2V0Lm5hbWUsXG4gICAgICAgICAgICAgICAgcGF0aDogYXNzZXQudXJsLFxuICAgICAgICAgICAgICAgIHV1aWQ6IGFzc2V0LnV1aWQsXG4gICAgICAgICAgICAgICAgZm9sZGVyOiBhc3NldC51cmwuc3Vic3RyaW5nKDAsIGFzc2V0LnVybC5sYXN0SW5kZXhPZignLycpKVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcHJlZmFicyB9O1xuICAgICAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnIubWVzc2FnZSB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBsb2FkUHJlZmFiKHByZWZhYlBhdGg6IHN0cmluZyk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBhc3NldEluZm86IGFueSA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3F1ZXJ5LWFzc2V0LWluZm8nLCBwcmVmYWJQYXRoKTtcbiAgICAgICAgICAgIGlmICghYXNzZXRJbmZvKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQcmVmYWIgbm90IGZvdW5kJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHByZWZhYkRhdGE6IGFueSA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ2xvYWQtYXNzZXQnLCB7XG4gICAgICAgICAgICAgICAgdXVpZDogYXNzZXRJbmZvLnV1aWRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgdXVpZDogcHJlZmFiRGF0YS51dWlkLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBwcmVmYWJEYXRhLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdQcmVmYWIgbG9hZGVkIHN1Y2Nlc3NmdWxseSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnIubWVzc2FnZSB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBpbnN0YW50aWF0ZVByZWZhYihhcmdzOiBhbnkpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8g6I635Y+W6aKE5Yi25L2T6LWE5rqQ5L+h5oGvXG4gICAgICAgICAgICBjb25zdCBhc3NldEluZm8gPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdxdWVyeS1hc3NldC1pbmZvJywgYXJncy5wcmVmYWJQYXRoKTtcbiAgICAgICAgICAgIGlmICghYXNzZXRJbmZvKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCfpooTliLbkvZPmnKrmib7liLAnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g6K6w5b2V5pKk6ZSA5pON5L2cXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnJlY29yZFVuZG9PcGVyYXRpb24oJ2luc3RhbnRpYXRlLXByZWZhYicsIGFyZ3MucGFyZW50VXVpZCB8fCAnc2NlbmUnKTtcblxuICAgICAgICAgICAgLy8g5L2/55So57yW6L6R5Zmo5qCH5YeG5rWB56iLXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmluc3RhbnRpYXRlUHJlZmFiU3RhbmRhcmQoYXJncywgYXNzZXRJbmZvKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIC8vIOWunuS+i+WMlumihOWItuS9k+S4jemcgOimgeWIt+aWsOWFqOmDqOi1hOa6kFxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOWbnumAgOaWueazlVxuICAgICAgICAgICAgY29uc29sZS5sb2coJ+agh+WHhuaWueazleWksei0pe+8jOS9v+eUqOeugOWMluaWueazlS4uLicpO1xuICAgICAgICAgICAgY29uc3QgZmFsbGJhY2tSZXN1bHQgPSBhd2FpdCB0aGlzLmluc3RhbnRpYXRlUHJlZmFiU2ltcGxlKGFyZ3MsIGFzc2V0SW5mbyk7XG4gICAgICAgICAgICAvLyDlrp7kvovljJbpooTliLbkvZPkuI3pnIDopoHliLfmlrDlhajpg6jotYTmupBcbiAgICAgICAgICAgIHJldHVybiBmYWxsYmFja1Jlc3VsdDtcblxuICAgICAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogYOmihOWItuS9k+WunuS+i+WMluWksei0pTogJHtlcnIubWVzc2FnZX1gLFxuICAgICAgICAgICAgICAgIGluc3RydWN0aW9uOiAn6K+35qOA5p+l6aKE5Yi25L2T6Lev5b6E5piv5ZCm5q2j56Gu77yM56Gu5L+d6aKE5Yi25L2T5paH5Lu25qC85byP5q2j56GuJ1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOW7uueri+iKgueCueS4jumihOWItuS9k+eahOWFs+iBlOWFs+ezu1xuICAgICAqIOi/meS4quaWueazleWIm+W7uuW/heimgeeahFByZWZhYkluZm/lkoxQcmVmYWJJbnN0YW5jZee7k+aehFxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgZXN0YWJsaXNoUHJlZmFiQ29ubmVjdGlvbihub2RlVXVpZDogc3RyaW5nLCBwcmVmYWJVdWlkOiBzdHJpbmcsIHByZWZhYlBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8g6K+75Y+W6aKE5Yi25L2T5paH5Lu26I635Y+W5qC56IqC54K555qEZmlsZUlkXG4gICAgICAgICAgICBjb25zdCBwcmVmYWJDb250ZW50ID0gYXdhaXQgdGhpcy5yZWFkUHJlZmFiRmlsZShwcmVmYWJQYXRoKTtcbiAgICAgICAgICAgIGlmICghcHJlZmFiQ29udGVudCB8fCAhcHJlZmFiQ29udGVudC5kYXRhIHx8ICFwcmVmYWJDb250ZW50LmRhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCfml6Dms5Xor7vlj5bpooTliLbkvZPmlofku7blhoXlrrknKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g5om+5Yiw6aKE5Yi25L2T5qC56IqC54K555qEZmlsZUlkICjpgJrluLjmmK/nrKzkuozkuKrlr7nosaHvvIzljbPntKLlvJUxKVxuICAgICAgICAgICAgY29uc3Qgcm9vdE5vZGUgPSBwcmVmYWJDb250ZW50LmRhdGEuZmluZCgoaXRlbTogYW55KSA9PiBpdGVtLl9fdHlwZSA9PT0gJ2NjLk5vZGUnICYmIGl0ZW0uX3BhcmVudCA9PT0gbnVsbCk7XG4gICAgICAgICAgICBpZiAoIXJvb3ROb2RlIHx8ICFyb290Tm9kZS5fcHJlZmFiKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCfml6Dms5Xmib7liLDpooTliLbkvZPmoLnoioLngrnmiJblhbbpooTliLbkvZPkv6Hmga8nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g6I635Y+W5qC56IqC54K555qEUHJlZmFiSW5mb1xuICAgICAgICAgICAgY29uc3Qgcm9vdFByZWZhYkluZm8gPSBwcmVmYWJDb250ZW50LmRhdGFbcm9vdE5vZGUuX3ByZWZhYi5fX2lkX19dO1xuICAgICAgICAgICAgaWYgKCFyb290UHJlZmFiSW5mbyB8fCByb290UHJlZmFiSW5mby5fX3R5cGUgIT09ICdjYy5QcmVmYWJJbmZvJykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcign5peg5rOV5om+5Yiw6aKE5Yi25L2T5qC56IqC54K555qEUHJlZmFiSW5mbycpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCByb290RmlsZUlkID0gcm9vdFByZWZhYkluZm8uZmlsZUlkO1xuXG4gICAgICAgICAgICAvLyDkvb/nlKhzY2VuZSBBUEnlu7rnq4vpooTliLbkvZPov57mjqVcbiAgICAgICAgICAgIGNvbnN0IHByZWZhYkNvbm5lY3Rpb25EYXRhID0ge1xuICAgICAgICAgICAgICAgIG5vZGU6IG5vZGVVdWlkLFxuICAgICAgICAgICAgICAgIHByZWZhYjogcHJlZmFiVXVpZCxcbiAgICAgICAgICAgICAgICBmaWxlSWQ6IHJvb3RGaWxlSWRcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIOWwneivleS9v+eUqOWkmuenjUFQSeaWueazleW7uueri+mihOWItuS9k+i/nuaOpVxuICAgICAgICAgICAgY29uc3QgY29ubmVjdGlvbk1ldGhvZHMgPSBbXG4gICAgICAgICAgICAgICAgKCkgPT4gRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAnY29ubmVjdC1wcmVmYWItaW5zdGFuY2UnLCBwcmVmYWJDb25uZWN0aW9uRGF0YSksXG4gICAgICAgICAgICAgICAgKCkgPT4gRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAnc2V0LXByZWZhYi1jb25uZWN0aW9uJywgcHJlZmFiQ29ubmVjdGlvbkRhdGEpLFxuICAgICAgICAgICAgICAgICgpID0+IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ2FwcGx5LXByZWZhYi1saW5rJywgcHJlZmFiQ29ubmVjdGlvbkRhdGEpXG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICBsZXQgY29ubmVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IG1ldGhvZCBvZiBjb25uZWN0aW9uTWV0aG9kcykge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IG1ldGhvZCgpO1xuICAgICAgICAgICAgICAgICAgICBjb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ+mihOWItuS9k+i/nuaOpeaWueazleWksei0pe+8jOWwneivleS4i+S4gOS4quaWueazlTonLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWNvbm5lY3RlZCkge1xuICAgICAgICAgICAgICAgIC8vIOWmguaenOaJgOaciUFQSeaWueazlemDveWksei0pe+8jOWwneivleaJi+WKqOS/ruaUueWcuuaZr+aVsOaNrlxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybign5omA5pyJ6aKE5Yi25L2T6L+e5o6lQVBJ6YO95aSx6LSl77yM5bCd6K+V5omL5Yqo5bu656uL6L+e5o6lJyk7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5tYW51YWxseUVzdGFibGlzaFByZWZhYkNvbm5lY3Rpb24obm9kZVV1aWQsIHByZWZhYlV1aWQsIHJvb3RGaWxlSWQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCflu7rnq4vpooTliLbkvZPov57mjqXlpLHotKU6JywgZXJyb3IpO1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDmiYvliqjlu7rnq4vpooTliLbkvZPov57mjqXvvIjlvZNBUEnmlrnms5XlpLHotKXml7bnmoTlpIfnlKjmlrnmoYjvvIlcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIG1hbnVhbGx5RXN0YWJsaXNoUHJlZmFiQ29ubmVjdGlvbihub2RlVXVpZDogc3RyaW5nLCBwcmVmYWJVdWlkOiBzdHJpbmcsIHJvb3RGaWxlSWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8g5bCd6K+V5L2/55SoZHVtcCBBUEnkv67mlLnoioLngrnnmoRfcHJlZmFi5bGe5oCnXG4gICAgICAgICAgICBjb25zdCBwcmVmYWJDb25uZWN0aW9uRGF0YSA9IHtcbiAgICAgICAgICAgICAgICBbbm9kZVV1aWRdOiB7XG4gICAgICAgICAgICAgICAgICAgICdfcHJlZmFiJzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ19fdXVpZF9fJzogcHJlZmFiVXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdfX2V4cGVjdGVkVHlwZV9fJzogJ2NjLlByZWZhYicsXG4gICAgICAgICAgICAgICAgICAgICAgICAnZmlsZUlkJzogcm9vdEZpbGVJZFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAnc2V0LXByb3BlcnR5Jywge1xuICAgICAgICAgICAgICAgIHV1aWQ6IG5vZGVVdWlkLFxuICAgICAgICAgICAgICAgIHBhdGg6ICdfcHJlZmFiJyxcbiAgICAgICAgICAgICAgICBkdW1wOiB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnX191dWlkX18nOiBwcmVmYWJVdWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ19fZXhwZWN0ZWRUeXBlX18nOiAnY2MuUHJlZmFiJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+aJi+WKqOW7uueri+mihOWItuS9k+i/nuaOpeS5n+Wksei0pTonLCBlcnJvcik7XG4gICAgICAgICAgICAvLyDkuI3mipvlh7rplJnor6/vvIzlm6DkuLrln7rmnKznmoToioLngrnliJvlu7rlt7Lnu4/miJDlip9cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOivu+WPlumihOWItuS9k+aWh+S7tuWGheWuuVxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgcmVhZFByZWZhYkZpbGUocHJlZmFiUGF0aDogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIOWwneivleS9v+eUqGFzc2V0LWRiIEFQSeivu+WPluaWh+S7tuWGheWuuVxuICAgICAgICAgICAgbGV0IGFzc2V0Q29udGVudDogYW55O1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhc3NldENvbnRlbnQgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdxdWVyeS1hc3NldC1pbmZvJywgcHJlZmFiUGF0aCk7XG4gICAgICAgICAgICAgICAgaWYgKGFzc2V0Q29udGVudCAmJiBhc3NldENvbnRlbnQuc291cmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOWmguaenOaciXNvdXJjZei3r+W+hO+8jOebtOaOpeivu+WPluaWh+S7tlxuICAgICAgICAgICAgICAgICAgICBjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcGF0aC5yZXNvbHZlKGFzc2V0Q29udGVudC5zb3VyY2UpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmdWxsUGF0aCwgJ3V0ZjgnKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZmlsZUNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCfkvb/nlKhhc3NldC1kYuivu+WPluWksei0pe+8jOWwneivleWFtuS7luaWueazlTonLCBlcnJvcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOWkh+eUqOaWueazle+8mui9rOaNomRiOi8v6Lev5b6E5Li65a6e6ZmF5paH5Lu26Lev5b6EXG4gICAgICAgICAgICBjb25zdCBmc1BhdGggPSBwcmVmYWJQYXRoLnJlcGxhY2UoJ2RiOi8vYXNzZXRzLycsICdhc3NldHMvJykucmVwbGFjZSgnZGI6Ly9hc3NldHMnLCAnYXNzZXRzJyk7XG4gICAgICAgICAgICBjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG4gICAgICAgICAgICBjb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuXG4gICAgICAgICAgICAvLyDlsJ3or5XlpJrkuKrlj6/og73nmoTpobnnm67moLnot6/lvoRcbiAgICAgICAgICAgIGNvbnN0IHBvc3NpYmxlUGF0aHMgPSBbXG4gICAgICAgICAgICAgICAgcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksICcuLi8uLi9OZXdQcm9qZWN0XzMnLCBmc1BhdGgpLFxuICAgICAgICAgICAgICAgIHBhdGgucmVzb2x2ZSgnL1VzZXJzL2xpemhpeW9uZy9OZXdQcm9qZWN0XzMnLCBmc1BhdGgpLFxuICAgICAgICAgICAgICAgIHBhdGgucmVzb2x2ZShmc1BhdGgpLFxuICAgICAgICAgICAgICAgIC8vIOWmguaenOaYr+agueebruW9leS4i+eahOaWh+S7tu+8jOS5n+WwneivleebtOaOpei3r+W+hFxuICAgICAgICAgICAgICAgIHBhdGgucmVzb2x2ZSgnL1VzZXJzL2xpemhpeW9uZy9OZXdQcm9qZWN0XzMvYXNzZXRzJywgcGF0aC5iYXNlbmFtZShmc1BhdGgpKVxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coJ+Wwneivleivu+WPlumihOWItuS9k+aWh+S7tu+8jOi3r+W+hOi9rOaNojonLCB7XG4gICAgICAgICAgICAgICAgb3JpZ2luYWxQYXRoOiBwcmVmYWJQYXRoLFxuICAgICAgICAgICAgICAgIGZzUGF0aDogZnNQYXRoLFxuICAgICAgICAgICAgICAgIHBvc3NpYmxlUGF0aHM6IHBvc3NpYmxlUGF0aHNcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGZ1bGxQYXRoIG9mIHBvc3NpYmxlUGF0aHMpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhg5qOA5p+l6Lev5b6EOiAke2Z1bGxQYXRofWApO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhmdWxsUGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDmib7liLDmlofku7Y6ICR7ZnVsbFBhdGh9YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmdWxsUGF0aCwgJ3V0ZjgnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoZmlsZUNvbnRlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+aWh+S7tuino+aekOaIkOWKn++8jOaVsOaNrue7k+aehDonLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzRGF0YTogISFwYXJzZWQuZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhTGVuZ3RoOiBwYXJzZWQuZGF0YSA/IHBhcnNlZC5kYXRhLmxlbmd0aCA6IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlZDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDmlofku7bkuI3lrZjlnKg6ICR7ZnVsbFBhdGh9YCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChyZWFkRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGDor7vlj5bmlofku7blpLHotKUgJHtmdWxsUGF0aH06YCwgcmVhZEVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcign5peg5rOV5om+5Yiw5oiW6K+75Y+W6aKE5Yi25L2T5paH5Lu2Jyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCfor7vlj5bpooTliLbkvZPmlofku7blpLHotKU6JywgZXJyb3IpO1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHRyeUNyZWF0ZU5vZGVXaXRoUHJlZmFiKGFyZ3M6IGFueSk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBhc3NldEluZm86IGFueSA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3F1ZXJ5LWFzc2V0LWluZm8nLCBhcmdzLnByZWZhYlBhdGgpO1xuICAgICAgICAgICAgaWYgKCFhc3NldEluZm8pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ+mihOWItuS9k+acquaJvuWIsCcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyDmlrnms5UyOiDkvb/nlKggY3JlYXRlLW5vZGUg5oyH5a6a6aKE5Yi25L2T6LWE5rqQXG4gICAgICAgICAgICBjb25zdCBjcmVhdGVOb2RlT3B0aW9uczogYW55ID0ge1xuICAgICAgICAgICAgICAgIGFzc2V0VXVpZDogYXNzZXRJbmZvLnV1aWRcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIOiuvue9rueItuiKgueCuVxuICAgICAgICAgICAgaWYgKGFyZ3MucGFyZW50VXVpZCkge1xuICAgICAgICAgICAgICAgIGNyZWF0ZU5vZGVPcHRpb25zLnBhcmVudCA9IGFyZ3MucGFyZW50VXVpZDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qgbm9kZVV1aWQ6IHN0cmluZyB8IHN0cmluZ1tdID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAnY3JlYXRlLW5vZGUnLCBjcmVhdGVOb2RlT3B0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCB1dWlkID0gQXJyYXkuaXNBcnJheShub2RlVXVpZCkgPyBub2RlVXVpZFswXSA6IG5vZGVVdWlkO1xuXG4gICAgICAgICAgICAvLyDlpoLmnpzmjIflrprkuobkvY3nva7vvIzorr7nva7oioLngrnkvY3nva5cbiAgICAgICAgICAgIGlmIChhcmdzLnBvc2l0aW9uICYmIHV1aWQpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdzZXQtcHJvcGVydHknLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1dWlkOiB1dWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogJ3Bvc2l0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1bXA6IHsgdmFsdWU6IGFyZ3MucG9zaXRpb24gfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVV1aWQ6IHV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiUGF0aDogYXJncy5wcmVmYWJQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBhcmdzLnBvc2l0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICfpooTliLbkvZPlrp7kvovljJbmiJDlip/vvIjlpIfnlKjmlrnms5XvvInlubborr7nva7kuobkvY3nva4nXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVVdWlkOiB1dWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZWZhYlBhdGg6IGFyZ3MucHJlZmFiUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAn6aKE5Yi25L2T5a6e5L6L5YyW5oiQ5Yqf77yI5aSH55So5pa55rOV77yJ5L2G5L2N572u6K6+572u5aSx6LSlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVV1aWQ6IHV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVmYWJQYXRoOiBhcmdzLnByZWZhYlBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAn6aKE5Yi25L2T5a6e5L6L5YyW5oiQ5Yqf77yI5aSH55So5pa55rOV77yJJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGDlpIfnlKjpooTliLbkvZPlrp7kvovljJbmlrnms5XkuZ/lpLHotKU6ICR7ZXJyLm1lc3NhZ2V9YFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgdHJ5QWx0ZXJuYXRpdmVJbnN0YW50aWF0ZU1ldGhvZHMoYXJnczogYW55KTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIOaWueazlTE6IOWwneivleS9v+eUqCBjcmVhdGUtbm9kZSDnhLblkI7orr7nva7pooTliLbkvZNcbiAgICAgICAgICAgIGNvbnN0IGFzc2V0SW5mbyA9IGF3YWl0IHRoaXMuZ2V0QXNzZXRJbmZvKGFyZ3MucHJlZmFiUGF0aCk7XG4gICAgICAgICAgICBpZiAoIWFzc2V0SW5mbykge1xuICAgICAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ+aXoOazleiOt+WPlumihOWItuS9k+S/oeaBrycgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g5Yib5bu656m66IqC54K5XG4gICAgICAgICAgICBjb25zdCBjcmVhdGVSZXN1bHQgPSBhd2FpdCB0aGlzLmNyZWF0ZU5vZGUoYXJncy5wYXJlbnRVdWlkLCBhcmdzLnBvc2l0aW9uKTtcbiAgICAgICAgICAgIGlmICghY3JlYXRlUmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlUmVzdWx0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyDlsJ3or5XlsIbpooTliLbkvZPlupTnlKjliLDoioLngrlcbiAgICAgICAgICAgIGNvbnN0IGFwcGx5UmVzdWx0ID0gYXdhaXQgdGhpcy5hcHBseVByZWZhYlRvTm9kZShjcmVhdGVSZXN1bHQuZGF0YS5ub2RlVXVpZCwgYXNzZXRJbmZvLnV1aWQpO1xuICAgICAgICAgICAgaWYgKGFwcGx5UmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlVXVpZDogY3JlYXRlUmVzdWx0LmRhdGEubm9kZVV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjcmVhdGVSZXN1bHQuZGF0YS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ+mihOWItuS9k+WunuS+i+WMluaIkOWKn++8iOS9v+eUqOWkh+mAieaWueazle+8iSdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogJ+aXoOazleWwhumihOWItuS9k+W6lOeUqOWIsOiKgueCuScsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVVdWlkOiBjcmVhdGVSZXN1bHQuZGF0YS5ub2RlVXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICflt7LliJvlu7roioLngrnvvIzkvYbml6Dms5XlupTnlKjpooTliLbkvZPmlbDmja4nXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGDlpIfpgInlrp7kvovljJbmlrnms5XlpLHotKU6ICR7ZXJyb3J9YCB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBnZXRBc3NldEluZm8ocHJlZmFiUGF0aDogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGFzc2V0SW5mbyA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3F1ZXJ5LWFzc2V0LWluZm8nLCBwcmVmYWJQYXRoKTtcbiAgICAgICAgICAgIHJldHVybiBhc3NldEluZm87XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGNyZWF0ZU5vZGUocGFyZW50VXVpZD86IHN0cmluZywgcG9zaXRpb24/OiBhbnkpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgY3JlYXRlTm9kZU9wdGlvbnM6IGFueSA9IHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnUHJlZmFiSW5zdGFuY2UnXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyDorr7nva7niLboioLngrlcbiAgICAgICAgICAgIGlmIChwYXJlbnRVdWlkKSB7XG4gICAgICAgICAgICAgICAgY3JlYXRlTm9kZU9wdGlvbnMucGFyZW50ID0gcGFyZW50VXVpZDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g6K6+572u5L2N572uXG4gICAgICAgICAgICBpZiAocG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICBjcmVhdGVOb2RlT3B0aW9ucy5kdW1wID0ge1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogcG9zaXRpb25cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBub2RlVXVpZDogc3RyaW5nIHwgc3RyaW5nW10gPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdjcmVhdGUtbm9kZScsIGNyZWF0ZU5vZGVPcHRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IHV1aWQgPSBBcnJheS5pc0FycmF5KG5vZGVVdWlkKSA/IG5vZGVVdWlkWzBdIDogbm9kZVV1aWQ7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBub2RlVXVpZDogdXVpZCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ1ByZWZhYkluc3RhbmNlJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB8fCAn5Yib5bu66IqC54K55aSx6LSlJyB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBhcHBseVByZWZhYlRvTm9kZShub2RlVXVpZDogc3RyaW5nLCBwcmVmYWJVdWlkOiBzdHJpbmcpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICAvLyDlsJ3or5XlpJrnp43mlrnms5XmnaXlupTnlKjpooTliLbkvZPmlbDmja5cbiAgICAgICAgY29uc3QgbWV0aG9kcyA9IFtcbiAgICAgICAgICAgICgpID0+IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ2FwcGx5LXByZWZhYicsIHsgbm9kZTogbm9kZVV1aWQsIHByZWZhYjogcHJlZmFiVXVpZCB9KSxcbiAgICAgICAgICAgICgpID0+IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3NldC1wcmVmYWInLCB7IG5vZGU6IG5vZGVVdWlkLCBwcmVmYWI6IHByZWZhYlV1aWQgfSksXG4gICAgICAgICAgICAoKSA9PiBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdsb2FkLXByZWZhYi10by1ub2RlJywgeyBub2RlOiBub2RlVXVpZCwgcHJlZmFiOiBwcmVmYWJVdWlkIH0pXG4gICAgICAgIF07XG5cbiAgICAgICAgZm9yIChjb25zdCBtZXRob2Qgb2YgbWV0aG9kcykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCBtZXRob2QoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XG4gICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICAvLyB0cnkgbmV4dCBtZXRob2RcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICfml6Dms5XlupTnlKjpooTliLbkvZPmlbDmja4nIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5L2/55SoIGFzc2V0LWRiIEFQSSDliJvlu7rpooTliLbkvZPnmoTmlrDmlrnms5VcbiAgICAgKiDmt7HluqbmlbTlkIjlvJXmk47nmoTotYTmupDnrqHnkIbns7vnu5/vvIzlrp7njrDlrozmlbTnmoTpooTliLbkvZPliJvlu7rmtYHnqItcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDkvb/nlKggYXNzZXQtZGIgQVBJIOWIm+W7uumihOWItuS9k+eahOaWsOaWueazlVxuICAgICAqIOa3seW6puaVtOWQiOW8leaTjueahOi1hOa6kOeuoeeQhuezu+e7n++8jOWunueOsOWujOaVtOeahOmihOWItuS9k+WIm+W7uua1geeoi1xuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgY3JlYXRlUHJlZmFiV2l0aEFzc2V0REIobm9kZVV1aWQ6IHN0cmluZywgc2F2ZVBhdGg6IHN0cmluZywgcHJlZmFiTmFtZTogc3RyaW5nLCBpbmNsdWRlQ2hpbGRyZW46IGJvb2xlYW4sIGluY2x1ZGVDb21wb25lbnRzOiBib29sZWFuKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCc9PT0g5L2/55SoIEFzc2V0LURCIEFQSSDliJvlu7rpooTliLbkvZMgPT09Jyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg6IqC54K5VVVJRDogJHtub2RlVXVpZH1gKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDkv53lrZjot6/lvoQ6ICR7c2F2ZVBhdGh9YCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg6aKE5Yi25L2T5ZCN56ewOiAke3ByZWZhYk5hbWV9YCk7XG5cbiAgICAgICAgICAgIC8vIOesrOS4gOatpe+8muiOt+WPluiKgueCueaVsOaNru+8iOWMheaLrOWPmOaNouWxnuaAp++8iVxuICAgICAgICAgICAgY29uc3Qgbm9kZURhdGEgPSBhd2FpdCB0aGlzLmdldE5vZGVEYXRhKG5vZGVVdWlkKTtcbiAgICAgICAgICAgIGlmICghbm9kZURhdGEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6ICfml6Dms5Xojrflj5boioLngrnmlbDmja4nXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc29sZS5sb2coJ+iOt+WPluWIsOiKgueCueaVsOaNru+8jOWtkOiKgueCueaVsOmHjzonLCBub2RlRGF0YS5jaGlsZHJlbiA/IG5vZGVEYXRhLmNoaWxkcmVuLmxlbmd0aCA6IDApO1xuXG4gICAgICAgICAgICAvLyDnrKzkuozmraXvvJrlhYjliJvlu7rotYTmupDmlofku7bku6Xojrflj5blvJXmk47liIbphY3nmoRVVUlEXG4gICAgICAgICAgICBjb25zb2xlLmxvZygn5Yib5bu66aKE5Yi25L2T6LWE5rqQ5paH5Lu2Li4uJyk7XG4gICAgICAgICAgICBjb25zdCB0ZW1wUHJlZmFiQ29udGVudCA9IEpTT04uc3RyaW5naWZ5KFt7XCJfX3R5cGVfX1wiOiBcImNjLlByZWZhYlwiLCBcIl9uYW1lXCI6IHByZWZhYk5hbWV9XSwgbnVsbCwgMik7XG4gICAgICAgICAgICBjb25zdCBjcmVhdGVSZXN1bHQgPSBhd2FpdCB0aGlzLmNyZWF0ZUFzc2V0V2l0aEFzc2V0REIoc2F2ZVBhdGgsIHRlbXBQcmVmYWJDb250ZW50KTtcbiAgICAgICAgICAgIGlmICghY3JlYXRlUmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3JlYXRlUmVzdWx0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyDojrflj5blvJXmk47liIbphY3nmoTlrp7pmYVVVUlEXG4gICAgICAgICAgICBjb25zdCBhY3R1YWxQcmVmYWJVdWlkID0gY3JlYXRlUmVzdWx0LmRhdGE/LnV1aWQ7XG4gICAgICAgICAgICBpZiAoIWFjdHVhbFByZWZhYlV1aWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6ICfml6Dms5Xojrflj5blvJXmk47liIbphY3nmoTpooTliLbkvZNVVUlEJ1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZygn5byV5pOO5YiG6YWN55qEVVVJRDonLCBhY3R1YWxQcmVmYWJVdWlkKTtcblxuICAgICAgICAgICAgLy8g56ys5LiJ5q2l77ya5L2/55So5a6e6ZmFVVVJROmHjeaWsOeUn+aIkOmihOWItuS9k+WGheWuuVxuICAgICAgICAgICAgY29uc3QgcHJlZmFiQ29udGVudCA9IGF3YWl0IHRoaXMuY3JlYXRlU3RhbmRhcmRQcmVmYWJDb250ZW50KG5vZGVEYXRhLCBwcmVmYWJOYW1lLCBhY3R1YWxQcmVmYWJVdWlkLCBpbmNsdWRlQ2hpbGRyZW4sIGluY2x1ZGVDb21wb25lbnRzKTtcbiAgICAgICAgICAgIGNvbnN0IHByZWZhYkNvbnRlbnRTdHJpbmcgPSBKU09OLnN0cmluZ2lmeShwcmVmYWJDb250ZW50LCBudWxsLCAyKTtcblxuICAgICAgICAgICAgLy8g56ys5Zub5q2l77ya5pu05paw6aKE5Yi25L2T5paH5Lu25YaF5a65XG4gICAgICAgICAgICBjb25zb2xlLmxvZygn5pu05paw6aKE5Yi25L2T5paH5Lu25YaF5a65Li4uJyk7XG4gICAgICAgICAgICBjb25zdCB1cGRhdGVSZXN1bHQgPSBhd2FpdCB0aGlzLnVwZGF0ZUFzc2V0V2l0aEFzc2V0REIoc2F2ZVBhdGgsIHByZWZhYkNvbnRlbnRTdHJpbmcpO1xuXG4gICAgICAgICAgICAvLyDnrKzkupTmraXvvJrliJvlu7rlr7nlupTnmoRtZXRh5paH5Lu277yI5L2/55So5a6e6ZmFVVVJRO+8iVxuICAgICAgICAgICAgY29uc29sZS5sb2coJ+WIm+W7uumihOWItuS9k21ldGHmlofku7YuLi4nKTtcbiAgICAgICAgICAgIGNvbnN0IG1ldGFDb250ZW50ID0gdGhpcy5jcmVhdGVTdGFuZGFyZE1ldGFDb250ZW50KHByZWZhYk5hbWUsIGFjdHVhbFByZWZhYlV1aWQpO1xuICAgICAgICAgICAgY29uc3QgbWV0YVJlc3VsdCA9IGF3YWl0IHRoaXMuY3JlYXRlTWV0YVdpdGhBc3NldERCKHNhdmVQYXRoLCBtZXRhQ29udGVudCk7XG5cbiAgICAgICAgICAgIC8vIOesrOWFreatpe+8mumHjeaWsOWvvOWFpei1hOa6kOS7peabtOaWsOW8leeUqFxuICAgICAgICAgICAgY29uc29sZS5sb2coJ+mHjeaWsOWvvOWFpemihOWItuS9k+i1hOa6kC4uLicpO1xuICAgICAgICAgICAgY29uc3QgcmVpbXBvcnRSZXN1bHQgPSBhd2FpdCB0aGlzLnJlaW1wb3J0QXNzZXRXaXRoQXNzZXREQihzYXZlUGF0aCk7XG5cbiAgICAgICAgICAgIC8vIOesrOS4g+atpe+8muWwneivleWwhuWOn+Wni+iKgueCuei9rOaNouS4uumihOWItuS9k+WunuS+i1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ+WwneivleWwhuWOn+Wni+iKgueCuei9rOaNouS4uumihOWItuS9k+WunuS+iy4uLicpO1xuICAgICAgICAgICAgY29uc3QgY29udmVydFJlc3VsdCA9IGF3YWl0IHRoaXMuY29udmVydE5vZGVUb1ByZWZhYkluc3RhbmNlKG5vZGVVdWlkLCBhY3R1YWxQcmVmYWJVdWlkLCBzYXZlUGF0aCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIHByZWZhYlV1aWQ6IGFjdHVhbFByZWZhYlV1aWQsXG4gICAgICAgICAgICAgICAgICAgIHByZWZhYlBhdGg6IHNhdmVQYXRoLFxuICAgICAgICAgICAgICAgICAgICBub2RlVXVpZDogbm9kZVV1aWQsXG4gICAgICAgICAgICAgICAgICAgIHByZWZhYk5hbWU6IHByZWZhYk5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGNvbnZlcnRlZFRvUHJlZmFiSW5zdGFuY2U6IGNvbnZlcnRSZXN1bHQuc3VjY2VzcyxcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlQXNzZXRSZXN1bHQ6IGNyZWF0ZVJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlUmVzdWx0OiB1cGRhdGVSZXN1bHQsXG4gICAgICAgICAgICAgICAgICAgIG1ldGFSZXN1bHQ6IG1ldGFSZXN1bHQsXG4gICAgICAgICAgICAgICAgICAgIHJlaW1wb3J0UmVzdWx0OiByZWltcG9ydFJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgY29udmVydFJlc3VsdDogY29udmVydFJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogY29udmVydFJlc3VsdC5zdWNjZXNzID8gJ+mihOWItuS9k+WIm+W7uuW5tuaIkOWKn+i9rOaNouWOn+Wni+iKgueCuScgOiAn6aKE5Yi25L2T5Yib5bu65oiQ5Yqf77yM5L2G6IqC54K56L2s5o2i5aSx6LSlJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+WIm+W7uumihOWItuS9k+aXtuWPkeeUn+mUmeivrzonLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yOiBg5Yib5bu66aKE5Yi25L2T5aSx6LSlOiAke2Vycm9yfWBcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGNyZWF0ZVByZWZhYihhcmdzOiBhbnkpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8g5pSv5oyBIHByZWZhYlBhdGgg5ZKMIHNhdmVQYXRoIOS4pOenjeWPguaVsOWQjVxuICAgICAgICAgICAgY29uc3QgcGF0aFBhcmFtID0gYXJncy5wcmVmYWJQYXRoIHx8IGFyZ3Muc2F2ZVBhdGg7XG4gICAgICAgICAgICBpZiAoIXBhdGhQYXJhbSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogJ+e8uuWwkemihOWItuS9k+i3r+W+hOWPguaVsOOAguivt+aPkOS+myBwcmVmYWJQYXRoIOaIliBzYXZlUGF0aOOAgidcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBwcmVmYWJOYW1lID0gYXJncy5wcmVmYWJOYW1lIHx8ICdOZXdQcmVmYWInO1xuICAgICAgICAgICAgY29uc3QgZnVsbFBhdGggPSBwYXRoUGFyYW0uZW5kc1dpdGgoJy5wcmVmYWInKSA/XG4gICAgICAgICAgICAgICAgcGF0aFBhcmFtIDogYCR7cGF0aFBhcmFtfS8ke3ByZWZhYk5hbWV9LnByZWZhYmA7XG5cbiAgICAgICAgICAgIC8vIOiusOW9leaSpOmUgOaTjeS9nFxuICAgICAgICAgICAgYXdhaXQgdGhpcy5yZWNvcmRVbmRvT3BlcmF0aW9uKCdjcmVhdGUtcHJlZmFiJywgYXJncy5ub2RlVXVpZCk7XG5cbiAgICAgICAgICAgIC8vIOS8mOWFiOS9v+eUqOe8lui+keWZqOagh+WHhuaWueazlTogc2NlbmUuY3JlYXRlLXByZWZhYlxuICAgICAgICAgICAgY29uc29sZS5sb2coJ+S9v+eUqOe8lui+keWZqOagh+WHhuaWueazleWIm+W7uumihOWItuS9ky4uLicpO1xuICAgICAgICAgICAgY29uc3Qgc2NlbmVSZXN1bHQgPSBhd2FpdCB0aGlzLmNyZWF0ZVByZWZhYldpdGhTY2VuZShhcmdzLm5vZGVVdWlkLCBmdWxsUGF0aCwgcHJlZmFiTmFtZSk7XG5cbiAgICAgICAgICAgIGlmIChzY2VuZVJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgLy8g5Yib5bu65oiQ5Yqf5ZCO56uL5Y2z5Yi35paw6LWE5rqQXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5yZWZyZXNoQXNzZXRzKGZ1bGxQYXRoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2NlbmVSZXN1bHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOWbnumAgOWIsCBhc3NldC1kYiDmlrnms5VcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzY2VuZeaWueazleWksei0pe+8jOS9v+eUqGFzc2V0LWRi5pa55rOVLi4uJyk7XG4gICAgICAgICAgICBjb25zdCBhc3NldERiUmVzdWx0ID0gYXdhaXQgdGhpcy5jcmVhdGVQcmVmYWJXaXRoQXNzZXREQihcbiAgICAgICAgICAgICAgICBhcmdzLm5vZGVVdWlkLFxuICAgICAgICAgICAgICAgIGZ1bGxQYXRoLFxuICAgICAgICAgICAgICAgIHByZWZhYk5hbWUsXG4gICAgICAgICAgICAgICAgdHJ1ZSwgLy8gaW5jbHVkZUNoaWxkcmVuXG4gICAgICAgICAgICAgICAgdHJ1ZSAgLy8gaW5jbHVkZUNvbXBvbmVudHNcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGlmIChhc3NldERiUmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnJlZnJlc2hBc3NldHMoZnVsbFBhdGgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBhc3NldERiUmVzdWx0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyDmnIDlkI7kvb/nlKjoh6rlrprkuYnlrp7njrBcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhc3NldC1kYuaWueazleWksei0pe+8jOS9v+eUqOiHquWumuS5ieWunueOsC4uLicpO1xuICAgICAgICAgICAgY29uc3QgY3VzdG9tUmVzdWx0ID0gYXdhaXQgdGhpcy5jcmVhdGVQcmVmYWJDdXN0b20oYXJncy5ub2RlVXVpZCwgZnVsbFBhdGgsIHByZWZhYk5hbWUpO1xuICAgICAgICAgICAgaWYgKGN1c3RvbVJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5yZWZyZXNoQXNzZXRzKGZ1bGxQYXRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjdXN0b21SZXN1bHQ7XG5cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGDliJvlu7rpooTliLbkvZPml7blj5HnlJ/plJnor686ICR7ZXJyb3J9YFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOS9v+eUqOe8lui+keWZqOagh+WHhueahCBzY2VuZS5jcmVhdGUtcHJlZmFiIOaWueazlVxuICAgIC8vIOS9v+eUqOe8lui+keWZqOagh+WHhueahCBzY2VuZS5jcmVhdGUtcHJlZmFiIOaWueazlVxuICAgIHByaXZhdGUgYXN5bmMgY3JlYXRlUHJlZmFiV2l0aFNjZW5lKG5vZGVVdWlkOiBzdHJpbmcsIHByZWZhYlBhdGg6IHN0cmluZywgcHJlZmFiTmFtZTogc3RyaW5nKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbREVCVUddIENyZWF0aW5nIHByZWZhYiB3aXRoIHNjZW5lIEFQSTogbm9kZVV1aWQ9JHtub2RlVXVpZH0sIHByZWZhYlBhdGg9JHtwcmVmYWJQYXRofWApO1xuXG4gICAgICAgICAgICAvLyDnoa7kv53nm67lvZXlrZjlnKhcbiAgICAgICAgICAgIGNvbnN0IGRpclBhdGggPSBwcmVmYWJQYXRoLnN1YnN0cmluZygwLCBwcmVmYWJQYXRoLmxhc3RJbmRleE9mKCcvJykpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtERUJVR10gRW5zdXJpbmcgZGlyZWN0b3J5IGV4aXN0czogJHtkaXJQYXRofWApO1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ2NyZWF0ZS1hc3NldCcsIGRpclBhdGgsIG51bGwpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbREVCVUddIERpcmVjdG9yeSBjcmVhdGlvbiBhdHRlbXB0ZWQ6ICR7ZGlyUGF0aH1gKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGRpckVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtERUJVR10gRGlyZWN0b3J5IGNyZWF0aW9uIGZhaWxlZCBvciBhbHJlYWR5IGV4aXN0czogJHtkaXJFcnJvcn1gKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAnY3JlYXRlLXByZWZhYicsIHtcbiAgICAgICAgICAgICAgICBub2RlVXVpZDogbm9kZVV1aWQsXG4gICAgICAgICAgICAgICAgdXJsOiBwcmVmYWJQYXRoXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tERUJVR10gc2NlbmUuY3JlYXRlLXByZWZhYiByZXN1bHQ6JywgcmVzdWx0KTtcblxuICAgICAgICAgICAgLy8g6aqM6K+B6aKE5Yi25L2T5piv5ZCm55yf55qE5Yib5bu65oiQ5YqfXG4gICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgNTAwKSk7IC8vIOetieW+heaWh+S7tuezu+e7n+WQjOatpVxuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFzc2V0SW5mbyA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3F1ZXJ5LWFzc2V0LWluZm8nLCBwcmVmYWJQYXRoKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW0RFQlVHXSBBc3NldCB2ZXJpZmljYXRpb24gcmVzdWx0OicsIGFzc2V0SW5mbyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoYXNzZXRJbmZvICYmIGFzc2V0SW5mby51dWlkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbREVCVUddIFByZWZhYiBjcmVhdGlvbiB2ZXJpZmllZCBzdWNjZXNzZnVsbHknKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiUGF0aDogcHJlZmFiUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVmYWJOYW1lOiBwcmVmYWJOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVVdWlkOiBub2RlVXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NldFV1aWQ6IGFzc2V0SW5mby51dWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdQcmVmYWIgY3JlYXRlZCBzdWNjZXNzZnVsbHkgd2l0aCBzY2VuZSBBUEknXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tERUJVR10gUHJlZmFiIGNyZWF0aW9uIGZhaWxlZCAtIGFzc2V0IG5vdCBmb3VuZCBhZnRlciBjcmVhdGlvbicpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogJ1ByZWZhYiBjcmVhdGlvbiBhcHBlYXJlZCBzdWNjZXNzZnVsIGJ1dCBhc3NldCB3YXMgbm90IGZvdW5kLiBGaWxlIG1heSBub3QgaGF2ZSBiZWVuIGNyZWF0ZWQuJ1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKHZlcmlmeUVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tERUJVR10gQXNzZXQgdmVyaWZpY2F0aW9uIGZhaWxlZDonLCB2ZXJpZnlFcnJvcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBgUHJlZmFiIGNyZWF0aW9uIHZlcmlmaWNhdGlvbiBmYWlsZWQ6ICR7dmVyaWZ5RXJyb3J9YFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tERUJVR10gc2NlbmUuY3JlYXRlLXByZWZhYiBmYWlsZWQ6JywgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogYFNjZW5lIEFQSSBwcmVmYWIgY3JlYXRpb24gZmFpbGVkOiAke2Vycm9yLm1lc3NhZ2UgfHwgZXJyb3J9YFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOiusOW9leaSpOmUgOaTjeS9nCAtIOaaguaXtuemgeeUqO+8jOWboOS4ukFQSeS4jeWtmOWcqFxuICAgIHByaXZhdGUgYXN5bmMgcmVjb3JkVW5kb09wZXJhdGlvbihvcGVyYXRpb246IHN0cmluZywgbm9kZVV1aWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8g5pqC5pe25rOo6YeK5o6J5LiN5a2Y5Zyo55qEQVBJ6LCD55SoXG4gICAgICAgICAgICAvLyBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICd1bmRvLnJlY29yZCcsIHtcbiAgICAgICAgICAgIC8vICAgICBvcGVyYXRpb246IG9wZXJhdGlvbixcbiAgICAgICAgICAgIC8vICAgICBub2RlVXVpZDogbm9kZVV1aWQsXG4gICAgICAgICAgICAvLyAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpXG4gICAgICAgICAgICAvLyB9KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDmkqTplIDorrDlvZXot7Pov4cgKEFQSeS4jeWtmOWcqCk6ICR7b3BlcmF0aW9ufSBmb3IgJHtub2RlVXVpZH1gKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDmkqTplIDorrDlvZXkv53lrZjlpLHotKU6ICR7ZXJyb3J9YCk7XG4gICAgICAgICAgICAvLyDkuI3pmLvmlq3kuLvmtYHnqItcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOWIt+aWsOi1hOa6kCAtIOS8mOWMlueJiOacrO+8jOmBv+WFjeS4jeW/heimgeeahOWFqOWxgOWIt+aWsFxuICAgIHByaXZhdGUgYXN5bmMgcmVmcmVzaEFzc2V0cyhhc3NldFBhdGg/OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChhc3NldFBhdGgpIHtcbiAgICAgICAgICAgICAgICAvLyDliLfmlrDnibnlrprotYTmupBcbiAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdyZWZyZXNoLWFzc2V0JywgYXNzZXRQYXRoKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhg6LWE5rqQ5Yi35paw5oiQ5YqfOiAke2Fzc2V0UGF0aH1gKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8g6YG/5YWN5YWo5bGA5Yi35paw77yM5Y+q5Yi35paw6LWE5rqQ55uu5b2VXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+i3s+i/h+WFqOWxgOi1hOa6kOWIt+aWsO+8jOmBv+WFjee8lui+keWZqOmHjeaWsOWKoOi9vScpO1xuICAgICAgICAgICAgICAgIC8vIOWmguaenOehruWunumcgOimgeWIt+aWsO+8jOWPr+S7peaJi+WKqOiwg+eUqO+8mlxuICAgICAgICAgICAgICAgIC8vIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3JlZnJlc2gnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDotYTmupDliLfmlrDlpLHotKU6ICR7ZXJyb3J9YCk7XG4gICAgICAgICAgICAvLyDkuI3pmLvmlq3kuLvmtYHnqItcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOS9v+eUqOe8lui+keWZqOagh+WHhua1geeoi+WunuS+i+WMlumihOWItuS9k1xuICAgIC8vIOS9v+eUqOe8lui+keWZqOagh+WHhua1geeoi+WunuS+i+WMlumihOWItuS9k1xuICAgIHByaXZhdGUgYXN5bmMgaW5zdGFudGlhdGVQcmVmYWJTdGFuZGFyZChhcmdzOiBhbnksIGFzc2V0SW5mbzogYW55KTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudFV1aWQgPSBhcmdzLnBhcmVudFV1aWQgfHwgJ2FlNDZhM2JiLTU0ODMtNDNkYy04MTUyLThjNWU0MmEwYTlhYSc7IC8vIOm7mOiupOWcuuaZr+agueiKgueCuVxuXG4gICAgICAgICAgICAvLyAxLiDlvIDlp4vorrDlvZVcbiAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ2JlZ2luLXJlY29yZGluZycsIFtwYXJlbnRVdWlkXSk7XG5cbiAgICAgICAgICAgIC8vIDIuIOWIm+W7uuiKgueCue+8iOS9v+eUqGFzc2V0VXVpZOWPguaVsO+8iVxuICAgICAgICAgICAgY29uc3QgY3JlYXRlTm9kZU9wdGlvbnM6IGFueSA9IHtcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IHBhcmVudFV1aWQsXG4gICAgICAgICAgICAgICAgYXNzZXRVdWlkOiBhc3NldEluZm8udXVpZCxcbiAgICAgICAgICAgICAgICBuYW1lOiBhcmdzLm5hbWUgfHwgYXNzZXRJbmZvLm5hbWUgfHwgJ1ByZWZhYkluc3RhbmNlJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnY2MuUHJlZmFiJ1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3Qgbm9kZVV1aWQgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdjcmVhdGUtbm9kZScsIGNyZWF0ZU5vZGVPcHRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IHV1aWQgPSBBcnJheS5pc0FycmF5KG5vZGVVdWlkKSA/IG5vZGVVdWlkWzBdIDogbm9kZVV1aWQ7XG5cbiAgICAgICAgICAgIC8vIDMuIOWmguaenOacieS9jee9ruWPguaVsO+8jOiwg+aVtOiKgueCueS9jee9rlxuICAgICAgICAgICAgaWYgKGFyZ3MucG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdzZXQtcHJvcGVydHknLCB7XG4gICAgICAgICAgICAgICAgICAgIHV1aWQ6IHV1aWQsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6ICdwb3NpdGlvbicsXG4gICAgICAgICAgICAgICAgICAgIGR1bXA6IHsgdmFsdWU6IGFyZ3MucG9zaXRpb24gfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyA0LiDlpoLmnpzpnIDopoHosIPmlbTlnKjniLboioLngrnkuK3nmoTpobrluo9cbiAgICAgICAgICAgIGlmIChhcmdzLnNpYmxpbmdJbmRleCAhPT0gdW5kZWZpbmVkICYmIGFyZ3Muc2libGluZ0luZGV4ID49IDApIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdtb3ZlLWFycmF5LWVsZW1lbnQnLCB7XG4gICAgICAgICAgICAgICAgICAgIHV1aWQ6IHBhcmVudFV1aWQsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6ICdjaGlsZHJlbicsXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldDogYXJncy5zaWJsaW5nSW5kZXgsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogMFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyA1LiDnu5PmnZ/orrDlvZVcbiAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ2VuZC1yZWNvcmRpbmcnLCBbYGluc3RhbnRpYXRlLSR7RGF0ZS5ub3coKX1gXSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVVdWlkOiB1dWlkLFxuICAgICAgICAgICAgICAgICAgICBwcmVmYWJQYXRoOiBhcmdzLnByZWZhYlBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudFV1aWQ6IHBhcmVudFV1aWQsXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBhcmdzLnBvc2l0aW9uLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAn6aKE5Yi25L2T5a6e5L6L5YyW5oiQ5Yqf77yI5L2/55So57yW6L6R5Zmo5qCH5YeG5rWB56iL77yJJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfnvJbovpHlmajmoIflh4bmtYHnqIvlpLHotKU6JywgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogYOe8lui+keWZqOagh+WHhua1geeoi+Wksei0pTogJHtlcnJvcn1gXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8g566A5YyW55qE5a6e5L6L5YyW5pa55rOVXG4gICAgLy8g566A5YyW55qE5a6e5L6L5YyW5pa55rOVXG4gICAgcHJpdmF0ZSBhc3luYyBpbnN0YW50aWF0ZVByZWZhYlNpbXBsZShhcmdzOiBhbnksIGFzc2V0SW5mbzogYW55KTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIOS9v+eUqOeugOWMlueahCBjcmVhdGUtbm9kZSBBUElcbiAgICAgICAgICAgIGNvbnN0IGNyZWF0ZU5vZGVPcHRpb25zOiBhbnkgPSB7XG4gICAgICAgICAgICAgICAgYXNzZXRVdWlkOiBhc3NldEluZm8udXVpZFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8g6K6+572u54i26IqC54K5XG4gICAgICAgICAgICBpZiAoYXJncy5wYXJlbnRVdWlkKSB7XG4gICAgICAgICAgICAgICAgY3JlYXRlTm9kZU9wdGlvbnMucGFyZW50ID0gYXJncy5wYXJlbnRVdWlkO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyDorr7nva7oioLngrnlkI3np7BcbiAgICAgICAgICAgIGlmIChhcmdzLm5hbWUpIHtcbiAgICAgICAgICAgICAgICBjcmVhdGVOb2RlT3B0aW9ucy5uYW1lID0gYXJncy5uYW1lO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhc3NldEluZm8ubmFtZSkge1xuICAgICAgICAgICAgICAgIGNyZWF0ZU5vZGVPcHRpb25zLm5hbWUgPSBhc3NldEluZm8ubmFtZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g6K6+572u5Yid5aeL5bGe5oCn77yI5aaC5L2N572u77yJXG4gICAgICAgICAgICBpZiAoYXJncy5wb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIGNyZWF0ZU5vZGVPcHRpb25zLmR1bXAgPSB7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYXJncy5wb3NpdGlvblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g5Yib5bu66IqC54K5XG4gICAgICAgICAgICBjb25zdCBub2RlVXVpZCA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ2NyZWF0ZS1ub2RlJywgY3JlYXRlTm9kZU9wdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgdXVpZCA9IEFycmF5LmlzQXJyYXkobm9kZVV1aWQpID8gbm9kZVV1aWRbMF0gOiBub2RlVXVpZDtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coJ+eugOWMluaWueazlemihOWItuS9k+iKgueCueWIm+W7uuaIkOWKnzonLCB7XG4gICAgICAgICAgICAgICAgbm9kZVV1aWQ6IHV1aWQsXG4gICAgICAgICAgICAgICAgcHJlZmFiVXVpZDogYXNzZXRJbmZvLnV1aWQsXG4gICAgICAgICAgICAgICAgcHJlZmFiUGF0aDogYXJncy5wcmVmYWJQYXRoXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZVV1aWQ6IHV1aWQsXG4gICAgICAgICAgICAgICAgICAgIHByZWZhYlBhdGg6IGFyZ3MucHJlZmFiUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50VXVpZDogYXJncy5wYXJlbnRVdWlkLFxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogYXJncy5wb3NpdGlvbixcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ+mihOWItuS9k+WunuS+i+WMluaIkOWKn++8iOS9v+eUqOeugOWMluaWueazle+8iSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yOiBg566A5YyW5pa55rOV5aSx6LSlOiAke2Vycm9yfWBcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAxLiBQcmVmYWIgYnJvd3NlIGhhbmRsZXJcbiAgICBwcml2YXRlIGFzeW5jIGhhbmRsZVByZWZhYkJyb3dzZShhcmdzOiBhbnkpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBhY3Rpb24gfSA9IGFyZ3M7XG5cbiAgICAgICAgICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnbGlzdCc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFByZWZhYkxpc3QoYXJncy5mb2xkZXIpO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2luZm8nOlxuICAgICAgICAgICAgICAgICAgICBpZiAoIWFyZ3MucHJlZmFiUGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAncHJlZmFiUGF0aCByZXF1aXJlZCBmb3IgaW5mbyBhY3Rpb24nIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0UHJlZmFiSW5mbyhhcmdzLnByZWZhYlBhdGgpO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3ZhbGlkYXRlJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFhcmdzLnByZWZhYlBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ3ByZWZhYlBhdGggcmVxdWlyZWQgZm9yIHZhbGlkYXRlIGFjdGlvbicgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy52YWxpZGF0ZVByZWZhYihhcmdzLnByZWZhYlBhdGgpO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFVuc3VwcG9ydGVkIGJyb3dzZSBhY3Rpb246ICR7YWN0aW9ufWAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEJyb3dzZSBvcGVyYXRpb24gZmFpbGVkOiAke2Vycm9yfWAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIDIuIFByZWZhYiBsaWZlY3ljbGUgaGFuZGxlclxuICAgIHByaXZhdGUgYXN5bmMgaGFuZGxlUHJlZmFiTGlmZWN5Y2xlKGFyZ3M6IGFueSk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IGFjdGlvbiB9ID0gYXJncztcblxuICAgICAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBjYXNlICdjcmVhdGUnOlxuICAgICAgICAgICAgICAgICAgICBpZiAoIWFyZ3Mubm9kZVV1aWQgfHwgIWFyZ3MucHJlZmFiTmFtZSB8fCAhYXJncy5zYXZlUGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnbm9kZVV1aWQsIHByZWZhYk5hbWUsIHNhdmVQYXRoIHJlcXVpcmVkIGZvciBjcmVhdGUnIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY3JlYXRlUmVzdWx0ID0gYXdhaXQgdGhpcy5jcmVhdGVQcmVmYWIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVV1aWQ6IGFyZ3Mubm9kZVV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVmYWJOYW1lOiBhcmdzLnByZWZhYk5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlUGF0aDogYXJncy5zYXZlUGF0aFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNyZWF0ZVJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVmYWJQYXRoOiBhcmdzLnNhdmVQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAn4pyFIFByZWZhYiBjcmVhdGVkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZVJlc3VsdDtcbiAgICAgICAgICAgICAgICBjYXNlICdkZWxldGUnOlxuICAgICAgICAgICAgICAgICAgICBpZiAoIWFyZ3MucHJlZmFiUGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAncHJlZmFiUGF0aCByZXF1aXJlZCBmb3IgZGVsZXRlJyB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdkZWxldGUtYXNzZXQnLCBhcmdzLnByZWZhYlBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5yZWZyZXNoQXNzZXRzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogeyBtZXNzYWdlOiAn4pyFIFByZWZhYiBkZWxldGVkJyB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRGVsZXRlIGZhaWxlZDogJHtlcnJvcn1gIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBVbnN1cHBvcnRlZCBsaWZlY3ljbGUgYWN0aW9uOiAke2FjdGlvbn1gIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBMaWZlY3ljbGUgb3BlcmF0aW9uIGZhaWxlZDogJHtlcnJvcn1gIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAzLiBQcmVmYWIgaW5zdGFuY2UgaGFuZGxlclxuICAgIHByaXZhdGUgYXN5bmMgaGFuZGxlUHJlZmFiSW5zdGFuY2UoYXJnczogYW55KTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgYWN0aW9uIH0gPSBhcmdzO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2luc3RhbnRpYXRlJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFhcmdzLnByZWZhYlBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ3ByZWZhYlBhdGggcmVxdWlyZWQgZm9yIGluc3RhbnRpYXRlJyB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGluc3RhbnRpYXRlUmVzdWx0ID0gYXdhaXQgdGhpcy5pbnN0YW50aWF0ZVByZWZhYih7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVmYWJQYXRoOiBhcmdzLnByZWZhYlBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRVdWlkOiBhcmdzLnBhcmVudFV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogYXJncy5wb3NpdGlvblxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluc3RhbnRpYXRlUmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVVdWlkOiBpbnN0YW50aWF0ZVJlc3VsdC5kYXRhLm5vZGVVdWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAn4pyFIFByZWZhYiBpbnN0YW50aWF0ZWQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFudGlhdGVSZXN1bHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAndW5saW5rJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFhcmdzLm5vZGVVdWlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdub2RlVXVpZCByZXF1aXJlZCBmb3IgdW5saW5rJyB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVubGlua1Jlc3VsdCA9IGF3YWl0IHRoaXMudW5saW5rUHJlZmFiKGFyZ3Mubm9kZVV1aWQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodW5saW5rUmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7IG1lc3NhZ2U6ICfinIUgUHJlZmFiIHVubGlua2VkJyB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB1bmxpbmtSZXN1bHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnYXBwbHknOlxuICAgICAgICAgICAgICAgICAgICBpZiAoIWFyZ3Mubm9kZVV1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ25vZGVVdWlkIHJlcXVpcmVkIGZvciBhcHBseScgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBhcHBseVJlc3VsdCA9IGF3YWl0IHRoaXMuYXBwbHlQcmVmYWIoYXJncy5ub2RlVXVpZCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhcHBseVJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogeyBtZXNzYWdlOiAn4pyFIENoYW5nZXMgYXBwbGllZCB0byBwcmVmYWInIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFwcGx5UmVzdWx0O1xuICAgICAgICAgICAgICAgIGNhc2UgJ3JldmVydCc6XG4gICAgICAgICAgICAgICAgICAgIGlmICghYXJncy5ub2RlVXVpZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnbm9kZVV1aWQgcmVxdWlyZWQgZm9yIHJldmVydCcgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5yZXZlcnRQcmVmYWIoYXJncy5ub2RlVXVpZCk7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVW5zdXBwb3J0ZWQgaW5zdGFuY2UgYWN0aW9uOiAke2FjdGlvbn1gIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBJbnN0YW5jZSBvcGVyYXRpb24gZmFpbGVkOiAke2Vycm9yfWAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIDQuIFByZWZhYiBlZGl0IHdvcmtmbG93IGhhbmRsZXJcbiAgICBwcml2YXRlIGFzeW5jIGhhbmRsZVByZWZhYkVkaXQoYXJnczogYW55KTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgYWN0aW9uLCBwcmVmYWJQYXRoIH0gPSBhcmdzO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2VudGVyJzpcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZW50ZXJSZXN1bHQgPSBhd2FpdCB0aGlzLmVudGVyUHJlZmFiRWRpdE1vZGUocHJlZmFiUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbnRlclJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6ICdlZGl0aW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiUGF0aDogcHJlZmFiUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ+KchSBFbnRlcmVkIHByZWZhYiBlZGl0IG1vZGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1pbmRlcjogJ+KaoO+4jyAgSU1QT1JUQU5UOiBBZnRlciBtYWtpbmcgY2hhbmdlcywgeW91IE1VU1QgY2FsbCBzYXZlIGFjdGlvbiwgdGhlbiBleGl0IGFjdGlvbiB0byByZXR1cm4gdG8gc2NlbmUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZW50ZXJSZXN1bHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAnc2F2ZSc6XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNhdmVSZXN1bHQgPSBhd2FpdCB0aGlzLnNhdmVQcmVmYWJEaXJlY3QocHJlZmFiUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzYXZlUmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogJ3NhdmVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiUGF0aDogcHJlZmFiUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ+KchSBQcmVmYWIgc2F2ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1pbmRlcjogJ+KaoO+4jyAgSU1QT1JUQU5UOiBZb3UgTVVTVCBjYWxsIGV4aXQgYWN0aW9uIG5vdyB0byByZXR1cm4gdG8gc2NlbmUgdmlldydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzYXZlUmVzdWx0O1xuICAgICAgICAgICAgICAgIGNhc2UgJ2V4aXQnOlxuICAgICAgICAgICAgICAgICAgICBjb25zdCBleGl0UmVzdWx0ID0gYXdhaXQgdGhpcy5leGl0UHJlZmFiRWRpdE1vZGUocHJlZmFiUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChleGl0UmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogJ3NjZW5lJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ+KchSBSZXR1cm5lZCB0byBzY2VuZSB2aWV3JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90ZTogJ1ByZWZhYiBlZGl0aW5nIGNvbXBsZXRlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV4aXRSZXN1bHQ7XG4gICAgICAgICAgICAgICAgY2FzZSAndGVzdCc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnRlc3RQcmVmYWJDaGFuZ2VzKHByZWZhYlBhdGgsIGFyZ3MucGFyZW50VXVpZCk7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVW5zdXBwb3J0ZWQgZWRpdCBhY3Rpb246ICR7YWN0aW9ufWAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFByZWZhYiBlZGl0IGZhaWxlZDogJHtlcnJvcn1gIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDlj4LmlbDpqozor4Hmlrnms5VcbiAgICBwcml2YXRlIHZhbGlkYXRlUHJlZmFiT3BlcmF0aW9uKG9wZXJhdGlvbjogc3RyaW5nLCBhcmdzOiBhbnkpOiB7IHZhbGlkOiBib29sZWFuOyBlcnJvcj86IHN0cmluZyB9IHtcbiAgICAgICAgY29uc3QgcmVxdWlyZWRQYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPiA9IHtcbiAgICAgICAgICAgICdjcmVhdGUnOiBbJ25vZGVVdWlkJywgJ3ByZWZhYk5hbWUnXSxcbiAgICAgICAgICAgICdpbnN0YW50aWF0ZSc6IFsncHJlZmFiUGF0aCddLFxuICAgICAgICAgICAgJ3VwZGF0ZSc6IFsncHJlZmFiUGF0aCcsICdub2RlVXVpZCddLFxuICAgICAgICAgICAgJ2RlbGV0ZSc6IFsncHJlZmFiUGF0aCddLFxuICAgICAgICAgICAgJ3JldmVydCc6IFsnbm9kZVV1aWQnXSxcbiAgICAgICAgICAgICdnZXRfaW5mbyc6IFsncHJlZmFiUGF0aCddLFxuICAgICAgICAgICAgJ3ZhbGlkYXRlJzogWydwcmVmYWJQYXRoJ10sXG4gICAgICAgICAgICAndW5saW5rJzogWydub2RlVXVpZCddLFxuICAgICAgICAgICAgJ2FwcGx5JzogWydub2RlVXVpZCddLFxuICAgICAgICAgICAgJ2VkaXQnOiBbJ3ByZWZhYlBhdGgnXSxcbiAgICAgICAgICAgICdzYXZlJzogWydwcmVmYWJQYXRoJ10sXG4gICAgICAgICAgICAnZXhpdF9lZGl0JzogW10sXG4gICAgICAgICAgICAndGVzdF9jaGFuZ2VzJzogWydwcmVmYWJQYXRoJ11cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCByZXF1aXJlZCA9IHJlcXVpcmVkUGFyYW1zW29wZXJhdGlvbl07XG4gICAgICAgIGlmICghcmVxdWlyZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3I6IGDkuI3mlK/mjIHnmoTmk43kvZznsbvlnos6ICR7b3BlcmF0aW9ufWAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoY29uc3QgcGFyYW0gb2YgcmVxdWlyZWQpIHtcbiAgICAgICAgICAgIGlmICghYXJnc1twYXJhbV0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yOiBg5pON5L2cICcke29wZXJhdGlvbn0nIOe8uuWwkeW/hemcgOWPguaVsDogJHtwYXJhbX1gIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyDnibnmrorpqozor4Hop4TliJlcbiAgICAgICAgaWYgKG9wZXJhdGlvbiA9PT0gJ2NyZWF0ZScgJiYgIWFyZ3Muc2F2ZVBhdGggJiYgIWFyZ3MucHJlZmFiUGF0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcjogYOaTjeS9nCAnY3JlYXRlJyDpnIDopoEgc2F2ZVBhdGgg5oiWIHByZWZhYlBhdGgg5Y+C5pWwYCB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IHRydWUgfTtcbiAgICB9XG5cbiAgICAvLyDnu5/kuIDnmoTpooTliLbkvZPnrqHnkIbmlrnms5VcbiAgICBwcml2YXRlIGFzeW5jIG1hbmFnZVByZWZhYihhcmdzOiBhbnkpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8g6aqM6K+B5pON5L2c57G75Z6LXG4gICAgICAgICAgICBjb25zdCBvcGVyYXRpb24gPSBhcmdzLm9wZXJhdGlvbjtcbiAgICAgICAgICAgIGlmICghb3BlcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiAn57y65bCR5b+F6ZyA5Y+C5pWwOiBvcGVyYXRpb24nXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g6aqM6K+B5ZCE5pON5L2c5omA6ZyA55qE5Y+C5pWwXG4gICAgICAgICAgICBjb25zdCB2YWxpZGF0aW9uUmVzdWx0ID0gdGhpcy52YWxpZGF0ZVByZWZhYk9wZXJhdGlvbihvcGVyYXRpb24sIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKCF2YWxpZGF0aW9uUmVzdWx0LnZhbGlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiB2YWxpZGF0aW9uUmVzdWx0LmVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3dpdGNoIChvcGVyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBjYXNlICdjcmVhdGUnOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5jcmVhdGVQcmVmYWIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVV1aWQ6IGFyZ3Mubm9kZVV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlUGF0aDogYXJncy5zYXZlUGF0aCB8fCBhcmdzLnByZWZhYlBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVmYWJOYW1lOiBhcmdzLnByZWZhYk5hbWVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBjYXNlICdpbnN0YW50aWF0ZSc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmluc3RhbnRpYXRlUHJlZmFiKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZWZhYlBhdGg6IGFyZ3MucHJlZmFiUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudFV1aWQ6IGFyZ3MucGFyZW50VXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBhcmdzLnBvc2l0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2libGluZ0luZGV4OiBhcmdzLnNpYmxpbmdJbmRleFxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGNhc2UgJ3VwZGF0ZSc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnVwZGF0ZVByZWZhYihhcmdzLnByZWZhYlBhdGgsIGFyZ3Mubm9kZVV1aWQpO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAnZGVsZXRlJzpcbiAgICAgICAgICAgICAgICAgICAgLy8g5Yig6Zmk6aKE5Yi25L2T6LWE5rqQXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdkZWxldGUtYXNzZXQnLCBhcmdzLnByZWZhYlBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5yZWZyZXNoQXNzZXRzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVmYWJQYXRoOiBhcmdzLnByZWZhYlBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICfpooTliLbkvZPliKDpmaTmiJDlip8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGDpooTliLbkvZPliKDpmaTlpLHotKU6ICR7ZXJyb3J9YFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY2FzZSAncmV2ZXJ0JzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMucmV2ZXJ0UHJlZmFiKGFyZ3Mubm9kZVV1aWQpO1xuXG5cbiAgICAgICAgICAgICAgICBjYXNlICdnZXRfaW5mbyc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFByZWZhYkluZm8oYXJncy5wcmVmYWJQYXRoKTtcblxuICAgICAgICAgICAgICAgIGNhc2UgJ3ZhbGlkYXRlJzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMudmFsaWRhdGVQcmVmYWIoYXJncy5wcmVmYWJQYXRoKTtcblxuICAgICAgICAgICAgICAgIGNhc2UgJ3VubGluayc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnVubGlua1ByZWZhYihhcmdzLm5vZGVVdWlkKTtcblxuICAgICAgICAgICAgICAgIGNhc2UgJ2FwcGx5JzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuYXBwbHlQcmVmYWIoYXJncy5ub2RlVXVpZCk7XG5cbiAgICAgICAgICAgICAgICBjYXNlICdlZGl0JzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZW50ZXJQcmVmYWJFZGl0TW9kZShhcmdzLnByZWZhYlBhdGgpO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAnc2F2ZSc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnNhdmVQcmVmYWJEaXJlY3QoYXJncy5wcmVmYWJQYXRoKTtcblxuICAgICAgICAgICAgICAgIGNhc2UgJ2V4aXRfZWRpdCc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmV4aXRQcmVmYWJFZGl0TW9kZShhcmdzLnByZWZhYlBhdGgpO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAndGVzdF9jaGFuZ2VzJzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMudGVzdFByZWZhYkNoYW5nZXMoYXJncy5wcmVmYWJQYXRoLCBhcmdzLnBhcmVudFV1aWQpO1xuXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGDkuI3mlK/mjIHnmoTpooTliLbkvZPmk43kvZw6ICR7b3BlcmF0aW9ufWBcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGDpooTliLbkvZPnrqHnkIbmk43kvZzlpLHotKU6ICR7ZXJyb3J9YFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgY3JlYXRlUHJlZmFiQ3VzdG9tKG5vZGVVdWlkOiBzdHJpbmcsIHByZWZhYlBhdGg6IHN0cmluZywgcHJlZmFiTmFtZTogc3RyaW5nKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIDEuIOiOt+WPlua6kOiKgueCueeahOWujOaVtOaVsOaNrlxuICAgICAgICAgICAgY29uc3Qgbm9kZURhdGEgPSBhd2FpdCB0aGlzLmdldE5vZGVEYXRhKG5vZGVVdWlkKTtcbiAgICAgICAgICAgIGlmICghbm9kZURhdGEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGDml6Dms5Xmib7liLDoioLngrk6ICR7bm9kZVV1aWR9YFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIDIuIOeUn+aIkOmihOWItuS9k1VVSURcbiAgICAgICAgICAgIGNvbnN0IHByZWZhYlV1aWQgPSB0aGlzLmdlbmVyYXRlVVVJRCgpO1xuXG4gICAgICAgICAgICAvLyAzLiDliJvlu7rpooTliLbkvZPmlbDmja7nu5PmnoRcbiAgICAgICAgICAgIGNvbnN0IHByZWZhYkRhdGEgPSB0aGlzLmNyZWF0ZVByZWZhYkRhdGEobm9kZURhdGEsIHByZWZhYk5hbWUsIHByZWZhYlV1aWQpO1xuXG4gICAgICAgICAgICAvLyA0LiDln7rkuo7lrpjmlrnmoLzlvI/liJvlu7rpooTliLbkvZPmlbDmja7nu5PmnoRcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCc9PT0g5byA5aeL5Yib5bu66aKE5Yi25L2TID09PScpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ+iKgueCueWQjeensDonLCBub2RlRGF0YS5uYW1lPy52YWx1ZSB8fCAn5pyq55+lJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygn6IqC54K5VVVJRDonLCBub2RlRGF0YS51dWlkPy52YWx1ZSB8fCAn5pyq55+lJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygn6aKE5Yi25L2T5L+d5a2Y6Lev5b6EOicsIHByZWZhYlBhdGgpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOW8gOWni+WIm+W7uumihOWItuS9k++8jOiKgueCueaVsOaNrjpgLCBub2RlRGF0YSk7XG4gICAgICAgICAgICBjb25zdCBwcmVmYWJKc29uRGF0YSA9IGF3YWl0IHRoaXMuY3JlYXRlU3RhbmRhcmRQcmVmYWJDb250ZW50KG5vZGVEYXRhLCBwcmVmYWJOYW1lLCBwcmVmYWJVdWlkLCB0cnVlLCB0cnVlKTtcblxuICAgICAgICAgICAgLy8gNS4g5Yib5bu65qCH5YeGbWV0YeaWh+S7tuaVsOaNrlxuICAgICAgICAgICAgY29uc3Qgc3RhbmRhcmRNZXRhRGF0YSA9IHRoaXMuY3JlYXRlU3RhbmRhcmRNZXRhRGF0YShwcmVmYWJOYW1lLCBwcmVmYWJVdWlkKTtcblxuICAgICAgICAgICAgLy8gNi4g5L+d5a2Y6aKE5Yi25L2T5ZKMbWV0YeaWh+S7tlxuICAgICAgICAgICAgY29uc3Qgc2F2ZVJlc3VsdCA9IGF3YWl0IHRoaXMuc2F2ZVByZWZhYldpdGhNZXRhKHByZWZhYlBhdGgsIHByZWZhYkpzb25EYXRhLCBzdGFuZGFyZE1ldGFEYXRhKTtcblxuICAgICAgICAgICAgaWYgKHNhdmVSZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIC8vIOS/neWtmOaIkOWKn+WQju+8jOWwhuWOn+Wni+iKgueCuei9rOaNouS4uumihOWItuS9k+WunuS+i1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnZlcnRSZXN1bHQgPSBhd2FpdCB0aGlzLmNvbnZlcnROb2RlVG9QcmVmYWJJbnN0YW5jZShub2RlVXVpZCwgcHJlZmFiUGF0aCwgcHJlZmFiVXVpZCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVmYWJVdWlkOiBwcmVmYWJVdWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiUGF0aDogcHJlZmFiUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVVdWlkOiBub2RlVXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZWZhYk5hbWU6IHByZWZhYk5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb252ZXJ0ZWRUb1ByZWZhYkluc3RhbmNlOiBjb252ZXJ0UmVzdWx0LnN1Y2Nlc3MsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjb252ZXJ0UmVzdWx0LnN1Y2Nlc3MgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICfoh6rlrprkuYnpooTliLbkvZPliJvlu7rmiJDlip/vvIzljp/lp4voioLngrnlt7LovazmjaLkuLrpooTliLbkvZPlrp7kvosnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAn6aKE5Yi25L2T5Yib5bu65oiQ5Yqf77yM5L2G6IqC54K56L2s5o2i5aSx6LSlJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBzYXZlUmVzdWx0LmVycm9yIHx8ICfkv53lrZjpooTliLbkvZPmlofku7blpLHotKUnXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogYOWIm+W7uumihOWItuS9k+aXtuWPkeeUn+mUmeivrzogJHtlcnJvcn1gXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBnZXROb2RlRGF0YShub2RlVXVpZDogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIOmmluWFiOiOt+WPluWfuuacrOiKgueCueS/oeaBr1xuICAgICAgICAgICAgY29uc3Qgbm9kZUluZm8gPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdxdWVyeS1ub2RlJywgbm9kZVV1aWQpO1xuICAgICAgICAgICAgaWYgKCFub2RlSW5mbykge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg6I635Y+W6IqC54K5ICR7bm9kZVV1aWR9IOeahOWfuuacrOS/oeaBr+aIkOWKn2ApO1xuXG4gICAgICAgICAgICAvLyDkvb/nlKhxdWVyeS1ub2RlLXRyZWXojrflj5bljIXlkKvlrZDoioLngrnnmoTlrozmlbTnu5PmnoRcbiAgICAgICAgICAgIGNvbnN0IG5vZGVUcmVlID0gYXdhaXQgdGhpcy5nZXROb2RlV2l0aENoaWxkcmVuKG5vZGVVdWlkKTtcbiAgICAgICAgICAgIGlmIChub2RlVHJlZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDojrflj5boioLngrkgJHtub2RlVXVpZH0g55qE5a6M5pW05qCR57uT5p6E5oiQ5YqfYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGVUcmVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhg5L2/55So5Z+65pys6IqC54K55L+h5oGvYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGVJbmZvO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGDojrflj5boioLngrnmlbDmja7lpLHotKUgJHtub2RlVXVpZH06YCwgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDkvb/nlKhxdWVyeS1ub2RlLXRyZWXojrflj5bljIXlkKvlrZDoioLngrnnmoTlrozmlbToioLngrnnu5PmnoRcbiAgICBwcml2YXRlIGFzeW5jIGdldE5vZGVXaXRoQ2hpbGRyZW4obm9kZVV1aWQ6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyDojrflj5bmlbTkuKrlnLrmma/moJFcbiAgICAgICAgICAgIGNvbnN0IHRyZWUgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdxdWVyeS1ub2RlLXRyZWUnKTtcbiAgICAgICAgICAgIGlmICghdHJlZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyDlnKjmoJHkuK3mn6Xmib7mjIflrprnmoToioLngrlcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldE5vZGUgPSB0aGlzLmZpbmROb2RlSW5UcmVlKHRyZWUsIG5vZGVVdWlkKTtcbiAgICAgICAgICAgIGlmICh0YXJnZXROb2RlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYOWcqOWcuuaZr+agkeS4reaJvuWIsOiKgueCuSAke25vZGVVdWlkfe+8jOWtkOiKgueCueaVsOmHjzogJHt0YXJnZXROb2RlLmNoaWxkcmVuID8gdGFyZ2V0Tm9kZS5jaGlsZHJlbi5sZW5ndGggOiAwfWApO1xuXG4gICAgICAgICAgICAgICAgLy8g5aKe5by66IqC54K55qCR77yM6I635Y+W5q+P5Liq6IqC54K555qE5q2j56Gu57uE5Lu25L+h5oGvXG4gICAgICAgICAgICAgICAgY29uc3QgZW5oYW5jZWRUcmVlID0gYXdhaXQgdGhpcy5lbmhhbmNlVHJlZVdpdGhNQ1BDb21wb25lbnRzKHRhcmdldE5vZGUpO1xuICAgICAgICAgICAgICAgIHJldHVybiBlbmhhbmNlZFRyZWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGDojrflj5boioLngrnmoJHnu5PmnoTlpLHotKUgJHtub2RlVXVpZH06YCwgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDlnKjoioLngrnmoJHkuK3pgJLlvZLmn6Xmib7mjIflrppVVUlE55qE6IqC54K5XG4gICAgcHJpdmF0ZSBmaW5kTm9kZUluVHJlZShub2RlOiBhbnksIHRhcmdldFV1aWQ6IHN0cmluZyk6IGFueSB7XG4gICAgICAgIGlmICghbm9kZSkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgLy8g5qOA5p+l5b2T5YmN6IqC54K5XG4gICAgICAgIGlmIChub2RlLnV1aWQgPT09IHRhcmdldFV1aWQgfHwgbm9kZS52YWx1ZT8udXVpZCA9PT0gdGFyZ2V0VXVpZCkge1xuICAgICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDpgJLlvZLmo4Dmn6XlrZDoioLngrlcbiAgICAgICAgaWYgKG5vZGUuY2hpbGRyZW4gJiYgQXJyYXkuaXNBcnJheShub2RlLmNoaWxkcmVuKSkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiBub2RlLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZm91bmQgPSB0aGlzLmZpbmROb2RlSW5UcmVlKGNoaWxkLCB0YXJnZXRVdWlkKTtcbiAgICAgICAgICAgICAgICBpZiAoZm91bmQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZvdW5kO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOS9v+eUqE1DUOaOpeWPo+WinuW8uuiKgueCueagke+8jOiOt+WPluato+ehrueahOe7hOS7tuS/oeaBr1xuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgZW5oYW5jZVRyZWVXaXRoTUNQQ29tcG9uZW50cyhub2RlOiBhbnkpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICBpZiAoIW5vZGUgfHwgIW5vZGUudXVpZCkge1xuICAgICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8g5L+u5aSNKGZvcmsp77ya5Y6f5a6e546wIGZldGNoKGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0vbWNwYCkg6Ieq6LCD55So5pys5py6IE1DUCDnq6/ngrnigJTigJRcbiAgICAgICAgICAgIC8vIOW4piBhdXRoVG9rZW4g6Ym05p2D5pe26K+l6Ieq6LCD55So5LiN5bimIEF1dGhvcml6YXRpb24g5aS05Lya6KKrIDQwMSDmjKHmjonvvIzkuJTmnInmgKfog70v6Ieq6ZSB6aOO6Zmp44CCXG4gICAgICAgICAgICAvLyDmlLnkuLrov5vnqIvlhoXnm7TosIMgcXVlcnktbm9kZe+8iOS4jiBidWlsZEJhc2ljTm9kZUluZm8g5ZCM5rqQ77yJ77yMX19jb21wc19fIOeahCBfX3R5cGVfXy9jaWQg5Y2z6ISa5pys57uE5Lu25Y6L57ypVVVJROOAglxuICAgICAgICAgICAgY29uc3Qgbm9kZURhdGE6IGFueSA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3F1ZXJ5LW5vZGUnLCBub2RlLnV1aWQpO1xuICAgICAgICAgICAgaWYgKG5vZGVEYXRhICYmIG5vZGVEYXRhLl9fY29tcHNfXykge1xuICAgICAgICAgICAgICAgIG5vZGUuY29tcG9uZW50cyA9IG5vZGVEYXRhLl9fY29tcHNfXy5tYXAoKGNvbXA6IGFueSkgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogY29tcC5fX3R5cGVfXyB8fCBjb21wLmNpZCB8fCBjb21wLnR5cGUgfHwgJ1Vua25vd24nLFxuICAgICAgICAgICAgICAgICAgICB1dWlkOiBjb21wLnV1aWQ/LnZhbHVlIHx8IGNvbXAudXVpZCB8fCBudWxsLFxuICAgICAgICAgICAgICAgICAgICBlbmFibGVkOiBjb21wLmVuYWJsZWQgIT09IHVuZGVmaW5lZCA/IGNvbXAuZW5hYmxlZCA6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IGNvbXAudmFsdWUgfHwge31cbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYOiKgueCuSAke25vZGUudXVpZH0g6I635Y+W5YiwICR7bm9kZS5jb21wb25lbnRzLmxlbmd0aH0g5Liq57uE5Lu2KHF1ZXJ5LW5vZGXnm7TosIMs6ISa5pys57uE5Lu25Li65Y6L57ypVVVJROexu+WeiylgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihg6I635Y+W6IqC54K5ICR7bm9kZS51dWlkfSDnmoTnu4Tku7bkv6Hmga/lpLHotKU6YCwgZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g6YCS5b2S5aSE55CG5a2Q6IqC54K5XG4gICAgICAgIGlmIChub2RlLmNoaWxkcmVuICYmIEFycmF5LmlzQXJyYXkobm9kZS5jaGlsZHJlbikpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIG5vZGUuY2hpbGRyZW5baV0gPSBhd2FpdCB0aGlzLmVuaGFuY2VUcmVlV2l0aE1DUENvbXBvbmVudHMobm9kZS5jaGlsZHJlbltpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGJ1aWxkQmFzaWNOb2RlSW5mbyhub2RlVXVpZDogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIOaehOW7uuWfuuacrOeahOiKgueCueS/oeaBr1xuICAgICAgICAgICAgY29uc3Qgbm9kZUluZm86IGFueSA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3F1ZXJ5LW5vZGUnLCBub2RlVXVpZCk7XG4gICAgICAgICAgICBpZiAoIW5vZGVJbmZvKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOeugOWMlueJiOacrO+8muWPqui/lOWbnuWfuuacrOiKgueCueS/oeaBr++8jOS4jeiOt+WPluWtkOiKgueCueWSjOe7hOS7tlxuICAgICAgICAgICAgLy8g6L+Z5Lqb5L+h5oGv5bCG5Zyo5ZCO57ut55qE6aKE5Yi25L2T5aSE55CG5Lit5qC55o2u6ZyA6KaB5re75YqgXG4gICAgICAgICAgICBjb25zdCBiYXNpY0luZm8gPSB7XG4gICAgICAgICAgICAgICAgLi4ubm9kZUluZm8sXG4gICAgICAgICAgICAgICAgY2hpbGRyZW46IFtdLFxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtdXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIGJhc2ljSW5mbztcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOmqjOivgeiKgueCueaVsOaNruaYr+WQpuacieaViFxuICAgIHByaXZhdGUgaXNWYWxpZE5vZGVEYXRhKG5vZGVEYXRhOiBhbnkpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCFub2RlRGF0YSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAodHlwZW9mIG5vZGVEYXRhICE9PSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIC8vIOajgOafpeWfuuacrOWxnuaApyAtIOmAgumFjXF1ZXJ5LW5vZGUtdHJlZeeahOaVsOaNruagvOW8j1xuICAgICAgICByZXR1cm4gbm9kZURhdGEuaGFzT3duUHJvcGVydHkoJ3V1aWQnKSB8fFxuICAgICAgICAgICAgICAgbm9kZURhdGEuaGFzT3duUHJvcGVydHkoJ25hbWUnKSB8fFxuICAgICAgICAgICAgICAgbm9kZURhdGEuaGFzT3duUHJvcGVydHkoJ19fdHlwZV9fJykgfHxcbiAgICAgICAgICAgICAgIChub2RlRGF0YS52YWx1ZSAmJiAoXG4gICAgICAgICAgICAgICAgICAgbm9kZURhdGEudmFsdWUuaGFzT3duUHJvcGVydHkoJ3V1aWQnKSB8fFxuICAgICAgICAgICAgICAgICAgIG5vZGVEYXRhLnZhbHVlLmhhc093blByb3BlcnR5KCduYW1lJykgfHxcbiAgICAgICAgICAgICAgICAgICBub2RlRGF0YS52YWx1ZS5oYXNPd25Qcm9wZXJ0eSgnX190eXBlX18nKVxuICAgICAgICAgICAgICAgKSk7XG4gICAgfVxuXG4gICAgLy8g5o+Q5Y+W5a2Q6IqC54K5VVVJROeahOe7n+S4gOaWueazlVxuICAgIHByaXZhdGUgZXh0cmFjdENoaWxkVXVpZChjaGlsZFJlZjogYW55KTogc3RyaW5nIHwgbnVsbCB7XG4gICAgICAgIGlmICghY2hpbGRSZWYpIHJldHVybiBudWxsO1xuXG4gICAgICAgIC8vIOaWueazlTE6IOebtOaOpeWtl+espuS4slxuICAgICAgICBpZiAodHlwZW9mIGNoaWxkUmVmID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgcmV0dXJuIGNoaWxkUmVmO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5pa55rOVMjogdmFsdWXlsZ7mgKfljIXlkKvlrZfnrKbkuLJcbiAgICAgICAgaWYgKGNoaWxkUmVmLnZhbHVlICYmIHR5cGVvZiBjaGlsZFJlZi52YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHJldHVybiBjaGlsZFJlZi52YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOaWueazlTM6IHZhbHVlLnV1aWTlsZ7mgKdcbiAgICAgICAgaWYgKGNoaWxkUmVmLnZhbHVlICYmIGNoaWxkUmVmLnZhbHVlLnV1aWQpIHtcbiAgICAgICAgICAgIHJldHVybiBjaGlsZFJlZi52YWx1ZS51dWlkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5pa55rOVNDog55u05o6ldXVpZOWxnuaAp1xuICAgICAgICBpZiAoY2hpbGRSZWYudXVpZCkge1xuICAgICAgICAgICAgcmV0dXJuIGNoaWxkUmVmLnV1aWQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDmlrnms5U1OiBfX2lkX1/lvJXnlKggLSDov5nnp43mg4XlhrXpnIDopoHnibnmrorlpITnkIZcbiAgICAgICAgaWYgKGNoaWxkUmVmLl9faWRfXyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg5Y+R546wX19pZF9f5byV55SoOiAke2NoaWxkUmVmLl9faWRfX33vvIzlj6/og73pnIDopoHku47mlbDmja7nu5PmnoTkuK3mn6Xmib5gKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsOyAvLyDmmoLml7bov5Tlm55udWxs77yM5ZCO57ut5Y+v5Lul5re75Yqg5byV55So6Kej5p6Q6YC76L6RXG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLndhcm4oJ+aXoOazleaPkOWPluWtkOiKgueCuVVVSUQ6JywgSlNPTi5zdHJpbmdpZnkoY2hpbGRSZWYpKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8g6I635Y+W6ZyA6KaB5aSE55CG55qE5a2Q6IqC54K55pWw5o2uXG4gICAgcHJpdmF0ZSBnZXRDaGlsZHJlblRvUHJvY2Vzcyhub2RlRGF0YTogYW55KTogYW55W10ge1xuICAgICAgICBjb25zdCBjaGlsZHJlbjogYW55W10gPSBbXTtcblxuICAgICAgICAvLyDmlrnms5UxOiDnm7TmjqXku45jaGlsZHJlbuaVsOe7hOiOt+WPlu+8iOS7jnF1ZXJ5LW5vZGUtdHJlZei/lOWbnueahOaVsOaNru+8iVxuICAgICAgICBpZiAobm9kZURhdGEuY2hpbGRyZW4gJiYgQXJyYXkuaXNBcnJheShub2RlRGF0YS5jaGlsZHJlbikpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDku45jaGlsZHJlbuaVsOe7hOiOt+WPluWtkOiKgueCue+8jOaVsOmHjzogJHtub2RlRGF0YS5jaGlsZHJlbi5sZW5ndGh9YCk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIG5vZGVEYXRhLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgLy8gcXVlcnktbm9kZS10cmVl6L+U5Zue55qE5a2Q6IqC54K56YCa5bi45bey57uP5piv5a6M5pW055qE5pWw5o2u57uT5p6EXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNWYWxpZE5vZGVEYXRhKGNoaWxkKSkge1xuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbi5wdXNoKGNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYOa3u+WKoOWtkOiKgueCuTogJHtjaGlsZC5uYW1lIHx8IGNoaWxkLnZhbHVlPy5uYW1lIHx8ICfmnKrnn6UnfWApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCflrZDoioLngrnmlbDmja7ml6DmlYg6JywgSlNPTi5zdHJpbmdpZnkoY2hpbGQsIG51bGwsIDIpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygn6IqC54K55rKh5pyJ5a2Q6IqC54K55oiWY2hpbGRyZW7mlbDnu4TkuLrnqbonKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjaGlsZHJlbjtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdlbmVyYXRlVVVJRCgpOiBzdHJpbmcge1xuICAgICAgICAvLyDnlJ/miJDnrKblkIhDb2NvcyBDcmVhdG9y5qC85byP55qEVVVJRFxuICAgICAgICBjb25zdCBjaGFycyA9ICcwMTIzNDU2Nzg5YWJjZGVmJztcbiAgICAgICAgbGV0IHV1aWQgPSAnJztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAzMjsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoaSA9PT0gOCB8fCBpID09PSAxMiB8fCBpID09PSAxNiB8fCBpID09PSAyMCkge1xuICAgICAgICAgICAgICAgIHV1aWQgKz0gJy0nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdXVpZCArPSBjaGFyc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjaGFycy5sZW5ndGgpXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdXVpZDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZVByZWZhYkRhdGEobm9kZURhdGE6IGFueSwgcHJlZmFiTmFtZTogc3RyaW5nLCBwcmVmYWJVdWlkOiBzdHJpbmcpOiBhbnlbXSB7XG4gICAgICAgIC8vIOWIm+W7uuagh+WHhueahOmihOWItuS9k+aVsOaNrue7k+aehFxuICAgICAgICBjb25zdCBwcmVmYWJBc3NldCA9IHtcbiAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5QcmVmYWJcIixcbiAgICAgICAgICAgIFwiX25hbWVcIjogcHJlZmFiTmFtZSxcbiAgICAgICAgICAgIFwiX29iakZsYWdzXCI6IDAsXG4gICAgICAgICAgICBcIl9fZWRpdG9yRXh0cmFzX19cIjoge30sXG4gICAgICAgICAgICBcIl9uYXRpdmVcIjogXCJcIixcbiAgICAgICAgICAgIFwiZGF0YVwiOiB7XG4gICAgICAgICAgICAgICAgXCJfX2lkX19cIjogMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwib3B0aW1pemF0aW9uUG9saWN5XCI6IDAsXG4gICAgICAgICAgICBcInBlcnNpc3RlbnRcIjogZmFsc2VcbiAgICAgICAgfTtcblxuICAgICAgICAvLyDlpITnkIboioLngrnmlbDmja7vvIznoa7kv53nrKblkIjpooTliLbkvZPmoLzlvI9cbiAgICAgICAgY29uc3QgcHJvY2Vzc2VkTm9kZURhdGEgPSB0aGlzLnByb2Nlc3NOb2RlRm9yUHJlZmFiKG5vZGVEYXRhLCBwcmVmYWJVdWlkKTtcblxuICAgICAgICByZXR1cm4gW3ByZWZhYkFzc2V0LCAuLi5wcm9jZXNzZWROb2RlRGF0YV07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwcm9jZXNzTm9kZUZvclByZWZhYihub2RlRGF0YTogYW55LCBwcmVmYWJVdWlkOiBzdHJpbmcpOiBhbnlbXSB7XG4gICAgICAgIC8vIOWkhOeQhuiKgueCueaVsOaNruS7peespuWQiOmihOWItuS9k+agvOW8j1xuICAgICAgICBjb25zdCBwcm9jZXNzZWREYXRhOiBhbnlbXSA9IFtdO1xuICAgICAgICBsZXQgaWRDb3VudGVyID0gMTtcblxuICAgICAgICAvLyDpgJLlvZLlpITnkIboioLngrnlkoznu4Tku7ZcbiAgICAgICAgY29uc3QgcHJvY2Vzc05vZGUgPSAobm9kZTogYW55LCBwYXJlbnRJZDogbnVtYmVyID0gMCk6IG51bWJlciA9PiB7XG4gICAgICAgICAgICBjb25zdCBub2RlSWQgPSBpZENvdW50ZXIrKztcblxuICAgICAgICAgICAgLy8g5Yib5bu66IqC54K55a+56LGhXG4gICAgICAgICAgICBjb25zdCBwcm9jZXNzZWROb2RlID0ge1xuICAgICAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5Ob2RlXCIsXG4gICAgICAgICAgICAgICAgXCJfbmFtZVwiOiBub2RlLm5hbWUgfHwgXCJOb2RlXCIsXG4gICAgICAgICAgICAgICAgXCJfb2JqRmxhZ3NcIjogMCxcbiAgICAgICAgICAgICAgICBcIl9fZWRpdG9yRXh0cmFzX19cIjoge30sXG4gICAgICAgICAgICAgICAgXCJfcGFyZW50XCI6IHBhcmVudElkID4gMCA/IHsgXCJfX2lkX19cIjogcGFyZW50SWQgfSA6IG51bGwsXG4gICAgICAgICAgICAgICAgXCJfY2hpbGRyZW5cIjogbm9kZS5jaGlsZHJlbiA/IG5vZGUuY2hpbGRyZW4ubWFwKCgpID0+ICh7IFwiX19pZF9fXCI6IGlkQ291bnRlcisrIH0pKSA6IFtdLFxuICAgICAgICAgICAgICAgIFwiX2FjdGl2ZVwiOiBub2RlLmFjdGl2ZSAhPT0gZmFsc2UsXG4gICAgICAgICAgICAgICAgXCJfY29tcG9uZW50c1wiOiBub2RlLmNvbXBvbmVudHMgPyBub2RlLmNvbXBvbmVudHMubWFwKCgpID0+ICh7IFwiX19pZF9fXCI6IGlkQ291bnRlcisrIH0pKSA6IFtdLFxuICAgICAgICAgICAgICAgIFwiX3ByZWZhYlwiOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiX19pZF9fXCI6IGlkQ291bnRlcisrXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcIl9scG9zXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlZlYzNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgICAgICAgICAgICBcInpcIjogMFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCJfbHJvdFwiOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5RdWF0XCIsXG4gICAgICAgICAgICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgICAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICAgICAgICAgICAgXCJ6XCI6IDAsXG4gICAgICAgICAgICAgICAgICAgIFwid1wiOiAxXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcIl9sc2NhbGVcIjoge1xuICAgICAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuVmVjM1wiLFxuICAgICAgICAgICAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICAgICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgICAgICAgICAgIFwielwiOiAxXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcIl9tb2JpbGl0eVwiOiAwLFxuICAgICAgICAgICAgICAgIFwiX2xheWVyXCI6IDEwNzM3NDE4MjQsXG4gICAgICAgICAgICAgICAgXCJfZXVsZXJcIjoge1xuICAgICAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuVmVjM1wiLFxuICAgICAgICAgICAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICAgICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgICAgICAgICAgIFwielwiOiAwXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcIl9pZFwiOiBcIlwiXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBwcm9jZXNzZWREYXRhLnB1c2gocHJvY2Vzc2VkTm9kZSk7XG5cbiAgICAgICAgICAgIC8vIOWkhOeQhue7hOS7tlxuICAgICAgICAgICAgaWYgKG5vZGUuY29tcG9uZW50cykge1xuICAgICAgICAgICAgICAgIG5vZGUuY29tcG9uZW50cy5mb3JFYWNoKChjb21wb25lbnQ6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb21wb25lbnRJZCA9IGlkQ291bnRlcisrO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9jZXNzZWRDb21wb25lbnRzID0gdGhpcy5wcm9jZXNzQ29tcG9uZW50Rm9yUHJlZmFiKGNvbXBvbmVudCwgY29tcG9uZW50SWQpO1xuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzZWREYXRhLnB1c2goLi4ucHJvY2Vzc2VkQ29tcG9uZW50cyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOWkhOeQhuWtkOiKgueCuVxuICAgICAgICAgICAgaWYgKG5vZGUuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICBub2RlLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc05vZGUoY2hpbGQsIG5vZGVJZCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBub2RlSWQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgcHJvY2Vzc05vZGUobm9kZURhdGEpO1xuICAgICAgICByZXR1cm4gcHJvY2Vzc2VkRGF0YTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHByb2Nlc3NDb21wb25lbnRGb3JQcmVmYWIoY29tcG9uZW50OiBhbnksIGNvbXBvbmVudElkOiBudW1iZXIpOiBhbnlbXSB7XG4gICAgICAgIC8vIOWkhOeQhue7hOS7tuaVsOaNruS7peespuWQiOmihOWItuS9k+agvOW8j1xuICAgICAgICBjb25zdCBwcm9jZXNzZWRDb21wb25lbnQgPSB7XG4gICAgICAgICAgICBcIl9fdHlwZV9fXCI6IGNvbXBvbmVudC50eXBlIHx8IFwiY2MuQ29tcG9uZW50XCIsXG4gICAgICAgICAgICBcIl9uYW1lXCI6IFwiXCIsXG4gICAgICAgICAgICBcIl9vYmpGbGFnc1wiOiAwLFxuICAgICAgICAgICAgXCJfX2VkaXRvckV4dHJhc19fXCI6IHt9LFxuICAgICAgICAgICAgXCJub2RlXCI6IHtcbiAgICAgICAgICAgICAgICBcIl9faWRfX1wiOiBjb21wb25lbnRJZCAtIDFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcIl9lbmFibGVkXCI6IGNvbXBvbmVudC5lbmFibGVkICE9PSBmYWxzZSxcbiAgICAgICAgICAgIFwiX19wcmVmYWJcIjoge1xuICAgICAgICAgICAgICAgIFwiX19pZF9fXCI6IGNvbXBvbmVudElkICsgMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC4uLmNvbXBvbmVudC5wcm9wZXJ0aWVzXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8g5re75Yqg57uE5Lu254m55a6a55qE6aKE5Yi25L2T5L+h5oGvXG4gICAgICAgIGNvbnN0IGNvbXBQcmVmYWJJbmZvID0ge1xuICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLkNvbXBQcmVmYWJJbmZvXCIsXG4gICAgICAgICAgICBcImZpbGVJZFwiOiB0aGlzLmdlbmVyYXRlRmlsZUlkKClcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gW3Byb2Nlc3NlZENvbXBvbmVudCwgY29tcFByZWZhYkluZm9dO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2VuZXJhdGVGaWxlSWQoKTogc3RyaW5nIHtcbiAgICAgICAgLy8g55Sf5oiQ5paH5Lu2SUTvvIjnroDljJbniYjmnKzvvIlcbiAgICAgICAgY29uc3QgY2hhcnMgPSAnYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWjAxMjM0NTY3ODkrLyc7XG4gICAgICAgIGxldCBmaWxlSWQgPSAnJztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAyMjsgaSsrKSB7XG4gICAgICAgICAgICBmaWxlSWQgKz0gY2hhcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2hhcnMubGVuZ3RoKV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZpbGVJZDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZU1ldGFEYXRhKHByZWZhYk5hbWU6IHN0cmluZywgcHJlZmFiVXVpZDogc3RyaW5nKTogYW55IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIFwidmVyXCI6IFwiMS4xLjUwXCIsXG4gICAgICAgICAgICBcImltcG9ydGVyXCI6IFwicHJlZmFiXCIsXG4gICAgICAgICAgICBcImltcG9ydGVkXCI6IHRydWUsXG4gICAgICAgICAgICBcInV1aWRcIjogcHJlZmFiVXVpZCxcbiAgICAgICAgICAgIFwiZmlsZXNcIjogW1xuICAgICAgICAgICAgICAgIFwiLmpzb25cIlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwic3ViTWV0YXNcIjoge30sXG4gICAgICAgICAgICBcInVzZXJEYXRhXCI6IHtcbiAgICAgICAgICAgICAgICBcInN5bmNOb2RlTmFtZVwiOiBwcmVmYWJOYW1lXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBzYXZlUHJlZmFiRmlsZXMocHJlZmFiUGF0aDogc3RyaW5nLCBwcmVmYWJEYXRhOiBhbnlbXSwgbWV0YURhdGE6IGFueSk6IFByb21pc2U8eyBzdWNjZXNzOiBib29sZWFuOyBlcnJvcj86IHN0cmluZyB9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyDkvb/nlKhFZGl0b3IgQVBJ5L+d5a2Y6aKE5Yi25L2T5paH5Lu2XG4gICAgICAgICAgICBjb25zdCBwcmVmYWJDb250ZW50ID0gSlNPTi5zdHJpbmdpZnkocHJlZmFiRGF0YSwgbnVsbCwgMik7XG4gICAgICAgICAgICBjb25zdCBtZXRhQ29udGVudCA9IEpTT04uc3RyaW5naWZ5KG1ldGFEYXRhLCBudWxsLCAyKTtcblxuICAgICAgICAgICAgLy8g5bCd6K+V5L2/55So5pu05Y+v6Z2g55qE5L+d5a2Y5pa55rOVXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNhdmVBc3NldEZpbGUocHJlZmFiUGF0aCwgcHJlZmFiQ29udGVudCk7XG4gICAgICAgICAgICAvLyDlho3liJvlu7ptZXRh5paH5Lu2XG4gICAgICAgICAgICBjb25zdCBtZXRhUGF0aCA9IGAke3ByZWZhYlBhdGh9Lm1ldGFgO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5zYXZlQXNzZXRGaWxlKG1ldGFQYXRoLCBtZXRhQ29udGVudCk7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB8fCAn5L+d5a2Y6aKE5Yi25L2T5paH5Lu25aSx6LSlJyB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBzYXZlQXNzZXRGaWxlKGZpbGVQYXRoOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICAvLyDlsJ3or5XlpJrnp43kv53lrZjmlrnms5VcbiAgICAgICAgY29uc3QgbWV0aG9kcyA9IFtcbiAgICAgICAgICAgICgpID0+IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ2NyZWF0ZS1hc3NldCcsIGZpbGVQYXRoLCBjb250ZW50KSxcbiAgICAgICAgICAgICgpID0+IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3NhdmUtYXNzZXQnLCBmaWxlUGF0aCwgY29udGVudCksXG4gICAgICAgICAgICAoKSA9PiBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICd3cml0ZS1hc3NldCcsIGZpbGVQYXRoLCBjb250ZW50KVxuICAgICAgICBdO1xuXG4gICAgICAgIGZvciAoY29uc3QgbWV0aG9kIG9mIG1ldGhvZHMpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgbWV0aG9kKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgLy8gdHJ5IG5leHQgbWV0aG9kXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCfmiYDmnInkv53lrZjmlrnms5Xpg73lpLHotKXkuoYnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHVwZGF0ZVByZWZhYihwcmVmYWJQYXRoOiBzdHJpbmcsIG5vZGVVdWlkOiBzdHJpbmcpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOW8gOWni+abtOaWsOmihOWItuS9kzogcHJlZmFiUGF0aD0ke3ByZWZhYlBhdGh9LCBub2RlVXVpZD0ke25vZGVVdWlkfWApO1xuXG4gICAgICAgICAgICAvLyAxLiDpppblhYjpqozor4HoioLngrnmmK/pooTliLbkvZPlrp7kvotcbiAgICAgICAgICAgIGNvbnN0IG5vZGVJbmZvID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAncXVlcnktbm9kZScsIG5vZGVVdWlkKTtcbiAgICAgICAgICAgIGlmICghbm9kZUluZm8gfHwgIShub2RlSW5mbyBhcyBhbnkpLl9fcHJlZmFiX18pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6ICfmjIflrprnmoToioLngrnkuI3mmK/pooTliLbkvZPlrp7kvosnXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgcHJlZmFiSW5mbyA9IChub2RlSW5mbyBhcyBhbnkpLl9fcHJlZmFiX187XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg6aKE5Yi25L2T5a6e5L6L5L+h5oGvOmAsIHByZWZhYkluZm8pO1xuXG4gICAgICAgICAgICAvLyAyLiDkvb/nlKjmraPnoa7nmoQgYXBwbHktcHJlZmFiIEFQSSDmoLzlvI/vvIjln7rkuo7nvJbovpHlmajml6Xlv5fvvIlcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfosIPnlKggc2NlbmUuYXBwbHktcHJlZmFiIEFQSS4uLicpO1xuICAgICAgICAgICAgY29uc3QgYXBwbHlSZXN1bHQgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdhcHBseS1wcmVmYWInLCBbbm9kZVV1aWRdKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhcHBseS1wcmVmYWIgQVBJIOiwg+eUqOe7k+aenDonLCBhcHBseVJlc3VsdCk7XG5cbiAgICAgICAgICAgIC8vIDMuIOetieW+hee8lui+keWZqOWkhOeQhlxuICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDIwMCkpO1xuXG4gICAgICAgICAgICAvLyA0LiDojrflj5bpooTliLbkvZPotYTmupDkv6Hmga/lubbliLfmlrBcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXNzZXRJbmZvID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAncXVlcnktYXNzZXQtaW5mbycsIHByZWZhYlBhdGgpO1xuICAgICAgICAgICAgICAgIGlmIChhc3NldEluZm8gJiYgYXNzZXRJbmZvLnNvdXJjZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyDliLfmlrDnibnlrprnmoTpooTliLbkvZPotYTmupBcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5yZWZyZXNoQXNzZXRzKGFzc2V0SW5mby5zb3VyY2UpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhg6aKE5Yi25L2T6LWE5rqQ5bey5Yi35pawOiAke2Fzc2V0SW5mby5zb3VyY2V9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoYXNzZXRFcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfojrflj5bmiJbliLfmlrDpooTliLbkvZPotYTmupDlpLHotKU6JywgYXNzZXRFcnJvcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVVdWlkOiBub2RlVXVpZCxcbiAgICAgICAgICAgICAgICAgICAgcHJlZmFiUGF0aDogcHJlZmFiUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgcHJlZmFiQXNzZXRVdWlkOiBwcmVmYWJJbmZvLmFzc2V0LFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAn6aKE5Yi25L2T5a6e5L6L55qE5L+u5pS55bey5oiQ5Yqf5bqU55So5Yiw6aKE5Yi25L2T6LWE5rqQJyxcbiAgICAgICAgICAgICAgICAgICAgYXBwbHlSZXN1bHQ6IGFwcGx5UmVzdWx0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCfmm7TmlrDpooTliLbkvZPlpLHotKU6JywgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogYOabtOaWsOmihOWItuS9k+Wksei0pTogJHtlcnJvci5tZXNzYWdlIHx8IGVycm9yfWAsXG4gICAgICAgICAgICAgICAgaW5zdHJ1Y3Rpb246ICfor7fnoa7orqToioLngrnmmK/mnInmlYjnmoTpooTliLbkvZPlrp7kvovkuJTlrZjlnKjmnKrlupTnlKjnmoTkv67mlLknXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyByZXZlcnRQcmVmYWIobm9kZVV1aWQ6IHN0cmluZyk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyDlhYjojrflj5boioLngrnkv6Hmga/ku6Xnoa7lrprpooTliLbkvZPotYTmupBVVUlEXG4gICAgICAgICAgICBjb25zdCBub2RlSW5mbyA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3F1ZXJ5LW5vZGUnLCBub2RlVXVpZCk7XG4gICAgICAgICAgICBpZiAoIW5vZGVJbmZvIHx8ICFub2RlSW5mby5fX3ByZWZhYl9fKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiAnTm9kZSBpcyBub3QgYSBwcmVmYWIgaW5zdGFuY2UnXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgcHJlZmFiQXNzZXRVdWlkID0gbm9kZUluZm8uX19wcmVmYWJfXy51dWlkO1xuXG4gICAgICAgICAgICAvLyDkvb/nlKjmraPnoa7nmoRBUEk6IHJlc3RvcmUtcHJlZmFiXG4gICAgICAgICAgICAoRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCBhcyBhbnkpKCdzY2VuZScsICdyZXN0b3JlLXByZWZhYicsIG5vZGVVdWlkLCBwcmVmYWJBc3NldFV1aWQpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnUHJlZmFiIHJldmVydGVkJyxcbiAgICAgICAgICAgICAgICAgICAgbm9kZVV1aWQ6IG5vZGVVdWlkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBnZXQgbm9kZSBpbmZvOiAke2Vycm9yfWAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgZ2V0UHJlZmFiSW5mbyhwcmVmYWJQYXRoOiBzdHJpbmcpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgYXNzZXRJbmZvOiBhbnkgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdxdWVyeS1hc3NldC1pbmZvJywgcHJlZmFiUGF0aCk7XG4gICAgICAgICAgICBpZiAoIWFzc2V0SW5mbykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUHJlZmFiIG5vdCBmb3VuZCcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBtZXRhSW5mbzogYW55ID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAncXVlcnktYXNzZXQtbWV0YScsIGFzc2V0SW5mby51dWlkKTtcbiAgICAgICAgICAgIGNvbnN0IGluZm86IFByZWZhYkluZm8gPSB7XG4gICAgICAgICAgICAgICAgbmFtZTogbWV0YUluZm8ubmFtZSxcbiAgICAgICAgICAgICAgICB1dWlkOiBtZXRhSW5mby51dWlkLFxuICAgICAgICAgICAgICAgIHBhdGg6IHByZWZhYlBhdGgsXG4gICAgICAgICAgICAgICAgZm9sZGVyOiBwcmVmYWJQYXRoLnN1YnN0cmluZygwLCBwcmVmYWJQYXRoLmxhc3RJbmRleE9mKCcvJykpLFxuICAgICAgICAgICAgICAgIGNyZWF0ZVRpbWU6IG1ldGFJbmZvLmNyZWF0ZVRpbWUsXG4gICAgICAgICAgICAgICAgbW9kaWZ5VGltZTogbWV0YUluZm8ubW9kaWZ5VGltZSxcbiAgICAgICAgICAgICAgICBkZXBlbmRlbmNpZXM6IG1ldGFJbmZvLmRlcGVuZHMgfHwgW11cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBpbmZvIH07XG4gICAgICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVyci5tZXNzYWdlIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGNyZWF0ZVByZWZhYkZyb21Ob2RlKGFyZ3M6IGFueSk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIC8vIOS7jiBwcmVmYWJQYXRoIOaPkOWPluWQjeensFxuICAgICAgICBjb25zdCBwcmVmYWJQYXRoID0gYXJncy5wcmVmYWJQYXRoO1xuICAgICAgICBjb25zdCBwcmVmYWJOYW1lID0gcHJlZmFiUGF0aC5zcGxpdCgnLycpLnBvcCgpPy5yZXBsYWNlKCcucHJlZmFiJywgJycpIHx8ICdOZXdQcmVmYWInO1xuXG4gICAgICAgIC8vIOiwg+eUqOWOn+adpeeahCBjcmVhdGVQcmVmYWIg5pa55rOVXG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmNyZWF0ZVByZWZhYih7XG4gICAgICAgICAgICBub2RlVXVpZDogYXJncy5ub2RlVXVpZCxcbiAgICAgICAgICAgIHNhdmVQYXRoOiBwcmVmYWJQYXRoLFxuICAgICAgICAgICAgcHJlZmFiTmFtZTogcHJlZmFiTmFtZVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHZhbGlkYXRlUHJlZmFiKHByZWZhYlBhdGg6IHN0cmluZyk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyDor7vlj5bpooTliLbkvZPmlofku7blhoXlrrlcbiAgICAgICAgICAgIGNvbnN0IGFzc2V0SW5mbzogYW55ID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAncXVlcnktYXNzZXQtaW5mbycsIHByZWZhYlBhdGgpO1xuICAgICAgICAgICAgaWYgKCFhc3NldEluZm8pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6ICfpooTliLbkvZPmlofku7bkuI3lrZjlnKgnXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g6I635Y+W6aKE5Yi25L2T5paH5Lu255qE56OB55uY6Lev5b6EXG4gICAgICAgICAgICBjb25zdCBkaXNrUGF0aDogc3RyaW5nIHwgbnVsbCA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3F1ZXJ5LXBhdGgnLCBwcmVmYWJQYXRoKTtcbiAgICAgICAgICAgIGlmICghZGlza1BhdGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6ICdDYW5ub3QgZ2V0IHByZWZhYiBkaXNrIHBhdGgnXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g5L2/55SoTm9kZS5qcyBmc+ivu+WPluaWh+S7tlxuICAgICAgICAgICAgY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGRpc2tQYXRoLCAndXRmOCcpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHByZWZhYkRhdGEgPSBKU09OLnBhcnNlKGNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbGlkYXRpb25SZXN1bHQgPSB0aGlzLnZhbGlkYXRlUHJlZmFiRm9ybWF0KHByZWZhYkRhdGEpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNWYWxpZDogdmFsaWRhdGlvblJlc3VsdC5pc1ZhbGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXNzdWVzOiB2YWxpZGF0aW9uUmVzdWx0Lmlzc3VlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVDb3VudDogdmFsaWRhdGlvblJlc3VsdC5ub2RlQ291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRDb3VudDogdmFsaWRhdGlvblJlc3VsdC5jb21wb25lbnRDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHZhbGlkYXRpb25SZXN1bHQuaXNWYWxpZCA/ICfpooTliLbkvZPmoLzlvI/mnInmlYgnIDogJ+mihOWItuS9k+agvOW8j+WtmOWcqOmXrumimCdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGNhdGNoIChwYXJzZUVycm9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiAn6aKE5Yi25L2T5paH5Lu25qC85byP6ZSZ6K+v77yM5peg5rOV6Kej5p6QSlNPTidcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yOiBg6aqM6K+B6aKE5Yi25L2T5pe25Y+R55Sf6ZSZ6K+vOiAke2Vycm9yLm1lc3NhZ2UgfHwgZXJyb3J9YFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgdmFsaWRhdGVQcmVmYWJGb3JtYXQocHJlZmFiRGF0YTogYW55KTogeyBpc1ZhbGlkOiBib29sZWFuOyBpc3N1ZXM6IHN0cmluZ1tdOyBub2RlQ291bnQ6IG51bWJlcjsgY29tcG9uZW50Q291bnQ6IG51bWJlciB9IHtcbiAgICAgICAgY29uc3QgaXNzdWVzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBsZXQgbm9kZUNvdW50ID0gMDtcbiAgICAgICAgbGV0IGNvbXBvbmVudENvdW50ID0gMDtcblxuICAgICAgICAvLyDmo4Dmn6Xln7rmnKznu5PmnoRcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHByZWZhYkRhdGEpKSB7XG4gICAgICAgICAgICBpc3N1ZXMucHVzaCgn6aKE5Yi25L2T5pWw5o2u5b+F6aG75piv5pWw57uE5qC85byPJyk7XG4gICAgICAgICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgaXNzdWVzLCBub2RlQ291bnQsIGNvbXBvbmVudENvdW50IH07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJlZmFiRGF0YS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGlzc3Vlcy5wdXNoKCfpooTliLbkvZPmlbDmja7kuLrnqbonKTtcbiAgICAgICAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBpc3N1ZXMsIG5vZGVDb3VudCwgY29tcG9uZW50Q291bnQgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOajgOafpeesrOS4gOS4quWFg+e0oOaYr+WQpuS4uumihOWItuS9k+i1hOS6p1xuICAgICAgICBjb25zdCBmaXJzdEVsZW1lbnQgPSBwcmVmYWJEYXRhWzBdO1xuICAgICAgICBpZiAoIWZpcnN0RWxlbWVudCB8fCBmaXJzdEVsZW1lbnQuX190eXBlX18gIT09ICdjYy5QcmVmYWInKSB7XG4gICAgICAgICAgICBpc3N1ZXMucHVzaCgn56ys5LiA5Liq5YWD57Sg5b+F6aG75pivY2MuUHJlZmFi57G75Z6LJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDnu5/orqHoioLngrnlkoznu4Tku7ZcbiAgICAgICAgcHJlZmFiRGF0YS5mb3JFYWNoKChpdGVtOiBhbnksIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgIGlmIChpdGVtLl9fdHlwZV9fID09PSAnY2MuTm9kZScpIHtcbiAgICAgICAgICAgICAgICBub2RlQ291bnQrKztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXRlbS5fX3R5cGVfXyAmJiBpdGVtLl9fdHlwZV9fLmluY2x1ZGVzKCdjYy4nKSkge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudENvdW50Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIOajgOafpeW/heimgeeahOWtl+autVxuICAgICAgICBpZiAobm9kZUNvdW50ID09PSAwKSB7XG4gICAgICAgICAgICBpc3N1ZXMucHVzaCgn6aKE5Yi25L2T5b+F6aG75YyF5ZCr6Iez5bCR5LiA5Liq6IqC54K5Jyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaXNWYWxpZDogaXNzdWVzLmxlbmd0aCA9PT0gMCxcbiAgICAgICAgICAgIGlzc3VlcyxcbiAgICAgICAgICAgIG5vZGVDb3VudCxcbiAgICAgICAgICAgIGNvbXBvbmVudENvdW50XG4gICAgICAgIH07XG4gICAgfVxuXG5cbiAgICBwcml2YXRlIGFzeW5jIHJlYWRQcmVmYWJDb250ZW50KHByZWZhYlBhdGg6IHN0cmluZyk6IFByb21pc2U8eyBzdWNjZXNzOiBib29sZWFuOyBkYXRhPzogYW55OyBlcnJvcj86IHN0cmluZyB9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyDojrflj5bno4Hnm5jot6/lvoRcbiAgICAgICAgICAgIGNvbnN0IGRpc2tQYXRoOiBzdHJpbmcgfCBudWxsID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAncXVlcnktcGF0aCcsIHByZWZhYlBhdGgpO1xuICAgICAgICAgICAgaWYgKCFkaXNrUGF0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0Nhbm5vdCBnZXQgcHJlZmFiIGRpc2sgcGF0aCcgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g5L2/55SoZnPor7vlj5bmlofku7ZcbiAgICAgICAgICAgIGNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhkaXNrUGF0aCwgJ3V0ZjgnKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmVmYWJEYXRhID0gSlNPTi5wYXJzZShjb250ZW50KTtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBwcmVmYWJEYXRhIH07XG4gICAgICAgICAgICB9IGNhdGNoIChwYXJzZUVycm9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAn6aKE5Yi25L2T5paH5Lu25qC85byP6ZSZ6K+vJyB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ+ivu+WPlumihOWItuS9k+aWh+S7tuWksei0pScgfTtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICog5L2/55SoIGFzc2V0LWRiIEFQSSDliJvlu7rotYTmupDmlofku7ZcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDkvb/nlKggYXNzZXQtZGIgQVBJIOWIm+W7uui1hOa6kOaWh+S7tlxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgY3JlYXRlQXNzZXRXaXRoQXNzZXREQihhc3NldFBhdGg6IHN0cmluZywgY29udGVudDogc3RyaW5nKTogUHJvbWlzZTx7IHN1Y2Nlc3M6IGJvb2xlYW47IGRhdGE/OiBhbnk7IGVycm9yPzogc3RyaW5nIH0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGFzc2V0SW5mbzogYW55ID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAnY3JlYXRlLWFzc2V0JywgYXNzZXRQYXRoLCBjb250ZW50LCB7XG4gICAgICAgICAgICAgICAgb3ZlcndyaXRlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHJlbmFtZTogZmFsc2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ+WIm+W7uui1hOa6kOaWh+S7tuaIkOWKnzonLCBhc3NldEluZm8pO1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogYXNzZXRJbmZvIH07XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+WIm+W7uui1hOa6kOaWh+S7tuWksei0pTonLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ+WIm+W7uui1hOa6kOaWh+S7tuWksei0pScgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOS9v+eUqCBhc3NldC1kYiBBUEkg5Yib5bu6IG1ldGEg5paH5Lu2XG4gICAgICovXG4gICAgLyoqXG4gICAgICog5L2/55SoIGFzc2V0LWRiIEFQSSDliJvlu7ogbWV0YSDmlofku7ZcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIGNyZWF0ZU1ldGFXaXRoQXNzZXREQihhc3NldFBhdGg6IHN0cmluZywgbWV0YUNvbnRlbnQ6IGFueSk6IFByb21pc2U8eyBzdWNjZXNzOiBib29sZWFuOyBkYXRhPzogYW55OyBlcnJvcj86IHN0cmluZyB9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBtZXRhQ29udGVudFN0cmluZyA9IEpTT04uc3RyaW5naWZ5KG1ldGFDb250ZW50LCBudWxsLCAyKTtcbiAgICAgICAgICAgIGNvbnN0IGFzc2V0SW5mbzogYW55ID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAnc2F2ZS1hc3NldC1tZXRhJywgYXNzZXRQYXRoLCBtZXRhQ29udGVudFN0cmluZyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygn5Yib5bu6bWV0YeaWh+S7tuaIkOWKnzonLCBhc3NldEluZm8pO1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogYXNzZXRJbmZvIH07XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+WIm+W7um1ldGHmlofku7blpLHotKU6JywgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIHx8ICfliJvlu7ptZXRh5paH5Lu25aSx6LSlJyB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5L2/55SoIGFzc2V0LWRiIEFQSSDph43mlrDlr7zlhaXotYTmupBcbiAgICAgKi9cbiAgICAvKipcbiAgICAgKiDkvb/nlKggYXNzZXQtZGIgQVBJIOmHjeaWsOWvvOWFpei1hOa6kFxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgcmVpbXBvcnRBc3NldFdpdGhBc3NldERCKGFzc2V0UGF0aDogc3RyaW5nKTogUHJvbWlzZTx7IHN1Y2Nlc3M6IGJvb2xlYW47IGRhdGE/OiBhbnk7IGVycm9yPzogc3RyaW5nIH0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdDogYW55ID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAncmVpbXBvcnQtYXNzZXQnLCBhc3NldFBhdGgpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ+mHjeaWsOWvvOWFpei1hOa6kOaIkOWKnzonLCByZXN1bHQpO1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcmVzdWx0IH07XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+mHjeaWsOWvvOWFpei1hOa6kOWksei0pTonLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ+mHjeaWsOWvvOWFpei1hOa6kOWksei0pScgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOS9v+eUqCBhc3NldC1kYiBBUEkg5pu05paw6LWE5rqQ5paH5Lu25YaF5a65XG4gICAgICovXG4gICAgLyoqXG4gICAgICog5L2/55SoIGFzc2V0LWRiIEFQSSDmm7TmlrDotYTmupDmlofku7blhoXlrrlcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIHVwZGF0ZUFzc2V0V2l0aEFzc2V0REIoYXNzZXRQYXRoOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZyk6IFByb21pc2U8eyBzdWNjZXNzOiBib29sZWFuOyBkYXRhPzogYW55OyBlcnJvcj86IHN0cmluZyB9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQ6IGFueSA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3NhdmUtYXNzZXQnLCBhc3NldFBhdGgsIGNvbnRlbnQpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ+abtOaWsOi1hOa6kOaWh+S7tuaIkOWKnzonLCByZXN1bHQpO1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcmVzdWx0IH07XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+abtOaWsOi1hOa6kOaWh+S7tuWksei0pTonLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ+abtOaWsOi1hOa6kOaWh+S7tuWksei0pScgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWIm+W7uuespuWQiCBDb2NvcyBDcmVhdG9yIOagh+WHhueahOmihOWItuS9k+WGheWuuVxuICAgICAqIOWujOaVtOWunueOsOmAkuW9kuiKgueCueagkeWkhOeQhu+8jOWMuemFjeW8leaTjuagh+WHhuagvOW8j1xuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgY3JlYXRlU3RhbmRhcmRQcmVmYWJDb250ZW50KG5vZGVEYXRhOiBhbnksIHByZWZhYk5hbWU6IHN0cmluZywgcHJlZmFiVXVpZDogc3RyaW5nLCBpbmNsdWRlQ2hpbGRyZW46IGJvb2xlYW4sIGluY2x1ZGVDb21wb25lbnRzOiBib29sZWFuKTogUHJvbWlzZTxhbnlbXT4ge1xuICAgICAgICBjb25zb2xlLmxvZygn5byA5aeL5Yib5bu65byV5pOO5qCH5YeG6aKE5Yi25L2T5YaF5a65Li4uJyk7XG5cbiAgICAgICAgY29uc3QgcHJlZmFiRGF0YTogYW55W10gPSBbXTtcbiAgICAgICAgbGV0IGN1cnJlbnRJZCA9IDA7XG5cbiAgICAgICAgLy8gMS4g5Yib5bu66aKE5Yi25L2T6LWE5Lqn5a+56LGhIChpbmRleCAwKVxuICAgICAgICBjb25zdCBwcmVmYWJBc3NldCA9IHtcbiAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5QcmVmYWJcIixcbiAgICAgICAgICAgIFwiX25hbWVcIjogcHJlZmFiTmFtZSB8fCBcIlwiLCAvLyDnoa7kv53pooTliLbkvZPlkI3np7DkuI3kuLrnqbpcbiAgICAgICAgICAgIFwiX29iakZsYWdzXCI6IDAsXG4gICAgICAgICAgICBcIl9fZWRpdG9yRXh0cmFzX19cIjoge30sXG4gICAgICAgICAgICBcIl9uYXRpdmVcIjogXCJcIixcbiAgICAgICAgICAgIFwiZGF0YVwiOiB7XG4gICAgICAgICAgICAgICAgXCJfX2lkX19cIjogMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwib3B0aW1pemF0aW9uUG9saWN5XCI6IDAsXG4gICAgICAgICAgICBcInBlcnNpc3RlbnRcIjogZmFsc2VcbiAgICAgICAgfTtcbiAgICAgICAgcHJlZmFiRGF0YS5wdXNoKHByZWZhYkFzc2V0KTtcbiAgICAgICAgY3VycmVudElkKys7XG5cbiAgICAgICAgLy8gMi4g6YCS5b2S5Yib5bu65a6M5pW055qE6IqC54K55qCR57uT5p6EXG4gICAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgICAgICBwcmVmYWJEYXRhLFxuICAgICAgICAgICAgY3VycmVudElkOiBjdXJyZW50SWQgKyAxLCAvLyDmoLnoioLngrnljaDnlKjntKLlvJUx77yM5a2Q6IqC54K55LuO57Si5byVMuW8gOWni1xuICAgICAgICAgICAgcHJlZmFiQXNzZXRJbmRleDogMCxcbiAgICAgICAgICAgIG5vZGVGaWxlSWRzOiBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpLCAvLyDlrZjlgqjoioLngrlJROWIsGZpbGVJZOeahOaYoOWwhFxuICAgICAgICAgICAgbm9kZVV1aWRUb0luZGV4OiBuZXcgTWFwPHN0cmluZywgbnVtYmVyPigpLCAvLyDlrZjlgqjoioLngrlVVUlE5Yiw57Si5byV55qE5pig5bCEXG4gICAgICAgICAgICBjb21wb25lbnRVdWlkVG9JbmRleDogbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKSAvLyDlrZjlgqjnu4Tku7ZVVUlE5Yiw57Si5byV55qE5pig5bCEXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8g5Yib5bu65qC56IqC54K55ZKM5pW05Liq6IqC54K55qCRIC0g5rOo5oSP77ya5qC56IqC54K555qE54i26IqC54K55bqU6K+l5pivbnVsbO+8jOS4jeaYr+mihOWItuS9k+WvueixoVxuICAgICAgICBhd2FpdCB0aGlzLmNyZWF0ZUNvbXBsZXRlTm9kZVRyZWUobm9kZURhdGEsIG51bGwsIDEsIGNvbnRleHQsIGluY2x1ZGVDaGlsZHJlbiwgaW5jbHVkZUNvbXBvbmVudHMsIHByZWZhYk5hbWUpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKGDpooTliLbkvZPlhoXlrrnliJvlu7rlrozmiJDvvIzmgLvlhbEgJHtwcmVmYWJEYXRhLmxlbmd0aH0g5Liq5a+56LGhYCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCfoioLngrlmaWxlSWTmmKDlsIQ6JywgQXJyYXkuZnJvbShjb250ZXh0Lm5vZGVGaWxlSWRzLmVudHJpZXMoKSkpO1xuXG4gICAgICAgIHJldHVybiBwcmVmYWJEYXRhO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOmAkuW9kuWIm+W7uuWujOaVtOeahOiKgueCueagke+8jOWMheaLrOaJgOacieWtkOiKgueCueWSjOWvueW6lOeahFByZWZhYkluZm9cbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIGNyZWF0ZUNvbXBsZXRlTm9kZVRyZWUoXG4gICAgICAgIG5vZGVEYXRhOiBhbnksXG4gICAgICAgIHBhcmVudE5vZGVJbmRleDogbnVtYmVyIHwgbnVsbCxcbiAgICAgICAgbm9kZUluZGV4OiBudW1iZXIsXG4gICAgICAgIGNvbnRleHQ6IHtcbiAgICAgICAgICAgIHByZWZhYkRhdGE6IGFueVtdLFxuICAgICAgICAgICAgY3VycmVudElkOiBudW1iZXIsXG4gICAgICAgICAgICBwcmVmYWJBc3NldEluZGV4OiBudW1iZXIsXG4gICAgICAgICAgICBub2RlRmlsZUlkczogTWFwPHN0cmluZywgc3RyaW5nPixcbiAgICAgICAgICAgIG5vZGVVdWlkVG9JbmRleDogTWFwPHN0cmluZywgbnVtYmVyPixcbiAgICAgICAgICAgIGNvbXBvbmVudFV1aWRUb0luZGV4OiBNYXA8c3RyaW5nLCBudW1iZXI+XG4gICAgICAgIH0sXG4gICAgICAgIGluY2x1ZGVDaGlsZHJlbjogYm9vbGVhbixcbiAgICAgICAgaW5jbHVkZUNvbXBvbmVudHM6IGJvb2xlYW4sXG4gICAgICAgIG5vZGVOYW1lPzogc3RyaW5nXG4gICAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IHsgcHJlZmFiRGF0YSB9ID0gY29udGV4dDtcblxuICAgICAgICAvLyDliJvlu7roioLngrnlr7nosaFcbiAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuY3JlYXRlRW5naW5lU3RhbmRhcmROb2RlKG5vZGVEYXRhLCBwYXJlbnROb2RlSW5kZXgsIG5vZGVOYW1lKTtcblxuICAgICAgICAvLyDnoa7kv53oioLngrnlnKjmjIflrprnmoTntKLlvJXkvY3nva5cbiAgICAgICAgd2hpbGUgKHByZWZhYkRhdGEubGVuZ3RoIDw9IG5vZGVJbmRleCkge1xuICAgICAgICAgICAgcHJlZmFiRGF0YS5wdXNoKG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGDorr7nva7oioLngrnliLDntKLlvJUgJHtub2RlSW5kZXh9OiAke25vZGUuX25hbWV9LCBfcGFyZW50OmAsIG5vZGUuX3BhcmVudCwgYF9jaGlsZHJlbiBjb3VudDogJHtub2RlLl9jaGlsZHJlbi5sZW5ndGh9YCk7XG4gICAgICAgIHByZWZhYkRhdGFbbm9kZUluZGV4XSA9IG5vZGU7XG5cbiAgICAgICAgLy8g5Li65b2T5YmN6IqC54K555Sf5oiQZmlsZUlk5bm26K6w5b2VVVVJROWIsOe0ouW8leeahOaYoOWwhFxuICAgICAgICBjb25zdCBub2RlVXVpZCA9IHRoaXMuZXh0cmFjdE5vZGVVdWlkKG5vZGVEYXRhKTtcbiAgICAgICAgY29uc3QgZmlsZUlkID0gbm9kZVV1aWQgfHwgdGhpcy5nZW5lcmF0ZUZpbGVJZCgpO1xuICAgICAgICBjb250ZXh0Lm5vZGVGaWxlSWRzLnNldChub2RlSW5kZXgudG9TdHJpbmcoKSwgZmlsZUlkKTtcblxuICAgICAgICAvLyDorrDlvZXoioLngrlVVUlE5Yiw57Si5byV55qE5pig5bCEXG4gICAgICAgIGlmIChub2RlVXVpZCkge1xuICAgICAgICAgICAgY29udGV4dC5ub2RlVXVpZFRvSW5kZXguc2V0KG5vZGVVdWlkLCBub2RlSW5kZXgpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOiusOW9leiKgueCuVVVSUTmmKDlsIQ6ICR7bm9kZVV1aWR9IC0+ICR7bm9kZUluZGV4fWApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5YWI5aSE55CG5a2Q6IqC54K577yI5L+d5oyB5LiO5omL5Yqo5Yib5bu655qE57Si5byV6aG65bqP5LiA6Ie077yJXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuVG9Qcm9jZXNzID0gdGhpcy5nZXRDaGlsZHJlblRvUHJvY2Vzcyhub2RlRGF0YSk7XG4gICAgICAgIGlmIChpbmNsdWRlQ2hpbGRyZW4gJiYgY2hpbGRyZW5Ub1Byb2Nlc3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOWkhOeQhuiKgueCuSAke25vZGUuX25hbWV9IOeahCAke2NoaWxkcmVuVG9Qcm9jZXNzLmxlbmd0aH0g5Liq5a2Q6IqC54K5YCk7XG5cbiAgICAgICAgICAgIC8vIOS4uuavj+S4quWtkOiKgueCueWIhumFjee0ouW8lVxuICAgICAgICAgICAgY29uc3QgY2hpbGRJbmRpY2VzOiBudW1iZXJbXSA9IFtdO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOWHhuWkh+S4uiAke2NoaWxkcmVuVG9Qcm9jZXNzLmxlbmd0aH0g5Liq5a2Q6IqC54K55YiG6YWN57Si5byV77yM5b2T5YmNSUQ6ICR7Y29udGV4dC5jdXJyZW50SWR9YCk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuVG9Qcm9jZXNzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYOWkhOeQhuesrCAke2krMX0g5Liq5a2Q6IqC54K577yM5b2T5YmNY3VycmVudElkOiAke2NvbnRleHQuY3VycmVudElkfWApO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkSW5kZXggPSBjb250ZXh0LmN1cnJlbnRJZCsrO1xuICAgICAgICAgICAgICAgIGNoaWxkSW5kaWNlcy5wdXNoKGNoaWxkSW5kZXgpO1xuICAgICAgICAgICAgICAgIG5vZGUuX2NoaWxkcmVuLnB1c2goeyBcIl9faWRfX1wiOiBjaGlsZEluZGV4IH0pO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDinIUg5re75Yqg5a2Q6IqC54K55byV55So5YiwICR7bm9kZS5fbmFtZX06IHtfX2lkX186ICR7Y2hpbGRJbmRleH19YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg4pyFIOiKgueCuSAke25vZGUuX25hbWV9IOacgOe7iOeahOWtkOiKgueCueaVsOe7hDpgLCBub2RlLl9jaGlsZHJlbik7XG5cbiAgICAgICAgICAgIC8vIOmAkuW9kuWIm+W7uuWtkOiKgueCuVxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlblRvUHJvY2Vzcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkRGF0YSA9IGNoaWxkcmVuVG9Qcm9jZXNzW2ldO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkSW5kZXggPSBjaGlsZEluZGljZXNbaV07XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5jcmVhdGVDb21wbGV0ZU5vZGVUcmVlKFxuICAgICAgICAgICAgICAgICAgICBjaGlsZERhdGEsXG4gICAgICAgICAgICAgICAgICAgIG5vZGVJbmRleCxcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRJbmRleCxcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVkZUNoaWxkcmVuLFxuICAgICAgICAgICAgICAgICAgICBpbmNsdWRlQ29tcG9uZW50cyxcbiAgICAgICAgICAgICAgICAgICAgY2hpbGREYXRhLm5hbWUgfHwgYENoaWxkJHtpKzF9YFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyDnhLblkI7lpITnkIbnu4Tku7ZcbiAgICAgICAgaWYgKGluY2x1ZGVDb21wb25lbnRzICYmIG5vZGVEYXRhLmNvbXBvbmVudHMgJiYgQXJyYXkuaXNBcnJheShub2RlRGF0YS5jb21wb25lbnRzKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOWkhOeQhuiKgueCuSAke25vZGUuX25hbWV9IOeahCAke25vZGVEYXRhLmNvbXBvbmVudHMubGVuZ3RofSDkuKrnu4Tku7ZgKTtcblxuICAgICAgICAgICAgY29uc3QgY29tcG9uZW50SW5kaWNlczogbnVtYmVyW10gPSBbXTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgY29tcG9uZW50IG9mIG5vZGVEYXRhLmNvbXBvbmVudHMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wb25lbnRJbmRleCA9IGNvbnRleHQuY3VycmVudElkKys7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50SW5kaWNlcy5wdXNoKGNvbXBvbmVudEluZGV4KTtcbiAgICAgICAgICAgICAgICBub2RlLl9jb21wb25lbnRzLnB1c2goeyBcIl9faWRfX1wiOiBjb21wb25lbnRJbmRleCB9KTtcblxuICAgICAgICAgICAgICAgIC8vIOiusOW9lee7hOS7tlVVSUTliLDntKLlvJXnmoTmmKDlsIRcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wb25lbnRVdWlkID0gY29tcG9uZW50LnV1aWQgfHwgKGNvbXBvbmVudC52YWx1ZSAmJiBjb21wb25lbnQudmFsdWUudXVpZCk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudFV1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5jb21wb25lbnRVdWlkVG9JbmRleC5zZXQoY29tcG9uZW50VXVpZCwgY29tcG9uZW50SW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhg6K6w5b2V57uE5Lu2VVVJROaYoOWwhDogJHtjb21wb25lbnRVdWlkfSAtPiAke2NvbXBvbmVudEluZGV4fWApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIOWIm+W7uue7hOS7tuWvueixoe+8jOS8oOWFpWNvbnRleHTku6XlpITnkIblvJXnlKhcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wb25lbnRPYmogPSB0aGlzLmNyZWF0ZUNvbXBvbmVudE9iamVjdChjb21wb25lbnQsIG5vZGVJbmRleCwgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgcHJlZmFiRGF0YVtjb21wb25lbnRJbmRleF0gPSBjb21wb25lbnRPYmo7XG5cbiAgICAgICAgICAgICAgICAvLyDkuLrnu4Tku7bliJvlu7ogQ29tcFByZWZhYkluZm9cbiAgICAgICAgICAgICAgICBjb25zdCBjb21wUHJlZmFiSW5mb0luZGV4ID0gY29udGV4dC5jdXJyZW50SWQrKztcbiAgICAgICAgICAgICAgICBwcmVmYWJEYXRhW2NvbXBQcmVmYWJJbmZvSW5kZXhdID0ge1xuICAgICAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuQ29tcFByZWZhYkluZm9cIixcbiAgICAgICAgICAgICAgICAgICAgXCJmaWxlSWRcIjogdGhpcy5nZW5lcmF0ZUZpbGVJZCgpXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIC8vIOWmguaenOe7hOS7tuWvueixoeaciSBfX3ByZWZhYiDlsZ7mgKfvvIzorr7nva7lvJXnlKhcbiAgICAgICAgICAgICAgICBpZiAoY29tcG9uZW50T2JqICYmIHR5cGVvZiBjb21wb25lbnRPYmogPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudE9iai5fX3ByZWZhYiA9IHsgXCJfX2lkX19cIjogY29tcFByZWZhYkluZm9JbmRleCB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc29sZS5sb2coYOKchSDoioLngrkgJHtub2RlLl9uYW1lfSDmt7vliqDkuoYgJHtjb21wb25lbnRJbmRpY2VzLmxlbmd0aH0g5Liq57uE5Lu2YCk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8vIOS4uuW9k+WJjeiKgueCueWIm+W7ulByZWZhYkluZm9cbiAgICAgICAgY29uc3QgcHJlZmFiSW5mb0luZGV4ID0gY29udGV4dC5jdXJyZW50SWQrKztcbiAgICAgICAgbm9kZS5fcHJlZmFiID0geyBcIl9faWRfX1wiOiBwcmVmYWJJbmZvSW5kZXggfTtcblxuICAgICAgICBjb25zdCBwcmVmYWJJbmZvOiBhbnkgPSB7XG4gICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuUHJlZmFiSW5mb1wiLFxuICAgICAgICAgICAgXCJyb290XCI6IHsgXCJfX2lkX19cIjogMSB9LFxuICAgICAgICAgICAgXCJhc3NldFwiOiB7IFwiX19pZF9fXCI6IGNvbnRleHQucHJlZmFiQXNzZXRJbmRleCB9LFxuICAgICAgICAgICAgXCJmaWxlSWRcIjogZmlsZUlkLFxuICAgICAgICAgICAgXCJ0YXJnZXRPdmVycmlkZXNcIjogbnVsbCxcbiAgICAgICAgICAgIFwibmVzdGVkUHJlZmFiSW5zdGFuY2VSb290c1wiOiBudWxsXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8g5qC56IqC54K555qE54m55q6K5aSE55CGXG4gICAgICAgIGlmIChub2RlSW5kZXggPT09IDEpIHtcbiAgICAgICAgICAgIC8vIOagueiKgueCueayoeaciWluc3RhbmNl77yM5L2G5Y+v6IO95pyJdGFyZ2V0T3ZlcnJpZGVzXG4gICAgICAgICAgICBwcmVmYWJJbmZvLmluc3RhbmNlID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIOWtkOiKgueCuemAmuW4uOaciWluc3RhbmNl5Li6bnVsbFxuICAgICAgICAgICAgcHJlZmFiSW5mby5pbnN0YW5jZSA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBwcmVmYWJEYXRhW3ByZWZhYkluZm9JbmRleF0gPSBwcmVmYWJJbmZvO1xuICAgICAgICBjb250ZXh0LmN1cnJlbnRJZCA9IHByZWZhYkluZm9JbmRleCArIDE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5bCGVVVJROi9rOaNouS4ukNvY29zIENyZWF0b3LnmoTljovnvKnmoLzlvI9cbiAgICAgKiDln7rkuo7nnJ/lrp5Db2NvcyBDcmVhdG9y57yW6L6R5Zmo55qE5Y6L57yp566X5rOV5a6e546wXG4gICAgICog5YmNNeS4qmhleOWtl+espuS/neaMgeS4jeWPmO+8jOWJqeS9mTI35Liq5a2X56ym5Y6L57yp5oiQMTjkuKrlrZfnrKZcbiAgICAgKi9cbiAgICBwcml2YXRlIHV1aWRUb0NvbXByZXNzZWRJZCh1dWlkOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBCQVNFNjRfS0VZUyA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvPSc7XG5cbiAgICAgICAgLy8g56e76Zmk6L+e5a2X56ym5bm26L2s5Li65bCP5YaZXG4gICAgICAgIGNvbnN0IGNsZWFuVXVpZCA9IHV1aWQucmVwbGFjZSgvLS9nLCAnJykudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICAvLyDnoa7kv51VVUlE5pyJ5pWIXG4gICAgICAgIGlmIChjbGVhblV1aWQubGVuZ3RoICE9PSAzMikge1xuICAgICAgICAgICAgcmV0dXJuIHV1aWQ7IC8vIOWmguaenOS4jeaYr+acieaViOeahFVVSUTvvIzov5Tlm57ljp/lp4vlgLxcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENvY29zIENyZWF0b3LnmoTljovnvKnnrpfms5XvvJrliY015Liq5a2X56ym5L+d5oyB5LiN5Y+Y77yM5Ymp5L2ZMjfkuKrlrZfnrKbljovnvKnmiJAxOOS4quWtl+esplxuICAgICAgICBsZXQgcmVzdWx0ID0gY2xlYW5VdWlkLnN1YnN0cmluZygwLCA1KTtcblxuICAgICAgICAvLyDliankvZkyN+S4quWtl+espumcgOimgeWOi+e8qeaIkDE45Liq5a2X56ymXG4gICAgICAgIGNvbnN0IHJlbWFpbmRlciA9IGNsZWFuVXVpZC5zdWJzdHJpbmcoNSk7XG5cbiAgICAgICAgLy8g5q+PM+S4qmhleOWtl+espuWOi+e8qeaIkDLkuKrlrZfnrKZcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZW1haW5kZXIubGVuZ3RoOyBpICs9IDMpIHtcbiAgICAgICAgICAgIGNvbnN0IGhleDEgPSByZW1haW5kZXJbaV0gfHwgJzAnO1xuICAgICAgICAgICAgY29uc3QgaGV4MiA9IHJlbWFpbmRlcltpICsgMV0gfHwgJzAnO1xuICAgICAgICAgICAgY29uc3QgaGV4MyA9IHJlbWFpbmRlcltpICsgMl0gfHwgJzAnO1xuXG4gICAgICAgICAgICAvLyDlsIYz5LiqaGV45a2X56ymKDEy5L2NKei9rOaNouS4ujLkuKpiYXNlNjTlrZfnrKZcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcGFyc2VJbnQoaGV4MSArIGhleDIgKyBoZXgzLCAxNik7XG5cbiAgICAgICAgICAgIC8vIDEy5L2N5YiG5oiQ5Lik5LiqNuS9jVxuICAgICAgICAgICAgY29uc3QgaGlnaDYgPSAodmFsdWUgPj4gNikgJiA2MztcbiAgICAgICAgICAgIGNvbnN0IGxvdzYgPSB2YWx1ZSAmIDYzO1xuXG4gICAgICAgICAgICByZXN1bHQgKz0gQkFTRTY0X0tFWVNbaGlnaDZdICsgQkFTRTY0X0tFWVNbbG93Nl07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWIm+W7uue7hOS7tuWvueixoVxuICAgICAqL1xuICAgIHByaXZhdGUgY3JlYXRlQ29tcG9uZW50T2JqZWN0KGNvbXBvbmVudERhdGE6IGFueSwgbm9kZUluZGV4OiBudW1iZXIsIGNvbnRleHQ/OiB7XG4gICAgICAgIG5vZGVVdWlkVG9JbmRleD86IE1hcDxzdHJpbmcsIG51bWJlcj4sXG4gICAgICAgIGNvbXBvbmVudFV1aWRUb0luZGV4PzogTWFwPHN0cmluZywgbnVtYmVyPlxuICAgIH0pOiBhbnkge1xuICAgICAgICBsZXQgY29tcG9uZW50VHlwZSA9IGNvbXBvbmVudERhdGEudHlwZSB8fCBjb21wb25lbnREYXRhLl9fdHlwZV9fIHx8ICdjYy5Db21wb25lbnQnO1xuICAgICAgICBjb25zdCBlbmFibGVkID0gY29tcG9uZW50RGF0YS5lbmFibGVkICE9PSB1bmRlZmluZWQgPyBjb21wb25lbnREYXRhLmVuYWJsZWQgOiB0cnVlO1xuXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGDliJvlu7rnu4Tku7blr7nosaEgLSDljp/lp4vnsbvlnos6ICR7Y29tcG9uZW50VHlwZX1gKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ+e7hOS7tuWujOaVtOaVsOaNrjonLCBKU09OLnN0cmluZ2lmeShjb21wb25lbnREYXRhLCBudWxsLCAyKSk7XG5cbiAgICAgICAgLy8g5aSE55CG6ISa5pys57uE5Lu277ya5q2j5bi45bqU5bey5piv5Y6L57ypVVVJRChxdWVyeS1ub2RlIOebtOiwg+S/neivgSnvvJvpmLLlvqHlhZzlupUoZm9yaynigJTigJRcbiAgICAgICAgLy8g6Iul5ou/5Yiw55qE5piv5piO5paH57G75ZCNKOmdniA1aGV4KzE4YmFzZTY0KSxwcmVmYWIg5a+85YWl5Lya5Y+N5bqP5YiX5YyW5oiQIG51bGwg57uE5Lu277yMXG4gICAgICAgIC8vIOWwneivleS7jiBfX3NjcmlwdEFzc2V0IOiEmuacrOi1hOS6pyB1dWlkIOaOqOWvvOWOi+e8qVVVSUTvvJvmjqjkuI3lh7rliJnlkYrorabjgIJcbiAgICAgICAgaWYgKGNvbXBvbmVudFR5cGUgJiYgIWNvbXBvbmVudFR5cGUuc3RhcnRzV2l0aCgnY2MuJykgJiYgIS9eWzAtOWEtZl17NX1bMC05QS1aYS16Ky9dezE4fSQvLnRlc3QoY29tcG9uZW50VHlwZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IHNjcmlwdFV1aWQgPSBjb21wb25lbnREYXRhLnByb3BlcnRpZXM/Ll9fc2NyaXB0QXNzZXQ/LnZhbHVlPy51dWlkXG4gICAgICAgICAgICAgICAgfHwgY29tcG9uZW50RGF0YS5fX3NjcmlwdEFzc2V0Py52YWx1ZT8udXVpZFxuICAgICAgICAgICAgICAgIHx8IGNvbXBvbmVudERhdGEudmFsdWU/Ll9fc2NyaXB0QXNzZXQ/LnZhbHVlPy51dWlkO1xuICAgICAgICAgICAgaWYgKHNjcmlwdFV1aWQgJiYgdHlwZW9mIHNjcmlwdFV1aWQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50VHlwZSA9IHRoaXMudXVpZFRvQ29tcHJlc3NlZElkKHNjcmlwdFV1aWQpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDohJrmnKznu4Tku7bmmI7mlofnsbvlkI3lt7LovazljovnvKlVVUlEOiAke2NvbXBvbmVudFR5cGV9YCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybihg6ISa5pys57uE5Lu2IF9fdHlwZV9fIOS4uuaYjuaWh+exu+WQjSgke2NvbXBvbmVudFR5cGV9KeS4lOaXoOiEmuacrHV1aWTlj6/mjqjlr7zvvIxwcmVmYWIg5a+85YWl5ZCO6K+l57uE5Lu25Y+v6IO95Li6IG51bGxgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWfuuehgOe7hOS7tue7k+aehFxuICAgICAgICBjb25zdCBjb21wb25lbnQ6IGFueSA9IHtcbiAgICAgICAgICAgIFwiX190eXBlX19cIjogY29tcG9uZW50VHlwZSxcbiAgICAgICAgICAgIFwiX25hbWVcIjogXCJcIixcbiAgICAgICAgICAgIFwiX29iakZsYWdzXCI6IDAsXG4gICAgICAgICAgICBcIl9fZWRpdG9yRXh0cmFzX19cIjoge30sXG4gICAgICAgICAgICBcIm5vZGVcIjogeyBcIl9faWRfX1wiOiBub2RlSW5kZXggfSxcbiAgICAgICAgICAgIFwiX2VuYWJsZWRcIjogZW5hYmxlZFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIOaPkOWJjeiuvue9riBfX3ByZWZhYiDlsZ7mgKfljaDkvY3nrKbvvIzlkI7nu63kvJrooqvmraPnoa7orr7nva5cbiAgICAgICAgY29tcG9uZW50Ll9fcHJlZmFiID0gbnVsbDtcblxuICAgICAgICAvLyDmoLnmja7nu4Tku7bnsbvlnovmt7vliqDnibnlrprlsZ7mgKdcbiAgICAgICAgaWYgKGNvbXBvbmVudFR5cGUgPT09ICdjYy5VSVRyYW5zZm9ybScpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnRTaXplID0gY29tcG9uZW50RGF0YS5wcm9wZXJ0aWVzPy5jb250ZW50U2l6ZT8udmFsdWUgfHwgeyB3aWR0aDogMTAwLCBoZWlnaHQ6IDEwMCB9O1xuICAgICAgICAgICAgY29uc3QgYW5jaG9yUG9pbnQgPSBjb21wb25lbnREYXRhLnByb3BlcnRpZXM/LmFuY2hvclBvaW50Py52YWx1ZSB8fCB7IHg6IDAuNSwgeTogMC41IH07XG5cbiAgICAgICAgICAgIGNvbXBvbmVudC5fY29udGVudFNpemUgPSB7XG4gICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlNpemVcIixcbiAgICAgICAgICAgICAgICBcIndpZHRoXCI6IGNvbnRlbnRTaXplLndpZHRoLFxuICAgICAgICAgICAgICAgIFwiaGVpZ2h0XCI6IGNvbnRlbnRTaXplLmhlaWdodFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fYW5jaG9yUG9pbnQgPSB7XG4gICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlZlYzJcIixcbiAgICAgICAgICAgICAgICBcInhcIjogYW5jaG9yUG9pbnQueCxcbiAgICAgICAgICAgICAgICBcInlcIjogYW5jaG9yUG9pbnQueVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChjb21wb25lbnRUeXBlID09PSAnY2MuU3ByaXRlJykge1xuICAgICAgICAgICAgLy8g5aSE55CGU3ByaXRl57uE5Lu255qEc3ByaXRlRnJhbWXlvJXnlKhcbiAgICAgICAgICAgIGNvbnN0IHNwcml0ZUZyYW1lUHJvcCA9IGNvbXBvbmVudERhdGEucHJvcGVydGllcz8uX3Nwcml0ZUZyYW1lIHx8IGNvbXBvbmVudERhdGEucHJvcGVydGllcz8uc3ByaXRlRnJhbWU7XG4gICAgICAgICAgICBpZiAoc3ByaXRlRnJhbWVQcm9wKSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50Ll9zcHJpdGVGcmFtZSA9IHRoaXMucHJvY2Vzc0NvbXBvbmVudFByb3BlcnR5KHNwcml0ZUZyYW1lUHJvcCwgY29udGV4dCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5fc3ByaXRlRnJhbWUgPSBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb21wb25lbnQuX3R5cGUgPSBjb21wb25lbnREYXRhLnByb3BlcnRpZXM/Ll90eXBlPy52YWx1ZSA/PyAwO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9maWxsVHlwZSA9IGNvbXBvbmVudERhdGEucHJvcGVydGllcz8uX2ZpbGxUeXBlPy52YWx1ZSA/PyAwO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9zaXplTW9kZSA9IGNvbXBvbmVudERhdGEucHJvcGVydGllcz8uX3NpemVNb2RlPy52YWx1ZSA/PyAxO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9maWxsQ2VudGVyID0geyBcIl9fdHlwZV9fXCI6IFwiY2MuVmVjMlwiLCBcInhcIjogMCwgXCJ5XCI6IDAgfTtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fZmlsbFN0YXJ0ID0gY29tcG9uZW50RGF0YS5wcm9wZXJ0aWVzPy5fZmlsbFN0YXJ0Py52YWx1ZSA/PyAwO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9maWxsUmFuZ2UgPSBjb21wb25lbnREYXRhLnByb3BlcnRpZXM/Ll9maWxsUmFuZ2U/LnZhbHVlID8/IDA7XG4gICAgICAgICAgICBjb21wb25lbnQuX2lzVHJpbW1lZE1vZGUgPSBjb21wb25lbnREYXRhLnByb3BlcnRpZXM/Ll9pc1RyaW1tZWRNb2RlPy52YWx1ZSA/PyB0cnVlO1xuICAgICAgICAgICAgY29tcG9uZW50Ll91c2VHcmF5c2NhbGUgPSBjb21wb25lbnREYXRhLnByb3BlcnRpZXM/Ll91c2VHcmF5c2NhbGU/LnZhbHVlID8/IGZhbHNlO1xuXG4gICAgICAgICAgICAvLyDosIPor5XvvJrmiZPljbBTcHJpdGXnu4Tku7bnmoTmiYDmnInlsZ7mgKfvvIjlt7Lms6jph4rvvIlcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdTcHJpdGXnu4Tku7blsZ7mgKc6JywgSlNPTi5zdHJpbmdpZnkoY29tcG9uZW50RGF0YS5wcm9wZXJ0aWVzLCBudWxsLCAyKSk7XG4gICAgICAgICAgICBjb21wb25lbnQuX2F0bGFzID0gbnVsbDtcbiAgICAgICAgICAgIGNvbXBvbmVudC5faWQgPSBcIlwiO1xuICAgICAgICB9IGVsc2UgaWYgKGNvbXBvbmVudFR5cGUgPT09ICdjYy5CdXR0b24nKSB7XG4gICAgICAgICAgICBjb21wb25lbnQuX2ludGVyYWN0YWJsZSA9IHRydWU7XG4gICAgICAgICAgICBjb21wb25lbnQuX3RyYW5zaXRpb24gPSAzO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9ub3JtYWxDb2xvciA9IHsgXCJfX3R5cGVfX1wiOiBcImNjLkNvbG9yXCIsIFwiclwiOiAyNTUsIFwiZ1wiOiAyNTUsIFwiYlwiOiAyNTUsIFwiYVwiOiAyNTUgfTtcbiAgICAgICAgICAgIGNvbXBvbmVudC5faG92ZXJDb2xvciA9IHsgXCJfX3R5cGVfX1wiOiBcImNjLkNvbG9yXCIsIFwiclwiOiAyMTEsIFwiZ1wiOiAyMTEsIFwiYlwiOiAyMTEsIFwiYVwiOiAyNTUgfTtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fcHJlc3NlZENvbG9yID0geyBcIl9fdHlwZV9fXCI6IFwiY2MuQ29sb3JcIiwgXCJyXCI6IDI1NSwgXCJnXCI6IDI1NSwgXCJiXCI6IDI1NSwgXCJhXCI6IDI1NSB9O1xuICAgICAgICAgICAgY29tcG9uZW50Ll9kaXNhYmxlZENvbG9yID0geyBcIl9fdHlwZV9fXCI6IFwiY2MuQ29sb3JcIiwgXCJyXCI6IDEyNCwgXCJnXCI6IDEyNCwgXCJiXCI6IDEyNCwgXCJhXCI6IDI1NSB9O1xuICAgICAgICAgICAgY29tcG9uZW50Ll9ub3JtYWxTcHJpdGUgPSBudWxsO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9ob3ZlclNwcml0ZSA9IG51bGw7XG4gICAgICAgICAgICBjb21wb25lbnQuX3ByZXNzZWRTcHJpdGUgPSBudWxsO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9kaXNhYmxlZFNwcml0ZSA9IG51bGw7XG4gICAgICAgICAgICBjb21wb25lbnQuX2R1cmF0aW9uID0gMC4xO1xuICAgICAgICAgICAgY29tcG9uZW50Ll96b29tU2NhbGUgPSAxLjI7XG4gICAgICAgICAgICAvLyDlpITnkIZCdXR0b27nmoR0YXJnZXTlvJXnlKhcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldFByb3AgPSBjb21wb25lbnREYXRhLnByb3BlcnRpZXM/Ll90YXJnZXQgfHwgY29tcG9uZW50RGF0YS5wcm9wZXJ0aWVzPy50YXJnZXQ7XG4gICAgICAgICAgICBpZiAodGFyZ2V0UHJvcCkge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5fdGFyZ2V0ID0gdGhpcy5wcm9jZXNzQ29tcG9uZW50UHJvcGVydHkodGFyZ2V0UHJvcCwgY29udGV4dCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5fdGFyZ2V0ID0geyBcIl9faWRfX1wiOiBub2RlSW5kZXggfTsgLy8g6buY6K6k5oyH5ZCR6Ieq6Lqr6IqC54K5XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb21wb25lbnQuX2NsaWNrRXZlbnRzID0gW107XG4gICAgICAgICAgICBjb21wb25lbnQuX2lkID0gXCJcIjtcbiAgICAgICAgfSBlbHNlIGlmIChjb21wb25lbnRUeXBlID09PSAnY2MuTGFiZWwnKSB7XG4gICAgICAgICAgICBjb21wb25lbnQuX3N0cmluZyA9IGNvbXBvbmVudERhdGEucHJvcGVydGllcz8uX3N0cmluZz8udmFsdWUgfHwgXCJMYWJlbFwiO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9ob3Jpem9udGFsQWxpZ24gPSAxO1xuICAgICAgICAgICAgY29tcG9uZW50Ll92ZXJ0aWNhbEFsaWduID0gMTtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fYWN0dWFsRm9udFNpemUgPSAyMDtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fZm9udFNpemUgPSAyMDtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fZm9udEZhbWlseSA9IFwiQXJpYWxcIjtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fbGluZUhlaWdodCA9IDI1O1xuICAgICAgICAgICAgY29tcG9uZW50Ll9vdmVyZmxvdyA9IDA7XG4gICAgICAgICAgICBjb21wb25lbnQuX2VuYWJsZVdyYXBUZXh0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fZm9udCA9IG51bGw7XG4gICAgICAgICAgICBjb21wb25lbnQuX2lzU3lzdGVtRm9udFVzZWQgPSB0cnVlO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9zcGFjaW5nWCA9IDA7XG4gICAgICAgICAgICBjb21wb25lbnQuX2lzSXRhbGljID0gZmFsc2U7XG4gICAgICAgICAgICBjb21wb25lbnQuX2lzQm9sZCA9IGZhbHNlO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9pc1VuZGVybGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgY29tcG9uZW50Ll91bmRlcmxpbmVIZWlnaHQgPSAyO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9jYWNoZU1vZGUgPSAwO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9pZCA9IFwiXCI7XG4gICAgICAgIH0gZWxzZSBpZiAoY29tcG9uZW50RGF0YS5wcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICAvLyDlpITnkIbmiYDmnInnu4Tku7bnmoTlsZ7mgKfvvIjljIXmi6zlhoXnva7nu4Tku7blkozoh6rlrprkuYnohJrmnKznu4Tku7bvvIlcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGNvbXBvbmVudERhdGEucHJvcGVydGllcykpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSAnbm9kZScgfHwga2V5ID09PSAnZW5hYmxlZCcgfHwga2V5ID09PSAnX190eXBlX18nIHx8XG4gICAgICAgICAgICAgICAgICAgIGtleSA9PT0gJ3V1aWQnIHx8IGtleSA9PT0gJ25hbWUnIHx8IGtleSA9PT0gJ19fc2NyaXB0QXNzZXQnIHx8IGtleSA9PT0gJ19vYmpGbGFncycpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7IC8vIOi3s+i/h+i/meS6m+eJueauiuWxnuaAp++8jOWMheaLrF9vYmpGbGFnc1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIOWvueS6juS7peS4i+WIkue6v+W8gOWktOeahOWxnuaAp++8jOmcgOimgeeJueauiuWkhOeQhlxuICAgICAgICAgICAgICAgIGlmIChrZXkuc3RhcnRzV2l0aCgnXycpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOehruS/neWxnuaAp+WQjeS/neaMgeWOn+agt++8iOWMheaLrOS4i+WIkue6v++8iVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9wVmFsdWUgPSB0aGlzLnByb2Nlc3NDb21wb25lbnRQcm9wZXJ0eSh2YWx1ZSwgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wVmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50W2tleV0gPSBwcm9wVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyDpnZ7kuIvliJLnur/lvIDlpLTnmoTlsZ7mgKfmraPluLjlpITnkIZcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvcFZhbHVlID0gdGhpcy5wcm9jZXNzQ29tcG9uZW50UHJvcGVydHkodmFsdWUsIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJvcFZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFtrZXldID0gcHJvcFZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g56Gu5L+dIF9pZCDlnKjmnIDlkI7kvY3nva5cbiAgICAgICAgY29uc3QgX2lkID0gY29tcG9uZW50Ll9pZCB8fCBcIlwiO1xuICAgICAgICBkZWxldGUgY29tcG9uZW50Ll9pZDtcbiAgICAgICAgY29tcG9uZW50Ll9pZCA9IF9pZDtcblxuICAgICAgICByZXR1cm4gY29tcG9uZW50O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWkhOeQhue7hOS7tuWxnuaAp+WAvO+8jOehruS/neagvOW8j+S4juaJi+WKqOWIm+W7uueahOmihOWItuS9k+S4gOiHtFxuICAgICAqL1xuICAgIHByaXZhdGUgcHJvY2Vzc0NvbXBvbmVudFByb3BlcnR5KHByb3BEYXRhOiBhbnksIGNvbnRleHQ/OiB7XG4gICAgICAgIG5vZGVVdWlkVG9JbmRleD86IE1hcDxzdHJpbmcsIG51bWJlcj4sXG4gICAgICAgIGNvbXBvbmVudFV1aWRUb0luZGV4PzogTWFwPHN0cmluZywgbnVtYmVyPlxuICAgIH0pOiBhbnkge1xuICAgICAgICBpZiAoIXByb3BEYXRhIHx8IHR5cGVvZiBwcm9wRGF0YSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9wRGF0YTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHZhbHVlID0gcHJvcERhdGEudmFsdWU7XG4gICAgICAgIGNvbnN0IHR5cGUgPSBwcm9wRGF0YS50eXBlO1xuXG4gICAgICAgIC8vIOWkhOeQhm51bGzlgLxcbiAgICAgICAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5aSE55CG56m6VVVJROWvueixoe+8jOi9rOaNouS4um51bGxcbiAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUudXVpZCA9PT0gJycpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5aSE55CG6IqC54K55byV55SoXG4gICAgICAgIGlmICh0eXBlID09PSAnY2MuTm9kZScgJiYgdmFsdWU/LnV1aWQpIHtcbiAgICAgICAgICAgIC8vIOWcqOmihOWItuS9k+S4re+8jOiKgueCueW8leeUqOmcgOimgei9rOaNouS4uiBfX2lkX18g5b2i5byPXG4gICAgICAgICAgICBpZiAoY29udGV4dD8ubm9kZVV1aWRUb0luZGV4ICYmIGNvbnRleHQubm9kZVV1aWRUb0luZGV4Lmhhcyh2YWx1ZS51dWlkKSkge1xuICAgICAgICAgICAgICAgIC8vIOWGhemDqOW8leeUqO+8mui9rOaNouS4ul9faWRfX+agvOW8j1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIFwiX19pZF9fXCI6IGNvbnRleHQubm9kZVV1aWRUb0luZGV4LmdldCh2YWx1ZS51dWlkKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyDlpJbpg6jlvJXnlKjvvJrorr7nva7kuLpudWxs77yM5Zug5Li65aSW6YOo6IqC54K55LiN5bGe5LqO6aKE5Yi25L2T57uT5p6EXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYE5vZGUgcmVmZXJlbmNlIFVVSUQgJHt2YWx1ZS51dWlkfSBub3QgZm91bmQgaW4gcHJlZmFiIGNvbnRleHQsIHNldHRpbmcgdG8gbnVsbCAoZXh0ZXJuYWwgcmVmZXJlbmNlKWApO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDlpITnkIbotYTmupDlvJXnlKjvvIjpooTliLbkvZPjgIHnurnnkIbjgIHnsr7ngbXluKfnrYnvvIlcbiAgICAgICAgaWYgKHZhbHVlPy51dWlkICYmIChcbiAgICAgICAgICAgIHR5cGUgPT09ICdjYy5QcmVmYWInIHx8XG4gICAgICAgICAgICB0eXBlID09PSAnY2MuVGV4dHVyZTJEJyB8fFxuICAgICAgICAgICAgdHlwZSA9PT0gJ2NjLlNwcml0ZUZyYW1lJyB8fFxuICAgICAgICAgICAgdHlwZSA9PT0gJ2NjLk1hdGVyaWFsJyB8fFxuICAgICAgICAgICAgdHlwZSA9PT0gJ2NjLkFuaW1hdGlvbkNsaXAnIHx8XG4gICAgICAgICAgICB0eXBlID09PSAnY2MuQXVkaW9DbGlwJyB8fFxuICAgICAgICAgICAgdHlwZSA9PT0gJ2NjLkZvbnQnIHx8XG4gICAgICAgICAgICB0eXBlID09PSAnY2MuQXNzZXQnXG4gICAgICAgICkpIHtcbiAgICAgICAgICAgIC8vIOWvueS6jumihOWItuS9k+W8leeUqO+8jOS/neaMgeWOn+Wni1VVSUTmoLzlvI9cbiAgICAgICAgICAgIGNvbnN0IHV1aWRUb1VzZSA9IHR5cGUgPT09ICdjYy5QcmVmYWInID8gdmFsdWUudXVpZCA6IHRoaXMudXVpZFRvQ29tcHJlc3NlZElkKHZhbHVlLnV1aWQpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBcIl9fdXVpZF9fXCI6IHV1aWRUb1VzZSxcbiAgICAgICAgICAgICAgICBcIl9fZXhwZWN0ZWRUeXBlX19cIjogdHlwZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWkhOeQhue7hOS7tuW8leeUqO+8iOWMheaLrOWFt+S9k+eahOe7hOS7tuexu+Wei+WmgmNjLkxhYmVsLCBjYy5CdXR0b27nrYnvvIlcbiAgICAgICAgaWYgKHZhbHVlPy51dWlkICYmICh0eXBlID09PSAnY2MuQ29tcG9uZW50JyB8fFxuICAgICAgICAgICAgdHlwZSA9PT0gJ2NjLkxhYmVsJyB8fCB0eXBlID09PSAnY2MuQnV0dG9uJyB8fCB0eXBlID09PSAnY2MuU3ByaXRlJyB8fFxuICAgICAgICAgICAgdHlwZSA9PT0gJ2NjLlVJVHJhbnNmb3JtJyB8fCB0eXBlID09PSAnY2MuUmlnaWRCb2R5MkQnIHx8XG4gICAgICAgICAgICB0eXBlID09PSAnY2MuQm94Q29sbGlkZXIyRCcgfHwgdHlwZSA9PT0gJ2NjLkFuaW1hdGlvbicgfHxcbiAgICAgICAgICAgIHR5cGUgPT09ICdjYy5BdWRpb1NvdXJjZScgfHwgKHR5cGU/LnN0YXJ0c1dpdGgoJ2NjLicpICYmICF0eXBlLmluY2x1ZGVzKCdAJykpKSkge1xuICAgICAgICAgICAgLy8g5Zyo6aKE5Yi25L2T5Lit77yM57uE5Lu25byV55So5Lmf6ZyA6KaB6L2s5o2i5Li6IF9faWRfXyDlvaLlvI9cbiAgICAgICAgICAgIGlmIChjb250ZXh0Py5jb21wb25lbnRVdWlkVG9JbmRleCAmJiBjb250ZXh0LmNvbXBvbmVudFV1aWRUb0luZGV4Lmhhcyh2YWx1ZS51dWlkKSkge1xuICAgICAgICAgICAgICAgIC8vIOWGhemDqOW8leeUqO+8mui9rOaNouS4ul9faWRfX+agvOW8j1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBDb21wb25lbnQgcmVmZXJlbmNlICR7dHlwZX0gVVVJRCAke3ZhbHVlLnV1aWR9IGZvdW5kIGluIHByZWZhYiBjb250ZXh0LCBjb252ZXJ0aW5nIHRvIF9faWRfX2ApO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIFwiX19pZF9fXCI6IGNvbnRleHQuY29tcG9uZW50VXVpZFRvSW5kZXguZ2V0KHZhbHVlLnV1aWQpXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIOWklumDqOW8leeUqO+8muiuvue9ruS4um51bGzvvIzlm6DkuLrlpJbpg6jnu4Tku7bkuI3lsZ7kuo7pooTliLbkvZPnu5PmnoRcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgQ29tcG9uZW50IHJlZmVyZW5jZSAke3R5cGV9IFVVSUQgJHt2YWx1ZS51dWlkfSBub3QgZm91bmQgaW4gcHJlZmFiIGNvbnRleHQsIHNldHRpbmcgdG8gbnVsbCAoZXh0ZXJuYWwgcmVmZXJlbmNlKWApO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDlpITnkIblpI3mnYLnsbvlnovvvIzmt7vliqBfX3R5cGVfX+agh+iusFxuICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdjYy5Db2xvcicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuQ29sb3JcIixcbiAgICAgICAgICAgICAgICAgICAgXCJyXCI6IE1hdGgubWluKDI1NSwgTWF0aC5tYXgoMCwgTnVtYmVyKHZhbHVlLnIpIHx8IDApKSxcbiAgICAgICAgICAgICAgICAgICAgXCJnXCI6IE1hdGgubWluKDI1NSwgTWF0aC5tYXgoMCwgTnVtYmVyKHZhbHVlLmcpIHx8IDApKSxcbiAgICAgICAgICAgICAgICAgICAgXCJiXCI6IE1hdGgubWluKDI1NSwgTWF0aC5tYXgoMCwgTnVtYmVyKHZhbHVlLmIpIHx8IDApKSxcbiAgICAgICAgICAgICAgICAgICAgXCJhXCI6IHZhbHVlLmEgIT09IHVuZGVmaW5lZCA/IE1hdGgubWluKDI1NSwgTWF0aC5tYXgoMCwgTnVtYmVyKHZhbHVlLmEpKSkgOiAyNTVcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnY2MuVmVjMycpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuVmVjM1wiLFxuICAgICAgICAgICAgICAgICAgICBcInhcIjogTnVtYmVyKHZhbHVlLngpIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgIFwieVwiOiBOdW1iZXIodmFsdWUueSkgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgXCJ6XCI6IE51bWJlcih2YWx1ZS56KSB8fCAwXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2NjLlZlYzInKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlZlYzJcIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4XCI6IE51bWJlcih2YWx1ZS54KSB8fCAwLFxuICAgICAgICAgICAgICAgICAgICBcInlcIjogTnVtYmVyKHZhbHVlLnkpIHx8IDBcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnY2MuU2l6ZScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuU2l6ZVwiLFxuICAgICAgICAgICAgICAgICAgICBcIndpZHRoXCI6IE51bWJlcih2YWx1ZS53aWR0aCkgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgXCJoZWlnaHRcIjogTnVtYmVyKHZhbHVlLmhlaWdodCkgfHwgMFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdjYy5RdWF0Jykge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5RdWF0XCIsXG4gICAgICAgICAgICAgICAgICAgIFwieFwiOiBOdW1iZXIodmFsdWUueCkgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgXCJ5XCI6IE51bWJlcih2YWx1ZS55KSB8fCAwLFxuICAgICAgICAgICAgICAgICAgICBcInpcIjogTnVtYmVyKHZhbHVlLnopIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgIFwid1wiOiB2YWx1ZS53ICE9PSB1bmRlZmluZWQgPyBOdW1iZXIodmFsdWUudykgOiAxXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWkhOeQhuaVsOe7hOexu+Wei1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgIC8vIOiKgueCueaVsOe7hFxuICAgICAgICAgICAgaWYgKHByb3BEYXRhLmVsZW1lbnRUeXBlRGF0YT8udHlwZSA9PT0gJ2NjLk5vZGUnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLm1hcChpdGVtID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0/LnV1aWQgJiYgY29udGV4dD8ubm9kZVV1aWRUb0luZGV4Py5oYXMoaXRlbS51dWlkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgXCJfX2lkX19cIjogY29udGV4dC5ub2RlVXVpZFRvSW5kZXguZ2V0KGl0ZW0udXVpZCkgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9KS5maWx0ZXIoaXRlbSA9PiBpdGVtICE9PSBudWxsKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g6LWE5rqQ5pWw57uEXG4gICAgICAgICAgICBpZiAocHJvcERhdGEuZWxlbWVudFR5cGVEYXRhPy50eXBlICYmIHByb3BEYXRhLmVsZW1lbnRUeXBlRGF0YS50eXBlLnN0YXJ0c1dpdGgoJ2NjLicpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLm1hcChpdGVtID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0/LnV1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJfX3V1aWRfX1wiOiB0aGlzLnV1aWRUb0NvbXByZXNzZWRJZChpdGVtLnV1aWQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiX19leHBlY3RlZFR5cGVfX1wiOiBwcm9wRGF0YS5lbGVtZW50VHlwZURhdGEudHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9KS5maWx0ZXIoaXRlbSA9PiBpdGVtICE9PSBudWxsKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g5Z+656GA57G75Z6L5pWw57uEXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUubWFwKGl0ZW0gPT4gaXRlbT8udmFsdWUgIT09IHVuZGVmaW5lZCA/IGl0ZW0udmFsdWUgOiBpdGVtKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWFtuS7luWkjeadguWvueixoeexu+Wei++8jOS/neaMgeWOn+agt+S9huehruS/neaciV9fdHlwZV9f5qCH6K6wXG4gICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHR5cGUgJiYgdHlwZS5zdGFydHNXaXRoKCdjYy4nKSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IHR5cGUsXG4gICAgICAgICAgICAgICAgLi4udmFsdWVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5Yib5bu656ym5ZCI5byV5pOO5qCH5YeG55qE6IqC54K55a+56LGhXG4gICAgICovXG4gICAgcHJpdmF0ZSBjcmVhdGVFbmdpbmVTdGFuZGFyZE5vZGUobm9kZURhdGE6IGFueSwgcGFyZW50Tm9kZUluZGV4OiBudW1iZXIgfCBudWxsLCBub2RlTmFtZT86IHN0cmluZyk6IGFueSB7XG4gICAgICAgIC8vIOiwg+ivle+8muaJk+WNsOWOn+Wni+iKgueCueaVsOaNru+8iOW3suazqOmHiu+8iVxuICAgICAgICAvLyBjb25zb2xlLmxvZygn5Y6f5aeL6IqC54K55pWw5o2uOicsIEpTT04uc3RyaW5naWZ5KG5vZGVEYXRhLCBudWxsLCAyKSk7XG5cbiAgICAgICAgLy8g5o+Q5Y+W6IqC54K555qE5Z+65pys5bGe5oCnXG4gICAgICAgIGNvbnN0IGdldFZhbHVlID0gKHByb3A6IGFueSkgPT4ge1xuICAgICAgICAgICAgaWYgKHByb3A/LnZhbHVlICE9PSB1bmRlZmluZWQpIHJldHVybiBwcm9wLnZhbHVlO1xuICAgICAgICAgICAgaWYgKHByb3AgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHByb3A7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IGdldFZhbHVlKG5vZGVEYXRhLnBvc2l0aW9uKSB8fCBnZXRWYWx1ZShub2RlRGF0YS52YWx1ZT8ucG9zaXRpb24pIHx8IHsgeDogMCwgeTogMCwgejogMCB9O1xuICAgICAgICBjb25zdCByb3RhdGlvbiA9IGdldFZhbHVlKG5vZGVEYXRhLnJvdGF0aW9uKSB8fCBnZXRWYWx1ZShub2RlRGF0YS52YWx1ZT8ucm90YXRpb24pIHx8IHsgeDogMCwgeTogMCwgejogMCwgdzogMSB9O1xuICAgICAgICBjb25zdCBzY2FsZSA9IGdldFZhbHVlKG5vZGVEYXRhLnNjYWxlKSB8fCBnZXRWYWx1ZShub2RlRGF0YS52YWx1ZT8uc2NhbGUpIHx8IHsgeDogMSwgeTogMSwgejogMSB9O1xuICAgICAgICBjb25zdCBhY3RpdmUgPSBnZXRWYWx1ZShub2RlRGF0YS5hY3RpdmUpID8/IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5hY3RpdmUpID8/IHRydWU7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBub2RlTmFtZSB8fCBnZXRWYWx1ZShub2RlRGF0YS5uYW1lKSB8fCBnZXRWYWx1ZShub2RlRGF0YS52YWx1ZT8ubmFtZSkgfHwgJ05vZGUnO1xuICAgICAgICBjb25zdCBsYXllciA9IGdldFZhbHVlKG5vZGVEYXRhLmxheWVyKSB8fCBnZXRWYWx1ZShub2RlRGF0YS52YWx1ZT8ubGF5ZXIpIHx8IDEwNzM3NDE4MjQ7XG5cbiAgICAgICAgLy8g6LCD6K+V6L6T5Ye6XG4gICAgICAgIGNvbnNvbGUubG9nKGDliJvlu7roioLngrk6ICR7bmFtZX0sIHBhcmVudE5vZGVJbmRleDogJHtwYXJlbnROb2RlSW5kZXh9YCk7XG5cbiAgICAgICAgY29uc3QgcGFyZW50UmVmID0gcGFyZW50Tm9kZUluZGV4ICE9PSBudWxsID8geyBcIl9faWRfX1wiOiBwYXJlbnROb2RlSW5kZXggfSA6IG51bGw7XG4gICAgICAgIGNvbnNvbGUubG9nKGDoioLngrkgJHtuYW1lfSDnmoTniLboioLngrnlvJXnlKg6YCwgcGFyZW50UmVmKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLk5vZGVcIixcbiAgICAgICAgICAgIFwiX25hbWVcIjogbmFtZSxcbiAgICAgICAgICAgIFwiX29iakZsYWdzXCI6IDAsXG4gICAgICAgICAgICBcIl9fZWRpdG9yRXh0cmFzX19cIjoge30sXG4gICAgICAgICAgICBcIl9wYXJlbnRcIjogcGFyZW50UmVmLFxuICAgICAgICAgICAgXCJfY2hpbGRyZW5cIjogW10sIC8vIOWtkOiKgueCueW8leeUqOWwhuWcqOmAkuW9kui/h+eoi+S4reWKqOaAgea3u+WKoFxuICAgICAgICAgICAgXCJfYWN0aXZlXCI6IGFjdGl2ZSxcbiAgICAgICAgICAgIFwiX2NvbXBvbmVudHNcIjogW10sIC8vIOe7hOS7tuW8leeUqOWwhuWcqOWkhOeQhue7hOS7tuaXtuWKqOaAgea3u+WKoFxuICAgICAgICAgICAgXCJfcHJlZmFiXCI6IHsgXCJfX2lkX19cIjogMCB9LCAvLyDkuLTml7blgLzvvIzlkI7nu63kvJrooqvmraPnoa7orr7nva5cbiAgICAgICAgICAgIFwiX2xwb3NcIjoge1xuICAgICAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5WZWMzXCIsXG4gICAgICAgICAgICAgICAgXCJ4XCI6IHBvc2l0aW9uLngsXG4gICAgICAgICAgICAgICAgXCJ5XCI6IHBvc2l0aW9uLnksXG4gICAgICAgICAgICAgICAgXCJ6XCI6IHBvc2l0aW9uLnpcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcIl9scm90XCI6IHtcbiAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuUXVhdFwiLFxuICAgICAgICAgICAgICAgIFwieFwiOiByb3RhdGlvbi54LFxuICAgICAgICAgICAgICAgIFwieVwiOiByb3RhdGlvbi55LFxuICAgICAgICAgICAgICAgIFwielwiOiByb3RhdGlvbi56LFxuICAgICAgICAgICAgICAgIFwid1wiOiByb3RhdGlvbi53XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJfbHNjYWxlXCI6IHtcbiAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuVmVjM1wiLFxuICAgICAgICAgICAgICAgIFwieFwiOiBzY2FsZS54LFxuICAgICAgICAgICAgICAgIFwieVwiOiBzY2FsZS55LFxuICAgICAgICAgICAgICAgIFwielwiOiBzY2FsZS56XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJfbW9iaWxpdHlcIjogMCxcbiAgICAgICAgICAgIFwiX2xheWVyXCI6IGxheWVyLFxuICAgICAgICAgICAgXCJfZXVsZXJcIjoge1xuICAgICAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5WZWMzXCIsXG4gICAgICAgICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgICAgICAgXCJ6XCI6IDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcIl9pZFwiOiBcIlwiXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5LuO6IqC54K55pWw5o2u5Lit5o+Q5Y+WVVVJRFxuICAgICAqL1xuICAgIHByaXZhdGUgZXh0cmFjdE5vZGVVdWlkKG5vZGVEYXRhOiBhbnkpOiBzdHJpbmcgfCBudWxsIHtcbiAgICAgICAgaWYgKCFub2RlRGF0YSkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgLy8g5bCd6K+V5aSa56eN5pa55byP6I635Y+WVVVJRFxuICAgICAgICBjb25zdCBzb3VyY2VzID0gW1xuICAgICAgICAgICAgbm9kZURhdGEudXVpZCxcbiAgICAgICAgICAgIG5vZGVEYXRhLnZhbHVlPy51dWlkLFxuICAgICAgICAgICAgbm9kZURhdGEuX191dWlkX18sXG4gICAgICAgICAgICBub2RlRGF0YS52YWx1ZT8uX191dWlkX18sXG4gICAgICAgICAgICBub2RlRGF0YS5pZCxcbiAgICAgICAgICAgIG5vZGVEYXRhLnZhbHVlPy5pZFxuICAgICAgICBdO1xuXG4gICAgICAgIGZvciAoY29uc3Qgc291cmNlIG9mIHNvdXJjZXMpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc291cmNlID09PSAnc3RyaW5nJyAmJiBzb3VyY2UubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDliJvlu7rmnIDlsI/ljJbnmoToioLngrnlr7nosaHvvIzkuI3ljIXlkKvku7vkvZXnu4Tku7bku6Xpgb/lhY3kvp3otZbpl67pophcbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZU1pbmltYWxOb2RlKG5vZGVEYXRhOiBhbnksIG5vZGVOYW1lPzogc3RyaW5nKTogYW55IHtcbiAgICAgICAgLy8g5o+Q5Y+W6IqC54K555qE5Z+65pys5bGe5oCnXG4gICAgICAgIGNvbnN0IGdldFZhbHVlID0gKHByb3A6IGFueSkgPT4ge1xuICAgICAgICAgICAgaWYgKHByb3A/LnZhbHVlICE9PSB1bmRlZmluZWQpIHJldHVybiBwcm9wLnZhbHVlO1xuICAgICAgICAgICAgaWYgKHByb3AgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHByb3A7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IGdldFZhbHVlKG5vZGVEYXRhLnBvc2l0aW9uKSB8fCBnZXRWYWx1ZShub2RlRGF0YS52YWx1ZT8ucG9zaXRpb24pIHx8IHsgeDogMCwgeTogMCwgejogMCB9O1xuICAgICAgICBjb25zdCByb3RhdGlvbiA9IGdldFZhbHVlKG5vZGVEYXRhLnJvdGF0aW9uKSB8fCBnZXRWYWx1ZShub2RlRGF0YS52YWx1ZT8ucm90YXRpb24pIHx8IHsgeDogMCwgeTogMCwgejogMCwgdzogMSB9O1xuICAgICAgICBjb25zdCBzY2FsZSA9IGdldFZhbHVlKG5vZGVEYXRhLnNjYWxlKSB8fCBnZXRWYWx1ZShub2RlRGF0YS52YWx1ZT8uc2NhbGUpIHx8IHsgeDogMSwgeTogMSwgejogMSB9O1xuICAgICAgICBjb25zdCBhY3RpdmUgPSBnZXRWYWx1ZShub2RlRGF0YS5hY3RpdmUpID8/IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5hY3RpdmUpID8/IHRydWU7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBub2RlTmFtZSB8fCBnZXRWYWx1ZShub2RlRGF0YS5uYW1lKSB8fCBnZXRWYWx1ZShub2RlRGF0YS52YWx1ZT8ubmFtZSkgfHwgJ05vZGUnO1xuICAgICAgICBjb25zdCBsYXllciA9IGdldFZhbHVlKG5vZGVEYXRhLmxheWVyKSB8fCBnZXRWYWx1ZShub2RlRGF0YS52YWx1ZT8ubGF5ZXIpIHx8IDMzNTU0NDMyO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuTm9kZVwiLFxuICAgICAgICAgICAgXCJfbmFtZVwiOiBuYW1lLFxuICAgICAgICAgICAgXCJfb2JqRmxhZ3NcIjogMCxcbiAgICAgICAgICAgIFwiX3BhcmVudFwiOiBudWxsLFxuICAgICAgICAgICAgXCJfY2hpbGRyZW5cIjogW10sXG4gICAgICAgICAgICBcIl9hY3RpdmVcIjogYWN0aXZlLFxuICAgICAgICAgICAgXCJfY29tcG9uZW50c1wiOiBbXSwgLy8g56m655qE57uE5Lu25pWw57uE77yM6YG/5YWN57uE5Lu25L6d6LWW6Zeu6aKYXG4gICAgICAgICAgICBcIl9wcmVmYWJcIjoge1xuICAgICAgICAgICAgICAgIFwiX19pZF9fXCI6IDJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcIl9scG9zXCI6IHtcbiAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuVmVjM1wiLFxuICAgICAgICAgICAgICAgIFwieFwiOiBwb3NpdGlvbi54LFxuICAgICAgICAgICAgICAgIFwieVwiOiBwb3NpdGlvbi55LFxuICAgICAgICAgICAgICAgIFwielwiOiBwb3NpdGlvbi56XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJfbHJvdFwiOiB7XG4gICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlF1YXRcIixcbiAgICAgICAgICAgICAgICBcInhcIjogcm90YXRpb24ueCxcbiAgICAgICAgICAgICAgICBcInlcIjogcm90YXRpb24ueSxcbiAgICAgICAgICAgICAgICBcInpcIjogcm90YXRpb24ueixcbiAgICAgICAgICAgICAgICBcIndcIjogcm90YXRpb24ud1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiX2xzY2FsZVwiOiB7XG4gICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlZlYzNcIixcbiAgICAgICAgICAgICAgICBcInhcIjogc2NhbGUueCxcbiAgICAgICAgICAgICAgICBcInlcIjogc2NhbGUueSxcbiAgICAgICAgICAgICAgICBcInpcIjogc2NhbGUuelxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiX2xheWVyXCI6IGxheWVyLFxuICAgICAgICAgICAgXCJfZXVsZXJcIjoge1xuICAgICAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5WZWMzXCIsXG4gICAgICAgICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgICAgICAgXCJ6XCI6IDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcIl9pZFwiOiBcIlwiXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5Yib5bu65qCH5YeG55qEIG1ldGEg5paH5Lu25YaF5a65XG4gICAgICovXG4gICAgcHJpdmF0ZSBjcmVhdGVTdGFuZGFyZE1ldGFDb250ZW50KHByZWZhYk5hbWU6IHN0cmluZywgcHJlZmFiVXVpZDogc3RyaW5nKTogYW55IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIFwidmVyXCI6IFwiMi4wLjNcIixcbiAgICAgICAgICAgIFwiaW1wb3J0ZXJcIjogXCJwcmVmYWJcIixcbiAgICAgICAgICAgIFwiaW1wb3J0ZWRcIjogdHJ1ZSxcbiAgICAgICAgICAgIFwidXVpZFwiOiBwcmVmYWJVdWlkLFxuICAgICAgICAgICAgXCJmaWxlc1wiOiBbXG4gICAgICAgICAgICAgICAgXCIuanNvblwiXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCJzdWJNZXRhc1wiOiB7fSxcbiAgICAgICAgICAgIFwidXNlckRhdGFcIjoge1xuICAgICAgICAgICAgICAgIFwic3luY05vZGVOYW1lXCI6IHByZWZhYk5hbWUsXG4gICAgICAgICAgICAgICAgXCJoYXNJY29uXCI6IGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5bCd6K+V5bCG5Y6f5aeL6IqC54K56L2s5o2i5Li66aKE5Yi25L2T5a6e5L6LXG4gICAgICovXG4gICAgLyoqXG4gICAgICog5bCd6K+V5bCG5Y6f5aeL6IqC54K56L2s5o2i5Li66aKE5Yi25L2T5a6e5L6LXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBjb252ZXJ0Tm9kZVRvUHJlZmFiSW5zdGFuY2Uobm9kZVV1aWQ6IHN0cmluZywgcHJlZmFiVXVpZDogc3RyaW5nLCBwcmVmYWJQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHsgc3VjY2VzczogYm9vbGVhbjsgZXJyb3I/OiBzdHJpbmcgfT4ge1xuICAgICAgICAvLyDov5nkuKrlip/og73pnIDopoHmt7HlhaXnmoTlnLrmma/nvJbovpHlmajpm4bmiJDvvIzmmoLml7bov5Tlm57lpLHotKVcbiAgICAgICAgLy8g5Zyo5a6e6ZmF55qE5byV5pOO5Lit77yM6L+Z5raJ5Y+K5Yiw5aSN5p2C55qE6aKE5Yi25L2T5a6e5L6L5YyW5ZKM6IqC54K55pu/5o2i6YC76L6RXG4gICAgICAgIGNvbnNvbGUubG9nKCfoioLngrnovazmjaLkuLrpooTliLbkvZPlrp7kvovnmoTlip/og73pnIDopoHmm7Tmt7HlhaXnmoTlvJXmk47pm4bmiJAnKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgZXJyb3I6ICfoioLngrnovazmjaLkuLrpooTliLbkvZPlrp7kvovpnIDopoHmm7Tmt7HlhaXnmoTlvJXmk47pm4bmiJDmlK/mjIEnXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyByZXN0b3JlUHJlZmFiTm9kZShub2RlVXVpZDogc3RyaW5nLCBhc3NldFV1aWQ6IHN0cmluZyk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyDkvb/nlKjlrpjmlrlBUEkgcmVzdG9yZS1wcmVmYWIg6L+Y5Y6f6aKE5Yi25L2T6IqC54K5XG4gICAgICAgICAgICBhd2FpdCAoRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCBhcyBhbnkpKCdzY2VuZScsICdyZXN0b3JlLXByZWZhYicsIG5vZGVVdWlkLCBhc3NldFV1aWQpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZVV1aWQ6IG5vZGVVdWlkLFxuICAgICAgICAgICAgICAgICAgICBhc3NldFV1aWQ6IGFzc2V0VXVpZCxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ+mihOWItuS9k+iKgueCuei/mOWOn+aIkOWKnydcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yOiBg6aKE5Yi25L2T6IqC54K56L+Y5Y6f5aSx6LSlOiAke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOWfuuS6juWumOaWuemihOWItuS9k+agvOW8j+eahOaWsOWunueOsOaWueazlVxuICAgIC8vIOWfuuS6juWumOaWuemihOWItuS9k+agvOW8j+eahOaWsOWunueOsOaWueazlVxuICAgIHByaXZhdGUgYXN5bmMgZ2V0Tm9kZURhdGFGb3JQcmVmYWIobm9kZVV1aWQ6IHN0cmluZyk6IFByb21pc2U8eyBzdWNjZXNzOiBib29sZWFuOyBkYXRhPzogYW55OyBlcnJvcj86IHN0cmluZyB9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBub2RlRGF0YTogYW55ID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAncXVlcnktbm9kZScsIG5vZGVVdWlkKTtcbiAgICAgICAgICAgIGlmICghbm9kZURhdGEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICfoioLngrnkuI3lrZjlnKgnIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBub2RlRGF0YSB9O1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgY3JlYXRlU3RhbmRhcmRQcmVmYWJEYXRhKG5vZGVEYXRhOiBhbnksIHByZWZhYk5hbWU6IHN0cmluZywgcHJlZmFiVXVpZDogc3RyaW5nKTogUHJvbWlzZTxhbnlbXT4ge1xuICAgICAgICAvLyDln7rkuo7lrpjmlrlDYW52YXMucHJlZmFi5qC85byP5Yib5bu66aKE5Yi25L2T5pWw5o2u57uT5p6EXG4gICAgICAgIGNvbnN0IHByZWZhYkRhdGE6IGFueVtdID0gW107XG4gICAgICAgIGxldCBjdXJyZW50SWQgPSAwO1xuXG4gICAgICAgIC8vIOesrOS4gOS4quWFg+e0oO+8mmNjLlByZWZhYiDotYTmupDlr7nosaFcbiAgICAgICAgY29uc3QgcHJlZmFiQXNzZXQgPSB7XG4gICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuUHJlZmFiXCIsXG4gICAgICAgICAgICBcIl9uYW1lXCI6IHByZWZhYk5hbWUsXG4gICAgICAgICAgICBcIl9vYmpGbGFnc1wiOiAwLFxuICAgICAgICAgICAgXCJfX2VkaXRvckV4dHJhc19fXCI6IHt9LFxuICAgICAgICAgICAgXCJfbmF0aXZlXCI6IFwiXCIsXG4gICAgICAgICAgICBcImRhdGFcIjoge1xuICAgICAgICAgICAgICAgIFwiX19pZF9fXCI6IDFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcIm9wdGltaXphdGlvblBvbGljeVwiOiAwLFxuICAgICAgICAgICAgXCJwZXJzaXN0ZW50XCI6IGZhbHNlXG4gICAgICAgIH07XG4gICAgICAgIHByZWZhYkRhdGEucHVzaChwcmVmYWJBc3NldCk7XG4gICAgICAgIGN1cnJlbnRJZCsrO1xuXG4gICAgICAgIC8vIOesrOS6jOS4quWFg+e0oO+8muagueiKgueCuVxuICAgICAgICBjb25zdCByb290Tm9kZSA9IGF3YWl0IHRoaXMuY3JlYXRlTm9kZU9iamVjdChub2RlRGF0YSwgbnVsbCwgcHJlZmFiRGF0YSwgY3VycmVudElkKTtcbiAgICAgICAgcHJlZmFiRGF0YS5wdXNoKHJvb3ROb2RlLm5vZGUpO1xuICAgICAgICBjdXJyZW50SWQgPSByb290Tm9kZS5uZXh0SWQ7XG5cbiAgICAgICAgLy8g5re75Yqg5qC56IqC54K555qEIFByZWZhYkluZm8gLSDkv67lpI1hc3NldOW8leeUqOS9v+eUqFVVSURcbiAgICAgICAgY29uc3Qgcm9vdFByZWZhYkluZm8gPSB7XG4gICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuUHJlZmFiSW5mb1wiLFxuICAgICAgICAgICAgXCJyb290XCI6IHtcbiAgICAgICAgICAgICAgICBcIl9faWRfX1wiOiAxXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJhc3NldFwiOiB7XG4gICAgICAgICAgICAgICAgXCJfX3V1aWRfX1wiOiBwcmVmYWJVdWlkXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJmaWxlSWRcIjogdGhpcy5nZW5lcmF0ZUZpbGVJZCgpLFxuICAgICAgICAgICAgXCJpbnN0YW5jZVwiOiBudWxsLFxuICAgICAgICAgICAgXCJ0YXJnZXRPdmVycmlkZXNcIjogW10sXG4gICAgICAgICAgICBcIm5lc3RlZFByZWZhYkluc3RhbmNlUm9vdHNcIjogW11cbiAgICAgICAgfTtcbiAgICAgICAgcHJlZmFiRGF0YS5wdXNoKHJvb3RQcmVmYWJJbmZvKTtcblxuICAgICAgICByZXR1cm4gcHJlZmFiRGF0YTtcbiAgICB9XG5cblxuICAgIHByaXZhdGUgYXN5bmMgY3JlYXRlTm9kZU9iamVjdChub2RlRGF0YTogYW55LCBwYXJlbnRJZDogbnVtYmVyIHwgbnVsbCwgcHJlZmFiRGF0YTogYW55W10sIGN1cnJlbnRJZDogbnVtYmVyKTogUHJvbWlzZTx7IG5vZGU6IGFueTsgbmV4dElkOiBudW1iZXIgfT4ge1xuICAgICAgICBjb25zdCBub2RlSWQgPSBjdXJyZW50SWQrKztcblxuICAgICAgICAvLyDmj5Dlj5boioLngrnnmoTln7rmnKzlsZ7mgKcgLSDpgILphY1xdWVyeS1ub2RlLXRyZWXnmoTmlbDmja7moLzlvI9cbiAgICAgICAgY29uc3QgZ2V0VmFsdWUgPSAocHJvcDogYW55KSA9PiB7XG4gICAgICAgICAgICBpZiAocHJvcD8udmFsdWUgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHByb3AudmFsdWU7XG4gICAgICAgICAgICBpZiAocHJvcCAhPT0gdW5kZWZpbmVkKSByZXR1cm4gcHJvcDtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gZ2V0VmFsdWUobm9kZURhdGEucG9zaXRpb24pIHx8IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5wb3NpdGlvbikgfHwgeyB4OiAwLCB5OiAwLCB6OiAwIH07XG4gICAgICAgIGNvbnN0IHJvdGF0aW9uID0gZ2V0VmFsdWUobm9kZURhdGEucm90YXRpb24pIHx8IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5yb3RhdGlvbikgfHwgeyB4OiAwLCB5OiAwLCB6OiAwLCB3OiAxIH07XG4gICAgICAgIGNvbnN0IHNjYWxlID0gZ2V0VmFsdWUobm9kZURhdGEuc2NhbGUpIHx8IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5zY2FsZSkgfHwgeyB4OiAxLCB5OiAxLCB6OiAxIH07XG4gICAgICAgIGNvbnN0IGFjdGl2ZSA9IGdldFZhbHVlKG5vZGVEYXRhLmFjdGl2ZSkgPz8gZ2V0VmFsdWUobm9kZURhdGEudmFsdWU/LmFjdGl2ZSkgPz8gdHJ1ZTtcbiAgICAgICAgY29uc3QgbmFtZSA9IGdldFZhbHVlKG5vZGVEYXRhLm5hbWUpIHx8IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5uYW1lKSB8fCAnTm9kZSc7XG4gICAgICAgIGNvbnN0IGxheWVyID0gZ2V0VmFsdWUobm9kZURhdGEubGF5ZXIpIHx8IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5sYXllcikgfHwgMzM1NTQ0MzI7XG5cbiAgICAgICAgY29uc3Qgbm9kZTogYW55ID0ge1xuICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLk5vZGVcIixcbiAgICAgICAgICAgIFwiX25hbWVcIjogbmFtZSxcbiAgICAgICAgICAgIFwiX29iakZsYWdzXCI6IDAsXG4gICAgICAgICAgICBcIl9fZWRpdG9yRXh0cmFzX19cIjoge30sXG4gICAgICAgICAgICBcIl9wYXJlbnRcIjogcGFyZW50SWQgIT09IG51bGwgPyB7IFwiX19pZF9fXCI6IHBhcmVudElkIH0gOiBudWxsLFxuICAgICAgICAgICAgXCJfY2hpbGRyZW5cIjogW10sXG4gICAgICAgICAgICBcIl9hY3RpdmVcIjogYWN0aXZlLFxuICAgICAgICAgICAgXCJfY29tcG9uZW50c1wiOiBbXSxcbiAgICAgICAgICAgIFwiX3ByZWZhYlwiOiBwYXJlbnRJZCA9PT0gbnVsbCA/IHtcbiAgICAgICAgICAgICAgICBcIl9faWRfX1wiOiBjdXJyZW50SWQrK1xuICAgICAgICAgICAgfSA6IG51bGwsXG4gICAgICAgICAgICBcIl9scG9zXCI6IHtcbiAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuVmVjM1wiLFxuICAgICAgICAgICAgICAgIFwieFwiOiBwb3NpdGlvbi54LFxuICAgICAgICAgICAgICAgIFwieVwiOiBwb3NpdGlvbi55LFxuICAgICAgICAgICAgICAgIFwielwiOiBwb3NpdGlvbi56XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJfbHJvdFwiOiB7XG4gICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlF1YXRcIixcbiAgICAgICAgICAgICAgICBcInhcIjogcm90YXRpb24ueCxcbiAgICAgICAgICAgICAgICBcInlcIjogcm90YXRpb24ueSxcbiAgICAgICAgICAgICAgICBcInpcIjogcm90YXRpb24ueixcbiAgICAgICAgICAgICAgICBcIndcIjogcm90YXRpb24ud1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiX2xzY2FsZVwiOiB7XG4gICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlZlYzNcIixcbiAgICAgICAgICAgICAgICBcInhcIjogc2NhbGUueCxcbiAgICAgICAgICAgICAgICBcInlcIjogc2NhbGUueSxcbiAgICAgICAgICAgICAgICBcInpcIjogc2NhbGUuelxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiX21vYmlsaXR5XCI6IDAsXG4gICAgICAgICAgICBcIl9sYXllclwiOiBsYXllcixcbiAgICAgICAgICAgIFwiX2V1bGVyXCI6IHtcbiAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuVmVjM1wiLFxuICAgICAgICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgICAgICAgIFwielwiOiAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJfaWRcIjogXCJcIlxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIOaaguaXtui3s+i/h1VJVHJhbnNmb3Jt57uE5Lu25Lul6YG/5YWNX2dldERlcGVuZENvbXBvbmVudOmUmeivr1xuICAgICAgICAvLyDlkI7nu63pgJrov4dFbmdpbmUgQVBJ5Yqo5oCB5re75YqgXG4gICAgICAgIGNvbnNvbGUubG9nKGDoioLngrkgJHtuYW1lfSDmmoLml7bot7Pov4dVSVRyYW5zZm9ybee7hOS7tu+8jOmBv+WFjeW8leaTjuS+nei1lumUmeivr2ApO1xuXG4gICAgICAgIC8vIOWkhOeQhuWFtuS7lue7hOS7tu+8iOaaguaXtui3s+i/h++8jOS4k+azqOS6juS/ruWkjVVJVHJhbnNmb3Jt6Zeu6aKY77yJXG4gICAgICAgIGNvbnN0IGNvbXBvbmVudHMgPSB0aGlzLmV4dHJhY3RDb21wb25lbnRzRnJvbU5vZGUobm9kZURhdGEpO1xuICAgICAgICBpZiAoY29tcG9uZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg6IqC54K5ICR7bmFtZX0g5YyF5ZCrICR7Y29tcG9uZW50cy5sZW5ndGh9IOS4quWFtuS7lue7hOS7tu+8jOaaguaXtui3s+i/h+S7peS4k+azqOS6jlVJVHJhbnNmb3Jt5L+u5aSNYCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDlpITnkIblrZDoioLngrkgLSDkvb/nlKhxdWVyeS1ub2RlLXRyZWXojrflj5bnmoTlrozmlbTnu5PmnoRcbiAgICAgICAgY29uc3QgY2hpbGRyZW5Ub1Byb2Nlc3MgPSB0aGlzLmdldENoaWxkcmVuVG9Qcm9jZXNzKG5vZGVEYXRhKTtcbiAgICAgICAgaWYgKGNoaWxkcmVuVG9Qcm9jZXNzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGA9PT0g5aSE55CG5a2Q6IqC54K5ID09PWApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOiKgueCuSAke25hbWV9IOWMheWQqyAke2NoaWxkcmVuVG9Qcm9jZXNzLmxlbmd0aH0g5Liq5a2Q6IqC54K5YCk7XG5cbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW5Ub1Byb2Nlc3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZERhdGEgPSBjaGlsZHJlblRvUHJvY2Vzc1tpXTtcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZE5hbWUgPSBjaGlsZERhdGEubmFtZSB8fCBjaGlsZERhdGEudmFsdWU/Lm5hbWUgfHwgJ+acquefpSc7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYOWkhOeQhuesrCR7aSArIDF95Liq5a2Q6IqC54K5OiAke2NoaWxkTmFtZX1gKTtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkSWQgPSBjdXJyZW50SWQ7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUuX2NoaWxkcmVuLnB1c2goeyBcIl9faWRfX1wiOiBjaGlsZElkIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIOmAkuW9kuWIm+W7uuWtkOiKgueCuVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZFJlc3VsdCA9IGF3YWl0IHRoaXMuY3JlYXRlTm9kZU9iamVjdChjaGlsZERhdGEsIG5vZGVJZCwgcHJlZmFiRGF0YSwgY3VycmVudElkKTtcbiAgICAgICAgICAgICAgICAgICAgcHJlZmFiRGF0YS5wdXNoKGNoaWxkUmVzdWx0Lm5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50SWQgPSBjaGlsZFJlc3VsdC5uZXh0SWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8g5a2Q6IqC54K55LiN6ZyA6KaBUHJlZmFiSW5mb++8jOWPquacieagueiKgueCuemcgOimgVxuICAgICAgICAgICAgICAgICAgICAvLyDlrZDoioLngrnnmoRfcHJlZmFi5bqU6K+l6K6+572u5Li6bnVsbFxuICAgICAgICAgICAgICAgICAgICBjaGlsZFJlc3VsdC5ub2RlLl9wcmVmYWIgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDinIUg5oiQ5Yqf5re75Yqg5a2Q6IqC54K5OiAke2NoaWxkTmFtZX1gKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGDlpITnkIblrZDoioLngrkgJHtjaGlsZE5hbWV9IOaXtuWHuumUmTpgLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsgbm9kZSwgbmV4dElkOiBjdXJyZW50SWQgfTtcbiAgICB9XG5cbiAgICAvLyDku47oioLngrnmlbDmja7kuK3mj5Dlj5bnu4Tku7bkv6Hmga9cbiAgICBwcml2YXRlIGV4dHJhY3RDb21wb25lbnRzRnJvbU5vZGUobm9kZURhdGE6IGFueSk6IGFueVtdIHtcbiAgICAgICAgY29uc3QgY29tcG9uZW50czogYW55W10gPSBbXTtcblxuICAgICAgICAvLyDku47kuI3lkIzkvY3nva7lsJ3or5Xojrflj5bnu4Tku7bmlbDmja5cbiAgICAgICAgY29uc3QgY29tcG9uZW50U291cmNlcyA9IFtcbiAgICAgICAgICAgIG5vZGVEYXRhLl9fY29tcHNfXyxcbiAgICAgICAgICAgIG5vZGVEYXRhLmNvbXBvbmVudHMsXG4gICAgICAgICAgICBub2RlRGF0YS52YWx1ZT8uX19jb21wc19fLFxuICAgICAgICAgICAgbm9kZURhdGEudmFsdWU/LmNvbXBvbmVudHNcbiAgICAgICAgXTtcblxuICAgICAgICBmb3IgKGNvbnN0IHNvdXJjZSBvZiBjb21wb25lbnRTb3VyY2VzKSB7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShzb3VyY2UpKSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50cy5wdXNoKC4uLnNvdXJjZS5maWx0ZXIoY29tcCA9PiBjb21wICYmIChjb21wLl9fdHlwZV9fIHx8IGNvbXAudHlwZSkpKTtcbiAgICAgICAgICAgICAgICBicmVhazsgLy8g5om+5Yiw5pyJ5pWI55qE57uE5Lu25pWw57uE5bCx6YCA5Ye6XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY29tcG9uZW50cztcbiAgICB9XG5cbiAgICAvLyDliJvlu7rmoIflh4bnmoTnu4Tku7blr7nosaFcbiAgICBwcml2YXRlIGNyZWF0ZVN0YW5kYXJkQ29tcG9uZW50T2JqZWN0KGNvbXBvbmVudERhdGE6IGFueSwgbm9kZUlkOiBudW1iZXIsIHByZWZhYkluZm9JZDogbnVtYmVyKTogYW55IHtcbiAgICAgICAgY29uc3QgY29tcG9uZW50VHlwZSA9IGNvbXBvbmVudERhdGEuX190eXBlX18gfHwgY29tcG9uZW50RGF0YS50eXBlO1xuXG4gICAgICAgIGlmICghY29tcG9uZW50VHlwZSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCfnu4Tku7bnvLrlsJHnsbvlnovkv6Hmga86JywgY29tcG9uZW50RGF0YSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWfuuehgOe7hOS7tue7k+aehCAtIOWfuuS6juWumOaWuemihOWItuS9k+agvOW8j1xuICAgICAgICBjb25zdCBjb21wb25lbnQ6IGFueSA9IHtcbiAgICAgICAgICAgIFwiX190eXBlX19cIjogY29tcG9uZW50VHlwZSxcbiAgICAgICAgICAgIFwiX25hbWVcIjogXCJcIixcbiAgICAgICAgICAgIFwiX29iakZsYWdzXCI6IDAsXG4gICAgICAgICAgICBcIm5vZGVcIjoge1xuICAgICAgICAgICAgICAgIFwiX19pZF9fXCI6IG5vZGVJZFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiX2VuYWJsZWRcIjogdGhpcy5nZXRDb21wb25lbnRQcm9wZXJ0eVZhbHVlKGNvbXBvbmVudERhdGEsICdlbmFibGVkJywgdHJ1ZSksXG4gICAgICAgICAgICBcIl9fcHJlZmFiXCI6IHtcbiAgICAgICAgICAgICAgICBcIl9faWRfX1wiOiBwcmVmYWJJbmZvSWRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyDmoLnmja7nu4Tku7bnsbvlnovmt7vliqDnibnlrprlsZ7mgKdcbiAgICAgICAgdGhpcy5hZGRDb21wb25lbnRTcGVjaWZpY1Byb3BlcnRpZXMoY29tcG9uZW50LCBjb21wb25lbnREYXRhLCBjb21wb25lbnRUeXBlKTtcblxuICAgICAgICAvLyDmt7vliqBfaWTlsZ7mgKdcbiAgICAgICAgY29tcG9uZW50Ll9pZCA9IFwiXCI7XG5cbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudDtcbiAgICB9XG5cbiAgICAvLyDmt7vliqDnu4Tku7bnibnlrprnmoTlsZ7mgKdcbiAgICBwcml2YXRlIGFkZENvbXBvbmVudFNwZWNpZmljUHJvcGVydGllcyhjb21wb25lbnQ6IGFueSwgY29tcG9uZW50RGF0YTogYW55LCBjb21wb25lbnRUeXBlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgc3dpdGNoIChjb21wb25lbnRUeXBlKSB7XG4gICAgICAgICAgICBjYXNlICdjYy5VSVRyYW5zZm9ybSc6XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRVSVRyYW5zZm9ybVByb3BlcnRpZXMoY29tcG9uZW50LCBjb21wb25lbnREYXRhKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2NjLlNwcml0ZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRTcHJpdGVQcm9wZXJ0aWVzKGNvbXBvbmVudCwgY29tcG9uZW50RGF0YSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjYy5MYWJlbCc6XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRMYWJlbFByb3BlcnRpZXMoY29tcG9uZW50LCBjb21wb25lbnREYXRhKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2NjLkJ1dHRvbic6XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRCdXR0b25Qcm9wZXJ0aWVzKGNvbXBvbmVudCwgY29tcG9uZW50RGF0YSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIC8vIOWvueS6juacquefpeexu+Wei+eahOe7hOS7tu+8jOWkjeWItuaJgOacieWuieWFqOeahOWxnuaAp1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkR2VuZXJpY1Byb3BlcnRpZXMoY29tcG9uZW50LCBjb21wb25lbnREYXRhKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFVJVHJhbnNmb3Jt57uE5Lu25bGe5oCnXG4gICAgcHJpdmF0ZSBhZGRVSVRyYW5zZm9ybVByb3BlcnRpZXMoY29tcG9uZW50OiBhbnksIGNvbXBvbmVudERhdGE6IGFueSk6IHZvaWQge1xuICAgICAgICBjb21wb25lbnQuX2NvbnRlbnRTaXplID0gdGhpcy5jcmVhdGVTaXplT2JqZWN0KFxuICAgICAgICAgICAgdGhpcy5nZXRDb21wb25lbnRQcm9wZXJ0eVZhbHVlKGNvbXBvbmVudERhdGEsICdjb250ZW50U2l6ZScsIHsgd2lkdGg6IDEwMCwgaGVpZ2h0OiAxMDAgfSlcbiAgICAgICAgKTtcbiAgICAgICAgY29tcG9uZW50Ll9hbmNob3JQb2ludCA9IHRoaXMuY3JlYXRlVmVjMk9iamVjdChcbiAgICAgICAgICAgIHRoaXMuZ2V0Q29tcG9uZW50UHJvcGVydHlWYWx1ZShjb21wb25lbnREYXRhLCAnYW5jaG9yUG9pbnQnLCB7IHg6IDAuNSwgeTogMC41IH0pXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gU3ByaXRl57uE5Lu25bGe5oCnXG4gICAgcHJpdmF0ZSBhZGRTcHJpdGVQcm9wZXJ0aWVzKGNvbXBvbmVudDogYW55LCBjb21wb25lbnREYXRhOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29tcG9uZW50Ll92aXNGbGFncyA9IDA7XG4gICAgICAgIGNvbXBvbmVudC5fY3VzdG9tTWF0ZXJpYWwgPSBudWxsO1xuICAgICAgICBjb21wb25lbnQuX3NyY0JsZW5kRmFjdG9yID0gMjtcbiAgICAgICAgY29tcG9uZW50Ll9kc3RCbGVuZEZhY3RvciA9IDQ7XG4gICAgICAgIGNvbXBvbmVudC5fY29sb3IgPSB0aGlzLmNyZWF0ZUNvbG9yT2JqZWN0KFxuICAgICAgICAgICAgdGhpcy5nZXRDb21wb25lbnRQcm9wZXJ0eVZhbHVlKGNvbXBvbmVudERhdGEsICdjb2xvcicsIHsgcjogMjU1LCBnOiAyNTUsIGI6IDI1NSwgYTogMjU1IH0pXG4gICAgICAgICk7XG4gICAgICAgIGNvbXBvbmVudC5fc3ByaXRlRnJhbWUgPSB0aGlzLmdldENvbXBvbmVudFByb3BlcnR5VmFsdWUoY29tcG9uZW50RGF0YSwgJ3Nwcml0ZUZyYW1lJywgbnVsbCk7XG4gICAgICAgIGNvbXBvbmVudC5fdHlwZSA9IHRoaXMuZ2V0Q29tcG9uZW50UHJvcGVydHlWYWx1ZShjb21wb25lbnREYXRhLCAndHlwZScsIDApO1xuICAgICAgICBjb21wb25lbnQuX2ZpbGxUeXBlID0gMDtcbiAgICAgICAgY29tcG9uZW50Ll9zaXplTW9kZSA9IHRoaXMuZ2V0Q29tcG9uZW50UHJvcGVydHlWYWx1ZShjb21wb25lbnREYXRhLCAnc2l6ZU1vZGUnLCAxKTtcbiAgICAgICAgY29tcG9uZW50Ll9maWxsQ2VudGVyID0gdGhpcy5jcmVhdGVWZWMyT2JqZWN0KHsgeDogMCwgeTogMCB9KTtcbiAgICAgICAgY29tcG9uZW50Ll9maWxsU3RhcnQgPSAwO1xuICAgICAgICBjb21wb25lbnQuX2ZpbGxSYW5nZSA9IDA7XG4gICAgICAgIGNvbXBvbmVudC5faXNUcmltbWVkTW9kZSA9IHRydWU7XG4gICAgICAgIGNvbXBvbmVudC5fdXNlR3JheXNjYWxlID0gZmFsc2U7XG4gICAgICAgIGNvbXBvbmVudC5fYXRsYXMgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIExhYmVs57uE5Lu25bGe5oCnXG4gICAgcHJpdmF0ZSBhZGRMYWJlbFByb3BlcnRpZXMoY29tcG9uZW50OiBhbnksIGNvbXBvbmVudERhdGE6IGFueSk6IHZvaWQge1xuICAgICAgICBjb21wb25lbnQuX3Zpc0ZsYWdzID0gMDtcbiAgICAgICAgY29tcG9uZW50Ll9jdXN0b21NYXRlcmlhbCA9IG51bGw7XG4gICAgICAgIGNvbXBvbmVudC5fc3JjQmxlbmRGYWN0b3IgPSAyO1xuICAgICAgICBjb21wb25lbnQuX2RzdEJsZW5kRmFjdG9yID0gNDtcbiAgICAgICAgY29tcG9uZW50Ll9jb2xvciA9IHRoaXMuY3JlYXRlQ29sb3JPYmplY3QoXG4gICAgICAgICAgICB0aGlzLmdldENvbXBvbmVudFByb3BlcnR5VmFsdWUoY29tcG9uZW50RGF0YSwgJ2NvbG9yJywgeyByOiAwLCBnOiAwLCBiOiAwLCBhOiAyNTUgfSlcbiAgICAgICAgKTtcbiAgICAgICAgY29tcG9uZW50Ll9zdHJpbmcgPSB0aGlzLmdldENvbXBvbmVudFByb3BlcnR5VmFsdWUoY29tcG9uZW50RGF0YSwgJ3N0cmluZycsICdMYWJlbCcpO1xuICAgICAgICBjb21wb25lbnQuX2hvcml6b250YWxBbGlnbiA9IDE7XG4gICAgICAgIGNvbXBvbmVudC5fdmVydGljYWxBbGlnbiA9IDE7XG4gICAgICAgIGNvbXBvbmVudC5fYWN0dWFsRm9udFNpemUgPSAyMDtcbiAgICAgICAgY29tcG9uZW50Ll9mb250U2l6ZSA9IHRoaXMuZ2V0Q29tcG9uZW50UHJvcGVydHlWYWx1ZShjb21wb25lbnREYXRhLCAnZm9udFNpemUnLCAyMCk7XG4gICAgICAgIGNvbXBvbmVudC5fZm9udEZhbWlseSA9ICdBcmlhbCc7XG4gICAgICAgIGNvbXBvbmVudC5fbGluZUhlaWdodCA9IDQwO1xuICAgICAgICBjb21wb25lbnQuX292ZXJmbG93ID0gMTtcbiAgICAgICAgY29tcG9uZW50Ll9lbmFibGVXcmFwVGV4dCA9IGZhbHNlO1xuICAgICAgICBjb21wb25lbnQuX2ZvbnQgPSBudWxsO1xuICAgICAgICBjb21wb25lbnQuX2lzU3lzdGVtRm9udFVzZWQgPSB0cnVlO1xuICAgICAgICBjb21wb25lbnQuX2lzSXRhbGljID0gZmFsc2U7XG4gICAgICAgIGNvbXBvbmVudC5faXNCb2xkID0gZmFsc2U7XG4gICAgICAgIGNvbXBvbmVudC5faXNVbmRlcmxpbmUgPSBmYWxzZTtcbiAgICAgICAgY29tcG9uZW50Ll91bmRlcmxpbmVIZWlnaHQgPSAyO1xuICAgICAgICBjb21wb25lbnQuX2NhY2hlTW9kZSA9IDA7XG4gICAgfVxuXG4gICAgLy8gQnV0dG9u57uE5Lu25bGe5oCnXG4gICAgcHJpdmF0ZSBhZGRCdXR0b25Qcm9wZXJ0aWVzKGNvbXBvbmVudDogYW55LCBjb21wb25lbnREYXRhOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29tcG9uZW50LmNsaWNrRXZlbnRzID0gW107XG4gICAgICAgIGNvbXBvbmVudC5faW50ZXJhY3RhYmxlID0gdHJ1ZTtcbiAgICAgICAgY29tcG9uZW50Ll90cmFuc2l0aW9uID0gMjtcbiAgICAgICAgY29tcG9uZW50Ll9ub3JtYWxDb2xvciA9IHRoaXMuY3JlYXRlQ29sb3JPYmplY3QoeyByOiAyMTQsIGc6IDIxNCwgYjogMjE0LCBhOiAyNTUgfSk7XG4gICAgICAgIGNvbXBvbmVudC5faG92ZXJDb2xvciA9IHRoaXMuY3JlYXRlQ29sb3JPYmplY3QoeyByOiAyMTEsIGc6IDIxMSwgYjogMjExLCBhOiAyNTUgfSk7XG4gICAgICAgIGNvbXBvbmVudC5fcHJlc3NlZENvbG9yID0gdGhpcy5jcmVhdGVDb2xvck9iamVjdCh7IHI6IDI1NSwgZzogMjU1LCBiOiAyNTUsIGE6IDI1NSB9KTtcbiAgICAgICAgY29tcG9uZW50Ll9kaXNhYmxlZENvbG9yID0gdGhpcy5jcmVhdGVDb2xvck9iamVjdCh7IHI6IDEyNCwgZzogMTI0LCBiOiAxMjQsIGE6IDI1NSB9KTtcbiAgICAgICAgY29tcG9uZW50Ll9kdXJhdGlvbiA9IDAuMTtcbiAgICAgICAgY29tcG9uZW50Ll96b29tU2NhbGUgPSAxLjI7XG4gICAgfVxuXG4gICAgLy8g5re75Yqg6YCa55So5bGe5oCnXG4gICAgcHJpdmF0ZSBhZGRHZW5lcmljUHJvcGVydGllcyhjb21wb25lbnQ6IGFueSwgY29tcG9uZW50RGF0YTogYW55KTogdm9pZCB7XG4gICAgICAgIC8vIOWPquWkjeWItuWuieWFqOeahOOAgeW3suefpeeahOWxnuaAp1xuICAgICAgICBjb25zdCBzYWZlUHJvcGVydGllcyA9IFsnZW5hYmxlZCcsICdjb2xvcicsICdzdHJpbmcnLCAnZm9udFNpemUnLCAnc3ByaXRlRnJhbWUnLCAndHlwZScsICdzaXplTW9kZSddO1xuXG4gICAgICAgIGZvciAoY29uc3QgcHJvcCBvZiBzYWZlUHJvcGVydGllcykge1xuICAgICAgICAgICAgaWYgKGNvbXBvbmVudERhdGEuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuZ2V0Q29tcG9uZW50UHJvcGVydHlWYWx1ZShjb21wb25lbnREYXRhLCBwcm9wKTtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRbYF8ke3Byb3B9YF0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDliJvlu7pWZWMy5a+56LGhXG4gICAgcHJpdmF0ZSBjcmVhdGVWZWMyT2JqZWN0KGRhdGE6IGFueSk6IGFueSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuVmVjMlwiLFxuICAgICAgICAgICAgXCJ4XCI6IGRhdGE/LnggfHwgMCxcbiAgICAgICAgICAgIFwieVwiOiBkYXRhPy55IHx8IDBcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyDliJvlu7pWZWMz5a+56LGhXG4gICAgcHJpdmF0ZSBjcmVhdGVWZWMzT2JqZWN0KGRhdGE6IGFueSk6IGFueSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuVmVjM1wiLFxuICAgICAgICAgICAgXCJ4XCI6IGRhdGE/LnggfHwgMCxcbiAgICAgICAgICAgIFwieVwiOiBkYXRhPy55IHx8IDAsXG4gICAgICAgICAgICBcInpcIjogZGF0YT8ueiB8fCAwXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8g5Yib5bu6U2l6ZeWvueixoVxuICAgIHByaXZhdGUgY3JlYXRlU2l6ZU9iamVjdChkYXRhOiBhbnkpOiBhbnkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlNpemVcIixcbiAgICAgICAgICAgIFwid2lkdGhcIjogZGF0YT8ud2lkdGggfHwgMTAwLFxuICAgICAgICAgICAgXCJoZWlnaHRcIjogZGF0YT8uaGVpZ2h0IHx8IDEwMFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vIOWIm+W7ukNvbG9y5a+56LGhXG4gICAgcHJpdmF0ZSBjcmVhdGVDb2xvck9iamVjdChkYXRhOiBhbnkpOiBhbnkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLkNvbG9yXCIsXG4gICAgICAgICAgICBcInJcIjogZGF0YT8uciA/PyAyNTUsXG4gICAgICAgICAgICBcImdcIjogZGF0YT8uZyA/PyAyNTUsXG4gICAgICAgICAgICBcImJcIjogZGF0YT8uYiA/PyAyNTUsXG4gICAgICAgICAgICBcImFcIjogZGF0YT8uYSA/PyAyNTVcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyDliKTmlq3mmK/lkKblupTor6XlpI3liLbnu4Tku7blsZ7mgKdcbiAgICBwcml2YXRlIHNob3VsZENvcHlDb21wb25lbnRQcm9wZXJ0eShrZXk6IHN0cmluZywgdmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuICAgICAgICAvLyDot7Pov4flhoXpg6jlsZ7mgKflkozlt7LlpITnkIbnmoTlsZ7mgKdcbiAgICAgICAgaWYgKGtleS5zdGFydHNXaXRoKCdfXycpIHx8IGtleSA9PT0gJ19lbmFibGVkJyB8fCBrZXkgPT09ICdub2RlJyB8fCBrZXkgPT09ICdlbmFibGVkJykge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g6Lez6L+H5Ye95pWw5ZKMdW5kZWZpbmVk5YC8XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG5cbiAgICAvLyDojrflj5bnu4Tku7blsZ7mgKflgLwgLSDph43lkb3lkI3ku6Xpgb/lhY3lhrLnqoFcbiAgICBwcml2YXRlIGdldENvbXBvbmVudFByb3BlcnR5VmFsdWUoY29tcG9uZW50RGF0YTogYW55LCBwcm9wZXJ0eU5hbWU6IHN0cmluZywgZGVmYXVsdFZhbHVlPzogYW55KTogYW55IHtcbiAgICAgICAgLy8g5bCd6K+V55u05o6l6I635Y+W5bGe5oCnXG4gICAgICAgIGlmIChjb21wb25lbnREYXRhW3Byb3BlcnR5TmFtZV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXh0cmFjdFZhbHVlKGNvbXBvbmVudERhdGFbcHJvcGVydHlOYW1lXSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDlsJ3or5Xku452YWx1ZeWxnuaAp+S4reiOt+WPllxuICAgICAgICBpZiAoY29tcG9uZW50RGF0YS52YWx1ZSAmJiBjb21wb25lbnREYXRhLnZhbHVlW3Byb3BlcnR5TmFtZV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXh0cmFjdFZhbHVlKGNvbXBvbmVudERhdGEudmFsdWVbcHJvcGVydHlOYW1lXSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDlsJ3or5XluKbkuIvliJLnur/liY3nvIDnmoTlsZ7mgKflkI1cbiAgICAgICAgY29uc3QgcHJlZml4ZWROYW1lID0gYF8ke3Byb3BlcnR5TmFtZX1gO1xuICAgICAgICBpZiAoY29tcG9uZW50RGF0YVtwcmVmaXhlZE5hbWVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmV4dHJhY3RWYWx1ZShjb21wb25lbnREYXRhW3ByZWZpeGVkTmFtZV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICB9XG5cbiAgICAvLyDmj5Dlj5blsZ7mgKflgLxcbiAgICBwcml2YXRlIGV4dHJhY3RWYWx1ZShkYXRhOiBhbnkpOiBhbnkge1xuICAgICAgICBpZiAoZGF0YSA9PT0gbnVsbCB8fCBkYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5aaC5p6c5pyJdmFsdWXlsZ7mgKfvvIzkvJjlhYjkvb/nlKh2YWx1ZVxuICAgICAgICBpZiAodHlwZW9mIGRhdGEgPT09ICdvYmplY3QnICYmIGRhdGEuaGFzT3duUHJvcGVydHkoJ3ZhbHVlJykpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhLnZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5aaC5p6c5piv5byV55So5a+56LGh77yM5L+d5oyB5Y6f5qC3XG4gICAgICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ29iamVjdCcgJiYgKGRhdGEuX19pZF9fICE9PSB1bmRlZmluZWQgfHwgZGF0YS5fX3V1aWRfXyAhPT0gdW5kZWZpbmVkKSkge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZVN0YW5kYXJkTWV0YURhdGEocHJlZmFiTmFtZTogc3RyaW5nLCBwcmVmYWJVdWlkOiBzdHJpbmcpOiBhbnkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgXCJ2ZXJcIjogXCIxLjEuNTBcIixcbiAgICAgICAgICAgIFwiaW1wb3J0ZXJcIjogXCJwcmVmYWJcIixcbiAgICAgICAgICAgIFwiaW1wb3J0ZWRcIjogdHJ1ZSxcbiAgICAgICAgICAgIFwidXVpZFwiOiBwcmVmYWJVdWlkLFxuICAgICAgICAgICAgXCJmaWxlc1wiOiBbXG4gICAgICAgICAgICAgICAgXCIuanNvblwiXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgXCJzdWJNZXRhc1wiOiB7fSxcbiAgICAgICAgICAgIFwidXNlckRhdGFcIjoge1xuICAgICAgICAgICAgICAgIFwic3luY05vZGVOYW1lXCI6IHByZWZhYk5hbWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHNhdmVQcmVmYWJXaXRoTWV0YShwcmVmYWJQYXRoOiBzdHJpbmcsIHByZWZhYkRhdGE6IGFueVtdLCBtZXRhRGF0YTogYW55KTogUHJvbWlzZTx7IHN1Y2Nlc3M6IGJvb2xlYW47IGVycm9yPzogc3RyaW5nIH0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHByZWZhYkNvbnRlbnQgPSBKU09OLnN0cmluZ2lmeShwcmVmYWJEYXRhLCBudWxsLCAyKTtcbiAgICAgICAgICAgIGNvbnN0IG1ldGFDb250ZW50ID0gSlNPTi5zdHJpbmdpZnkobWV0YURhdGEsIG51bGwsIDIpO1xuXG4gICAgICAgICAgICAvLyDnoa7kv53ot6/lvoTku6UucHJlZmFi57uT5bC+XG4gICAgICAgICAgICBjb25zdCBmaW5hbFByZWZhYlBhdGggPSBwcmVmYWJQYXRoLmVuZHNXaXRoKCcucHJlZmFiJykgPyBwcmVmYWJQYXRoIDogYCR7cHJlZmFiUGF0aH0ucHJlZmFiYDtcbiAgICAgICAgICAgIGNvbnN0IG1ldGFQYXRoID0gYCR7ZmluYWxQcmVmYWJQYXRofS5tZXRhYDtcblxuICAgICAgICAgICAgLy8g5L2/55SoYXNzZXQtZGIgQVBJ5Yib5bu66aKE5Yi25L2T5paH5Lu2XG4gICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdjcmVhdGUtYXNzZXQnLCBmaW5hbFByZWZhYlBhdGgsIHByZWZhYkNvbnRlbnQpO1xuXG4gICAgICAgICAgICAvLyDliJvlu7ptZXRh5paH5Lu2XG4gICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdjcmVhdGUtYXNzZXQnLCBtZXRhUGF0aCwgbWV0YUNvbnRlbnQpO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgPT09IOmihOWItuS9k+S/neWtmOWujOaIkCA9PT1gKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDpooTliLbkvZPmlofku7blt7Lkv53lrZg6ICR7ZmluYWxQcmVmYWJQYXRofWApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYE1ldGHmlofku7blt7Lkv53lrZg6ICR7bWV0YVBhdGh9YCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg6aKE5Yi25L2T5pWw57uE5oC76ZW/5bqmOiAke3ByZWZhYkRhdGEubGVuZ3RofWApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOmihOWItuS9k+agueiKgueCuee0ouW8lTogJHtwcmVmYWJEYXRhLmxlbmd0aCAtIDF9YCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcign5L+d5a2Y6aKE5Yi25L2T5paH5Lu25pe25Ye66ZSZOicsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8g6Kej6Zmk6aKE5Yi25L2T6ZO+5o6l77yM5bCG6aKE5Yi25L2T5a6e5L6L6L2s5o2i5Li65pmu6YCa6IqC54K5XG4gICAgLy8g6Kej6Zmk6aKE5Yi25L2T6ZO+5o6l77yM5bCG6aKE5Yi25L2T5a6e5L6L6L2s5o2i5Li65pmu6YCa6IqC54K5XG4gICAgcHJpdmF0ZSBhc3luYyB1bmxpbmtQcmVmYWIobm9kZVV1aWQ6IHN0cmluZyk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg5byA5aeL6Kej6Zmk6aKE5Yi25L2T6ZO+5o6lOiAke25vZGVVdWlkfWApO1xuXG4gICAgICAgICAgICAvLyDkvb/nlKggRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCDosIPnlKjlnLrmma8gQVBJIOeahCB1bmxpbmstcHJlZmFiIOaWueazlVxuICAgICAgICAgICAgY29uc29sZS5sb2coJ+Wwneivleino+mZpOmihOWItuS9k+mTvuaOpe+8jOWPguaVsDogW25vZGVVdWlkLCB0cnVlXScpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQ6IGFueSA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3VubGluay1wcmVmYWInLCBbXG4gICAgICAgICAgICAgICAgICAgIG5vZGVVdWlkLFxuICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+ino+mZpOmihOWItuS9k+mTvuaOpUFQSeiwg+eUqOWujOaIkO+8jOi/lOWbnuWAvDonLCByZXN1bHQpO1xuXG4gICAgICAgICAgICAgICAgLy8g562J5b6F5LiA5bCP5q615pe26Ze06K6p57yW6L6R5Zmo5aSE55CG5Y+Y5YyWXG4gICAgICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDEwMCkpO1xuXG4gICAgICAgICAgICAgICAgLy8g5omL5Yqo5riF6Zmk6aKE5Yi25L2T5bGe5oCnXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+aJi+WKqOa4hemZpOmihOWItuS9k+WxnuaApy4uLicpO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdzZXQtcHJvcGVydHknLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1dWlkOiBub2RlVXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6ICdfX3ByZWZhYl9fJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1bXA6IHsgdmFsdWU6IG51bGwgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+mihOWItuS9k+WxnuaAp+W3sua4hemZpCcpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGNsZWFyRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+a4hemZpOmihOWItuS9k+WxnuaAp+Wksei0pTonLCBjbGVhckVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyDlho3mrKHnrYnlvoXlpITnkIZcbiAgICAgICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgMTAwKSk7XG5cbiAgICAgICAgICAgICAgICAvLyDpqozor4HoioLngrnmmK/lkKbnnJ/nmoTop6PpmaTkuobpooTliLbkvZPpk77mjqVcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBub2RlSW5mbyA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3F1ZXJ5LW5vZGUnLCBub2RlVXVpZCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfmnIDnu4jpqozor4EgLSDoioLngrnpooTliLbkvZPnirbmgIE6Jywgbm9kZUluZm8gJiYgKG5vZGVJbmZvIGFzIGFueSkuX19wcmVmYWJfXyA/ICfku43mmK/pooTliLbkvZMnIDogJ+W3suino+mZpOmTvuaOpScpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIOajgOafpeiKgueCueaYr+WQpui/mOaciemihOWItuS9k+WxnuaAp1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpc1ByZWZhYkluc3RhbmNlID0gbm9kZUluZm8gJiYgKG5vZGVJbmZvIGFzIGFueSkuX19wcmVmYWJfXyAmJiAobm9kZUluZm8gYXMgYW55KS5fX3ByZWZhYl9fLnV1aWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVV1aWQ6IG5vZGVVdWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGlzUHJlZmFiSW5zdGFuY2UgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAn6aKE5Yi25L2T6ZO+5o6l6Kej6Zmk5Y+v6IO95pyq5a6M5YWo5oiQ5Yqf77yM6K+35qOA5p+l57yW6L6R5Zmo55WM6Z2iJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICfpooTliLbkvZPlrp7kvovlt7LmiJDlip/ovazmjaLkuLrmma7pgJroioLngrknLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdDogcmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzUHJlZmFiSW5zdGFuY2U6IGlzUHJlZmFiSW5zdGFuY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZUluZm86IG5vZGVJbmZvLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdGU6ICflt7Lpqozor4HoioLngrnnirbmgIEnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAodmVyaWZ5RXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+mqjOivgeiKgueCueeKtuaAgeaXtuWHuumUmTonLCB2ZXJpZnlFcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVVdWlkOiBub2RlVXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAn6aKE5Yi25L2T6ZO+5o6l6Kej6ZmkQVBJ6LCD55So5oiQ5Yqf77yM5L2G5peg5rOV6aqM6K+B5pyA57uI54q25oCBJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQ6IHJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2ZXJpZnlFcnJvcjogU3RyaW5nKHZlcmlmeUVycm9yKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCfop6PpmaTpooTliLbkvZPpk77mjqXlpLHotKU6JywgZXJyb3IpO1xuXG4gICAgICAgICAgICAgICAgLy8g5bCd6K+V5aSH55So5pa55rOV77ya6YCa6L+H6K6+572u6IqC54K555qEcHJlZmFi5bGe5oCn5Li6bnVsbFxuICAgICAgICAgICAgICAgIGNvbnN0IGFsdFJlc3VsdCA9IGF3YWl0IHRoaXMudHJ5QWx0ZXJuYXRpdmVVbmxpbmsobm9kZVV1aWQpO1xuICAgICAgICAgICAgICAgIGlmIChhbHRSZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWx0UmVzdWx0O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBg6Kej6Zmk6aKE5Yi25L2T6ZO+5o6l5aSx6LSlOiAke2Vycm9yLm1lc3NhZ2UgfHwgZXJyb3J9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3RydWN0aW9uOiAn6K+356Gu6K6k6IqC54K55piv6aKE5Yi25L2T5a6e5L6L5LiU5Zyo5b2T5YmN5Zy65pmv5Lit5a2Y5ZyoJ1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+ino+mZpOmihOWItuS9k+mTvuaOpeW8guW4uDonLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yOiBg6Kej6Zmk6aKE5Yi25L2T6ZO+5o6l5byC5bi4OiAke2Vycm9yfWBcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDlpIfnlKjop6PpmaTpooTliLbkvZPpk77mjqXmlrnms5XvvJrpgJrov4fkv67mlLnoioLngrnlsZ7mgKdcbiAgICAvLyDlpIfnlKjop6PpmaTpooTliLbkvZPpk77mjqXmlrnms5XvvJrpgJrov4fkv67mlLnoioLngrnlsZ7mgKdcbiAgICBwcml2YXRlIGFzeW5jIHRyeUFsdGVybmF0aXZlVW5saW5rKG5vZGVVdWlkOiBzdHJpbmcpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8g5bCd6K+V6YCa6L+H6K6+572u6IqC54K55bGe5oCn5p2l6Kej6Zmk6aKE5Yi25L2T6ZO+5o6lXG4gICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdzZXQtcHJvcGVydHknLCB7XG4gICAgICAgICAgICAgICAgdXVpZDogbm9kZVV1aWQsXG4gICAgICAgICAgICAgICAgcGF0aDogJ19wcmVmYWInLFxuICAgICAgICAgICAgICAgIGR1bXA6IHsgdmFsdWU6IG51bGwgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyDlkIzml7bnp7vpmaTpooTliLbkvZPlrp7kvovmoIforrBcbiAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3NldC1wcm9wZXJ0eScsIHtcbiAgICAgICAgICAgICAgICB1dWlkOiBub2RlVXVpZCxcbiAgICAgICAgICAgICAgICBwYXRoOiAnX3ByZWZhYi5pbnN0YW5jZScsXG4gICAgICAgICAgICAgICAgZHVtcDogeyB2YWx1ZTogbnVsbCB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCflpIfnlKjmlrnms5Xop6PpmaTpooTliLbkvZPpk77mjqXmiJDlip8nKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVVdWlkOiBub2RlVXVpZCxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ+mihOWItuS9k+WunuS+i+W3sumAmui/h+Wkh+eUqOaWueazlei9rOaNouS4uuaZrumAmuiKgueCuScsXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ2FsdGVybmF0aXZlJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+Wkh+eUqOaWueazleWksei0pTonLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yOiBg5aSH55So5pa55rOV5aSx6LSlOiAke2Vycm9yLm1lc3NhZ2UgfHwgZXJyb3J9YFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOW6lOeUqOmihOWItuS9k+WunuS+i+eahOS/ruaUueWbnumihOWItuS9k+i1hOa6kFxuICAgIC8vIOW6lOeUqOmihOWItuS9k+WunuS+i+eahOS/ruaUueWbnumihOWItuS9k+i1hOa6kFxuICAgIHByaXZhdGUgYXN5bmMgYXBwbHlQcmVmYWIobm9kZVV1aWQ6IHN0cmluZyk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg5byA5aeL5bqU55So6aKE5Yi25L2T5a6e5L6L5L+u5pS5OiAke25vZGVVdWlkfWApO1xuXG4gICAgICAgICAgICAvLyAxLiDpppblhYjpqozor4HoioLngrnmmK/pooTliLbkvZPlrp7kvotcbiAgICAgICAgICAgIGNvbnN0IG5vZGVJbmZvID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAncXVlcnktbm9kZScsIG5vZGVVdWlkKTtcbiAgICAgICAgICAgIGlmICghbm9kZUluZm8gfHwgIShub2RlSW5mbyBhcyBhbnkpLl9fcHJlZmFiX18pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6ICfmjIflrprnmoToioLngrnkuI3mmK/pooTliLbkvZPlrp7kvosnXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgcHJlZmFiSW5mbyA9IChub2RlSW5mbyBhcyBhbnkpLl9fcHJlZmFiX187XG4gICAgICAgICAgICBjb25zdCBwcmVmYWJBc3NldFV1aWQgPSBwcmVmYWJJbmZvLmFzc2V0O1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg6aKE5Yi25L2T5a6e5L6L5L+h5oGvOmAsIHByZWZhYkluZm8pO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOWFs+iBlOeahOmihOWItuS9k+i1hOa6kCBVVUlEOiAke3ByZWZhYkFzc2V0VXVpZH1gKTtcblxuICAgICAgICAgICAgLy8gMi4g6LCD55SoIHNjZW5lLmFwcGx5LXByZWZhYiBBUEkg5bqU55So5L+u5pS5XG4gICAgICAgICAgICBjb25zb2xlLmxvZygn6LCD55SoIHNjZW5lLmFwcGx5LXByZWZhYiBBUEkuLi4nKTtcbiAgICAgICAgICAgIGNvbnN0IGFwcGx5UmVzdWx0OiBhbnkgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdhcHBseS1wcmVmYWInLCBbbm9kZVV1aWRdKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhcHBseS1wcmVmYWIgQVBJIOiwg+eUqOe7k+aenDonLCBhcHBseVJlc3VsdCk7XG5cbiAgICAgICAgICAgIC8vIDMuIOetieW+hee8lui+keWZqOWkhOeQhlxuICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDIwMCkpO1xuXG4gICAgICAgICAgICAvLyA0LiDojrflj5bpooTliLbkvZPotYTmupDot6/lvoTov5vooYzmm7TmlrBcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXNzZXRJbmZvID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAncXVlcnktYXNzZXQtaW5mbycsIHByZWZhYkFzc2V0VXVpZCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+mihOWItuS9k+i1hOa6kOS/oeaBrzonLCBhc3NldEluZm8pO1xuXG4gICAgICAgICAgICAgICAgaWYgKGFzc2V0SW5mbyAmJiBhc3NldEluZm8uc291cmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByZWZhYlBhdGggPSBhc3NldEluZm8uc291cmNlO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhg6aKE5Yi25L2T6LWE5rqQ6Lev5b6EOiAke3ByZWZhYlBhdGh9YCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gNS4g5Yi35paw54m55a6a55qE6aKE5Yi25L2T6LWE5rqQXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucmVmcmVzaEFzc2V0cyhwcmVmYWJQYXRoKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlVXVpZDogbm9kZVV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiQXNzZXRVdWlkOiBwcmVmYWJBc3NldFV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiUGF0aDogcHJlZmFiUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAn6aKE5Yi25L2T5a6e5L6L55qE5L+u5pS55bey5oiQ5Yqf5bqU55So5Yiw6aKE5Yi25L2T6LWE5rqQJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBseVJlc3VsdDogYXBwbHlSZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlVXVpZDogbm9kZVV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiQXNzZXRVdWlkOiBwcmVmYWJBc3NldFV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ+mihOWItuS9k+S/ruaUueW3suW6lOeUqO+8jOS9huaXoOazleiOt+WPlui1hOa6kOi3r+W+hOS/oeaBrycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwbHlSZXN1bHQ6IGFwcGx5UmVzdWx0XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoYXNzZXRFcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfojrflj5bpooTliLbkvZPotYTmupDkv6Hmga/lpLHotKU6JywgYXNzZXRFcnJvcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVV1aWQ6IG5vZGVVdWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiQXNzZXRVdWlkOiBwcmVmYWJBc3NldFV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAn6aKE5Yi25L2T5L+u5pS55bey5bqU55So77yM5L2G6I635Y+W6LWE5rqQ5L+h5oGv5pe25Ye66ZSZJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcGx5UmVzdWx0OiBhcHBseVJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0RXJyb3I6IFN0cmluZyhhc3NldEVycm9yKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCflupTnlKjpooTliLbkvZPkv67mlLnlvILluLg6JywgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogYOW6lOeUqOmihOWItuS9k+S/ruaUueW8guW4uDogJHtlcnJvci5tZXNzYWdlIHx8IGVycm9yfWBcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDov5vlhaXpooTliLbkvZPnvJbovpHmqKHlvI8gLSDln7rkuo7nvJbovpHlmajml6Xlv5flrp7njrBcbiAgICAvLyDov5vlhaXpooTliLbkvZPnvJbovpHmqKHlvI8gLSDln7rkuo7nvJbovpHlmajml6Xlv5flrp7njrBcbiAgICBwcml2YXRlIGFzeW5jIGVudGVyUHJlZmFiRWRpdE1vZGUocHJlZmFiUGF0aDogc3RyaW5nKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDlvIDlp4vov5vlhaXpooTliLbkvZPnvJbovpHmqKHlvI86ICR7cHJlZmFiUGF0aH1gKTtcblxuICAgICAgICAgICAgLy8gMS4g5p+l6K+i6aKE5Yi25L2T6LWE5rqQ5L+h5oGvXG4gICAgICAgICAgICBjb25zdCBhc3NldEluZm8gPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdxdWVyeS1hc3NldC1pbmZvJywgcHJlZmFiUGF0aCk7XG4gICAgICAgICAgICBpZiAoIWFzc2V0SW5mbykge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogJ+mihOWItuS9k+i1hOa6kOS4jeWtmOWcqCdcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBwcmVmYWJVdWlkID0gYXNzZXRJbmZvLnV1aWQ7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg6aKE5Yi25L2TIFVVSUQ6ICR7cHJlZmFiVXVpZH1gKTtcblxuICAgICAgICAgICAgLy8gMi4g5qC55o2u57yW6L6R5Zmo5pel5b+X77yM6aaW5YWI5omT5byA6aKE5Yi25L2T6LWE5rqQICjlsLHlg4/lj4zlh7vpooTliLbkvZPmlofku7YpXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ29wZW4tYXNzZXQnLCBwcmVmYWJQYXRoKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn6aKE5Yi25L2T6LWE5rqQ5omT5byA6K+35rGC5bey5Y+R6YCBJyk7XG4gICAgICAgICAgICB9IGNhdGNoIChvcGVuRXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5omT5byA6aKE5Yi25L2T6LWE5rqQ5aSx6LSlOicsIG9wZW5FcnJvcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIDMuIOetieW+hee8lui+keWZqOWkhOeQhui1hOa6kOaJk+W8gFxuICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDgwMCkpO1xuXG4gICAgICAgICAgICAvLyA0LiDorr7nva7pooTliLbkvZPpooTop4jmqKHlvI8gKOWfuuS6juaXpeW/l+S4reeahCBjYWxsLXByZXZpZXctZnVuY3Rpb24pXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ2NhbGwtcHJldmlldy1mdW5jdGlvbicsIFtcbiAgICAgICAgICAgICAgICAgICAgJ3NjZW5lOnByZWZhYi1wcmV2aWV3JyxcbiAgICAgICAgICAgICAgICAgICAgJ3NldFByZWZhYicsXG4gICAgICAgICAgICAgICAgICAgIHByZWZhYlV1aWRcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn6aKE5Yi25L2T6aKE6KeI5qih5byP6K6+572u5oiQ5YqfJyk7XG4gICAgICAgICAgICB9IGNhdGNoIChwcmV2aWV3RXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn6aKE5Yi25L2T6aKE6KeI5qih5byP6K6+572u5aSx6LSlOicsIHByZXZpZXdFcnJvcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIDUuIOiuvue9rmhpZXJhcmNoeemdouadv+S4uumihOWItuS9k+e8lui+keaooeW8jyAo5Z+65LqO5pel5b+X5Lit55qEIGhpZXJhcmNoeS5zdGFnaW5nKVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdoaWVyYXJjaHknLCAnc3RhZ2luZycsIHtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXRVdWlkOiBwcmVmYWJVdWlkLFxuICAgICAgICAgICAgICAgICAgICBhbmltYXRpb25VdWlkOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgZXhwYW5kTGV2ZWxzOiBbJzAnXVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdIaWVyYXJjaHnpooTliLbkvZPnvJbovpHmqKHlvI/orr7nva7miJDlip8nKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGhpZXJhcmNoeUVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+iuvue9rkhpZXJhcmNoeemihOWItuS9k+e8lui+keaooeW8j+Wksei0pTonLCBoaWVyYXJjaHlFcnJvcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIDYuIOetieW+hee8lui+keWZqOWujOWFqOWkhOeQhlxuICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDUwMCkpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBwcmVmYWJQYXRoOiBwcmVmYWJQYXRoLFxuICAgICAgICAgICAgICAgICAgICBwcmVmYWJVdWlkOiBwcmVmYWJVdWlkLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAn5bey6L+b5YWl6aKE5Yi25L2T57yW6L6R5qih5byPJyxcbiAgICAgICAgICAgICAgICAgICAgbW9kZTogJ3ByZWZhYi1lZGl0JyxcbiAgICAgICAgICAgICAgICAgICAgZWRpdFNlc3Npb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZWZhYlBhdGg6IHByZWZhYlBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVmYWJVdWlkOiBwcmVmYWJVdWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lOiBEYXRlLm5vdygpXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG5vdGU6ICfnvJbovpHlmajnlYzpnaLlupTor6Xlt7LliIfmjaLliLDpooTliLbkvZPnvJbovpHmqKHlvI8nXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCfov5vlhaXpooTliLbkvZPnvJbovpHmqKHlvI/lpLHotKU6JywgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogYOi/m+WFpemihOWItuS9k+e8lui+keaooeW8j+Wksei0pTogJHtlcnJvci5tZXNzYWdlIHx8IGVycm9yfWBcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDkv53lrZjpooTliLbkvZMgLSDln7rkuo7nvJbovpHlmajml6Xlv5fkuK3nmoQgc2F2ZS1hc3NldCDosIPnlKhcbiAgICAvLyDkv53lrZjpooTliLbkvZMgLSDln7rkuo7nvJbovpHlmajml6Xlv5fkuK3nmoQgc2F2ZS1hc3NldCDosIPnlKhcbiAgICBwcml2YXRlIGFzeW5jIHNhdmVQcmVmYWJEaXJlY3QocHJlZmFiUGF0aDogc3RyaW5nKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDlvIDlp4vkv53lrZjpooTliLbkvZM6ICR7cHJlZmFiUGF0aH1gKTtcblxuICAgICAgICAgICAgLy8gMS4g5p+l6K+i6aKE5Yi25L2T6LWE5rqQ5L+h5oGvXG4gICAgICAgICAgICBjb25zdCBhc3NldEluZm8gPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdxdWVyeS1hc3NldC1pbmZvJywgcHJlZmFiUGF0aCk7XG4gICAgICAgICAgICBpZiAoIWFzc2V0SW5mbykge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogJ+mihOWItuS9k+i1hOa6kOS4jeWtmOWcqCdcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBwcmVmYWJVdWlkID0gYXNzZXRJbmZvLnV1aWQ7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg6aKE5Yi25L2TIFVVSUQ6ICR7cHJlZmFiVXVpZH1gKTtcblxuICAgICAgICAgICAgLy8gMi4g6LCD55SoIHNjZW5lLnNhdmUtc2NlbmUg5L+d5a2Y5b2T5YmN57yW6L6R54q25oCBICjln7rkuo7ml6Xlv5cpXG4gICAgICAgICAgICAvLyDov5nkvJrlsIblvZPliY3lnLrmma/nmoTnvJbovpHnirbmgIHkv53lrZjliLDlhoXlrZjkuK1cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAnc2F2ZS1zY2VuZScpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCflnLrmma/nirbmgIHlt7Lkv53lrZjliLDlhoXlrZgnKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKHNhdmVTY2VuZUVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+S/neWtmOWcuuaZr+eKtuaAgeWksei0pTonLCBzYXZlU2NlbmVFcnJvcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIDMuIOafpeivoumihOWItuS9k+WFg+aVsOaNrlxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBtZXRhSW5mbyA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3F1ZXJ5LWFzc2V0LW1ldGEnLCBwcmVmYWJVdWlkKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn6aKE5Yi25L2T5YWD5pWw5o2uOicsIG1ldGFJbmZvKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKG1ldGFFcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfojrflj5bpooTliLbkvZPlhYPmlbDmja7lpLHotKU6JywgbWV0YUVycm9yKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gNC4g5Z+65LqO57yW6L6R5Zmo5pel5b+X77yM55u05o6l6Kem5Y+R5L+d5a2Y5pON5L2cXG4gICAgICAgICAgICAvLyDlnKjpooTliLbkvZPnvJbovpHmqKHlvI/kuIvvvIxzY2VuZS5zYXZlLXNjZW5lIOS8muiHquWKqOWkhOeQhumihOWItuS9k+WGheWuueeahOS/neWtmFxuICAgICAgICAgICAgLy8g5LiN6ZyA6KaB5omL5Yqo6LCD55SoIGFzc2V0LWRiLnNhdmUtYXNzZXTvvIznvJbovpHlmajkvJroh6rliqjlpITnkIZcblxuICAgICAgICAgICAgLy8gNS4g562J5b6F57yW6L6R5Zmo5aSE55CG6LWE5rqQ5Y+Y5YyWXG4gICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgNTAwKSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIHByZWZhYlBhdGg6IHByZWZhYlBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHByZWZhYlV1aWQ6IHByZWZhYlV1aWQsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICfpooTliLbkvZPkv53lrZjor7fmsYLlt7Llj5HpgIHvvIznvJbovpHlmajlsIboh6rliqjlpITnkIbkv53lrZjmtYHnqIsnLFxuICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgICAgIG5vdGU6ICfln7rkuo7nvJbovpHlmajml6Xlv5fvvIzpooTliLbkvZPnvJbovpHmqKHlvI/kuItzY2VuZS5zYXZlLXNjZW5l5Lya6Ieq5Yqo5L+d5a2Y6aKE5Yi25L2T5YaF5a65J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcign5L+d5a2Y6aKE5Yi25L2T5aSx6LSlOicsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGDkv53lrZjpooTliLbkvZPlpLHotKU6ICR7ZXJyb3IubWVzc2FnZSB8fCBlcnJvcn1gXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8g6YCA5Ye66aKE5Yi25L2T57yW6L6R5qih5byPIC0g5YiH5o2i5Zue5Zy65pmvXG4gICAgLy8g6YCA5Ye66aKE5Yi25L2T57yW6L6R5qih5byPIC0g5YiH5o2i5Zue5Zy65pmvXG4gICAgcHJpdmF0ZSBhc3luYyBleGl0UHJlZmFiRWRpdE1vZGUoc2NlbmVQYXRoPzogc3RyaW5nKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDlvIDlp4vpgIDlh7rpooTliLbkvZPnvJbovpHmqKHlvI/vvIzliIfmjaLliLDlnLrmma86ICR7c2NlbmVQYXRoIHx8ICdkYjovL2Fzc2V0cy9zY2VuZS5zY2VuZSd9YCk7XG5cbiAgICAgICAgICAgIC8vIDEuIOehruWumuebruagh+WcuuaZr+i3r+W+hFxuICAgICAgICAgICAgY29uc3QgdGFyZ2V0U2NlbmUgPSBzY2VuZVBhdGggfHwgJ2RiOi8vYXNzZXRzL3NjZW5lLnNjZW5lJztcblxuICAgICAgICAgICAgLy8gMi4g5p+l6K+i55uu5qCH5Zy65pmv5L+h5oGvXG4gICAgICAgICAgICBjb25zdCBzY2VuZUFzc2V0SW5mbyA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3F1ZXJ5LWFzc2V0LWluZm8nLCB0YXJnZXRTY2VuZSk7XG4gICAgICAgICAgICBpZiAoIXNjZW5lQXNzZXRJbmZvKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiAn55uu5qCH5Zy65pmv5LiN5a2Y5ZyoJ1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHNjZW5lVXVpZCA9IHNjZW5lQXNzZXRJbmZvLnV1aWQ7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg55uu5qCH5Zy65pmvIFVVSUQ6ICR7c2NlbmVVdWlkfWApO1xuXG4gICAgICAgICAgICAvLyAzLiDosIPnlKggYXNzZXQtZGIub3Blbi1hc3NldCDmiZPlvIDlnLrmma/otYTmupAgKOWfuuS6juaXpeW/lylcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAnb3Blbi1hc3NldCcsIHRhcmdldFNjZW5lKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5Zy65pmv6LWE5rqQ5omT5byA6K+35rGC5bey5Y+R6YCBJyk7XG4gICAgICAgICAgICB9IGNhdGNoIChvcGVuRXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5omT5byA5Zy65pmv6LWE5rqQ5aSx6LSlOicsIG9wZW5FcnJvcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIDQuIOiwg+eUqCBzY2VuZS5vcGVuLXNjZW5lIOWIh+aNouWcuuaZryAo5Z+65LqO5pel5b+XKVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdvcGVuLXNjZW5lJywgc2NlbmVVdWlkKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5Zy65pmv5YiH5o2i6K+35rGC5bey5Y+R6YCBJyk7XG4gICAgICAgICAgICB9IGNhdGNoIChvcGVuU2NlbmVFcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfliIfmjaLlnLrmma/lpLHotKU6Jywgb3BlblNjZW5lRXJyb3IpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyA1LiDnrYnlvoXnvJbovpHlmajlpITnkIblnLrmma/liIfmjaJcbiAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCAxMDAwKSk7XG5cbiAgICAgICAgICAgIC8vIDYuIOafpeivouW9k+WJjeWcuuaZr+eKtuaAgeehruiupOWIh+aNouaIkOWKn1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50U2NlbmUgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdxdWVyeS1jdXJyZW50LXNjZW5lJyk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+W9k+WJjeWcuuaZrzonLCBjdXJyZW50U2NlbmUpO1xuICAgICAgICAgICAgfSBjYXRjaCAocXVlcnlFcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfmn6Xor6LlvZPliY3lnLrmma/lpLHotKU6JywgcXVlcnlFcnJvcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICflt7LpgIDlh7rpooTliLbkvZPnvJbovpHmqKHlvI/lubbliIfmjaLliLDlnLrmma8nLFxuICAgICAgICAgICAgICAgICAgICBwcmV2aW91c01vZGU6ICdwcmVmYWItZWRpdCcsXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRNb2RlOiAnc2NlbmUnLFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRTY2VuZTogdGFyZ2V0U2NlbmUsXG4gICAgICAgICAgICAgICAgICAgIHNjZW5lVXVpZDogc2NlbmVVdWlkLFxuICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+mAgOWHuumihOWItuS9k+e8lui+keaooeW8j+Wksei0pTonLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yOiBg6YCA5Ye66aKE5Yi25L2T57yW6L6R5qih5byP5aSx6LSlOiAke2Vycm9yLm1lc3NhZ2UgfHwgZXJyb3J9YFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOW8gOWni+iusOW9lee8lui+keaTjeS9nCAtIOWfuuS6juaXpeW/l+S4reeahCBiZWdpbi1yZWNvcmRpbmdcbiAgICAvLyDlvIDlp4vorrDlvZXnvJbovpHmk43kvZwgLSDln7rkuo7ml6Xlv5fkuK3nmoQgYmVnaW4tcmVjb3JkaW5nXG4gICAgcHJpdmF0ZSBhc3luYyBiZWdpblJlY29yZGluZyhub2RlVXVpZHM6IHN0cmluZ1tdKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDlvIDlp4vorrDlvZXnvJbovpHmk43kvZzvvIzoioLngrk6ICR7bm9kZVV1aWRzLmpvaW4oJywgJyl9YCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ2JlZ2luLXJlY29yZGluZycsXG4gICAgICAgICAgICAgICAgbm9kZVV1aWRzLFxuICAgICAgICAgICAgICAgIG51bGxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCflvIDlp4vorrDlvZXnu5Pmnpw6JywgcmVzdWx0KTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZVV1aWRzOiBub2RlVXVpZHMsXG4gICAgICAgICAgICAgICAgICAgIHJlY29yZGluZ0lkOiByZXN1bHQsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICfnvJbovpHorrDlvZXlt7LlvIDlp4snLFxuICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+W8gOWni+iusOW9lee8lui+keaTjeS9nOWksei0pTonLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yOiBg5byA5aeL6K6w5b2V57yW6L6R5pON5L2c5aSx6LSlOiAke2Vycm9yLm1lc3NhZ2UgfHwgZXJyb3J9YFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIOe7k+adn+iusOW9lee8lui+keaTjeS9nCAtIOWfuuS6juaXpeW/l+S4reeahCBlbmQtcmVjb3JkaW5nXG4gICAgLy8g57uT5p2f6K6w5b2V57yW6L6R5pON5L2cIC0g5Z+65LqO5pel5b+X5Lit55qEIGVuZC1yZWNvcmRpbmdcbiAgICBwcml2YXRlIGFzeW5jIGVuZFJlY29yZGluZyhyZWNvcmRpbmdJZDogc3RyaW5nKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDnu5PmnZ/orrDlvZXnvJbovpHmk43kvZzvvIzorrDlvZVJRDogJHtyZWNvcmRpbmdJZH1gKTtcblxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAnZW5kLXJlY29yZGluZycsIHJlY29yZGluZ0lkKTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coJ+e7k+adn+iusOW9lee7k+aenDonLCByZXN1bHQpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICByZWNvcmRpbmdJZDogcmVjb3JkaW5nSWQsXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdDogcmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAn57yW6L6R6K6w5b2V5bey57uT5p2fJyxcbiAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCfnu5PmnZ/orrDlvZXnvJbovpHmk43kvZzlpLHotKU6JywgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogYOe7k+adn+iusOW9lee8lui+keaTjeS9nOWksei0pTogJHtlcnJvci5tZXNzYWdlIHx8IGVycm9yfWBcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDmtYvor5XpooTliLbkvZPkv67mlLkgLSDlrp7kvovljJbpooTliLbkvZPpqozor4Hkv67mlLnmmK/lkKbmiJDlip9cbiAgICAvLyDmtYvor5XpooTliLbkvZPkv67mlLkgLSDlrp7kvovljJbpooTliLbkvZPpqozor4Hkv67mlLnmmK/lkKbmiJDlip9cbiAgICBwcml2YXRlIGFzeW5jIHRlc3RQcmVmYWJDaGFuZ2VzKHByZWZhYlBhdGg6IHN0cmluZywgcGFyZW50VXVpZD86IHN0cmluZyk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg5byA5aeL5rWL6K+V6aKE5Yi25L2T5L+u5pS5OiAke3ByZWZhYlBhdGh9YCk7XG5cbiAgICAgICAgICAgIC8vIDEuIOmmluWFiOehruS/neaIkeS7rOWcqOWcuuaZr+aooeW8j1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmV4aXRQcmVmYWJFZGl0TW9kZSgpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCflt7Lnoa7kv53lnKjlnLrmma/mqKHlvI8nKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGV4aXRFcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfliIfmjaLliLDlnLrmma/mqKHlvI/ml7blh7rplJk6JywgZXhpdEVycm9yKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gMi4g6I635Y+W5Zy65pmv5qC56IqC54K55L2c5Li654i26IqC54K577yI5aaC5p6c5rKh5pyJ5oyH5a6acGFyZW50VXVpZO+8iVxuICAgICAgICAgICAgbGV0IHRhcmdldFBhcmVudFV1aWQgPSBwYXJlbnRVdWlkO1xuICAgICAgICAgICAgaWYgKCF0YXJnZXRQYXJlbnRVdWlkKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm9kZVRyZWU6IGFueSA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3F1ZXJ5LW5vZGUtdHJlZScpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZVRyZWUgJiYgbm9kZVRyZWUuY2hpbGRyZW4gJiYgbm9kZVRyZWUuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5L2/55SoQ2FudmFz6IqC54K55L2c5Li654i26IqC54K5XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjYW52YXNOb2RlID0gbm9kZVRyZWUuY2hpbGRyZW4uZmluZCgoY2hpbGQ6IGFueSkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5uYW1lICYmIChjaGlsZC5uYW1lLmluY2x1ZGVzKCdDYW52YXMnKSB8fCAoY2hpbGQuX19jb21wc19fICYmIGNoaWxkLl9fY29tcHNfXy5zb21lKChjb21wOiBhbnkpID0+IGNvbXAuX190eXBlX18gPT09ICdjYy5DYW52YXMnKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhbnZhc05vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQYXJlbnRVdWlkID0gY2FudmFzTm9kZS51dWlkLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDmib7liLBDYW52YXPoioLngrnkvZzkuLrniLboioLngrk6ICR7dGFyZ2V0UGFyZW50VXVpZH1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UGFyZW50VXVpZCA9IG5vZGVUcmVlLnV1aWQudmFsdWU7IC8vIOS9v+eUqOWcuuaZr+agueiKgueCuVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDkvb/nlKjlnLrmma/moLnoioLngrnkvZzkuLrniLboioLngrk6ICR7dGFyZ2V0UGFyZW50VXVpZH1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKHRyZWVFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn6I635Y+W6IqC54K55qCR5aSx6LSlOicsIHRyZWVFcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyAzLiDlrp7kvovljJbpooTliLbkvZPliLDlnLrmma/kuK1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDlrp7kvovljJbpooTliLbkvZPliLDoioLngrk6ICR7dGFyZ2V0UGFyZW50VXVpZH1gKTtcbiAgICAgICAgICAgIGNvbnN0IGluc3RhbnRpYXRlUmVzdWx0ID0gYXdhaXQgdGhpcy5pbnN0YW50aWF0ZVByZWZhYih7XG4gICAgICAgICAgICAgICAgcHJlZmFiUGF0aDogcHJlZmFiUGF0aCxcbiAgICAgICAgICAgICAgICBwYXJlbnRVdWlkOiB0YXJnZXRQYXJlbnRVdWlkLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7IHg6IDAsIHk6IDAsIHo6IDAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmICghaW5zdGFudGlhdGVSZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogYOWunuS+i+WMlumihOWItuS9k+Wksei0pTogJHtpbnN0YW50aWF0ZVJlc3VsdC5lcnJvcn1gXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgaW5zdGFuY2VOb2RlVXVpZCA9IGluc3RhbnRpYXRlUmVzdWx0LmRhdGEubm9kZVV1aWQ7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg6aKE5Yi25L2T5a6e5L6L5YyW5oiQ5Yqf77yM6IqC54K5VVVJRDogJHtpbnN0YW5jZU5vZGVVdWlkfWApO1xuXG4gICAgICAgICAgICAvLyA0LiDnrYnlvoXlrp7kvovljJblrozmiJBcbiAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCAxMDAwKSk7XG5cbiAgICAgICAgICAgIC8vIDUuIOafpeivouWunuS+i+WMluWQjueahOiKgueCueS/oeaBr++8jOmqjOivgeS/ruaUuVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbnN0YW5jZUluZm8gPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdxdWVyeS1ub2RlJywgaW5zdGFuY2VOb2RlVXVpZCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+WunuS+i+WMluiKgueCueS/oeaBrzonLCBKU09OLnN0cmluZ2lmeShpbnN0YW5jZUluZm8sIG51bGwsIDIpKTtcblxuICAgICAgICAgICAgICAgIC8vIDYuIOafpeivouiKgueCueagkeiOt+WPluWtkOiKgueCueS/oeaBr1xuICAgICAgICAgICAgICAgIGNvbnN0IG5vZGVUcmVlID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAncXVlcnktbm9kZS10cmVlJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgZmluZEluc3RhbmNlSW5UcmVlID0gKHRyZWU6IGFueSwgdGFyZ2V0VXVpZDogc3RyaW5nKTogYW55ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyZWUudXVpZCAmJiB0cmVlLnV1aWQudmFsdWUgPT09IHRhcmdldFV1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cmVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0cmVlLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIHRyZWUuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmb3VuZCA9IGZpbmRJbnN0YW5jZUluVHJlZShjaGlsZCwgdGFyZ2V0VXVpZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZvdW5kKSByZXR1cm4gZm91bmQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGluc3RhbmNlTm9kZSA9IGZpbmRJbnN0YW5jZUluVHJlZShub2RlVHJlZSwgaW5zdGFuY2VOb2RlVXVpZCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+iKgueCueagkeS4reeahOWunuS+i+S/oeaBrzonLCBKU09OLnN0cmluZ2lmeShpbnN0YW5jZU5vZGUsIG51bGwsIDIpKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdUZXN0IGNvbXBsZXRlZCAtIHByZWZhYiBpbnN0YW50aWF0ZWQgc3VjY2Vzc2Z1bGx5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlTm9kZVV1aWQ6IGluc3RhbmNlTm9kZVV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVmYWJQYXRoOiBwcmVmYWJQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgbm90ZTogJ0NoZWNrIGVkaXRvciBIaWVyYXJjaHkgcGFuZWwgdG8gdmVyaWZ5IGNoYW5nZXMnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB9IGNhdGNoIChxdWVyeUVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+afpeivouWunuS+i+iKgueCueS/oeaBr+Wksei0pTonLCBxdWVyeUVycm9yKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVmYWJQYXRoOiBwcmVmYWJQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VOb2RlVXVpZDogaW5zdGFuY2VOb2RlVXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudFV1aWQ6IHRhcmdldFBhcmVudFV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAn6aKE5Yi25L2T5a6e5L6L5YyW5oiQ5Yqf77yM5L2G5p+l6K+i6K+m57uG5L+h5oGv5aSx6LSlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vdGU6ICfor7fmiYvliqjmo4Dmn6XnvJbovpHlmajkuK3nmoTpooTliLbkvZPlrp7kvosnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+a1i+ivlemihOWItuS9k+S/ruaUueWksei0pTonLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yOiBg5rWL6K+V6aKE5Yi25L2T5L+u5pS55aSx6LSlOiAke2Vycm9yLm1lc3NhZ2UgfHwgZXJyb3J9YFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxufVxuIl19