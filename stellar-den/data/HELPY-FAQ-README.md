# Helpy FAQ Knowledge Base

This is the comprehensive FAQ knowledge base for **Helpy**, the AliceSolutions Group website bot.

## File Structure

- **File**: `helpy-faq.json`
- **Location**: `/stellar-den/data/helpy-faq.json`
- **Format**: JSON
- **Version**: 1.0.0

## How to Use This File

### For Bot Integration

1. **Load the JSON file** into your bot's knowledge base
2. **Parse the structure** to access:
   - Company information
   - FAQ entries with categories and tags
   - Tone guidelines
   - Common question variations

### Key Sections

#### 1. Metadata
Contains version info, bot name, and company details.

#### 2. Company Info
Core information about AliceSolutions Group:
- Leader: Udi Shkolnik
- Location: Toronto, Canada
- Mission and focus areas

#### 3. Tone Guidelines
Instructions for how Helpy should communicate:
- Simple, clear English
- Friendly, honest, and direct
- When to defer to human contact

#### 4. FAQs Array
Each FAQ entry contains:
- `id`: Unique identifier
- `category`: Topic category (company, services, smartstart, etc.)
- `tags`: Searchable keywords
- `question`: The question text
- `answer`: The answer text
- `relatedQuestions`: Array of related FAQ IDs

#### 5. Common Variations
Alternative phrasings for common questions to improve matching.

#### 6. Contact Info
Guidance on when and how to direct users to contact the team.

## FAQ Categories

- **company**: About AliceSolutions Group
- **services**: Security & compliance services
- **smartstart**: SmartStart ecosystem (venture building & community)
- **iso-studio**: ISO Studio tools and templates
- **audience**: Who we serve
- **getting-started**: How to begin working with us
- **pricing**: Cost and billing information
- **community**: Community events and features
- **security**: Data security and privacy
- **tools**: Software and tool access
- **trial**: Trial and testing options

## Bot Implementation Tips

### Question Matching
1. Use the `tags` array for keyword matching
2. Check `commonVariations` for alternative phrasings
3. Use `relatedQuestions` to suggest follow-up questions
4. Consider `category` for context-aware responses

### Response Generation
1. Use the `answer` field as the primary response
2. Reference `tone` guidelines for style
3. If uncertain, use `contactInfo` to direct to human contact
4. Include `relatedQuestions` as suggested follow-ups

### Example Bot Logic

```javascript
// Pseudo-code example
function findAnswer(userQuestion) {
  // 1. Search FAQs by tags and question text
  const matches = searchFAQs(userQuestion, faqData.faqs);
  
  // 2. Get best match
  const bestMatch = getBestMatch(matches);
  
  // 3. Get related questions
  const related = getRelatedQuestions(bestMatch.relatedQuestions);
  
  // 4. Format response with tone guidelines
  return formatResponse(bestMatch.answer, related, faqData.tone);
}
```

## Updating the FAQ

When updating this file:

1. **Increment version** in metadata
2. **Update lastUpdated** date
3. **Add new FAQs** with unique IDs
4. **Update relatedQuestions** arrays as needed
5. **Add variations** to commonVariations if needed

## Integration Examples

### For AI/LLM Bots
- Load as context/prompt material
- Use for few-shot learning examples
- Reference in system prompts

### For Rule-Based Bots
- Parse into decision tree
- Use tags for keyword matching
- Use categories for routing

### For Hybrid Bots
- Use for fallback responses
- Reference for context understanding
- Use for answer validation

## Notes

- All answers are written in simple, clear English
- Answers should be friendly, honest, and direct
- When specific details (pricing, legal) are needed, always direct to contact page
- Focus areas: Cybersecurity, ISO, SmartStart, Community

## Support

For questions about this FAQ file or bot integration, contact the development team.

