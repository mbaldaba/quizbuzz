import { PrismaClient, UserType, QuestionType } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Hash the admin password
  const hashedPassword = await argon2.hash('password');

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      type: UserType.ADMIN,
    },
  });

  console.log(`Created admin user: ${admin.username}`);

  // Questions data with multiple choice questions
  const questionsData = [
    {
      type: QuestionType.MULTIPLE_CHOICE,
      description: 'What is the capital of France?',
      choices: ['London', 'Berlin', 'Paris', 'Madrid'],
      correctAnswerIndex: 2,
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      description: 'Which planet is known as the Red Planet?',
      choices: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
      correctAnswerIndex: 1,
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      description: 'What is 2 + 2?',
      choices: ['3', '4', '5', '6'],
      correctAnswerIndex: 1,
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      description: 'Who painted the Mona Lisa?',
      choices: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Michelangelo'],
      correctAnswerIndex: 2,
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      description: 'What is the largest ocean on Earth?',
      choices: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
      correctAnswerIndex: 3,
    },
    {
      type: QuestionType.TRUE_OR_FALSE,
      description: 'The Earth is flat.',
      choices: ['True', 'False'],
      correctAnswerIndex: 1,
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      description: 'Which programming language is known for its use in web browsers?',
      choices: ['Python', 'Java', 'JavaScript', 'C++'],
      correctAnswerIndex: 2,
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      description: 'What year did World War II end?',
      choices: ['1943', '1944', '1945', '1946'],
      correctAnswerIndex: 2,
    },
    {
      type: QuestionType.TRUE_OR_FALSE,
      description: 'Water boils at 100 degrees Celsius at sea level.',
      choices: ['True', 'False'],
      correctAnswerIndex: 0,
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      description: 'Which element has the chemical symbol "O"?',
      choices: ['Gold', 'Oxygen', 'Silver', 'Iron'],
      correctAnswerIndex: 1,
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      description: 'How many continents are there?',
      choices: ['5', '6', '7', '8'],
      correctAnswerIndex: 2,
    },
    {
      type: QuestionType.TRUE_OR_FALSE,
      description: 'A triangle has four sides.',
      choices: ['True', 'False'],
      correctAnswerIndex: 1,
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      description: 'What is the smallest prime number?',
      choices: ['0', '1', '2', '3'],
      correctAnswerIndex: 2,
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      description: 'Which country is home to the kangaroo?',
      choices: ['New Zealand', 'Australia', 'South Africa', 'Brazil'],
      correctAnswerIndex: 1,
    },
    {
      type: QuestionType.TRUE_OR_FALSE,
      description: 'The sun revolves around the Earth.',
      choices: ['True', 'False'],
      correctAnswerIndex: 1,
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      description: 'What is the speed of light?',
      choices: ['299,792,458 m/s', '150,000,000 m/s', '500,000,000 m/s', '1,000,000 m/s'],
      correctAnswerIndex: 0,
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      description: 'Who wrote "Romeo and Juliet"?',
      choices: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
      correctAnswerIndex: 1,
    },
    {
      type: QuestionType.TRUE_OR_FALSE,
      description: 'Python is a compiled language.',
      choices: ['True', 'False'],
      correctAnswerIndex: 1,
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      description: 'What is the tallest mountain in the world?',
      choices: ['K2', 'Kangchenjunga', 'Mount Everest', 'Lhotse'],
      correctAnswerIndex: 2,
    },
    {
      type: QuestionType.MULTIPLE_CHOICE,
      description: 'Which gas do plants absorb from the atmosphere?',
      choices: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
      correctAnswerIndex: 2,
    },
  ];

  // Create questions with choices
  for (let i = 0; i < questionsData.length; i++) {
    const questionData = questionsData[i];
    
    // Create question first without correctAnswerId
    const question = await prisma.question.create({
      data: {
        type: questionData.type,
        description: questionData.description,
        createdById: admin.id,
        updatedById: admin.id,
      },
    });

    // Create choices
    const choices = await Promise.all(
      questionData.choices.map((choiceValue) =>
        prisma.questionChoice.create({
          data: {
            value: choiceValue,
            questionId: question.id,
            createdById: admin.id,
            updatedById: admin.id,
          },
        })
      )
    );

    // Update question with correct answer
    await prisma.question.update({
      where: { id: question.id },
      data: {
        correctAnswerId: choices[questionData.correctAnswerIndex].id,
      },
    });

    console.log(`Created question ${i + 1}: ${questionData.description}`);
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
