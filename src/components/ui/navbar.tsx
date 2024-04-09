"use client";

import React from 'react';
import { Disclosure } from "@headlessui/react";
import { X, Menu } from "lucide-react";
import { WalletButton } from "@/providers/solana-provider";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "./mode-toggle";
import { ClusterUiSelect } from "../cluster/cluster-ui";

const NavigationLink = ({ label, path, isActive }) => (
  <Link href={path} passHref>
    <a
      className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
        isActive
          ? "border-b-2 border-primary text-primary"
          : "border-b-2 border-transparent text-primary hover:border-secondary hover:text-gray-500"
      }`}
    >
      {label}
    </a>
  </Link>
);

const pages = [
  { label: "Account", path: "/account" },
  { label: "Tokens", path: "/tokens" },
  { label: "Feeds", path: "/feeds" },
  { label: "Swap", path: "/swap" },
  { label: "Pools", path: "/pools" },
  { label: "Donate", path: "/donate" },
  { label: "Clusters", path: "/clusters" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <Disclosure as="nav" className="bg-background">
      {({ open }) => (
        <>
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <Disclosure.Button className="inline-flex items-center justify-center p-2 text-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary md:hidden">
                <span className="sr-only">Open main menu</span>
                {open ? <X className="block h-6 w-6" aria-hidden="true" /> : <Menu className="block h-6 w-6" aria-hidden="true" />}
              </Disclosure.Button>
              <div className="flex-shrink-0">
                <Link href="/" passHref>
                  <Image src="/bark-logo-dark.svg" alt="Bark Logo" width={100} height={100} priority />
                </Link>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                {pages.map((page) => (
                  <NavigationLink key={page.path} {...page} isActive={pathname.startsWith(page.path)} />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <WalletButton />
              <ClusterUiSelect />
              <ModeToggle />
            </div>
          </div>
          <Disclosure.Panel className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {pages.map((page) => (
                <NavigationLink key={page.path} {...page} isActive={pathname.startsWith(page.path)} />
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
