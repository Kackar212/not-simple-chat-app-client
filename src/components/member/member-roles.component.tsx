import { Role } from "@common/api/schemas/role.schema";
import { twMerge } from "tailwind-merge";

interface MemberRolesProps {
  roles?: Role[];
  className?: string;
}

export function MemberRoles({ roles = [], className }: MemberRolesProps) {
  return (
    roles.length > 0 && (
      <div className={twMerge("mt-1 mb-6 flex flex-wrap gap-1", className)}>
        <h3 className="text-xs my-1 font-medium">Roles</h3>
        <button
          className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-black-430/30 rounded-[4px] font-medium leading-none border border-white-0 border-opacity-5"
          aria-label="Add role"
        >
          <span aria-hidden>+</span>
          {roles.length === 0 && <span aria-hidden>Add role</span>}
        </button>
        {roles.map(({ color, name }) => (
          <span
            key={name}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-black-430/30 rounded-[4px] font-medium leading-none border border-white-0 border-opacity-5"
          >
            <span
              className="flex size-3 rounded-[50%]"
              style={{ background: color }}
            ></span>
            {name}
          </span>
        ))}
      </div>
    )
  );
}
