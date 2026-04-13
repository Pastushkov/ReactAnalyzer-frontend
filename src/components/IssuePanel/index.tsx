import { useState } from "react";
// Переконайся, що імпорти відповідають твоїй структурі
import { AnalysisService } from "../../services/AnalysisService";
import { useRootContext } from "../../state/rootContext";
import { DEFAULTVALUECODE } from "../MonacoEditor";
import { DependencyGraph } from "../Graph/DependencyGraph";

// 1. Оновлено інтерфейс під нову структуру з AST-парсера
interface AnalysisIssue {
  type: string;
  title: string;
  explanation: string;
  suggestion: string;
  line: number;
}

interface AnalysisPayload {
  issues: AnalysisIssue[];
  graph: Record<string, unknown>;
  extracted_data?: Record<string, unknown>; // Додано на майбутнє
}

interface AnalysisResponse {
  id: number;
  created_at: string;
  issues_count: number;
  code_content: string;
  analysis_results: AnalysisPayload;
}

/** Card colors by issue severity (warning / error / default). */
function issueStyles(type: string): string {
  const t = type.toLowerCase();
  if (t === "error") {
    return "border-rose-200 bg-rose-50 text-rose-900";
  }
  if (t === "warning") {
    return "border-amber-200 bg-amber-50 text-amber-950";
  }
  return "border-sky-200 bg-sky-50 text-sky-950";
}

/** Badge colors for the issue type chip. */
function badgeStyles(type: string): string {
  const t = type.toLowerCase();
  if (t === "error") return "bg-rose-600 text-white";
  if (t === "warning") return "bg-amber-500 text-white";
  return "bg-sky-600 text-white";
}

const IssuePanel = () => {
  const {
    state: { code },
  } = useRootContext();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setError(null);
    try {
      setLoading(true);
      const { data } = await AnalysisService.analyzeCode(
        code || DEFAULTVALUECODE,
      );
      setResult(data as AnalysisResponse);
    } catch (e) {
      console.error(e);
      setResult(null);
      setError("Analysis failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Перевірка наявності графа
  const graphKeys = result
    ? Object.keys(result.analysis_results.graph ?? {})
    : [];
  const hasGraph =
    graphKeys.length > 0 &&
    JSON.stringify(result?.analysis_results.graph) !== "{}";

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <button
        type="button"
        className="shrink-0 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        onClick={handleAnalyze}
        disabled={loading}
      >
        {loading ? "Analyzing…" : "Analyze Code"}
      </button>

      {error && (
        <div
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
          role="alert"
        >
          {error}
        </div>
      )}

      {result && (
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
          <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 pb-3">
            <h2 className="text-lg font-semibold text-slate-900">
              Analysis result{" "}
              <span className="font-mono text-base text-slate-600">
                #{result.id}
              </span>
            </h2>
            <time
              className="text-sm text-slate-500"
              dateTime={result.created_at}
            >
              {new Date(result.created_at).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </time>
          </header>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
              Issues reported: {result.issues_count}
            </span>
          </div>

          {/* Секція Issues з оновленою структурою */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Issues
            </h3>
            {result.analysis_results.issues.length === 0 ? (
              <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                No issues found. Your code looks great!
              </p>
            ) : (
              <ul className="space-y-3">
                {result.analysis_results.issues.map((issue, i) => (
                  <li
                    key={`${issue.type}-${i}`}
                    className={`rounded-lg border px-3 py-3 text-sm shadow-sm flex flex-col gap-2 ${issueStyles(
                      issue.type,
                    )}`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badgeStyles(
                          issue.type,
                        )}`}
                      >
                        {issue.type}
                      </span>
                      {/* Відображення рядка, де знайдено проблему */}
                      <span className="text-xs font-mono opacity-70 font-semibold">
                        Line: {issue.line}
                      </span>
                    </div>

                    <h4 className="font-semibold text-base leading-tight">
                      {issue.title}
                    </h4>

                    <p className="leading-relaxed opacity-90">
                      {issue.explanation}
                    </p>

                    {/* Виділений блок для пропозиції (Suggestion) */}
                    <div className="mt-1 rounded bg-white/40 p-2 text-xs border-l-2 border-current">
                      <span className="font-semibold uppercase tracking-wide opacity-80 block mb-1">
                        Suggestion
                      </span>
                      {issue.suggestion}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-2 flex-1 flex flex-col min-h-[400px]">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Graph Visualization
            </h3>
            {hasGraph ? (
              <DependencyGraph
                nodes={(result.analysis_results.graph as any).nodes || []}
                edges={(result.analysis_results.graph as any).edges || []}
              />
            ) : (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">
                No graph data yet, or the graph is empty.
              </p>
            )}
          </section>
        </div>
      )}

      {!result && !loading && !error && (
        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg">
          <p className="text-sm text-slate-500 max-w-xs text-center">
            Click <strong>Analyze Code</strong> to run AST and AI checks, and
            generate a dependency graph.
          </p>
        </div>
      )}
    </div>
  );
};

export default IssuePanel;
