import { UserAnswer } from "@common/api/schemas/message.schema";

interface AnswerLabelProps {
  index: number;
  answer: string;
  isAnswerSelected: boolean;
  percentage: number;
}

export function AnswerLabel({
  index,
  answer,
  isAnswerSelected,
  percentage,
}: AnswerLabelProps) {
  return (
    <span className="flex w-full justify-between items-center gap-1">
      <span>
        <span aria-hidden>{index + 1}.&nbsp;</span>
        <span className="sr-only">Answer: </span>
        {answer}
      </span>
      {isAnswerSelected && (
        <span
          aria-hidden
          className="text-sm font-normal relative translate-y-2 px-4"
        >
          {percentage}%
        </span>
      )}
    </span>
  );
}
