"use client";
import "../styles/global.css";
import styles from "@/styles/main.module.css";
import JobGridComponent from "@/components/JobGridComponent";
import JobGridCard from "@/components/JobGridCard";
import Image from "next/image";

import { useState } from "react";

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

const page = () => {
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
    const response = await fetch("http://127.0.0.1:8000/stream-llm-hybrid", {
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
        <JobGridCard
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

  const [selectedOption, setSelectedOption] = useState("linkedin");

  return (
    <div className="flex flex-col justify-center items-center">
      <DebugMenu gen={() => generateResponse()} />
      <div className="flex flex-col justify-center items-center w-full max-w-full">
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
      <div className="flex mt-12 border border-slate-300 rounded-full items-center justify-center xl:min-w-[1000px] md:w-11/12 xl:w-7/12 h-12">
        <div className="flex flex-row items-center w-7/12 h-full pl-4">
          <i className="bx bx-briefcase-alt text-2xl gradient-blue-font"></i>
          <Input
            className="border-0 border-r-2 rounded-r-none border-slate-300 h-full"
            placeholder="Job Titles, Companies"
          />
        </div>
        <div className="flex flex-row items-center w-5/12 h-full">
          <i className="bx bx-map-pin text-2xl pl-4 gradient-blue-font"></i>
          <Input className="border-0 h-full" placeholder="Country" />
        </div>
        <Button className="rounded-full p-0 mr-1 self-center gradient-blue">
          <i className="bx bx-search-alt text-2xl m-2"></i>
        </Button>
      </div>
      <div className="flex flex-col lg:flex-row flex-wrap items-center justify-center mt-8 gap-4 max-w-fit">
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
                <i className="bx bxl-linkedin-square text-2xl gradient-blue-font"></i>
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
        <Input type="file" className="border-slate-300 w-fit" />
        <Button variant="outline" className="border-slate-300">
          <i className="bx bxs-magic-wand text-2xl pr-1 gradient-blue-font"></i>
          Add Special Instructions
        </Button>
        <Button className="gradient-blue">
          <i className="bx bx-cog text-2xl pr-1"></i>Configure
        </Button>
      </div>
      <div className="flex flex-wrap justify-start gap-8 mt-16 w-full px-8 lg:p-0 md:w-11/12 xl:w-10/12 mb-8">
        {jobGridComponentList}
      </div>
    </div>
  );
};

export default page;
