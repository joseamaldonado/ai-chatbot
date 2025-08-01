'use client';


import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';

// import { ModelSelector } from '@/components/model-selector';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { PlusIcon } from './icons';
import { useSidebar } from './ui/sidebar';
import { memo, useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { type VisibilityType } from './visibility-selector';
// import { VisibilitySelector } from './visibility-selector';
import type { Session } from 'next-auth';
import { UpgradeModal } from './upgrade-modal';
import { Crown } from 'lucide-react';
import { guestRegex } from '@/lib/constants';

function PureChatHeader({
  chatId,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
  session,
}: {
  chatId: string;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session;
}) {
  const router = useRouter();
  const { open } = useSidebar();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { width: windowWidth } = useWindowSize();
  
  const isGuest = guestRegex.test(session?.user?.email ?? '');
  const isActiveSubscriber = session?.user?.type === 'subscriber';

  return (
    <>
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
      <SidebarToggle />

      {(!open || windowWidth < 768) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="order-2 md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
              onClick={() => {
                router.push('/');
                router.refresh();
              }}
            >
              <PlusIcon />
              <span className="md:sr-only">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
      )}

      {/* Model selector commented out - using Claude 4 Sonnet for all users */}
      {/* {!isReadonly && (
        <ModelSelector
          session={session}
          selectedModelId={selectedModelId}
          className="order-1 md:order-2"
        />
      )} */}

      {/* Visibility selector commented out - using private by default */}
      {/* {!isReadonly && (
        <VisibilitySelector
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
          className="order-1 md:order-3"
        />
      )} */}

      {/* Upgrade button - show for non-subscribers at the very right */}
      {!isGuest && !isActiveSubscriber && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={() => setShowUpgradeModal(true)}
            >
              <Crown className="size-4 mr-1" />
              <span className="hidden sm:inline">Upgrade</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Upgrade to Premium</TooltipContent>
        </Tooltip>
      )}

    </header>
    
    <UpgradeModal
      isOpen={showUpgradeModal}
      onClose={() => setShowUpgradeModal(false)}
      isSubscribed={isActiveSubscriber}
      trigger="manual"
    />
  </>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return prevProps.selectedModelId === nextProps.selectedModelId;
});
