import JobGridCard from "@/components/JobGridCard";
import { JobData, JobDataItem } from "@/app/script/jobDataInterfaces";
import React, { Dispatch, MutableRefObject, SetStateAction } from "react";

// TODO: Add integration for other LLM providers
// TODO: Separate generateResponse and updateConfig functions
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
  setLoading: Dispatch<SetStateAction<boolean>>,
) => {
  setPersistJobGridComponentList((prevList) =>
    [...prevList, ...jobGridComponentList].sort((a, b) => b.score - a.score),
  );

  setJobGridComponentList([]);
  setLoading(true);

  if (isConfigured) {
    const response = await fetch(
      `https://vrx2314-server--8000.prod1a.defang.dev/setup-params-groq?model_backbone=${config["modelBackBone"]}`,
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
    `https://vrx2314-server--8000.prod1a.defang.dev/stream-llm-jobspy?query=${searchQuery}&location=${searchLocation}&listings=${config["numListings"]}`,
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

    // String is parsed to JSON here
    console.log(decodedChunk);
    const jobData: JobData = JSON.parse(decodedChunk);
    console.log(jobData);
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

    jobDataList.sort((a, b) => b.score - a.score);
    setJobGridComponentList([...jobDataList]);
    setLoading(false);
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

  const response = await fetch(
    `https://vrx2314-server--8000.prod1a.defang.dev/upload-resume`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log(data);
};

const renderJobGridComponents = (component: JobDataItem[]) => {
  return component.map((data) => data.jobCard);
};

export { generateResponse, handleFileUpload, renderJobGridComponents };
