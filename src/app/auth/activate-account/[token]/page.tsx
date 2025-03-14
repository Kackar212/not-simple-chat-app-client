import { activateAccount } from "@common/api";
import { ActivateAccount } from "./activate-account.component";
import { isForbidden, isInvalidToken, isNotFound } from "@common/api/api.utils";
import { Link } from "@components/link/link.component";
import { TextLink } from "@components/link/text-link.component";
import { ActivateAccountResult } from "./activate-account-result.component";

interface ActivateAccountProps {
  params: Promise<{ token: string }>;
}

export default async function ActivateAccountPage({
  params,
}: ActivateAccountProps) {
  const resolvedParams = await params;
  const { error } = await activateAccount(resolvedParams.token);

  if (isForbidden(error)) {
    return (
      <ActivateAccountResult heading="Link has expired!">
        Unfortunately link already expired but don&apos;t fret, we just sent you
        a new one.
      </ActivateAccountResult>
    );
  }

  if (isInvalidToken(error) || isNotFound(error)) {
    return (
      <ActivateAccountResult heading="Link is invalid!">
        If you copied it check if it was copied without missing something. Other
        reason may be that you are using old link that was already used, if that
        is case then your account is already active.
        <p className="mt-2">
          If link looks like the one sent to you and your account is not already
          activated then email us at{" "}
          <a href="mailto:admin@admin.com">
            <strong>admin@admin.com.</strong>
          </a>
        </p>
      </ActivateAccountResult>
    );
  }

  return <ActivateAccount />;
}
