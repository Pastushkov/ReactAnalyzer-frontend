import { useState } from "react";
import { AnalysisService } from "../../services/AnalysisService";
import { useRootContext } from "../../state/rootContext";

interface AnalysisIssue {
  type: string;
  msg: string;
}

interface AnalysisPayload {
  issues: AnalysisIssue[];
  graph: Record<string, unknown>;
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
      const { data } = await AnalysisService.analyzeCode(code);
      setResult(data as AnalysisResponse);
    } catch (e) {
      console.error(e);
      setResult(null);
      setError(
        "Analysis failed. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Non-empty graph object (ignore `{}` placeholder from API).
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
        {loading ? "Analyzing…" : "Analyze"}
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

          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Issues
            </h3>
            <ul className="space-y-2">
              {result.analysis_results.issues.map((issue, i) => (
                <li
                  key={`${issue.type}-${i}`}
                  className={`rounded-lg border px-3 py-2.5 text-sm shadow-sm ${issueStyles(issue.type)}`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badgeStyles(issue.type)}`}
                    >
                      {issue.type}
                    </span>
                  </div>
                  <p className="leading-relaxed">{issue.msg}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Code
            </h3>
            <pre className="max-h-56 overflow-auto rounded-lg border border-slate-200 bg-slate-950 p-3 text-xs leading-relaxed text-slate-100 shadow-inner">
              <code className="font-mono whitespace-pre-wrap">
                {result.code_content}
              </code>
            </pre>
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Graph
            </h3>
            {hasGraph ? (
              <pre className="max-h-40 overflow-auto rounded-lg border border-slate-200 bg-white p-3 text-xs font-mono text-slate-800 shadow-sm">
                {JSON.stringify(result.analysis_results.graph, null, 2)}
              </pre>
            ) : (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">
                No graph data yet, or the graph is empty.
              </p>
            )}
          </section>
        </div>
      )}

      {!result && !loading && !error && (
        <p className="text-sm text-slate-500">
          Run Analyze to see issues, submitted code, and graph output here.
        </p>
      )}
    </div>
  );
};

export default IssuePanel;
