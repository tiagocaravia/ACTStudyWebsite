# OpenAI API Key Setup (Optional)

## Why Add OpenAI?

The AI feedback feature provides:
- **Personalized feedback**: Context-aware recommendations based on your specific performance patterns
- **Encouraging tone**: Motivational messages tailored to your progress
- **Actionable insights**: Specific study strategies based on your weak areas
- **Natural language**: More conversational and helpful explanations

## Without OpenAI

The system still works great with rule-based feedback that:
- Identifies weak areas (subjects with <70% accuracy)
- Provides structured recommendations
- Shows performance metrics

## Setup Instructions

### 1. Get an OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (you won't see it again!)

### 2. Add to Environment Variables

Add to your `backend/.env` file:

```env
OPENAI_API_KEY=sk-your-key-here
```

### 3. Install OpenAI Package

```bash
cd backend
pip install openai
```

### 4. Restart Your Backend

The system will automatically detect the API key and enable AI feedback.

## Cost Considerations

- GPT-3.5-turbo is very affordable (~$0.0015 per 1K tokens)
- Each feedback request uses ~300 tokens
- Estimated cost: ~$0.0005 per feedback request
- For 1000 students getting feedback: ~$0.50

## Testing

Once set up, the AI feedback will show "AI Generated" badge in the dashboard.
If OpenAI is unavailable, it automatically falls back to rule-based feedback.

