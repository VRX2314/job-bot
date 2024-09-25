import React from "react";
import { Textarea } from "@/components/ui/textarea";

const SpecialMenu = () => {
  return (
    <div>
      <Textarea placeholder="Enter your custom prompt. Use placeholders {job}, {resume}, {instructions} for data interaction." />
    </div>
  );
};

export default SpecialMenu;
