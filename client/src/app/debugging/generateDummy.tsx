import { JobData, JobDataItem } from "@/app/script/jobDataInterfaces";
import React, { Dispatch, SetStateAction } from "react";
import JobGridCard from "@/components/JobGridCard";

export const generateDummyResponse = async (
  jobGridComponentList: JobDataItem[],
  setJobGridComponentList: Dispatch<SetStateAction<JobDataItem[]>>,
  setPersistJobGridComponentList: Dispatch<SetStateAction<JobDataItem[]>>,
  config: { [key: string]: string | number },
  isConfigured: boolean,
  setIsConfigured: Dispatch<SetStateAction<boolean>>,
  setApiCalls: Dispatch<SetStateAction<number>>,
  setTokenUsage: Dispatch<SetStateAction<number>>,
) => {
  setPersistJobGridComponentList((prevList) =>
    [...prevList, ...jobGridComponentList].sort((a, b) => b.score - a.score),
  );

  if (isConfigured) {
    const response = await fetch(
      `http://127.0.0.1:8000/setup-params-groq?model_backbone=${config["modelBackBone"]}`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json+stream" },
        body: JSON.stringify({ api_key: config["apiKey"] }),
      },
    );

    console.log("isConfigured:", isConfigured);
    setIsConfigured(false);

    if (!response.ok || !response.body) {
      throw response.statusText;
    }

    console.log(await response.json());
  }

  let tempId = 0;
  const response = await fetch(`http://127.0.0.1:8000/stream-test`, {
    method: "GET",
    headers: { "Content-Type": "application/json+stream" },
  });

  if (!response.ok || !response.body) {
    throw response.statusText;
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  const jobDataList: JobDataItem[] = [];

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    const decodedChunk = decoder.decode(value, { stream: true });
    const jobData: JobData = JSON.parse(decodedChunk);

    jobDataList.push({
      jobCard: (
        <JobGridCard
          key={tempId}
          title={jobData.job_title}
          company={jobData.company}
          score={jobData.response_evaluator.score}
          reasons_match={jobData.response_evaluator.reasons_match_c || []}
          reasons_no_match={jobData.response_evaluator.reasons_no_match_c || []}
          apply_link={jobData.link}
          date={jobData.date}
        />
      ),
      score: jobData.response_evaluator.score,
    });

    tempId += 1;
    setApiCalls((prevCalls) => (prevCalls += 1));
    setTokenUsage(
      (prevTokens) =>
        (prevTokens += jobData.metadata_evaluator.token_usage.total_tokens),
    );
    jobDataList.sort((a, b) => b.score - a.score);
    setJobGridComponentList([...jobDataList]);
  }
};
