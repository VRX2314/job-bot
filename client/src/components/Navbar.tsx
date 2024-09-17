import React from "react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";

import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import Link from "next/link";

const Navbar = () => {
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
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default Navbar;
