import { Button } from "@components/button/button.component";
import { FormRadioField } from "@components/form-field/form-radio-field.component";
import { FormResult } from "@components/form-result/form-result.component";
import { Form } from "@components/form/form.component";
import { Modal } from "@components/modal/modal.component";
import { useModal } from "@components/modal/use-modal.hook";
import {
  MouseEventHandler,
  MutableRefObject,
  useCallback,
  useMemo,
} from "react";
import { FormProvider, useForm } from "react-hook-form";
import { FormHeader } from "@components/form-header/form-header.component";
import { z } from "zod";
import { createConfig } from "@common/use-form.config";
import { FormField } from "@components/form-field/form-field.component";
import PollIcon from "/public/assets/icons/poll.svg";
import CloseIcon from "/public/assets/icons/close.svg";
import PlusIcon from "/public/assets/icons/plus.svg";
import { twMerge } from "tailwind-merge";
import { useMutation } from "@common/api/hooks/use-mutation.hook";
import { mutations } from "@common/api";
import {
  AnswerSchema,
  PollSchema,
  PollType,
} from "@common/api/schemas/message.schema";

interface CreatePollProps {
  channelId: number;
}

const CreatePollSchema = PollSchema.extend({
  pollType: z.nativeEnum(PollType),
  id: z.void(),
  type: z.void(),
  correctAnswer: z.coerce.number(),
  answers: AnswerSchema.extend({ id: z.void() }).array(),
  pollUserAnswers: z.void(),
});

type CreatePoll = z.infer<typeof CreatePollSchema>;

const ANSWERS_LIMIT = 10;

export function CreatePoll({ channelId }: CreatePollProps) {
  const useFormResult = useForm<CreatePoll>(
    createConfig(CreatePollSchema, {
      defaultValues: {
        pollType: PollType.Default,
        answers: [{ answer: "" }],
        correctAnswer: 0,
      },
    })
  );

  const { handleSubmit, watch, setValue, reset } = useFormResult;

  const {
    mutate: createPoll,
    isPending,
    data: { status },
    reset: resetMutation,
  } = useMutation({
    mutationFn: mutations.createPoll,
    onSettled() {
      reset();
    },
  });

  const onClose = useCallback(() => {
    resetMutation();
  }, [resetMutation]);

  const { close, ref, open, isOpen } = useModal(onClose);

  const [pollType, answers] = watch(["pollType", "answers"]);

  const canBeSubmitted = answers.length > 0;
  const isAnswersLimitReached = answers.length === ANSWERS_LIMIT;

  const onSubmit = handleSubmit((data: CreatePoll) => {
    if (!canBeSubmitted || isPending) {
      return;
    }

    if (data.pollType === PollType.Quiz) {
      data.answers[data.correctAnswer].isCorrectAnswer = true;
    }

    createPoll({ ...data, channelId });
  });

  const createAnswer = useCallback(() => {
    setValue("answers", [...answers, { answer: "" }]);
  }, [setValue, answers]);

  const removeAnswer: MouseEventHandler = useCallback(
    ({ target }) => {
      if (answers.length === 1) {
        return;
      }

      const isElement = target instanceof Element;

      if (!isElement) {
        return;
      }

      const button = target.closest("button");

      if (!button) {
        return;
      }

      const {
        dataset: { answerId },
      } = button;

      if (!answerId) {
        return;
      }

      setValue(
        "answers",
        answers.filter((_, index) => Number(answerId) !== index)
      );
    },
    [answers, setValue]
  );

  const disableCorrectAnswerCheckbox: MouseEventHandler = useCallback(
    (e) => {
      if (pollType === PollType.Quiz) {
        return;
      }

      e.preventDefault();
    },
    [pollType]
  );

  const isCorrectAnswerSelected = answers.find(
    ({ isCorrectAnswer }) => isCorrectAnswer
  );

  return (
    <>
      <button
        type="button"
        className="size-6 flex justify-center items-center"
        onClick={open}
      >
        <span className="sr-only">Create poll</span>
        <PollIcon className="size-6 transition-all" aria-hidden />
      </button>
      <Modal close={close} ref={ref} isOpen={isOpen}>
        <FormProvider {...useFormResult}>
          <Form onSubmit={onSubmit} result={status}>
            <FormHeader Heading="h2">Create poll</FormHeader>
            <div className="my-2 w-full">
              <FormField name="question" label="Question" />
            </div>
            <fieldset className="w-full">
              <legend className="uppercase text-xs font-bold text-gray-360 mb-1">
                Poll type
              </legend>
              <FormRadioField
                value="Poll"
                label="Poll"
                name="pollType"
                id="poll"
                description="It works like a normal poll."
              />
              <FormRadioField
                value="Quiz"
                label="Quiz"
                name="pollType"
                id="poll-quiz"
                description="You can select correct answer."
              />
            </fieldset>
            <fieldset className="w-full mt-8">
              <legend className="uppercase font-bold text-white-500 text-sm m-0">
                Answers
              </legend>
              <div
                className="flex flex-col gap-y-0.5 mt-1"
                onClick={removeAnswer}
              >
                {answers.map((_, index, answers) => (
                  <fieldset key={index} className="relative my-1.5">
                    <legend>
                      <span className="sr-only">Answer</span> {index + 1}.
                    </legend>
                    <FormField
                      label="Answer"
                      name={`answers[${index}].answer`}
                      className="pr-10"
                    />
                    <Button
                      data-answer-id={index}
                      type="button"
                      className="absolute right-2 bottom-[34px] p-0.5 z-10 aria-disabled:hover:bg-blue-500 aria-disabled:cursor-not-allowed!"
                      aria-disabled={
                        answers.length === 1 || isAnswersLimitReached
                      }
                    >
                      <span className="sr-only">Remove answer {index}</span>
                      <CloseIcon aria-hidden className="size-5" />
                    </Button>
                    <FormRadioField
                      type="radio"
                      label="Mark as correct"
                      id={`correctAnswer-${index}`}
                      name={`correctAnswer`}
                      value={index}
                      variant="squircle"
                      aria-disabled={pollType !== PollType.Quiz}
                      size="sm"
                      onClick={disableCorrectAnswerCheckbox}
                      className={twMerge(
                        "bg-transparent has-[:checked]:bg-transparent p-0 rounded-none has-[[aria-disabled=true]]:cursor-not-allowed"
                      )}
                    />
                  </fieldset>
                ))}
              </div>
              <Button
                type="button"
                onClick={createAnswer}
                className="flex items-center gap-1 px-2 mt-4"
              >
                <PlusIcon aria-hidden className="size-5" />
                Add answer
              </Button>
            </fieldset>
            <Button
              type="submit"
              className="mt-8"
              aria-disabled={!canBeSubmitted || isPending}
              isLoading={isPending}
            >
              Create poll
            </Button>
          </Form>
        </FormProvider>
      </Modal>
    </>
  );
}
