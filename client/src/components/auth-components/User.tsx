"use client";

import { UserProfile, useUser } from "@auth0/nextjs-auth0/client";
import { Dispatch, SetStateAction } from "react";

interface userProps {
  setUserStatus: Dispatch<SetStateAction<undefined | UserProfile>>;
}

const User = ({ setUserStatus }: userProps) => {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  setUserStatus(user);

  return (
    user && (
      <a href="/api/auth/logout">
        <div className="flex items-center justify-center gap-2">
          <img
            src={user.picture || "none"}
            alt={user.name || "Unknown"}
            width={30}
            height={20}
            className="rounded-full"
          />
        </div>
      </a>
    )
  );
};

export default User;
