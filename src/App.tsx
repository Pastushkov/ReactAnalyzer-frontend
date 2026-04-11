import MonacoEditor from "./components/MonacoEditor";
import IssuePanel from "./components/IssuePanel";
import AnalysisHistory from "./components/AnalysisHistory";

function App() {
  return (
    <div className="h-screen">
      <div className="flex justify-between h-[80%]">
        <div className="border w-full p-3">
          <MonacoEditor />
        </div>
        <div className="border w-full p-3">
          <IssuePanel />
        </div>
      </div>
      <div className="h-[20%]">
        <div className="border p-3 w-full h-full overflow-auto">
          <AnalysisHistory />
        </div>
      </div>
    </div>
  );
}

export default App;
