## 01项目简介

Grok Build（命令行名 `grok`）是 SpaceXAI 的终端式 AI 编程 Agent，以全屏 TUI 运行，可理解代码库、编辑文件、执行 shell、联网检索并管理长任务。其形态有三种：

-   **交互式 TUI**——全屏、鼠标可交互的终端界面；
-   **Headless 模式**——无界面，用于脚本 / CI / 自动化；
-   **Agent 模式**——通过 Agent Client Protocol（ACP）或 stdio 嵌入编辑器 / 外部应用。

关键事实 仓库 README 明确说明：此仓库包含 `grok` CLI/TUI 与 agent runtime 的 Rust 源码，并「周期性地从 SpaceXAI 内部 monorepo 同步」。公开树仅用于源码透明与本地构建，**不接受外部 Pull Request**（见 `CONTRIBUTING.md`）。

## 02仓库与构建

构建依赖由 `rust-toolchain.toml` 固定（`rustup` 首次构建自动安装），proto 代码生成通过 `bin/protoc`（dotslash launcher）或 `PATH` 上的 `protoc` 解析。

```
cargo run -p xai-grok-pager-bin
# 发布二进制：target/release/xai-grok-pager（官方发行时命名为 grok）
cargo build -p xai-grok-pager-bin --release
# 快速校验
cargo check -p xai-grok-pager-bin
```

支持 macOS / Linux 构建宿主；Windows 为 best-effort，当前未在此树中测试。安装脚本：`curl -fsSL https://x.ai/cli/install.sh | bash`（mac/linux）或 `irm https://x.ai/cli/install.ps1 | iex`（Windows PowerShell）。

## 03Workspace 布局

仓库为 Cargo workspace，核心应用代码集中在 `crates/codegen/` 下，少量共享叶子 crate 在 `crates/common/`、`crates/build/`、`prod/mc/`。以下路径表来自仓库 README 的「Repository layout」一节。

| 路径 | 职责 |
| --- | --- |
| `crates/codegen/xai-grok-pager-bin` | 组合根（composition root）包，构建 `xai-grok-pager` 二进制 |
| `crates/codegen/xai-grok-pager` | TUI 本体：scrollback、prompt、modals、渲染 |
| `crates/codegen/xai-grok-shell` | Agent runtime + leader / stdio / headless 入口 |
| `crates/codegen/xai-grok-tools` | 工具实现（terminal、file edit、search …） |
| `crates/codegen/xai-grok-workspace` | 宿主文件系统、VCS、执行、checkpoints |
| `crates/codegen/…` | 其余 CLI crate 闭包（config、MCP、markdown、sandbox …） |
| `third_party/` | vendored 上游源码（Mermaid 渲染栈） |

## 04核心 Crate 职责（基于实际文件清单）

以下模块划分来自各 crate 的 `src/` 文件清单与 `lib.rs` 的 `pub mod` 声明，反映真实代码组织。

### xai-grok-shell（Agent runtime 核心）

`lib.rs` 暴露的模块即其能力面：

```
pub mod active_sessions;   // 活跃会话注册/发现
pub mod agent;             // agent 运行循环（run_headless / run_leader / run_stdio_agent）
pub mod auth;              // 认证（browser / API key / OIDC）
pub mod builtin;           // 启动写入 ~/.grok/ 的捆绑文件与 skills
pub mod bundle;            // 会话打包（含 git bundle 上传逻辑）
pub mod claude_import;     // Claude Code 会话/配置导入
pub mod config;            // 配置加载
pub mod leader;            // Leader 守护进程 + 客户端连接
pub mod managed_config;    // 受管（企业）配置，签名校验
pub mod mcp_doctor;        // MCP 诊断
pub mod plugin;            // 插件加载与执行
pub mod relay;             // 中继
pub mod remote;            // 远程会话
pub mod sampling;          // 采样客户端
pub mod session;           // 会话状态机
pub mod terminal;          // 终端能力
pub mod tier;              // 订阅层级
pub mod tools;             // 工具注册
pub mod upload;            // 上传
```

