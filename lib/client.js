window.__ModuleLoader__.load({
	id: "dsh-ai-solution-council",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/council-node.ts
		function locationOf(context) {
			return context.start?.location ?? context.matches[0]?.location ?? { kind: "unresolved" };
		}
		function toChatData(state) {
			return {
				task: state.task,
				status: state.status,
				stage: state.stage,
				explorers: state.explorers,
				completed: state.completed,
				total: state.total,
				updatedAt: state.updatedAt,
				...state.review === void 0 ? {} : { review: state.review },
				...state.verification === void 0 ? {} : { verification: state.verification },
				...state.final === void 0 ? {} : { final: state.final }
			};
		}
		function completedCount(explorers) {
			return explorers.filter((item) => item.status === "completed").length;
		}
		const councilRunDefinition = {
			kind: "council-run",
			target: "chat",
			match: (event) => {
				if (event.type === "council/run-start") return {
					id: event.data.runId,
					role: "start"
				};
				if (event.type === "council/run-update") return {
					id: event.data.runId,
					role: "update"
				};
				return null;
			},
			start: (_context, match) => {
				if (match.event.type !== "council/run-start") throw new Error("council-run start requires council/run-start");
				const data = match.event.data;
				const explorers = data.explorers.map((item) => ({
					id: item.id,
					label: item.label,
					status: "queued",
					evidence: [],
					concerns: []
				}));
				return {
					runId: data.runId,
					callId: data.callId,
					task: data.task,
					explorers,
					completed: 0,
					total: explorers.length,
					status: "queued",
					stage: "queued",
					createdAt: data.createdAt,
					updatedAt: data.createdAt
				};
			},
			update: (context, match) => {
				if (match.event.type !== "council/run-update" || context.state === void 0) return context.state;
				const data = match.event.data;
				return {
					...context.state,
					status: data.status,
					stage: data.stage,
					explorers: data.explorers,
					completed: completedCount(data.explorers),
					total: data.explorers.length,
					updatedAt: data.updatedAt,
					...data.review === void 0 ? {} : { review: data.review },
					...data.verification === void 0 ? {} : { verification: data.verification },
					...data.final === void 0 ? {} : { final: data.final }
				};
			},
			publication: (match) => match.event.type === "council/run-update" ? "animation-frame" : "immediate",
			buildViewNode: (context) => {
				if (context.state === void 0) return null;
				return {
					key: context.key,
					kind: "council-run",
					id: context.id,
					target: "chat",
					anchorSeq: context.start?.event.seq ?? context.matches[0]?.event.seq ?? 0,
					location: locationOf(context),
					visibility: "visible",
					data: toChatData(context.state)
				};
			}
		};
		//#endregion
		//#region \0dsh-css:C:\Users\Administrator\Desktop\Learn\dsh-ai-solution-council\src\client\solution-council.module.css.mjs
		const css = "._73DoGq_toolRoot{min-width:0;display:block}._73DoGq_toolButton{width:100%;min-width:0;color:var(--dsw-alias-label-secondary);cursor:pointer;font:var(--dsw-font-xs-13);text-align:left;background:0 0;border:0;align-items:center;gap:7px;padding:5px 0;display:flex}._73DoGq_toolButton:hover{color:var(--dsw-alias-label-primary)}._73DoGq_toolMark{border:1px solid var(--dsw-alias-border-l2);width:16px;height:16px;color:var(--dsw-alias-label-secondary);letter-spacing:-.04em;border-radius:4px;flex:none;place-items:center;font-size:8px;font-weight:600;display:inline-grid}._73DoGq_toolTitle{color:var(--dsw-alias-label-primary);flex:none;font-weight:600}._73DoGq_toolSeparator{color:var(--dsw-alias-label-tertiary);flex:none}._73DoGq_toolSummary{text-overflow:ellipsis;white-space:nowrap;flex:auto;min-width:0;overflow:hidden}._73DoGq_toolStatus{color:var(--dsw-alias-label-tertiary);flex:none;font-size:11px}._73DoGq_toolRoot[data-state=running] ._73DoGq_toolMark{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}._73DoGq_toolRoot[data-state=completed] ._73DoGq_toolStatus{color:var(--dsw-alias-state-business-primary)}._73DoGq_toolRoot[data-state=error] ._73DoGq_toolStatus{color:var(--dsw-alias-state-error-primary)}._73DoGq_overlay{z-index:30;pointer-events:auto;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);display:flex;position:absolute;inset:0}._73DoGq_workbench{flex-direction:column;flex:auto;min-width:0;display:flex;overflow:hidden}._73DoGq_workbenchHeader{border-bottom:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);align-items:center;gap:20px;min-height:60px;padding:0 28px;display:flex}._73DoGq_backButton,._73DoGq_stopButton{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);cursor:pointer;font:var(--dsw-font-xs-13);background:0 0;border-radius:7px}._73DoGq_backButton{padding:7px 10px}._73DoGq_backButton:hover,._73DoGq_stopButton:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}._73DoGq_headerTitle{align-items:baseline;gap:9px;min-width:0;display:flex}._73DoGq_headerTitle h1{margin:0;font-size:16px;font-weight:600}._73DoGq_headerActions{align-items:center;gap:12px;margin-left:auto;display:flex}._73DoGq_headerStatus{color:var(--dsw-alias-label-tertiary);font-size:12px}._73DoGq_headerStatus[data-status=completed]{color:var(--dsw-alias-state-business-primary)}._73DoGq_headerStatus[data-status=failed],._73DoGq_headerStatus[data-status=cancelled]{color:var(--dsw-alias-state-error-primary)}._73DoGq_stopButton{padding:7px 10px}._73DoGq_eyebrow{color:var(--dsw-alias-label-tertiary);letter-spacing:.08em;text-transform:uppercase;font-size:11px;font-weight:600}._73DoGq_workbenchBody{flex:auto;min-height:0;padding:34px 42px 56px;overflow:auto}._73DoGq_taskBlock,._73DoGq_columns{width:min(1880px,100%);margin:0 auto}._73DoGq_taskBlock h2{max-width:760px;margin:8px 0 7px;font-size:26px;font-weight:650;line-height:1.25}._73DoGq_meta,._73DoGq_muted{color:var(--dsw-alias-label-tertiary);font-size:12px}._73DoGq_phaseBar{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:9px;grid-template-columns:repeat(4,minmax(0,1fr));width:min(1880px,100%);margin:28px auto 26px;display:grid;overflow:hidden}._73DoGq_phase{border-right:1px solid var(--dsw-alias-border-l2);min-width:0;color:var(--dsw-alias-label-tertiary);align-items:center;gap:9px;padding:13px 15px;font-size:12px;display:flex}._73DoGq_phase:last-child{border-right:0}._73DoGq_phase[data-active=true]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}._73DoGq_phase[data-done=true]{color:var(--dsw-alias-state-business-primary)}._73DoGq_phaseIndex{border:1px solid var(--dsw-alias-border-l2);border-radius:50%;flex:none;place-items:center;width:20px;height:20px;font-size:11px;display:inline-grid}._73DoGq_columns{display:block}._73DoGq_mainColumn{min-width:0}._73DoGq_sideColumn{min-width:0;margin-top:20px}._73DoGq_sectionHeading{justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:12px;display:flex}._73DoGq_sectionHeading h2,._73DoGq_reportSection h3,._73DoGq_finalCard h2{margin:0;font-size:15px;font-weight:600}._73DoGq_sectionHeading span{color:var(--dsw-alias-label-tertiary);font-size:12px}._73DoGq_explorerGrid{grid-template-columns:repeat(4,minmax(0,1fr));align-items:start;gap:10px;display:grid}._73DoGq_explorerCard,._73DoGq_reportSection,._73DoGq_finalCard{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:9px}._73DoGq_explorerCard{flex-direction:column;min-width:0;padding:12px;display:flex}._73DoGq_explorerCard[data-state=running]{border-color:var(--dsw-alias-brand-primary)}._73DoGq_explorerCard[data-state=completed] ._73DoGq_explorerTop span{color:var(--dsw-alias-state-business-primary)}._73DoGq_explorerCard[data-state=failed] ._73DoGq_explorerTop span{color:var(--dsw-alias-state-error-primary)}._73DoGq_explorerTop{justify-content:space-between;align-items:center;gap:8px;font-size:12px;display:flex}._73DoGq_explorerTop span{color:var(--dsw-alias-label-tertiary);font-size:11px}._73DoGq_explorerLabel{color:var(--dsw-alias-label-secondary);margin-top:8px;font-size:12px}._73DoGq_explorerMetrics{border-top:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-tertiary);gap:12px;margin-top:11px;padding-top:9px;font-size:11px;display:flex}._73DoGq_explorerMetrics strong{color:var(--dsw-alias-label-secondary);font-weight:600}._73DoGq_evidenceLine,._73DoGq_errorLine{border-top:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-tertiary);margin-top:9px;padding-top:8px;font-size:11px;line-height:1.45}._73DoGq_errorLine{color:var(--dsw-alias-state-error-primary)}._73DoGq_reportSection{margin-top:18px;padding:15px}._73DoGq_reportSummary{color:var(--dsw-alias-label-secondary);margin:10px 0 0;font-size:13px;line-height:1.6}._73DoGq_reportList{gap:6px;margin-top:13px;display:grid}._73DoGq_listLabel{color:var(--dsw-alias-label-tertiary);font-size:11px;font-weight:600}._73DoGq_listItem{border-left:2px solid var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-secondary);padding-left:10px;font-size:12px;line-height:1.5}._73DoGq_finalCard{background:var(--dsw-alias-bg-layer-2);padding:18px 20px;position:static}._73DoGq_finalCard h2{margin-top:10px;font-size:17px;line-height:1.45}._73DoGq_finalCard p{color:var(--dsw-alias-label-secondary);margin:12px 0 0;font-size:13px;line-height:1.6}._73DoGq_markdownDisclosure{min-width:0;margin-top:10px}._73DoGq_disclosureButton{border:0;border-top:1px solid var(--dsw-alias-border-l2);width:100%;color:var(--dsw-alias-label-secondary);cursor:pointer;font:var(--dsw-font-xs-13);text-align:left;background:0 0;justify-content:space-between;align-items:center;gap:12px;padding:7px 0;display:flex}._73DoGq_disclosureButton:hover{color:var(--dsw-alias-label-primary)}._73DoGq_disclosureButton:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}._73DoGq_disclosureTitle{text-overflow:ellipsis;min-width:0;font-weight:600;overflow:hidden}._73DoGq_disclosureAction{color:var(--dsw-alias-label-tertiary);flex:none;font-size:11px}._73DoGq_markdownPreview{min-height:42px;color:var(--dsw-alias-label-secondary);-webkit-line-clamp:3;-webkit-box-orient:vertical;font-size:12px;line-height:1.55;display:-webkit-box;overflow:hidden}._73DoGq_markdownPending{min-height:42px;color:var(--dsw-alias-label-tertiary);margin-top:10px;font-size:12px;line-height:1.55}._73DoGq_markdownViewport{box-sizing:border-box;border-top:1px solid var(--dsw-alias-border-l2);overscroll-behavior:contain;height:420px;margin-top:2px;padding:9px 5px 9px 0;overflow:auto}._73DoGq_markdownViewportLarge{height:480px}._73DoGq_markdownViewport>div{overflow-wrap:anywhere;min-width:0;color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xs-13);line-height:1.55}._73DoGq_markdownViewport>div h1{color:var(--dsw-alias-label-primary);font:600 15px/21px var(--dsw-font-family)}._73DoGq_markdownViewport>div h2{color:var(--dsw-alias-label-primary);font:600 14px/20px var(--dsw-font-family)}._73DoGq_markdownViewport>div :where(h3,h4,h5,h6){color:var(--dsw-alias-label-primary);font:600 13px/19px var(--dsw-font-family)}._73DoGq_markdownViewport :where(p,ul,ol,pre,blockquote){margin:8px 0}._73DoGq_markdownViewport :where(ul,ol){padding-left:18px}._73DoGq_markdownViewport :where(li){margin-top:4px}._73DoGq_markdownViewport :where(pre){max-width:100%;overflow:auto}._73DoGq_markdownViewport :where(code){overflow-wrap:anywhere}._73DoGq_markdownViewport :where(p:first-child,ul:first-child,ol:first-child,pre:first-child,blockquote:first-child){margin-top:0}._73DoGq_markdownViewport :where(p:last-child,ul:last-child,ol:last-child,pre:last-child,blockquote:last-child){margin-bottom:0}._73DoGq_loading{width:min(1880px,100%);color:var(--dsw-alias-label-tertiary);margin:40px auto;font-size:13px}._73DoGq_error{border:1px solid var(--dsw-alias-state-error-primary);width:min(1880px,100%);color:var(--dsw-alias-state-error-primary);border-radius:8px;margin:28px auto;padding:11px 13px;font-size:12px}@media (width<=1280px){._73DoGq_explorerGrid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media (width<=860px){._73DoGq_workbenchHeader{padding:0 16px}._73DoGq_workbenchBody{padding:24px 18px 40px}._73DoGq_columns{grid-template-columns:1fr}._73DoGq_sideColumn{order:-1}._73DoGq_finalCard{position:static}}@media (width<=600px){._73DoGq_phaseBar{grid-template-columns:repeat(2,minmax(0,1fr))}._73DoGq_phase:nth-child(2){border-right:0}._73DoGq_phase:nth-child(-n+2){border-bottom:1px solid var(--dsw-alias-border-l2)}._73DoGq_explorerGrid{grid-template-columns:1fr}._73DoGq_taskBlock h2{font-size:21px}._73DoGq_headerStatus{display:none}}";
		const tagId = "dsh-ai-solution-council/solution-council.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-ai-solution-council";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var solution_council_module_css_default = {
			"toolSummary": "_73DoGq_toolSummary",
			"toolTitle": "_73DoGq_toolTitle",
			"sideColumn": "_73DoGq_sideColumn",
			"sectionHeading": "_73DoGq_sectionHeading",
			"phaseBar": "_73DoGq_phaseBar",
			"finalCard": "_73DoGq_finalCard",
			"loading": "_73DoGq_loading",
			"workbenchHeader": "_73DoGq_workbenchHeader",
			"eyebrow": "_73DoGq_eyebrow",
			"markdownDisclosure": "_73DoGq_markdownDisclosure",
			"markdownViewportLarge": "_73DoGq_markdownViewportLarge",
			"toolMark": "_73DoGq_toolMark",
			"listLabel": "_73DoGq_listLabel",
			"markdownPending": "_73DoGq_markdownPending",
			"explorerMetrics": "_73DoGq_explorerMetrics",
			"reportSection": "_73DoGq_reportSection",
			"stopButton": "_73DoGq_stopButton",
			"phaseIndex": "_73DoGq_phaseIndex",
			"muted": "_73DoGq_muted",
			"headerTitle": "_73DoGq_headerTitle",
			"headerStatus": "_73DoGq_headerStatus",
			"overlay": "_73DoGq_overlay",
			"explorerCard": "_73DoGq_explorerCard",
			"evidenceLine": "_73DoGq_evidenceLine",
			"reportList": "_73DoGq_reportList",
			"toolStatus": "_73DoGq_toolStatus",
			"listItem": "_73DoGq_listItem",
			"meta": "_73DoGq_meta",
			"explorerTop": "_73DoGq_explorerTop",
			"markdownViewport": "_73DoGq_markdownViewport",
			"taskBlock": "_73DoGq_taskBlock",
			"disclosureTitle": "_73DoGq_disclosureTitle",
			"columns": "_73DoGq_columns",
			"backButton": "_73DoGq_backButton",
			"errorLine": "_73DoGq_errorLine",
			"reportSummary": "_73DoGq_reportSummary",
			"mainColumn": "_73DoGq_mainColumn",
			"phase": "_73DoGq_phase",
			"explorerGrid": "_73DoGq_explorerGrid",
			"toolRoot": "_73DoGq_toolRoot",
			"explorerLabel": "_73DoGq_explorerLabel",
			"disclosureButton": "_73DoGq_disclosureButton",
			"headerActions": "_73DoGq_headerActions",
			"markdownPreview": "_73DoGq_markdownPreview",
			"workbench": "_73DoGq_workbench",
			"disclosureAction": "_73DoGq_disclosureAction",
			"toolSeparator": "_73DoGq_toolSeparator",
			"error": "_73DoGq_error",
			"toolButton": "_73DoGq_toolButton",
			"workbenchBody": "_73DoGq_workbenchBody"
		};
		//#endregion
		//#region src/client/MarkdownDisclosure.tsx
		function plainPreview(text, fallback) {
			return (0, _deepseek_ai_dsh_client_ui_primitives.extractMarkdownPlainText)(text, { mode: "first-paragraph" }).trim() || fallback;
		}
		/** Structured model output can contain escaped line breaks; Markdown needs real ones. */
		function normalizeMarkdown(text) {
			return text.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\\t/g, "	");
		}
		/** A bounded Markdown panel: readable preview when closed, scrollable body when open. */
		function MarkdownDisclosure({ title, text, preview, expandLabel, collapseLabel, defaultOpen = false, size = "compact" }) {
			const [open, setOpen] = (0, react.useState)(defaultOpen);
			const renderedText = normalizeMarkdown(text);
			const renderedPreview = preview === void 0 ? void 0 : normalizeMarkdown(preview);
			const hasContent = renderedText.trim().length > 0;
			const viewportClass = size === "large" ? `${solution_council_module_css_default.markdownViewport} ${solution_council_module_css_default.markdownViewportLarge}` : solution_council_module_css_default.markdownViewport;
			if (!hasContent) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: solution_council_module_css_default.markdownPending,
				children: preview
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: solution_council_module_css_default.markdownDisclosure,
				"data-open": open || void 0,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: solution_council_module_css_default.disclosureButton,
					"aria-expanded": open,
					onClick: () => {
						setOpen((value) => !value);
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: solution_council_module_css_default.disclosureTitle,
						children: title
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: solution_council_module_css_default.disclosureAction,
						children: open ? collapseLabel : expandLabel
					})]
				}), open ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: viewportClass,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, { text: renderedText })
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: solution_council_module_css_default.markdownPreview,
					children: renderedPreview ?? plainPreview(renderedText, title)
				})]
			});
		}
		//#endregion
		//#region src/client/CouncilRunCard.tsx
		function statusLabel$1(status) {
			switch (status) {
				case "running": return "进行中";
				case "completed": return "已完成";
				case "failed": return "未完成";
				case "cancelled": return "已取消";
				default: return "排队中";
			}
		}
		function stageLabel$1(stage) {
			switch (stage) {
				case "exploring": return "并行探索";
				case "reviewing": return "交叉评审";
				case "verifying": return "证据核验";
				case "synthesizing": return "最终方案";
				case "completed": return "已完成";
				case "failed": return "未完成";
				case "cancelled": return "已取消";
				default: return "排队中";
			}
		}
		function listMarkdown$1(title, items) {
			return items.length === 0 ? "" : `### ${title}\n\n${items.map((item) => `- ${item}`).join("\n")}`;
		}
		function reportMarkdown$1(report) {
			return [
				report.summary,
				listMarkdown$1("证据", report.evidence),
				listMarkdown$1("待确认", report.concerns)
			].filter(Boolean).join("\n\n");
		}
		function explorerMarkdown$1(explorer) {
			return [
				explorer.summary ?? "",
				listMarkdown$1("证据", explorer.evidence),
				listMarkdown$1("待确认", explorer.concerns)
			].filter(Boolean).join("\n\n");
		}
		function finalMarkdown$1(final) {
			return [
				`## ${final.recommendation}`,
				`### 判断依据\n\n${final.rationale}`,
				listMarkdown$1("待确认", final.unresolvedConcerns)
			].filter(Boolean).join("\n\n");
		}
		/** Compact expandable progress card rendered directly in the conversation. */
		function CouncilRunCard({ node }) {
			const data = node.data;
			const active = data.status === "running" || data.status === "queued";
			const phases = [
				["exploring", "并行探索"],
				["reviewing", "交叉评审"],
				["verifying", "证据核验"],
				["synthesizing", "最终方案"]
			];
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: solution_council_module_css_default.taskBlock,
				"data-council-run": true,
				"data-status": data.status,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: solution_council_module_css_default.workbenchHeader,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: solution_council_module_css_default.headerTitle,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: solution_council_module_css_default.eyebrow,
								children: "AI 方案团"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: data.task })]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: solution_council_module_css_default.headerActions,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: solution_council_module_css_default.headerStatus,
								"data-status": data.status,
								children: stageLabel$1(data.stage)
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: solution_council_module_css_default.meta,
								children: [
									data.completed,
									" / ",
									data.total,
									" · ",
									statusLabel$1(data.status)
								]
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
						className: solution_council_module_css_default.phaseBar,
						"aria-label": "方案团阶段",
						children: phases.map(([key, label], index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: solution_council_module_css_default.phase,
							"data-active": data.stage === key || data.stage === "completed" && index === 3 || void 0,
							"data-done": data.stage === "completed" || index < phases.findIndex((p) => p[0] === data.stage) || void 0,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: solution_council_module_css_default.phaseIndex,
								children: index + 1
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: label })]
						}, key))
					}),
					!active && data.final !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: solution_council_module_css_default.finalCard,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: solution_council_module_css_default.eyebrow,
							children: "最终方案"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MarkdownDisclosure, {
							title: "报告内容",
							text: finalMarkdown$1(data.final),
							preview: data.final.recommendation,
							expandLabel: "展开",
							collapseLabel: "收起",
							defaultOpen: true,
							size: "large"
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: solution_council_module_css_default.mainColumn,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: solution_council_module_css_default.sectionHeading,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "并行探索" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
									data.completed,
									" / ",
									data.total,
									" 完成"
								] })]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: solution_council_module_css_default.explorerGrid,
								children: data.explorers.map((explorer) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
									className: solution_council_module_css_default.explorerCard,
									"data-state": explorer.status,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: solution_council_module_css_default.explorerTop,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: explorer.id }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: statusLabel$1(explorer.status) })]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: solution_council_module_css_default.explorerLabel,
											children: explorer.label
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: solution_council_module_css_default.explorerMetrics,
											"aria-label": "报告内容",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: explorer.evidence.length }), " 证据"] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: explorer.concerns.length }), " 待确认"] })]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(MarkdownDisclosure, {
											title: "报告内容",
											text: explorerMarkdown$1(explorer),
											preview: explorer.error ?? explorer.summary ?? "等待探索结果",
											expandLabel: "展开",
											collapseLabel: "收起"
										}),
										explorer.error !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: solution_council_module_css_default.errorLine,
											children: explorer.error
										})
									]
								}, explorer.id))
							}),
							data.review !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
								className: solution_council_module_css_default.reportSection,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "交叉评审" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MarkdownDisclosure, {
									title: "报告内容",
									text: reportMarkdown$1(data.review),
									preview: data.review.summary,
									expandLabel: "展开",
									collapseLabel: "收起"
								})]
							}),
							data.verification !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
								className: solution_council_module_css_default.reportSection,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "证据核验" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MarkdownDisclosure, {
									title: "报告内容",
									text: reportMarkdown$1(data.verification),
									preview: data.verification.summary,
									expandLabel: "展开",
									collapseLabel: "收起"
								})]
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region src/client/CouncilWorkbenchPage.tsx
		function statusLabel(status) {
			switch (status) {
				case "running": return "进行中";
				case "completed": return "已完成";
				case "failed": return "未完成";
				case "cancelled": return "已取消";
				default: return "排队中";
			}
		}
		function stageLabel(stage) {
			switch (stage) {
				case "exploring": return "并行探索";
				case "reviewing": return "交叉评审";
				case "verifying": return "证据核验";
				case "synthesizing": return "最终方案";
				case "completed": return "已完成";
				case "failed": return "未完成";
				case "cancelled": return "已取消";
				default: return "排队中";
			}
		}
		function listMarkdown(title, items) {
			return items.length === 0 ? "" : `### ${title}\n\n${items.map((item) => `- ${item}`).join("\n")}`;
		}
		function reportMarkdown(report) {
			return [
				report.summary,
				listMarkdown("证据", report.evidence),
				listMarkdown("待确认", report.concerns)
			].filter(Boolean).join("\n\n");
		}
		function explorerMarkdown(explorer) {
			return [
				explorer.summary ?? "",
				listMarkdown("证据", explorer.evidence),
				listMarkdown("待确认", explorer.concerns)
			].filter(Boolean).join("\n\n");
		}
		function finalMarkdown(final) {
			return [
				`## ${final.recommendation}`,
				`### 判断依据\n\n${final.rationale}`,
				listMarkdown("待确认", final.unresolvedConcerns)
			].filter(Boolean).join("\n\n");
		}
		function reportSection(report, title, empty) {
			if (report === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: solution_council_module_css_default.reportSection,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: title }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: solution_council_module_css_default.muted,
					children: empty
				})]
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: solution_council_module_css_default.reportSection,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: title }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MarkdownDisclosure, {
					title: "报告内容",
					text: reportMarkdown(report),
					preview: report.summary,
					expandLabel: "展开",
					collapseLabel: "收起",
					size: "large"
				})]
			});
		}
		function CouncilWorkbenchPage({ useSession }) {
			const runs = [...useSession((state) => state.chat.nodes).values()].filter((node) => node.kind === "council-run");
			const data = runs[runs.length - 1]?.data;
			const active = data?.status === "running" || data?.status === "queued";
			const phases = [
				["exploring", "并行探索"],
				["reviewing", "交叉评审"],
				["verifying", "证据核验"],
				["synthesizing", "最终方案"]
			];
			if (data === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: solution_council_module_css_default.workbench,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: solution_council_module_css_default.workbenchBody,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: solution_council_module_css_default.loading,
						children: "暂无方案团数据。运行一次方案团后，这里会展示完整工作台。"
					})
				})
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: solution_council_module_css_default.workbench,
				"data-council-workbench": true,
				"data-status": data.status,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
					className: solution_council_module_css_default.workbenchHeader,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: solution_council_module_css_default.headerTitle,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: solution_council_module_css_default.eyebrow,
							children: "AI 方案团 · 工作台"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", { children: data.task })]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: solution_council_module_css_default.headerActions,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: solution_council_module_css_default.headerStatus,
							"data-status": data.status,
							children: stageLabel(data.stage)
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: solution_council_module_css_default.meta,
							children: [
								data.completed,
								" / ",
								data.total,
								" · ",
								statusLabel(data.status)
							]
						})]
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("main", {
					className: solution_council_module_css_default.workbenchBody,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: solution_council_module_css_default.taskBlock,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: solution_council_module_css_default.eyebrow,
									children: "调查问题"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: data.task }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: solution_council_module_css_default.meta,
									children: data.updatedAt
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
							className: solution_council_module_css_default.phaseBar,
							"aria-label": "方案团阶段",
							children: phases.map(([key, label], index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: solution_council_module_css_default.phase,
								"data-active": data.stage === key || data.stage === "completed" && index === 3 || void 0,
								"data-done": data.stage === "completed" || index < phases.findIndex((p) => p[0] === data.stage) || void 0,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: solution_council_module_css_default.phaseIndex,
									children: index + 1
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: label })]
							}, key))
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: solution_council_module_css_default.columns,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
								className: solution_council_module_css_default.mainColumn,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: solution_council_module_css_default.sectionHeading,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "并行探索" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
											data.completed,
											" / ",
											data.total,
											" 完成"
										] })]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: solution_council_module_css_default.explorerGrid,
										children: data.explorers.map((explorer) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
											className: solution_council_module_css_default.explorerCard,
											"data-state": explorer.status,
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													className: solution_council_module_css_default.explorerTop,
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: explorer.id }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: statusLabel(explorer.status) })]
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
													className: solution_council_module_css_default.explorerLabel,
													children: explorer.label
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													className: solution_council_module_css_default.explorerMetrics,
													"aria-label": "报告内容",
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: explorer.evidence.length }), " 证据"] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: explorer.concerns.length }), " 待确认"] })]
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)(MarkdownDisclosure, {
													title: "报告内容",
													text: explorerMarkdown(explorer),
													preview: explorer.error ?? explorer.summary ?? "等待探索结果",
													expandLabel: "展开",
													collapseLabel: "收起"
												}),
												explorer.error !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
													className: solution_council_module_css_default.errorLine,
													children: explorer.error
												})
											]
										}, explorer.id))
									}),
									reportSection(data.review, "交叉评审", active ? "评审进行中…" : "暂无交叉评审。"),
									reportSection(data.verification, "证据核验", active ? "核验进行中…" : "暂无证据核验。")
								]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("aside", {
								className: solution_council_module_css_default.sideColumn,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
									className: solution_council_module_css_default.finalCard,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: solution_council_module_css_default.eyebrow,
										children: "最终方案"
									}), data.final === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "尚未形成最终建议" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: active ? "方案团仍在运行。" : "暂无最终方案。" })] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MarkdownDisclosure, {
										title: "报告内容",
										text: finalMarkdown(data.final),
										preview: data.final.recommendation,
										expandLabel: "展开",
										collapseLabel: "收起",
										defaultOpen: true,
										size: "large"
									})]
								})
							})]
						})
					]
				})]
			});
		}
		//#endregion
		//#region src/client/locales.ts
		/** Minimal product copy for the compact tool card and workbench. */
		const zh = {
			title: "AI 方案团",
			running: "进行中",
			completed: "已完成",
			failed: "未完成",
			queued: "等待开始",
			open: "打开工作台",
			back: "返回对话",
			loading: "正在读取方案团进度…",
			empty: "暂无进度数据。",
			cancel: "停止任务",
			cancelling: "正在停止…",
			task: "调查问题",
			explorers: "并行调查",
			review: "交叉评审",
			verification: "证据核验",
			synthesis: "最终方案",
			completedCount: "{done} / {total} 完成",
			noRecommendation: "尚未形成最终建议。",
			details: "报告内容",
			expand: "展开",
			collapse: "收起",
			rationale: "判断依据",
			noEvidence: "暂无证据摘要。",
			concerns: "待确认问题",
			evidence: "证据",
			error: "方案团进度读取失败。",
			explorerSummary: "独立调查"
		};
		const en = {
			title: "AI Solution Council",
			running: "Running",
			completed: "Completed",
			failed: "Incomplete",
			queued: "Queued",
			open: "Open workbench",
			back: "Back to conversation",
			loading: "Loading council progress…",
			empty: "No progress data yet.",
			cancel: "Stop task",
			cancelling: "Stopping…",
			task: "Question",
			explorers: "Parallel investigations",
			review: "Cross-review",
			verification: "Evidence check",
			synthesis: "Final proposal",
			completedCount: "{done} / {total} complete",
			noRecommendation: "No final recommendation yet.",
			details: "Report details",
			expand: "Expand",
			collapse: "Collapse",
			rationale: "Rationale",
			noEvidence: "No evidence summary yet.",
			concerns: "Open concerns",
			evidence: "Evidence",
			error: "Failed to load council progress.",
			explorerSummary: "Independent investigation"
		};
		//#endregion
		//#region src/client/index.ts
		const NS = "solutionCouncil";
		const inject = [
			"conversationEvents",
			"slots",
			"locale"
		];
		function apply(ctx) {
			ctx.conversationEvents.register(councilRunDefinition);
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "solution-council.client.locale");
			ctx.slots.inject("conversation.chat.node", () => ctx.slots.register({
				name: "conversation.chat.node",
				key: "council-run",
				locale: NS
			}, CouncilRunCard));
			ctx.slots.inject("conversation.view", () => ctx.slots.register({
				name: "conversation.view",
				id: "council",
				order: 20,
				locale: NS,
				label: () => "方案团",
				inject: () => ({})
			}, CouncilWorkbenchPage));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map