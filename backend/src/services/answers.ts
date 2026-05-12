import type { ChecklistAnswers } from "../schemas/business.js";

export function answersToConversationText(answers: ChecklistAnswers): string {
  const lines = [
    ["Business name", answers.businessName],
    ["Business description", answers.description],
    ["Customers", answers.customers],
    ["Services or products", answers.services],
    ["Website goal", answers.websiteGoal],
    ["Location or service area", answers.location],
    ["Contact email", answers.contactEmail],
    ["Contact phone", answers.contactPhone],
    ["Style preference", answers.stylePreference]
  ]
    .filter(([, value]) => value && String(value).trim().length > 0)
    .map(([label, value]) => `${label}: ${value}`);

  return lines.join("\n");
}
