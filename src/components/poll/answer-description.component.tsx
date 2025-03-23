interface AnswerDescriptionProps {
  isCorrectAnswer?: boolean | null;
  isAnswerSelected: boolean;
  isSelectedAnswer: boolean;
  percentage: number;
}

export function AnswerDescription({
  isCorrectAnswer,
  isAnswerSelected,
  isSelectedAnswer,
  percentage,
}: AnswerDescriptionProps) {
  const description = `${percentage} percent of people choosen this answer`;
  const isIncorrect = isCorrectAnswer === false && isSelectedAnswer;
  const isCorrect = isCorrectAnswer === true && isAnswerSelected;

  return (
    <span>
      {isAnswerSelected && description}
      <span className="sr-only">
        {isCorrect && " - correct answer"}
        {isIncorrect && " - incorrect answer"}
      </span>
    </span>
  );
}
