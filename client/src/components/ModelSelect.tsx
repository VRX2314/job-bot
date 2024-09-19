import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ListProps {
  modelList: string[];
  handleConfigChange: () => void;
}

const ModelSelectList = ({ modelList, handleConfigChange }: ListProps) => {
  const [selectedModel, setSelectedModel] = useState("llama-3.1-70b-versatile");

  const generateList = modelList.map((element, index) => {
    return (
      <SelectItem key={index} value={element} className="hover:cursor-pointer">
        <div className="flex items-center gap-1">
          <p>{element}</p>
        </div>
      </SelectItem>
    );
  });

  return (
    <div>
      <Select
        defaultValue={selectedModel}
        onValueChange={(value) => {
          handleConfigChange();
          setSelectedModel(value);
        }}
      >
        <SelectTrigger className="soft-animate w-[200px] border-slate-300 hover:bg-slate-100">
          <SelectValue placeholder="Select Portal" />
        </SelectTrigger>
        <SelectContent>{generateList}</SelectContent>
      </Select>
    </div>
  );
};

export default ModelSelectList;
