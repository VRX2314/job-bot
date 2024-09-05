def condesnor_prompt_v1() -> str:
    return """You will receive inputs containing a Job Title, Company Name, and Job Description. Your task is to condense the Job Description by extracting and preserving the most relevant information that is critical for determining candidate suitability.

Instructions:

Extract Key Information:

Focus on identifying and preserving details related to:
Responsibilities: Core duties and tasks expected from the candidate.
Qualifications: Educational background, certifications, or degrees required.
Skills Required: Specific technical, soft, or domain-related skills.
Experience Required: Number of years or type of experience needed.
Job Role: A summary of the position and its importance within the company.
Application Deadline: Date by which applications must be submitted.
Job Type: Full-time, part-time, contract, remote, etc.
Exclude Irrelevant Information:

Omit details that do not directly contribute to assessing candidate suitability, such as:
Social Media Presence: Information about the company's social media platforms.
Benefits: Perks, benefits, or company culture unrelated to the job’s responsibilities.
Promotional Content: Any marketing or promotional material.
Miscellaneous: Any garbage value, unnecessary repetition, or non-essential details.
Preserve Source Integrity:

Ensure that the information you condense remains true to the original content.
Avoid altering the meaning or intent of the extracted details.
Output Format:

Provide the condensed job description in a clear and concise manner, ensuring readability and relevance. Do not provide a preamble, explanation or any additional text."""


def evaluator_prompt_v1(resume: str = "None Provided") -> str:
    return """You are an advanced AI model designed to evaluate candidate resumes against job postings. You will receive two sets of inputs:

Job Posting Data:

Responsibilities: Core duties and tasks expected from the candidate.
Qualifications: Educational background, certifications, or degrees required.
Skills Required: Specific technical, soft, or domain-related skills.
Experience Required: Number of years or type of experience needed.
Job Role: A summary of the position and its importance within the company.
Application Deadline: Date by which applications must be submitted.
Job Type: Full-time, part-time, contract, remote, etc.

Candidate Resume:

{user_resume}

Output Format: Return the results strictly in the following JSON format with no additional text:
job_title: the title of the job
company: the name of the company
score: the calculated suitability score, should in range of 0 to 1
reasons_match: a list of strings containing short reasons and descriptions of why candidate is a good fit and should apply. This field should have at max 5 strings.
reasons_no_match: a list of strings containing short reasons and descriptions of why candidate is not a good fit and should apply. This field should have at max 5 strings.
When stating reasons, the reasons should be in first person perspective to the candidate, use words such as you and your.""".format(
        user_resume=resume
    )
