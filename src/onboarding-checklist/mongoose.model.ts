import {
  OnboardingChecklist,
  OnboardingChecklistSchema,
} from './entities/onboarding-checklist.entity';

export const mongooseModel = [
  {
    name: OnboardingChecklist.name,
    schema: OnboardingChecklistSchema,
  },
];
