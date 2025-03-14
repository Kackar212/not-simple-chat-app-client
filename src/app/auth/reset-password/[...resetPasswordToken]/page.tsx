import { ResetPasswordForm } from "@components/reset-password-form/reset-password-form.component";

interface ResetPasswordProps {
  params: Promise<{
    resetPasswordToken: string[];
  }>;
}

export default async function ResetPassword({ params }: ResetPasswordProps) {
  const routeParams = await params;
  const { resetPasswordToken: [resetPasswordToken] = [] } = routeParams;

  return (
    <ResetPasswordForm
      isOldPasswordRequired={!resetPasswordToken}
      resetPasswordToken={resetPasswordToken}
    />
  );
}
