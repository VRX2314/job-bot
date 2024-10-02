import React from "react";

export interface JobDataItem {
  jobCard: React.ReactElement;
  score: number;
}

export interface JobData {
  job_title: string;
  company: string;
  link: string;
  response_condenser: string;
  metadata_condenser: {
    token_usage: {
      completion_tokens: number;
      prompt_tokens: number;
      total_tokens: number;
      completion_time: number;
      prompt_time: number;
      queue_time: number;
      total_time: number;
    };
    model_name: string;
    system_fingerprint: string;
    finish_reason: string;
    logprobs: null;
  };
  response_evaluator: {
    score: number;
    reasons_match: string[];
    reasons_no_match: string[];
    reasons_match_c: [];
    reasons_no_match_c: [];
  };
  metadata_evaluator: {
    token_usage: {
      completion_tokens: number;
      prompt_tokens: number;
      total_tokens: number;
      completion_time: number;
      prompt_time: number;
      queue_time: number;
      total_time: number;
    };
    model_name: string;
    system_fingerprint: string;
    finish_reason: string;
    logprobs: null;
  };
  api_calls: number;
}
