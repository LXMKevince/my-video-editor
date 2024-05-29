import { useRef, useState } from "react";
import Timeline from "./components/Timeline";
import { Button, Card, message, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import "./App.css";
import Draggable from "./components/Draggable";
import Droppable from "./components/Droppable";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

function App() {
  const [videoUrl, setVideoUrl] = useState(null);
  const [file, setFile] = useState<Blob>();
  const imageContainerRef = useRef<any>();

  const handleBeforeUpload = (file: Blob) => {
    console.log("格式验证");
    const isVideo = file.type.startsWith("video/");
    if (!isVideo) {
      message.error("请选择视频文件！");
      return false;
    }
    setFile(file);

    // 使用 FileReader 读取文件内容，并生成 URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setVideoUrl(e.target.result);
    };
    reader.readAsDataURL(file);

    return false;
  };

  /**@desc 处理帧数据 */
  const getFramesAsArrayBuffers = async (file: File) => {
    const ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();

    // 将文件读取为ArrayBuffer并写入FFmpeg的虚拟文件系统
    const arrayBuffer = await fetchFile(file);
    ffmpeg.FS("writeFile", "input.mp4", arrayBuffer);

    try {
      // 运行FFmpeg命令来提取每一帧为jpg图片
      await ffmpeg.run("-i", "input.mp4", "-vf", "fps=1", "output_%04d.jpg");
      const frames: ArrayBuffer[] = [];
      // 假设我们有一个最大帧数或迭代到某个条件为止
      const maxFrames = 1000; // 你可以根据实际情况调整这个值
      for (let i = 0; i < maxFrames; i++) {
        const filePath = `output_${i.toString().padStart(4, "0")}.jpg`;
        try {
          // 读取FFmpeg虚拟文件系统中的文件为ArrayBuffer
          const data = ffmpeg.FS("readFile", filePath);
          if (data.byteLength > 0) {
            frames.push(data.buffer.slice(0)); // 创建一个新的ArrayBuffer副本
          } else {
            // 如果读取的数据长度为0，则可能没有更多的帧了
            break;
          }
        } catch (error) {
          console.error(`Error reading file at path: ${filePath}`, error);
          // 如果文件不存在或读取失败，则继续到下一个文件
        }
      }

      return frames;
    } catch (error) {
      console.error("FFmpeg command failed", error);
      // 处理FFmpeg命令失败的情况
      return []; // 或者抛出错误
    }
  };

  /**@desc 处理拖拽过来的过数据 */
  const handleDrop = async (item: any) => {
    console.log("item ===", item);
    // const worker = new Worker(new URL("./worker.ts", import.meta.url), {
    //   type: "module",
    // });
    // worker.onmessage = function (e) {
    //   console.log("eeee", e.data);
    // };
    // worker.postMessage({ createFFmpeg, fetchFile, file: item.file });
    const data = await getFramesAsArrayBuffers(item.file);
    console.log("DATA", data);
    displayImagesFromArrayBuffers(data, imageContainerRef.current);
  };

  /**@desc 绘制帧数据 */
  // function displayImagesFromArrayBuffers(
  //   frameArrayBuffers: ArrayBuffer[],
  //   imageContainer: HTMLElement
  // ): void {
  //   // 清除之前可能存在的图片
  //   while (imageContainer.firstChild) {
  //     imageContainer.removeChild(imageContainer.firstChild);
  //   }

  //   // 遍历ArrayBuffer数组
  //   frameArrayBuffers.forEach((frameArrayBuffer, index) => {
  //     // 将ArrayBuffer转换为Blob
  //     const blob = new Blob([frameArrayBuffer], { type: "image/jpeg" });
  //     // 创建一个指向Blob的URL
  //     const url = URL.createObjectURL(blob);

  //     // 创建一个新的img元素
  //     const img = document.createElement("img");
  //     img.height = 50;
  //     img.width = 2;
  //     img.src = url;
  //     // 可选：为图片添加一些样式或属性
  //     // img.style.margin = "5px";

  //     // 将img元素添加到容器中
  //     imageContainer.appendChild(img);

  //     // 可选：监听图片加载完成，然后释放Blob URL
  //     img.onload = () => {
  //       URL.revokeObjectURL(url);
  //     };
  //   });
  // }

  function displayImagesFromArrayBuffers(
    frameArrayBuffers: ArrayBuffer[],
    containerElement: HTMLElement
  ) {
    // 创建包裹容器
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.overflow = "hidden";

    // 创建左侧拖动容器
    const leftHandle = document.createElement("div");
    leftHandle.style.width = "20px";
    leftHandle.style.height = "50px";
    leftHandle.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
    leftHandle.style.cursor = "ew-resize";
    let leftHandlePosition = 0;

    // 创建图像容器
    const imageContainer = document.createElement("div");
    imageContainer.style.display = "flex";
    imageContainer.style.alignItems = "center";

    // 创建右侧拖动容器
    const rightHandle = document.createElement("div");
    rightHandle.style.width = "20px";
    rightHandle.style.height = "50px";
    rightHandle.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
    rightHandle.style.cursor = "ew-resize";
    let rightHandlePosition = 0;

    // 将容器添加到包裹容器中
    wrapper.appendChild(leftHandle);
    wrapper.appendChild(imageContainer);
    wrapper.appendChild(rightHandle);

    // 添加图像
    frameArrayBuffers.forEach((frameArrayBuffer, index) => {
      const blob = new Blob([frameArrayBuffer], { type: "image/jpeg" });
      const url = URL.createObjectURL(blob);
      const img = document.createElement("img");
      img.height = 50;
      img.width = 2;
      img.src = url;
      imageContainer.appendChild(img);

      img.onload = () => {
        URL.revokeObjectURL(url);
      };
    });

    // 监听左侧拖动事件
    let isDraggingLeft = false;
    leftHandle.addEventListener("mousedown", (event) => {
      isDraggingLeft = true;
      leftHandlePosition = event.clientX - leftHandle.offsetLeft;
    });
    document.addEventListener("mousemove", (event) => {
      if (isDraggingLeft) {
        const newLeft = event.clientX - leftHandlePosition;
        leftHandle.style.left = `${newLeft}px`;
        updateImageContainer();
      }
    });
    document.addEventListener("mouseup", () => {
      isDraggingLeft = false;
    });

    // 监听右侧拖动事件
    let isDraggingRight = false;
    rightHandle.addEventListener("mousedown", (event) => {
      isDraggingRight = true;
      rightHandlePosition = event.clientX - rightHandle.offsetLeft;
    });
    document.addEventListener("mousemove", (event) => {
      if (isDraggingRight) {
        const newRight = event.clientX - rightHandlePosition;
        rightHandle.style.left = `${newRight}px`;
        updateImageContainer();
      }
    });
    document.addEventListener("mouseup", () => {
      isDraggingRight = false;
    });

    // 更新图像容器
    function updateImageContainer() {
      const leftOffset = leftHandle.offsetLeft + leftHandle.offsetWidth;
      const rightOffset = rightHandle.offsetLeft;
      const visibleImages = Array.from(imageContainer.children).filter(
        (img, index) => {
          const imgLeft = img.offsetLeft;
          const imgRight = imgLeft + img.offsetWidth;
          return imgLeft >= leftOffset && imgRight <= rightOffset;
        }
      );
      imageContainer.innerHTML = "";
      visibleImages.forEach((img) => {
        imageContainer.appendChild(img);
      });
      wrapper.style.width = `${visibleImages.reduce(
        (total, img) => total + img.offsetWidth,
        0
      )}px`;
    }

    containerElement.appendChild(wrapper);
  }

  return (
    <div className="content">
      <Card className="videoWrapper">
        <Upload accept="video/*" beforeUpload={handleBeforeUpload}>
          <Button type="primary" icon={<UploadOutlined />}>
            Upload
          </Button>
        </Upload>
        <Draggable file={file}>
          {videoUrl && (
            <div style={{ marginTop: 16 }}>
              <video width="320" controls>
                <source src={videoUrl} type="video/mp4" />
                您的浏览器不支持 Video 标签。
              </video>
            </div>
          )}
        </Draggable>
      </Card>
      <Card className="timelineWrapper">
        <Droppable state={file} handleDrop={handleDrop}>
          <div ref={imageContainerRef}></div>
        </Droppable>
      </Card>
    </div>
  );
}

export default App;
