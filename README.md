# job-applications-streamlined
Google Web App starting as AppScript tool for Google Sheets. Given application link, where found, and description, creates google Sheet line with appropriate info and filled cells. As of now rigid, will add feature to customize feel

## Current Features

- Custom Google Sheets menu: `Job Tools`
- Sidebar form for:
  - Job link
  - Source
  - Job description
- Gemini API parsing for job postings
- Automatically fills tracker fields:
  - Company
  - Role
  - Job Type
  - Priority
  - Pay Range
  - Location/Remote
  - Why I Fit
  - Resume Version
  - Next Action
  - Notes
- Writes to the first available tracker row based on blank Company cells
- Works with Google Sheets dropdown/data validation values
- Supports conditional formatting for rejected/no-response jobs

## Planned Features

- Add manual Company and Role fields to improve parsing accuracy
- Move candidate background into a reusable constant
- Add fallback handling for Gemini API quota/server errors
- Save full job descriptions into Google Docs
- Insert the Google Doc link into the Description column
- Add a Find / Update Job tool to quickly update application status

## Tech Stack

- Google Sheets
- Google Apps Script
- HTML sidebar
- Gemini API

## Notes

This is a personal workflow automation project built to reduce friction in tracking job applications. It is currently rigid and tailored to my own tracker structure, but the long-term goal is to make it more configurable.

Then add your actual code files to GitHub:

Code.gs
JobPostSidebar.html
README.md

If you don’t want to mess with command line yet, use GitHub’s web UI:

Add file → Create new file

Make one called:

Code.gs

Paste your Apps Script code.

Then another:

JobPostSidebar.html

Paste the sidebar HTML.

Important: before you paste publicly, remove anything sensitive:

GEMINI_API_KEY

Should not be in code. Your code should only have:

PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY")

No actual key. No full private résumé if you don’t want it public. For candidate background, use a placeholder like:

const CANDIDATE_BACKGROUND = `
Replace this with your own candidate background.
`;

After that, commit with something boring:

Add Apps Script and sidebar prototype

Then later you can add screenshots and setup instructions. Right now, the next best move is: fix the README wording and upload the two code files.
