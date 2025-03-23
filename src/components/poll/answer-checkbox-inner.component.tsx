import CheckmarkIcon from "/public/assets/icons/checkmark.svg";
import CloseIcon from "/public/assets/icons/close.svg";

interface CheckboxInnerProps {
  isCorrectAnswer?: boolean | null;
  isAnswerSelected: boolean;
  isSelectedAnswer: boolean;
}

export function AnswerCheckboxInner({
  isCorrectAnswer,
  isAnswerSelected,
  isSelectedAnswer,
}: CheckboxInnerProps) {
  if (isCorrectAnswer === true && isAnswerSelected) {
    return (
      <CheckmarkIcon
        aria-hidden
        className="text-white box-content p-1 size-4 rounded-[50%] bg-green-800"
      />
    );
  }

  if (isCorrectAnswer === false && isSelectedAnswer) {
    return (
      <CloseIcon
        aria-hidden
        className="text-white box-content p-1 size-4 rounded-[50%] bg-red-800"
      />
    );
  }

  return null;
}
