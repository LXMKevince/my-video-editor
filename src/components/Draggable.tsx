import { ReactNode } from "react";
import { useDrag } from "react-dnd";

interface DarggableProps {
  file: any;
  children: ReactNode;
}

const Draggable = (props: DarggableProps) => {
  const { file, children } = props;
  //   console.log("file", props);
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "video",
      item: { file, id: 1 },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [file]
  );

  return <div ref={drag}>{children}</div>;
};

export default Draggable;
