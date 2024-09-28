import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

const SpecialMenu = () => {
  return (
    <motion.div
      className="flex w-full justify-center"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="mt-4 md:w-11/12 xl:w-7/12 xl:min-w-[1000px]">
        <Textarea placeholder="Enter any special instructions or specific details the bot should follow." />
      </div>
    </motion.div>
  );
};

export default SpecialMenu;
