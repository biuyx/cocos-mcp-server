"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrefabTools = void 0;
class PrefabTools {
    getTools() {
        return [
            {
                name: 'get_prefab_list',
                description: 'Get all prefabs in the project',
                inputSchema: {
                    type: 'object',
                    properties: {
                        folder: {
                            type: 'string',
                            description: 'Folder path to search (optional)',
                            default: 'db://assets'
                        }
                    }
                }
            },
            {
                name: 'load_prefab',
                description: 'Load a prefab by path',
                inputSchema: {
                    type: 'object',
                    properties: {
                        prefabPath: {
                            type: 'string',
                            description: 'Prefab asset path'
                        }
                    },
                    required: ['prefabPath']
                }
            },
            {
                name: 'instantiate_prefab',
                description: 'Instantiate a prefab in the scene',
                inputSchema: {
                    type: 'object',
                    properties: {
                        prefabPath: {
                            type: 'string',
                            description: 'Prefab asset path'
                        },
                        parentUuid: {
                            type: 'string',
                            description: 'Parent node UUID (optional)'
                        },
                        position: {
                            type: 'object',
                            description: 'Initial position',
                            properties: {
                                x: { type: 'number' },
                                y: { type: 'number' },
                                z: { type: 'number' }
                            }
                        }
                    },
                    required: ['prefabPath']
                }
            },
            {
                name: 'create_prefab',
                description: 'Create a prefab from a node with all children and components',
                inputSchema: {
                    type: 'object',
                    properties: {
                        nodeUuid: {
                            type: 'string',
                            description: 'Source node UUID'
                        },
                        savePath: {
                            type: 'string',
                            description: 'Path to save the prefab (e.g., db://assets/prefabs/MyPrefab.prefab)'
                        },
                        prefabName: {
                            type: 'string',
                            description: 'Prefab name'
                        }
                    },
                    required: ['nodeUuid', 'savePath', 'prefabName']
                }
            },
            {
                name: 'update_prefab',
                description: 'Update an existing prefab',
                inputSchema: {
                    type: 'object',
                    properties: {
                        prefabPath: {
                            type: 'string',
                            description: 'Prefab asset path'
                        },
                        nodeUuid: {
                            type: 'string',
                            description: 'Node UUID with changes'
                        }
                    },
                    required: ['prefabPath', 'nodeUuid']
                }
            },
            {
                name: 'revert_prefab',
                description: 'Revert prefab instance to original',
                inputSchema: {
                    type: 'object',
                    properties: {
                        nodeUuid: {
                            type: 'string',
                            description: 'Prefab instance node UUID'
                        }
                    },
                    required: ['nodeUuid']
                }
            },
            {
                name: 'get_prefab_info',
                description: 'Get detailed prefab information',
                inputSchema: {
                    type: 'object',
                    properties: {
                        prefabPath: {
                            type: 'string',
                            description: 'Prefab asset path'
                        }
                    },
                    required: ['prefabPath']
                }
            },
            {
                name: 'validate_prefab',
                description: 'Validate a prefab file format',
                inputSchema: {
                    type: 'object',
                    properties: {
                        prefabPath: {
                            type: 'string',
                            description: 'Prefab asset path'
                        }
                    },
                    required: ['prefabPath']
                }
            },
            {
                name: 'duplicate_prefab',
                description: 'Duplicate an existing prefab',
                inputSchema: {
                    type: 'object',
                    properties: {
                        sourcePrefabPath: {
                            type: 'string',
                            description: 'Source prefab path'
                        },
                        targetPrefabPath: {
                            type: 'string',
                            description: 'Target prefab path'
                        },
                        newPrefabName: {
                            type: 'string',
                            description: 'New prefab name'
                        }
                    },
                    required: ['sourcePrefabPath', 'targetPrefabPath']
                }
            },
            {
                name: 'restore_prefab_node',
                description: 'Restore prefab node using prefab asset (built-in undo record)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        nodeUuid: {
                            type: 'string',
                            description: 'Prefab instance node UUID'
                        },
                        assetUuid: {
                            type: 'string',
                            description: 'Prefab asset UUID'
                        }
                    },
                    required: ['nodeUuid', 'assetUuid']
                }
            }
        ];
    }
    async execute(toolName, args) {
        switch (toolName) {
            case 'get_prefab_list':
                return await this.getPrefabList(args.folder);
            case 'load_prefab':
                return await this.loadPrefab(args.prefabPath);
            case 'instantiate_prefab':
                return await this.instantiatePrefab(args);
            case 'create_prefab':
                return await this.createPrefab(args);
            case 'update_prefab':
                return await this.updatePrefab(args.prefabPath, args.nodeUuid);
            case 'revert_prefab':
                return await this.revertPrefab(args.nodeUuid);
            case 'get_prefab_info':
                return await this.getPrefabInfo(args.prefabPath);
            case 'validate_prefab':
                return await this.validatePrefab(args.prefabPath);
            case 'duplicate_prefab':
                return await this.duplicatePrefab(args);
            case 'restore_prefab_node':
                return await this.restorePrefabNode(args.nodeUuid, args.assetUuid);
            default:
                throw new Error(`Unknown tool: ${toolName}`);
        }
    }
    async getPrefabList(folder = 'db://assets') {
        return new Promise((resolve) => {
            const pattern = folder.endsWith('/') ?
                `${folder}**/*.prefab` : `${folder}/**/*.prefab`;
            Editor.Message.request('asset-db', 'query-assets', {
                pattern: pattern
            }).then((results) => {
                const prefabs = results.map(asset => ({
                    name: asset.name,
                    path: asset.url,
                    uuid: asset.uuid,
                    folder: asset.url.substring(0, asset.url.lastIndexOf('/'))
                }));
                resolve({ success: true, data: prefabs });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async loadPrefab(prefabPath) {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'query-asset-info', prefabPath).then((assetInfo) => {
                if (!assetInfo) {
                    throw new Error('Prefab not found');
                }
                return Editor.Message.request('scene', 'load-asset', {
                    uuid: assetInfo.uuid
                });
            }).then((prefabData) => {
                resolve({
                    success: true,
                    data: {
                        uuid: prefabData.uuid,
                        name: prefabData.name,
                        message: 'Prefab loaded successfully'
                    }
                });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async instantiatePrefab(args) {
        return new Promise(async (resolve) => {
            try {
                // 获取预制体资源信息
                const assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', args.prefabPath);
                if (!assetInfo) {
                    throw new Error('预制体未找到');
                }
                // 使用正确的 create-node API 从预制体资源实例化
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
                // 注意：create-node API从预制体资源创建时应该自动建立预制体关联
                console.log('预制体节点创建成功:', {
                    nodeUuid: uuid,
                    prefabUuid: assetInfo.uuid,
                    prefabPath: args.prefabPath
                });
                resolve({
                    success: true,
                    data: {
                        nodeUuid: uuid,
                        prefabPath: args.prefabPath,
                        parentUuid: args.parentUuid,
                        position: args.position,
                        message: '预制体实例化成功，已建立预制体关联'
                    }
                });
            }
            catch (err) {
                resolve({
                    success: false,
                    error: `预制体实例化失败: ${err.message}`,
                    instruction: '请检查预制体路径是否正确，确保预制体文件格式正确'
                });
            }
        });
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
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'query-asset-info', args.prefabPath).then((assetInfo) => {
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
                return Editor.Message.request('scene', 'create-node', createNodeOptions);
            }).then((nodeUuid) => {
                const uuid = Array.isArray(nodeUuid) ? nodeUuid[0] : nodeUuid;
                // 如果指定了位置，设置节点位置
                if (args.position && uuid) {
                    Editor.Message.request('scene', 'set-property', {
                        uuid: uuid,
                        path: 'position',
                        dump: { value: args.position }
                    }).then(() => {
                        resolve({
                            success: true,
                            data: {
                                nodeUuid: uuid,
                                prefabPath: args.prefabPath,
                                position: args.position,
                                message: '预制体实例化成功（备用方法）并设置了位置'
                            }
                        });
                    }).catch(() => {
                        resolve({
                            success: true,
                            data: {
                                nodeUuid: uuid,
                                prefabPath: args.prefabPath,
                                message: '预制体实例化成功（备用方法）但位置设置失败'
                            }
                        });
                    });
                }
                else {
                    resolve({
                        success: true,
                        data: {
                            nodeUuid: uuid,
                            prefabPath: args.prefabPath,
                            message: '预制体实例化成功（备用方法）'
                        }
                    });
                }
            }).catch((err) => {
                resolve({
                    success: false,
                    error: `备用预制体实例化方法也失败: ${err.message}`
                });
            });
        });
    }
    async tryAlternativeInstantiateMethods(args) {
        return new Promise(async (resolve) => {
            try {
                // 方法1: 尝试使用 create-node 然后设置预制体
                const assetInfo = await this.getAssetInfo(args.prefabPath);
                if (!assetInfo) {
                    resolve({ success: false, error: '无法获取预制体信息' });
                    return;
                }
                // 创建空节点
                const createResult = await this.createNode(args.parentUuid, args.position);
                if (!createResult.success) {
                    resolve(createResult);
                    return;
                }
                // 尝试将预制体应用到节点
                const applyResult = await this.applyPrefabToNode(createResult.data.nodeUuid, assetInfo.uuid);
                if (applyResult.success) {
                    resolve({
                        success: true,
                        data: {
                            nodeUuid: createResult.data.nodeUuid,
                            name: createResult.data.name,
                            message: '预制体实例化成功（使用备选方法）'
                        }
                    });
                }
                else {
                    resolve({
                        success: false,
                        error: '无法将预制体应用到节点',
                        data: {
                            nodeUuid: createResult.data.nodeUuid,
                            message: '已创建节点，但无法应用预制体数据'
                        }
                    });
                }
            }
            catch (error) {
                resolve({ success: false, error: `备选实例化方法失败: ${error}` });
            }
        });
    }
    async getAssetInfo(prefabPath) {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'query-asset-info', prefabPath).then((assetInfo) => {
                resolve(assetInfo);
            }).catch(() => {
                resolve(null);
            });
        });
    }
    async createNode(parentUuid, position) {
        return new Promise((resolve) => {
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
            Editor.Message.request('scene', 'create-node', createNodeOptions).then((nodeUuid) => {
                const uuid = Array.isArray(nodeUuid) ? nodeUuid[0] : nodeUuid;
                resolve({
                    success: true,
                    data: {
                        nodeUuid: uuid,
                        name: 'PrefabInstance'
                    }
                });
            }).catch((error) => {
                resolve({ success: false, error: error.message || '创建节点失败' });
            });
        });
    }
    async applyPrefabToNode(nodeUuid, prefabUuid) {
        return new Promise((resolve) => {
            // 尝试多种方法来应用预制体数据
            const methods = [
                () => Editor.Message.request('scene', 'apply-prefab', { node: nodeUuid, prefab: prefabUuid }),
                () => Editor.Message.request('scene', 'set-prefab', { node: nodeUuid, prefab: prefabUuid }),
                () => Editor.Message.request('scene', 'load-prefab-to-node', { node: nodeUuid, prefab: prefabUuid })
            ];
            const tryMethod = (index) => {
                if (index >= methods.length) {
                    resolve({ success: false, error: '无法应用预制体数据' });
                    return;
                }
                methods[index]().then(() => {
                    resolve({ success: true });
                }).catch(() => {
                    tryMethod(index + 1);
                });
            };
            tryMethod(0);
        });
    }
    /**
     * 使用 asset-db API 创建预制体的新方法
     * 深度整合引擎的资源管理系统，实现完整的预制体创建流程
     */
    async createPrefabWithAssetDB(nodeUuid, savePath, prefabName, includeChildren, includeComponents) {
        return new Promise(async (resolve) => {
            var _a;
            try {
                console.log('=== 使用 Asset-DB API 创建预制体 ===');
                console.log(`节点UUID: ${nodeUuid}`);
                console.log(`保存路径: ${savePath}`);
                console.log(`预制体名称: ${prefabName}`);
                // 第一步：获取节点数据（包括变换属性）
                const nodeData = await this.getNodeData(nodeUuid);
                if (!nodeData) {
                    resolve({
                        success: false,
                        error: '无法获取节点数据'
                    });
                    return;
                }
                console.log('获取到节点数据，子节点数量:', nodeData.children ? nodeData.children.length : 0);
                // 第二步：先创建资源文件以获取引擎分配的UUID
                console.log('创建预制体资源文件...');
                const tempPrefabContent = JSON.stringify([{ "__type__": "cc.Prefab", "_name": prefabName }], null, 2);
                const createResult = await this.createAssetWithAssetDB(savePath, tempPrefabContent);
                if (!createResult.success) {
                    resolve(createResult);
                    return;
                }
                // 获取引擎分配的实际UUID
                const actualPrefabUuid = (_a = createResult.data) === null || _a === void 0 ? void 0 : _a.uuid;
                if (!actualPrefabUuid) {
                    resolve({
                        success: false,
                        error: '无法获取引擎分配的预制体UUID'
                    });
                    return;
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
                resolve({
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
                });
            }
            catch (error) {
                console.error('创建预制体时发生错误:', error);
                resolve({
                    success: false,
                    error: `创建预制体失败: ${error}`
                });
            }
        });
    }
    async createPrefab(args) {
        return new Promise(async (resolve) => {
            try {
                // 支持 prefabPath 和 savePath 两种参数名
                const pathParam = args.prefabPath || args.savePath;
                if (!pathParam) {
                    resolve({
                        success: false,
                        error: '缺少预制体路径参数。请提供 prefabPath 或 savePath。'
                    });
                    return;
                }
                const prefabName = args.prefabName || 'NewPrefab';
                const fullPath = pathParam.endsWith('.prefab') ?
                    pathParam : `${pathParam}/${prefabName}.prefab`;
                const includeChildren = args.includeChildren !== false; // 默认为 true
                const includeComponents = args.includeComponents !== false; // 默认为 true
                // 优先使用新的 asset-db 方法创建预制体
                console.log('使用新的 asset-db 方法创建预制体...');
                const assetDbResult = await this.createPrefabWithAssetDB(args.nodeUuid, fullPath, prefabName, includeChildren, includeComponents);
                if (assetDbResult.success) {
                    resolve(assetDbResult);
                    return;
                }
                // 如果 asset-db 方法失败，尝试使用Cocos Creator的原生预制体创建API
                console.log('asset-db 方法失败，尝试原生API...');
                const nativeResult = await this.createPrefabNative(args.nodeUuid, fullPath);
                if (nativeResult.success) {
                    resolve(nativeResult);
                    return;
                }
                // 如果原生API失败，使用自定义实现
                console.log('原生API失败，使用自定义实现...');
                const customResult = await this.createPrefabCustom(args.nodeUuid, fullPath, prefabName);
                resolve(customResult);
            }
            catch (error) {
                resolve({
                    success: false,
                    error: `创建预制体时发生错误: ${error}`
                });
            }
        });
    }
    async createPrefabNative(nodeUuid, prefabPath) {
        return new Promise((resolve) => {
            // 根据官方API文档，不存在直接的预制体创建API
            // 预制体创建需要手动在编辑器中完成
            resolve({
                success: false,
                error: '原生预制体创建API不存在',
                instruction: '根据Cocos Creator官方API文档，预制体创建需要手动操作：\n1. 在场景中选择节点\n2. 将节点拖拽到资源管理器中\n3. 或右键节点选择"生成预制体"'
            });
        });
    }
    async createPrefabCustom(nodeUuid, prefabPath, prefabName) {
        return new Promise(async (resolve) => {
            var _a, _b;
            try {
                // 1. 获取源节点的完整数据
                const nodeData = await this.getNodeData(nodeUuid);
                if (!nodeData) {
                    resolve({
                        success: false,
                        error: `无法找到节点: ${nodeUuid}`
                    });
                    return;
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
                    resolve({
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
                    });
                }
                else {
                    resolve({
                        success: false,
                        error: saveResult.error || '保存预制体文件失败'
                    });
                }
            }
            catch (error) {
                resolve({
                    success: false,
                    error: `创建预制体时发生错误: ${error}`
                });
            }
        });
    }
    async getNodeData(nodeUuid) {
        return new Promise(async (resolve) => {
            try {
                // 首先获取基本节点信息
                const nodeInfo = await Editor.Message.request('scene', 'query-node', nodeUuid);
                if (!nodeInfo) {
                    resolve(null);
                    return;
                }
                console.log(`获取节点 ${nodeUuid} 的基本信息成功`);
                // 使用query-node-tree获取包含子节点的完整结构
                const nodeTree = await this.getNodeWithChildren(nodeUuid);
                if (nodeTree) {
                    console.log(`获取节点 ${nodeUuid} 的完整树结构成功`);
                    resolve(nodeTree);
                }
                else {
                    console.log(`使用基本节点信息`);
                    resolve(nodeInfo);
                }
            }
            catch (error) {
                console.warn(`获取节点数据失败 ${nodeUuid}:`, error);
                resolve(null);
            }
        });
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
            // 修复:原实现 fetch('http://localhost:8585/mcp') 自调用——端口写死8585(实际可配,常为3000)且不带鉴权头,
            // 必然失败被吞 → 组件类型退化成 query-node-tree 的明文类名 → prefab 里脚本组件反序列化为 null。
            // 改为进程内直调 query-node(与 component-tools.getComponents 同源),__comps__ 的 __type__/cid 即压缩UUID。
            const nodeData = await Editor.Message.request('scene', 'query-node', node.uuid);
            if (nodeData && nodeData.__comps__) {
                node.components = nodeData.__comps__.map((comp) => {
                    var _a;
                    return ({
                        type: comp.__type__ || comp.cid || comp.type || 'Unknown',
                        uuid: ((_a = comp.uuid) === null || _a === void 0 ? void 0 : _a.value) || comp.uuid || null,
                        enabled: comp.enabled !== undefined ? comp.enabled : true,
                        properties: comp.value || {} // query-node 的 comp.value 与 extractComponentProperties 输出同构({prop:{value}}),下游 componentData.properties.<p>.value 兼容
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
        return new Promise((resolve) => {
            // 构建基本的节点信息
            Editor.Message.request('scene', 'query-node', nodeUuid).then((nodeInfo) => {
                if (!nodeInfo) {
                    resolve(null);
                    return;
                }
                // 简化版本：只返回基本节点信息，不获取子节点和组件
                // 这些信息将在后续的预制体处理中根据需要添加
                const basicInfo = Object.assign(Object.assign({}, nodeInfo), { children: [], components: [] });
                resolve(basicInfo);
            }).catch(() => {
                resolve(null);
            });
        });
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
        return new Promise((resolve) => {
            try {
                // 使用Editor API保存预制体文件
                const prefabContent = JSON.stringify(prefabData, null, 2);
                const metaContent = JSON.stringify(metaData, null, 2);
                // 尝试使用更可靠的保存方法
                this.saveAssetFile(prefabPath, prefabContent).then(() => {
                    // 再创建meta文件
                    const metaPath = `${prefabPath}.meta`;
                    return this.saveAssetFile(metaPath, metaContent);
                }).then(() => {
                    resolve({ success: true });
                }).catch((error) => {
                    resolve({ success: false, error: error.message || '保存预制体文件失败' });
                });
            }
            catch (error) {
                resolve({ success: false, error: `保存文件时发生错误: ${error}` });
            }
        });
    }
    async saveAssetFile(filePath, content) {
        return new Promise((resolve, reject) => {
            // 尝试多种保存方法
            const saveMethods = [
                () => Editor.Message.request('asset-db', 'create-asset', filePath, content),
                () => Editor.Message.request('asset-db', 'save-asset', filePath, content),
                () => Editor.Message.request('asset-db', 'write-asset', filePath, content)
            ];
            const trySave = (index) => {
                if (index >= saveMethods.length) {
                    reject(new Error('所有保存方法都失败了'));
                    return;
                }
                saveMethods[index]().then(() => {
                    resolve();
                }).catch(() => {
                    trySave(index + 1);
                });
            };
            trySave(0);
        });
    }
    async updatePrefab(prefabPath, nodeUuid) {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'query-asset-info', prefabPath).then((assetInfo) => {
                if (!assetInfo) {
                    throw new Error('Prefab not found');
                }
                return Editor.Message.request('scene', 'apply-prefab', {
                    node: nodeUuid,
                    prefab: assetInfo.uuid
                });
            }).then(() => {
                resolve({
                    success: true,
                    message: 'Prefab updated successfully'
                });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async revertPrefab(nodeUuid) {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'revert-prefab', {
                node: nodeUuid
            }).then(() => {
                resolve({
                    success: true,
                    message: 'Prefab instance reverted successfully'
                });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
    }
    async getPrefabInfo(prefabPath) {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'query-asset-info', prefabPath).then((assetInfo) => {
                if (!assetInfo) {
                    throw new Error('Prefab not found');
                }
                return Editor.Message.request('asset-db', 'query-asset-meta', assetInfo.uuid);
            }).then((metaInfo) => {
                const info = {
                    name: metaInfo.name,
                    uuid: metaInfo.uuid,
                    path: prefabPath,
                    folder: prefabPath.substring(0, prefabPath.lastIndexOf('/')),
                    createTime: metaInfo.createTime,
                    modifyTime: metaInfo.modifyTime,
                    dependencies: metaInfo.depends || []
                };
                resolve({ success: true, data: info });
            }).catch((err) => {
                resolve({ success: false, error: err.message });
            });
        });
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
        return new Promise((resolve) => {
            try {
                // 读取预制体文件内容
                Editor.Message.request('asset-db', 'query-asset-info', prefabPath).then((assetInfo) => {
                    if (!assetInfo) {
                        resolve({
                            success: false,
                            error: '预制体文件不存在'
                        });
                        return;
                    }
                    // 验证预制体格式
                    Editor.Message.request('asset-db', 'read-asset', prefabPath).then((content) => {
                        try {
                            const prefabData = JSON.parse(content);
                            const validationResult = this.validatePrefabFormat(prefabData);
                            resolve({
                                success: true,
                                data: {
                                    isValid: validationResult.isValid,
                                    issues: validationResult.issues,
                                    nodeCount: validationResult.nodeCount,
                                    componentCount: validationResult.componentCount,
                                    message: validationResult.isValid ? '预制体格式有效' : '预制体格式存在问题'
                                }
                            });
                        }
                        catch (parseError) {
                            resolve({
                                success: false,
                                error: '预制体文件格式错误，无法解析JSON'
                            });
                        }
                    }).catch((error) => {
                        resolve({
                            success: false,
                            error: `读取预制体文件失败: ${error.message}`
                        });
                    });
                }).catch((error) => {
                    resolve({
                        success: false,
                        error: `查询预制体信息失败: ${error.message}`
                    });
                });
            }
            catch (error) {
                resolve({
                    success: false,
                    error: `验证预制体时发生错误: ${error}`
                });
            }
        });
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
    async duplicatePrefab(args) {
        return new Promise(async (resolve) => {
            try {
                const { sourcePrefabPath, targetPrefabPath, newPrefabName } = args;
                // 读取源预制体
                const sourceInfo = await this.getPrefabInfo(sourcePrefabPath);
                if (!sourceInfo.success) {
                    resolve({
                        success: false,
                        error: `无法读取源预制体: ${sourceInfo.error}`
                    });
                    return;
                }
                // 读取源预制体内容
                const sourceContent = await this.readPrefabContent(sourcePrefabPath);
                if (!sourceContent.success) {
                    resolve({
                        success: false,
                        error: `无法读取源预制体内容: ${sourceContent.error}`
                    });
                    return;
                }
                // 生成新的UUID
                const newUuid = this.generateUUID();
                // 修改预制体数据
                const modifiedData = this.modifyPrefabForDuplication(sourceContent.data, newPrefabName, newUuid);
                // 创建新的meta数据
                const newMetaData = this.createMetaData(newPrefabName || 'DuplicatedPrefab', newUuid);
                // 预制体复制功能暂时禁用，因为涉及复杂的序列化格式
                resolve({
                    success: false,
                    error: '预制体复制功能暂时不可用',
                    instruction: '请在 Cocos Creator 编辑器中手动复制预制体：\n1. 在资源管理器中选择要复制的预制体\n2. 右键选择复制\n3. 在目标位置粘贴'
                });
            }
            catch (error) {
                resolve({
                    success: false,
                    error: `复制预制体时发生错误: ${error}`
                });
            }
        });
    }
    async readPrefabContent(prefabPath) {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'read-asset', prefabPath).then((content) => {
                try {
                    const prefabData = JSON.parse(content);
                    resolve({ success: true, data: prefabData });
                }
                catch (parseError) {
                    resolve({ success: false, error: '预制体文件格式错误' });
                }
            }).catch((error) => {
                resolve({ success: false, error: error.message || '读取预制体文件失败' });
            });
        });
    }
    modifyPrefabForDuplication(prefabData, newName, newUuid) {
        // 修改预制体数据以创建副本
        const modifiedData = [...prefabData];
        // 修改第一个元素（预制体资产）
        if (modifiedData[0] && modifiedData[0].__type__ === 'cc.Prefab') {
            modifiedData[0]._name = newName || 'DuplicatedPrefab';
        }
        // 更新所有UUID引用（简化版本）
        // 在实际应用中，可能需要更复杂的UUID映射处理
        return modifiedData;
    }
    /**
     * 使用 asset-db API 创建资源文件
     */
    async createAssetWithAssetDB(assetPath, content) {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'create-asset', assetPath, content, {
                overwrite: true,
                rename: false
            }).then((assetInfo) => {
                console.log('创建资源文件成功:', assetInfo);
                resolve({ success: true, data: assetInfo });
            }).catch((error) => {
                console.error('创建资源文件失败:', error);
                resolve({ success: false, error: error.message || '创建资源文件失败' });
            });
        });
    }
    /**
     * 使用 asset-db API 创建 meta 文件
     */
    async createMetaWithAssetDB(assetPath, metaContent) {
        return new Promise((resolve) => {
            const metaContentString = JSON.stringify(metaContent, null, 2);
            Editor.Message.request('asset-db', 'save-asset-meta', assetPath, metaContentString).then((assetInfo) => {
                console.log('创建meta文件成功:', assetInfo);
                resolve({ success: true, data: assetInfo });
            }).catch((error) => {
                console.error('创建meta文件失败:', error);
                resolve({ success: false, error: error.message || '创建meta文件失败' });
            });
        });
    }
    /**
     * 使用 asset-db API 重新导入资源
     */
    async reimportAssetWithAssetDB(assetPath) {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'reimport-asset', assetPath).then((result) => {
                console.log('重新导入资源成功:', result);
                resolve({ success: true, data: result });
            }).catch((error) => {
                console.error('重新导入资源失败:', error);
                resolve({ success: false, error: error.message || '重新导入资源失败' });
            });
        });
    }
    /**
     * 使用 asset-db API 更新资源文件内容
     */
    async updateAssetWithAssetDB(assetPath, content) {
        return new Promise((resolve) => {
            Editor.Message.request('asset-db', 'save-asset', assetPath, content).then((result) => {
                console.log('更新资源文件成功:', result);
                resolve({ success: true, data: result });
            }).catch((error) => {
                console.error('更新资源文件失败:', error);
                resolve({ success: false, error: error.message || '更新资源文件失败' });
            });
        });
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
        // 修复兜底:脚本组件若拿到的是明文类名(非 5hex+18base64 的压缩UUID格式),prefab 导入时会反序列化成 null 组件。
        // 尝试从组件数据里的脚本资产 uuid(__scriptAsset)推导压缩UUID;推不出则告警(产物脚本组件将失效)。
        if (componentType && !componentType.startsWith('cc.') && !/^[0-9a-f]{5}[0-9A-Za-z+/]{18}$/.test(componentType)) {
            const scriptUuid = ((_c = (_b = (_a = componentData.properties) === null || _a === void 0 ? void 0 : _a.__scriptAsset) === null || _b === void 0 ? void 0 : _b.value) === null || _c === void 0 ? void 0 : _c.uuid)
                || ((_e = (_d = componentData.__scriptAsset) === null || _d === void 0 ? void 0 : _d.value) === null || _e === void 0 ? void 0 : _e.uuid)
                || ((_h = (_g = (_f = componentData.value) === null || _f === void 0 ? void 0 : _f.__scriptAsset) === null || _g === void 0 ? void 0 : _g.value) === null || _h === void 0 ? void 0 : _h.uuid);
            if (scriptUuid && typeof scriptUuid === 'string') {
                componentType = this.uuidToCompressedId(scriptUuid);
                console.log(`脚本组件明文类名已转压缩UUID: ${componentType}`);
            }
            else {
                console.warn(`脚本组件 __type__ 为明文类名(${componentType})且无脚本uuid可推导,prefab 导入后该组件可能为 null`);
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
    async convertNodeToPrefabInstance(nodeUuid, prefabUuid, prefabPath) {
        return new Promise((resolve) => {
            // 这个功能需要深入的场景编辑器集成，暂时返回失败
            // 在实际的引擎中，这涉及到复杂的预制体实例化和节点替换逻辑
            console.log('节点转换为预制体实例的功能需要更深入的引擎集成');
            resolve({
                success: false,
                error: '节点转换为预制体实例需要更深入的引擎集成支持'
            });
        });
    }
    async restorePrefabNode(nodeUuid, assetUuid) {
        return new Promise((resolve) => {
            // 使用官方API restore-prefab 还原预制体节点
            Editor.Message.request('scene', 'restore-prefab', nodeUuid, assetUuid).then(() => {
                resolve({
                    success: true,
                    data: {
                        nodeUuid: nodeUuid,
                        assetUuid: assetUuid,
                        message: '预制体节点还原成功'
                    }
                });
            }).catch((error) => {
                resolve({
                    success: false,
                    error: `预制体节点还原失败: ${error.message}`
                });
            });
        });
    }
    // 基于官方预制体格式的新实现方法
    async getNodeDataForPrefab(nodeUuid) {
        return new Promise((resolve) => {
            Editor.Message.request('scene', 'query-node', nodeUuid).then((nodeData) => {
                if (!nodeData) {
                    resolve({ success: false, error: '节点不存在' });
                    return;
                }
                resolve({ success: true, data: nodeData });
            }).catch((error) => {
                resolve({ success: false, error: error.message });
            });
        });
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
            await new Promise((resolve, reject) => {
                Editor.Message.request('asset-db', 'create-asset', finalPrefabPath, prefabContent).then(() => {
                    resolve(true);
                }).catch((error) => {
                    reject(error);
                });
            });
            // 创建meta文件
            await new Promise((resolve, reject) => {
                Editor.Message.request('asset-db', 'create-asset', metaPath, metaContent).then(() => {
                    resolve(true);
                }).catch((error) => {
                    reject(error);
                });
            });
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
}
exports.PrefabTools = PrefabTools;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmFiLXRvb2xzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc291cmNlL3Rvb2xzL3ByZWZhYi10b29scy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxNQUFhLFdBQVc7SUFDcEIsUUFBUTtRQUNKLE9BQU87WUFDSDtnQkFDSSxJQUFJLEVBQUUsaUJBQWlCO2dCQUN2QixXQUFXLEVBQUUsZ0NBQWdDO2dCQUM3QyxXQUFXLEVBQUU7b0JBQ1QsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsVUFBVSxFQUFFO3dCQUNSLE1BQU0sRUFBRTs0QkFDSixJQUFJLEVBQUUsUUFBUTs0QkFDZCxXQUFXLEVBQUUsa0NBQWtDOzRCQUMvQyxPQUFPLEVBQUUsYUFBYTt5QkFDekI7cUJBQ0o7aUJBQ0o7YUFDSjtZQUNEO2dCQUNJLElBQUksRUFBRSxhQUFhO2dCQUNuQixXQUFXLEVBQUUsdUJBQXVCO2dCQUNwQyxXQUFXLEVBQUU7b0JBQ1QsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsVUFBVSxFQUFFO3dCQUNSLFVBQVUsRUFBRTs0QkFDUixJQUFJLEVBQUUsUUFBUTs0QkFDZCxXQUFXLEVBQUUsbUJBQW1CO3lCQUNuQztxQkFDSjtvQkFDRCxRQUFRLEVBQUUsQ0FBQyxZQUFZLENBQUM7aUJBQzNCO2FBQ0o7WUFDRDtnQkFDSSxJQUFJLEVBQUUsb0JBQW9CO2dCQUMxQixXQUFXLEVBQUUsbUNBQW1DO2dCQUNoRCxXQUFXLEVBQUU7b0JBQ1QsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsVUFBVSxFQUFFO3dCQUNSLFVBQVUsRUFBRTs0QkFDUixJQUFJLEVBQUUsUUFBUTs0QkFDZCxXQUFXLEVBQUUsbUJBQW1CO3lCQUNuQzt3QkFDRCxVQUFVLEVBQUU7NEJBQ1IsSUFBSSxFQUFFLFFBQVE7NEJBQ2QsV0FBVyxFQUFFLDZCQUE2Qjt5QkFDN0M7d0JBQ0QsUUFBUSxFQUFFOzRCQUNOLElBQUksRUFBRSxRQUFROzRCQUNkLFdBQVcsRUFBRSxrQkFBa0I7NEJB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QUFRLENBQUMsTUFBQSxRQUFRLENBQUMsS0FBSywwQ0FBRSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNqSCxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLFFBQVEsQ0FBQyxNQUFBLFFBQVEsQ0FBQyxLQUFLLDBDQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNsRyxNQUFNLE1BQU0sR0FBRyxNQUFBLE1BQUEsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsbUNBQUksUUFBUSxDQUFDLE1BQUEsUUFBUSxDQUFDLEtBQUssMENBQUUsTUFBTSxDQUFDLG1DQUFJLElBQUksQ0FBQztRQUNyRixNQUFNLElBQUksR0FBRyxRQUFRLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxRQUFRLENBQUMsTUFBQSxRQUFRLENBQUMsS0FBSywwQ0FBRSxJQUFJLENBQUMsSUFBSSxNQUFNLENBQUM7UUFDN0YsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxRQUFRLENBQUMsTUFBQSxRQUFRLENBQUMsS0FBSywwQ0FBRSxLQUFLLENBQUMsSUFBSSxVQUFVLENBQUM7UUFFeEYsT0FBTztRQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxJQUFJLHNCQUFzQixlQUFlLEVBQUUsQ0FBQyxDQUFDO1FBRWxFLE1BQU0sU0FBUyxHQUFHLGVBQWUsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDbEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUks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TyxJQUFJLENBQUM7UUFDaEIsQ0FBQyxDQUFDO1FBRUYsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsTUFBQSxRQUFRLENBQUMsS0FBSywwQ0FBRSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDM0csTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsTUFBQSxRQUFRLENBQUMsS0FBSywwQ0FBRSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNqSCxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLFFBQVEsQ0FBQyxNQUFBLFFBQVEsQ0FBQyxLQUFLLDBDQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNsRyxNQUFNLE1BQU0sR0FBRyxNQUFBLE1BQUEsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsbUNBQUksUUFBUSxDQUFDLE1BQUEsUUFBUSxDQUFDLEtBQUssMENBQUUsTUFBTSxDQUFDLG1DQUFJLElBQUksQ0FBQztRQUNyRixNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLFFBQVEsQ0FBQyxNQUFBLFFBQVEsQ0FBQyxLQUFLLDBDQUFFLElBQUksQ0FBQyxJQUFJLE1BQU0sQ0FBQztRQUNqRixNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLFFBQVEsQ0FBQyxNQUFBLFFBQVEs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QUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRWxELE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUM7UUFDN0IsQ0FBQztRQUFDLE9BQU8sS0FBVSxFQUFFLENBQUM7WUFDbEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDcEMsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNwRCxDQUFDO0lBQ0wsQ0FBQztDQUVKO0FBOXhGRCxrQ0E4eEZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVG9vbERlZmluaXRpb24sIFRvb2xSZXNwb25zZSwgVG9vbEV4ZWN1dG9yLCBQcmVmYWJJbmZvIH0gZnJvbSAnLi4vdHlwZXMnO1xuXG5leHBvcnQgY2xhc3MgUHJlZmFiVG9vbHMgaW1wbGVtZW50cyBUb29sRXhlY3V0b3Ige1xuICAgIGdldFRvb2xzKCk6IFRvb2xEZWZpbml0aW9uW10ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdnZXRfcHJlZmFiX2xpc3QnLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnR2V0IGFsbCBwcmVmYWJzIGluIHRoZSBwcm9qZWN0JyxcbiAgICAgICAgICAgICAgICBpbnB1dFNjaGVtYToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9sZGVyOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdGb2xkZXIgcGF0aCB0byBzZWFyY2ggKG9wdGlvbmFsKScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogJ2RiOi8vYXNzZXRzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnbG9hZF9wcmVmYWInLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnTG9hZCBhIHByZWZhYiBieSBwYXRoJyxcbiAgICAgICAgICAgICAgICBpbnB1dFNjaGVtYToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiUGF0aDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUHJlZmFiIGFzc2V0IHBhdGgnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBbJ3ByZWZhYlBhdGgnXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2luc3RhbnRpYXRlX3ByZWZhYicsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdJbnN0YW50aWF0ZSBhIHByZWZhYiBpbiB0aGUgc2NlbmUnLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVmYWJQYXRoOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdQcmVmYWIgYXNzZXQgcGF0aCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRVdWlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdQYXJlbnQgbm9kZSBVVUlEIChvcHRpb25hbCknXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0luaXRpYWwgcG9zaXRpb24nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogeyB0eXBlOiAnbnVtYmVyJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiB7IHR5cGU6ICdudW1iZXInIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHo6IHsgdHlwZTogJ251bWJlcicgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IFsncHJlZmFiUGF0aCddXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnY3JlYXRlX3ByZWZhYicsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdDcmVhdGUgYSBwcmVmYWIgZnJvbSBhIG5vZGUgd2l0aCBhbGwgY2hpbGRyZW4gYW5kIGNvbXBvbmVudHMnLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlVXVpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnU291cmNlIG5vZGUgVVVJRCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBzYXZlUGF0aDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUGF0aCB0byBzYXZlIHRoZSBwcmVmYWIgKGUuZy4sIGRiOi8vYXNzZXRzL3ByZWZhYnMvTXlQcmVmYWIucHJlZmFiKSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVmYWJOYW1lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdQcmVmYWIgbmFtZSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IFsnbm9kZVV1aWQnLCAnc2F2ZVBhdGgnLCAncHJlZmFiTmFtZSddXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAndXBkYXRlX3ByZWZhYicsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdVcGRhdGUgYW4gZXhpc3RpbmcgcHJlZmFiJyxcbiAgICAgICAgICAgICAgICBpbnB1dFNjaGVtYToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiUGF0aDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUHJlZmFiIGFzc2V0IHBhdGgnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVV1aWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ05vZGUgVVVJRCB3aXRoIGNoYW5nZXMnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBbJ3ByZWZhYlBhdGgnLCAnbm9kZVV1aWQnXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ3JldmVydF9wcmVmYWInLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUmV2ZXJ0IHByZWZhYiBpbnN0YW5jZSB0byBvcmlnaW5hbCcsXG4gICAgICAgICAgICAgICAgaW5wdXRTY2hlbWE6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVVdWlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdQcmVmYWIgaW5zdGFuY2Ugbm9kZSBVVUlEJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZXF1aXJlZDogWydub2RlVXVpZCddXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnZ2V0X3ByZWZhYl9pbmZvJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0dldCBkZXRhaWxlZCBwcmVmYWIgaW5mb3JtYXRpb24nLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVmYWJQYXRoOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdQcmVmYWIgYXNzZXQgcGF0aCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IFsncHJlZmFiUGF0aCddXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAndmFsaWRhdGVfcHJlZmFiJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1ZhbGlkYXRlIGEgcHJlZmFiIGZpbGUgZm9ybWF0JyxcbiAgICAgICAgICAgICAgICBpbnB1dFNjaGVtYToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiUGF0aDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUHJlZmFiIGFzc2V0IHBhdGgnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBbJ3ByZWZhYlBhdGgnXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2R1cGxpY2F0ZV9wcmVmYWInLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnRHVwbGljYXRlIGFuIGV4aXN0aW5nIHByZWZhYicsXG4gICAgICAgICAgICAgICAgaW5wdXRTY2hlbWE6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZVByZWZhYlBhdGg6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1NvdXJjZSBwcmVmYWIgcGF0aCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQcmVmYWJQYXRoOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdUYXJnZXQgcHJlZmFiIHBhdGgnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3UHJlZmFiTmFtZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnTmV3IHByZWZhYiBuYW1lJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZXF1aXJlZDogWydzb3VyY2VQcmVmYWJQYXRoJywgJ3RhcmdldFByZWZhYlBhdGgnXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ3Jlc3RvcmVfcHJlZmFiX25vZGUnLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUmVzdG9yZSBwcmVmYWIgbm9kZSB1c2luZyBwcmVmYWIgYXNzZXQgKGJ1aWx0LWluIHVuZG8gcmVjb3JkKScsXG4gICAgICAgICAgICAgICAgaW5wdXRTY2hlbWE6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVVdWlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdQcmVmYWIgaW5zdGFuY2Ugbm9kZSBVVUlEJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0VXVpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUHJlZmFiIGFzc2V0IFVVSUQnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBbJ25vZGVVdWlkJywgJ2Fzc2V0VXVpZCddXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBdO1xuICAgIH1cblxuICAgIGFzeW5jIGV4ZWN1dGUodG9vbE5hbWU6IHN0cmluZywgYXJnczogYW55KTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgc3dpdGNoICh0b29sTmFtZSkge1xuICAgICAgICAgICAgY2FzZSAnZ2V0X3ByZWZhYl9saXN0JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXRQcmVmYWJMaXN0KGFyZ3MuZm9sZGVyKTtcbiAgICAgICAgICAgIGNhc2UgJ2xvYWRfcHJlZmFiJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5sb2FkUHJlZmFiKGFyZ3MucHJlZmFiUGF0aCk7XG4gICAgICAgICAgICBjYXNlICdpbnN0YW50aWF0ZV9wcmVmYWInOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmluc3RhbnRpYXRlUHJlZmFiKGFyZ3MpO1xuICAgICAgICAgICAgY2FzZSAnY3JlYXRlX3ByZWZhYic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuY3JlYXRlUHJlZmFiKGFyZ3MpO1xuICAgICAgICAgICAgY2FzZSAndXBkYXRlX3ByZWZhYic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMudXBkYXRlUHJlZmFiKGFyZ3MucHJlZmFiUGF0aCwgYXJncy5ub2RlVXVpZCk7XG4gICAgICAgICAgICBjYXNlICdyZXZlcnRfcHJlZmFiJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5yZXZlcnRQcmVmYWIoYXJncy5ub2RlVXVpZCk7XG4gICAgICAgICAgICBjYXNlICdnZXRfcHJlZmFiX2luZm8nOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFByZWZhYkluZm8oYXJncy5wcmVmYWJQYXRoKTtcbiAgICAgICAgICAgIGNhc2UgJ3ZhbGlkYXRlX3ByZWZhYic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMudmFsaWRhdGVQcmVmYWIoYXJncy5wcmVmYWJQYXRoKTtcbiAgICAgICAgICAgIGNhc2UgJ2R1cGxpY2F0ZV9wcmVmYWInOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmR1cGxpY2F0ZVByZWZhYihhcmdzKTtcbiAgICAgICAgICAgIGNhc2UgJ3Jlc3RvcmVfcHJlZmFiX25vZGUnOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnJlc3RvcmVQcmVmYWJOb2RlKGFyZ3Mubm9kZVV1aWQsIGFyZ3MuYXNzZXRVdWlkKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHRvb2w6ICR7dG9vbE5hbWV9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGdldFByZWZhYkxpc3QoZm9sZGVyOiBzdHJpbmcgPSAnZGI6Ly9hc3NldHMnKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwYXR0ZXJuID0gZm9sZGVyLmVuZHNXaXRoKCcvJykgPyBcbiAgICAgICAgICAgICAgICBgJHtmb2xkZXJ9KiovKi5wcmVmYWJgIDogYCR7Zm9sZGVyfS8qKi8qLnByZWZhYmA7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3F1ZXJ5LWFzc2V0cycsIHtcbiAgICAgICAgICAgICAgICBwYXR0ZXJuOiBwYXR0ZXJuXG4gICAgICAgICAgICB9KS50aGVuKChyZXN1bHRzOiBhbnlbXSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHByZWZhYnM6IFByZWZhYkluZm9bXSA9IHJlc3VsdHMubWFwKGFzc2V0ID0+ICh7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGFzc2V0Lm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHBhdGg6IGFzc2V0LnVybCxcbiAgICAgICAgICAgICAgICAgICAgdXVpZDogYXNzZXQudXVpZCxcbiAgICAgICAgICAgICAgICAgICAgZm9sZGVyOiBhc3NldC51cmwuc3Vic3RyaW5nKDAsIGFzc2V0LnVybC5sYXN0SW5kZXhPZignLycpKVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcHJlZmFicyB9KTtcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnI6IEVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyLm1lc3NhZ2UgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBsb2FkUHJlZmFiKHByZWZhYlBhdGg6IHN0cmluZyk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAncXVlcnktYXNzZXQtaW5mbycsIHByZWZhYlBhdGgpLnRoZW4oKGFzc2V0SW5mbzogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFhc3NldEluZm8pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQcmVmYWIgbm90IGZvdW5kJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdsb2FkLWFzc2V0Jywge1xuICAgICAgICAgICAgICAgICAgICB1dWlkOiBhc3NldEluZm8udXVpZFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkudGhlbigocHJlZmFiRGF0YTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV1aWQ6IHByZWZhYkRhdGEudXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHByZWZhYkRhdGEubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdQcmVmYWIgbG9hZGVkIHN1Y2Nlc3NmdWxseSdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycjogRXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnIubWVzc2FnZSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGluc3RhbnRpYXRlUHJlZmFiKGFyZ3M6IGFueSk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyDojrflj5bpooTliLbkvZPotYTmupDkv6Hmga9cbiAgICAgICAgICAgICAgICBjb25zdCBhc3NldEluZm8gPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdxdWVyeS1hc3NldC1pbmZvJywgYXJncy5wcmVmYWJQYXRoKTtcbiAgICAgICAgICAgICAgICBpZiAoIWFzc2V0SW5mbykge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ+mihOWItuS9k+acquaJvuWIsCcpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIOS9v+eUqOato+ehrueahCBjcmVhdGUtbm9kZSBBUEkg5LuO6aKE5Yi25L2T6LWE5rqQ5a6e5L6L5YyWXG4gICAgICAgICAgICAgICAgY29uc3QgY3JlYXRlTm9kZU9wdGlvbnM6IGFueSA9IHtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXRVdWlkOiBhc3NldEluZm8udXVpZFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAvLyDorr7nva7niLboioLngrlcbiAgICAgICAgICAgICAgICBpZiAoYXJncy5wYXJlbnRVdWlkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZU5vZGVPcHRpb25zLnBhcmVudCA9IGFyZ3MucGFyZW50VXVpZDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyDorr7nva7oioLngrnlkI3np7BcbiAgICAgICAgICAgICAgICBpZiAoYXJncy5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZU5vZGVPcHRpb25zLm5hbWUgPSBhcmdzLm5hbWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChhc3NldEluZm8ubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBjcmVhdGVOb2RlT3B0aW9ucy5uYW1lID0gYXNzZXRJbmZvLm5hbWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8g6K6+572u5Yid5aeL5bGe5oCn77yI5aaC5L2N572u77yJXG4gICAgICAgICAgICAgICAgaWYgKGFyZ3MucG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlTm9kZU9wdGlvbnMuZHVtcCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGFyZ3MucG9zaXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyDliJvlu7roioLngrlcbiAgICAgICAgICAgICAgICBjb25zdCBub2RlVXVpZCA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ2NyZWF0ZS1ub2RlJywgY3JlYXRlTm9kZU9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHV1aWQgPSBBcnJheS5pc0FycmF5KG5vZGVVdWlkKSA/IG5vZGVVdWlkWzBdIDogbm9kZVV1aWQ7XG5cbiAgICAgICAgICAgICAgICAvLyDms6jmhI/vvJpjcmVhdGUtbm9kZSBBUEnku47pooTliLbkvZPotYTmupDliJvlu7rml7blupTor6Xoh6rliqjlu7rnq4vpooTliLbkvZPlhbPogZRcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn6aKE5Yi25L2T6IqC54K55Yib5bu65oiQ5YqfOicsIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZVV1aWQ6IHV1aWQsXG4gICAgICAgICAgICAgICAgICAgIHByZWZhYlV1aWQ6IGFzc2V0SW5mby51dWlkLFxuICAgICAgICAgICAgICAgICAgICBwcmVmYWJQYXRoOiBhcmdzLnByZWZhYlBhdGhcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVV1aWQ6IHV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVmYWJQYXRoOiBhcmdzLnByZWZhYlBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRVdWlkOiBhcmdzLnBhcmVudFV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogYXJncy5wb3NpdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICfpooTliLbkvZPlrp7kvovljJbmiJDlip/vvIzlt7Llu7rnq4vpooTliLbkvZPlhbPogZQnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSwgXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBg6aKE5Yi25L2T5a6e5L6L5YyW5aSx6LSlOiAke2Vyci5tZXNzYWdlfWAsXG4gICAgICAgICAgICAgICAgICAgIGluc3RydWN0aW9uOiAn6K+35qOA5p+l6aKE5Yi25L2T6Lev5b6E5piv5ZCm5q2j56Gu77yM56Gu5L+d6aKE5Yi25L2T5paH5Lu25qC85byP5q2j56GuJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDlu7rnq4voioLngrnkuI7pooTliLbkvZPnmoTlhbPogZTlhbPns7tcbiAgICAgKiDov5nkuKrmlrnms5XliJvlu7rlv4XopoHnmoRQcmVmYWJJbmZv5ZKMUHJlZmFiSW5zdGFuY2Xnu5PmnoRcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIGVzdGFibGlzaFByZWZhYkNvbm5lY3Rpb24obm9kZVV1aWQ6IHN0cmluZywgcHJlZmFiVXVpZDogc3RyaW5nLCBwcmVmYWJQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIOivu+WPlumihOWItuS9k+aWh+S7tuiOt+WPluagueiKgueCueeahGZpbGVJZFxuICAgICAgICAgICAgY29uc3QgcHJlZmFiQ29udGVudCA9IGF3YWl0IHRoaXMucmVhZFByZWZhYkZpbGUocHJlZmFiUGF0aCk7XG4gICAgICAgICAgICBpZiAoIXByZWZhYkNvbnRlbnQgfHwgIXByZWZhYkNvbnRlbnQuZGF0YSB8fCAhcHJlZmFiQ29udGVudC5kYXRhLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcign5peg5rOV6K+75Y+W6aKE5Yi25L2T5paH5Lu25YaF5a65Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOaJvuWIsOmihOWItuS9k+agueiKgueCueeahGZpbGVJZCAo6YCa5bi45piv56ys5LqM5Liq5a+56LGh77yM5Y2z57Si5byVMSlcbiAgICAgICAgICAgIGNvbnN0IHJvb3ROb2RlID0gcHJlZmFiQ29udGVudC5kYXRhLmZpbmQoKGl0ZW06IGFueSkgPT4gaXRlbS5fX3R5cGUgPT09ICdjYy5Ob2RlJyAmJiBpdGVtLl9wYXJlbnQgPT09IG51bGwpO1xuICAgICAgICAgICAgaWYgKCFyb290Tm9kZSB8fCAhcm9vdE5vZGUuX3ByZWZhYikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcign5peg5rOV5om+5Yiw6aKE5Yi25L2T5qC56IqC54K55oiW5YW26aKE5Yi25L2T5L+h5oGvJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOiOt+WPluagueiKgueCueeahFByZWZhYkluZm9cbiAgICAgICAgICAgIGNvbnN0IHJvb3RQcmVmYWJJbmZvID0gcHJlZmFiQ29udGVudC5kYXRhW3Jvb3ROb2RlLl9wcmVmYWIuX19pZF9fXTtcbiAgICAgICAgICAgIGlmICghcm9vdFByZWZhYkluZm8gfHwgcm9vdFByZWZhYkluZm8uX190eXBlICE9PSAnY2MuUHJlZmFiSW5mbycpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ+aXoOazleaJvuWIsOmihOWItuS9k+agueiKgueCueeahFByZWZhYkluZm8nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qgcm9vdEZpbGVJZCA9IHJvb3RQcmVmYWJJbmZvLmZpbGVJZDtcblxuICAgICAgICAgICAgLy8g5L2/55Soc2NlbmUgQVBJ5bu656uL6aKE5Yi25L2T6L+e5o6lXG4gICAgICAgICAgICBjb25zdCBwcmVmYWJDb25uZWN0aW9uRGF0YSA9IHtcbiAgICAgICAgICAgICAgICBub2RlOiBub2RlVXVpZCxcbiAgICAgICAgICAgICAgICBwcmVmYWI6IHByZWZhYlV1aWQsXG4gICAgICAgICAgICAgICAgZmlsZUlkOiByb290RmlsZUlkXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyDlsJ3or5Xkvb/nlKjlpJrnp41BUEnmlrnms5Xlu7rnq4vpooTliLbkvZPov57mjqVcbiAgICAgICAgICAgIGNvbnN0IGNvbm5lY3Rpb25NZXRob2RzID0gW1xuICAgICAgICAgICAgICAgICgpID0+IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ2Nvbm5lY3QtcHJlZmFiLWluc3RhbmNlJywgcHJlZmFiQ29ubmVjdGlvbkRhdGEpLFxuICAgICAgICAgICAgICAgICgpID0+IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3NldC1wcmVmYWItY29ubmVjdGlvbicsIHByZWZhYkNvbm5lY3Rpb25EYXRhKSxcbiAgICAgICAgICAgICAgICAoKSA9PiBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdhcHBseS1wcmVmYWItbGluaycsIHByZWZhYkNvbm5lY3Rpb25EYXRhKVxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgbGV0IGNvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yIChjb25zdCBtZXRob2Qgb2YgY29ubmVjdGlvbk1ldGhvZHMpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBtZXRob2QoKTtcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCfpooTliLbkvZPov57mjqXmlrnms5XlpLHotKXvvIzlsJ3or5XkuIvkuIDkuKrmlrnms5U6JywgZXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFjb25uZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAvLyDlpoLmnpzmiYDmnIlBUEnmlrnms5Xpg73lpLHotKXvvIzlsJ3or5XmiYvliqjkv67mlLnlnLrmma/mlbDmja5cbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ+aJgOaciemihOWItuS9k+i/nuaOpUFQSemDveWksei0pe+8jOWwneivleaJi+WKqOW7uueri+i/nuaOpScpO1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMubWFudWFsbHlFc3RhYmxpc2hQcmVmYWJDb25uZWN0aW9uKG5vZGVVdWlkLCBwcmVmYWJVdWlkLCByb290RmlsZUlkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcign5bu656uL6aKE5Yi25L2T6L+e5o6l5aSx6LSlOicsIGVycm9yKTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5omL5Yqo5bu656uL6aKE5Yi25L2T6L+e5o6l77yI5b2TQVBJ5pa55rOV5aSx6LSl5pe255qE5aSH55So5pa55qGI77yJXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBtYW51YWxseUVzdGFibGlzaFByZWZhYkNvbm5lY3Rpb24obm9kZVV1aWQ6IHN0cmluZywgcHJlZmFiVXVpZDogc3RyaW5nLCByb290RmlsZUlkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIOWwneivleS9v+eUqGR1bXAgQVBJ5L+u5pS56IqC54K555qEX3ByZWZhYuWxnuaAp1xuICAgICAgICAgICAgY29uc3QgcHJlZmFiQ29ubmVjdGlvbkRhdGEgPSB7XG4gICAgICAgICAgICAgICAgW25vZGVVdWlkXToge1xuICAgICAgICAgICAgICAgICAgICAnX3ByZWZhYic6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdfX3V1aWRfXyc6IHByZWZhYlV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAnX19leHBlY3RlZFR5cGVfXyc6ICdjYy5QcmVmYWInLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2ZpbGVJZCc6IHJvb3RGaWxlSWRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3NldC1wcm9wZXJ0eScsIHtcbiAgICAgICAgICAgICAgICB1dWlkOiBub2RlVXVpZCxcbiAgICAgICAgICAgICAgICBwYXRoOiAnX3ByZWZhYicsXG4gICAgICAgICAgICAgICAgZHVtcDoge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ19fdXVpZF9fJzogcHJlZmFiVXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdfX2V4cGVjdGVkVHlwZV9fJzogJ2NjLlByZWZhYidcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCfmiYvliqjlu7rnq4vpooTliLbkvZPov57mjqXkuZ/lpLHotKU6JywgZXJyb3IpO1xuICAgICAgICAgICAgLy8g5LiN5oqb5Ye66ZSZ6K+v77yM5Zug5Li65Z+65pys55qE6IqC54K55Yib5bu65bey57uP5oiQ5YqfXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDor7vlj5bpooTliLbkvZPmlofku7blhoXlrrlcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIHJlYWRQcmVmYWJGaWxlKHByZWZhYlBhdGg6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyDlsJ3or5Xkvb/nlKhhc3NldC1kYiBBUEnor7vlj5bmlofku7blhoXlrrlcbiAgICAgICAgICAgIGxldCBhc3NldENvbnRlbnQ6IGFueTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXNzZXRDb250ZW50ID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAncXVlcnktYXNzZXQtaW5mbycsIHByZWZhYlBhdGgpO1xuICAgICAgICAgICAgICAgIGlmIChhc3NldENvbnRlbnQgJiYgYXNzZXRDb250ZW50LnNvdXJjZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyDlpoLmnpzmnIlzb3VyY2Xot6/lvoTvvIznm7TmjqXor7vlj5bmlofku7ZcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmdWxsUGF0aCA9IHBhdGgucmVzb2x2ZShhc3NldENvbnRlbnQuc291cmNlKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZUNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZnVsbFBhdGgsICd1dGY4Jyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGZpbGVDb250ZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybign5L2/55SoYXNzZXQtZGLor7vlj5blpLHotKXvvIzlsJ3or5Xlhbbku5bmlrnms5U6JywgZXJyb3IpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyDlpIfnlKjmlrnms5XvvJrovazmjaJkYjovL+i3r+W+hOS4uuWunumZheaWh+S7tui3r+W+hFxuICAgICAgICAgICAgY29uc3QgZnNQYXRoID0gcHJlZmFiUGF0aC5yZXBsYWNlKCdkYjovL2Fzc2V0cy8nLCAnYXNzZXRzLycpLnJlcGxhY2UoJ2RiOi8vYXNzZXRzJywgJ2Fzc2V0cycpO1xuICAgICAgICAgICAgY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuICAgICAgICAgICAgY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5bCd6K+V5aSa5Liq5Y+v6IO955qE6aG555uu5qC56Lev5b6EXG4gICAgICAgICAgICBjb25zdCBwb3NzaWJsZVBhdGhzID0gW1xuICAgICAgICAgICAgICAgIHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCAnLi4vLi4vTmV3UHJvamVjdF8zJywgZnNQYXRoKSxcbiAgICAgICAgICAgICAgICBwYXRoLnJlc29sdmUoJy9Vc2Vycy9saXpoaXlvbmcvTmV3UHJvamVjdF8zJywgZnNQYXRoKSxcbiAgICAgICAgICAgICAgICBwYXRoLnJlc29sdmUoZnNQYXRoKSxcbiAgICAgICAgICAgICAgICAvLyDlpoLmnpzmmK/moLnnm67lvZXkuIvnmoTmlofku7bvvIzkuZ/lsJ3or5Xnm7TmjqXot6/lvoRcbiAgICAgICAgICAgICAgICBwYXRoLnJlc29sdmUoJy9Vc2Vycy9saXpoaXlvbmcvTmV3UHJvamVjdF8zL2Fzc2V0cycsIHBhdGguYmFzZW5hbWUoZnNQYXRoKSlcbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCflsJ3or5Xor7vlj5bpooTliLbkvZPmlofku7bvvIzot6/lvoTovazmjaI6Jywge1xuICAgICAgICAgICAgICAgIG9yaWdpbmFsUGF0aDogcHJlZmFiUGF0aCxcbiAgICAgICAgICAgICAgICBmc1BhdGg6IGZzUGF0aCxcbiAgICAgICAgICAgICAgICBwb3NzaWJsZVBhdGhzOiBwb3NzaWJsZVBhdGhzXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZm9yIChjb25zdCBmdWxsUGF0aCBvZiBwb3NzaWJsZVBhdGhzKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYOajgOafpei3r+W+hDogJHtmdWxsUGF0aH1gKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoZnVsbFBhdGgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhg5om+5Yiw5paH5Lu2OiAke2Z1bGxQYXRofWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZUNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZnVsbFBhdGgsICd1dGY4Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKGZpbGVDb250ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfmlofku7bop6PmnpDmiJDlip/vvIzmlbDmja7nu5PmnoQ6Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc0RhdGE6ICEhcGFyc2VkLmRhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YUxlbmd0aDogcGFyc2VkLmRhdGEgPyBwYXJzZWQuZGF0YS5sZW5ndGggOiAwXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZWQ7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhg5paH5Lu25LiN5a2Y5ZyoOiAke2Z1bGxQYXRofWApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAocmVhZEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybihg6K+75Y+W5paH5Lu25aSx6LSlICR7ZnVsbFBhdGh9OmAsIHJlYWRFcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ+aXoOazleaJvuWIsOaIluivu+WPlumihOWItuS9k+aWh+S7ticpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcign6K+75Y+W6aKE5Yi25L2T5paH5Lu25aSx6LSlOicsIGVycm9yKTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyB0cnlDcmVhdGVOb2RlV2l0aFByZWZhYihhcmdzOiBhbnkpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3F1ZXJ5LWFzc2V0LWluZm8nLCBhcmdzLnByZWZhYlBhdGgpLnRoZW4oKGFzc2V0SW5mbzogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFhc3NldEluZm8pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCfpooTliLbkvZPmnKrmib7liLAnKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyDmlrnms5UyOiDkvb/nlKggY3JlYXRlLW5vZGUg5oyH5a6a6aKE5Yi25L2T6LWE5rqQXG4gICAgICAgICAgICAgICAgY29uc3QgY3JlYXRlTm9kZU9wdGlvbnM6IGFueSA9IHtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXRVdWlkOiBhc3NldEluZm8udXVpZFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAvLyDorr7nva7niLboioLngrlcbiAgICAgICAgICAgICAgICBpZiAoYXJncy5wYXJlbnRVdWlkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZU5vZGVPcHRpb25zLnBhcmVudCA9IGFyZ3MucGFyZW50VXVpZDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAnY3JlYXRlLW5vZGUnLCBjcmVhdGVOb2RlT3B0aW9ucyk7XG4gICAgICAgICAgICB9KS50aGVuKChub2RlVXVpZDogc3RyaW5nIHwgc3RyaW5nW10pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB1dWlkID0gQXJyYXkuaXNBcnJheShub2RlVXVpZCkgPyBub2RlVXVpZFswXSA6IG5vZGVVdWlkO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIOWmguaenOaMh+WumuS6huS9jee9ru+8jOiuvue9ruiKgueCueS9jee9rlxuICAgICAgICAgICAgICAgIGlmIChhcmdzLnBvc2l0aW9uICYmIHV1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAnc2V0LXByb3BlcnR5Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXVpZDogdXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6ICdwb3NpdGlvbicsXG4gICAgICAgICAgICAgICAgICAgICAgICBkdW1wOiB7IHZhbHVlOiBhcmdzLnBvc2l0aW9uIH1cbiAgICAgICAgICAgICAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVV1aWQ6IHV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZWZhYlBhdGg6IGFyZ3MucHJlZmFiUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IGFyZ3MucG9zaXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICfpooTliLbkvZPlrp7kvovljJbmiJDlip/vvIjlpIfnlKjmlrnms5XvvInlubborr7nva7kuobkvY3nva4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlVXVpZDogdXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiUGF0aDogYXJncy5wcmVmYWJQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAn6aKE5Yi25L2T5a6e5L6L5YyW5oiQ5Yqf77yI5aSH55So5pa55rOV77yJ5L2G5L2N572u6K6+572u5aSx6LSlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVV1aWQ6IHV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiUGF0aDogYXJncy5wcmVmYWJQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICfpooTliLbkvZPlrp7kvovljJbmiJDlip/vvIjlpIfnlKjmlrnms5XvvIknXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnI6IEVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogYOWkh+eUqOmihOWItuS9k+WunuS+i+WMluaWueazleS5n+Wksei0pTogJHtlcnIubWVzc2FnZX1gXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyB0cnlBbHRlcm5hdGl2ZUluc3RhbnRpYXRlTWV0aG9kcyhhcmdzOiBhbnkpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy8g5pa55rOVMTog5bCd6K+V5L2/55SoIGNyZWF0ZS1ub2RlIOeEtuWQjuiuvue9rumihOWItuS9k1xuICAgICAgICAgICAgICAgIGNvbnN0IGFzc2V0SW5mbyA9IGF3YWl0IHRoaXMuZ2V0QXNzZXRJbmZvKGFyZ3MucHJlZmFiUGF0aCk7XG4gICAgICAgICAgICAgICAgaWYgKCFhc3NldEluZm8pIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ+aXoOazleiOt+WPlumihOWItuS9k+S/oeaBrycgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyDliJvlu7rnqbroioLngrlcbiAgICAgICAgICAgICAgICBjb25zdCBjcmVhdGVSZXN1bHQgPSBhd2FpdCB0aGlzLmNyZWF0ZU5vZGUoYXJncy5wYXJlbnRVdWlkLCBhcmdzLnBvc2l0aW9uKTtcbiAgICAgICAgICAgICAgICBpZiAoIWNyZWF0ZVJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoY3JlYXRlUmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIOWwneivleWwhumihOWItuS9k+W6lOeUqOWIsOiKgueCuVxuICAgICAgICAgICAgICAgIGNvbnN0IGFwcGx5UmVzdWx0ID0gYXdhaXQgdGhpcy5hcHBseVByZWZhYlRvTm9kZShjcmVhdGVSZXN1bHQuZGF0YS5ub2RlVXVpZCwgYXNzZXRJbmZvLnV1aWQpO1xuICAgICAgICAgICAgICAgIGlmIChhcHBseVJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlVXVpZDogY3JlYXRlUmVzdWx0LmRhdGEubm9kZVV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogY3JlYXRlUmVzdWx0LmRhdGEubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAn6aKE5Yi25L2T5a6e5L6L5YyW5oiQ5Yqf77yI5L2/55So5aSH6YCJ5pa55rOV77yJJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6ICfml6Dms5XlsIbpooTliLbkvZPlupTnlKjliLDoioLngrknLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVVdWlkOiBjcmVhdGVSZXN1bHQuZGF0YS5ub2RlVXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAn5bey5Yib5bu66IqC54K577yM5L2G5peg5rOV5bqU55So6aKE5Yi25L2T5pWw5o2uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYOWkh+mAieWunuS+i+WMluaWueazleWksei0pTogJHtlcnJvcn1gIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGdldEFzc2V0SW5mbyhwcmVmYWJQYXRoOiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3F1ZXJ5LWFzc2V0LWluZm8nLCBwcmVmYWJQYXRoKS50aGVuKChhc3NldEluZm86IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoYXNzZXRJbmZvKTtcbiAgICAgICAgICAgIH0pLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKG51bGwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgY3JlYXRlTm9kZShwYXJlbnRVdWlkPzogc3RyaW5nLCBwb3NpdGlvbj86IGFueSk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY3JlYXRlTm9kZU9wdGlvbnM6IGFueSA9IHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnUHJlZmFiSW5zdGFuY2UnXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyDorr7nva7niLboioLngrlcbiAgICAgICAgICAgIGlmIChwYXJlbnRVdWlkKSB7XG4gICAgICAgICAgICAgICAgY3JlYXRlTm9kZU9wdGlvbnMucGFyZW50ID0gcGFyZW50VXVpZDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g6K6+572u5L2N572uXG4gICAgICAgICAgICBpZiAocG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICBjcmVhdGVOb2RlT3B0aW9ucy5kdW1wID0ge1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogcG9zaXRpb25cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdjcmVhdGUtbm9kZScsIGNyZWF0ZU5vZGVPcHRpb25zKS50aGVuKChub2RlVXVpZDogc3RyaW5nIHwgc3RyaW5nW10pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB1dWlkID0gQXJyYXkuaXNBcnJheShub2RlVXVpZCkgPyBub2RlVXVpZFswXSA6IG5vZGVVdWlkO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlVXVpZDogdXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdQcmVmYWJJbnN0YW5jZSdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIHx8ICfliJvlu7roioLngrnlpLHotKUnIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgYXBwbHlQcmVmYWJUb05vZGUobm9kZVV1aWQ6IHN0cmluZywgcHJlZmFiVXVpZDogc3RyaW5nKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICAvLyDlsJ3or5XlpJrnp43mlrnms5XmnaXlupTnlKjpooTliLbkvZPmlbDmja5cbiAgICAgICAgICAgIGNvbnN0IG1ldGhvZHMgPSBbXG4gICAgICAgICAgICAgICAgKCkgPT4gRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAnYXBwbHktcHJlZmFiJywgeyBub2RlOiBub2RlVXVpZCwgcHJlZmFiOiBwcmVmYWJVdWlkIH0pLFxuICAgICAgICAgICAgICAgICgpID0+IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3NldC1wcmVmYWInLCB7IG5vZGU6IG5vZGVVdWlkLCBwcmVmYWI6IHByZWZhYlV1aWQgfSksXG4gICAgICAgICAgICAgICAgKCkgPT4gRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAnbG9hZC1wcmVmYWItdG8tbm9kZScsIHsgbm9kZTogbm9kZVV1aWQsIHByZWZhYjogcHJlZmFiVXVpZCB9KVxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgY29uc3QgdHJ5TWV0aG9kID0gKGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPj0gbWV0aG9kcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ+aXoOazleW6lOeUqOmihOWItuS9k+aVsOaNricgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBtZXRob2RzW2luZGV4XSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRyeU1ldGhvZChpbmRleCArIDEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdHJ5TWV0aG9kKDApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDkvb/nlKggYXNzZXQtZGIgQVBJIOWIm+W7uumihOWItuS9k+eahOaWsOaWueazlVxuICAgICAqIOa3seW6puaVtOWQiOW8leaTjueahOi1hOa6kOeuoeeQhuezu+e7n++8jOWunueOsOWujOaVtOeahOmihOWItuS9k+WIm+W7uua1geeoi1xuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgY3JlYXRlUHJlZmFiV2l0aEFzc2V0REIobm9kZVV1aWQ6IHN0cmluZywgc2F2ZVBhdGg6IHN0cmluZywgcHJlZmFiTmFtZTogc3RyaW5nLCBpbmNsdWRlQ2hpbGRyZW46IGJvb2xlYW4sIGluY2x1ZGVDb21wb25lbnRzOiBib29sZWFuKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCc9PT0g5L2/55SoIEFzc2V0LURCIEFQSSDliJvlu7rpooTliLbkvZMgPT09Jyk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYOiKgueCuVVVSUQ6ICR7bm9kZVV1aWR9YCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYOS/neWtmOi3r+W+hDogJHtzYXZlUGF0aH1gKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhg6aKE5Yi25L2T5ZCN56ewOiAke3ByZWZhYk5hbWV9YCk7XG5cbiAgICAgICAgICAgICAgICAvLyDnrKzkuIDmraXvvJrojrflj5boioLngrnmlbDmja7vvIjljIXmi6zlj5jmjaLlsZ7mgKfvvIlcbiAgICAgICAgICAgICAgICBjb25zdCBub2RlRGF0YSA9IGF3YWl0IHRoaXMuZ2V0Tm9kZURhdGEobm9kZVV1aWQpO1xuICAgICAgICAgICAgICAgIGlmICghbm9kZURhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiAn5peg5rOV6I635Y+W6IqC54K55pWw5o2uJ1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfojrflj5bliLDoioLngrnmlbDmja7vvIzlrZDoioLngrnmlbDph486Jywgbm9kZURhdGEuY2hpbGRyZW4gPyBub2RlRGF0YS5jaGlsZHJlbi5sZW5ndGggOiAwKTtcblxuICAgICAgICAgICAgICAgIC8vIOesrOS6jOatpe+8muWFiOWIm+W7uui1hOa6kOaWh+S7tuS7peiOt+WPluW8leaTjuWIhumFjeeahFVVSURcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5Yib5bu66aKE5Yi25L2T6LWE5rqQ5paH5Lu2Li4uJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgdGVtcFByZWZhYkNvbnRlbnQgPSBKU09OLnN0cmluZ2lmeShbe1wiX190eXBlX19cIjogXCJjYy5QcmVmYWJcIiwgXCJfbmFtZVwiOiBwcmVmYWJOYW1lfV0sIG51bGwsIDIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNyZWF0ZVJlc3VsdCA9IGF3YWl0IHRoaXMuY3JlYXRlQXNzZXRXaXRoQXNzZXREQihzYXZlUGF0aCwgdGVtcFByZWZhYkNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIGlmICghY3JlYXRlUmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjcmVhdGVSZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8g6I635Y+W5byV5pOO5YiG6YWN55qE5a6e6ZmFVVVJRFxuICAgICAgICAgICAgICAgIGNvbnN0IGFjdHVhbFByZWZhYlV1aWQgPSBjcmVhdGVSZXN1bHQuZGF0YT8udXVpZDtcbiAgICAgICAgICAgICAgICBpZiAoIWFjdHVhbFByZWZhYlV1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiAn5peg5rOV6I635Y+W5byV5pOO5YiG6YWN55qE6aKE5Yi25L2TVVVJRCdcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+W8leaTjuWIhumFjeeahFVVSUQ6JywgYWN0dWFsUHJlZmFiVXVpZCk7XG5cbiAgICAgICAgICAgICAgICAvLyDnrKzkuInmraXvvJrkvb/nlKjlrp7pmYVVVUlE6YeN5paw55Sf5oiQ6aKE5Yi25L2T5YaF5a65XG4gICAgICAgICAgICAgICAgY29uc3QgcHJlZmFiQ29udGVudCA9IGF3YWl0IHRoaXMuY3JlYXRlU3RhbmRhcmRQcmVmYWJDb250ZW50KG5vZGVEYXRhLCBwcmVmYWJOYW1lLCBhY3R1YWxQcmVmYWJVdWlkLCBpbmNsdWRlQ2hpbGRyZW4sIGluY2x1ZGVDb21wb25lbnRzKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmVmYWJDb250ZW50U3RyaW5nID0gSlNPTi5zdHJpbmdpZnkocHJlZmFiQ29udGVudCwgbnVsbCwgMik7XG5cbiAgICAgICAgICAgICAgICAvLyDnrKzlm5vmraXvvJrmm7TmlrDpooTliLbkvZPmlofku7blhoXlrrlcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5pu05paw6aKE5Yi25L2T5paH5Lu25YaF5a65Li4uJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgdXBkYXRlUmVzdWx0ID0gYXdhaXQgdGhpcy51cGRhdGVBc3NldFdpdGhBc3NldERCKHNhdmVQYXRoLCBwcmVmYWJDb250ZW50U3RyaW5nKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDnrKzkupTmraXvvJrliJvlu7rlr7nlupTnmoRtZXRh5paH5Lu277yI5L2/55So5a6e6ZmFVVVJRO+8iVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfliJvlu7rpooTliLbkvZNtZXRh5paH5Lu2Li4uJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgbWV0YUNvbnRlbnQgPSB0aGlzLmNyZWF0ZVN0YW5kYXJkTWV0YUNvbnRlbnQocHJlZmFiTmFtZSwgYWN0dWFsUHJlZmFiVXVpZCk7XG4gICAgICAgICAgICAgICAgY29uc3QgbWV0YVJlc3VsdCA9IGF3YWl0IHRoaXMuY3JlYXRlTWV0YVdpdGhBc3NldERCKHNhdmVQYXRoLCBtZXRhQ29udGVudCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g56ys5YWt5q2l77ya6YeN5paw5a+85YWl6LWE5rqQ5Lul5pu05paw5byV55SoXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+mHjeaWsOWvvOWFpemihOWItuS9k+i1hOa6kC4uLicpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlaW1wb3J0UmVzdWx0ID0gYXdhaXQgdGhpcy5yZWltcG9ydEFzc2V0V2l0aEFzc2V0REIoc2F2ZVBhdGgpO1xuXG4gICAgICAgICAgICAgICAgLy8g56ys5LiD5q2l77ya5bCd6K+V5bCG5Y6f5aeL6IqC54K56L2s5o2i5Li66aKE5Yi25L2T5a6e5L6LXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ+WwneivleWwhuWOn+Wni+iKgueCuei9rOaNouS4uumihOWItuS9k+WunuS+iy4uLicpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnZlcnRSZXN1bHQgPSBhd2FpdCB0aGlzLmNvbnZlcnROb2RlVG9QcmVmYWJJbnN0YW5jZShub2RlVXVpZCwgYWN0dWFsUHJlZmFiVXVpZCwgc2F2ZVBhdGgpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVmYWJVdWlkOiBhY3R1YWxQcmVmYWJVdWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiUGF0aDogc2F2ZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlVXVpZDogbm9kZVV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVmYWJOYW1lOiBwcmVmYWJOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udmVydGVkVG9QcmVmYWJJbnN0YW5jZTogY29udmVydFJlc3VsdC5zdWNjZXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlQXNzZXRSZXN1bHQ6IGNyZWF0ZVJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZVJlc3VsdDogdXBkYXRlUmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0YVJlc3VsdDogbWV0YVJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlaW1wb3J0UmVzdWx0OiByZWltcG9ydFJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnZlcnRSZXN1bHQ6IGNvbnZlcnRSZXN1bHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjb252ZXJ0UmVzdWx0LnN1Y2Nlc3MgPyAn6aKE5Yi25L2T5Yib5bu65bm25oiQ5Yqf6L2s5o2i5Y6f5aeL6IqC54K5JyA6ICfpooTliLbkvZPliJvlu7rmiJDlip/vvIzkvYboioLngrnovazmjaLlpLHotKUnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCfliJvlu7rpooTliLbkvZPml7blj5HnlJ/plJnor686JywgZXJyb3IpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGDliJvlu7rpooTliLbkvZPlpLHotKU6ICR7ZXJyb3J9YFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGNyZWF0ZVByZWZhYihhcmdzOiBhbnkpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy8g5pSv5oyBIHByZWZhYlBhdGgg5ZKMIHNhdmVQYXRoIOS4pOenjeWPguaVsOWQjVxuICAgICAgICAgICAgICAgIGNvbnN0IHBhdGhQYXJhbSA9IGFyZ3MucHJlZmFiUGF0aCB8fCBhcmdzLnNhdmVQYXRoO1xuICAgICAgICAgICAgICAgIGlmICghcGF0aFBhcmFtKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogJ+e8uuWwkemihOWItuS9k+i3r+W+hOWPguaVsOOAguivt+aPkOS+myBwcmVmYWJQYXRoIOaIliBzYXZlUGF0aOOAgidcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBwcmVmYWJOYW1lID0gYXJncy5wcmVmYWJOYW1lIHx8ICdOZXdQcmVmYWInO1xuICAgICAgICAgICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcGF0aFBhcmFtLmVuZHNXaXRoKCcucHJlZmFiJykgPyBcbiAgICAgICAgICAgICAgICAgICAgcGF0aFBhcmFtIDogYCR7cGF0aFBhcmFtfS8ke3ByZWZhYk5hbWV9LnByZWZhYmA7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBpbmNsdWRlQ2hpbGRyZW4gPSBhcmdzLmluY2x1ZGVDaGlsZHJlbiAhPT0gZmFsc2U7IC8vIOm7mOiupOS4uiB0cnVlXG4gICAgICAgICAgICAgICAgY29uc3QgaW5jbHVkZUNvbXBvbmVudHMgPSBhcmdzLmluY2x1ZGVDb21wb25lbnRzICE9PSBmYWxzZTsgLy8g6buY6K6k5Li6IHRydWVcblxuICAgICAgICAgICAgICAgIC8vIOS8mOWFiOS9v+eUqOaWsOeahCBhc3NldC1kYiDmlrnms5XliJvlu7rpooTliLbkvZNcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5L2/55So5paw55qEIGFzc2V0LWRiIOaWueazleWIm+W7uumihOWItuS9ky4uLicpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFzc2V0RGJSZXN1bHQgPSBhd2FpdCB0aGlzLmNyZWF0ZVByZWZhYldpdGhBc3NldERCKFxuICAgICAgICAgICAgICAgICAgICBhcmdzLm5vZGVVdWlkLFxuICAgICAgICAgICAgICAgICAgICBmdWxsUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgcHJlZmFiTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVkZUNoaWxkcmVuLFxuICAgICAgICAgICAgICAgICAgICBpbmNsdWRlQ29tcG9uZW50c1xuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICBpZiAoYXNzZXREYlJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoYXNzZXREYlJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyDlpoLmnpwgYXNzZXQtZGIg5pa55rOV5aSx6LSl77yM5bCd6K+V5L2/55SoQ29jb3MgQ3JlYXRvcueahOWOn+eUn+mihOWItuS9k+WIm+W7ukFQSVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhc3NldC1kYiDmlrnms5XlpLHotKXvvIzlsJ3or5Xljp/nlJ9BUEkuLi4nKTtcbiAgICAgICAgICAgICAgICBjb25zdCBuYXRpdmVSZXN1bHQgPSBhd2FpdCB0aGlzLmNyZWF0ZVByZWZhYk5hdGl2ZShhcmdzLm5vZGVVdWlkLCBmdWxsUGF0aCk7XG4gICAgICAgICAgICAgICAgaWYgKG5hdGl2ZVJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUobmF0aXZlUmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIOWmguaenOWOn+eUn0FQSeWksei0pe+8jOS9v+eUqOiHquWumuS5ieWunueOsFxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfljp/nlJ9BUEnlpLHotKXvvIzkvb/nlKjoh6rlrprkuYnlrp7njrAuLi4nKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjdXN0b21SZXN1bHQgPSBhd2FpdCB0aGlzLmNyZWF0ZVByZWZhYkN1c3RvbShhcmdzLm5vZGVVdWlkLCBmdWxsUGF0aCwgcHJlZmFiTmFtZSk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShjdXN0b21SZXN1bHQpO1xuXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGDliJvlu7rpooTliLbkvZPml7blj5HnlJ/plJnor686ICR7ZXJyb3J9YFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGNyZWF0ZVByZWZhYk5hdGl2ZShub2RlVXVpZDogc3RyaW5nLCBwcmVmYWJQYXRoOiBzdHJpbmcpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIC8vIOagueaNruWumOaWuUFQSeaWh+aho++8jOS4jeWtmOWcqOebtOaOpeeahOmihOWItuS9k+WIm+W7ukFQSVxuICAgICAgICAgICAgLy8g6aKE5Yi25L2T5Yib5bu66ZyA6KaB5omL5Yqo5Zyo57yW6L6R5Zmo5Lit5a6M5oiQXG4gICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogJ+WOn+eUn+mihOWItuS9k+WIm+W7ukFQSeS4jeWtmOWcqCcsXG4gICAgICAgICAgICAgICAgaW5zdHJ1Y3Rpb246ICfmoLnmja5Db2NvcyBDcmVhdG9y5a6Y5pa5QVBJ5paH5qGj77yM6aKE5Yi25L2T5Yib5bu66ZyA6KaB5omL5Yqo5pON5L2c77yaXFxuMS4g5Zyo5Zy65pmv5Lit6YCJ5oup6IqC54K5XFxuMi4g5bCG6IqC54K55ouW5ou95Yiw6LWE5rqQ566h55CG5Zmo5LitXFxuMy4g5oiW5Y+z6ZSu6IqC54K56YCJ5oupXCLnlJ/miJDpooTliLbkvZNcIidcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGNyZWF0ZVByZWZhYkN1c3RvbShub2RlVXVpZDogc3RyaW5nLCBwcmVmYWJQYXRoOiBzdHJpbmcsIHByZWZhYk5hbWU6IHN0cmluZyk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyAxLiDojrflj5bmupDoioLngrnnmoTlrozmlbTmlbDmja5cbiAgICAgICAgICAgICAgICBjb25zdCBub2RlRGF0YSA9IGF3YWl0IHRoaXMuZ2V0Tm9kZURhdGEobm9kZVV1aWQpO1xuICAgICAgICAgICAgICAgIGlmICghbm9kZURhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBg5peg5rOV5om+5Yiw6IqC54K5OiAke25vZGVVdWlkfWBcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyAyLiDnlJ/miJDpooTliLbkvZNVVUlEXG4gICAgICAgICAgICAgICAgY29uc3QgcHJlZmFiVXVpZCA9IHRoaXMuZ2VuZXJhdGVVVUlEKCk7XG5cbiAgICAgICAgICAgICAgICAvLyAzLiDliJvlu7rpooTliLbkvZPmlbDmja7nu5PmnoRcbiAgICAgICAgICAgICAgICBjb25zdCBwcmVmYWJEYXRhID0gdGhpcy5jcmVhdGVQcmVmYWJEYXRhKG5vZGVEYXRhLCBwcmVmYWJOYW1lLCBwcmVmYWJVdWlkKTtcblxuICAgICAgICAgICAgICAgIC8vIDQuIOWfuuS6juWumOaWueagvOW8j+WIm+W7uumihOWItuS9k+aVsOaNrue7k+aehFxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCc9PT0g5byA5aeL5Yib5bu66aKE5Yi25L2TID09PScpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfoioLngrnlkI3np7A6Jywgbm9kZURhdGEubmFtZT8udmFsdWUgfHwgJ+acquefpScpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfoioLngrlVVUlEOicsIG5vZGVEYXRhLnV1aWQ/LnZhbHVlIHx8ICfmnKrnn6UnKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn6aKE5Yi25L2T5L+d5a2Y6Lev5b6EOicsIHByZWZhYlBhdGgpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDlvIDlp4vliJvlu7rpooTliLbkvZPvvIzoioLngrnmlbDmja46YCwgbm9kZURhdGEpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHByZWZhYkpzb25EYXRhID0gYXdhaXQgdGhpcy5jcmVhdGVTdGFuZGFyZFByZWZhYkNvbnRlbnQobm9kZURhdGEsIHByZWZhYk5hbWUsIHByZWZhYlV1aWQsIHRydWUsIHRydWUpO1xuXG4gICAgICAgICAgICAgICAgLy8gNS4g5Yib5bu65qCH5YeGbWV0YeaWh+S7tuaVsOaNrlxuICAgICAgICAgICAgICAgIGNvbnN0IHN0YW5kYXJkTWV0YURhdGEgPSB0aGlzLmNyZWF0ZVN0YW5kYXJkTWV0YURhdGEocHJlZmFiTmFtZSwgcHJlZmFiVXVpZCk7XG5cbiAgICAgICAgICAgICAgICAvLyA2LiDkv53lrZjpooTliLbkvZPlkoxtZXRh5paH5Lu2XG4gICAgICAgICAgICAgICAgY29uc3Qgc2F2ZVJlc3VsdCA9IGF3YWl0IHRoaXMuc2F2ZVByZWZhYldpdGhNZXRhKHByZWZhYlBhdGgsIHByZWZhYkpzb25EYXRhLCBzdGFuZGFyZE1ldGFEYXRhKTtcblxuICAgICAgICAgICAgICAgIGlmIChzYXZlUmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g5L+d5a2Y5oiQ5Yqf5ZCO77yM5bCG5Y6f5aeL6IqC54K56L2s5o2i5Li66aKE5Yi25L2T5a6e5L6LXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnZlcnRSZXN1bHQgPSBhd2FpdCB0aGlzLmNvbnZlcnROb2RlVG9QcmVmYWJJbnN0YW5jZShub2RlVXVpZCwgcHJlZmFiUGF0aCwgcHJlZmFiVXVpZCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlZmFiVXVpZDogcHJlZmFiVXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVmYWJQYXRoOiBwcmVmYWJQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVVdWlkOiBub2RlVXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVmYWJOYW1lOiBwcmVmYWJOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnZlcnRlZFRvUHJlZmFiSW5zdGFuY2U6IGNvbnZlcnRSZXN1bHQuc3VjY2VzcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBjb252ZXJ0UmVzdWx0LnN1Y2Nlc3MgPyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ+iHquWumuS5iemihOWItuS9k+WIm+W7uuaIkOWKn++8jOWOn+Wni+iKgueCueW3sui9rOaNouS4uumihOWItuS9k+WunuS+iycgOiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ+mihOWItuS9k+WIm+W7uuaIkOWKn++8jOS9huiKgueCuei9rOaNouWksei0pSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBzYXZlUmVzdWx0LmVycm9yIHx8ICfkv53lrZjpooTliLbkvZPmlofku7blpLHotKUnXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBg5Yib5bu66aKE5Yi25L2T5pe25Y+R55Sf6ZSZ6K+vOiAke2Vycm9yfWBcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBnZXROb2RlRGF0YShub2RlVXVpZDogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIOmmluWFiOiOt+WPluWfuuacrOiKgueCueS/oeaBr1xuICAgICAgICAgICAgICAgIGNvbnN0IG5vZGVJbmZvID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAncXVlcnktbm9kZScsIG5vZGVVdWlkKTtcbiAgICAgICAgICAgICAgICBpZiAoIW5vZGVJbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhg6I635Y+W6IqC54K5ICR7bm9kZVV1aWR9IOeahOWfuuacrOS/oeaBr+aIkOWKn2ApO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIOS9v+eUqHF1ZXJ5LW5vZGUtdHJlZeiOt+WPluWMheWQq+WtkOiKgueCueeahOWujOaVtOe7k+aehFxuICAgICAgICAgICAgICAgIGNvbnN0IG5vZGVUcmVlID0gYXdhaXQgdGhpcy5nZXROb2RlV2l0aENoaWxkcmVuKG5vZGVVdWlkKTtcbiAgICAgICAgICAgICAgICBpZiAobm9kZVRyZWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYOiOt+WPluiKgueCuSAke25vZGVVdWlkfSDnmoTlrozmlbTmoJHnu5PmnoTmiJDlip9gKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShub2RlVHJlZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYOS9v+eUqOWfuuacrOiKgueCueS/oeaBr2ApO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG5vZGVJbmZvKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2Fybihg6I635Y+W6IqC54K55pWw5o2u5aSx6LSlICR7bm9kZVV1aWR9OmAsIGVycm9yKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDkvb/nlKhxdWVyeS1ub2RlLXRyZWXojrflj5bljIXlkKvlrZDoioLngrnnmoTlrozmlbToioLngrnnu5PmnoRcbiAgICBwcml2YXRlIGFzeW5jIGdldE5vZGVXaXRoQ2hpbGRyZW4obm9kZVV1aWQ6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyDojrflj5bmlbTkuKrlnLrmma/moJFcbiAgICAgICAgICAgIGNvbnN0IHRyZWUgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdxdWVyeS1ub2RlLXRyZWUnKTtcbiAgICAgICAgICAgIGlmICghdHJlZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyDlnKjmoJHkuK3mn6Xmib7mjIflrprnmoToioLngrlcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldE5vZGUgPSB0aGlzLmZpbmROb2RlSW5UcmVlKHRyZWUsIG5vZGVVdWlkKTtcbiAgICAgICAgICAgIGlmICh0YXJnZXROb2RlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYOWcqOWcuuaZr+agkeS4reaJvuWIsOiKgueCuSAke25vZGVVdWlkfe+8jOWtkOiKgueCueaVsOmHjzogJHt0YXJnZXROb2RlLmNoaWxkcmVuID8gdGFyZ2V0Tm9kZS5jaGlsZHJlbi5sZW5ndGggOiAwfWApO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIOWinuW8uuiKgueCueagke+8jOiOt+WPluavj+S4quiKgueCueeahOato+ehrue7hOS7tuS/oeaBr1xuICAgICAgICAgICAgICAgIGNvbnN0IGVuaGFuY2VkVHJlZSA9IGF3YWl0IHRoaXMuZW5oYW5jZVRyZWVXaXRoTUNQQ29tcG9uZW50cyh0YXJnZXROb2RlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZW5oYW5jZWRUcmVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihg6I635Y+W6IqC54K55qCR57uT5p6E5aSx6LSlICR7bm9kZVV1aWR9OmAsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8g5Zyo6IqC54K55qCR5Lit6YCS5b2S5p+l5om+5oyH5a6aVVVJROeahOiKgueCuVxuICAgIHByaXZhdGUgZmluZE5vZGVJblRyZWUobm9kZTogYW55LCB0YXJnZXRVdWlkOiBzdHJpbmcpOiBhbnkge1xuICAgICAgICBpZiAoIW5vZGUpIHJldHVybiBudWxsO1xuICAgICAgICBcbiAgICAgICAgLy8g5qOA5p+l5b2T5YmN6IqC54K5XG4gICAgICAgIGlmIChub2RlLnV1aWQgPT09IHRhcmdldFV1aWQgfHwgbm9kZS52YWx1ZT8udXVpZCA9PT0gdGFyZ2V0VXVpZCkge1xuICAgICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDpgJLlvZLmo4Dmn6XlrZDoioLngrlcbiAgICAgICAgaWYgKG5vZGUuY2hpbGRyZW4gJiYgQXJyYXkuaXNBcnJheShub2RlLmNoaWxkcmVuKSkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiBub2RlLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZm91bmQgPSB0aGlzLmZpbmROb2RlSW5UcmVlKGNoaWxkLCB0YXJnZXRVdWlkKTtcbiAgICAgICAgICAgICAgICBpZiAoZm91bmQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZvdW5kO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOS9v+eUqE1DUOaOpeWPo+WinuW8uuiKgueCueagke+8jOiOt+WPluato+ehrueahOe7hOS7tuS/oeaBr1xuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgZW5oYW5jZVRyZWVXaXRoTUNQQ29tcG9uZW50cyhub2RlOiBhbnkpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICBpZiAoIW5vZGUgfHwgIW5vZGUudXVpZCkge1xuICAgICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8g5L+u5aSNOuWOn+WunueOsCBmZXRjaCgnaHR0cDovL2xvY2FsaG9zdDo4NTg1L21jcCcpIOiHquiwg+eUqOKAlOKAlOerr+WPo+WGmeatuzg1ODUo5a6e6ZmF5Y+v6YWNLOW4uOS4ujMwMDAp5LiU5LiN5bim6Ym05p2D5aS0LFxuICAgICAgICAgICAgLy8g5b+F54S25aSx6LSl6KKr5ZCeIOKGkiDnu4Tku7bnsbvlnovpgIDljJbmiJAgcXVlcnktbm9kZS10cmVlIOeahOaYjuaWh+exu+WQjSDihpIgcHJlZmFiIOmHjOiEmuacrOe7hOS7tuWPjeW6j+WIl+WMluS4uiBudWxs44CCXG4gICAgICAgICAgICAvLyDmlLnkuLrov5vnqIvlhoXnm7TosIMgcXVlcnktbm9kZSjkuI4gY29tcG9uZW50LXRvb2xzLmdldENvbXBvbmVudHMg5ZCM5rqQKSxfX2NvbXBzX18g55qEIF9fdHlwZV9fL2NpZCDljbPljovnvKlVVUlE44CCXG4gICAgICAgICAgICBjb25zdCBub2RlRGF0YTogYW55ID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAncXVlcnktbm9kZScsIG5vZGUudXVpZCk7XG4gICAgICAgICAgICBpZiAobm9kZURhdGEgJiYgbm9kZURhdGEuX19jb21wc19fKSB7XG4gICAgICAgICAgICAgICAgbm9kZS5jb21wb25lbnRzID0gbm9kZURhdGEuX19jb21wc19fLm1hcCgoY29tcDogYW55KSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBjb21wLl9fdHlwZV9fIHx8IGNvbXAuY2lkIHx8IGNvbXAudHlwZSB8fCAnVW5rbm93bicsXG4gICAgICAgICAgICAgICAgICAgIHV1aWQ6IGNvbXAudXVpZD8udmFsdWUgfHwgY29tcC51dWlkIHx8IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGVuYWJsZWQ6IGNvbXAuZW5hYmxlZCAhPT0gdW5kZWZpbmVkID8gY29tcC5lbmFibGVkIDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczogY29tcC52YWx1ZSB8fCB7fSAgIC8vIHF1ZXJ5LW5vZGUg55qEIGNvbXAudmFsdWUg5LiOIGV4dHJhY3RDb21wb25lbnRQcm9wZXJ0aWVzIOi+k+WHuuWQjOaehCh7cHJvcDp7dmFsdWV9fSks5LiL5ri4IGNvbXBvbmVudERhdGEucHJvcGVydGllcy48cD4udmFsdWUg5YW85a65XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDoioLngrkgJHtub2RlLnV1aWR9IOiOt+WPluWIsCAke25vZGUuY29tcG9uZW50cy5sZW5ndGh9IOS4que7hOS7tihxdWVyeS1ub2Rl55u06LCDLOiEmuacrOe7hOS7tuS4uuWOi+e8qVVVSUTnsbvlnospYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYOiOt+WPluiKgueCuSAke25vZGUudXVpZH0g55qE57uE5Lu25L+h5oGv5aSx6LSlOmAsIGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOmAkuW9kuWkhOeQhuWtkOiKgueCuVxuICAgICAgICBpZiAobm9kZS5jaGlsZHJlbiAmJiBBcnJheS5pc0FycmF5KG5vZGUuY2hpbGRyZW4pKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBub2RlLmNoaWxkcmVuW2ldID0gYXdhaXQgdGhpcy5lbmhhbmNlVHJlZVdpdGhNQ1BDb21wb25lbnRzKG5vZGUuY2hpbGRyZW5baV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBidWlsZEJhc2ljTm9kZUluZm8obm9kZVV1aWQ6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgLy8g5p6E5bu65Z+65pys55qE6IqC54K55L+h5oGvXG4gICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdxdWVyeS1ub2RlJywgbm9kZVV1aWQpLnRoZW4oKG5vZGVJbmZvOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIW5vZGVJbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyDnroDljJbniYjmnKzvvJrlj6rov5Tlm57ln7rmnKzoioLngrnkv6Hmga/vvIzkuI3ojrflj5blrZDoioLngrnlkoznu4Tku7ZcbiAgICAgICAgICAgICAgICAvLyDov5nkupvkv6Hmga/lsIblnKjlkI7nu63nmoTpooTliLbkvZPlpITnkIbkuK3moLnmja7pnIDopoHmt7vliqBcbiAgICAgICAgICAgICAgICBjb25zdCBiYXNpY0luZm8gPSB7XG4gICAgICAgICAgICAgICAgICAgIC4uLm5vZGVJbmZvLFxuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbjogW10sXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtdXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKGJhc2ljSW5mbyk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDpqozor4HoioLngrnmlbDmja7mmK/lkKbmnInmlYhcbiAgICBwcml2YXRlIGlzVmFsaWROb2RlRGF0YShub2RlRGF0YTogYW55KTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghbm9kZURhdGEpIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKHR5cGVvZiBub2RlRGF0YSAhPT0gJ29iamVjdCcpIHJldHVybiBmYWxzZTtcbiAgICAgICAgXG4gICAgICAgIC8vIOajgOafpeWfuuacrOWxnuaApyAtIOmAgumFjXF1ZXJ5LW5vZGUtdHJlZeeahOaVsOaNruagvOW8j1xuICAgICAgICByZXR1cm4gbm9kZURhdGEuaGFzT3duUHJvcGVydHkoJ3V1aWQnKSB8fCBcbiAgICAgICAgICAgICAgIG5vZGVEYXRhLmhhc093blByb3BlcnR5KCduYW1lJykgfHwgXG4gICAgICAgICAgICAgICBub2RlRGF0YS5oYXNPd25Qcm9wZXJ0eSgnX190eXBlX18nKSB8fFxuICAgICAgICAgICAgICAgKG5vZGVEYXRhLnZhbHVlICYmIChcbiAgICAgICAgICAgICAgICAgICBub2RlRGF0YS52YWx1ZS5oYXNPd25Qcm9wZXJ0eSgndXVpZCcpIHx8XG4gICAgICAgICAgICAgICAgICAgbm9kZURhdGEudmFsdWUuaGFzT3duUHJvcGVydHkoJ25hbWUnKSB8fFxuICAgICAgICAgICAgICAgICAgIG5vZGVEYXRhLnZhbHVlLmhhc093blByb3BlcnR5KCdfX3R5cGVfXycpXG4gICAgICAgICAgICAgICApKTtcbiAgICB9XG5cbiAgICAvLyDmj5Dlj5blrZDoioLngrlVVUlE55qE57uf5LiA5pa55rOVXG4gICAgcHJpdmF0ZSBleHRyYWN0Q2hpbGRVdWlkKGNoaWxkUmVmOiBhbnkpOiBzdHJpbmcgfCBudWxsIHtcbiAgICAgICAgaWYgKCFjaGlsZFJlZikgcmV0dXJuIG51bGw7XG4gICAgICAgIFxuICAgICAgICAvLyDmlrnms5UxOiDnm7TmjqXlrZfnrKbkuLJcbiAgICAgICAgaWYgKHR5cGVvZiBjaGlsZFJlZiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHJldHVybiBjaGlsZFJlZjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5pa55rOVMjogdmFsdWXlsZ7mgKfljIXlkKvlrZfnrKbkuLJcbiAgICAgICAgaWYgKGNoaWxkUmVmLnZhbHVlICYmIHR5cGVvZiBjaGlsZFJlZi52YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHJldHVybiBjaGlsZFJlZi52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5pa55rOVMzogdmFsdWUudXVpZOWxnuaAp1xuICAgICAgICBpZiAoY2hpbGRSZWYudmFsdWUgJiYgY2hpbGRSZWYudmFsdWUudXVpZCkge1xuICAgICAgICAgICAgcmV0dXJuIGNoaWxkUmVmLnZhbHVlLnV1aWQ7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOaWueazlTQ6IOebtOaOpXV1aWTlsZ7mgKdcbiAgICAgICAgaWYgKGNoaWxkUmVmLnV1aWQpIHtcbiAgICAgICAgICAgIHJldHVybiBjaGlsZFJlZi51dWlkO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDmlrnms5U1OiBfX2lkX1/lvJXnlKggLSDov5nnp43mg4XlhrXpnIDopoHnibnmrorlpITnkIZcbiAgICAgICAgaWYgKGNoaWxkUmVmLl9faWRfXyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg5Y+R546wX19pZF9f5byV55SoOiAke2NoaWxkUmVmLl9faWRfX33vvIzlj6/og73pnIDopoHku47mlbDmja7nu5PmnoTkuK3mn6Xmib5gKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsOyAvLyDmmoLml7bov5Tlm55udWxs77yM5ZCO57ut5Y+v5Lul5re75Yqg5byV55So6Kej5p6Q6YC76L6RXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUud2Fybign5peg5rOV5o+Q5Y+W5a2Q6IqC54K5VVVJRDonLCBKU09OLnN0cmluZ2lmeShjaGlsZFJlZikpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyDojrflj5bpnIDopoHlpITnkIbnmoTlrZDoioLngrnmlbDmja5cbiAgICBwcml2YXRlIGdldENoaWxkcmVuVG9Qcm9jZXNzKG5vZGVEYXRhOiBhbnkpOiBhbnlbXSB7XG4gICAgICAgIGNvbnN0IGNoaWxkcmVuOiBhbnlbXSA9IFtdO1xuICAgICAgICBcbiAgICAgICAgLy8g5pa55rOVMTog55u05o6l5LuOY2hpbGRyZW7mlbDnu4Tojrflj5bvvIjku45xdWVyeS1ub2RlLXRyZWXov5Tlm57nmoTmlbDmja7vvIlcbiAgICAgICAgaWYgKG5vZGVEYXRhLmNoaWxkcmVuICYmIEFycmF5LmlzQXJyYXkobm9kZURhdGEuY2hpbGRyZW4pKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg5LuOY2hpbGRyZW7mlbDnu4Tojrflj5blrZDoioLngrnvvIzmlbDph486ICR7bm9kZURhdGEuY2hpbGRyZW4ubGVuZ3RofWApO1xuICAgICAgICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiBub2RlRGF0YS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgIC8vIHF1ZXJ5LW5vZGUtdHJlZei/lOWbnueahOWtkOiKgueCuemAmuW4uOW3sue7j+aYr+WujOaVtOeahOaVsOaNrue7k+aehFxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzVmFsaWROb2RlRGF0YShjaGlsZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW4ucHVzaChjaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDmt7vliqDlrZDoioLngrk6ICR7Y2hpbGQubmFtZSB8fCBjaGlsZC52YWx1ZT8ubmFtZSB8fCAn5pyq55+lJ31gKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5a2Q6IqC54K55pWw5o2u5peg5pWIOicsIEpTT04uc3RyaW5naWZ5KGNoaWxkLCBudWxsLCAyKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ+iKgueCueayoeacieWtkOiKgueCueaIlmNoaWxkcmVu5pWw57uE5Li656m6Jyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBjaGlsZHJlbjtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdlbmVyYXRlVVVJRCgpOiBzdHJpbmcge1xuICAgICAgICAvLyDnlJ/miJDnrKblkIhDb2NvcyBDcmVhdG9y5qC85byP55qEVVVJRFxuICAgICAgICBjb25zdCBjaGFycyA9ICcwMTIzNDU2Nzg5YWJjZGVmJztcbiAgICAgICAgbGV0IHV1aWQgPSAnJztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAzMjsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoaSA9PT0gOCB8fCBpID09PSAxMiB8fCBpID09PSAxNiB8fCBpID09PSAyMCkge1xuICAgICAgICAgICAgICAgIHV1aWQgKz0gJy0nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdXVpZCArPSBjaGFyc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjaGFycy5sZW5ndGgpXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdXVpZDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZVByZWZhYkRhdGEobm9kZURhdGE6IGFueSwgcHJlZmFiTmFtZTogc3RyaW5nLCBwcmVmYWJVdWlkOiBzdHJpbmcpOiBhbnlbXSB7XG4gICAgICAgIC8vIOWIm+W7uuagh+WHhueahOmihOWItuS9k+aVsOaNrue7k+aehFxuICAgICAgICBjb25zdCBwcmVmYWJBc3NldCA9IHtcbiAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5QcmVmYWJcIixcbiAgICAgICAgICAgIFwiX25hbWVcIjogcHJlZmFiTmFtZSxcbiAgICAgICAgICAgIFwiX29iakZsYWdzXCI6IDAsXG4gICAgICAgICAgICBcIl9fZWRpdG9yRXh0cmFzX19cIjoge30sXG4gICAgICAgICAgICBcIl9uYXRpdmVcIjogXCJcIixcbiAgICAgICAgICAgIFwiZGF0YVwiOiB7XG4gICAgICAgICAgICAgICAgXCJfX2lkX19cIjogMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwib3B0aW1pemF0aW9uUG9saWN5XCI6IDAsXG4gICAgICAgICAgICBcInBlcnNpc3RlbnRcIjogZmFsc2VcbiAgICAgICAgfTtcblxuICAgICAgICAvLyDlpITnkIboioLngrnmlbDmja7vvIznoa7kv53nrKblkIjpooTliLbkvZPmoLzlvI9cbiAgICAgICAgY29uc3QgcHJvY2Vzc2VkTm9kZURhdGEgPSB0aGlzLnByb2Nlc3NOb2RlRm9yUHJlZmFiKG5vZGVEYXRhLCBwcmVmYWJVdWlkKTtcblxuICAgICAgICByZXR1cm4gW3ByZWZhYkFzc2V0LCAuLi5wcm9jZXNzZWROb2RlRGF0YV07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwcm9jZXNzTm9kZUZvclByZWZhYihub2RlRGF0YTogYW55LCBwcmVmYWJVdWlkOiBzdHJpbmcpOiBhbnlbXSB7XG4gICAgICAgIC8vIOWkhOeQhuiKgueCueaVsOaNruS7peespuWQiOmihOWItuS9k+agvOW8j1xuICAgICAgICBjb25zdCBwcm9jZXNzZWREYXRhOiBhbnlbXSA9IFtdO1xuICAgICAgICBsZXQgaWRDb3VudGVyID0gMTtcblxuICAgICAgICAvLyDpgJLlvZLlpITnkIboioLngrnlkoznu4Tku7ZcbiAgICAgICAgY29uc3QgcHJvY2Vzc05vZGUgPSAobm9kZTogYW55LCBwYXJlbnRJZDogbnVtYmVyID0gMCk6IG51bWJlciA9PiB7XG4gICAgICAgICAgICBjb25zdCBub2RlSWQgPSBpZENvdW50ZXIrKztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5Yib5bu66IqC54K55a+56LGhXG4gICAgICAgICAgICBjb25zdCBwcm9jZXNzZWROb2RlID0ge1xuICAgICAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5Ob2RlXCIsXG4gICAgICAgICAgICAgICAgXCJfbmFtZVwiOiBub2RlLm5hbWUgfHwgXCJOb2RlXCIsXG4gICAgICAgICAgICAgICAgXCJfb2JqRmxhZ3NcIjogMCxcbiAgICAgICAgICAgICAgICBcIl9fZWRpdG9yRXh0cmFzX19cIjoge30sXG4gICAgICAgICAgICAgICAgXCJfcGFyZW50XCI6IHBhcmVudElkID4gMCA/IHsgXCJfX2lkX19cIjogcGFyZW50SWQgfSA6IG51bGwsXG4gICAgICAgICAgICAgICAgXCJfY2hpbGRyZW5cIjogbm9kZS5jaGlsZHJlbiA/IG5vZGUuY2hpbGRyZW4ubWFwKCgpID0+ICh7IFwiX19pZF9fXCI6IGlkQ291bnRlcisrIH0pKSA6IFtdLFxuICAgICAgICAgICAgICAgIFwiX2FjdGl2ZVwiOiBub2RlLmFjdGl2ZSAhPT0gZmFsc2UsXG4gICAgICAgICAgICAgICAgXCJfY29tcG9uZW50c1wiOiBub2RlLmNvbXBvbmVudHMgPyBub2RlLmNvbXBvbmVudHMubWFwKCgpID0+ICh7IFwiX19pZF9fXCI6IGlkQ291bnRlcisrIH0pKSA6IFtdLFxuICAgICAgICAgICAgICAgIFwiX3ByZWZhYlwiOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiX19pZF9fXCI6IGlkQ291bnRlcisrXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcIl9scG9zXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlZlYzNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgICAgICAgICAgICBcInpcIjogMFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCJfbHJvdFwiOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5RdWF0XCIsXG4gICAgICAgICAgICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgICAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICAgICAgICAgICAgXCJ6XCI6IDAsXG4gICAgICAgICAgICAgICAgICAgIFwid1wiOiAxXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcIl9sc2NhbGVcIjoge1xuICAgICAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuVmVjM1wiLFxuICAgICAgICAgICAgICAgICAgICBcInhcIjogMSxcbiAgICAgICAgICAgICAgICAgICAgXCJ5XCI6IDEsXG4gICAgICAgICAgICAgICAgICAgIFwielwiOiAxXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcIl9tb2JpbGl0eVwiOiAwLFxuICAgICAgICAgICAgICAgIFwiX2xheWVyXCI6IDEwNzM3NDE4MjQsXG4gICAgICAgICAgICAgICAgXCJfZXVsZXJcIjoge1xuICAgICAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuVmVjM1wiLFxuICAgICAgICAgICAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICAgICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgICAgICAgICAgIFwielwiOiAwXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcIl9pZFwiOiBcIlwiXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBwcm9jZXNzZWREYXRhLnB1c2gocHJvY2Vzc2VkTm9kZSk7XG5cbiAgICAgICAgICAgIC8vIOWkhOeQhue7hOS7tlxuICAgICAgICAgICAgaWYgKG5vZGUuY29tcG9uZW50cykge1xuICAgICAgICAgICAgICAgIG5vZGUuY29tcG9uZW50cy5mb3JFYWNoKChjb21wb25lbnQ6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb21wb25lbnRJZCA9IGlkQ291bnRlcisrO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9jZXNzZWRDb21wb25lbnRzID0gdGhpcy5wcm9jZXNzQ29tcG9uZW50Rm9yUHJlZmFiKGNvbXBvbmVudCwgY29tcG9uZW50SWQpO1xuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzZWREYXRhLnB1c2goLi4ucHJvY2Vzc2VkQ29tcG9uZW50cyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOWkhOeQhuWtkOiKgueCuVxuICAgICAgICAgICAgaWYgKG5vZGUuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICBub2RlLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc05vZGUoY2hpbGQsIG5vZGVJZCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBub2RlSWQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgcHJvY2Vzc05vZGUobm9kZURhdGEpO1xuICAgICAgICByZXR1cm4gcHJvY2Vzc2VkRGF0YTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHByb2Nlc3NDb21wb25lbnRGb3JQcmVmYWIoY29tcG9uZW50OiBhbnksIGNvbXBvbmVudElkOiBudW1iZXIpOiBhbnlbXSB7XG4gICAgICAgIC8vIOWkhOeQhue7hOS7tuaVsOaNruS7peespuWQiOmihOWItuS9k+agvOW8j1xuICAgICAgICBjb25zdCBwcm9jZXNzZWRDb21wb25lbnQgPSB7XG4gICAgICAgICAgICBcIl9fdHlwZV9fXCI6IGNvbXBvbmVudC50eXBlIHx8IFwiY2MuQ29tcG9uZW50XCIsXG4gICAgICAgICAgICBcIl9uYW1lXCI6IFwiXCIsXG4gICAgICAgICAgICBcIl9vYmpGbGFnc1wiOiAwLFxuICAgICAgICAgICAgXCJfX2VkaXRvckV4dHJhc19fXCI6IHt9LFxuICAgICAgICAgICAgXCJub2RlXCI6IHtcbiAgICAgICAgICAgICAgICBcIl9faWRfX1wiOiBjb21wb25lbnRJZCAtIDFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcIl9lbmFibGVkXCI6IGNvbXBvbmVudC5lbmFibGVkICE9PSBmYWxzZSxcbiAgICAgICAgICAgIFwiX19wcmVmYWJcIjoge1xuICAgICAgICAgICAgICAgIFwiX19pZF9fXCI6IGNvbXBvbmVudElkICsgMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC4uLmNvbXBvbmVudC5wcm9wZXJ0aWVzXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8g5re75Yqg57uE5Lu254m55a6a55qE6aKE5Yi25L2T5L+h5oGvXG4gICAgICAgIGNvbnN0IGNvbXBQcmVmYWJJbmZvID0ge1xuICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLkNvbXBQcmVmYWJJbmZvXCIsXG4gICAgICAgICAgICBcImZpbGVJZFwiOiB0aGlzLmdlbmVyYXRlRmlsZUlkKClcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gW3Byb2Nlc3NlZENvbXBvbmVudCwgY29tcFByZWZhYkluZm9dO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2VuZXJhdGVGaWxlSWQoKTogc3RyaW5nIHtcbiAgICAgICAgLy8g55Sf5oiQ5paH5Lu2SUTvvIjnroDljJbniYjmnKzvvIlcbiAgICAgICAgY29uc3QgY2hhcnMgPSAnYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWjAxMjM0NTY3ODkrLyc7XG4gICAgICAgIGxldCBmaWxlSWQgPSAnJztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAyMjsgaSsrKSB7XG4gICAgICAgICAgICBmaWxlSWQgKz0gY2hhcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2hhcnMubGVuZ3RoKV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZpbGVJZDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZU1ldGFEYXRhKHByZWZhYk5hbWU6IHN0cmluZywgcHJlZmFiVXVpZDogc3RyaW5nKTogYW55IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIFwidmVyXCI6IFwiMS4xLjUwXCIsXG4gICAgICAgICAgICBcImltcG9ydGVyXCI6IFwicHJlZmFiXCIsXG4gICAgICAgICAgICBcImltcG9ydGVkXCI6IHRydWUsXG4gICAgICAgICAgICBcInV1aWRcIjogcHJlZmFiVXVpZCxcbiAgICAgICAgICAgIFwiZmlsZXNcIjogW1xuICAgICAgICAgICAgICAgIFwiLmpzb25cIlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwic3ViTWV0YXNcIjoge30sXG4gICAgICAgICAgICBcInVzZXJEYXRhXCI6IHtcbiAgICAgICAgICAgICAgICBcInN5bmNOb2RlTmFtZVwiOiBwcmVmYWJOYW1lXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBzYXZlUHJlZmFiRmlsZXMocHJlZmFiUGF0aDogc3RyaW5nLCBwcmVmYWJEYXRhOiBhbnlbXSwgbWV0YURhdGE6IGFueSk6IFByb21pc2U8eyBzdWNjZXNzOiBib29sZWFuOyBlcnJvcj86IHN0cmluZyB9PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyDkvb/nlKhFZGl0b3IgQVBJ5L+d5a2Y6aKE5Yi25L2T5paH5Lu2XG4gICAgICAgICAgICAgICAgY29uc3QgcHJlZmFiQ29udGVudCA9IEpTT04uc3RyaW5naWZ5KHByZWZhYkRhdGEsIG51bGwsIDIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1ldGFDb250ZW50ID0gSlNPTi5zdHJpbmdpZnkobWV0YURhdGEsIG51bGwsIDIpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIOWwneivleS9v+eUqOabtOWPr+mdoOeahOS/neWtmOaWueazlVxuICAgICAgICAgICAgICAgIHRoaXMuc2F2ZUFzc2V0RmlsZShwcmVmYWJQYXRoLCBwcmVmYWJDb250ZW50KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8g5YaN5Yib5bu6bWV0YeaWh+S7tlxuICAgICAgICAgICAgICAgICAgICBjb25zdCBtZXRhUGF0aCA9IGAke3ByZWZhYlBhdGh9Lm1ldGFgO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zYXZlQXNzZXRGaWxlKG1ldGFQYXRoLCBtZXRhQ29udGVudCk7XG4gICAgICAgICAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcjogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ+S/neWtmOmihOWItuS9k+aWh+S7tuWksei0pScgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGDkv53lrZjmlofku7bml7blj5HnlJ/plJnor686ICR7ZXJyb3J9YCB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBzYXZlQXNzZXRGaWxlKGZpbGVQYXRoOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgLy8g5bCd6K+V5aSa56eN5L+d5a2Y5pa55rOVXG4gICAgICAgICAgICBjb25zdCBzYXZlTWV0aG9kcyA9IFtcbiAgICAgICAgICAgICAgICAoKSA9PiBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdjcmVhdGUtYXNzZXQnLCBmaWxlUGF0aCwgY29udGVudCksXG4gICAgICAgICAgICAgICAgKCkgPT4gRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAnc2F2ZS1hc3NldCcsIGZpbGVQYXRoLCBjb250ZW50KSxcbiAgICAgICAgICAgICAgICAoKSA9PiBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICd3cml0ZS1hc3NldCcsIGZpbGVQYXRoLCBjb250ZW50KVxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgY29uc3QgdHJ5U2F2ZSA9IChpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID49IHNhdmVNZXRob2RzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCfmiYDmnInkv53lrZjmlrnms5Xpg73lpLHotKXkuoYnKSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzYXZlTWV0aG9kc1tpbmRleF0oKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH0pLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5U2F2ZShpbmRleCArIDEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdHJ5U2F2ZSgwKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyB1cGRhdGVQcmVmYWIocHJlZmFiUGF0aDogc3RyaW5nLCBub2RlVXVpZDogc3RyaW5nKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdxdWVyeS1hc3NldC1pbmZvJywgcHJlZmFiUGF0aCkudGhlbigoYXNzZXRJbmZvOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWFzc2V0SW5mbykge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1ByZWZhYiBub3QgZm91bmQnKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAnYXBwbHktcHJlZmFiJywge1xuICAgICAgICAgICAgICAgICAgICBub2RlOiBub2RlVXVpZCxcbiAgICAgICAgICAgICAgICAgICAgcHJlZmFiOiBhc3NldEluZm8udXVpZFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdQcmVmYWIgdXBkYXRlZCBzdWNjZXNzZnVsbHknXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyOiBFcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVyci5tZXNzYWdlIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcmV2ZXJ0UHJlZmFiKG5vZGVVdWlkOiBzdHJpbmcpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3JldmVydC1wcmVmYWInLCB7XG4gICAgICAgICAgICAgICAgbm9kZTogbm9kZVV1aWRcbiAgICAgICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnUHJlZmFiIGluc3RhbmNlIHJldmVydGVkIHN1Y2Nlc3NmdWxseSdcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnI6IEVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyLm1lc3NhZ2UgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBnZXRQcmVmYWJJbmZvKHByZWZhYlBhdGg6IHN0cmluZyk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAncXVlcnktYXNzZXQtaW5mbycsIHByZWZhYlBhdGgpLnRoZW4oKGFzc2V0SW5mbzogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFhc3NldEluZm8pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQcmVmYWIgbm90IGZvdW5kJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3F1ZXJ5LWFzc2V0LW1ldGEnLCBhc3NldEluZm8udXVpZCk7XG4gICAgICAgICAgICB9KS50aGVuKChtZXRhSW5mbzogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5mbzogUHJlZmFiSW5mbyA9IHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogbWV0YUluZm8ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdXVpZDogbWV0YUluZm8udXVpZCxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogcHJlZmFiUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgZm9sZGVyOiBwcmVmYWJQYXRoLnN1YnN0cmluZygwLCBwcmVmYWJQYXRoLmxhc3RJbmRleE9mKCcvJykpLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVUaW1lOiBtZXRhSW5mby5jcmVhdGVUaW1lLFxuICAgICAgICAgICAgICAgICAgICBtb2RpZnlUaW1lOiBtZXRhSW5mby5tb2RpZnlUaW1lLFxuICAgICAgICAgICAgICAgICAgICBkZXBlbmRlbmNpZXM6IG1ldGFJbmZvLmRlcGVuZHMgfHwgW11cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBpbmZvIH0pO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycjogRXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnIubWVzc2FnZSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGNyZWF0ZVByZWZhYkZyb21Ob2RlKGFyZ3M6IGFueSk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIC8vIOS7jiBwcmVmYWJQYXRoIOaPkOWPluWQjeensFxuICAgICAgICBjb25zdCBwcmVmYWJQYXRoID0gYXJncy5wcmVmYWJQYXRoO1xuICAgICAgICBjb25zdCBwcmVmYWJOYW1lID0gcHJlZmFiUGF0aC5zcGxpdCgnLycpLnBvcCgpPy5yZXBsYWNlKCcucHJlZmFiJywgJycpIHx8ICdOZXdQcmVmYWInO1xuICAgICAgICBcbiAgICAgICAgLy8g6LCD55So5Y6f5p2l55qEIGNyZWF0ZVByZWZhYiDmlrnms5VcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuY3JlYXRlUHJlZmFiKHtcbiAgICAgICAgICAgIG5vZGVVdWlkOiBhcmdzLm5vZGVVdWlkLFxuICAgICAgICAgICAgc2F2ZVBhdGg6IHByZWZhYlBhdGgsXG4gICAgICAgICAgICBwcmVmYWJOYW1lOiBwcmVmYWJOYW1lXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgdmFsaWRhdGVQcmVmYWIocHJlZmFiUGF0aDogc3RyaW5nKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIOivu+WPlumihOWItuS9k+aWh+S7tuWGheWuuVxuICAgICAgICAgICAgICAgIEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3F1ZXJ5LWFzc2V0LWluZm8nLCBwcmVmYWJQYXRoKS50aGVuKChhc3NldEluZm86IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWFzc2V0SW5mbykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6ICfpooTliLbkvZPmlofku7bkuI3lrZjlnKgnXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIOmqjOivgemihOWItuS9k+agvOW8j1xuICAgICAgICAgICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdyZWFkLWFzc2V0JywgcHJlZmFiUGF0aCkudGhlbigoY29udGVudDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByZWZhYkRhdGEgPSBKU09OLnBhcnNlKGNvbnRlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbGlkYXRpb25SZXN1bHQgPSB0aGlzLnZhbGlkYXRlUHJlZmFiRm9ybWF0KHByZWZhYkRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1ZhbGlkOiB2YWxpZGF0aW9uUmVzdWx0LmlzVmFsaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc3N1ZXM6IHZhbGlkYXRpb25SZXN1bHQuaXNzdWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZUNvdW50OiB2YWxpZGF0aW9uUmVzdWx0Lm5vZGVDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudENvdW50OiB2YWxpZGF0aW9uUmVzdWx0LmNvbXBvbmVudENvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogdmFsaWRhdGlvblJlc3VsdC5pc1ZhbGlkID8gJ+mihOWItuS9k+agvOW8j+acieaViCcgOiAn6aKE5Yi25L2T5qC85byP5a2Y5Zyo6Zeu6aKYJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChwYXJzZUVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogJ+mihOWItuS9k+aWh+S7tuagvOW8j+mUmeivr++8jOaXoOazleino+aekEpTT04nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcjogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogYOivu+WPlumihOWItuS9k+aWh+S7tuWksei0pTogJHtlcnJvci5tZXNzYWdlfWBcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3I6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGDmn6Xor6LpooTliLbkvZPkv6Hmga/lpLHotKU6ICR7ZXJyb3IubWVzc2FnZX1gXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBg6aqM6K+B6aKE5Yi25L2T5pe25Y+R55Sf6ZSZ6K+vOiAke2Vycm9yfWBcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2YWxpZGF0ZVByZWZhYkZvcm1hdChwcmVmYWJEYXRhOiBhbnkpOiB7IGlzVmFsaWQ6IGJvb2xlYW47IGlzc3Vlczogc3RyaW5nW107IG5vZGVDb3VudDogbnVtYmVyOyBjb21wb25lbnRDb3VudDogbnVtYmVyIH0ge1xuICAgICAgICBjb25zdCBpc3N1ZXM6IHN0cmluZ1tdID0gW107XG4gICAgICAgIGxldCBub2RlQ291bnQgPSAwO1xuICAgICAgICBsZXQgY29tcG9uZW50Q291bnQgPSAwO1xuXG4gICAgICAgIC8vIOajgOafpeWfuuacrOe7k+aehFxuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocHJlZmFiRGF0YSkpIHtcbiAgICAgICAgICAgIGlzc3Vlcy5wdXNoKCfpooTliLbkvZPmlbDmja7lv4XpobvmmK/mlbDnu4TmoLzlvI8nKTtcbiAgICAgICAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBpc3N1ZXMsIG5vZGVDb3VudCwgY29tcG9uZW50Q291bnQgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcmVmYWJEYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgaXNzdWVzLnB1c2goJ+mihOWItuS9k+aVsOaNruS4uuepuicpO1xuICAgICAgICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGlzc3Vlcywgbm9kZUNvdW50LCBjb21wb25lbnRDb3VudCB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5qOA5p+l56ys5LiA5Liq5YWD57Sg5piv5ZCm5Li66aKE5Yi25L2T6LWE5LqnXG4gICAgICAgIGNvbnN0IGZpcnN0RWxlbWVudCA9IHByZWZhYkRhdGFbMF07XG4gICAgICAgIGlmICghZmlyc3RFbGVtZW50IHx8IGZpcnN0RWxlbWVudC5fX3R5cGVfXyAhPT0gJ2NjLlByZWZhYicpIHtcbiAgICAgICAgICAgIGlzc3Vlcy5wdXNoKCfnrKzkuIDkuKrlhYPntKDlv4XpobvmmK9jYy5QcmVmYWLnsbvlnosnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOe7n+iuoeiKgueCueWSjOe7hOS7tlxuICAgICAgICBwcmVmYWJEYXRhLmZvckVhY2goKGl0ZW06IGFueSwgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgaWYgKGl0ZW0uX190eXBlX18gPT09ICdjYy5Ob2RlJykge1xuICAgICAgICAgICAgICAgIG5vZGVDb3VudCsrO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpdGVtLl9fdHlwZV9fICYmIGl0ZW0uX190eXBlX18uaW5jbHVkZXMoJ2NjLicpKSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50Q291bnQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8g5qOA5p+l5b+F6KaB55qE5a2X5q61XG4gICAgICAgIGlmIChub2RlQ291bnQgPT09IDApIHtcbiAgICAgICAgICAgIGlzc3Vlcy5wdXNoKCfpooTliLbkvZPlv4XpobvljIXlkKvoh7PlsJHkuIDkuKroioLngrknKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpc1ZhbGlkOiBpc3N1ZXMubGVuZ3RoID09PSAwLFxuICAgICAgICAgICAgaXNzdWVzLFxuICAgICAgICAgICAgbm9kZUNvdW50LFxuICAgICAgICAgICAgY29tcG9uZW50Q291bnRcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGR1cGxpY2F0ZVByZWZhYihhcmdzOiBhbnkpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgeyBzb3VyY2VQcmVmYWJQYXRoLCB0YXJnZXRQcmVmYWJQYXRoLCBuZXdQcmVmYWJOYW1lIH0gPSBhcmdzO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIOivu+WPlua6kOmihOWItuS9k1xuICAgICAgICAgICAgICAgIGNvbnN0IHNvdXJjZUluZm8gPSBhd2FpdCB0aGlzLmdldFByZWZhYkluZm8oc291cmNlUHJlZmFiUGF0aCk7XG4gICAgICAgICAgICAgICAgaWYgKCFzb3VyY2VJbmZvLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBg5peg5rOV6K+75Y+W5rqQ6aKE5Yi25L2TOiAke3NvdXJjZUluZm8uZXJyb3J9YFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIOivu+WPlua6kOmihOWItuS9k+WGheWuuVxuICAgICAgICAgICAgICAgIGNvbnN0IHNvdXJjZUNvbnRlbnQgPSBhd2FpdCB0aGlzLnJlYWRQcmVmYWJDb250ZW50KHNvdXJjZVByZWZhYlBhdGgpO1xuICAgICAgICAgICAgICAgIGlmICghc291cmNlQ29udGVudC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogYOaXoOazleivu+WPlua6kOmihOWItuS9k+WGheWuuTogJHtzb3VyY2VDb250ZW50LmVycm9yfWBcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyDnlJ/miJDmlrDnmoRVVUlEXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3VXVpZCA9IHRoaXMuZ2VuZXJhdGVVVUlEKCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g5L+u5pS56aKE5Yi25L2T5pWw5o2uXG4gICAgICAgICAgICAgICAgY29uc3QgbW9kaWZpZWREYXRhID0gdGhpcy5tb2RpZnlQcmVmYWJGb3JEdXBsaWNhdGlvbihzb3VyY2VDb250ZW50LmRhdGEsIG5ld1ByZWZhYk5hbWUsIG5ld1V1aWQpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIOWIm+W7uuaWsOeahG1ldGHmlbDmja5cbiAgICAgICAgICAgICAgICBjb25zdCBuZXdNZXRhRGF0YSA9IHRoaXMuY3JlYXRlTWV0YURhdGEobmV3UHJlZmFiTmFtZSB8fCAnRHVwbGljYXRlZFByZWZhYicsIG5ld1V1aWQpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIOmihOWItuS9k+WkjeWItuWKn+iDveaaguaXtuemgeeUqO+8jOWboOS4uua2ieWPiuWkjeadgueahOW6j+WIl+WMluagvOW8j1xuICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6ICfpooTliLbkvZPlpI3liLblip/og73mmoLml7bkuI3lj6/nlKgnLFxuICAgICAgICAgICAgICAgICAgICBpbnN0cnVjdGlvbjogJ+ivt+WcqCBDb2NvcyBDcmVhdG9yIOe8lui+keWZqOS4reaJi+WKqOWkjeWItumihOWItuS9k++8mlxcbjEuIOWcqOi1hOa6kOeuoeeQhuWZqOS4remAieaLqeimgeWkjeWItueahOmihOWItuS9k1xcbjIuIOWPs+mUrumAieaLqeWkjeWItlxcbjMuIOWcqOebruagh+S9jee9rueymOi0tCdcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBg5aSN5Yi26aKE5Yi25L2T5pe25Y+R55Sf6ZSZ6K+vOiAke2Vycm9yfWBcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyByZWFkUHJlZmFiQ29udGVudChwcmVmYWJQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHsgc3VjY2VzczogYm9vbGVhbjsgZGF0YT86IGFueTsgZXJyb3I/OiBzdHJpbmcgfT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3JlYWQtYXNzZXQnLCBwcmVmYWJQYXRoKS50aGVuKChjb250ZW50OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcmVmYWJEYXRhID0gSlNPTi5wYXJzZShjb250ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHByZWZhYkRhdGEgfSk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAocGFyc2VFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAn6aKE5Yi25L2T5paH5Lu25qC85byP6ZSZ6K+vJyB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3I6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ+ivu+WPlumihOWItuS9k+aWh+S7tuWksei0pScgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBtb2RpZnlQcmVmYWJGb3JEdXBsaWNhdGlvbihwcmVmYWJEYXRhOiBhbnlbXSwgbmV3TmFtZTogc3RyaW5nLCBuZXdVdWlkOiBzdHJpbmcpOiBhbnlbXSB7XG4gICAgICAgIC8vIOS/ruaUuemihOWItuS9k+aVsOaNruS7peWIm+W7uuWJr+acrFxuICAgICAgICBjb25zdCBtb2RpZmllZERhdGEgPSBbLi4ucHJlZmFiRGF0YV07XG4gICAgICAgIFxuICAgICAgICAvLyDkv67mlLnnrKzkuIDkuKrlhYPntKDvvIjpooTliLbkvZPotYTkuqfvvIlcbiAgICAgICAgaWYgKG1vZGlmaWVkRGF0YVswXSAmJiBtb2RpZmllZERhdGFbMF0uX190eXBlX18gPT09ICdjYy5QcmVmYWInKSB7XG4gICAgICAgICAgICBtb2RpZmllZERhdGFbMF0uX25hbWUgPSBuZXdOYW1lIHx8ICdEdXBsaWNhdGVkUHJlZmFiJztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOabtOaWsOaJgOaciVVVSUTlvJXnlKjvvIjnroDljJbniYjmnKzvvIlcbiAgICAgICAgLy8g5Zyo5a6e6ZmF5bqU55So5Lit77yM5Y+v6IO96ZyA6KaB5pu05aSN5p2C55qEVVVJROaYoOWwhOWkhOeQhlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIG1vZGlmaWVkRGF0YTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDkvb/nlKggYXNzZXQtZGIgQVBJIOWIm+W7uui1hOa6kOaWh+S7tlxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgY3JlYXRlQXNzZXRXaXRoQXNzZXREQihhc3NldFBhdGg6IHN0cmluZywgY29udGVudDogc3RyaW5nKTogUHJvbWlzZTx7IHN1Y2Nlc3M6IGJvb2xlYW47IGRhdGE/OiBhbnk7IGVycm9yPzogc3RyaW5nIH0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdhc3NldC1kYicsICdjcmVhdGUtYXNzZXQnLCBhc3NldFBhdGgsIGNvbnRlbnQsIHtcbiAgICAgICAgICAgICAgICBvdmVyd3JpdGU6IHRydWUsXG4gICAgICAgICAgICAgICAgcmVuYW1lOiBmYWxzZVxuICAgICAgICAgICAgfSkudGhlbigoYXNzZXRJbmZvOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5Yib5bu66LWE5rqQ5paH5Lu25oiQ5YqfOicsIGFzc2V0SW5mbyk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IGFzc2V0SW5mbyB9KTtcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcjogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcign5Yib5bu66LWE5rqQ5paH5Lu25aSx6LSlOicsIGVycm9yKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIHx8ICfliJvlu7rotYTmupDmlofku7blpLHotKUnIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOS9v+eUqCBhc3NldC1kYiBBUEkg5Yib5bu6IG1ldGEg5paH5Lu2XG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBjcmVhdGVNZXRhV2l0aEFzc2V0REIoYXNzZXRQYXRoOiBzdHJpbmcsIG1ldGFDb250ZW50OiBhbnkpOiBQcm9taXNlPHsgc3VjY2VzczogYm9vbGVhbjsgZGF0YT86IGFueTsgZXJyb3I/OiBzdHJpbmcgfT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG1ldGFDb250ZW50U3RyaW5nID0gSlNPTi5zdHJpbmdpZnkobWV0YUNvbnRlbnQsIG51bGwsIDIpO1xuICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAnc2F2ZS1hc3NldC1tZXRhJywgYXNzZXRQYXRoLCBtZXRhQ29udGVudFN0cmluZykudGhlbigoYXNzZXRJbmZvOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5Yib5bu6bWV0YeaWh+S7tuaIkOWKnzonLCBhc3NldEluZm8pO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBhc3NldEluZm8gfSk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3I6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+WIm+W7um1ldGHmlofku7blpLHotKU6JywgZXJyb3IpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ+WIm+W7um1ldGHmlofku7blpLHotKUnIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOS9v+eUqCBhc3NldC1kYiBBUEkg6YeN5paw5a+85YWl6LWE5rqQXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyByZWltcG9ydEFzc2V0V2l0aEFzc2V0REIoYXNzZXRQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHsgc3VjY2VzczogYm9vbGVhbjsgZGF0YT86IGFueTsgZXJyb3I/OiBzdHJpbmcgfT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ3JlaW1wb3J0LWFzc2V0JywgYXNzZXRQYXRoKS50aGVuKChyZXN1bHQ6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCfph43mlrDlr7zlhaXotYTmupDmiJDlip86JywgcmVzdWx0KTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcmVzdWx0IH0pO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCfph43mlrDlr7zlhaXotYTmupDlpLHotKU6JywgZXJyb3IpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ+mHjeaWsOWvvOWFpei1hOa6kOWksei0pScgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5L2/55SoIGFzc2V0LWRiIEFQSSDmm7TmlrDotYTmupDmlofku7blhoXlrrlcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIHVwZGF0ZUFzc2V0V2l0aEFzc2V0REIoYXNzZXRQYXRoOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZyk6IFByb21pc2U8eyBzdWNjZXNzOiBib29sZWFuOyBkYXRhPzogYW55OyBlcnJvcj86IHN0cmluZyB9PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAnc2F2ZS1hc3NldCcsIGFzc2V0UGF0aCwgY29udGVudCkudGhlbigocmVzdWx0OiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn5pu05paw6LWE5rqQ5paH5Lu25oiQ5YqfOicsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHJlc3VsdCB9KTtcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcjogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcign5pu05paw6LWE5rqQ5paH5Lu25aSx6LSlOicsIGVycm9yKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIHx8ICfmm7TmlrDotYTmupDmlofku7blpLHotKUnIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWIm+W7uuespuWQiCBDb2NvcyBDcmVhdG9yIOagh+WHhueahOmihOWItuS9k+WGheWuuVxuICAgICAqIOWujOaVtOWunueOsOmAkuW9kuiKgueCueagkeWkhOeQhu+8jOWMuemFjeW8leaTjuagh+WHhuagvOW8j1xuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgY3JlYXRlU3RhbmRhcmRQcmVmYWJDb250ZW50KG5vZGVEYXRhOiBhbnksIHByZWZhYk5hbWU6IHN0cmluZywgcHJlZmFiVXVpZDogc3RyaW5nLCBpbmNsdWRlQ2hpbGRyZW46IGJvb2xlYW4sIGluY2x1ZGVDb21wb25lbnRzOiBib29sZWFuKTogUHJvbWlzZTxhbnlbXT4ge1xuICAgICAgICBjb25zb2xlLmxvZygn5byA5aeL5Yib5bu65byV5pOO5qCH5YeG6aKE5Yi25L2T5YaF5a65Li4uJyk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBwcmVmYWJEYXRhOiBhbnlbXSA9IFtdO1xuICAgICAgICBsZXQgY3VycmVudElkID0gMDtcblxuICAgICAgICAvLyAxLiDliJvlu7rpooTliLbkvZPotYTkuqflr7nosaEgKGluZGV4IDApXG4gICAgICAgIGNvbnN0IHByZWZhYkFzc2V0ID0ge1xuICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlByZWZhYlwiLFxuICAgICAgICAgICAgXCJfbmFtZVwiOiBwcmVmYWJOYW1lIHx8IFwiXCIsIC8vIOehruS/nemihOWItuS9k+WQjeensOS4jeS4uuepulxuICAgICAgICAgICAgXCJfb2JqRmxhZ3NcIjogMCxcbiAgICAgICAgICAgIFwiX19lZGl0b3JFeHRyYXNfX1wiOiB7fSxcbiAgICAgICAgICAgIFwiX25hdGl2ZVwiOiBcIlwiLFxuICAgICAgICAgICAgXCJkYXRhXCI6IHtcbiAgICAgICAgICAgICAgICBcIl9faWRfX1wiOiAxXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJvcHRpbWl6YXRpb25Qb2xpY3lcIjogMCxcbiAgICAgICAgICAgIFwicGVyc2lzdGVudFwiOiBmYWxzZVxuICAgICAgICB9O1xuICAgICAgICBwcmVmYWJEYXRhLnB1c2gocHJlZmFiQXNzZXQpO1xuICAgICAgICBjdXJyZW50SWQrKztcblxuICAgICAgICAvLyAyLiDpgJLlvZLliJvlu7rlrozmlbTnmoToioLngrnmoJHnu5PmnoRcbiAgICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgICAgIHByZWZhYkRhdGEsXG4gICAgICAgICAgICBjdXJyZW50SWQ6IGN1cnJlbnRJZCArIDEsIC8vIOagueiKgueCueWNoOeUqOe0ouW8lTHvvIzlrZDoioLngrnku47ntKLlvJUy5byA5aeLXG4gICAgICAgICAgICBwcmVmYWJBc3NldEluZGV4OiAwLFxuICAgICAgICAgICAgbm9kZUZpbGVJZHM6IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCksIC8vIOWtmOWCqOiKgueCuUlE5YiwZmlsZUlk55qE5pig5bCEXG4gICAgICAgICAgICBub2RlVXVpZFRvSW5kZXg6IG5ldyBNYXA8c3RyaW5nLCBudW1iZXI+KCksIC8vIOWtmOWCqOiKgueCuVVVSUTliLDntKLlvJXnmoTmmKDlsIRcbiAgICAgICAgICAgIGNvbXBvbmVudFV1aWRUb0luZGV4OiBuZXcgTWFwPHN0cmluZywgbnVtYmVyPigpIC8vIOWtmOWCqOe7hOS7tlVVSUTliLDntKLlvJXnmoTmmKDlsIRcbiAgICAgICAgfTtcblxuICAgICAgICAvLyDliJvlu7rmoLnoioLngrnlkozmlbTkuKroioLngrnmoJEgLSDms6jmhI/vvJrmoLnoioLngrnnmoTniLboioLngrnlupTor6XmmK9udWxs77yM5LiN5piv6aKE5Yi25L2T5a+56LGhXG4gICAgICAgIGF3YWl0IHRoaXMuY3JlYXRlQ29tcGxldGVOb2RlVHJlZShub2RlRGF0YSwgbnVsbCwgMSwgY29udGV4dCwgaW5jbHVkZUNoaWxkcmVuLCBpbmNsdWRlQ29tcG9uZW50cywgcHJlZmFiTmFtZSk7XG5cbiAgICAgICAgY29uc29sZS5sb2coYOmihOWItuS9k+WGheWuueWIm+W7uuWujOaIkO+8jOaAu+WFsSAke3ByZWZhYkRhdGEubGVuZ3RofSDkuKrlr7nosaFgKTtcbiAgICAgICAgY29uc29sZS5sb2coJ+iKgueCuWZpbGVJZOaYoOWwhDonLCBBcnJheS5mcm9tKGNvbnRleHQubm9kZUZpbGVJZHMuZW50cmllcygpKSk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gcHJlZmFiRGF0YTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDpgJLlvZLliJvlu7rlrozmlbTnmoToioLngrnmoJHvvIzljIXmi6zmiYDmnInlrZDoioLngrnlkozlr7nlupTnmoRQcmVmYWJJbmZvXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBjcmVhdGVDb21wbGV0ZU5vZGVUcmVlKFxuICAgICAgICBub2RlRGF0YTogYW55LCBcbiAgICAgICAgcGFyZW50Tm9kZUluZGV4OiBudW1iZXIgfCBudWxsLCBcbiAgICAgICAgbm9kZUluZGV4OiBudW1iZXIsXG4gICAgICAgIGNvbnRleHQ6IHsgXG4gICAgICAgICAgICBwcmVmYWJEYXRhOiBhbnlbXSwgXG4gICAgICAgICAgICBjdXJyZW50SWQ6IG51bWJlciwgXG4gICAgICAgICAgICBwcmVmYWJBc3NldEluZGV4OiBudW1iZXIsIFxuICAgICAgICAgICAgbm9kZUZpbGVJZHM6IE1hcDxzdHJpbmcsIHN0cmluZz4sXG4gICAgICAgICAgICBub2RlVXVpZFRvSW5kZXg6IE1hcDxzdHJpbmcsIG51bWJlcj4sXG4gICAgICAgICAgICBjb21wb25lbnRVdWlkVG9JbmRleDogTWFwPHN0cmluZywgbnVtYmVyPlxuICAgICAgICB9LFxuICAgICAgICBpbmNsdWRlQ2hpbGRyZW46IGJvb2xlYW4sXG4gICAgICAgIGluY2x1ZGVDb21wb25lbnRzOiBib29sZWFuLFxuICAgICAgICBub2RlTmFtZT86IHN0cmluZ1xuICAgICk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCB7IHByZWZhYkRhdGEgfSA9IGNvbnRleHQ7XG4gICAgICAgIFxuICAgICAgICAvLyDliJvlu7roioLngrnlr7nosaFcbiAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuY3JlYXRlRW5naW5lU3RhbmRhcmROb2RlKG5vZGVEYXRhLCBwYXJlbnROb2RlSW5kZXgsIG5vZGVOYW1lKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOehruS/neiKgueCueWcqOaMh+WumueahOe0ouW8leS9jee9rlxuICAgICAgICB3aGlsZSAocHJlZmFiRGF0YS5sZW5ndGggPD0gbm9kZUluZGV4KSB7XG4gICAgICAgICAgICBwcmVmYWJEYXRhLnB1c2gobnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYOiuvue9ruiKgueCueWIsOe0ouW8lSAke25vZGVJbmRleH06ICR7bm9kZS5fbmFtZX0sIF9wYXJlbnQ6YCwgbm9kZS5fcGFyZW50LCBgX2NoaWxkcmVuIGNvdW50OiAke25vZGUuX2NoaWxkcmVuLmxlbmd0aH1gKTtcbiAgICAgICAgcHJlZmFiRGF0YVtub2RlSW5kZXhdID0gbm9kZTtcbiAgICAgICAgXG4gICAgICAgIC8vIOS4uuW9k+WJjeiKgueCueeUn+aIkGZpbGVJZOW5tuiusOW9lVVVSUTliLDntKLlvJXnmoTmmKDlsIRcbiAgICAgICAgY29uc3Qgbm9kZVV1aWQgPSB0aGlzLmV4dHJhY3ROb2RlVXVpZChub2RlRGF0YSk7XG4gICAgICAgIGNvbnN0IGZpbGVJZCA9IG5vZGVVdWlkIHx8IHRoaXMuZ2VuZXJhdGVGaWxlSWQoKTtcbiAgICAgICAgY29udGV4dC5ub2RlRmlsZUlkcy5zZXQobm9kZUluZGV4LnRvU3RyaW5nKCksIGZpbGVJZCk7XG4gICAgICAgIFxuICAgICAgICAvLyDorrDlvZXoioLngrlVVUlE5Yiw57Si5byV55qE5pig5bCEXG4gICAgICAgIGlmIChub2RlVXVpZCkge1xuICAgICAgICAgICAgY29udGV4dC5ub2RlVXVpZFRvSW5kZXguc2V0KG5vZGVVdWlkLCBub2RlSW5kZXgpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOiusOW9leiKgueCuVVVSUTmmKDlsIQ6ICR7bm9kZVV1aWR9IC0+ICR7bm9kZUluZGV4fWApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5YWI5aSE55CG5a2Q6IqC54K577yI5L+d5oyB5LiO5omL5Yqo5Yib5bu655qE57Si5byV6aG65bqP5LiA6Ie077yJXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuVG9Qcm9jZXNzID0gdGhpcy5nZXRDaGlsZHJlblRvUHJvY2Vzcyhub2RlRGF0YSk7XG4gICAgICAgIGlmIChpbmNsdWRlQ2hpbGRyZW4gJiYgY2hpbGRyZW5Ub1Byb2Nlc3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOWkhOeQhuiKgueCuSAke25vZGUuX25hbWV9IOeahCAke2NoaWxkcmVuVG9Qcm9jZXNzLmxlbmd0aH0g5Liq5a2Q6IqC54K5YCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOS4uuavj+S4quWtkOiKgueCueWIhumFjee0ouW8lVxuICAgICAgICAgICAgY29uc3QgY2hpbGRJbmRpY2VzOiBudW1iZXJbXSA9IFtdO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOWHhuWkh+S4uiAke2NoaWxkcmVuVG9Qcm9jZXNzLmxlbmd0aH0g5Liq5a2Q6IqC54K55YiG6YWN57Si5byV77yM5b2T5YmNSUQ6ICR7Y29udGV4dC5jdXJyZW50SWR9YCk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuVG9Qcm9jZXNzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYOWkhOeQhuesrCAke2krMX0g5Liq5a2Q6IqC54K577yM5b2T5YmNY3VycmVudElkOiAke2NvbnRleHQuY3VycmVudElkfWApO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkSW5kZXggPSBjb250ZXh0LmN1cnJlbnRJZCsrO1xuICAgICAgICAgICAgICAgIGNoaWxkSW5kaWNlcy5wdXNoKGNoaWxkSW5kZXgpO1xuICAgICAgICAgICAgICAgIG5vZGUuX2NoaWxkcmVuLnB1c2goeyBcIl9faWRfX1wiOiBjaGlsZEluZGV4IH0pO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDinIUg5re75Yqg5a2Q6IqC54K55byV55So5YiwICR7bm9kZS5fbmFtZX06IHtfX2lkX186ICR7Y2hpbGRJbmRleH19YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg4pyFIOiKgueCuSAke25vZGUuX25hbWV9IOacgOe7iOeahOWtkOiKgueCueaVsOe7hDpgLCBub2RlLl9jaGlsZHJlbik7XG5cbiAgICAgICAgICAgIC8vIOmAkuW9kuWIm+W7uuWtkOiKgueCuVxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlblRvUHJvY2Vzcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkRGF0YSA9IGNoaWxkcmVuVG9Qcm9jZXNzW2ldO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkSW5kZXggPSBjaGlsZEluZGljZXNbaV07XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5jcmVhdGVDb21wbGV0ZU5vZGVUcmVlKFxuICAgICAgICAgICAgICAgICAgICBjaGlsZERhdGEsIFxuICAgICAgICAgICAgICAgICAgICBub2RlSW5kZXgsIFxuICAgICAgICAgICAgICAgICAgICBjaGlsZEluZGV4LCBcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVkZUNoaWxkcmVuLFxuICAgICAgICAgICAgICAgICAgICBpbmNsdWRlQ29tcG9uZW50cyxcbiAgICAgICAgICAgICAgICAgICAgY2hpbGREYXRhLm5hbWUgfHwgYENoaWxkJHtpKzF9YFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyDnhLblkI7lpITnkIbnu4Tku7ZcbiAgICAgICAgaWYgKGluY2x1ZGVDb21wb25lbnRzICYmIG5vZGVEYXRhLmNvbXBvbmVudHMgJiYgQXJyYXkuaXNBcnJheShub2RlRGF0YS5jb21wb25lbnRzKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOWkhOeQhuiKgueCuSAke25vZGUuX25hbWV9IOeahCAke25vZGVEYXRhLmNvbXBvbmVudHMubGVuZ3RofSDkuKrnu4Tku7ZgKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc3QgY29tcG9uZW50SW5kaWNlczogbnVtYmVyW10gPSBbXTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgY29tcG9uZW50IG9mIG5vZGVEYXRhLmNvbXBvbmVudHMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wb25lbnRJbmRleCA9IGNvbnRleHQuY3VycmVudElkKys7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50SW5kaWNlcy5wdXNoKGNvbXBvbmVudEluZGV4KTtcbiAgICAgICAgICAgICAgICBub2RlLl9jb21wb25lbnRzLnB1c2goeyBcIl9faWRfX1wiOiBjb21wb25lbnRJbmRleCB9KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDorrDlvZXnu4Tku7ZVVUlE5Yiw57Si5byV55qE5pig5bCEXG4gICAgICAgICAgICAgICAgY29uc3QgY29tcG9uZW50VXVpZCA9IGNvbXBvbmVudC51dWlkIHx8IChjb21wb25lbnQudmFsdWUgJiYgY29tcG9uZW50LnZhbHVlLnV1aWQpO1xuICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnRVdWlkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuY29tcG9uZW50VXVpZFRvSW5kZXguc2V0KGNvbXBvbmVudFV1aWQsIGNvbXBvbmVudEluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYOiusOW9lee7hOS7tlVVSUTmmKDlsIQ6ICR7Y29tcG9uZW50VXVpZH0gLT4gJHtjb21wb25lbnRJbmRleH1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g5Yib5bu657uE5Lu25a+56LGh77yM5Lyg5YWlY29udGV4dOS7peWkhOeQhuW8leeUqFxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudE9iaiA9IHRoaXMuY3JlYXRlQ29tcG9uZW50T2JqZWN0KGNvbXBvbmVudCwgbm9kZUluZGV4LCBjb250ZXh0KTtcbiAgICAgICAgICAgICAgICBwcmVmYWJEYXRhW2NvbXBvbmVudEluZGV4XSA9IGNvbXBvbmVudE9iajtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDkuLrnu4Tku7bliJvlu7ogQ29tcFByZWZhYkluZm9cbiAgICAgICAgICAgICAgICBjb25zdCBjb21wUHJlZmFiSW5mb0luZGV4ID0gY29udGV4dC5jdXJyZW50SWQrKztcbiAgICAgICAgICAgICAgICBwcmVmYWJEYXRhW2NvbXBQcmVmYWJJbmZvSW5kZXhdID0ge1xuICAgICAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuQ29tcFByZWZhYkluZm9cIixcbiAgICAgICAgICAgICAgICAgICAgXCJmaWxlSWRcIjogdGhpcy5nZW5lcmF0ZUZpbGVJZCgpXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDlpoLmnpznu4Tku7blr7nosaHmnIkgX19wcmVmYWIg5bGe5oCn77yM6K6+572u5byV55SoXG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudE9iaiAmJiB0eXBlb2YgY29tcG9uZW50T2JqID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRPYmouX19wcmVmYWIgPSB7IFwiX19pZF9fXCI6IGNvbXBQcmVmYWJJbmZvSW5kZXggfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDinIUg6IqC54K5ICR7bm9kZS5fbmFtZX0g5re75Yqg5LqGICR7Y29tcG9uZW50SW5kaWNlcy5sZW5ndGh9IOS4que7hOS7tmApO1xuICAgICAgICB9XG5cblxuICAgICAgICAvLyDkuLrlvZPliY3oioLngrnliJvlu7pQcmVmYWJJbmZvXG4gICAgICAgIGNvbnN0IHByZWZhYkluZm9JbmRleCA9IGNvbnRleHQuY3VycmVudElkKys7XG4gICAgICAgIG5vZGUuX3ByZWZhYiA9IHsgXCJfX2lkX19cIjogcHJlZmFiSW5mb0luZGV4IH07XG4gICAgICAgIFxuICAgICAgICBjb25zdCBwcmVmYWJJbmZvOiBhbnkgPSB7XG4gICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuUHJlZmFiSW5mb1wiLFxuICAgICAgICAgICAgXCJyb290XCI6IHsgXCJfX2lkX19cIjogMSB9LFxuICAgICAgICAgICAgXCJhc3NldFwiOiB7IFwiX19pZF9fXCI6IGNvbnRleHQucHJlZmFiQXNzZXRJbmRleCB9LFxuICAgICAgICAgICAgXCJmaWxlSWRcIjogZmlsZUlkLFxuICAgICAgICAgICAgXCJ0YXJnZXRPdmVycmlkZXNcIjogbnVsbCxcbiAgICAgICAgICAgIFwibmVzdGVkUHJlZmFiSW5zdGFuY2VSb290c1wiOiBudWxsXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvLyDmoLnoioLngrnnmoTnibnmrorlpITnkIZcbiAgICAgICAgaWYgKG5vZGVJbmRleCA9PT0gMSkge1xuICAgICAgICAgICAgLy8g5qC56IqC54K55rKh5pyJaW5zdGFuY2XvvIzkvYblj6/og73mnIl0YXJnZXRPdmVycmlkZXNcbiAgICAgICAgICAgIHByZWZhYkluZm8uaW5zdGFuY2UgPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8g5a2Q6IqC54K56YCa5bi45pyJaW5zdGFuY2XkuLpudWxsXG4gICAgICAgICAgICBwcmVmYWJJbmZvLmluc3RhbmNlID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHJlZmFiRGF0YVtwcmVmYWJJbmZvSW5kZXhdID0gcHJlZmFiSW5mbztcbiAgICAgICAgY29udGV4dC5jdXJyZW50SWQgPSBwcmVmYWJJbmZvSW5kZXggKyAxO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWwhlVVSUTovazmjaLkuLpDb2NvcyBDcmVhdG9y55qE5Y6L57yp5qC85byPXG4gICAgICog5Z+65LqO55yf5a6eQ29jb3MgQ3JlYXRvcue8lui+keWZqOeahOWOi+e8qeeul+azleWunueOsFxuICAgICAqIOWJjTXkuKpoZXjlrZfnrKbkv53mjIHkuI3lj5jvvIzliankvZkyN+S4quWtl+espuWOi+e8qeaIkDE45Liq5a2X56ymXG4gICAgICovXG4gICAgcHJpdmF0ZSB1dWlkVG9Db21wcmVzc2VkSWQodXVpZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgQkFTRTY0X0tFWVMgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz0nO1xuICAgICAgICBcbiAgICAgICAgLy8g56e76Zmk6L+e5a2X56ym5bm26L2s5Li65bCP5YaZXG4gICAgICAgIGNvbnN0IGNsZWFuVXVpZCA9IHV1aWQucmVwbGFjZSgvLS9nLCAnJykudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOehruS/nVVVSUTmnInmlYhcbiAgICAgICAgaWYgKGNsZWFuVXVpZC5sZW5ndGggIT09IDMyKSB7XG4gICAgICAgICAgICByZXR1cm4gdXVpZDsgLy8g5aaC5p6c5LiN5piv5pyJ5pWI55qEVVVJRO+8jOi/lOWbnuWOn+Wni+WAvFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBDb2NvcyBDcmVhdG9y55qE5Y6L57yp566X5rOV77ya5YmNNeS4quWtl+espuS/neaMgeS4jeWPmO+8jOWJqeS9mTI35Liq5a2X56ym5Y6L57yp5oiQMTjkuKrlrZfnrKZcbiAgICAgICAgbGV0IHJlc3VsdCA9IGNsZWFuVXVpZC5zdWJzdHJpbmcoMCwgNSk7XG4gICAgICAgIFxuICAgICAgICAvLyDliankvZkyN+S4quWtl+espumcgOimgeWOi+e8qeaIkDE45Liq5a2X56ymXG4gICAgICAgIGNvbnN0IHJlbWFpbmRlciA9IGNsZWFuVXVpZC5zdWJzdHJpbmcoNSk7XG4gICAgICAgIFxuICAgICAgICAvLyDmr48z5LiqaGV45a2X56ym5Y6L57yp5oiQMuS4quWtl+esplxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlbWFpbmRlci5sZW5ndGg7IGkgKz0gMykge1xuICAgICAgICAgICAgY29uc3QgaGV4MSA9IHJlbWFpbmRlcltpXSB8fCAnMCc7XG4gICAgICAgICAgICBjb25zdCBoZXgyID0gcmVtYWluZGVyW2kgKyAxXSB8fCAnMCc7XG4gICAgICAgICAgICBjb25zdCBoZXgzID0gcmVtYWluZGVyW2kgKyAyXSB8fCAnMCc7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOWwhjPkuKpoZXjlrZfnrKYoMTLkvY0p6L2s5o2i5Li6MuS4qmJhc2U2NOWtl+esplxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBwYXJzZUludChoZXgxICsgaGV4MiArIGhleDMsIDE2KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gMTLkvY3liIbmiJDkuKTkuKo25L2NXG4gICAgICAgICAgICBjb25zdCBoaWdoNiA9ICh2YWx1ZSA+PiA2KSAmIDYzO1xuICAgICAgICAgICAgY29uc3QgbG93NiA9IHZhbHVlICYgNjM7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJlc3VsdCArPSBCQVNFNjRfS0VZU1toaWdoNl0gKyBCQVNFNjRfS0VZU1tsb3c2XTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDliJvlu7rnu4Tku7blr7nosaFcbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZUNvbXBvbmVudE9iamVjdChjb21wb25lbnREYXRhOiBhbnksIG5vZGVJbmRleDogbnVtYmVyLCBjb250ZXh0PzogeyBcbiAgICAgICAgbm9kZVV1aWRUb0luZGV4PzogTWFwPHN0cmluZywgbnVtYmVyPixcbiAgICAgICAgY29tcG9uZW50VXVpZFRvSW5kZXg/OiBNYXA8c3RyaW5nLCBudW1iZXI+XG4gICAgfSk6IGFueSB7XG4gICAgICAgIGxldCBjb21wb25lbnRUeXBlID0gY29tcG9uZW50RGF0YS50eXBlIHx8IGNvbXBvbmVudERhdGEuX190eXBlX18gfHwgJ2NjLkNvbXBvbmVudCc7XG4gICAgICAgIGNvbnN0IGVuYWJsZWQgPSBjb21wb25lbnREYXRhLmVuYWJsZWQgIT09IHVuZGVmaW5lZCA/IGNvbXBvbmVudERhdGEuZW5hYmxlZCA6IHRydWU7XG5cbiAgICAgICAgLy8g5L+u5aSN5YWc5bqVOuiEmuacrOe7hOS7tuiLpeaLv+WIsOeahOaYr+aYjuaWh+exu+WQjSjpnZ4gNWhleCsxOGJhc2U2NCDnmoTljovnvKlVVUlE5qC85byPKSxwcmVmYWIg5a+85YWl5pe25Lya5Y+N5bqP5YiX5YyW5oiQIG51bGwg57uE5Lu244CCXG4gICAgICAgIC8vIOWwneivleS7jue7hOS7tuaVsOaNrumHjOeahOiEmuacrOi1hOS6pyB1dWlkKF9fc2NyaXB0QXNzZXQp5o6o5a+85Y6L57ypVVVJRDvmjqjkuI3lh7rliJnlkYroraYo5Lqn54mp6ISa5pys57uE5Lu25bCG5aSx5pWIKeOAglxuICAgICAgICBpZiAoY29tcG9uZW50VHlwZSAmJiAhY29tcG9uZW50VHlwZS5zdGFydHNXaXRoKCdjYy4nKSAmJiAhL15bMC05YS1mXXs1fVswLTlBLVphLXorL117MTh9JC8udGVzdChjb21wb25lbnRUeXBlKSkge1xuICAgICAgICAgICAgY29uc3Qgc2NyaXB0VXVpZCA9IGNvbXBvbmVudERhdGEucHJvcGVydGllcz8uX19zY3JpcHRBc3NldD8udmFsdWU/LnV1aWRcbiAgICAgICAgICAgICAgICB8fCBjb21wb25lbnREYXRhLl9fc2NyaXB0QXNzZXQ/LnZhbHVlPy51dWlkXG4gICAgICAgICAgICAgICAgfHwgY29tcG9uZW50RGF0YS52YWx1ZT8uX19zY3JpcHRBc3NldD8udmFsdWU/LnV1aWQ7XG4gICAgICAgICAgICBpZiAoc2NyaXB0VXVpZCAmJiB0eXBlb2Ygc2NyaXB0VXVpZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnRUeXBlID0gdGhpcy51dWlkVG9Db21wcmVzc2VkSWQoc2NyaXB0VXVpZCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYOiEmuacrOe7hOS7tuaYjuaWh+exu+WQjeW3sui9rOWOi+e8qVVVSUQ6ICR7Y29tcG9uZW50VHlwZX1gKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGDohJrmnKznu4Tku7YgX190eXBlX18g5Li65piO5paH57G75ZCNKCR7Y29tcG9uZW50VHlwZX0p5LiU5peg6ISa5pysdXVpZOWPr+aOqOWvvCxwcmVmYWIg5a+85YWl5ZCO6K+l57uE5Lu25Y+v6IO95Li6IG51bGxgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5Z+656GA57uE5Lu257uT5p6EXG4gICAgICAgIGNvbnN0IGNvbXBvbmVudDogYW55ID0ge1xuICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBjb21wb25lbnRUeXBlLFxuICAgICAgICAgICAgXCJfbmFtZVwiOiBcIlwiLFxuICAgICAgICAgICAgXCJfb2JqRmxhZ3NcIjogMCxcbiAgICAgICAgICAgIFwiX19lZGl0b3JFeHRyYXNfX1wiOiB7fSxcbiAgICAgICAgICAgIFwibm9kZVwiOiB7IFwiX19pZF9fXCI6IG5vZGVJbmRleCB9LFxuICAgICAgICAgICAgXCJfZW5hYmxlZFwiOiBlbmFibGVkXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvLyDmj5DliY3orr7nva4gX19wcmVmYWIg5bGe5oCn5Y2g5L2N56ym77yM5ZCO57ut5Lya6KKr5q2j56Gu6K6+572uXG4gICAgICAgIGNvbXBvbmVudC5fX3ByZWZhYiA9IG51bGw7XG4gICAgICAgIFxuICAgICAgICAvLyDmoLnmja7nu4Tku7bnsbvlnovmt7vliqDnibnlrprlsZ7mgKdcbiAgICAgICAgaWYgKGNvbXBvbmVudFR5cGUgPT09ICdjYy5VSVRyYW5zZm9ybScpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnRTaXplID0gY29tcG9uZW50RGF0YS5wcm9wZXJ0aWVzPy5jb250ZW50U2l6ZT8udmFsdWUgfHwgeyB3aWR0aDogMTAwLCBoZWlnaHQ6IDEwMCB9O1xuICAgICAgICAgICAgY29uc3QgYW5jaG9yUG9pbnQgPSBjb21wb25lbnREYXRhLnByb3BlcnRpZXM/LmFuY2hvclBvaW50Py52YWx1ZSB8fCB7IHg6IDAuNSwgeTogMC41IH07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbXBvbmVudC5fY29udGVudFNpemUgPSB7XG4gICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlNpemVcIixcbiAgICAgICAgICAgICAgICBcIndpZHRoXCI6IGNvbnRlbnRTaXplLndpZHRoLFxuICAgICAgICAgICAgICAgIFwiaGVpZ2h0XCI6IGNvbnRlbnRTaXplLmhlaWdodFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fYW5jaG9yUG9pbnQgPSB7XG4gICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlZlYzJcIixcbiAgICAgICAgICAgICAgICBcInhcIjogYW5jaG9yUG9pbnQueCxcbiAgICAgICAgICAgICAgICBcInlcIjogYW5jaG9yUG9pbnQueVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChjb21wb25lbnRUeXBlID09PSAnY2MuU3ByaXRlJykge1xuICAgICAgICAgICAgLy8g5aSE55CGU3ByaXRl57uE5Lu255qEc3ByaXRlRnJhbWXlvJXnlKhcbiAgICAgICAgICAgIGNvbnN0IHNwcml0ZUZyYW1lUHJvcCA9IGNvbXBvbmVudERhdGEucHJvcGVydGllcz8uX3Nwcml0ZUZyYW1lIHx8IGNvbXBvbmVudERhdGEucHJvcGVydGllcz8uc3ByaXRlRnJhbWU7XG4gICAgICAgICAgICBpZiAoc3ByaXRlRnJhbWVQcm9wKSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50Ll9zcHJpdGVGcmFtZSA9IHRoaXMucHJvY2Vzc0NvbXBvbmVudFByb3BlcnR5KHNwcml0ZUZyYW1lUHJvcCwgY29udGV4dCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5fc3ByaXRlRnJhbWUgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb21wb25lbnQuX3R5cGUgPSBjb21wb25lbnREYXRhLnByb3BlcnRpZXM/Ll90eXBlPy52YWx1ZSA/PyAwO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9maWxsVHlwZSA9IGNvbXBvbmVudERhdGEucHJvcGVydGllcz8uX2ZpbGxUeXBlPy52YWx1ZSA/PyAwO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9zaXplTW9kZSA9IGNvbXBvbmVudERhdGEucHJvcGVydGllcz8uX3NpemVNb2RlPy52YWx1ZSA/PyAxO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9maWxsQ2VudGVyID0geyBcIl9fdHlwZV9fXCI6IFwiY2MuVmVjMlwiLCBcInhcIjogMCwgXCJ5XCI6IDAgfTtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fZmlsbFN0YXJ0ID0gY29tcG9uZW50RGF0YS5wcm9wZXJ0aWVzPy5fZmlsbFN0YXJ0Py52YWx1ZSA/PyAwO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9maWxsUmFuZ2UgPSBjb21wb25lbnREYXRhLnByb3BlcnRpZXM/Ll9maWxsUmFuZ2U/LnZhbHVlID8/IDA7XG4gICAgICAgICAgICBjb21wb25lbnQuX2lzVHJpbW1lZE1vZGUgPSBjb21wb25lbnREYXRhLnByb3BlcnRpZXM/Ll9pc1RyaW1tZWRNb2RlPy52YWx1ZSA/PyB0cnVlO1xuICAgICAgICAgICAgY29tcG9uZW50Ll91c2VHcmF5c2NhbGUgPSBjb21wb25lbnREYXRhLnByb3BlcnRpZXM/Ll91c2VHcmF5c2NhbGU/LnZhbHVlID8/IGZhbHNlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDosIPor5XvvJrmiZPljbBTcHJpdGXnu4Tku7bnmoTmiYDmnInlsZ7mgKfvvIjlt7Lms6jph4rvvIlcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdTcHJpdGXnu4Tku7blsZ7mgKc6JywgSlNPTi5zdHJpbmdpZnkoY29tcG9uZW50RGF0YS5wcm9wZXJ0aWVzLCBudWxsLCAyKSk7XG4gICAgICAgICAgICBjb21wb25lbnQuX2F0bGFzID0gbnVsbDtcbiAgICAgICAgICAgIGNvbXBvbmVudC5faWQgPSBcIlwiO1xuICAgICAgICB9IGVsc2UgaWYgKGNvbXBvbmVudFR5cGUgPT09ICdjYy5CdXR0b24nKSB7XG4gICAgICAgICAgICBjb21wb25lbnQuX2ludGVyYWN0YWJsZSA9IHRydWU7XG4gICAgICAgICAgICBjb21wb25lbnQuX3RyYW5zaXRpb24gPSAzO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9ub3JtYWxDb2xvciA9IHsgXCJfX3R5cGVfX1wiOiBcImNjLkNvbG9yXCIsIFwiclwiOiAyNTUsIFwiZ1wiOiAyNTUsIFwiYlwiOiAyNTUsIFwiYVwiOiAyNTUgfTtcbiAgICAgICAgICAgIGNvbXBvbmVudC5faG92ZXJDb2xvciA9IHsgXCJfX3R5cGVfX1wiOiBcImNjLkNvbG9yXCIsIFwiclwiOiAyMTEsIFwiZ1wiOiAyMTEsIFwiYlwiOiAyMTEsIFwiYVwiOiAyNTUgfTtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fcHJlc3NlZENvbG9yID0geyBcIl9fdHlwZV9fXCI6IFwiY2MuQ29sb3JcIiwgXCJyXCI6IDI1NSwgXCJnXCI6IDI1NSwgXCJiXCI6IDI1NSwgXCJhXCI6IDI1NSB9O1xuICAgICAgICAgICAgY29tcG9uZW50Ll9kaXNhYmxlZENvbG9yID0geyBcIl9fdHlwZV9fXCI6IFwiY2MuQ29sb3JcIiwgXCJyXCI6IDEyNCwgXCJnXCI6IDEyNCwgXCJiXCI6IDEyNCwgXCJhXCI6IDI1NSB9O1xuICAgICAgICAgICAgY29tcG9uZW50Ll9ub3JtYWxTcHJpdGUgPSBudWxsO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9ob3ZlclNwcml0ZSA9IG51bGw7XG4gICAgICAgICAgICBjb21wb25lbnQuX3ByZXNzZWRTcHJpdGUgPSBudWxsO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9kaXNhYmxlZFNwcml0ZSA9IG51bGw7XG4gICAgICAgICAgICBjb21wb25lbnQuX2R1cmF0aW9uID0gMC4xO1xuICAgICAgICAgICAgY29tcG9uZW50Ll96b29tU2NhbGUgPSAxLjI7XG4gICAgICAgICAgICAvLyDlpITnkIZCdXR0b27nmoR0YXJnZXTlvJXnlKhcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldFByb3AgPSBjb21wb25lbnREYXRhLnByb3BlcnRpZXM/Ll90YXJnZXQgfHwgY29tcG9uZW50RGF0YS5wcm9wZXJ0aWVzPy50YXJnZXQ7XG4gICAgICAgICAgICBpZiAodGFyZ2V0UHJvcCkge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5fdGFyZ2V0ID0gdGhpcy5wcm9jZXNzQ29tcG9uZW50UHJvcGVydHkodGFyZ2V0UHJvcCwgY29udGV4dCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5fdGFyZ2V0ID0geyBcIl9faWRfX1wiOiBub2RlSW5kZXggfTsgLy8g6buY6K6k5oyH5ZCR6Ieq6Lqr6IqC54K5XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb21wb25lbnQuX2NsaWNrRXZlbnRzID0gW107XG4gICAgICAgICAgICBjb21wb25lbnQuX2lkID0gXCJcIjtcbiAgICAgICAgfSBlbHNlIGlmIChjb21wb25lbnRUeXBlID09PSAnY2MuTGFiZWwnKSB7XG4gICAgICAgICAgICBjb21wb25lbnQuX3N0cmluZyA9IGNvbXBvbmVudERhdGEucHJvcGVydGllcz8uX3N0cmluZz8udmFsdWUgfHwgXCJMYWJlbFwiO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9ob3Jpem9udGFsQWxpZ24gPSAxO1xuICAgICAgICAgICAgY29tcG9uZW50Ll92ZXJ0aWNhbEFsaWduID0gMTtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fYWN0dWFsRm9udFNpemUgPSAyMDtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fZm9udFNpemUgPSAyMDtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fZm9udEZhbWlseSA9IFwiQXJpYWxcIjtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fbGluZUhlaWdodCA9IDI1O1xuICAgICAgICAgICAgY29tcG9uZW50Ll9vdmVyZmxvdyA9IDA7XG4gICAgICAgICAgICBjb21wb25lbnQuX2VuYWJsZVdyYXBUZXh0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fZm9udCA9IG51bGw7XG4gICAgICAgICAgICBjb21wb25lbnQuX2lzU3lzdGVtRm9udFVzZWQgPSB0cnVlO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9zcGFjaW5nWCA9IDA7XG4gICAgICAgICAgICBjb21wb25lbnQuX2lzSXRhbGljID0gZmFsc2U7XG4gICAgICAgICAgICBjb21wb25lbnQuX2lzQm9sZCA9IGZhbHNlO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9pc1VuZGVybGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgY29tcG9uZW50Ll91bmRlcmxpbmVIZWlnaHQgPSAyO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9jYWNoZU1vZGUgPSAwO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9pZCA9IFwiXCI7XG4gICAgICAgIH0gZWxzZSBpZiAoY29tcG9uZW50RGF0YS5wcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICAvLyDlpITnkIbmiYDmnInnu4Tku7bnmoTlsZ7mgKfvvIjljIXmi6zlhoXnva7nu4Tku7blkozoh6rlrprkuYnohJrmnKznu4Tku7bvvIlcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGNvbXBvbmVudERhdGEucHJvcGVydGllcykpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSAnbm9kZScgfHwga2V5ID09PSAnZW5hYmxlZCcgfHwga2V5ID09PSAnX190eXBlX18nIHx8IFxuICAgICAgICAgICAgICAgICAgICBrZXkgPT09ICd1dWlkJyB8fCBrZXkgPT09ICduYW1lJyB8fCBrZXkgPT09ICdfX3NjcmlwdEFzc2V0JyB8fCBrZXkgPT09ICdfb2JqRmxhZ3MnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlOyAvLyDot7Pov4fov5nkupvnibnmrorlsZ7mgKfvvIzljIXmi6xfb2JqRmxhZ3NcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g5a+55LqO5Lul5LiL5YiS57q/5byA5aS055qE5bGe5oCn77yM6ZyA6KaB54m55q6K5aSE55CGXG4gICAgICAgICAgICAgICAgaWYgKGtleS5zdGFydHNXaXRoKCdfJykpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g56Gu5L+d5bGe5oCn5ZCN5L+d5oyB5Y6f5qC377yI5YyF5ous5LiL5YiS57q/77yJXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb3BWYWx1ZSA9IHRoaXMucHJvY2Vzc0NvbXBvbmVudFByb3BlcnR5KHZhbHVlLCBjb250ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRba2V5XSA9IHByb3BWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOmdnuS4i+WIkue6v+W8gOWktOeahOWxnuaAp+ato+W4uOWkhOeQhlxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9wVmFsdWUgPSB0aGlzLnByb2Nlc3NDb21wb25lbnRQcm9wZXJ0eSh2YWx1ZSwgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wVmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50W2tleV0gPSBwcm9wVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOehruS/nSBfaWQg5Zyo5pyA5ZCO5L2N572uXG4gICAgICAgIGNvbnN0IF9pZCA9IGNvbXBvbmVudC5faWQgfHwgXCJcIjtcbiAgICAgICAgZGVsZXRlIGNvbXBvbmVudC5faWQ7XG4gICAgICAgIGNvbXBvbmVudC5faWQgPSBfaWQ7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gY29tcG9uZW50O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWkhOeQhue7hOS7tuWxnuaAp+WAvO+8jOehruS/neagvOW8j+S4juaJi+WKqOWIm+W7uueahOmihOWItuS9k+S4gOiHtFxuICAgICAqL1xuICAgIHByaXZhdGUgcHJvY2Vzc0NvbXBvbmVudFByb3BlcnR5KHByb3BEYXRhOiBhbnksIGNvbnRleHQ/OiB7IFxuICAgICAgICBub2RlVXVpZFRvSW5kZXg/OiBNYXA8c3RyaW5nLCBudW1iZXI+LFxuICAgICAgICBjb21wb25lbnRVdWlkVG9JbmRleD86IE1hcDxzdHJpbmcsIG51bWJlcj5cbiAgICB9KTogYW55IHtcbiAgICAgICAgaWYgKCFwcm9wRGF0YSB8fCB0eXBlb2YgcHJvcERhdGEgIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvcERhdGE7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB2YWx1ZSA9IHByb3BEYXRhLnZhbHVlO1xuICAgICAgICBjb25zdCB0eXBlID0gcHJvcERhdGEudHlwZTtcblxuICAgICAgICAvLyDlpITnkIZudWxs5YC8XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWkhOeQhuepulVVSUTlr7nosaHvvIzovazmjaLkuLpudWxsXG4gICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlLnV1aWQgPT09ICcnKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWkhOeQhuiKgueCueW8leeUqFxuICAgICAgICBpZiAodHlwZSA9PT0gJ2NjLk5vZGUnICYmIHZhbHVlPy51dWlkKSB7XG4gICAgICAgICAgICAvLyDlnKjpooTliLbkvZPkuK3vvIzoioLngrnlvJXnlKjpnIDopoHovazmjaLkuLogX19pZF9fIOW9ouW8j1xuICAgICAgICAgICAgaWYgKGNvbnRleHQ/Lm5vZGVVdWlkVG9JbmRleCAmJiBjb250ZXh0Lm5vZGVVdWlkVG9JbmRleC5oYXModmFsdWUudXVpZCkpIHtcbiAgICAgICAgICAgICAgICAvLyDlhoXpg6jlvJXnlKjvvJrovazmjaLkuLpfX2lkX1/moLzlvI9cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBcIl9faWRfX1wiOiBjb250ZXh0Lm5vZGVVdWlkVG9JbmRleC5nZXQodmFsdWUudXVpZClcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8g5aSW6YOo5byV55So77ya6K6+572u5Li6bnVsbO+8jOWboOS4uuWklumDqOiKgueCueS4jeWxnuS6jumihOWItuS9k+e7k+aehFxuICAgICAgICAgICAgY29uc29sZS53YXJuKGBOb2RlIHJlZmVyZW5jZSBVVUlEICR7dmFsdWUudXVpZH0gbm90IGZvdW5kIGluIHByZWZhYiBjb250ZXh0LCBzZXR0aW5nIHRvIG51bGwgKGV4dGVybmFsIHJlZmVyZW5jZSlgKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5aSE55CG6LWE5rqQ5byV55So77yI6aKE5Yi25L2T44CB57q555CG44CB57K+54G15bin562J77yJXG4gICAgICAgIGlmICh2YWx1ZT8udXVpZCAmJiAoXG4gICAgICAgICAgICB0eXBlID09PSAnY2MuUHJlZmFiJyB8fCBcbiAgICAgICAgICAgIHR5cGUgPT09ICdjYy5UZXh0dXJlMkQnIHx8IFxuICAgICAgICAgICAgdHlwZSA9PT0gJ2NjLlNwcml0ZUZyYW1lJyB8fFxuICAgICAgICAgICAgdHlwZSA9PT0gJ2NjLk1hdGVyaWFsJyB8fFxuICAgICAgICAgICAgdHlwZSA9PT0gJ2NjLkFuaW1hdGlvbkNsaXAnIHx8XG4gICAgICAgICAgICB0eXBlID09PSAnY2MuQXVkaW9DbGlwJyB8fFxuICAgICAgICAgICAgdHlwZSA9PT0gJ2NjLkZvbnQnIHx8XG4gICAgICAgICAgICB0eXBlID09PSAnY2MuQXNzZXQnXG4gICAgICAgICkpIHtcbiAgICAgICAgICAgIC8vIOWvueS6jumihOWItuS9k+W8leeUqO+8jOS/neaMgeWOn+Wni1VVSUTmoLzlvI9cbiAgICAgICAgICAgIGNvbnN0IHV1aWRUb1VzZSA9IHR5cGUgPT09ICdjYy5QcmVmYWInID8gdmFsdWUudXVpZCA6IHRoaXMudXVpZFRvQ29tcHJlc3NlZElkKHZhbHVlLnV1aWQpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBcIl9fdXVpZF9fXCI6IHV1aWRUb1VzZSxcbiAgICAgICAgICAgICAgICBcIl9fZXhwZWN0ZWRUeXBlX19cIjogdHlwZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWkhOeQhue7hOS7tuW8leeUqO+8iOWMheaLrOWFt+S9k+eahOe7hOS7tuexu+Wei+WmgmNjLkxhYmVsLCBjYy5CdXR0b27nrYnvvIlcbiAgICAgICAgaWYgKHZhbHVlPy51dWlkICYmICh0eXBlID09PSAnY2MuQ29tcG9uZW50JyB8fCBcbiAgICAgICAgICAgIHR5cGUgPT09ICdjYy5MYWJlbCcgfHwgdHlwZSA9PT0gJ2NjLkJ1dHRvbicgfHwgdHlwZSA9PT0gJ2NjLlNwcml0ZScgfHwgXG4gICAgICAgICAgICB0eXBlID09PSAnY2MuVUlUcmFuc2Zvcm0nIHx8IHR5cGUgPT09ICdjYy5SaWdpZEJvZHkyRCcgfHwgXG4gICAgICAgICAgICB0eXBlID09PSAnY2MuQm94Q29sbGlkZXIyRCcgfHwgdHlwZSA9PT0gJ2NjLkFuaW1hdGlvbicgfHwgXG4gICAgICAgICAgICB0eXBlID09PSAnY2MuQXVkaW9Tb3VyY2UnIHx8ICh0eXBlPy5zdGFydHNXaXRoKCdjYy4nKSAmJiAhdHlwZS5pbmNsdWRlcygnQCcpKSkpIHtcbiAgICAgICAgICAgIC8vIOWcqOmihOWItuS9k+S4re+8jOe7hOS7tuW8leeUqOS5n+mcgOimgei9rOaNouS4uiBfX2lkX18g5b2i5byPXG4gICAgICAgICAgICBpZiAoY29udGV4dD8uY29tcG9uZW50VXVpZFRvSW5kZXggJiYgY29udGV4dC5jb21wb25lbnRVdWlkVG9JbmRleC5oYXModmFsdWUudXVpZCkpIHtcbiAgICAgICAgICAgICAgICAvLyDlhoXpg6jlvJXnlKjvvJrovazmjaLkuLpfX2lkX1/moLzlvI9cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgQ29tcG9uZW50IHJlZmVyZW5jZSAke3R5cGV9IFVVSUQgJHt2YWx1ZS51dWlkfSBmb3VuZCBpbiBwcmVmYWIgY29udGV4dCwgY29udmVydGluZyB0byBfX2lkX19gKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBcIl9faWRfX1wiOiBjb250ZXh0LmNvbXBvbmVudFV1aWRUb0luZGV4LmdldCh2YWx1ZS51dWlkKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyDlpJbpg6jlvJXnlKjvvJrorr7nva7kuLpudWxs77yM5Zug5Li65aSW6YOo57uE5Lu25LiN5bGe5LqO6aKE5Yi25L2T57uT5p6EXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYENvbXBvbmVudCByZWZlcmVuY2UgJHt0eXBlfSBVVUlEICR7dmFsdWUudXVpZH0gbm90IGZvdW5kIGluIHByZWZhYiBjb250ZXh0LCBzZXR0aW5nIHRvIG51bGwgKGV4dGVybmFsIHJlZmVyZW5jZSlgKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5aSE55CG5aSN5p2C57G75Z6L77yM5re75YqgX190eXBlX1/moIforrBcbiAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGlmICh0eXBlID09PSAnY2MuQ29sb3InKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLkNvbG9yXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiclwiOiBNYXRoLm1pbigyNTUsIE1hdGgubWF4KDAsIE51bWJlcih2YWx1ZS5yKSB8fCAwKSksXG4gICAgICAgICAgICAgICAgICAgIFwiZ1wiOiBNYXRoLm1pbigyNTUsIE1hdGgubWF4KDAsIE51bWJlcih2YWx1ZS5nKSB8fCAwKSksXG4gICAgICAgICAgICAgICAgICAgIFwiYlwiOiBNYXRoLm1pbigyNTUsIE1hdGgubWF4KDAsIE51bWJlcih2YWx1ZS5iKSB8fCAwKSksXG4gICAgICAgICAgICAgICAgICAgIFwiYVwiOiB2YWx1ZS5hICE9PSB1bmRlZmluZWQgPyBNYXRoLm1pbigyNTUsIE1hdGgubWF4KDAsIE51bWJlcih2YWx1ZS5hKSkpIDogMjU1XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2NjLlZlYzMnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlZlYzNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4XCI6IE51bWJlcih2YWx1ZS54KSB8fCAwLFxuICAgICAgICAgICAgICAgICAgICBcInlcIjogTnVtYmVyKHZhbHVlLnkpIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgIFwielwiOiBOdW1iZXIodmFsdWUueikgfHwgMFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdjYy5WZWMyJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5WZWMyXCIsIFxuICAgICAgICAgICAgICAgICAgICBcInhcIjogTnVtYmVyKHZhbHVlLngpIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgIFwieVwiOiBOdW1iZXIodmFsdWUueSkgfHwgMFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdjYy5TaXplJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5TaXplXCIsXG4gICAgICAgICAgICAgICAgICAgIFwid2lkdGhcIjogTnVtYmVyKHZhbHVlLndpZHRoKSB8fCAwLFxuICAgICAgICAgICAgICAgICAgICBcImhlaWdodFwiOiBOdW1iZXIodmFsdWUuaGVpZ2h0KSB8fCAwXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2NjLlF1YXQnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlF1YXRcIixcbiAgICAgICAgICAgICAgICAgICAgXCJ4XCI6IE51bWJlcih2YWx1ZS54KSB8fCAwLFxuICAgICAgICAgICAgICAgICAgICBcInlcIjogTnVtYmVyKHZhbHVlLnkpIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgIFwielwiOiBOdW1iZXIodmFsdWUueikgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgXCJ3XCI6IHZhbHVlLncgIT09IHVuZGVmaW5lZCA/IE51bWJlcih2YWx1ZS53KSA6IDFcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8g5aSE55CG5pWw57uE57G75Z6LXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgLy8g6IqC54K55pWw57uEXG4gICAgICAgICAgICBpZiAocHJvcERhdGEuZWxlbWVudFR5cGVEYXRhPy50eXBlID09PSAnY2MuTm9kZScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUubWFwKGl0ZW0gPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbT8udXVpZCAmJiBjb250ZXh0Py5ub2RlVXVpZFRvSW5kZXg/LmhhcyhpdGVtLnV1aWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBcIl9faWRfX1wiOiBjb250ZXh0Lm5vZGVVdWlkVG9JbmRleC5nZXQoaXRlbS51dWlkKSB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH0pLmZpbHRlcihpdGVtID0+IGl0ZW0gIT09IG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDotYTmupDmlbDnu4RcbiAgICAgICAgICAgIGlmIChwcm9wRGF0YS5lbGVtZW50VHlwZURhdGE/LnR5cGUgJiYgcHJvcERhdGEuZWxlbWVudFR5cGVEYXRhLnR5cGUuc3RhcnRzV2l0aCgnY2MuJykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUubWFwKGl0ZW0gPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbT8udXVpZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIl9fdXVpZF9fXCI6IHRoaXMudXVpZFRvQ29tcHJlc3NlZElkKGl0ZW0udXVpZCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJfX2V4cGVjdGVkVHlwZV9fXCI6IHByb3BEYXRhLmVsZW1lbnRUeXBlRGF0YS50eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH0pLmZpbHRlcihpdGVtID0+IGl0ZW0gIT09IG51bGwpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyDln7rnoYDnsbvlnovmlbDnu4RcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5tYXAoaXRlbSA9PiBpdGVtPy52YWx1ZSAhPT0gdW5kZWZpbmVkID8gaXRlbS52YWx1ZSA6IGl0ZW0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5YW25LuW5aSN5p2C5a+56LGh57G75Z6L77yM5L+d5oyB5Y6f5qC35L2G56Gu5L+d5pyJX190eXBlX1/moIforrBcbiAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdHlwZSAmJiB0eXBlLnN0YXJ0c1dpdGgoJ2NjLicpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIFwiX190eXBlX19cIjogdHlwZSxcbiAgICAgICAgICAgICAgICAuLi52YWx1ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDliJvlu7rnrKblkIjlvJXmk47moIflh4bnmoToioLngrnlr7nosaFcbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZUVuZ2luZVN0YW5kYXJkTm9kZShub2RlRGF0YTogYW55LCBwYXJlbnROb2RlSW5kZXg6IG51bWJlciB8IG51bGwsIG5vZGVOYW1lPzogc3RyaW5nKTogYW55IHtcbiAgICAgICAgLy8g6LCD6K+V77ya5omT5Y2w5Y6f5aeL6IqC54K55pWw5o2u77yI5bey5rOo6YeK77yJXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCfljp/lp4voioLngrnmlbDmja46JywgSlNPTi5zdHJpbmdpZnkobm9kZURhdGEsIG51bGwsIDIpKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOaPkOWPluiKgueCueeahOWfuuacrOWxnuaAp1xuICAgICAgICBjb25zdCBnZXRWYWx1ZSA9IChwcm9wOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGlmIChwcm9wPy52YWx1ZSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gcHJvcC52YWx1ZTtcbiAgICAgICAgICAgIGlmIChwcm9wICE9PSB1bmRlZmluZWQpIHJldHVybiBwcm9wO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IGdldFZhbHVlKG5vZGVEYXRhLnBvc2l0aW9uKSB8fCBnZXRWYWx1ZShub2RlRGF0YS52YWx1ZT8ucG9zaXRpb24pIHx8IHsgeDogMCwgeTogMCwgejogMCB9O1xuICAgICAgICBjb25zdCByb3RhdGlvbiA9IGdldFZhbHVlKG5vZGVEYXRhLnJvdGF0aW9uKSB8fCBnZXRWYWx1ZShub2RlRGF0YS52YWx1ZT8ucm90YXRpb24pIHx8IHsgeDogMCwgeTogMCwgejogMCwgdzogMSB9O1xuICAgICAgICBjb25zdCBzY2FsZSA9IGdldFZhbHVlKG5vZGVEYXRhLnNjYWxlKSB8fCBnZXRWYWx1ZShub2RlRGF0YS52YWx1ZT8uc2NhbGUpIHx8IHsgeDogMSwgeTogMSwgejogMSB9O1xuICAgICAgICBjb25zdCBhY3RpdmUgPSBnZXRWYWx1ZShub2RlRGF0YS5hY3RpdmUpID8/IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5hY3RpdmUpID8/IHRydWU7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBub2RlTmFtZSB8fCBnZXRWYWx1ZShub2RlRGF0YS5uYW1lKSB8fCBnZXRWYWx1ZShub2RlRGF0YS52YWx1ZT8ubmFtZSkgfHwgJ05vZGUnO1xuICAgICAgICBjb25zdCBsYXllciA9IGdldFZhbHVlKG5vZGVEYXRhLmxheWVyKSB8fCBnZXRWYWx1ZShub2RlRGF0YS52YWx1ZT8ubGF5ZXIpIHx8IDEwNzM3NDE4MjQ7XG5cbiAgICAgICAgLy8g6LCD6K+V6L6T5Ye6XG4gICAgICAgIGNvbnNvbGUubG9nKGDliJvlu7roioLngrk6ICR7bmFtZX0sIHBhcmVudE5vZGVJbmRleDogJHtwYXJlbnROb2RlSW5kZXh9YCk7XG5cbiAgICAgICAgY29uc3QgcGFyZW50UmVmID0gcGFyZW50Tm9kZUluZGV4ICE9PSBudWxsID8geyBcIl9faWRfX1wiOiBwYXJlbnROb2RlSW5kZXggfSA6IG51bGw7XG4gICAgICAgIGNvbnNvbGUubG9nKGDoioLngrkgJHtuYW1lfSDnmoTniLboioLngrnlvJXnlKg6YCwgcGFyZW50UmVmKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLk5vZGVcIixcbiAgICAgICAgICAgIFwiX25hbWVcIjogbmFtZSxcbiAgICAgICAgICAgIFwiX29iakZsYWdzXCI6IDAsXG4gICAgICAgICAgICBcIl9fZWRpdG9yRXh0cmFzX19cIjoge30sXG4gICAgICAgICAgICBcIl9wYXJlbnRcIjogcGFyZW50UmVmLFxuICAgICAgICAgICAgXCJfY2hpbGRyZW5cIjogW10sIC8vIOWtkOiKgueCueW8leeUqOWwhuWcqOmAkuW9kui/h+eoi+S4reWKqOaAgea3u+WKoFxuICAgICAgICAgICAgXCJfYWN0aXZlXCI6IGFjdGl2ZSxcbiAgICAgICAgICAgIFwiX2NvbXBvbmVudHNcIjogW10sIC8vIOe7hOS7tuW8leeUqOWwhuWcqOWkhOeQhue7hOS7tuaXtuWKqOaAgea3u+WKoFxuICAgICAgICAgICAgXCJfcHJlZmFiXCI6IHsgXCJfX2lkX19cIjogMCB9LCAvLyDkuLTml7blgLzvvIzlkI7nu63kvJrooqvmraPnoa7orr7nva5cbiAgICAgICAgICAgIFwiX2xwb3NcIjoge1xuICAgICAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5WZWMzXCIsXG4gICAgICAgICAgICAgICAgXCJ4XCI6IHBvc2l0aW9uLngsXG4gICAgICAgICAgICAgICAgXCJ5XCI6IHBvc2l0aW9uLnksXG4gICAgICAgICAgICAgICAgXCJ6XCI6IHBvc2l0aW9uLnpcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcIl9scm90XCI6IHtcbiAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuUXVhdFwiLFxuICAgICAgICAgICAgICAgIFwieFwiOiByb3RhdGlvbi54LFxuICAgICAgICAgICAgICAgIFwieVwiOiByb3RhdGlvbi55LFxuICAgICAgICAgICAgICAgIFwielwiOiByb3RhdGlvbi56LFxuICAgICAgICAgICAgICAgIFwid1wiOiByb3RhdGlvbi53XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJfbHNjYWxlXCI6IHtcbiAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuVmVjM1wiLFxuICAgICAgICAgICAgICAgIFwieFwiOiBzY2FsZS54LFxuICAgICAgICAgICAgICAgIFwieVwiOiBzY2FsZS55LFxuICAgICAgICAgICAgICAgIFwielwiOiBzY2FsZS56XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJfbW9iaWxpdHlcIjogMCxcbiAgICAgICAgICAgIFwiX2xheWVyXCI6IGxheWVyLFxuICAgICAgICAgICAgXCJfZXVsZXJcIjoge1xuICAgICAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5WZWMzXCIsXG4gICAgICAgICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgICAgICAgXCJ6XCI6IDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcIl9pZFwiOiBcIlwiXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5LuO6IqC54K55pWw5o2u5Lit5o+Q5Y+WVVVJRFxuICAgICAqL1xuICAgIHByaXZhdGUgZXh0cmFjdE5vZGVVdWlkKG5vZGVEYXRhOiBhbnkpOiBzdHJpbmcgfCBudWxsIHtcbiAgICAgICAgaWYgKCFub2RlRGF0YSkgcmV0dXJuIG51bGw7XG4gICAgICAgIFxuICAgICAgICAvLyDlsJ3or5XlpJrnp43mlrnlvI/ojrflj5ZVVUlEXG4gICAgICAgIGNvbnN0IHNvdXJjZXMgPSBbXG4gICAgICAgICAgICBub2RlRGF0YS51dWlkLFxuICAgICAgICAgICAgbm9kZURhdGEudmFsdWU/LnV1aWQsXG4gICAgICAgICAgICBub2RlRGF0YS5fX3V1aWRfXyxcbiAgICAgICAgICAgIG5vZGVEYXRhLnZhbHVlPy5fX3V1aWRfXyxcbiAgICAgICAgICAgIG5vZGVEYXRhLmlkLFxuICAgICAgICAgICAgbm9kZURhdGEudmFsdWU/LmlkXG4gICAgICAgIF07XG4gICAgICAgIFxuICAgICAgICBmb3IgKGNvbnN0IHNvdXJjZSBvZiBzb3VyY2VzKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHNvdXJjZSA9PT0gJ3N0cmluZycgJiYgc291cmNlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc291cmNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDliJvlu7rmnIDlsI/ljJbnmoToioLngrnlr7nosaHvvIzkuI3ljIXlkKvku7vkvZXnu4Tku7bku6Xpgb/lhY3kvp3otZbpl67pophcbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZU1pbmltYWxOb2RlKG5vZGVEYXRhOiBhbnksIG5vZGVOYW1lPzogc3RyaW5nKTogYW55IHtcbiAgICAgICAgLy8g5o+Q5Y+W6IqC54K555qE5Z+65pys5bGe5oCnXG4gICAgICAgIGNvbnN0IGdldFZhbHVlID0gKHByb3A6IGFueSkgPT4ge1xuICAgICAgICAgICAgaWYgKHByb3A/LnZhbHVlICE9PSB1bmRlZmluZWQpIHJldHVybiBwcm9wLnZhbHVlO1xuICAgICAgICAgICAgaWYgKHByb3AgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHByb3A7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gZ2V0VmFsdWUobm9kZURhdGEucG9zaXRpb24pIHx8IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5wb3NpdGlvbikgfHwgeyB4OiAwLCB5OiAwLCB6OiAwIH07XG4gICAgICAgIGNvbnN0IHJvdGF0aW9uID0gZ2V0VmFsdWUobm9kZURhdGEucm90YXRpb24pIHx8IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5yb3RhdGlvbikgfHwgeyB4OiAwLCB5OiAwLCB6OiAwLCB3OiAxIH07XG4gICAgICAgIGNvbnN0IHNjYWxlID0gZ2V0VmFsdWUobm9kZURhdGEuc2NhbGUpIHx8IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5zY2FsZSkgfHwgeyB4OiAxLCB5OiAxLCB6OiAxIH07XG4gICAgICAgIGNvbnN0IGFjdGl2ZSA9IGdldFZhbHVlKG5vZGVEYXRhLmFjdGl2ZSkgPz8gZ2V0VmFsdWUobm9kZURhdGEudmFsdWU/LmFjdGl2ZSkgPz8gdHJ1ZTtcbiAgICAgICAgY29uc3QgbmFtZSA9IG5vZGVOYW1lIHx8IGdldFZhbHVlKG5vZGVEYXRhLm5hbWUpIHx8IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5uYW1lKSB8fCAnTm9kZSc7XG4gICAgICAgIGNvbnN0IGxheWVyID0gZ2V0VmFsdWUobm9kZURhdGEubGF5ZXIpIHx8IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5sYXllcikgfHwgMzM1NTQ0MzI7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5Ob2RlXCIsXG4gICAgICAgICAgICBcIl9uYW1lXCI6IG5hbWUsXG4gICAgICAgICAgICBcIl9vYmpGbGFnc1wiOiAwLFxuICAgICAgICAgICAgXCJfcGFyZW50XCI6IG51bGwsXG4gICAgICAgICAgICBcIl9jaGlsZHJlblwiOiBbXSxcbiAgICAgICAgICAgIFwiX2FjdGl2ZVwiOiBhY3RpdmUsXG4gICAgICAgICAgICBcIl9jb21wb25lbnRzXCI6IFtdLCAvLyDnqbrnmoTnu4Tku7bmlbDnu4TvvIzpgb/lhY3nu4Tku7bkvp3otZbpl67pophcbiAgICAgICAgICAgIFwiX3ByZWZhYlwiOiB7XG4gICAgICAgICAgICAgICAgXCJfX2lkX19cIjogMlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiX2xwb3NcIjoge1xuICAgICAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5WZWMzXCIsXG4gICAgICAgICAgICAgICAgXCJ4XCI6IHBvc2l0aW9uLngsXG4gICAgICAgICAgICAgICAgXCJ5XCI6IHBvc2l0aW9uLnksXG4gICAgICAgICAgICAgICAgXCJ6XCI6IHBvc2l0aW9uLnpcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcIl9scm90XCI6IHtcbiAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuUXVhdFwiLFxuICAgICAgICAgICAgICAgIFwieFwiOiByb3RhdGlvbi54LFxuICAgICAgICAgICAgICAgIFwieVwiOiByb3RhdGlvbi55LFxuICAgICAgICAgICAgICAgIFwielwiOiByb3RhdGlvbi56LFxuICAgICAgICAgICAgICAgIFwid1wiOiByb3RhdGlvbi53XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJfbHNjYWxlXCI6IHtcbiAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuVmVjM1wiLFxuICAgICAgICAgICAgICAgIFwieFwiOiBzY2FsZS54LFxuICAgICAgICAgICAgICAgIFwieVwiOiBzY2FsZS55LFxuICAgICAgICAgICAgICAgIFwielwiOiBzY2FsZS56XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJfbGF5ZXJcIjogbGF5ZXIsXG4gICAgICAgICAgICBcIl9ldWxlclwiOiB7XG4gICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlZlYzNcIixcbiAgICAgICAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICAgICAgICBcInpcIjogMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiX2lkXCI6IFwiXCJcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDliJvlu7rmoIflh4bnmoQgbWV0YSDmlofku7blhoXlrrlcbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZVN0YW5kYXJkTWV0YUNvbnRlbnQocHJlZmFiTmFtZTogc3RyaW5nLCBwcmVmYWJVdWlkOiBzdHJpbmcpOiBhbnkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgXCJ2ZXJcIjogXCIyLjAuM1wiLFxuICAgICAgICAgICAgXCJpbXBvcnRlclwiOiBcInByZWZhYlwiLFxuICAgICAgICAgICAgXCJpbXBvcnRlZFwiOiB0cnVlLFxuICAgICAgICAgICAgXCJ1dWlkXCI6IHByZWZhYlV1aWQsXG4gICAgICAgICAgICBcImZpbGVzXCI6IFtcbiAgICAgICAgICAgICAgICBcIi5qc29uXCJcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcInN1Yk1ldGFzXCI6IHt9LFxuICAgICAgICAgICAgXCJ1c2VyRGF0YVwiOiB7XG4gICAgICAgICAgICAgICAgXCJzeW5jTm9kZU5hbWVcIjogcHJlZmFiTmFtZSxcbiAgICAgICAgICAgICAgICBcImhhc0ljb25cIjogZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDlsJ3or5XlsIbljp/lp4voioLngrnovazmjaLkuLrpooTliLbkvZPlrp7kvotcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIGNvbnZlcnROb2RlVG9QcmVmYWJJbnN0YW5jZShub2RlVXVpZDogc3RyaW5nLCBwcmVmYWJVdWlkOiBzdHJpbmcsIHByZWZhYlBhdGg6IHN0cmluZyk6IFByb21pc2U8eyBzdWNjZXNzOiBib29sZWFuOyBlcnJvcj86IHN0cmluZyB9PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgLy8g6L+Z5Liq5Yqf6IO96ZyA6KaB5rex5YWl55qE5Zy65pmv57yW6L6R5Zmo6ZuG5oiQ77yM5pqC5pe26L+U5Zue5aSx6LSlXG4gICAgICAgICAgICAvLyDlnKjlrp7pmYXnmoTlvJXmk47kuK3vvIzov5nmtonlj4rliLDlpI3mnYLnmoTpooTliLbkvZPlrp7kvovljJblkozoioLngrnmm7/mjaLpgLvovpFcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfoioLngrnovazmjaLkuLrpooTliLbkvZPlrp7kvovnmoTlip/og73pnIDopoHmm7Tmt7HlhaXnmoTlvJXmk47pm4bmiJAnKTtcbiAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yOiAn6IqC54K56L2s5o2i5Li66aKE5Yi25L2T5a6e5L6L6ZyA6KaB5pu05rex5YWl55qE5byV5pOO6ZuG5oiQ5pSv5oyBJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcmVzdG9yZVByZWZhYk5vZGUobm9kZVV1aWQ6IHN0cmluZywgYXNzZXRVdWlkOiBzdHJpbmcpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAgIC8vIOS9v+eUqOWumOaWuUFQSSByZXN0b3JlLXByZWZhYiDov5jljp/pooTliLbkvZPoioLngrlcbiAgICAgICAgICAgIChFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0IGFzIGFueSkoJ3NjZW5lJywgJ3Jlc3RvcmUtcHJlZmFiJywgbm9kZVV1aWQsIGFzc2V0VXVpZCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVVdWlkOiBub2RlVXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0VXVpZDogYXNzZXRVdWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ+mihOWItuS9k+iKgueCuei/mOWOn+aIkOWKnydcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBg6aKE5Yi25L2T6IqC54K56L+Y5Y6f5aSx6LSlOiAke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOWfuuS6juWumOaWuemihOWItuS9k+agvOW8j+eahOaWsOWunueOsOaWueazlVxuICAgIHByaXZhdGUgYXN5bmMgZ2V0Tm9kZURhdGFGb3JQcmVmYWIobm9kZVV1aWQ6IHN0cmluZyk6IFByb21pc2U8eyBzdWNjZXNzOiBib29sZWFuOyBkYXRhPzogYW55OyBlcnJvcj86IHN0cmluZyB9PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAncXVlcnktbm9kZScsIG5vZGVVdWlkKS50aGVuKChub2RlRGF0YTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFub2RlRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAn6IqC54K55LiN5a2Y5ZyoJyB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXNvbHZlKHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogbm9kZURhdGEgfSk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3I6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBjcmVhdGVTdGFuZGFyZFByZWZhYkRhdGEobm9kZURhdGE6IGFueSwgcHJlZmFiTmFtZTogc3RyaW5nLCBwcmVmYWJVdWlkOiBzdHJpbmcpOiBQcm9taXNlPGFueVtdPiB7XG4gICAgICAgIC8vIOWfuuS6juWumOaWuUNhbnZhcy5wcmVmYWLmoLzlvI/liJvlu7rpooTliLbkvZPmlbDmja7nu5PmnoRcbiAgICAgICAgY29uc3QgcHJlZmFiRGF0YTogYW55W10gPSBbXTtcbiAgICAgICAgbGV0IGN1cnJlbnRJZCA9IDA7XG5cbiAgICAgICAgLy8g56ys5LiA5Liq5YWD57Sg77yaY2MuUHJlZmFiIOi1hOa6kOWvueixoVxuICAgICAgICBjb25zdCBwcmVmYWJBc3NldCA9IHtcbiAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5QcmVmYWJcIixcbiAgICAgICAgICAgIFwiX25hbWVcIjogcHJlZmFiTmFtZSxcbiAgICAgICAgICAgIFwiX29iakZsYWdzXCI6IDAsXG4gICAgICAgICAgICBcIl9fZWRpdG9yRXh0cmFzX19cIjoge30sXG4gICAgICAgICAgICBcIl9uYXRpdmVcIjogXCJcIixcbiAgICAgICAgICAgIFwiZGF0YVwiOiB7XG4gICAgICAgICAgICAgICAgXCJfX2lkX19cIjogMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwib3B0aW1pemF0aW9uUG9saWN5XCI6IDAsXG4gICAgICAgICAgICBcInBlcnNpc3RlbnRcIjogZmFsc2VcbiAgICAgICAgfTtcbiAgICAgICAgcHJlZmFiRGF0YS5wdXNoKHByZWZhYkFzc2V0KTtcbiAgICAgICAgY3VycmVudElkKys7XG5cbiAgICAgICAgLy8g56ys5LqM5Liq5YWD57Sg77ya5qC56IqC54K5XG4gICAgICAgIGNvbnN0IHJvb3ROb2RlID0gYXdhaXQgdGhpcy5jcmVhdGVOb2RlT2JqZWN0KG5vZGVEYXRhLCBudWxsLCBwcmVmYWJEYXRhLCBjdXJyZW50SWQpO1xuICAgICAgICBwcmVmYWJEYXRhLnB1c2gocm9vdE5vZGUubm9kZSk7XG4gICAgICAgIGN1cnJlbnRJZCA9IHJvb3ROb2RlLm5leHRJZDtcblxuICAgICAgICAvLyDmt7vliqDmoLnoioLngrnnmoQgUHJlZmFiSW5mbyAtIOS/ruWkjWFzc2V05byV55So5L2/55SoVVVJRFxuICAgICAgICBjb25zdCByb290UHJlZmFiSW5mbyA9IHtcbiAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5QcmVmYWJJbmZvXCIsXG4gICAgICAgICAgICBcInJvb3RcIjoge1xuICAgICAgICAgICAgICAgIFwiX19pZF9fXCI6IDFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImFzc2V0XCI6IHtcbiAgICAgICAgICAgICAgICBcIl9fdXVpZF9fXCI6IHByZWZhYlV1aWRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImZpbGVJZFwiOiB0aGlzLmdlbmVyYXRlRmlsZUlkKCksXG4gICAgICAgICAgICBcImluc3RhbmNlXCI6IG51bGwsXG4gICAgICAgICAgICBcInRhcmdldE92ZXJyaWRlc1wiOiBbXSxcbiAgICAgICAgICAgIFwibmVzdGVkUHJlZmFiSW5zdGFuY2VSb290c1wiOiBbXVxuICAgICAgICB9O1xuICAgICAgICBwcmVmYWJEYXRhLnB1c2gocm9vdFByZWZhYkluZm8pO1xuXG4gICAgICAgIHJldHVybiBwcmVmYWJEYXRhO1xuICAgIH1cblxuXG4gICAgcHJpdmF0ZSBhc3luYyBjcmVhdGVOb2RlT2JqZWN0KG5vZGVEYXRhOiBhbnksIHBhcmVudElkOiBudW1iZXIgfCBudWxsLCBwcmVmYWJEYXRhOiBhbnlbXSwgY3VycmVudElkOiBudW1iZXIpOiBQcm9taXNlPHsgbm9kZTogYW55OyBuZXh0SWQ6IG51bWJlciB9PiB7XG4gICAgICAgIGNvbnN0IG5vZGVJZCA9IGN1cnJlbnRJZCsrO1xuICAgICAgICBcbiAgICAgICAgLy8g5o+Q5Y+W6IqC54K555qE5Z+65pys5bGe5oCnIC0g6YCC6YWNcXVlcnktbm9kZS10cmVl55qE5pWw5o2u5qC85byPXG4gICAgICAgIGNvbnN0IGdldFZhbHVlID0gKHByb3A6IGFueSkgPT4ge1xuICAgICAgICAgICAgaWYgKHByb3A/LnZhbHVlICE9PSB1bmRlZmluZWQpIHJldHVybiBwcm9wLnZhbHVlO1xuICAgICAgICAgICAgaWYgKHByb3AgIT09IHVuZGVmaW5lZCkgcmV0dXJuIHByb3A7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gZ2V0VmFsdWUobm9kZURhdGEucG9zaXRpb24pIHx8IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5wb3NpdGlvbikgfHwgeyB4OiAwLCB5OiAwLCB6OiAwIH07XG4gICAgICAgIGNvbnN0IHJvdGF0aW9uID0gZ2V0VmFsdWUobm9kZURhdGEucm90YXRpb24pIHx8IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5yb3RhdGlvbikgfHwgeyB4OiAwLCB5OiAwLCB6OiAwLCB3OiAxIH07XG4gICAgICAgIGNvbnN0IHNjYWxlID0gZ2V0VmFsdWUobm9kZURhdGEuc2NhbGUpIHx8IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5zY2FsZSkgfHwgeyB4OiAxLCB5OiAxLCB6OiAxIH07XG4gICAgICAgIGNvbnN0IGFjdGl2ZSA9IGdldFZhbHVlKG5vZGVEYXRhLmFjdGl2ZSkgPz8gZ2V0VmFsdWUobm9kZURhdGEudmFsdWU/LmFjdGl2ZSkgPz8gdHJ1ZTtcbiAgICAgICAgY29uc3QgbmFtZSA9IGdldFZhbHVlKG5vZGVEYXRhLm5hbWUpIHx8IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5uYW1lKSB8fCAnTm9kZSc7XG4gICAgICAgIGNvbnN0IGxheWVyID0gZ2V0VmFsdWUobm9kZURhdGEubGF5ZXIpIHx8IGdldFZhbHVlKG5vZGVEYXRhLnZhbHVlPy5sYXllcikgfHwgMzM1NTQ0MzI7XG5cbiAgICAgICAgY29uc3Qgbm9kZTogYW55ID0ge1xuICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLk5vZGVcIixcbiAgICAgICAgICAgIFwiX25hbWVcIjogbmFtZSxcbiAgICAgICAgICAgIFwiX29iakZsYWdzXCI6IDAsXG4gICAgICAgICAgICBcIl9fZWRpdG9yRXh0cmFzX19cIjoge30sXG4gICAgICAgICAgICBcIl9wYXJlbnRcIjogcGFyZW50SWQgIT09IG51bGwgPyB7IFwiX19pZF9fXCI6IHBhcmVudElkIH0gOiBudWxsLFxuICAgICAgICAgICAgXCJfY2hpbGRyZW5cIjogW10sXG4gICAgICAgICAgICBcIl9hY3RpdmVcIjogYWN0aXZlLFxuICAgICAgICAgICAgXCJfY29tcG9uZW50c1wiOiBbXSxcbiAgICAgICAgICAgIFwiX3ByZWZhYlwiOiBwYXJlbnRJZCA9PT0gbnVsbCA/IHtcbiAgICAgICAgICAgICAgICBcIl9faWRfX1wiOiBjdXJyZW50SWQrK1xuICAgICAgICAgICAgfSA6IG51bGwsXG4gICAgICAgICAgICBcIl9scG9zXCI6IHtcbiAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuVmVjM1wiLFxuICAgICAgICAgICAgICAgIFwieFwiOiBwb3NpdGlvbi54LFxuICAgICAgICAgICAgICAgIFwieVwiOiBwb3NpdGlvbi55LFxuICAgICAgICAgICAgICAgIFwielwiOiBwb3NpdGlvbi56XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJfbHJvdFwiOiB7XG4gICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlF1YXRcIixcbiAgICAgICAgICAgICAgICBcInhcIjogcm90YXRpb24ueCxcbiAgICAgICAgICAgICAgICBcInlcIjogcm90YXRpb24ueSxcbiAgICAgICAgICAgICAgICBcInpcIjogcm90YXRpb24ueixcbiAgICAgICAgICAgICAgICBcIndcIjogcm90YXRpb24ud1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiX2xzY2FsZVwiOiB7XG4gICAgICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBcImNjLlZlYzNcIixcbiAgICAgICAgICAgICAgICBcInhcIjogc2NhbGUueCxcbiAgICAgICAgICAgICAgICBcInlcIjogc2NhbGUueSxcbiAgICAgICAgICAgICAgICBcInpcIjogc2NhbGUuelxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiX21vYmlsaXR5XCI6IDAsXG4gICAgICAgICAgICBcIl9sYXllclwiOiBsYXllcixcbiAgICAgICAgICAgIFwiX2V1bGVyXCI6IHtcbiAgICAgICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuVmVjM1wiLFxuICAgICAgICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgICAgICAgIFwielwiOiAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJfaWRcIjogXCJcIlxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIOaaguaXtui3s+i/h1VJVHJhbnNmb3Jt57uE5Lu25Lul6YG/5YWNX2dldERlcGVuZENvbXBvbmVudOmUmeivr1xuICAgICAgICAvLyDlkI7nu63pgJrov4dFbmdpbmUgQVBJ5Yqo5oCB5re75YqgXG4gICAgICAgIGNvbnNvbGUubG9nKGDoioLngrkgJHtuYW1lfSDmmoLml7bot7Pov4dVSVRyYW5zZm9ybee7hOS7tu+8jOmBv+WFjeW8leaTjuS+nei1lumUmeivr2ApO1xuICAgICAgICBcbiAgICAgICAgLy8g5aSE55CG5YW25LuW57uE5Lu277yI5pqC5pe26Lez6L+H77yM5LiT5rOo5LqO5L+u5aSNVUlUcmFuc2Zvcm3pl67popjvvIlcbiAgICAgICAgY29uc3QgY29tcG9uZW50cyA9IHRoaXMuZXh0cmFjdENvbXBvbmVudHNGcm9tTm9kZShub2RlRGF0YSk7XG4gICAgICAgIGlmIChjb21wb25lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDoioLngrkgJHtuYW1lfSDljIXlkKsgJHtjb21wb25lbnRzLmxlbmd0aH0g5Liq5YW25LuW57uE5Lu277yM5pqC5pe26Lez6L+H5Lul5LiT5rOo5LqOVUlUcmFuc2Zvcm3kv67lpI1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOWkhOeQhuWtkOiKgueCuSAtIOS9v+eUqHF1ZXJ5LW5vZGUtdHJlZeiOt+WPlueahOWujOaVtOe7k+aehFxuICAgICAgICBjb25zdCBjaGlsZHJlblRvUHJvY2VzcyA9IHRoaXMuZ2V0Q2hpbGRyZW5Ub1Byb2Nlc3Mobm9kZURhdGEpO1xuICAgICAgICBpZiAoY2hpbGRyZW5Ub1Byb2Nlc3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYD09PSDlpITnkIblrZDoioLngrkgPT09YCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg6IqC54K5ICR7bmFtZX0g5YyF5ZCrICR7Y2hpbGRyZW5Ub1Byb2Nlc3MubGVuZ3RofSDkuKrlrZDoioLngrlgKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlblRvUHJvY2Vzcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkRGF0YSA9IGNoaWxkcmVuVG9Qcm9jZXNzW2ldO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkTmFtZSA9IGNoaWxkRGF0YS5uYW1lIHx8IGNoaWxkRGF0YS52YWx1ZT8ubmFtZSB8fCAn5pyq55+lJztcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhg5aSE55CG56ysJHtpICsgMX3kuKrlrZDoioLngrk6ICR7Y2hpbGROYW1lfWApO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkSWQgPSBjdXJyZW50SWQ7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUuX2NoaWxkcmVuLnB1c2goeyBcIl9faWRfX1wiOiBjaGlsZElkIH0pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8g6YCS5b2S5Yib5bu65a2Q6IqC54K5XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkUmVzdWx0ID0gYXdhaXQgdGhpcy5jcmVhdGVOb2RlT2JqZWN0KGNoaWxkRGF0YSwgbm9kZUlkLCBwcmVmYWJEYXRhLCBjdXJyZW50SWQpO1xuICAgICAgICAgICAgICAgICAgICBwcmVmYWJEYXRhLnB1c2goY2hpbGRSZXN1bHQubm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJZCA9IGNoaWxkUmVzdWx0Lm5leHRJZDtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIOWtkOiKgueCueS4jemcgOimgVByZWZhYkluZm/vvIzlj6rmnInmoLnoioLngrnpnIDopoFcbiAgICAgICAgICAgICAgICAgICAgLy8g5a2Q6IqC54K555qEX3ByZWZhYuW6lOivpeiuvue9ruS4um51bGxcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRSZXN1bHQubm9kZS5fcHJlZmFiID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGDinIUg5oiQ5Yqf5re75Yqg5a2Q6IqC54K5OiAke2NoaWxkTmFtZX1gKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGDlpITnkIblrZDoioLngrkgJHtjaGlsZE5hbWV9IOaXtuWHuumUmTpgLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsgbm9kZSwgbmV4dElkOiBjdXJyZW50SWQgfTtcbiAgICB9XG5cbiAgICAvLyDku47oioLngrnmlbDmja7kuK3mj5Dlj5bnu4Tku7bkv6Hmga9cbiAgICBwcml2YXRlIGV4dHJhY3RDb21wb25lbnRzRnJvbU5vZGUobm9kZURhdGE6IGFueSk6IGFueVtdIHtcbiAgICAgICAgY29uc3QgY29tcG9uZW50czogYW55W10gPSBbXTtcbiAgICAgICAgXG4gICAgICAgIC8vIOS7juS4jeWQjOS9jee9ruWwneivleiOt+WPlue7hOS7tuaVsOaNrlxuICAgICAgICBjb25zdCBjb21wb25lbnRTb3VyY2VzID0gW1xuICAgICAgICAgICAgbm9kZURhdGEuX19jb21wc19fLFxuICAgICAgICAgICAgbm9kZURhdGEuY29tcG9uZW50cyxcbiAgICAgICAgICAgIG5vZGVEYXRhLnZhbHVlPy5fX2NvbXBzX18sXG4gICAgICAgICAgICBub2RlRGF0YS52YWx1ZT8uY29tcG9uZW50c1xuICAgICAgICBdO1xuICAgICAgICBcbiAgICAgICAgZm9yIChjb25zdCBzb3VyY2Ugb2YgY29tcG9uZW50U291cmNlcykge1xuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoc291cmNlKSkge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudHMucHVzaCguLi5zb3VyY2UuZmlsdGVyKGNvbXAgPT4gY29tcCAmJiAoY29tcC5fX3R5cGVfXyB8fCBjb21wLnR5cGUpKSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7IC8vIOaJvuWIsOacieaViOeahOe7hOS7tuaVsOe7hOWwsemAgOWHulxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gY29tcG9uZW50cztcbiAgICB9XG4gICAgXG4gICAgLy8g5Yib5bu65qCH5YeG55qE57uE5Lu25a+56LGhXG4gICAgcHJpdmF0ZSBjcmVhdGVTdGFuZGFyZENvbXBvbmVudE9iamVjdChjb21wb25lbnREYXRhOiBhbnksIG5vZGVJZDogbnVtYmVyLCBwcmVmYWJJbmZvSWQ6IG51bWJlcik6IGFueSB7XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudFR5cGUgPSBjb21wb25lbnREYXRhLl9fdHlwZV9fIHx8IGNvbXBvbmVudERhdGEudHlwZTtcbiAgICAgICAgXG4gICAgICAgIGlmICghY29tcG9uZW50VHlwZSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCfnu4Tku7bnvLrlsJHnsbvlnovkv6Hmga86JywgY29tcG9uZW50RGF0YSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5Z+656GA57uE5Lu257uT5p6EIC0g5Z+65LqO5a6Y5pa56aKE5Yi25L2T5qC85byPXG4gICAgICAgIGNvbnN0IGNvbXBvbmVudDogYW55ID0ge1xuICAgICAgICAgICAgXCJfX3R5cGVfX1wiOiBjb21wb25lbnRUeXBlLFxuICAgICAgICAgICAgXCJfbmFtZVwiOiBcIlwiLFxuICAgICAgICAgICAgXCJfb2JqRmxhZ3NcIjogMCxcbiAgICAgICAgICAgIFwibm9kZVwiOiB7XG4gICAgICAgICAgICAgICAgXCJfX2lkX19cIjogbm9kZUlkXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJfZW5hYmxlZFwiOiB0aGlzLmdldENvbXBvbmVudFByb3BlcnR5VmFsdWUoY29tcG9uZW50RGF0YSwgJ2VuYWJsZWQnLCB0cnVlKSxcbiAgICAgICAgICAgIFwiX19wcmVmYWJcIjoge1xuICAgICAgICAgICAgICAgIFwiX19pZF9fXCI6IHByZWZhYkluZm9JZFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLy8g5qC55o2u57uE5Lu257G75Z6L5re75Yqg54m55a6a5bGe5oCnXG4gICAgICAgIHRoaXMuYWRkQ29tcG9uZW50U3BlY2lmaWNQcm9wZXJ0aWVzKGNvbXBvbmVudCwgY29tcG9uZW50RGF0YSwgY29tcG9uZW50VHlwZSk7XG4gICAgICAgIFxuICAgICAgICAvLyDmt7vliqBfaWTlsZ7mgKdcbiAgICAgICAgY29tcG9uZW50Ll9pZCA9IFwiXCI7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gY29tcG9uZW50O1xuICAgIH1cbiAgICBcbiAgICAvLyDmt7vliqDnu4Tku7bnibnlrprnmoTlsZ7mgKdcbiAgICBwcml2YXRlIGFkZENvbXBvbmVudFNwZWNpZmljUHJvcGVydGllcyhjb21wb25lbnQ6IGFueSwgY29tcG9uZW50RGF0YTogYW55LCBjb21wb25lbnRUeXBlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgc3dpdGNoIChjb21wb25lbnRUeXBlKSB7XG4gICAgICAgICAgICBjYXNlICdjYy5VSVRyYW5zZm9ybSc6XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRVSVRyYW5zZm9ybVByb3BlcnRpZXMoY29tcG9uZW50LCBjb21wb25lbnREYXRhKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2NjLlNwcml0ZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRTcHJpdGVQcm9wZXJ0aWVzKGNvbXBvbmVudCwgY29tcG9uZW50RGF0YSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjYy5MYWJlbCc6XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRMYWJlbFByb3BlcnRpZXMoY29tcG9uZW50LCBjb21wb25lbnREYXRhKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2NjLkJ1dHRvbic6XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRCdXR0b25Qcm9wZXJ0aWVzKGNvbXBvbmVudCwgY29tcG9uZW50RGF0YSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIC8vIOWvueS6juacquefpeexu+Wei+eahOe7hOS7tu+8jOWkjeWItuaJgOacieWuieWFqOeahOWxnuaAp1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkR2VuZXJpY1Byb3BlcnRpZXMoY29tcG9uZW50LCBjb21wb25lbnREYXRhKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvLyBVSVRyYW5zZm9ybee7hOS7tuWxnuaAp1xuICAgIHByaXZhdGUgYWRkVUlUcmFuc2Zvcm1Qcm9wZXJ0aWVzKGNvbXBvbmVudDogYW55LCBjb21wb25lbnREYXRhOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29tcG9uZW50Ll9jb250ZW50U2l6ZSA9IHRoaXMuY3JlYXRlU2l6ZU9iamVjdChcbiAgICAgICAgICAgIHRoaXMuZ2V0Q29tcG9uZW50UHJvcGVydHlWYWx1ZShjb21wb25lbnREYXRhLCAnY29udGVudFNpemUnLCB7IHdpZHRoOiAxMDAsIGhlaWdodDogMTAwIH0pXG4gICAgICAgICk7XG4gICAgICAgIGNvbXBvbmVudC5fYW5jaG9yUG9pbnQgPSB0aGlzLmNyZWF0ZVZlYzJPYmplY3QoXG4gICAgICAgICAgICB0aGlzLmdldENvbXBvbmVudFByb3BlcnR5VmFsdWUoY29tcG9uZW50RGF0YSwgJ2FuY2hvclBvaW50JywgeyB4OiAwLjUsIHk6IDAuNSB9KVxuICAgICAgICApO1xuICAgIH1cbiAgICBcbiAgICAvLyBTcHJpdGXnu4Tku7blsZ7mgKdcbiAgICBwcml2YXRlIGFkZFNwcml0ZVByb3BlcnRpZXMoY29tcG9uZW50OiBhbnksIGNvbXBvbmVudERhdGE6IGFueSk6IHZvaWQge1xuICAgICAgICBjb21wb25lbnQuX3Zpc0ZsYWdzID0gMDtcbiAgICAgICAgY29tcG9uZW50Ll9jdXN0b21NYXRlcmlhbCA9IG51bGw7XG4gICAgICAgIGNvbXBvbmVudC5fc3JjQmxlbmRGYWN0b3IgPSAyO1xuICAgICAgICBjb21wb25lbnQuX2RzdEJsZW5kRmFjdG9yID0gNDtcbiAgICAgICAgY29tcG9uZW50Ll9jb2xvciA9IHRoaXMuY3JlYXRlQ29sb3JPYmplY3QoXG4gICAgICAgICAgICB0aGlzLmdldENvbXBvbmVudFByb3BlcnR5VmFsdWUoY29tcG9uZW50RGF0YSwgJ2NvbG9yJywgeyByOiAyNTUsIGc6IDI1NSwgYjogMjU1LCBhOiAyNTUgfSlcbiAgICAgICAgKTtcbiAgICAgICAgY29tcG9uZW50Ll9zcHJpdGVGcmFtZSA9IHRoaXMuZ2V0Q29tcG9uZW50UHJvcGVydHlWYWx1ZShjb21wb25lbnREYXRhLCAnc3ByaXRlRnJhbWUnLCBudWxsKTtcbiAgICAgICAgY29tcG9uZW50Ll90eXBlID0gdGhpcy5nZXRDb21wb25lbnRQcm9wZXJ0eVZhbHVlKGNvbXBvbmVudERhdGEsICd0eXBlJywgMCk7XG4gICAgICAgIGNvbXBvbmVudC5fZmlsbFR5cGUgPSAwO1xuICAgICAgICBjb21wb25lbnQuX3NpemVNb2RlID0gdGhpcy5nZXRDb21wb25lbnRQcm9wZXJ0eVZhbHVlKGNvbXBvbmVudERhdGEsICdzaXplTW9kZScsIDEpO1xuICAgICAgICBjb21wb25lbnQuX2ZpbGxDZW50ZXIgPSB0aGlzLmNyZWF0ZVZlYzJPYmplY3QoeyB4OiAwLCB5OiAwIH0pO1xuICAgICAgICBjb21wb25lbnQuX2ZpbGxTdGFydCA9IDA7XG4gICAgICAgIGNvbXBvbmVudC5fZmlsbFJhbmdlID0gMDtcbiAgICAgICAgY29tcG9uZW50Ll9pc1RyaW1tZWRNb2RlID0gdHJ1ZTtcbiAgICAgICAgY29tcG9uZW50Ll91c2VHcmF5c2NhbGUgPSBmYWxzZTtcbiAgICAgICAgY29tcG9uZW50Ll9hdGxhcyA9IG51bGw7XG4gICAgfVxuICAgIFxuICAgIC8vIExhYmVs57uE5Lu25bGe5oCnXG4gICAgcHJpdmF0ZSBhZGRMYWJlbFByb3BlcnRpZXMoY29tcG9uZW50OiBhbnksIGNvbXBvbmVudERhdGE6IGFueSk6IHZvaWQge1xuICAgICAgICBjb21wb25lbnQuX3Zpc0ZsYWdzID0gMDtcbiAgICAgICAgY29tcG9uZW50Ll9jdXN0b21NYXRlcmlhbCA9IG51bGw7XG4gICAgICAgIGNvbXBvbmVudC5fc3JjQmxlbmRGYWN0b3IgPSAyO1xuICAgICAgICBjb21wb25lbnQuX2RzdEJsZW5kRmFjdG9yID0gNDtcbiAgICAgICAgY29tcG9uZW50Ll9jb2xvciA9IHRoaXMuY3JlYXRlQ29sb3JPYmplY3QoXG4gICAgICAgICAgICB0aGlzLmdldENvbXBvbmVudFByb3BlcnR5VmFsdWUoY29tcG9uZW50RGF0YSwgJ2NvbG9yJywgeyByOiAwLCBnOiAwLCBiOiAwLCBhOiAyNTUgfSlcbiAgICAgICAgKTtcbiAgICAgICAgY29tcG9uZW50Ll9zdHJpbmcgPSB0aGlzLmdldENvbXBvbmVudFByb3BlcnR5VmFsdWUoY29tcG9uZW50RGF0YSwgJ3N0cmluZycsICdMYWJlbCcpO1xuICAgICAgICBjb21wb25lbnQuX2hvcml6b250YWxBbGlnbiA9IDE7XG4gICAgICAgIGNvbXBvbmVudC5fdmVydGljYWxBbGlnbiA9IDE7XG4gICAgICAgIGNvbXBvbmVudC5fYWN0dWFsRm9udFNpemUgPSAyMDtcbiAgICAgICAgY29tcG9uZW50Ll9mb250U2l6ZSA9IHRoaXMuZ2V0Q29tcG9uZW50UHJvcGVydHlWYWx1ZShjb21wb25lbnREYXRhLCAnZm9udFNpemUnLCAyMCk7XG4gICAgICAgIGNvbXBvbmVudC5fZm9udEZhbWlseSA9ICdBcmlhbCc7XG4gICAgICAgIGNvbXBvbmVudC5fbGluZUhlaWdodCA9IDQwO1xuICAgICAgICBjb21wb25lbnQuX292ZXJmbG93ID0gMTtcbiAgICAgICAgY29tcG9uZW50Ll9lbmFibGVXcmFwVGV4dCA9IGZhbHNlO1xuICAgICAgICBjb21wb25lbnQuX2ZvbnQgPSBudWxsO1xuICAgICAgICBjb21wb25lbnQuX2lzU3lzdGVtRm9udFVzZWQgPSB0cnVlO1xuICAgICAgICBjb21wb25lbnQuX2lzSXRhbGljID0gZmFsc2U7XG4gICAgICAgIGNvbXBvbmVudC5faXNCb2xkID0gZmFsc2U7XG4gICAgICAgIGNvbXBvbmVudC5faXNVbmRlcmxpbmUgPSBmYWxzZTtcbiAgICAgICAgY29tcG9uZW50Ll91bmRlcmxpbmVIZWlnaHQgPSAyO1xuICAgICAgICBjb21wb25lbnQuX2NhY2hlTW9kZSA9IDA7XG4gICAgfVxuICAgIFxuICAgIC8vIEJ1dHRvbue7hOS7tuWxnuaAp1xuICAgIHByaXZhdGUgYWRkQnV0dG9uUHJvcGVydGllcyhjb21wb25lbnQ6IGFueSwgY29tcG9uZW50RGF0YTogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbXBvbmVudC5jbGlja0V2ZW50cyA9IFtdO1xuICAgICAgICBjb21wb25lbnQuX2ludGVyYWN0YWJsZSA9IHRydWU7XG4gICAgICAgIGNvbXBvbmVudC5fdHJhbnNpdGlvbiA9IDI7XG4gICAgICAgIGNvbXBvbmVudC5fbm9ybWFsQ29sb3IgPSB0aGlzLmNyZWF0ZUNvbG9yT2JqZWN0KHsgcjogMjE0LCBnOiAyMTQsIGI6IDIxNCwgYTogMjU1IH0pO1xuICAgICAgICBjb21wb25lbnQuX2hvdmVyQ29sb3IgPSB0aGlzLmNyZWF0ZUNvbG9yT2JqZWN0KHsgcjogMjExLCBnOiAyMTEsIGI6IDIxMSwgYTogMjU1IH0pO1xuICAgICAgICBjb21wb25lbnQuX3ByZXNzZWRDb2xvciA9IHRoaXMuY3JlYXRlQ29sb3JPYmplY3QoeyByOiAyNTUsIGc6IDI1NSwgYjogMjU1LCBhOiAyNTUgfSk7XG4gICAgICAgIGNvbXBvbmVudC5fZGlzYWJsZWRDb2xvciA9IHRoaXMuY3JlYXRlQ29sb3JPYmplY3QoeyByOiAxMjQsIGc6IDEyNCwgYjogMTI0LCBhOiAyNTUgfSk7XG4gICAgICAgIGNvbXBvbmVudC5fZHVyYXRpb24gPSAwLjE7XG4gICAgICAgIGNvbXBvbmVudC5fem9vbVNjYWxlID0gMS4yO1xuICAgIH1cbiAgICBcbiAgICAvLyDmt7vliqDpgJrnlKjlsZ7mgKdcbiAgICBwcml2YXRlIGFkZEdlbmVyaWNQcm9wZXJ0aWVzKGNvbXBvbmVudDogYW55LCBjb21wb25lbnREYXRhOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgLy8g5Y+q5aSN5Yi25a6J5YWo55qE44CB5bey55+l55qE5bGe5oCnXG4gICAgICAgIGNvbnN0IHNhZmVQcm9wZXJ0aWVzID0gWydlbmFibGVkJywgJ2NvbG9yJywgJ3N0cmluZycsICdmb250U2l6ZScsICdzcHJpdGVGcmFtZScsICd0eXBlJywgJ3NpemVNb2RlJ107XG4gICAgICAgIFxuICAgICAgICBmb3IgKGNvbnN0IHByb3Agb2Ygc2FmZVByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIGlmIChjb21wb25lbnREYXRhLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLmdldENvbXBvbmVudFByb3BlcnR5VmFsdWUoY29tcG9uZW50RGF0YSwgcHJvcCk7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50W2BfJHtwcm9wfWBdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIOWIm+W7ulZlYzLlr7nosaFcbiAgICBwcml2YXRlIGNyZWF0ZVZlYzJPYmplY3QoZGF0YTogYW55KTogYW55IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5WZWMyXCIsXG4gICAgICAgICAgICBcInhcIjogZGF0YT8ueCB8fCAwLFxuICAgICAgICAgICAgXCJ5XCI6IGRhdGE/LnkgfHwgMFxuICAgICAgICB9O1xuICAgIH1cbiAgICBcbiAgICAvLyDliJvlu7pWZWMz5a+56LGhXG4gICAgcHJpdmF0ZSBjcmVhdGVWZWMzT2JqZWN0KGRhdGE6IGFueSk6IGFueSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuVmVjM1wiLFxuICAgICAgICAgICAgXCJ4XCI6IGRhdGE/LnggfHwgMCxcbiAgICAgICAgICAgIFwieVwiOiBkYXRhPy55IHx8IDAsXG4gICAgICAgICAgICBcInpcIjogZGF0YT8ueiB8fCAwXG4gICAgICAgIH07XG4gICAgfVxuICAgIFxuICAgIC8vIOWIm+W7ulNpemXlr7nosaFcbiAgICBwcml2YXRlIGNyZWF0ZVNpemVPYmplY3QoZGF0YTogYW55KTogYW55IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIFwiX190eXBlX19cIjogXCJjYy5TaXplXCIsXG4gICAgICAgICAgICBcIndpZHRoXCI6IGRhdGE/LndpZHRoIHx8IDEwMCxcbiAgICAgICAgICAgIFwiaGVpZ2h0XCI6IGRhdGE/LmhlaWdodCB8fCAxMDBcbiAgICAgICAgfTtcbiAgICB9XG4gICAgXG4gICAgLy8g5Yib5bu6Q29sb3Llr7nosaFcbiAgICBwcml2YXRlIGNyZWF0ZUNvbG9yT2JqZWN0KGRhdGE6IGFueSk6IGFueSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBcIl9fdHlwZV9fXCI6IFwiY2MuQ29sb3JcIixcbiAgICAgICAgICAgIFwiclwiOiBkYXRhPy5yID8/IDI1NSxcbiAgICAgICAgICAgIFwiZ1wiOiBkYXRhPy5nID8/IDI1NSxcbiAgICAgICAgICAgIFwiYlwiOiBkYXRhPy5iID8/IDI1NSxcbiAgICAgICAgICAgIFwiYVwiOiBkYXRhPy5hID8/IDI1NVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vIOWIpOaWreaYr+WQpuW6lOivpeWkjeWItue7hOS7tuWxnuaAp1xuICAgIHByaXZhdGUgc2hvdWxkQ29weUNvbXBvbmVudFByb3BlcnR5KGtleTogc3RyaW5nLCB2YWx1ZTogYW55KTogYm9vbGVhbiB7XG4gICAgICAgIC8vIOi3s+i/h+WGhemDqOWxnuaAp+WSjOW3suWkhOeQhueahOWxnuaAp1xuICAgICAgICBpZiAoa2V5LnN0YXJ0c1dpdGgoJ19fJykgfHwga2V5ID09PSAnX2VuYWJsZWQnIHx8IGtleSA9PT0gJ25vZGUnIHx8IGtleSA9PT0gJ2VuYWJsZWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOi3s+i/h+WHveaVsOWSjHVuZGVmaW5lZOWAvFxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nIHx8IHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG5cbiAgICAvLyDojrflj5bnu4Tku7blsZ7mgKflgLwgLSDph43lkb3lkI3ku6Xpgb/lhY3lhrLnqoFcbiAgICBwcml2YXRlIGdldENvbXBvbmVudFByb3BlcnR5VmFsdWUoY29tcG9uZW50RGF0YTogYW55LCBwcm9wZXJ0eU5hbWU6IHN0cmluZywgZGVmYXVsdFZhbHVlPzogYW55KTogYW55IHtcbiAgICAgICAgLy8g5bCd6K+V55u05o6l6I635Y+W5bGe5oCnXG4gICAgICAgIGlmIChjb21wb25lbnREYXRhW3Byb3BlcnR5TmFtZV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXh0cmFjdFZhbHVlKGNvbXBvbmVudERhdGFbcHJvcGVydHlOYW1lXSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOWwneivleS7jnZhbHVl5bGe5oCn5Lit6I635Y+WXG4gICAgICAgIGlmIChjb21wb25lbnREYXRhLnZhbHVlICYmIGNvbXBvbmVudERhdGEudmFsdWVbcHJvcGVydHlOYW1lXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5leHRyYWN0VmFsdWUoY29tcG9uZW50RGF0YS52YWx1ZVtwcm9wZXJ0eU5hbWVdKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5bCd6K+V5bim5LiL5YiS57q/5YmN57yA55qE5bGe5oCn5ZCNXG4gICAgICAgIGNvbnN0IHByZWZpeGVkTmFtZSA9IGBfJHtwcm9wZXJ0eU5hbWV9YDtcbiAgICAgICAgaWYgKGNvbXBvbmVudERhdGFbcHJlZml4ZWROYW1lXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5leHRyYWN0VmFsdWUoY29tcG9uZW50RGF0YVtwcmVmaXhlZE5hbWVdKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICB9XG4gICAgXG4gICAgLy8g5o+Q5Y+W5bGe5oCn5YC8XG4gICAgcHJpdmF0ZSBleHRyYWN0VmFsdWUoZGF0YTogYW55KTogYW55IHtcbiAgICAgICAgaWYgKGRhdGEgPT09IG51bGwgfHwgZGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5aaC5p6c5pyJdmFsdWXlsZ7mgKfvvIzkvJjlhYjkvb/nlKh2YWx1ZVxuICAgICAgICBpZiAodHlwZW9mIGRhdGEgPT09ICdvYmplY3QnICYmIGRhdGEuaGFzT3duUHJvcGVydHkoJ3ZhbHVlJykpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDlpoLmnpzmmK/lvJXnlKjlr7nosaHvvIzkv53mjIHljp/moLdcbiAgICAgICAgaWYgKHR5cGVvZiBkYXRhID09PSAnb2JqZWN0JyAmJiAoZGF0YS5fX2lkX18gIT09IHVuZGVmaW5lZCB8fCBkYXRhLl9fdXVpZF9fICE9PSB1bmRlZmluZWQpKSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjcmVhdGVTdGFuZGFyZE1ldGFEYXRhKHByZWZhYk5hbWU6IHN0cmluZywgcHJlZmFiVXVpZDogc3RyaW5nKTogYW55IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIFwidmVyXCI6IFwiMS4xLjUwXCIsXG4gICAgICAgICAgICBcImltcG9ydGVyXCI6IFwicHJlZmFiXCIsXG4gICAgICAgICAgICBcImltcG9ydGVkXCI6IHRydWUsXG4gICAgICAgICAgICBcInV1aWRcIjogcHJlZmFiVXVpZCxcbiAgICAgICAgICAgIFwiZmlsZXNcIjogW1xuICAgICAgICAgICAgICAgIFwiLmpzb25cIlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwic3ViTWV0YXNcIjoge30sXG4gICAgICAgICAgICBcInVzZXJEYXRhXCI6IHtcbiAgICAgICAgICAgICAgICBcInN5bmNOb2RlTmFtZVwiOiBwcmVmYWJOYW1lXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBzYXZlUHJlZmFiV2l0aE1ldGEocHJlZmFiUGF0aDogc3RyaW5nLCBwcmVmYWJEYXRhOiBhbnlbXSwgbWV0YURhdGE6IGFueSk6IFByb21pc2U8eyBzdWNjZXNzOiBib29sZWFuOyBlcnJvcj86IHN0cmluZyB9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBwcmVmYWJDb250ZW50ID0gSlNPTi5zdHJpbmdpZnkocHJlZmFiRGF0YSwgbnVsbCwgMik7XG4gICAgICAgICAgICBjb25zdCBtZXRhQ29udGVudCA9IEpTT04uc3RyaW5naWZ5KG1ldGFEYXRhLCBudWxsLCAyKTtcblxuICAgICAgICAgICAgLy8g56Gu5L+d6Lev5b6E5LulLnByZWZhYue7k+WwvlxuICAgICAgICAgICAgY29uc3QgZmluYWxQcmVmYWJQYXRoID0gcHJlZmFiUGF0aC5lbmRzV2l0aCgnLnByZWZhYicpID8gcHJlZmFiUGF0aCA6IGAke3ByZWZhYlBhdGh9LnByZWZhYmA7XG4gICAgICAgICAgICBjb25zdCBtZXRhUGF0aCA9IGAke2ZpbmFsUHJlZmFiUGF0aH0ubWV0YWA7XG5cbiAgICAgICAgICAgIC8vIOS9v+eUqGFzc2V0LWRiIEFQSeWIm+W7uumihOWItuS9k+aWh+S7tlxuICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ2Fzc2V0LWRiJywgJ2NyZWF0ZS1hc3NldCcsIGZpbmFsUHJlZmFiUGF0aCwgcHJlZmFiQ29udGVudCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyDliJvlu7ptZXRh5paH5Lu2XG4gICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnYXNzZXQtZGInLCAnY3JlYXRlLWFzc2V0JywgbWV0YVBhdGgsIG1ldGFDb250ZW50KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3I6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGA9PT0g6aKE5Yi25L2T5L+d5a2Y5a6M5oiQID09PWApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYOmihOWItuS9k+aWh+S7tuW3suS/neWtmDogJHtmaW5hbFByZWZhYlBhdGh9YCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgTWV0YeaWh+S7tuW3suS/neWtmDogJHttZXRhUGF0aH1gKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDpooTliLbkvZPmlbDnu4TmgLvplb/luqY6ICR7cHJlZmFiRGF0YS5sZW5ndGh9YCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg6aKE5Yi25L2T5qC56IqC54K557Si5byVOiAke3ByZWZhYkRhdGEubGVuZ3RoIC0gMX1gKTtcblxuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9O1xuICAgICAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCfkv53lrZjpooTliLbkvZPmlofku7bml7blh7rplJk6JywgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH07XG4gICAgICAgIH1cbiAgICB9XG5cbn0iXX0=