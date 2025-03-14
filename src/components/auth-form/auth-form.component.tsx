import { Form, FormProps } from "@components/form/form.component";
import { twMerge } from "tailwind-merge";

export function AuthForm({ className, result, ...props }: FormProps) {
  return (
    <div className="flex w-[100%] h-[100%] justify-center items-center min-h-[100vh]">
      <Form
        {...props}
        result={result}
        className={twMerge(
          "dark:bg-black-630 rounded-lg p-8 shadow-xl gap-2 flex flex-col min-w-[280px] max-w-[460px] w-[90%]",
          className
        )}
      >
        {props.children}
      </Form>
    </div>
  );
}
