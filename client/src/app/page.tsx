"use client";

import styles from "@/styles/main.module.css";
import { useState } from "react";

const page = () => {
  let [dynamicData, setDynamicData] = useState({
    job_title: "",
    company: "",
    score: 0,
    reasons_macth: "",
    reasons_no_match: "",
    reasons_match_c: "",
    reasons_match_no_c: "",
  });

  const generateResponse = async () => {
    const response = await fetch("http://127.0.0.1:8000/stream-test", {
      method: "GET",
      headers: { "Content-Type": "application/json+stream" },
    });

    if (!response.ok || !response.body) {
      throw response.statusText;
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }

      const decodedChunk = decoder.decode(value, { stream: true });
      console.log(decodedChunk);
      setDynamicData(JSON.parse(decodedChunk));
    }
  };

  return (
    <div>
      <button onClick={generateResponse}>Generate Response</button>
      <h1>{dynamicData.job_title}</h1>
      <h2>{dynamicData.company}</h2>
    </div>
  );
};

export default page;
