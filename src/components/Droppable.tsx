import { ReactNode } from "react";
import { useDrop } from "react-dnd";

interface DroppableProps {
  state: any;
  handleDrop: (item: any) => void;
  children?: ReactNode;
  height?: string;
}

const Droppable = (props: DroppableProps) => {
  const { children, state, handleDrop, height = "450px" } = props;
  console.log("props", props);
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "video",
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
      drop: (item) => {
        console.log("item", item);
        handleDrop(item);
      },
    }),
    [state]
  );

  return (
    <div style={{ width: "100%", height: height }} ref={drop}>
      {children}
    </div>
  );
};

export default Droppable;
