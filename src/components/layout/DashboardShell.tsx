'use client';

import { Fragment, ReactNode, useMemo, useState } from 'react';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export type DashboardNavItem = {
  id: string;
  label: string;
  icon: string;
};

export default function DashboardShell({
  title,
  subtitle,
  navItems,
  activeId,
  onSelect,
  children,
}: {
  title: string;
  subtitle?: string;
  navItems: DashboardNavItem[];
  activeId: string;
  onSelect: (id: string) => void;
  children: ReactNode;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeItem = useMemo(
    () => navItems.find((n) => n.id === activeId) ?? navItems[0],
    [activeId, navItems]
  );

  const userInitial = (session?.user?.name?.charAt(0) || 'U').toUpperCase();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const Nav = ({ variant }: { variant: 'desktop' | 'mobile' }) => (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            onClick={() => {
              onSelect(item.id);
              if (variant === 'mobile') setSidebarOpen(false);
            }}
            className={[
              'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-slate-700 hover:bg-slate-100',
            ].join(' ')}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar */}
      <Transition show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <TransitionChild
            as={Fragment}
            enter="transition-opacity ease-linear duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </TransitionChild>

          <div className="fixed inset-0 flex">
            <TransitionChild
              as={Fragment}
              enter="transition ease-in-out duration-200 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-200 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <DialogPanel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-4 py-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                        🏥
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{title}</div>
                        {subtitle ? (
                          <div className="text-xs text-slate-500">{subtitle}</div>
                        ) : null}
                      </div>
                    </div>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="rounded-lg p-2 hover:bg-slate-100"
                      aria-label="Close sidebar"
                    >
                      ✕
                    </button>
                  </div>

                  <Nav variant="mobile" />
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-slate-200 bg-white px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              🏥
            </div>
            <div>
              <div className="text-base font-semibold text-slate-900">{title}</div>
              {subtitle ? <div className="text-sm text-slate-500">{subtitle}</div> : null}
            </div>
          </div>
          <Nav variant="desktop" />
        </div>
      </div>

      <div className="lg:pl-72">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden rounded-lg p-2 hover:bg-slate-100"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                ☰
              </button>
              <div>
                <div className="text-sm text-slate-500">Section</div>
                <div className="text-base font-semibold text-slate-900">
                  {activeItem?.label}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />

              <div className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-semibold text-slate-700">
                  {userInitial}
                </div>
                <div className="max-w-[180px]">
                  <div className="truncate text-sm font-medium text-slate-900">
                    {session?.user?.name || 'User'}
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    {session?.user?.email || ''}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="px-4 sm:px-6 py-6">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="p-4 sm:p-6">{children}</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

