import { Answer } from "@common/api/schemas/message.schema";
import { authContext } from "@common/auth/auth.context";
import { useSafeContext } from "@common/hooks";
import { MouseEventHandler, useCallback } from "react";
import { twMerge } from "tailwind-merge";

interface UseAnswerProps {
  createUserAnswer: (data: { answerId: number; messageId: number }) => void;
  messageId: number;
  answer: Answer;
  currentUserAnswer?: {
    userId: number;
    pollAnswerId: number;
  };
}

interface UseColorProps {
  isAnswerSelected: boolean;
  isCorrectAnswer?: boolean | null;
}

const useColor = ({ isAnswerSelected, isCorrectAnswer }: UseColorProps) => {
  if (!isAnswerSelected) {
    return "";
  }

  if (isCorrectAnswer === false) {
    return "oklch(0.637 0.237 25.331)";
  }

  if (isCorrectAnswer === true) {
    return "hsl(147.23deg 79.32% 38.28%)";
  }

  return "hsl(234.935 85.556% 64.706%)";
};

export function useAnswer({
  createUserAnswer,
  messageId,
  answer: pollAnswer,
  currentUserAnswer,
}: UseAnswerProps) {
  const { id: answerId, answer, isCorrectAnswer } = pollAnswer;
  const isSelectedAnswer = currentUserAnswer?.pollAnswerId === answerId;
  const isQuizAnswer = typeof pollAnswer.isCorrectAnswer === "boolean";
  const isAnswerSelected = !!currentUserAnswer;

  const color = useColor({
    isAnswerSelected,
    isCorrectAnswer,
  });

  const className = twMerge(
    "hover:ring hover:ring-white/15 has-[:checked]:bg-transparent bg-transparent z-30",
    isAnswerSelected && isCorrectAnswer && "border border-green-500/40",
    isAnswerSelected && !isCorrectAnswer && "border border-red-500/40",
    isAnswerSelected && !isQuizAnswer && "border border-blue-500/40",
    isSelectedAnswer && isCorrectAnswer && "border-3 border-green-500",
    isSelectedAnswer && !isCorrectAnswer && "border-3 border-red-500",
    isSelectedAnswer && !isQuizAnswer && "border-3 border-blue-500",
    isAnswerSelected && "hover:ring-0 cursor-default"
  );

  const onClick: MouseEventHandler = useCallback(
    (e) => {
      if (currentUserAnswer) {
        e.preventDefault();

        return;
      }

      createUserAnswer({ answerId, messageId });
    },
    [answerId, createUserAnswer, currentUserAnswer, messageId]
  );

  return {
    onClick,
    currentUserAnswer,
    answer,
    className,
    isSelectedAnswer,
    isCorrectAnswer,
    color,
    isAnswerSelected,
    isQuizAnswer,
  };
}
