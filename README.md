# 🤖 Autonomous AI GitHub Issue Triage Agent

A lightweight, custom-built Node.js automation agent that acts as an intelligent software engineering triage assistant. It continuously monitors a GitHub repository via the REST API, leverages the **Gemini 2.5 Flash LLM** to analyze unstructured issue descriptions, dynamically applies appropriate labels (`bug`, `question`, `documentation`), and leaves context-aware confirmation comments.

---

## 🚀 The Architecture Evolution (Why This Exists)

Originally, this project was designed to be built using a low-code workflow automation platform (**n8n**) hosted inside a local Docker container. However, integrating cloud-based webhooks (GitHub) with a local host (`localhost`) introduced significant networking overhead:
* Requiring local network tunneling services (`ngrok`).
* Dealing with Docker network isolation and firewall blocks.
* Subject to connection timeouts and third-party tunnel service deprecations.

### The Code-First Solution
To eliminate these infrastructure headaches, this project was pivoted into a **pure, event-driven Node.js background worker script**. Instead of exposing local endpoints via webhooks, this agent utilizes **efficient REST API polling via the GitHub Octokit client**. 

**Result:** Zero Docker overhead, zero open incoming ports, zero firewall configurations, and 100% control over the codebase.

---

## ✨ Features

* **Smart Classification:** Uses the `gemini-2.5-flash` model to look past simple keyword matches and dynamically read the contextual "intent" of an issue.
* **Octokit REST Integration:** Programmatically authenticates, fetches issue states, applies labels, and posts live comments back to GitHub.
* **Safe Resiliency Loops:** Built with automated execution blocks that run indefinitely without leaking connections or double-triaging existing labeled issues.
* **Environment Security:** Absolute isolation of sensitive GitHub Personal Access Tokens (PAT) and Gemini API keys using `dotenv`.

---

## 🛠️ Tech Stack

* **Runtime:** Node.js (v24.x)
* **Language:** Modern JavaScript (ESM / Import Syntax)
* **SDKs:** `@google/generative-ai`, `@octokit/rest`
* **Configuration Management:** `dotenv`

---

## 📦 Installation & Setup

1. **Clone the Repository:**
   ```bash
   git clone [https://github.com/Joel-Dag/github-ai-triage-agent.git](https://github.com/Joel-Dag/github-ai-triage-agent.git)
   cd github-ai-triage-agent
Install Dependencies:

Bash
npm install
Configure Environment Variables:
Create a .env file in the root directory:

and add these

GITHUB_TOKEN=your_github_personal_access_token
REPO_OWNER=your github user name
REPO_NAME=your-sandbox-repo-name
GEMINI_API_KEY=your_gemini_api_key

Run the Agent:

Bash
node agent.js

🧪 Proof of Concept & Live Validation
This agent is verified and was actively triaging issues. You can observe its live automated workflow directly inside this repository's issues tab.

The Test Case Breakdown:
The Issue: A mock issue titled "Critical Login Crash" was submitted to the repository completely unlabelled.

The Execution Loop: The agent captured the issue payload via the API stream and passed the text to the LLM engine.

The Result: The model successfully processed the intent, accurately categorized it, and pushed the updates back to GitHub in real-time.


// Terminal Log Execution Output:
Looking for new unlabelled issues...
Analyzing issue #5 with AI...
Successfully triaged issue #5 as: bug
🖼️ Automation in Action
When the agent fires, it automatically updates the issue interface natively:

Dynamic Tag: [bug] label applied instantly.

Automated Dispatch Comment: > 🤖 AI Triage Agent: I've analyzed this issue description using an LLM and classified it as a bug. Our developers have been notified!
