import MonacoEditor from "./components/MonacoEditor";
import IssuePanel from "./components/IssuePanel";
import AnalysisHistory from "./components/AnalysisHistory";
import Drawer from "./components/Drawer";
import { useState } from "react";
import { History } from "lucide-react";

function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="h-screen">
      <div className="w-full h-10 flex justify-end items-center p-3 border-b">
        <History
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className="cursor-pointer hover:bg-gray-200 p-1 rounded-2xl"
        />
      </div>
      <div className="flex justify-between h-[calc(100%-40px)]">
        <div className="w-[40%] p-3">
          <MonacoEditor />
        </div>
        <div className="border-l w-[60%] p-3 ">
          <IssuePanel />
        </div>
      </div>
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="History"
      >
        <AnalysisHistory />
      </Drawer>
    </div>
  );
}

export default App;
