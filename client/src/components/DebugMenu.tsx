import React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

const DebugMenu = ({ gen }) => {
  const [debugMenu, setDebugMenu] = useState(false);
  const handleMenu = () => {
    debugMenu ? setDebugMenu(false) : setDebugMenu(true);
  };

  const debugMenuComponent = () => {
    return (
      <div className="absolute mt-[60px] flex flex-col border-[5px]">
        Debug Menu
        <Button onClick={gen}>Generate Response</Button>
      </div>
    );
  };

  return (
    <div className="self-start">
      <Button
        variant="outline"
        size="icon"
        onClick={handleMenu}
        className="absolute bg-red-500"
      >
        <i className="bx bx-cog text-2xl pr-1"></i>
      </Button>
      {debugMenu ? debugMenuComponent() : null}
    </div>
  );
};

export default DebugMenu;
