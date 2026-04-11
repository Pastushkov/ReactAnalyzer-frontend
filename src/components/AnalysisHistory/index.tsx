import { useEffect, useState } from "react";
import { AnalysisService } from "../../services/AnalysisService";

interface AnalysisListItem {
  id: number;
  created_at: string;
  issues_count: number;
}

async function loadAnalysisHistory(): Promise<AnalysisListItem[]> {
  const { data } = await AnalysisService.fetchAnalysisHistory();
  return data;
}

const AnalysisHistory = () => {
  const [list, setList] = useState<AnalysisListItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    void loadAnalysisHistory().then((data) => {
      if (!cancelled) {
        setList(data);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      AnalysisHistory
      <ul>
        {list.length === 0 ? (
          <li>No data</li>
        ) : (
          list.map((item) => (
            <li key={item.id}>
              {item.created_at} — issues: {item.issues_count}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default AnalysisHistory;
