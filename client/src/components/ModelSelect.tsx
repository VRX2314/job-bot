import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Config {
  [key: string]: string | number;
}

interface ListProps {
  modelList: string[];
  handleConfigChange: (key: string, value: string | number) => void;
  configuration: Config;
}

const ModelSelectList = ({
  modelList,
  handleConfigChange,
  configuration,
}: ListProps) => {
  const [selectedModel, setSelectedModel] = useState(
    configuration["modelBackBone"],
  );

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
        defaultValue={selectedModel.toString()}
        onValueChange={(value) => {
          handleConfigChange("modelBackBone", value);
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
