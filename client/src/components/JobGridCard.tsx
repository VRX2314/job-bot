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

const JobGridCard = ({
  title,
  company,
  score,
  reasons_match,
  reasons_no_match,
}) => {
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
        className={`text-sm font-semibold ${pillColor} border rounded-full px-4 py-2`}
      >
        {reason}
      </div>
    ));
    return <div className="flex flex-wrap py-2 gap-2">{pills}</div>;
  };

  return (
    <Card className="flex flex-col w-[460px] min-h-[648px] rounded-3xl p-2 border-slate-100 shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center m-0 p-2 space-y-0">
        <div className="m-0 font-medium flex items-center border border-slate-300 p-2 rounded-full">
          <i className="bx bx-calendar pr-1 text-2xl gradient-blue-font"></i>
          11/09/24
        </div>
        <div className="m-0 font-semibold text-green-500">
          {score * 100}% Match
        </div>
      </CardHeader>
      <CardContent className="p-2 pt-4 min-h-[516px]">
        <div className="flex flex-col gap-0">
          {/* {Comapny and Designation} */}
          <p className="font-semibold text-[1rem] gradient-blue-font">
            {company}
          </p>
          <h1 className="font-bold text-[2rem]">{title}</h1>
        </div>
        <div className="flex flex-col pt-4">
          {/* {Good Fit} */}
          <p>You're a Good Fit for</p>
          {pillComponents(reasons_match, true)}
        </div>
        <div className="flex flex-col pt-4">
          {/* {Good Fit} */}
          <p>You're a Not a Good Fit for</p>
          {pillComponents(reasons_no_match, false)}
        </div>
      </CardContent>
      <CardFooter className="m-0 my-2 p-0 px-2 flex flex-row gap-4">
        <Button className="gradient-blue w-full">
          <i className="bx bx-link-external text-2xl pr-1"></i>
          <p className="font-bold">Apply Now</p>
        </Button>
        <Button variant="outline" className="border-slate-300 w-full">
          <i className="bx bx-bulb text-2xl pr-1 gradient-blue-font"></i>
          <p className="font-bold">More Insights</p>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JobGridCard;
