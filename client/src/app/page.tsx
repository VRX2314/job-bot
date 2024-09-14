"use client";
import "../styles/global.css";
import JobGridCard from "@/components/JobGridCard";
import Image from "next/image";

import { useState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import heroImage from "../assets/bot_dummy.png";
import DebugMenu from "@/components/DebugMenu";

const Home = () => {
  const [jobGridComponentList, setJobGridComponentList] = useState<
    JSX.Element[]
  >([]);

  const [persistJobGridComponentList, setPersistJobGridComponentList] =
    useState<JSX.Element[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedOption, setSelectedOption] = useState("linkedin");

  const gridRef = useRef<HTMLDivElement | null>(null);

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
    setPersistJobGridComponentList((prevList) => [
      ...prevList,
      ...jobGridComponentList,
    ]);
    gridRef.current?.scrollIntoView({ behavior: "smooth" });
    let tempId = 0;
    // const response = await fetch(
    //   `http://127.0.0.1:8000/stream-llm-hybrid?query=${searchQuery}&location=${searchLocation}`,
    //   {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json+stream" },
    //   },
    // );

    const response = await fetch(`http://127.0.0.1:8000/stream-test`, {
      method: "GET",
      headers: { "Content-Type": "application/json+stream" },
    });

    if (!response.ok || !response.body) {
      throw response.statusText;
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let jobDataList = [];

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }

      const decodedChunk = decoder.decode(value, { stream: true });
      jobData = JSON.parse(decodedChunk);
      console.log(jobData);

      jobDataList.push({
        jobCard: (
          <JobGridCard
            key={tempId}
            title={jobData.response_evaluator.job_title}
            company={jobData.response_evaluator.company}
            score={jobData.response_evaluator.score}
            reasons_match={jobData.response_evaluator.reasons_match_c}
            reasons_no_match={jobData.response_evaluator.reasons_no_match_c}
          />
        ),
        score: jobData.response_evaluator.score,
      });

      tempId += 1;

      jobDataList.sort((a, b) => b.score - a.score);
      let sortedJobGridComponents = jobDataList.map((data) => data.jobCard);
      setJobGridComponentList([...sortedJobGridComponents]);
    }
  };

  const logger = () => {
    console.log(searchQuery);
    console.log(searchLocation);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <DebugMenu gen={() => generateResponse()} />
      <div className="flex w-full max-w-full flex-col items-center justify-center">
        <Image
          className="my-4"
          src={heroImage}
          width={216}
          height={216}
          alt="hero"
        />
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Job Seeker V1
        </h1>
      </div>
      <div className="mt-12 flex h-12 items-center justify-center rounded-full border border-slate-300 md:w-11/12 xl:w-7/12 xl:min-w-[1000px]">
        <div className="flex h-full w-7/12 flex-row items-center pl-4">
          <i className="bx bx-briefcase-alt gradient-blue-font text-2xl"></i>
          <Input
            className="h-full rounded-r-none border-0 border-r-2 border-slate-300 focus-visible:ring-transparent focus-visible:ring-offset-0"
            placeholder="Job Titles, Companies"
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
        <div className="flex h-full w-5/12 flex-row items-center">
          <i className="bx bx-map-pin gradient-blue-font pl-4 text-2xl"></i>
          <Input
            className="h-full border-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
            placeholder="Country"
            onChange={(event) => setSearchLocation(event.target.value)}
          />
        </div>
        <Button
          className="gradient-blue mr-1 self-center rounded-full p-0"
          onClick={generateResponse}
        >
          <i className="bx bx-search-alt m-2 text-2xl"></i>
        </Button>
      </div>
      <div className="mt-8 flex max-w-fit flex-col flex-wrap items-center justify-center gap-4 lg:flex-row">
        <Select
          defaultValue={selectedOption}
          onValueChange={(value) => {
            setSelectedOption(value);
          }}
        >
          <SelectTrigger className="w-[200px] border-slate-300">
            <SelectValue placeholder="Select Portal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="linkedin">
              <div className="flex items-center gap-1">
                <i className="bx bxl-linkedin-square gradient-blue-font text-2xl"></i>
                LinkedIn
              </div>
            </SelectItem>
            <SelectItem value="indeed">
              <div className="flex items-center gap-1">
                <i className="bx bx-cheese text-2xl"></i>Indeed
              </div>
            </SelectItem>
            <SelectItem value="glassdoor">
              <div className="flex items-center gap-1">
                <i className="bx bx-cheese text-2xl"></i>GlassDoor
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <Input type="file" className="w-fit border-slate-300" />
        <Button variant="outline" className="border-slate-300">
          <i className="bx bxs-magic-wand gradient-blue-font pr-1 text-2xl"></i>
          Add Special Instructions
        </Button>
        <Button className="gradient-blue">
          <i className="bx bx-cog pr-1 text-2xl"></i>Configure
        </Button>
      </div>
      <div
        ref={gridRef}
        className="my-16 flex w-full flex-wrap justify-start gap-8 px-8 md:w-11/12 lg:p-0 xl:w-10/12"
      >
        {jobGridComponentList}
      </div>
      {persistJobGridComponentList.length > 0 ? (
        <div className="min-h-2 min-w-[80%] rounded-full bg-slate-200"></div>
      ) : null}
      <div className="my-16 flex w-full flex-wrap justify-start gap-8 px-8 md:w-11/12 lg:p-0 xl:w-10/12">
        {persistJobGridComponentList}
      </div>
    </div>
  );
};

export default Home;
