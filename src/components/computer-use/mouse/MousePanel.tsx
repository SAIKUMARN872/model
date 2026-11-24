import {
  MousePointer2,
  MousePointerClick,
  Move,
} from "lucide-react";

import Section from "../shared/Section";
import ActionButton from "../shared/ActionButton";

type MousePanelProps = {
  position: {
    x: number;
    y: number;
  };
  runAction: (action: string) => void;
};

export default function MousePanel({
  position,
  runAction,
}: MousePanelProps) {
  return (
    <Section
      title="Mouse Control"
      description="Control pointer movement and mouse interactions."
    >
      <div className="mb-5 flex flex-wrap gap-2">
        <ActionButton
          icon={MousePointer2}
          label="Move"
          onClick={() => runAction("Move")}
        />

        <ActionButton
          icon={MousePointerClick}
          label="Click"
          onClick={() => runAction("Click")}
        />

        <ActionButton
          icon={MousePointerClick}
          label="Double Click"
          onClick={() => runAction("Double Click")}
        />

        <ActionButton
          icon={MousePointer2}
          label="Right Click"
          onClick={() => runAction("Right Click")}
        />

        <ActionButton
          icon={Move}
          label="Drag & Drop"
          onClick={() => runAction("Drag & Drop")}
        />
      </div>

      <div className="relative h-80 rounded-xl border border-slate-200 bg-slate-50">
        <div
          className="absolute flex h-6 w-6 items-center justify-center text-slate-900 transition-all"
          style={{
            left: `${Math.min(position.x / 5, 90)}%`,
            top: `${Math.min(position.y / 4, 75)}%`,
          }}
        >
          <MousePointer2 size={22} />
        </div>

        <div className="absolute bottom-4 left-4 rounded-lg bg-white px-3 py-2 text-xs shadow-sm">
          Mouse position: {position.x}, {position.y}
        </div>
      </div>
    </Section>
  );
}