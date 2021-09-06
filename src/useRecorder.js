import { useEffect, useState } from "react";

const useRecorder = () => {
  const [audioURL, setAudioURL] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [recorderError, setRecorderError] = useState(null);

  useEffect(() => {
    // Lazily obtain recorder first time we're recording.
    if (recorder === null) {
      if (isRecording) {
        requestRecorder()
          .then((rec) => {
            setRecorderError(null)
            setRecorder(rec)
          })
          .catch(err => {
            setRecorderError(err)
          });
      }
      return;
    }

    // Manage recorder state.
    if (isRecording) {
      recorder.start();
    } else {
      recorder.stop();
    }

    // Obtain the audio when ready.
    const handleData = e => {
      setAudioURL(URL.createObjectURL(e.data));
      setAudioFile(e.data)
    };
    recorder.addEventListener("dataavailable", handleData);
    return () => recorder.removeEventListener("dataavailable", handleData);
  }, [recorder, isRecording]);

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = async () => {
    setIsRecording(false);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks()
      .forEach(track => track.stop())
  };

  const checkRequestRecorder = async () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(res => {
        setRecorderError(null)
      })
      .catch(err => {
        setRecorderError(err)
      })
  }

  return {
    audioURL, 
    audioFile,
    isRecording, 
    startRecording, 
    stopRecording, 
    recorderError, 
    checkRequestRecorder
  };
};

async function requestRecorder() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return new MediaRecorder(stream);
}

export default useRecorder;
