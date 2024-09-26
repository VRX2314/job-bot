import React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

interface DebugMenuProps {
  genResp: () => Promise<void>;
}

const DebugMenu = ({ genResp }: DebugMenuProps) => {
  const [debugMenu, setDebugMenu] = useState(false);
  const handleMenu = () => {
    debugMenu ? setDebugMenu(false) : setDebugMenu(true);
  };

  const loadParams = async () => {
    const response = await fetch("http://127.0.0.1:8000/get-model-params", {
      method: "GET",
    });

    console.log(await response.json());
  };

  const debugMenuComponent = () => {
    return (
      <div className="absolute left-2 top-24 flex flex-col gap-2 border-[5px]">
        Debug Menu
        <Button onClick={genResp}>Generate Response</Button>
        <Button onClick={loadParams}>Show Params</Button>
      </div>
    );
  };

  // The Red Button
  return (
    <div className="self-start">
      <Button
        variant="outline"
        size="icon"
        onClick={handleMenu}
        className="absolute left-2 top-12 m-0 bg-red-500 p-0 text-center"
      >
        <i className="bx bx-cog text-2xl"></i>
      </Button>
      {debugMenu ? debugMenuComponent() : null}
    </div>
  );
};

export default DebugMenu;
