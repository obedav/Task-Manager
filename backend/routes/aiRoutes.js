'use strict';

const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const { authenticate } = require('../middleware/auth');
const Task = require('../models/Task');

const router = express.Router();

const getClient = () => {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
};

// POST /api/v1/ai/parse-task
// Natural language → structured task object
router.post('/parse-task', authenticate, async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ success: false, message: 'Text is required' });

    const client = getClient();
    if (!client) return res.status(503).json({ success: false, message: 'AI service not configured' });

    const today = new Date().toISOString().split('T')[0];
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `Extract a structured task from this natural language input. Today's date is ${today}.

Input: "${text}"

Respond with ONLY valid JSON (no markdown, no explanation):
{
  "title": "concise task title",
  "description": "optional details or empty string",
  "priority": "low|medium|high|urgent",
  "dueDate": "YYYY-MM-DD or null",
  "category": "optional category or empty string"
}`
      }]
    });

    const raw = message.content[0]?.text?.trim();
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return res.status(422).json({ success: false, message: 'Could not parse AI response', raw });
    }

    res.json({ success: true, task: parsed });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/ai/digest
// Weekly summary and suggestions for the authenticated user
router.post('/digest', authenticate, async (req, res, next) => {
  try {
    const client = getClient();
    if (!client) return res.status(503).json({ success: false, message: 'AI service not configured' });

    const tasks = await Task.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const summary = tasks.map(t => ({
      title: t.title,
      status: t.status,
      priority: t.priority,
      progress: t.progress,
      dueDate: t.dueDate
    }));

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `You are a productivity assistant. Analyze this user's tasks and give a concise weekly digest.

Tasks:
${JSON.stringify(summary, null, 2)}

Respond in this exact JSON format:
{
  "summary": "2-3 sentence overall summary",
  "wins": ["thing accomplished 1", "thing accomplished 2"],
  "overdue": ["overdue task titles"],
  "suggestions": ["actionable suggestion 1", "actionable suggestion 2", "actionable suggestion 3"],
  "focus": "single most important thing to do next"
}`
      }]
    });

    const raw = message.content[0]?.text?.trim();
    let digest;
    try {
      digest = JSON.parse(raw);
    } catch {
      return res.status(422).json({ success: false, message: 'Could not generate digest' });
    }

    res.json({ success: true, digest });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
