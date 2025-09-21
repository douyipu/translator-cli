# 翻译CLI项目架构文档

## 项目概述

这是一个命令行翻译工具，可以逐段翻译文档（默认英文→中文）。使用TUI界面进行交互，用户可以对每段翻译进行 同意/修改/重新生成 操作。

**核心特性：**
- TUI界面（类似htop的全屏终端界面）
- 智能文本分段（每段不超过300字符）
- 实时用户反馈和翻译修正
- 无状态Agent Core + 有状态CLI App架构

## 架构设计

博主提供的无状态架构模式：

```
           +--------------------------+                                +----------------------------------+
           |        Agent Core        |                                |            Agent App             |
           +--------------------------+                                +----------------------------------+

                 core state                                                       render
           ╭────────────────────╮  ..................................> ╭────────────────────────────────╮
           │   model messages   │ <. . . . . . . . . . . . . . . . . . │ model messages                 │
           ╰──────────┬─────────╯           .      .                   │ actor                          │
                      │                      .        .                │ unprocessed tool calls         │
                      v                        .          .            ╰─────────────────▲──────────────╯
                                               .            .                           .
              computed state                     .            .                         .
           ╭────────────────────╮  ...............................>                     .
           │       actor        │                    .            .                   handle
           │ unprocessed tool.. │                      .            .     ╭────────────────────────────────╮
           ╰──────────┬─────────╯                        .             '->│ interactive tool execution     │
                      │                                   .               ╰────────────────────────────────╯
                      v                                     .
                                                            .
               side effects                                   .              trigger
           ╭────────────────────╮                               .   ╭────────────────────────────────╮
           │  tool executions   │ . . . . . . . . . . . . . . . . .>│ input new message              │
           ╰────────────────────╯                                   │ next core loop                 │
                                                                    ╰────────────────────────────────╯
```

### 职责分工

**Agent Core (packages/core):**
- 管理对话状态（model messages）
- 计算下一个执行者（user/agent）
- 检测未处理工具调用
- 执行工具但不处理业务逻辑

**Agent App (packages/cli):**
- 管理业务状态（翻译进度、用户选择）
- 决定何时调用Core
- 处理工具调用结果的业务逻辑
- 管理用户交互流程（TUI界面）

## 核心工作流程

1. **用户输入**: "我要翻译 readme.txt"
2. **Agent自主工作**:
   - 使用 ls-tool 找文件
   - 使用 read-tool 读取内容
   - 使用 thinking-tool 分析分段
   - 循环使用 translate-tool 翻译每段
3. **关键交互点**: translate-tool 调用 `copilotHandler` 让用户选择
4. **用户反馈**: 通过TUI界面选择 approve/reject/refined
5. **持续学习**: Memory系统记录用户偏好

## Core模块实现进展 ✅

### 1. 工具系统完整实现

**ls-tool (文件列表工具)**
```typescript
// 支持目录扫描、扩展名过滤、文件信息获取
lsExecutor({ directory: "./", extensions: [".txt", ".md"] })
```

**read-tool (文件读取工具)**
```typescript
// 支持UTF-8文件读取、错误处理、元数据获取
readExecutor({ file_path: "./readme.txt" })
```

**thinking-tool (智能分析工具)**
```typescript
// 支持文本分段、内容分析、语言检测
thinkingExecutor({ action: "segment_text", content: "..." })
```

**translate-tool (翻译工具)**
```typescript
// 支持AI翻译生成、用户反馈处理、Memory学习
translateExecutor({
  src_string: "Hello world",
  file_id: "test_001"
}, { copilotHandler })
```

### 2. 核心类和系统

**AgentLoop** - 主控制循环
**Context** - 对话上下文管理
**Memory** - 用户反馈学习系统
**Types** - 完整类型定义

### 3. CopilotHandler机制

这是连接Core和App的关键接口：
```typescript
type CopilotRequest = {
    src_string: string;
    translate_string: string;
    file_id: string;
}

type CopilotResponse = {
    status: "approve" | "reject" | "refined";
    translated_string: string;
    reason: string;
}
```

当Agent调用translate-tool时，会触发copilotHandler，App在此显示TUI界面让用户选择。

### 4. 测试验证 ✅

- ✅ 文件系统操作正常
- ✅ 文本智能分段（389字符→3段）
- ✅ 语言检测和内容分析
- ✅ copilotHandler用户反馈机制
- ✅ Memory学习系统集成

## CLI App模块实现进展 ✅

### 1. TUI界面完整实现 ✅

**CopilotRequestHandler组件** - 核心翻译交互界面
```typescript
// 实现完整的左右对比显示界面
┌─────────────────────────────────────────────────────────┐
│ 原文上下文:                                              │
│ ...previous text... Hello world! This is a test.      │
├─────────────────────────────────────────────────────────┤
│ 译文:                                                   │
│ 你好世界！这是一个测试句子。                              │
├─────────────────────────────────────────────────────────┤
│ [Approve] [Reject] [Refine]                            │
└─────────────────────────────────────────────────────────┘
```

