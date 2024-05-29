import React, { useRef, useEffect } from "react";
import { useDrag } from "react-dnd";
import { Card } from "antd";

interface ClipProps {
  id: string;
  startTime: number;
  endTime: number;
  onUpdate: (updatedClip: {
    id: string;
    startTime: number;
    endTime: number;
  }) => void;
  timelineRef: React.RefObject<HTMLDivElement>;
}

const Clip: React.FC<ClipProps> = ({
  id,
  startTime,
  endTime,
  onUpdate,
  timelineRef,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [, drag] = useDrag(/* ... */); // 省略了useDrag的具体实现，因为它与上面的示例类似

  useEffect(() => {
    if (ref.current) {
      drag(ref.current);
    }
    return () => {
      // 清理函数（如果需要的话）
    };
  }, [drag, id, startTime, endTime]);

  return (
    <Card
      ref={ref}
      title={`Clip ${id} (${startTime}-${endTime})`}
      className="timeline-clip"
      // ...其他props，例如可拖动样式等
    >
      {/* 剪辑的内容，例如标题、时间等 */}
      <p>Clip Content</p>
    </Card>
  );
};

export default Clip;
