import { mutations } from "@common/api";
import { useMutation } from "@common/api/hooks/use-mutation.hook";
import {
  Poll as PollProps,
  PollType,
} from "@common/api/schemas/message.schema";
import { authContext } from "@common/auth/auth.context";
import { useSafeContext } from "@common/hooks";
import { FormRadioField } from "@components/form-field/form-radio-field.component";
import { CSSProperties, useCallback, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Answer } from "./answer.component";
import { plural } from "@common/utils";

export function Poll({
  question,
  answers,
  id,
  type,
  pollUserAnswers,
  messageId,
}: PollProps & { messageId: number }) {
  const {
    auth: { user },
  } = useSafeContext(authContext);

  const { mutate: createUserAnswer } = useMutation({
    mutationFn: mutations.createUserAnswer,
  });

  const currentUserAnswer = pollUserAnswers.find(
    ({ userId }) => user.id === userId
  );

  const isQuiz = type === PollType.Quiz;

  const isSelectedAnswerCorrect =
    isQuiz && currentUserAnswer?.pollAnswer.isCorrectAnswer === true;

  const answerMessage = isSelectedAnswerCorrect
    ? "Your answer is correct"
    : "Your answer is incorrect";

  return (
    <section className="max-w-xl py-2">
      <h2 className="font-semibold text-lg mb-2">
        <span className="sr-only">Question: </span>
        {question}
      </h2>
      <section aria-label="Answers" className="flex flex-col gap-1.5 relative">
        {answers.map((answer, index) => (
          <Answer
            key={index}
            answer={answer}
            answers={answers}
            userAnswers={pollUserAnswers}
            currentUserAnswer={currentUserAnswer}
            createUserAnswer={createUserAnswer}
            pollId={id}
            messageId={messageId}
            index={index}
          />
        ))}
      </section>
      <span className="leading-none text-sm mt-1 flex justify-between">
        <span>
          {pollUserAnswers.length} {plural.member(pollUserAnswers.length)}{" "}
          answered.
        </span>
        <span
          className={twMerge(
            "text-red-500",
            isSelectedAnswerCorrect && "text-green-500"
          )}
        >
          {!isQuiz ? "" : currentUserAnswer && answerMessage}
        </span>
      </span>
    </section>
  );
}
