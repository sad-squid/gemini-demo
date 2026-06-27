# Project Notes

## Overview
Working on hackathon for Gemini AI Hackathon (https://luma.com/geminitokyo)

## ​Judging Criteria
- ​Use of Google Cloud: Your project must use Google Cloud products (Gemini API, AI Studio, Antigravity, Vertex AI, etc.). Missing integration disqualifies your team from prizes.
- ​Innovation: How creative and original is your approach? Bonus points for using the latest I/O 2026 capabilities — Managed Agents, multimodal generation.
- ​Completeness: Does it work? Is it demo-ready?
- ​Deployed project: must submit your deployed app/website link through agent runtime/cloud run

## Final Submission
The final submission requires the following and will be preliminarily judged via LLM:

- Project Name
- Team Members Names (separated by a comma)
- Team Members Emails (separated by a comma)
- GitHub Repository Link (Make your repo public)
- Deployed App or Website Link
- Slide Deck (Under 10 Pages, PDF only)
    - Upload 1 supported file: PDF. Max 10 MB.
- Short Video Demo (Under Two Minutes)
    - Upload 1 supported file: video. Max 10 MB.

## Goals:

I'm trying to create a hyperlocalized event/context builder app that will populate user-submitted photos 
and generate proper structured models of events, venues, restaurants/etc. by using agentic supported searches. 

## Notes: 

During the introduction, there was heavy emphasis on encouraging the usage of the following tools:
- Google Cloud / Google Cloud Run
- Google Cloud - Agent Platform, Agent Studio
- Google Cloud - Agent Development Kit
- Google Cloud Shell

Notably - one of the requirements is to submit the GitHub repo - so we should account for that. 
I'd like you to consider various "agents" we can leverage for this hackathon, as well as a general product plan that we can produce in a docs/ directory first. 

All code should go into the gemini-demo directory, which is accessible via SSH key (you can find this in the root level ~/definitely_not_secrets.txt file) 
The github can be found here remotely, but is also localy cloned. https://github.com/sad-squid/gemini-demo 