import React, { useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Row, Col, Divider } from "antd";
// import "./Timeline.css"; // 自定义样式
import Clip from "./Clip";

interface ClipData {
  id: string;
  startTime: number;
  endTime: number;
}

const Timeline: React.FC = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [clips, setClips] = useState<ClipData[]>([
    { id: "clip1", startTime: 0, endTime: 5 },
    // ... 其他剪辑数据
  ]);

  // 假设的剪辑更新函数
  const handleClipUpdate = (updatedClip: ClipData) => {
    setClips((prevClips) =>
      prevClips.map((clip) => (clip.id === updatedClip.id ? updatedClip : clip))
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div ref={timelineRef} className="timeline-container">
        <Row justify="center" align="middle">
          <Col span={24}>
            {/* {clips.map((clip) => (
              <Clip
                key={clip.id}
                clip={clip}
                onUpdate={handleClipUpdate}
                timelineRef={timelineRef}
              />
            ))} */}
            {/* 添加其他时间轴元素，如轨道、播放头等 */}
            <Divider orientation="left">轨道/播放头</Divider>
          </Col>
        </Row>
      </div>
    </DndProvider>
  );
};

export default Timeline;
