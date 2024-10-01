"use client";
import "../styles/global.css";
import JobGridCard from "@/components/JobGridCard";
import Image from "next/image";

import React, { useState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import linkedin from "@/public/assets/linkedin.png";
import glassdoor from "@/public/assets/glassdoor.png";
import indeed from "@/public/assets/indeed.png";

import DebugMenu from "@/components/DebugMenu";
import { generateDummyResponse } from "@/app/debugging/generateDummy";

import { JobData, JobDataItem } from "@/app/script/jobDataInterfaces";
import ConfigureMenu from "@/components/ConfigureMenu";
import SpecialMenu from "@/components/SpecialMenu";

import generateResponse from "@/app/script/searchJobs";

const Home = () => {
  const [jobGridComponentList, setJobGridComponentList] = useState<
    JobDataItem[]
  >([]);

  const [persistJobGridComponentList, setPersistJobGridComponentList] =
    useState<JobDataItem[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedOption, setSelectedOption] = useState("linkedin");
  const [configureMenu, setConfigureMenu] = useState(true);
  const [specialMenu, setSpecialMenu] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true);
  const [config, setConfig] = useState<{ [key: string]: string | number }>({
    inferenceEngine: "groq",
    apiKey: "",
    modelBackbone: "",
    numListings: 1,
    langsmithKey: "",
    modelBackBone: "llama-3.1-70b-versatile",
    customPrompt: "",
  });

  const [apiCalls, setApiCalls] = useState(0);
  const [tokenUsage, setTokenUsage] = useState(0);

  const gridRef = useRef<HTMLDivElement | null>(null);

  const renderJobGridComponents = (component: JobDataItem[]) => {
    return component.map((data) => data.jobCard);
  };

  const toggleMenu = (id: number) => {
    if (id === 1) {
      setConfigureMenu(!configureMenu);
    }
    if (id === 2) {
      setSpecialMenu(!specialMenu);
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

  return (
    <div className="flex flex-col items-center justify-center">
      <DebugMenu
        genResp={() =>
          generateDummyResponse(
            jobGridComponentList,
            setJobGridComponentList,
            setPersistJobGridComponentList,
            config,
            isConfigured,
            setIsConfigured,
            setApiCalls,
            setTokenUsage,
          )
        }
      />
      <div className="mt-32 flex w-full max-w-full flex-col items-center justify-center">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Bot Interface V1
        </h1>
      </div>
      {/* ------------ Search Component Starts ------------ */}
      <div className="mt-12 flex h-12 items-center justify-center rounded-lg border border-slate-300 md:w-11/12 xl:w-7/12 xl:min-w-[1000px]">
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
          className="gradient-blue mr-1 self-center rounded-md p-0"
          onClick={() =>
            generateResponse(
              searchQuery,
              searchLocation,
              jobGridComponentList,
              setJobGridComponentList,
              setPersistJobGridComponentList,
              config,
              isConfigured,
              setIsConfigured,
              gridRef,
              setApiCalls,
              setTokenUsage,
            )
          }
        >
          <i className="bx bx-search-alt m-2 text-2xl"></i>
        </Button>
      </div>
      {/* ------------ Search Component Ends ------------ */}

      {/* ------------ Configuration Options Starts ------------ */}
      <div className="my-8 flex max-w-fit flex-col flex-wrap items-center justify-center gap-4 lg:flex-row">
        <Select
          defaultValue={selectedOption}
          onValueChange={(value) => {
            setSelectedOption(value);
          }}
        >
          <SelectTrigger className="soft-animate w-[200px] border-slate-300 hover:bg-slate-100">
            <SelectValue placeholder="Select Portal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="linkedin" className="hover:cursor-pointer">
              <div className="flex items-center gap-1">
                <Image
                  src={linkedin}
                  alt={"LinkedIn logo"}
                  width={16}
                  height={16}
                />
                <p>LinkedIn</p>
              </div>
            </SelectItem>
            <SelectItem value="indeed" className="hover:cursor-pointer">
              <div className="flex items-center gap-1">
                <Image
                  src={indeed}
                  alt={"Indeed logo"}
                  width={16}
                  height={16}
                />
                <p>Indeed</p>
              </div>
            </SelectItem>
            <SelectItem value="glassdoor" className="hover:cursor-pointer">
              <div className="flex items-center gap-1">
                <Image
                  src={glassdoor}
                  alt={"Glass Door logo"}
                  width={16}
                  height={16}
                />
                <p>GlassDoor</p>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="file"
          className="soft-animate w-fit border-slate-300 hover:cursor-pointer hover:bg-slate-100"
          accept=".pdf"
          onChange={handleFileUpload}
        />
        <Button
          variant="outline"
          className="soft-animate border-slate-300"
          onClick={() => toggleMenu(2)}
        >
          <i className="bx bxs-magic-wand gradient-blue-font pr-1 text-2xl"></i>
          Add Special Instructions
        </Button>
        <Button
          className="gradient-blue border-0 transition"
          onClick={() => toggleMenu(1)}
        >
          <i className="bx bx-cog pr-1 text-2xl"></i>Configure
        </Button>
      </div>
      {/* ------------ Configuration Options Starts ------------ */}
      {configureMenu && (
        <ConfigureMenu
          setIsConfigured={setIsConfigured}
          configuration={config}
          setConfiguration={setConfig}
          apiCalls={apiCalls}
          tokenUsage={tokenUsage}
        />
      )}

      {/* ------------ Special Menu Starts Here ------------ */}
      {specialMenu && <SpecialMenu />}

      {/* ------------ JOBS Grid Starts ------------ */}
      <div
        ref={gridRef}
        className="my-16 flex w-full flex-wrap justify-around gap-8 px-8 md:w-11/12 lg:p-0 xl:w-10/12"
      >
        {renderJobGridComponents(jobGridComponentList)}
      </div>
      {persistJobGridComponentList.length > 0 ? (
        <div className="min-h-2 min-w-[80%] rounded-full bg-slate-200"></div>
      ) : null}
      <div className="my-16 flex w-full flex-wrap items-center justify-around gap-8 px-8 md:w-11/12 lg:p-0 xl:w-10/12">
        {renderJobGridComponents(persistJobGridComponentList)}
      </div>
    </div>
    /* ------------ JOBS Grid Ends ------------ */
  );
};

export default Home;
