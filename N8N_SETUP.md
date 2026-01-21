# South Side Technologies Questionnaire Setup

## n8n Integration

The questionnaire form is configured to send data to your n8n backend. 

### Configuration

To set up the n8n webhook:

1. Create a new webhook endpoint in your n8n workflow
2. Copy your webhook URL
3. Add it to your `.env.local` file:

```
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/questionnaire
```

### Form Data Structure

The form sends the following data to your n8n webhook:

```json
{
  "companyName": "string",
  "contactName": "string",
  "email": "string",
  "phone": "string",
  "companySize": "string",
  "currentChallenges": ["string"],
  "interestedServices": ["string"],
  "budget": "string",
  "timeline": "string",
  "additionalInfo": "string"
}
```

### Form Fields

- **Contact Information**: Company name, contact name, email, phone, company size
- **Current Challenges**: Multiple-choice checkboxes for common pain points
- **Interested Services**: Multiple-choice checkboxes for available services
- **Budget Range**: Dropdown selection for budget ranges
- **Timeline**: Dropdown selection for project timeline
- **Additional Information**: Text area for extra details

The questionnaire is accessible at `/questionnaire` route.