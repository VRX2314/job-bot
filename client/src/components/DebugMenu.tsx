import React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

interface DebugMenuProps {
  gen: () => void;
}

const DebugMenu = ({ gen }: DebugMenuProps) => {
  const [debugMenu, setDebugMenu] = useState(false);
  const handleMenu = () => {
    debugMenu ? setDebugMenu(false) : setDebugMenu(true);
  };

  const debugMenuComponent = () => {
    return (
      <div className="absolute left-2 top-24 flex flex-col border-[5px]">
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
        className="absolute left-2 top-12 bg-red-500"
      >
        <i className="bx bx-cog pr-1 text-2xl"></i>
      </Button>
      {debugMenu ? debugMenuComponent() : null}
    </div>
  );
};

export default DebugMenu;
