import React, { useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';

interface VideoTrackProps {
  start: number;
  end: number;
  onPositionChange: (position: { start: number; end: number }) => void;
  onRemove: () => void;
}

const VideoTrack: React.FC<VideoTrackProps> = ({
  start,
  end,
  onPositionChange,
  onRemove
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: start, y: 0 });
  const [size, setSize] = useState({ width: end - start, height: 40 });

  const handleDrag = (event: DraggableEvent, data: DraggableData) => {
    setPosition({ x: data.x, y: 0 });
    onPositionChange({ start: data.x, end: data.x + size.width });
    setIsDragging(true);
  };

  const handleDragStop = (event: DraggableEvent, data: DraggableData) => {
    setIsDragging(false);
  };

  const handleResize = (event: React.MouseEvent<HTMLDivElement>) => {
    const newWidth = event.currentTarget.offsetWidth;
    setSize({ width: newWidth, height: 40 });
    onPositionChange({ start: position.x, end: position.x + newWidth });
  };

  return (
    <Draggable
      axis="x"
      position={position}
      onDrag={handleDrag}
      onStop={handleDragStop}
    >
      <div
        style={{
          position: 'absolute',
          backgroundColor: 'rgba(255, 0, 0, 0.5)',
          height: size.height,
          width: size.width,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={(event) => event.stopPropagation()}
        onMouseUp={(event) => event.stopPropagation()}
        onDoubleClick={onRemove}
        onMouseDown={handleResize}
      >
        {/* Video content or other UI elements can be added here */}
      </div>
    </Draggable>
  );
};

export default VideoTrack;