

self.onmessage = async (event: any) => {
  const { createFFmpeg, fetchFile } = event.data;
  const ffmpeg = createFFmpeg({ log: true });
  
  await ffmpeg.load();

  ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(event.data.file));

  await ffmpeg.run('-i', 'input.mp4', '-vf', 'fps=1', '-vframes', '-1', 'output_%04d.jpg');

  const frameCount = await ffmpeg.run('-i', 'input.mp4', '-map', '0:v:0', '-c', 'copy', '-f', 'null', '-');
  const frames: ArrayBuffer[] = [];
  if( typeof frameCount === 'number' ) {
    for (let i = 0; i < frameCount; i++) {
      const data = ffmpeg.FS('readFile', `output_${i.toString().padStart(4, '0')}.jpg`);
      frames.push(data.buffer);
    }
  }
  self.postMessage(frames);
};