关键测试揭示架构意图：`test_leader_stdio_integration.rs`（131KB）、`test_subagent_orphan_reconcile.rs`（孤儿 subagent 对账）、`test_doom_loop_recovery.rs`（防呆循环恢复）、`test_leader_death_repro.rs`（leader 崩溃复现）、`test_leader_soak.rs`（leader 浸泡测试）——表明「leader 进程 + 子 agent」是高可靠设计的重心。

### xai-grok-tools（工具实现层）

| 文件 | 职责 |
| --- | --- |
| `tool_taxonomy.rs` | 与 harness 无关的工具词汇表、规范 `_meta` 信封（`x.ai/tool`）、`ToolKind` 展示名 |
| `bridge.rs` | 工具与运行时之间的桥接层（31KB） |
| `persistence.rs` | 工具结果持久化 |
| `normalization.rs` | 跨工具集的输入字段归一化到规范键 |
| `versions.rs` | 工具版本协商（35KB） |
| `retry.rs` / `attribution.rs` | 重试策略 / 归属标注 |
| `gitignore.rs` | gitignore 感知的路径过滤 |

### xai-grok-workspace（宿主与执行环境）

最大文件 `handle.rs`（402KB）承载文件/进程句柄抽象；其余覆盖信任模型（`trust.rs` 67KB、`folder_trust.rs`）、Hub 通信（`hub.rs`、`hub_server.rs` 129KB、`hub_auth.rs`）、能力声明（`capability.rs`）、守护化（`daemonize.rs`）、预览监管（`preview_supervisor.rs`）、checkpoint 恢复（`recovery.rs`）、文件系统监听（`fs_notify.rs`）。

### xai-grok-pager（TUI 渲染层）

包含 `headless.rs`（79KB，无界面执行）、`diff.rs`（50KB，差异渲染）、`diagnostics.rs`（85KB）、`pty_wrap.rs`（32KB，伪终端封装）、`mcp_cmd.rs`（38KB）、`plugin_cmd.rs`（41KB）、`tracing.rs`（35KB）、`memory_trace.rs` 等，以及 `docs/user-guide/` 22 篇用户指南。

## 05第三方 vendored

`third_party/` 仅放「位于渲染不可信模型输出路径上」的源码（Mermaid 图 → SVG），以便完整审计、固定精确源码、避免 crates.io 撤回。依赖关系：

```
xai-grok-mermaid
  └── mermaid-to-svg   (MIT, warpdotdev)
        ├── dagre_rust        (Apache-2.0)
        │     ├── graphlib_rust
        │     └── ordered_hashmap
        └── graphlib_rust     (Apache-2.0)
              └── ordered_hashmap
```

注意 常规 Cargo 依赖（tokio、serde 等）**不在** `third_party/`，经 `Cargo.lock` / crates.io 解析。完整闭包归属见根目录 `THIRD-PARTY-NOTICES`（762KB）。

## 06Harness 编排（运行时外壳）

Harness = 管理会话生命周期、工具调度、权限校验、持久化与安全的本地控制层。其编排主线由 `xai-grok-pager-bin/src/main.rs`（127KB）的入口逻辑与 `xai-grok-shell` 的 agent/leader 模块共同实现。

入口层 · main.rs (composition root)

grok TUI ·grok -p (headless) ·grok agent stdio / acp

Agent runtime · xai-grok-shell

agent 循环 →leader / relay →session 状态机 →tools 注册

执行与环境 · xai-grok-workspace + xai-grok-tools

host fs / VCS ·sandbox / trust ·MCP / plugin ·hub\_server

持久化 · ~/.grok/sessions

events.jsonlchat\_history.jsonlsummary.jsonrewind\_points.jsonl

核心编排要点：

-   **权限与安全**——写操作、危险命令（删除 / force-push 等）、对外可见操作默认需显式确认，授权范围受限于请求 scope（见 `xai-grok-pager/docs/` 权限章节）。
-   **会话持久化**——完整事件流 + rewind 点，支持过程回溯与 resume（`session.rs`、`active_sessions.rs`）。
-   **后台任务**——长进程 / 监控经 `BackgroundTaskAction` / `WaitTasksAction` / `KillTaskAction` 工具异步调度。
-   **Hooks / Plugins**——生命周期钩子与插件在 `plugin.rs`（78KB）、`hooks-and-plugins.md` 中定义。
-   **记忆**——跨会话知识持久化（`memory_trace.rs`、`memory_cmd.rs`）。

