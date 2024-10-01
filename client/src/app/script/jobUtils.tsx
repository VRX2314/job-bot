import JobGridCard from "@/components/JobGridCard";
import { JobData, JobDataItem } from "@/app/script/jobDataInterfaces";
import React, { Dispatch, MutableRefObject, SetStateAction } from "react";

const generateResponse = async (
  searchQuery: string,
  searchLocation: string,
  jobGridComponentList: JobDataItem[],
  setJobGridComponentList: Dispatch<SetStateAction<JobDataItem[]>>,
  setPersistJobGridComponentList: Dispatch<SetStateAction<JobDataItem[]>>,
  config: { [key: string]: string | number },
  isConfigured: boolean,
  setIsConfigured: Dispatch<SetStateAction<boolean>>,
  gridRef: MutableRefObject<HTMLDivElement | null>,
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
    setIsConfigured(false);

    if (!response.ok || !response.body) {
      throw response.statusText;
    }
  }

  gridRef.current?.scrollIntoView({ behavior: "smooth" });
  let tempId = 0;

  const response = await fetch(
    `http://127.0.0.1:8000/stream-llm-hybrid?query=${searchQuery}&location=${searchLocation}&listings=${config["numListings"]}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json+stream" },
    },
  );

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
          title={jobData.response_evaluator.job_title}
          company={jobData.response_evaluator.company}
          score={jobData.response_evaluator.score}
          reasons_match={jobData.response_evaluator.reasons_match_c || []}
          reasons_no_match={jobData.response_evaluator.reasons_no_match_c || []}
        />
      ),
      score: jobData.response_evaluator.score,
    });

    tempId += 1;

    jobDataList.sort((a, b) => b.score - a.score);
    setJobGridComponentList([...jobDataList]);
    setApiCalls((prevCalls) => (prevCalls += 1));
    setTokenUsage(
      (prevTokens) =>
        (prevTokens += jobData.metadata_evaluator.token_usage.total_tokens),
    );
  }
};

const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files![0];
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://127.0.0.1:8000/upload-resume/", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  console.log(data);
};

const renderJobGridComponents = (component: JobDataItem[]) => {
  return component.map((data) => data.jobCard);
};

export { generateResponse, handleFileUpload, renderJobGridComponents };
