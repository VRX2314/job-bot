import React from "react";
import { motion } from "framer-motion";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CardProps {
  title: string;
  company: string;
  score: number;
  reasons_match: [];
  reasons_no_match: [];
  apply_link: string;
}

const JobGridCard = ({
  title,
  company,
  score,
  reasons_match,
  reasons_no_match,
  apply_link,
}: CardProps) => {
  const scoreFactor = score * 120;
  const pillComponents = (reasons: [], flag: boolean) => {
    let pillColor = "";
    if (flag) {
      pillColor = "border-green-500 bg-green-50";
    } else {
      pillColor = "border-red-500 bg-red-50";
    }

    const pills = reasons.map((reason, index) => (
      <div
        key={index}
        className={`text-sm font-semibold ${pillColor} rounded-2xl border px-4 py-2`}
      >
        {reason}
      </div>
    ));
    return <div className="flex flex-wrap gap-2 py-2">{pills}</div>;
  };

  return (
    <motion.div
      className="my-2 w-[30%] min-w-[400px]"
      initial={{ scale: 0.5, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ ease: "easeOut", duration: 1 }}
    >
      <Card className="flex h-full min-h-[648px] flex-col rounded-3xl border-slate-200 p-4">
        <CardHeader className="m-0 flex flex-col py-6">
          <div className="m-0 flex flex-grow basis-16 flex-row items-start justify-between gap-2">
            <h1 className="text-2xl font-bold">{title}</h1>
            <div className="m-0 flex flex-col flex-nowrap items-start justify-start text-nowrap">
              <p
                className="m-0 rounded-full border px-2 font-bold"
                style={{
                  color: `hsl(${scoreFactor},100%,40%)`,
                  backgroundColor: `hsl(${scoreFactor},100%,95%)`,
                  borderColor: `hsl(${scoreFactor},100%,40%)`,
                }}
              >
                {score * 100}% Match
              </p>
            </div>
          </div>
          <p className="gradient-blue-font mt-4 text-lg font-semibold">
            {company}
          </p>
          <div className="mt-2 flex">
            <i className="bx bx-calendar gradient-blue-font pr-1 text-xl"></i>
            <p>02/10/2024</p>
          </div>
        </CardHeader>
        <CardContent className="">
          <div className="flex flex-col">
            <div className="flex flex-col">
              {/* {Good Fit} */}
              <p className="font-semibold">Your Profile Matches:</p>
              {pillComponents(reasons_match, true)}
            </div>
            <div className="flex flex-col pt-4">
              {/* {No Good Fit} */}
              <p className="font-semibold">Your Profile Does Not Match:</p>
              {pillComponents(reasons_no_match, false)}
            </div>
          </div>
        </CardContent>
        <CardFooter className="mt-auto flex flex-row gap-4 p-0 px-2">
          <Button
            variant="outline"
            className="w-full border-slate-300 transition duration-300 hover:scale-105"
          >
            <i className="bx bx-bulb gradient-blue-font pr-1 text-2xl"></i>
            <p className="font-bold">More Insights</p>
          </Button>
          <Button
            asChild
            className="gradient-blue w-full transition duration-300 hover:scale-105"
          >
            <Link href={apply_link}>
              <p className="font-bold">Apply Now</p>
              <i className="bx bx-chevron-right pl-1 text-2xl"></i>
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default JobGridCard;
