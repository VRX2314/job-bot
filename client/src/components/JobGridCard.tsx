import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

interface CardProps {
  title: string;
  company: string;
  score: number;
  reasons_match: [];
  reasons_no_match: [];
}

const JobGridCard = ({
  title,
  company,
  score,
  reasons_match,
  reasons_no_match,
}: CardProps) => {
  const scoreFactor = score * 120;
  console.log(scoreFactor);
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
        className={`text-sm font-semibold ${pillColor} rounded-full border px-4 py-2`}
      >
        {reason}
      </div>
    ));
    return <div className="flex flex-wrap gap-2 py-2">{pills}</div>;
  };

  return (
    <Card className="flex min-h-[648px] w-[460px] flex-col justify-between rounded-3xl border-slate-100 p-2 shadow-lg">
      <CardHeader className="m-0 flex flex-row items-center justify-between space-y-0 p-2">
        <div className="m-0 flex items-center rounded-full border border-slate-300 p-2 font-medium">
          <i className="bx bx-calendar gradient-blue-font pr-1 text-2xl"></i>
          12/09/24
        </div>
        <div
          className={`m-0 font-semibold`}
          style={{ color: `hsl(${scoreFactor},100%,40%)` }}
        >
          {score * 100}% Match
        </div>
      </CardHeader>
      <CardContent className="min-h-[516px] px-2 pt-6">
        <div className="flex flex-col gap-0">
          {/* {Comapny and Designation} */}
          <p className="gradient-blue-font text-[1rem] font-semibold">
            {company}
          </p>
          <h1 className="text-[2rem] font-bold">{title}</h1>
        </div>
        <div className="flex flex-col justify-between pt-4">
          <div className="flex flex-col">
            {/* {Good Fit} */}
            <p>Your Profile has</p>
            {pillComponents(reasons_match, true)}
          </div>
          <div className="flex flex-col pt-4">
            {/* {Good Fit} */}
            <p>Your Profile Does not have</p>
            {pillComponents(reasons_no_match, false)}
          </div>
        </div>
      </CardContent>
      <CardFooter className="m-0 my-2 flex flex-row gap-4 p-0 px-2">
        <Button className="gradient-blue w-full">
          <i className="bx bx-link-external pr-1 text-2xl"></i>
          <p className="font-bold">Apply Now</p>
        </Button>
        <Button variant="outline" className="w-full border-slate-300">
          <i className="bx bx-bulb gradient-blue-font pr-1 text-2xl"></i>
          <p className="font-bold">More Insights</p>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JobGridCard;