**MessageList组件** - 对话历史显示
**UserInputArea组件** - 命令输入界面
**App组件** - 主应用程序框架

### 2. CopilotHandler机制完整实现 ✅

```typescript
// 完整的CopilotRequestHandler实现
const CopilotRequestHandler = ({
  copilotRequest,
  copilotResolverRef,
  withEditor,
  onFinish,
  currentFile,
  currentTranslation
}) => {
  // 上下文显示逻辑
  // 用户选择处理（Approve/Reject/Refine）
  // 外部编辑器集成
  // 错误验证和处理
}
```

**核心特性：**
- ✅ 原文上下文智能显示
- ✅ 翻译一致性检测
- ✅ 三种用户操作（同意/拒绝/精修）
- ✅ 外部编辑器集成（refine模式）
- ✅ 错误处理和验证

### 3. React hooks系统 ✅

**useAgent** - Agent Core集成
```typescript
const useAgent = () => {
  // AgentLoop实例管理
  // 消息状态管理
  // copilotHandler桥接
  // 错误处理和清理
}
```

**useTranslationState** - 翻译状态跟踪
**useEditor** - 外部编辑器管理
**useUserInput** - 用户输入处理

### 4. 完整架构验证 ✅

- ✅ 无状态Core ↔ 有状态App架构
- ✅ TypeScript类型安全
- ✅ React18 + Ink TUI框架
- ✅ 工作区依赖管理
- ✅ 编译验证通过

## 当前状态：架构完整 ✅

整个翻译CLI项目的核心架构已经完全实现：
- **Agent Core**: AI对话管理（无状态）
- **CLI App**: 用户交互管理（有状态）
- **CopilotHandler**: 两者之间的桥梁

## 下一步：生产环境部署

### 1. 环境配置和测试
- [ ] 配置OpenRouter API密钥 DONE
- [ ] 端到端翻译流程测试
- [ ] 错误处理和边界情况测试
- [ ] 性能优化和内存管理

### 2. 用户体验优化
- [ ] 键盘快捷键增强
- [ ] 翻译进度显示
- [ ] 批量翻译模式
- [ ] 翻译历史和回滚

### 3. 功能扩展
- [ ] 多语言支持（不限于英→中）
- [ ] 自定义翻译提示词
- [ ] 翻译质量评估
- [ ] 导出和格式化选项

### 4. 分发和打包
- [ ] Bun可执行文件打包
- [ ] npm包发布
- [ ] 跨平台兼容性测试
- [ ] 安装和使用文档


## 当前状态更新 (2025-09-21)

### 🎉 核心功能验证成功 ✅
- **API配置**: OpenRouter API密钥正确配置
- **所有工具测试通过**: `bun test-tools.ts` 全部成功
  - ls-tool: 文件扫描 ✅
  - read-tool: 文件读取 ✅
  - thinking-tool: 智能分段 ✅
  - translate-tool: AI翻译 ✅
- **Agent Core架构**: 无状态Core运行正常
- **用户反馈机制**: CopilotHandler模拟测试成功

### ⚠️ TUI界面问题发现
在实际使用中发现以下问题需要修复：

#### 1. 用户输入处理Bug (已修复)
**问题**: 用户输入无响应
**原因**: `UserInputArea.tsx` 中变量名冲突
**修复**: 将useInput回调参数从`input`改为`char`

#### 2. Agent循环卡死 (待修复)
**症状**: Agent不断调用translate-tool但不显示CopilotHandler界面
**现象**:
```
🤖 Agent is working... (一直显示)
[Tool Call: translate] (持续循环)
[Unknown content] (工具结果不显示)
```

**可能原因**:
- CopilotRequestHandler组件没有正确触发
- translate-tool的copilotHandler调用逻辑问题
- Agent状态机没有正确等待用户交互

#### 3. 消息显示问题
**问题**: 工具调用结果显示为"[Unknown content]"
**位置**: `MessageList.tsx:52` - 工具结果显示逻辑
**影响**: 用户无法看到实际的翻译内容和AI响应

### 📋 下次需要解决的问题

#### 高优先级 (核心功能)
- [ ] 修复Agent循环卡死问题
- [ ] 确保CopilotRequestHandler正确显示
- [ ] 修复工具结果内容显示
- [ ] 测试完整的端到端翻译流程

#### 中优先级 (用户体验)
- [ ] 优化TUI界面响应性能
- [ ] 添加翻译进度指示器
- [ ] 改善错误处理和用户提示

#### 调试策略
1. **简化测试**: 先用单句测试而不是整个文件
2. **日志增强**: 在关键节点添加调试输出
3. **状态跟踪**: 验证Agent状态机流转
4. **组件隔离**: 单独测试CopilotRequestHandler组件

### 💡 当前架构评估
- **Core模块**: 架构设计正确，工具功能完整 ✅
- **CLI App**: 基础结构正确，存在实现细节问题 ⚠️
- **整体集成**: 需要解决状态同步和用户交互流程

