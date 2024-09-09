"use client";
import "../styles/global.css";
import styles from "@/styles/main.module.css";
import JobGridComponent from "@/components/JobGridComponent";

import { useState } from "react";

const page = () => {
  const test = [
    <p key={0}>Pussy</p>,
    <p key={1}>No</p>,
    <h1 key={2}>AAAAAA</h1>,
  ];

  let [jobGridComponentList, setJobGridComponentList] = useState<JSX.Element[]>(
    []
  );

  let jobData = {
    response_condensor: "",
    metadata_condensor: {
      token_usage: {
        completion_tokens: 0,
        prompt_tokens: 0,
        total_tokens: 0,
        completion_time: 0,
        prompt_time: 0,
        queue_time: 0,
        total_time: 0,
      },
      model_name: "",
      system_fingerprint: "",
      finish_reason: "",
      logprobs: null,
    },
    response_evaluator: {
      job_title: "",
      company: "",
      score: 0,
      reasons_match: [],
      reasons_no_match: [],
      reasons_match_c: [],
      reasons_no_match_c: [],
    },
    metadata_evaluator: {
      token_usage: {
        completion_tokens: 0,
        prompt_tokens: 0,
        total_tokens: 0,
        completion_time: 0,
        prompt_time: 0,
        queue_time: 0,
        total_time: 0,
      },
      model_name: "",
      system_fingerprint: "",
      finish_reason: "",
      logprobs: null,
    },
    api_calls: 0,
  };

  const generateResponse = async () => {
    let tempId = 0;
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
      jobData = JSON.parse(decodedChunk);
      console.log(jobData);
      setJobGridComponentList((prev) => [
        ...prev,
        <JobGridComponent
          key={tempId}
          title={jobData.response_evaluator.job_title}
          company={jobData.response_evaluator.company}
          score={jobData.response_evaluator.score}
          reasons_match={jobData.response_evaluator.reasons_match_c}
          reasons_no_match={jobData.response_evaluator.reasons_no_match_c}
        />,
      ]);
      tempId += 1;
    }
  };

  return (
    <div>
      <button onClick={generateResponse}>Generate Response</button>
      <div className={styles.mainContainer}>{jobGridComponentList}</div>
    </div>
  );
};

export default page;
