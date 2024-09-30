import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import groq from "@/public/assets/groq.png";
import ollama from "@/public/assets/ollama.png";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-menu";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import ModelSelectList from "@/components/ModelSelect";
import { Dispatch, SetStateAction } from "react";
import { setCookie, getCookie } from "cookies-next";

interface Config {
  [key: string]: string | number;
}

interface ConfigureMenuProps {
  setIsConfigured: Dispatch<SetStateAction<boolean>>;
  configuration: Config;
  setConfiguration: Dispatch<
    SetStateAction<{ [key: string]: string | number }>
  >;
  apiCalls: number;
  tokenUsage: number;
}

const ConfigureMenu = ({
  setIsConfigured,
  configuration,
  setConfiguration,
  apiCalls,
  tokenUsage,
}: ConfigureMenuProps) => {
  const [selectedOption, setSelectedOption] = useState(
    configuration["inferenceEngine"].toString(),
  );
  const [apiKey, setApiKey] = useState(configuration["apiKey"].toString());
  const [numListings, setNumListings] = useState(configuration["numListings"]);
  const [langsmithKey, setLangsmithKey] = useState(
    configuration["langsmithKey"],
  );
  const [customPrompt, setCustomPrompt] = useState(
    configuration["customPrompt"],
  );

  const modelBackBone = [
    "llama-3.1-70b-versatile",
    "llama-3.1-8b-instant",
    "gemma2-9b-it",
  ];
  const [placeHolder, setPlaceHolder] = useState("");
  const [inputType, setInputType] = useState("");

  const handleSelectedOption = (value: string) => {
    setApiKey("");
    setSelectedOption(value);
    if (value === "groq") {
      setPlaceHolder("Enter your Groq API Key");
      setInputType("password");
    } else if (value === "ollama") {
      setPlaceHolder("Enter your Ollama Endpoint");
      setInputType("text");
    }
  };

  const handleConfigChange = (key: string, value: string | number) => {
    setIsConfigured(true);
    if (key === "apiKey") {
      setCookie("apiKey", value);
    }

    setConfiguration((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    handleSelectedOption(selectedOption);

    if (getCookie("apiKey")) {
      setApiKey(getCookie("apiKey") || "");
      setConfiguration((prev) => ({
        ...prev,
        ["apiKey"]: getCookie("apiKey") || "",
      }));
    }
  }, []);

  return (
    <motion.div
      className="flex w-full justify-center"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="flex flex-col gap-6 rounded-lg border-2 border-slate-100 p-4 md:w-11/12 xl:w-7/12 xl:min-w-[1000px]">
        <div className="flex gap-4">
          <Select
            defaultValue={selectedOption}
            onValueChange={(value) => {
              handleConfigChange("inferenceEngine", value);
              handleSelectedOption(value);
            }}
          >
            <SelectTrigger className="soft-animate w-[200px] border-slate-200 hover:bg-slate-100">
              <SelectValue placeholder="Select Portal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="groq" className="hover:cursor-pointer">
                <div className="flex items-center gap-1">
                  <Image src={groq} alt={"Groq logo"} width={16} height={16} />
                  <p>Groq</p>
                </div>
              </SelectItem>
              <SelectItem value="ollama" className="hover:cursor-pointer">
                <div className="flex items-center gap-1">
                  <Image
                    src={ollama}
                    alt={"Ollama logo"}
                    width={16}
                    height={16}
                  />
                  <p>Ollama</p>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Input
            className="focus-visible:ring-transparent focus-visible:ring-offset-0"
            type={inputType}
            placeholder={placeHolder}
            value={apiKey}
            onChange={(e) => {
              handleConfigChange("apiKey", e.target.value);
              setApiKey(e.target.value);
            }}
          />
        </div>
        <div className="flex gap-6">
          <div>
            <Label>Number of Listings</Label>
            <Input
              id="listings"
              type="number"
              defaultValue={numListings}
              onChange={(e) => {
                handleConfigChange("numListings", e.target.value);
                setNumListings(e.target.value);
              }}
              min={1}
              required={true}
            />
          </div>
          <div>
            <Label>Select Model</Label>
            <ModelSelectList
              modelList={modelBackBone}
              configuration={configuration}
              handleConfigChange={handleConfigChange}
            />
          </div>
          <div>
            <p>Total API Calls</p>
            <Button
              variant="outline"
              className="soft-animate w-full border-slate-200"
            >
              {apiCalls}
            </Button>
          </div>
          <div>
            <p>Total Tokens Used</p>
            <Button
              variant="outline"
              className="soft-animate w-full border-slate-200"
            >
              {tokenUsage}
            </Button>
          </div>
          <div className="flex-grow">
            <Label>LangSmith API</Label>
            <Input
              id="langsmith"
              type="text"
              placeholder="Optional"
              value={langsmithKey}
              onChange={(e) => {
                handleConfigChange("langsmithKey", e.target.value);
                setLangsmithKey(e.target.value);
              }}
            />
          </div>
        </div>
        <div>
          <Textarea
            value={customPrompt}
            onChange={(e) => {
              handleConfigChange("customPrompt", e.target.value);
              setCustomPrompt(e.target.value);
            }}
            placeholder="Enter your custom prompt. Use placeholders {job}, {resume}, {instructions} for data interaction."
          />
        </div>
      </div>
    </motion.div>
  );
};

export default ConfigureMenu;
