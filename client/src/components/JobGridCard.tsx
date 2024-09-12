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

const JobGridCard = () => {
  const pillComponents = () => {
    return (
      <div className="flex flex-wrap py-2 gap-2">
        <div className="text-sm font-semibold border border-green-500 bg-green-50 rounded-full px-4 py-2">
          ML Experience
        </div>
        <div className="text-sm font-semibold border border-green-500 bg-green-50 rounded-full px-4 py-2">
          Deep Learning Expertise
        </div>
        <div className="text-sm font-semibold border border-green-500 bg-green-50 rounded-full px-4 py-2">
          Academic Projects
        </div>
        <div className="text-sm font-semibold border border-green-500 bg-green-50 rounded-full px-4 py-2">
          Inter Personal Skills
        </div>
        <div className="text-sm font-semibold border border-green-500 bg-green-50 rounded-full px-4 py-2">
          API Creation Experience
        </div>
      </div>
    );
  };

  const pillComponentsTemp = () => {
    return (
      <div className="flex flex-wrap py-2 gap-2">
        <div className="text-sm font-semibold border border-red-500 bg-red-50 rounded-full px-4 py-2">
          NMIMS MPSTME
        </div>
        <div className="text-sm font-semibold border border-red-500 bg-red-50 rounded-full px-4 py-2">
          No Diploma
        </div>
        <div className="text-sm font-semibold border border-red-500 bg-red-50 rounded-full px-4 py-2">
          Abhay Kohle
        </div>
      </div>
    );
  };

  return (
    <Card className="w-[460px] rounded-3xl p-2 border-slate-100 shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center m-0 p-2 space-y-0">
        <div className="m-0 font-medium flex items-center border border-slate-300 p-2 rounded-full">
          <i className="bx bx-calendar pr-1 text-2xl gradient-blue-font"></i>
          11/09/24
        </div>
        <div className="m-0 font-semibold text-green-500">100% Match</div>
      </CardHeader>
      <CardContent className="p-2 pt-4">
        <div className="flex flex-col gap-0">
          {/* {Comapny and Designation} */}
          <p className="font-semibold text-[1rem]">Company Name</p>
          <h1 className="font-bold text-[2rem]">Designation</h1>
        </div>
        <div className="flex flex-col pt-4">
          {/* {Good Fit} */}
          <p>You're a Good Fit for</p>
          {pillComponents()}
        </div>
        <div className="flex flex-col pt-4">
          {/* {Good Fit} */}
          <p>You're a Not a Good Fit for</p>
          {pillComponentsTemp()}
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
