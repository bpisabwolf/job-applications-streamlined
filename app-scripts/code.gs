function onOpen() {
  SpreadsheetApp.getUi()
  .createMenu("Job Tools")
  .addItem("Add Job Post", "showJobPostSidebar")
  .addToUi();
}
function showJobPostSidebar() {
  const html = HtmlService
    .createHtmlOutputFromFile("JobPostSidebar")
    .setTitle("Add Job Post");

  SpreadsheetApp.getUi().showSidebar(html);
}

function testReceiveJobPost(jobData) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  // Change "Tracker" if your main sheet tab has a different name.
  const sheet = spreadsheet.getSheetByName("Tracker") || spreadsheet.getActiveSheet();

  const today = new Date();

  const parsedJob = parseJobWithGemini(jobData);

//Hardcoded version
//Revise,, July 25,2026
/*
  const row = [
    "TEST COMPANY",                 // Company
    "TEST ROLE",                    // Role
    "Placeholder",                  // Description
    "Tech Analyst",                 // Job Type
    jobData.source,                 // Source
    jobData.jobLink,                // Link
    today,                          // Date Found
    "",                             // Date Applied
    "Saved",                        // Status
    "Decent Fit",              // Priority
    "Unknown",                      // Pay Range
    "Unknown",                      // Location/Remote
    "Test why I fit",               // Why I Fit
    "Resume_Test",                  // Resume Version
    "Maybe",                        // Cover Letter?
    "",                             // Contact / Recruiter
    "Test next action",             // Next Action
    "",                             // Follow-up Date
    "Test notes: " + jobData.jobDescription.slice(0, 100) // Notes
  ];
  */

  const row = [
    parsedJob.company,              // Company
    parsedJob.role,                 // Role
    parsedJob.description,          // Description
    parsedJob.jobType,              // Job Type
    jobData.source,                 // Source
    jobData.jobLink,                // Link
    today,                          // Date Found
    "",                             // Date Applied
    "Saved",                        // Status
    parsedJob.priority,             // Priority
    parsedJob.payRange,             // Pay Range
    parsedJob.locationRemote,       // Location/Remote
    parsedJob.whyIFit,              // Why I Fit
    parsedJob.resumeVersion,        // Resume Version
    parsedJob.coverLetter,          // Cover Letter?
    "",                             // Contact / Recruiter
    parsedJob.nextAction,           // Next Action
    "",                             // Follow-up Date
    parsedJob.notes                 // Notes
  ];

  //sheet.appendRow(row);
  //const targetRow = sheet.getLastRow() + 1;
  const targetRow = getNextEmptyRowByColumnA_(sheet);
  sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);

  return "Added test row to tracker.";
}

function getNextEmptyRowByColumnA_(sheet) {
  const startRow = 2; // skip header
  const maxRows = sheet.getMaxRows();

  const values = sheet
    .getRange(startRow, 1, maxRows - startRow + 1, 1)
    .getValues();

  for (let i = 0; i < values.length; i++) {
    const cellValue = values[i][0];

    if (cellValue === null || String(cellValue).trim() === "") {
      return startRow + i;
    }
  }

  return maxRows + 1;
}

function parseJobWithGemini(jobData){
   const apiKey = PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
   if(!apiKey){
    throw new Error("Missing GEMINI_API_KEY in Script Properites.");
   }
   const model = "gemini-2.5-flash";

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/" +
    model +
    ":generateContent?key=" +
    encodeURIComponent(apiKey);

  const prompt = buildJobParserPrompt_(jobData);

  //actual parsing and communicating
  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          company: { type: "string" },
          role: { type: "string" },
          description: { type: "string" },
          jobType: { type: "string" },
          priority: { type: "string" },
          payRange: { type: "string" },
          locationRemote: { type: "string" },
          whyIFit: { type: "string" },
          resumeVersion: { type: "string" },
          coverLetter: { type: "string" },
          nextAction: { type: "string" },
          notes: { type: "string" }
        },
        required: [
          "company",
          "role",
          "description",
          "jobType",
          "priority",
          "payRange",
          "locationRemote",
          "whyIFit",
          "resumeVersion",
          "coverLetter",
          "nextAction",
          "notes"
        ]
      }
    }
  };

  const response = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const statusCode = response.getResponseCode();
  const body = response.getContentText();

  if (statusCode < 200 || statusCode >= 300) {
    throw new Error("Gemini API error " + statusCode + ": " + body);
  }

  const result = JSON.parse(body);

  const text = result.candidates &&
    result.candidates[0] &&
    result.candidates[0].content &&
    result.candidates[0].content.parts &&
    result.candidates[0].content.parts[0] &&
    result.candidates[0].content.parts[0].text;

  if (!text) {
    throw new Error("Gemini response did not contain parsable text: " + body);
  }

  return JSON.parse(text);
  
}

//how generation is formed, and how we ask
function buildJobParserPrompt_(jobData) {
  return `
Extract this job posting into one job tracker row.

Return JSON only. Do not include markdown. Do not include commentary.

Use these exact allowed Job Type values:
- SWE-Java
- SWE-Other
- QA/UA
- Tech Support/Helpdesk
- Business Analyst
- Tech Analyst
- Retail
- Implementation / Product Support
- Accounting / Ops

Use these exact allowed Priority values:
- Strong Fit
- Decent Fit
- Fuck It We Ball

Use these exact Resume Version values:
- Resume_SWE_Java
- Resume_SWE_Other
- Resume_QA_UAT
- Resume_BA_TechAnalyst
- Resume_TechSupport
- Resume_Ops
- Resume_Retail

Default values:
- description: "Placeholder"
- coverLetter: "Maybe"
- If pay is not listed, payRange: "Unknown"
- If location is unclear, locationRemote: "Unknown"
- If company is unclear, company: "Unknown"
- If role is unclear, role: "Unknown"

Candidate background:
BS Computer Science from UIC. Former Accenture software engineer/senior analyst with Java Spring, Scala microservices, API development, backend systems, QA/testing, improved new-feature test coverage from about 30% to 90%, PostgreSQL validation, Agile, CI/CD, OpenShift, Tekton, Terraform, GCP, BigQuery, Node.js, documentation, and healthcare/finance/consumer goods/public sector client exposure. Current AutoZone experience includes customer-facing troubleshooting, retail operations, parts/inventory familiarity, and explaining technical issues to non-technical customers.

Priority rules:
- Strong Fit = close match to candidate background and worth tailoring seriously.
- Decent Fit = realistic but has some gaps.
- Fuck It We Ball = reach, stack mismatch, seniority mismatch, domain mismatch, or quick-apply only.

Source:
${jobData.source}

Link:
${jobData.jobLink}

Job post:
${jobData.jobDescription}
`;
}