## 07三种入口模式

#### TUI交互式

`cargo run -p xai-grok-pager-bin` 启动全屏界面；鼠标交互、快捷键、slash 命令。

#### Headless无界面

`grok -p "..."` 用于脚本 / CI；输出可格式化；支持 `--best-of-n` 采样。

#### Agentstdio / ACP

`grok agent stdio` 或经 Agent Client Protocol 嵌入编辑器 / 外部应用。

#### SSH透传

`grok ssh` 提供 Apple Terminal 剪贴板支持的 SSH 透传。

入口分发逻辑在 `main.rs`：以 `AgentCmd` / `Command` 枚举区分 TUI、Headless、Leader 管理模式；`run_headless` / `run_leader` / `run_stdio_agent` 来自 `xai_grok_shell::agent::app`。

## 08Leader / 守护进程模型

`xai-grok-shell/src/leader.rs` 实现 Leader 守护进程：多个前端（TUI、stdio agent）通过 Unix socket 连接到单个 Leader，由 Leader 统一持有会话与后端连接。关键类型：

```
LeaderDescriptor, LeaderRegistration, LeaderCapabilities, ClientCapabilities,
ClientMode, LeaderTarget, ControlCommand, ControlPayload,
connect_or_spawn(), socket_path_for_ws_url(), leader_is_older_than()
```

-   **连接或派生**——`connect_or_spawn`：若 Leader 未运行则派生，否则复用，避免重复认证与后端连接。
-   **版本倾斜防护**——`test_leader_version_skew.rs` 校验前端与 Leader 版本兼容。
-   **崩溃恢复**——`test_leader_death_repro.rs` / `test_doom_loop_recovery.rs` 验证 Leader 死后子 agent 的对账与防呆循环退出。
-   **孤儿对账**——`test_subagent_orphan_reconcile.rs` 回收失联子 agent。

## 09Agent 架构

Agent 运行循环位于 `xai-grok-shell/src/agent/`，由 `session.rs` 状态机驱动：模型产出工具调用 → harness 执行（经 tools/workspace）→ 结果回灌上下文。主 agent 可委派 subagent 并行执行子任务。

### Agent 运行时模块（lib.rs 暴露）

-   `agent`——运行循环、配置（`agent::config::Config`）、app 入口（`run_headless` / `run_leader` / `run_stdio_agent`）。
-   `session`——单会话状态机（消息、工具调用、turn 管理）。
-   `tools`——工具注册表，向模型暴露可用工具。
-   `sampling`——采样客户端（对应 `test_sampling_client.rs` 52KB 测试）。
-   `relay` / `remote`——中继与远程会话桥接。

## 10工具分类体系（Tool Taxonomy）

`xai-grok-tools/src/tool_taxonomy.rs` 定义了与 harness 无关的规范工具词汇表。所有工具经 `x.ai/tool` 这个 `_meta` 信封标识（版本 `TOOL_META_VERSION = 1`），输入字段归一化到一套规范键（`path` / `command` / `cwd` / `pattern` …）。`ToolKind` 的展示名是纯函数，跨工具集共享（如 `read_file` 与 `Read` 同显为 `Read`）。

以下 `ToolKind` 枚举值直接从 `presentation_name()` 源码提取，是模型可见工具的真实清单：

