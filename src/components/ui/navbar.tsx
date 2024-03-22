"use client";
import { Disclosure } from "@headlessui/react";
import { X, Menu } from "lucide-react";
import { WalletButton } from "@/providers/solana-provider";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "./mode-toggle";
import { ClusterUiSelect } from "../cluster/cluster-ui";

const pages: { label: string; path: string }[] = [
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
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="-ml-2 mr-2 flex items-center md:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-primary hover:bg-secondary hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <X className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-shrink-0 items-center">
                <Link className="flex items-center space-x-3 rtl:space-x-reverse" href="/">
                  <Image className="w-auto h-8" alt="Bark Logo" src="/bark-logo-dark.svg" width={46} height={46} priority />
                </Link>
              </div>
              <div className="hidden md:ml-3 md:flex md:space-x-6">
                {pages.map(({ label, path }) => (
                  <Link
                    key={path}
                    className={
                      pathname.startsWith(path)
                        ? "inline-flex items-center border-b-2 border-primary px-1 pt-1 text-sm font-medium text-primary"
                        : "inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-primary hover:border-secondary hover:text-gray-500"
                    }
                    href={path}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0">
                <WalletButton />
              </div>
              <div className="flex-shrink-0">
                <ClusterUiSelect />
              </div>
              <div className="flex-shrink-0">
                <ModeToggle />
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {pages.map(({ label, path }) => (
                <Link
                  key={path}
                  className={
                    pathname.startsWith(path)
                      ? "block border-l-4 border-primary bg-secondary py-2 pl-3 pr-4 text-base font-medium text-primary sm:pl-5 sm:pr-6"
                      : "block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-primary hover:border-primary hover:bg-secondary hover:text-gray-500 sm:pl-5 sm:pr-6"
                  }
                  href={path}
                >
                  {label}
                </Link>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
