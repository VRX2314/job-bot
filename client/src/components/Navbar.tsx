"use client";

import React, { useState } from "react";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

import { UserProfile } from "@auth0/nextjs-auth0/client";

import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import Link from "next/link";
import Login from "@/components/auth-components/Login";
import User from "@/components/auth-components/User";

const Navbar = () => {
  const [userStatus, setUserStatus] = useState<undefined | UserProfile>(
    undefined,
  );

  return (
    // Add Link Elements for Each Page
    <NavigationMenu className="absolute w-full min-w-full justify-center border-b">
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Search
            </NavigationMenuLink>
          </Link>
          <Link href="/compatibility-score" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Compatibility Score
            </NavigationMenuLink>
          </Link>
          <Link href="/optimise-resume" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Optimise Resume
            </NavigationMenuLink>
          </Link>
          <Link href="/cover-letter" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Cover Letter
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        {!userStatus && (
          <Link href="/api/auth/login" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              <Login />
            </NavigationMenuLink>
          </Link>
        )}

        <User setUserStatus={setUserStatus} />
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default Navbar;