| ToolKind | 展示名 | 类别 |
| --- | --- | --- |
| `Read`/`Edit`/`Write`/`Delete`/`Move` | Read / Edit / Write / Delete / Move | 文件 |
| `ListDir`/`List`/`Search` | List Files / Search | 导航 |
| `Lsp` | Code Intelligence | 语言服务 |
| `Execute` | Run Command | 执行 |
| `Plan`/`EnterPlan`/`ExitPlan` | Plan / Enter Plan Mode / Exit Plan Mode | 规划 |
| `WebSearch`/`WebFetch` | Web Search / Web Fetch | 检索 |
| `Task` | Subagent | 编排 |
| `Skill` | Skill | 能力包 |
| `MemorySearch`/`MemoryGet` | Memory Search / Memory Read | 记忆 |
| `AskUser` | Ask User | 交互 |
| `ImageGen`/`ImageToVideo`/`ReferenceToVideo` | Generate Image / Generate Video | 多模态生成 |
| `BackgroundTaskAction`/`WaitTasksAction`/`KillTaskAction` | Background / Wait / Kill Task | 异步任务 |
| `SearchTool`/`UseTool` | Search Tools / Use Tool | MCP 工具 |
| `Monitor`/`GoalUpdate`/`DeployApp` | Monitor / Update Goal / Deploy App | 运行/部署 |

## 11Subagent 编排

主 agent 通过 `Task`（Subagent）工具委派并行子任务。仓库 README 与 `xai-grok-shell/README.md` 的目录表明 subagent 支持：并行子会话、角色（roles）、人设（personas）。编排特征由测试佐证：

-   **孤儿对账**——`test_subagent_orphan_reconcile.rs`：Leader 对账并回收失联 subagent。
-   **隔离**——子会话可运行于独立环境，编辑需显式合并（对应本地 `isolation=worktree` 概念）。
-   **能力分级**——工具分类中的 `read-only` / `read-write` / `execute` 最小授权（见 `capability.rs`）。

## 12Skills / 插件 / Hooks

`xai-grok-shell/src/builtin.rs` 在启动时将捆绑 skills 写入 `~/.grok/skills/`。源码中硬编码的捆绑 skill（单一事实来源）：

```
const BUNDLED_SKILLS = &[
  ("help",        HELP_SKILL_MD),
  ("create-skill",CREATE_SKILL_MD),
  ("code-review", CODE_REVIEW_SKILL_MD),
  ("imagine",     IMAGINE_SKILL_MD),
  ("check-work",  CHECK_SKILL_MD),   // 亦供 headless 使用
  // BEST_OF_N_SKILL_MD 编译内置，但不作为捆绑 skill 提取
];
```

-   **Skills**——`SKILL.md` + 可选脚本的可复用提示包，作为预设 agent 子流程被加载。
-   **Plugins**——外部工具 / skill 包，由 `plugin.rs`（78KB）与 `plugin_cmd.rs` 加载执行；支持受信本地插件刷新测试（`test_trusted_local_plugin_refresh_e2e.rs`）。
-   **Hooks**——项目生命周期脚本（pre/post tool、session start 等），见 `docs/hooks-and-plugins.md`。
-   **Legacy 清理**——重命名 / 移除的 skill（`check`、`best-of-n`、`docx`、`pptx`、`xlsx`）在升级时被删除旧目录，避免残留旧 slash 命令。

## 13证据与来源

| 声明 | 证据强度 | 来源 |
| --- | --- | --- |
| 官方仓库存在及元数据（Rust / 6919★ / Apache-2.0 / main 分支） | 已确认 | `api.github.com/repos/xai-org/grok-build` 官方 API \[1\] |
| README 仓库布局、构建命令、三种形态 | 已确认 | `raw.githubusercontent.com/xai-org/grok-build/main/README.md` \[1\] |
| 核心 crate 文件清单与模块划分 | 已确认 | GitHub git tree API（递归）+ 各 crate `lib.rs` / `README.md` \[1\] |
| ToolKind 工具清单 | 已确认 | `xai-grok-tools/src/tool_taxonomy.rs` 源码 \[1\] |
| 捆绑 skills 列表 | 已确认 | `xai-grok-shell/src/builtin.rs` 源码 \[1\] |
| 文档站视觉风格（深色 / Inter / 单栏 / 侧栏） | 较可信 | `code.claude.com/docs/en/overview` 页面 HTML/CSS 结构 \[2\] |

范围与限制 本分析基于公开仓库的静态源码与文档，未运行该二进制，也未覆盖全部 100+ 子模块内部实现（如 `handle.rs` 402KB 的句柄抽象细节）。如需某一 crate（如 `leader.rs` 或 `hub_server.rs`）的逐函数深挖，可指定后进一步检索。
