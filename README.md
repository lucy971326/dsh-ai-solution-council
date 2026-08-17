# DSH AI 方案团

一个独立的 DeepSeek Harness 插件：让多个**同职责、上下文隔离**的 Agent 并行调查当前问题，再由主流程串行完成交叉评审、证据核验和最终裁判。

它适合用于架构设计、代码库调查、实现方案比较和高风险技术判断，目标是减少单个 Agent 被自身上下文和第一判断带偏的情况。

## 工作方式

```text
主 Agent 调用 solution_council
          │
          ▼
4 个同职责 Agent 并行探索
（各自继承当前 Agent 模式的工具能力，彼此不共享上下文）
          │
          ▼
串行交叉评审：比较共识、分歧和证据强弱
          │
          ▼
串行证据核验：回到代码库检查关键结论
          │
          ▼
主流程最终裁判：给出建议、理由和未解决风险
```

并行阶段不是让不同岗位各说一遍，而是让多个同职责 Agent 独立回答同一个问题。不同职责的评审者按阶段串行运行，避免评审者之间互相污染上下文。

每个调查 Agent 可以使用当前主 Agent 模式提供的工具探索代码库。方案团工具本身会从子 Agent 中屏蔽，防止递归启动方案团；不会硬编码一套与极简、常规、创造模式不匹配的工具白名单。

## Web UI

安装 Web profile 后，模型调用 `solution_council` 会在对话区生成一个折叠的工具卡片：

- 卡片显示任务、当前阶段和整体进度；
- 点击卡片进入全屏工作台；
- 4 个并行 Agent 并排展示；
- 调查报告、交叉评审、证据核验和最终方案都支持 Markdown 展示与内容折叠；
- 可在工作台中取消运行，并返回对话区；
- 使用 DSH 公共 UI 主题 Token，跟随浅色/深色主题；
- UI 通过 Remote 读取 Host 状态，不新增聊天消息。

客户端只支持 Web。Headless 模式仍可使用模型工具和 Host 服务，但不提供页面。

## 安装

### 从 GitHub 安装

```powershell
dsh plugin --profile web add github:lucy971326/dsh-ai-solution-council
```

仓库会提交可直接运行的 `lib/` 构建产物，因此安装者不需要执行构建脚本，也不需要修改 profile 的 `pnpm-workspace.yaml`。生产使用建议固定 Git commit，避免远端后续变更影响已安装版本。

### 从 tarball 安装

适合本地验证已构建的独立包：

```powershell
pnpm install
pnpm build
pnpm pack
dsh plugin --profile web add .\dsh-ai-solution-council-0.1.0.tgz
```

tarball 安装会把包放进 profile 的依赖树，适合验证真实安装形态。独立项目使用本地 `link` 时，必须先在本项目执行 `pnpm install`，否则外部链接路径无法解析 DSH 的 peer 依赖。

## 开发

```powershell
pnpm install
pnpm test
pnpm build
```

源码调试配置在 [`cordis.yml`](./cordis.yml)，其中的 `file:///C:/...` 路径需要替换成你本机的绝对路径：

```powershell
dsh --profile web --patch .\cordis.yml --port 0
```

注意：`--patch` 主要用于 Host 调试；要验证 Web Client 扫描、Client Bundle 和 UI，必须通过 `dsh plugin --profile web add` 安装组合包。

## 配置

组合包默认使用 [`cordis.patch.yml`](./cordis.patch.yml)：

```yaml
- insert:
    - id: solution-council
      name: dsh-ai-solution-council
      config:
        explorerCount: 4
        providerName: spawn
```

当前配置项：

| 配置项 | 默认值 | 说明 |
| --- | ---: | --- |
| `explorerCount` | `4` | 并行同职责探索 Agent 数量，当前有效范围为 2–4 |
| `providerName` | `spawn` | DSH profile 中注册的子 Agent provider 名称 |
| `maxTaskBytes` | `16384` | 单个任务允许的最大 UTF-8 字节数 |
| `maxRunsPerSession` | `32` | 每个会话保留的最大运行记录数 |

## 数据与生命周期

- 运行记录保存在独立的 `solution_council` Storage Domain 中，按当前 Session 隔离；
- 不修改原始 `Session.events`，也不把 UI 操作写成聊天消息；
- Host、模型工具和 Web UI 读取同一份运行状态；
- 服务重启后，无法恢复进程内的子 Agent，因此未完成的 queued/running Run 会被标记为 failed，并提示重新执行；
- 已完成运行会按 `maxRunsPerSession` 保留，超出部分淘汰最旧记录。

Remote 暴露的主要读取/控制面：

- `list(session)`：列出当前会话的方案团运行记录；
- `get(session, callId)`：读取某次工具调用对应的运行详情；
- `cancel(session, callId)`：取消仍在运行的方案团。

## 包结构

```text
src/
├── index.ts                 # Host 入口
├── solution-council.ts      # 编排、工具、独立存储
├── remote-service.ts        # Host Remote Service
├── remote.ts                # Host/Client Remote 描述
├── types.ts                 # Host、Remote、Client 共用数据模型
└── client/
    ├── index.ts             # Web Client 入口
    ├── CouncilToolRow.tsx   # 对话区折叠工具卡片
    ├── CouncilWorkbench.tsx # 全屏工作台
    ├── MarkdownDisclosure.tsx
    ├── controller.ts
    ├── locales.ts
    └── solution-council.module.css
```

构建产物位于 `lib/`。独立包发布或从 GitHub 安装时必须包含构建产物，不能只提交 `src/`。
发布到 npm 时由作者侧的 `prepublishOnly` 构建；消费者安装已构建的包，不执行插件构建脚本。

## 已知边界

- 并行 Agent 的质量仍取决于当前模型、Agent preset 和可用工具；方案团通过隔离和阶段审查降低偏差，不保证每份报告都正确；
- 并行调查阶段要求 Agent 不修改代码，但实际工具能力仍由当前 Agent 模式决定；
- 跨标签页、跨进程的实时冲突解决不在 v1 范围内；
- 方案团是当前 Session 的能力，不是全局知识库。

## License

本项目使用 MIT License，详见 [`LICENSE`](./LICENSE)。
