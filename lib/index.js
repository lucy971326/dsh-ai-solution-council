import { randomUUID } from "node:crypto";
import { Buffer } from "node:buffer";
import { Service } from "@deepseek-ai/cordis";
import z from "@deepseek-ai/schemastery";
import { z as z$1 } from "zod";
import { defineDomain, domainTable } from "@deepseek-ai/dsh-storage-domain";
import { defineTool } from "@deepseek-ai/dsh-tools";
//#region src/solution-council.ts
/** Host-side orchestration and independent durable state for the Solution Council. */
const Config = z.object({
	explorerCount: z.number().step(1).min(2).max(8).default(4),
	providerName: z.string().default("spawn"),
	maxTaskBytes: z.number().step(1).min(128).max(Number.MAX_SAFE_INTEGER).default(16384),
	maxRunsPerSession: z.number().step(1).min(1).max(Number.MAX_SAFE_INTEGER).default(32)
});
const nonNegativeSafeInteger = z$1.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const reportSchema = z$1.object({
	summary: z$1.string(),
	evidence: z$1.array(z$1.string()),
	concerns: z$1.array(z$1.string()),
	recommendation: z$1.string().optional()
});
const explorerSchema = z$1.object({
	id: z$1.string(),
	label: z$1.string(),
	status: z$1.enum([
		"queued",
		"running",
		"completed",
		"failed"
	]),
	summary: z$1.string().optional(),
	evidence: z$1.array(z$1.string()),
	concerns: z$1.array(z$1.string()),
	childSessionId: z$1.string().optional(),
	error: z$1.string().optional()
});
const finalSchema = z$1.object({
	recommendation: z$1.string(),
	rationale: z$1.string(),
	unresolvedConcerns: z$1.array(z$1.string())
});
const councilRunSchema = z$1.object({
	runId: z$1.string(),
	callId: z$1.string(),
	sessionId: z$1.string(),
	task: z$1.string(),
	status: z$1.enum([
		"queued",
		"running",
		"completed",
		"failed",
		"cancelled"
	]),
	stage: z$1.enum([
		"queued",
		"exploring",
		"reviewing",
		"verifying",
		"synthesizing",
		"completed",
		"failed",
		"cancelled"
	]),
	explorers: z$1.array(explorerSchema),
	review: reportSchema.optional(),
	verification: reportSchema.optional(),
	final: finalSchema.optional(),
	createdAt: z$1.string(),
	updatedAt: z$1.string()
});
const sessionIdentitySchema = z$1.object({
	id: z$1.string().min(1),
	createdAt: nonNegativeSafeInteger,
	cwd: z$1.string().optional()
});
const councilRowSchema = z$1.object({
	session: sessionIdentitySchema,
	runs: z$1.array(councilRunSchema)
});
const councilDomainSpec = defineDomain({
	name: "solution_council",
	version: 0,
	tables: { sessions: domainTable(councilRowSchema) }
});
/** Raw loader entry name used by the independent bundle and local patch. */
const name = "solution-council";
/** Host capabilities required before the service can activate. */
const inject = [
	"tools",
	"storageDomain",
	"subagents"
];
const EXPLORER_PROFILES = [
	{
		id: "A1",
		label: "独立调查 1"
	},
	{
		id: "A2",
		label: "独立调查 2"
	},
	{
		id: "A3",
		label: "独立调查 3"
	},
	{
		id: "A4",
		label: "独立调查 4"
	}
];
/** Every child runs single-layer: never spawn more subagents, never recurse. */
const NO_SUBAGENT_RULE = "\n约束：你不得创建、启动或调用任何子 Agent / 子代理工具，也不得再次调用方案团工具。你只能使用当前 Agent 模式已经提供给你的只读工具独立完成任务，保持单层执行，禁止任何形式的递归。";
function formatTime() {
	return (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").replace(/\.\d{3}Z$/, " UTC");
}
function utf8Bytes(value) {
	return Buffer.byteLength(value, "utf8");
}
function sessionIdentity(header) {
	return {
		id: header.id,
		createdAt: header.createdAt,
		...header.cwd === void 0 ? {} : { cwd: header.cwd }
	};
}
function sameSession(row, header) {
	return row.session.id === header.id && row.session.createdAt === header.createdAt && row.session.cwd === header.cwd;
}
function copyReport(report) {
	return {
		summary: report.summary,
		evidence: [...report.evidence],
		concerns: [...report.concerns],
		...report.recommendation === void 0 ? {} : { recommendation: report.recommendation }
	};
}
function copyExplorer(explorer) {
	return {
		id: explorer.id,
		label: explorer.label,
		status: explorer.status,
		evidence: [...explorer.evidence],
		concerns: [...explorer.concerns],
		...explorer.summary === void 0 ? {} : { summary: explorer.summary },
		...explorer.childSessionId === void 0 ? {} : { childSessionId: explorer.childSessionId },
		...explorer.error === void 0 ? {} : { error: explorer.error }
	};
}
function copyRun(run) {
	return {
		runId: run.runId,
		callId: run.callId,
		sessionId: run.sessionId,
		task: run.task,
		status: run.status,
		stage: run.stage,
		explorers: run.explorers.map(copyExplorer),
		...run.review === void 0 ? {} : { review: copyReport(run.review) },
		...run.verification === void 0 ? {} : { verification: copyReport(run.verification) },
		...run.final === void 0 ? {} : { final: {
			recommendation: run.final.recommendation,
			rationale: run.final.rationale,
			unresolvedConcerns: [...run.final.unresolvedConcerns]
		} },
		createdAt: run.createdAt,
		updatedAt: run.updatedAt
	};
}
function reportFromUnknown(value, fallback) {
	if (typeof value === "object" && value !== null) {
		const candidate = value;
		const summary = typeof candidate.summary === "string" ? candidate.summary : fallback;
		const evidence = Array.isArray(candidate.evidence) ? candidate.evidence.filter((item) => typeof item === "string").slice(0, 12) : [];
		const concerns = Array.isArray(candidate.concerns) ? candidate.concerns.filter((item) => typeof item === "string").slice(0, 12) : [];
		const recommendation = typeof candidate.recommendation === "string" ? candidate.recommendation : void 0;
		return {
			summary,
			evidence,
			concerns,
			...recommendation === void 0 ? {} : { recommendation }
		};
	}
	return {
		summary: fallback,
		evidence: [],
		concerns: []
	};
}
function outputText(output) {
	return output.filter((block) => block.type === "text" && typeof block.text === "string").map((block) => block.text ?? "").join("\n").trim();
}
function reportFromChild(result, fallback) {
	if (result.structured !== void 0) return reportFromUnknown(result.structured, fallback);
	return reportFromUnknown({ summary: outputText(result.output) || fallback }, fallback);
}
function finalFromUnknown(value, fallback) {
	if (typeof value === "object" && value !== null) {
		const candidate = value;
		return {
			recommendation: typeof candidate.recommendation === "string" ? candidate.recommendation : fallback,
			rationale: typeof candidate.rationale === "string" ? candidate.rationale : "评审未提供额外理由。",
			unresolvedConcerns: Array.isArray(candidate.unresolvedConcerns) ? candidate.unresolvedConcerns.filter((item) => typeof item === "string").slice(0, 12) : []
		};
	}
	return {
		recommendation: fallback,
		rationale: "最终评审未返回结构化理由。",
		unresolvedConcerns: []
	};
}
function compact(value, limit = 12e3) {
	const text = JSON.stringify(value);
	return text.length <= limit ? text : `${text.slice(0, limit)}…`;
}
function requireAgent(exec) {
	if (exec.agent === void 0) throw new Error("solution council requires an owning agent session");
	return exec.agent;
}
/**
* Shared council service. The model Tool, Remote API, and Web workbench all
* read the same independent storage sidecar through this class.
*/
var SolutionCouncilService = class extends Service {
	static inject = inject;
	static Config = Config;
	explorerCount;
	providerName;
	maxTaskBytes;
	maxRunsPerSession;
	table;
	operationTails = /* @__PURE__ */ new Map();
	activeControllers = /* @__PURE__ */ new Map();
	activeTasks = /* @__PURE__ */ new Set();
	mutationAdmissionOpen = true;
	constructor(ctx, config = {
		explorerCount: 4,
		providerName: "spawn",
		maxTaskBytes: 16384,
		maxRunsPerSession: 32
	}) {
		super(ctx, "solutionCouncil");
		this.explorerCount = Math.min(EXPLORER_PROFILES.length, Math.max(2, Math.floor(config.explorerCount)));
		this.providerName = config.providerName;
		this.maxTaskBytes = config.maxTaskBytes;
		this.maxRunsPerSession = config.maxRunsPerSession;
	}
	async [Service.init]() {
		const domain = await this.ctx.storageDomain.open(councilDomainSpec);
		this.table = domain.table("sessions");
		this.ctx.effect(() => async () => {
			this.mutationAdmissionOpen = false;
			for (const controller of this.activeControllers.values()) controller.abort();
			await Promise.allSettled([...this.activeTasks]);
			await Promise.all(this.operationTails.values());
			await domain.close();
		}, "solution-council.domainClose");
		await this.recoverInterruptedRuns();
		this.registerTools();
	}
	list(agent) {
		const session = agent.session;
		return this.enqueue(session.header.id, async () => ({ runs: (this.currentRow(session)?.runs ?? []).map(copyRun) }));
	}
	getByCall(agent, callId) {
		const session = agent.session;
		return this.enqueue(session.header.id, async () => {
			const run = this.currentRow(session)?.runs.find((item) => item.callId === callId);
			return { run: run === void 0 ? null : copyRun(run) };
		});
	}
	cancel(agent, callId) {
		return this.getByCall(agent, callId).then(({ run }) => {
			if (run === null || run.status !== "running") return {
				runId: run?.runId ?? "",
				cancelled: false
			};
			this.activeControllers.get(run.runId)?.abort();
			return {
				runId: run.runId,
				cancelled: true
			};
		});
	}
	async runCouncil(agent, task, callId, signal) {
		const resolvedTask = task.trim();
		if (resolvedTask.length === 0) throw new Error("solution council task must contain a non-whitespace character");
		if (utf8Bytes(resolvedTask) > this.maxTaskBytes) throw new Error(`solution council task exceeds ${this.maxTaskBytes} UTF-8 bytes`);
		const run = await this.createRun(agent, resolvedTask, callId);
		const taskPromise = this.orchestrate(agent, run, signal);
		this.activeTasks.add(taskPromise);
		try {
			const completed = await taskPromise;
			if (completed.status === "failed") throw new Error(completed.final?.recommendation ?? "solution council failed");
			return {
				runId: completed.runId,
				status: completed.status,
				task: completed.task,
				recommendation: completed.final?.recommendation ?? "方案团没有形成最终建议。",
				explorerCount: completed.explorers.length
			};
		} finally {
			this.activeTasks.delete(taskPromise);
		}
	}
	async orchestrate(agent, initial, parentSignal) {
		const controller = new AbortController();
		const abort = () => {
			if (!controller.signal.aborted) controller.abort(parentSignal.reason);
		};
		if (parentSignal.aborted) abort();
		else parentSignal.addEventListener("abort", abort, { once: true });
		this.activeControllers.set(initial.runId, controller);
		try {
			let run = await this.updateRun(agent, initial.runId, (current) => ({
				...current,
				status: "running",
				stage: "exploring",
				explorers: current.explorers.map((item) => ({
					...item,
					status: "running"
				}))
			}));
			const profiles = EXPLORER_PROFILES.slice(0, this.explorerCount);
			const reports = await Promise.all(profiles.map(async (profile) => {
				const explorer = await this.runExplorer(agent, run.task, profile.id, profile.label, controller.signal);
				run = await this.updateRun(agent, run.runId, (current) => ({
					...current,
					explorers: current.explorers.map((item) => item.id === explorer.id ? explorer : item)
				}));
				return explorer;
			}));
			run = await this.updateRun(agent, run.runId, (current) => ({
				...current,
				stage: "reviewing"
			}));
			const review = await this.runReportAgent(agent, "交叉评审", `你是方案团的串行交叉评审者。你必须保持独立上下文，只审查下面几份同职责探索方案，指出共识、分歧、证据强弱与遗漏。必要时可以用只读工具回到代码库核验。不要复述思维过程，直接把你的评审结论以纯文本输出，不要输出 JSON、不要使用任何结构化标记。\n\n任务：${run.task}\n探索方案：${compact(reports)}`, controller.signal);
			run = await this.updateRun(agent, run.runId, (current) => ({
				...current,
				review
			}));
			run = await this.updateRun(agent, run.runId, (current) => ({
				...current,
				stage: "verifying"
			}));
			const verification = await this.runReportAgent(agent, "证据核验", `你是方案团的串行证据核验者。根据任务、探索方案和交叉评审，逐项检查关键结论是否有代码证据，标出不能确认的地方和风险。你可以使用只读工具核验代码。直接把你的核验结论以纯文本输出，不要输出 JSON、不要使用任何结构化标记。\n\n任务：${run.task}\n探索方案：${compact(reports)}\n交叉评审：${compact(review)}`, controller.signal);
			run = await this.updateRun(agent, run.runId, (current) => ({
				...current,
				verification
			}));
			run = await this.updateRun(agent, run.runId, (current) => ({
				...current,
				stage: "synthesizing"
			}));
			const final = await this.runFinalAgent(agent, `你是主 AI 的串行最终裁判。综合同职责探索方案、交叉评审和证据核验，给出一个可执行的最终方案。必须明确：建议做什么、为什么、未解决的风险是什么。不要把多数票当成真相；证据质量优先。直接把你的最终结论以纯文本输出，不要输出 JSON、不要使用任何结构化标记。\n\n任务：${run.task}\n探索方案：${compact(reports)}\n交叉评审：${compact(review)}\n证据核验：${compact(verification)}`, controller.signal);
			return await this.updateRun(agent, run.runId, (current) => ({
				...current,
				status: "completed",
				stage: "completed",
				final
			}));
		} catch (cause) {
			const cancelled = controller.signal.aborted || parentSignal.aborted;
			return this.updateRun(agent, initial.runId, (current) => cancelled ? {
				...current,
				status: "cancelled",
				stage: "cancelled"
			} : {
				...current,
				status: "failed",
				stage: "failed",
				final: {
					recommendation: `方案团执行失败：${cause instanceof Error ? cause.message : String(cause)}`,
					rationale: "编排过程未能完成。",
					unresolvedConcerns: ["需要重新执行方案团并检查失败阶段。"]
				}
			});
		} finally {
			parentSignal.removeEventListener("abort", abort);
			this.activeControllers.delete(initial.runId);
		}
	}
	async runExplorer(agent, task, id, label, signal) {
		try {
			const child = await this.startChild(agent, label, `你是一个方案团的并行独立探索者。你和其他探索者职责相同，但上下文完全隔离，必须各自独立产出一份可执行的方案。请围绕任务自行探索代码库，用当前 Agent 模式提供的代码库工具取证，验证你的方案是否可行。不要猜测、不要修改文件、不要讨论其他探索者。最后把你的方案直接以纯文本输出，不要输出 JSON、不要使用任何结构化标记。\n\n任务：${task}`, signal);
			const report = reportFromChild(child.result, `${label} 未返回有效方案。`);
			return {
				id,
				label,
				status: child.result.stopReason === "completed" ? "completed" : "failed",
				summary: report.summary,
				evidence: report.evidence,
				concerns: report.concerns,
				childSessionId: child.childSessionId,
				...child.result.stopReason === "completed" ? {} : { error: `子调查以 ${child.result.stopReason} 结束` }
			};
		} catch (cause) {
			return {
				id,
				label,
				status: "failed",
				evidence: [],
				concerns: [],
				error: cause instanceof Error ? cause.message : String(cause)
			};
		}
	}
	async runReportAgent(agent, label, prompt, signal) {
		try {
			return reportFromChild((await this.startChild(agent, label, prompt, signal)).result, `${label} 未返回有效报告。`);
		} catch (cause) {
			return {
				summary: `${label}失败：${cause instanceof Error ? cause.message : String(cause)}`,
				evidence: [],
				concerns: ["该阶段未完成，结论需要人工复核。"]
			};
		}
	}
	async runFinalAgent(agent, prompt, signal) {
		try {
			const child = await this.startChild(agent, "最终裁判", prompt, signal);
			return finalFromUnknown(child.result.structured, outputText(child.result.output) || "未形成最终建议。");
		} catch (cause) {
			return {
				recommendation: `最终裁判失败：${cause instanceof Error ? cause.message : String(cause)}`,
				rationale: "最终裁判没有完成。",
				unresolvedConcerns: ["最终方案需要人工复核。"]
			};
		}
	}
	async startChild(parent, label, prompt, signal) {
		const child = await this.ctx.subagents.start(this.providerName, {
			label,
			parent,
			signal,
			prompt: [{
				type: "text",
				text: prompt + NO_SUBAGENT_RULE
			}]
		});
		try {
			return {
				result: await child.result,
				childSessionId: String(child.id)
			};
		} finally {
			await child.dispose();
		}
	}
	async createRun(agent, task, callId) {
		const session = agent.session;
		return this.enqueue(session.header.id, async () => {
			const row = this.currentRow(session);
			const now = formatTime();
			const profiles = EXPLORER_PROFILES.slice(0, this.explorerCount);
			const run = {
				runId: randomUUID(),
				callId,
				sessionId: String(session.header.id),
				task,
				status: "queued",
				stage: "queued",
				explorers: profiles.map((profile) => ({
					id: profile.id,
					label: profile.label,
					status: "queued",
					evidence: [],
					concerns: []
				})),
				createdAt: now,
				updatedAt: now
			};
			const runs = [...row?.runs ?? [], run].slice(-this.maxRunsPerSession);
			await this.requireTable().put(session.header.id, {
				session: sessionIdentity(session.header),
				runs
			});
			try {
				agent.session.append("council/run-start", {
					runId: run.runId,
					callId: run.callId,
					task: run.task,
					explorers: profiles.map((profile) => ({
						id: profile.id,
						label: profile.label
					})),
					createdAt: run.createdAt
				});
			} catch (cause) {
				console.warn("[solution-council] append run-start failed", cause);
			}
			return copyRun(run);
		});
	}
	async updateRun(agent, runId, update) {
		const session = agent.session;
		return this.enqueue(session.header.id, async () => {
			const row = this.currentRow(session);
			const current = row?.runs.find((item) => item.runId === runId);
			if (current === void 0) throw new Error(`solution council run '${runId}' was not found`);
			const next = copyRun({
				...update(copyRun(current)),
				updatedAt: formatTime()
			});
			const runs = row.runs.map((item) => item.runId === runId ? next : item);
			await this.requireTable().put(session.header.id, {
				session: sessionIdentity(session.header),
				runs
			});
			try {
				agent.session.append("council/run-update", {
					runId: next.runId,
					status: next.status,
					stage: next.stage,
					explorers: next.explorers,
					...next.review === void 0 ? {} : { review: next.review },
					...next.verification === void 0 ? {} : { verification: next.verification },
					...next.final === void 0 ? {} : { final: next.final },
					updatedAt: next.updatedAt
				});
			} catch (cause) {
				console.warn("[solution-council] append run-update failed", cause);
			}
			return next;
		});
	}
	currentRow(session) {
		const row = this.requireTable().get(session.header.id);
		return row !== void 0 && sameSession(row, session.header) ? row : void 0;
	}
	enqueue(sessionId, operation) {
		if (!this.mutationAdmissionOpen) return Promise.reject(/* @__PURE__ */ new Error("solution council service is disposing"));
		const result = (this.operationTails.get(sessionId) ?? Promise.resolve()).then(operation);
		const tail = result.then(() => void 0, () => void 0);
		this.operationTails.set(sessionId, tail);
		return result.finally(() => {
			if (this.operationTails.get(sessionId) === tail) this.operationTails.delete(sessionId);
		});
	}
	requireTable() {
		if (this.table === void 0) throw new Error("solution council durable domain is not initialized");
		return this.table;
	}
	/** A process restart cannot resume in-process child Runs; make that visible. */
	async recoverInterruptedRuns() {
		const table = this.requireTable();
		for (const [sessionId, row] of table.entries()) {
			let changed = false;
			const runs = row.runs.map((run) => {
				if (run.status !== "queued" && run.status !== "running") return run;
				changed = true;
				return {
					...run,
					status: "failed",
					stage: "failed",
					final: {
						recommendation: "方案团在服务重启前未完成。",
						rationale: "子 Agent 运行只存在于当前进程，服务重启后无法继续原来的 Run。",
						unresolvedConcerns: ["请重新发起方案团任务。"]
					},
					updatedAt: formatTime()
				};
			});
			if (changed) await table.put(sessionId, {
				...row,
				runs
			});
		}
	}
	registerTools() {
		this.ctx.tools.register(defineTool({
			name: "solution_council",
			description: "Run several isolated same-duty investigators over the current codebase, then serially cross-review, verify evidence, and synthesize one final implementation proposal. Use for architecture or implementation decisions where one model perspective may be misleading.",
			parameters: { task: {
				type: "string",
				required: true,
				description: "The concrete question or implementation problem for the council to investigate."
			} },
			output: {
				schema: {
					type: "object",
					additionalProperties: false,
					properties: {
						runId: {
							type: "string",
							required: true
						},
						status: {
							type: "string",
							required: true
						},
						task: {
							type: "string",
							required: true
						},
						recommendation: {
							type: "string",
							required: true
						},
						explorerCount: {
							type: "integer",
							required: true
						}
					}
				},
				render: (_args, value) => [{
					type: "text",
					text: `方案团已完成：${value.recommendation}（runId: ${value.runId}）`
				}]
			},
			execute: (args, exec) => this.runCouncil(requireAgent(exec), args.task, String(exec.callId), exec.signal),
			presentCall: (args) => ({
				card: "generic",
				title: "运行 AI 方案团",
				kind: "other",
				rawInput: args
			})
		}));
	}
};
//#endregion
export { Config, SolutionCouncilService, SolutionCouncilService as default, inject, name };
