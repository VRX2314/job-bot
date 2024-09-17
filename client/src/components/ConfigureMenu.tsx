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

const ConfigureMenu = () => {
  const [selectedOption, setSelectedOption] = useState("groq");
  const [placeHolder, setPlaceHolder] = useState("");
  const [inputType, setInputType] = useState("");

  const handleSelectedOption = (value: string) => {
    setSelectedOption(value);
    if (value === "groq") {
      setPlaceHolder("Enter your Groq API Key");
      setInputType("password");
    } else if (value === "ollama") {
      setPlaceHolder("Enter your Ollama Endpoint");
      setInputType("text");
    }
  };

  useEffect(() => {
    handleSelectedOption(selectedOption);
  });

  return (
    <motion.div
      className="flex w-full justify-center"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="flex flex-col gap-6 rounded-lg border-2 border-slate-200 p-4 md:w-10/12">
        <div className="flex gap-4">
          <Select
            defaultValue={selectedOption}
            onValueChange={(value) => {
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
          />
        </div>
        <div className="flex gap-6">
          <div>
            <Label>Number of Listings</Label>
            <Input id="listings" type="number" defaultValue={9} />
          </div>
          <div>
            <Label>Select Model</Label>
            <Input id="backbone" type="text" />
          </div>
          <div>
            <p>Total API Calls</p>
            <Button
              variant="outline"
              className="soft-animate w-full border-slate-200"
            >
              Calls
            </Button>
          </div>
          <div>
            <p>Total Tokens Used</p>
            <Button
              variant="outline"
              className="soft-animate w-full border-slate-200"
            >
              10000
            </Button>
          </div>
          <div className="flex-grow">
            <Label>LangSmith API</Label>
            <Input id="langsmit" type="text" placeholder="Optional" />
          </div>
        </div>
        <div>
          <Textarea placeholder="Enter your custom prompt. Use placeholders {job}, {resume}, {instructions} for data interaction." />
        </div>
      </div>
    </motion.div>
  );
};

export default ConfigureMenu;
