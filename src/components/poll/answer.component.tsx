import {
  Answer as AnswerEntity,
  UserAnswer,
} from "@common/api/schemas/message.schema";
import { FormRadioField } from "@components/form-field/form-radio-field.component";
import { CSSProperties, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { AnswerLabel } from "./answer-label.component";
import { useAnswer } from "./use-answer.hook";
import { AnswerDescription } from "./answer-description.component";
import { AnswerCheckboxInner } from "./answer-checkbox-inner.component";

interface AnswerProps {
  answer: AnswerEntity;
  pollId: number;
  messageId: number;
  index: number;
  answers: AnswerEntity[];
  userAnswers: UserAnswer[];
  currentUserAnswer?: UserAnswer;
  createUserAnswer: (data: { answerId: number; messageId: number }) => void;
}

export function Answer({
  answer: pollAnswer,
  pollId,
  messageId,
  index,
  userAnswers,
  currentUserAnswer,
  createUserAnswer,
}: AnswerProps) {
  const {
    onClick,
    className,
    answer,
    isCorrectAnswer,
    color,
    isSelectedAnswer,
    isQuizAnswer,
    isAnswerSelected,
  } = useAnswer({
    createUserAnswer,
    messageId,
    answer: pollAnswer,
    currentUserAnswer,
  });

  const answersCount = useMemo(
    () =>
      userAnswers.filter(({ pollAnswerId }) => pollAnswerId === pollAnswer.id)
        .length,
    [pollAnswer.id, userAnswers]
  );

  const percentage = useMemo(
    () => Number((answersCount / userAnswers.length).toFixed(2)) * 100,
    [answersCount, userAnswers.length]
  );

  return (
    <>
      <div
        className="relative"
        style={
          {
            "--color": color,
            "--width": `${percentage}%`,
          } as CSSProperties
        }
      >
        <div className="bg-[color:var(--color)]/15 absolute w-(--width) h-full z-20"></div>
        <div className="bg-black-660 absolute w-full h-full z-10"></div>
        <FormRadioField
          name={`answers-${pollId}`}
          id={`answers-${pollId}-${pollAnswer.id}`}
          aria-disabled={isAnswerSelected}
          checked={isSelectedAnswer}
          onClick={onClick}
          className={className}
          label={
            <AnswerLabel
              answer={answer}
              index={index}
              isAnswerSelected={isAnswerSelected}
              percentage={percentage}
            />
          }
          description={
            <AnswerDescription
              isAnswerSelected={isAnswerSelected}
              isCorrectAnswer={isCorrectAnswer}
              isSelectedAnswer={isSelectedAnswer}
              percentage={percentage}
            />
          }
          checkboxClassName={twMerge(
            isAnswerSelected && !isSelectedAnswer && "hidden",
            isQuizAnswer && isAnswerSelected && "w-fit h-fit outline-0 mx-0"
          )}
        >
          {isQuizAnswer && (
            <AnswerCheckboxInner
              isAnswerSelected={isAnswerSelected}
              isCorrectAnswer={isCorrectAnswer}
              isSelectedAnswer={isSelectedAnswer}
            />
          )}
        </FormRadioField>
      </div>
    </>
  );
}
