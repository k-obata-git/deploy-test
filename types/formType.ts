export type FormType = {
  id: number;
  title: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  questions: Question[];
  responses?: {
    id: number;
    submittedAt: string;
    answers: {
      id: number;
      responseId: number;
      questionId: number;
      optionId: number;
      text: string;
    }[];
  }[]
}

export type Question = {
  id: number;
  label: string;
  type: 'text' | 'radio' | 'checkbox';
  position?: number;
  formId?: number;
  createdAt?: Date;
  updatedAt?: Date;
  options?: Option[];
}

export type Option = {
  id: number;
  text: string;
  position: number;
  questionId: number;
}

export type Answer = {
  questionId: number;
  optionId: number | null;
  value: string;
}