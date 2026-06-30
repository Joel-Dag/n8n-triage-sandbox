import { Octokit } from "@octokit/rest";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const owner = process.env.REPO_OWNER;
const repo = process.env.REPO_NAME;

async function triageWithAI(title, body) {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
      You are an expert AI software engineering triage assistant.
      Analyze the following GitHub issue title and body, and classify it into exactly ONE of these labels: "bug", "question", or "documentation".

      Issue Title: ${title}
      Issue Body: ${body}

      Respond with only the single label word in lowercase. Do not include any punctuation, explanations, or extra text.
    `;

    const result = await model.generateContent(prompt);
    const classification = result.response.text().trim().toLowerCase();

    // Fallback security check
    if (["bug", "question", "documentation"].includes(classification)) {
      return classification;
    }
    return "question"; // Default fallback
  } catch (error) {
    console.error("AI Classification failed, defaulting to question:", error.message);
    return "question";
  }
}

async function triageIncomingIssues() {
  console.log("Looking for new unlabelled issues...");

  try {
    const { data: issues } = await octokit.issues.listForRepo({
      owner,
      repo,
      state: "open",
    });

    for (const issue of issues) {
      if (issue.pull_request || issue.labels.length > 0) continue;

      console.log(`Analyzing issue #${issue.number} with AI...`);

      // 1. Get the smart classification from the LLM
      const label = await triageWithAI(issue.title, issue.body || "");

      // 2. Apply the dynamic label
      await octokit.issues.addLabels({
        owner,
        repo,
        issue_number: issue.number,
        labels: [label],
      });

      // 3. Post a smart dynamic comment
      await octokit.issues.createComment({
        owner,
        repo,
        issue_number: issue.number,
        body: `🤖 **AI Triage Agent:** I've analyzed this issue description using an LLM and classified it as a **${label}**. Our developers have been notified!`,
      });

      console.log(`Successfully triaged issue #${issue.number} as: ${label}`);
    }
  } catch (error) {
    console.error("Error executing triage cycle:", error.message);
  }
}

console.log("AI Triage Agent activated and monitoring repository...");
triageIncomingIssues();
setInterval(triageIncomingIssues, 30000);