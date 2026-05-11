import { DashboardWidgets } from "./widgets_all";

export function SectorView({ data, onDrillDown }: { data: any, onDrillDown: (filters: any) => void }) {
  return <DashboardWidgets data={data} onDrillDown={onDrillDown} />;
}
