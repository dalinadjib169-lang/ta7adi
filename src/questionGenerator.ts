import { Question } from './types';

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const generateOptions = (correct: string, type: 'number' | 'expression' | 'boolean'): string[] => {
  const options = new Set<string>([correct]);
  if (type === 'boolean') return ['صحيحة', 'خاطئة'];
  let attempts = 0;
  while (options.size < 4 && attempts < 50) {
    attempts++;
    if (type === 'number') {
      const val = parseFloat(correct);
      if (isNaN(val)) {
        options.add(correct + " " + getRandomInt(1, 5));
      } else {
        const offset = getRandomInt(1, 10);
        const sign = Math.random() > 0.5 ? 1 : -1;
        const option = Math.abs(val + offset * sign).toString();
        if (option !== "0" || val === 0) options.add(option);
      }
    } else {
      const variations = [correct.replace('+', '-'), correct.replace('-', '+'), correct.replace('x', 'y'), correct + " + 1"];
      options.add(variations[getRandomInt(0, variations.length - 1)]);
    }
  }
  while (options.size < 4) options.add(correct + "_" + options.size);
  return shuffleArray(Array.from(options));
};

export const generateQuestion = (difficulty: number = 1): Question => {
  const topics = ['substitution', 'equality_inequality', 'literal_expression', 'proportionality'];
  const topic = topics[getRandomInt(0, topics.length - 1)];
  const id = Math.random().toString(36).substring(7);

  switch (topic) {
    case 'substitution': {
      const xVal = getRandomInt(2, 5 + difficulty);
      const a = getRandomInt(2, 6 + difficulty);
      const b = getRandomInt(1, 10 + difficulty);
      const content = `احسب قيمة العبارة ${a}x + ${b} من أجل x = ${xVal}`;
      const correct = (a * xVal + b).toString();
      return { id, type: 'text', answerType: 'choice', content, options: generateOptions(correct, 'number'), correctAnswer: correct, timer: 60 };
    }
    case 'equality_inequality': {
      const xVal = getRandomInt(1, 5);
      const a = getRandomInt(2, 5);
      const b = getRandomInt(1, 10);
      const result = a * xVal + b;
      const content = `هل المساواة ${a}x + ${b} = ${result} صحيحة من أجل x = ${xVal}؟`;
      return { id, type: 'text', answerType: 'choice', content, options: ['صحيحة', 'خاطئة'], correctAnswer: 'صحيحة', timer: 60 };
    }
    case 'literal_expression': {
      const a = getRandomInt(2, 10);
      const content = `بسط العبارة: ${a}x + 3x`;
      const correct = `${a + 3}x`;
      return { id, type: 'text', answerType: 'choice', content, options: generateOptions(correct, 'expression'), correctAnswer: correct, timer: 45 };
    }
    case 'proportionality': {
      const a = getRandomInt(2, 5);
      const b = a * getRandomInt(2, 4);
      const c = getRandomInt(10, 20);
      const content = `إذا كان ثمن ${a} كغ من التفاح هو ${b}00 دج، فما هو ثمن ${c} كغ؟`;
      const correct = ((b * 100 / a) * c).toString();
      return { id, type: 'text', answerType: 'choice', content, options: generateOptions(correct, 'number'), correctAnswer: correct, timer: 90 };
    }
    default:
      return { id, type: 'text', answerType: 'choice', content: "5 + 5؟", options: ["10", "11", "12", "13"], correctAnswer: "10", timer: 20 };
  }
};

export const generateChallengeQuestions = (count: number = 10): Question[] => {
  const questions: Question[] = [];
  for (let i = 0; i < count; i++) questions.push(generateQuestion(3));
  return questions;
};
