# Image Moderation

This app uses OpenAI's moderation API to automatically approve or reject uploaded artwork.

## How it works

1. When a child uploads an image, it's immediately sent to OpenAI's moderation API
2. The API checks for inappropriate content across multiple categories
3. Images that pass moderation are automatically approved
4. Images that fail moderation are marked as rejected
5. If the API fails or no API key is set, images default to "pending" status

## Configuration

Add your OpenAI API key to `.env.local`:

```
OPENAI_API_KEY=your_openai_api_key
```

## Moderation Categories

The system is extra strict for children's content, checking for:
- Sexual content
- Violence
- Self-harm
- Harassment
- Hate speech

## Fallback Behavior

- No API key: Auto-approves all uploads (development mode)
- API error: Marks as "pending" for manual review
- Flagged content: Marked as "rejected"

## Moderation Status

Posts can have three statuses:
- `approved`: Visible in gallery
- `rejected`: Not visible, flagged by moderation
- `pending`: Awaiting manual review (only if API fails)