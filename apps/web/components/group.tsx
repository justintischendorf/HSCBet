import { useMutation } from "@tanstack/react-query";
import { Crown, MoveRight } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

import { apiClient } from "@/lib/api-client";
import { useSession } from "@/lib/auth-client";
import { queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import type { GroupModel } from "@repo/database";

import { ConfirmAlert } from "./confirm-alert";
import { EditGroupPopup } from "./edit-group-popup";
import { FavoriteGroupButton } from "./favorite-group-button";
import { InviteMemberPopup } from "./invite-member-popup";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

type GroupWithUsers = GroupModel & {
  leader: {
    id: string;
    name: string;
    image: string | null;
  };
  members: {
    id: string;
    name: string;
    image: string | null;
    rank: { points: number } | null;
  }[];
  files: { id: string }[];
};

export default function Group({
  group,
  isFavorite,
}: {
  group: GroupWithUsers;
  isFavorite: boolean;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const isLeader = session?.user?.id === group.leader.id;
  const [showLeaveGroupConfirm, setShowLeaveGroupConfirm] =
    React.useState(false);
  const imageUrl = group.files?.[0]
    ? `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/media/${group.files[0].id}/image`
    : undefined;

  const { mutateAsync: leaveGroup, isPending: isLeavingGroup } = useMutation({
    mutationFn: async (groupId: string) => {
      return apiClient.api.group.leaveGroup.patch({ groupId });
    },
  });

  async function handleLeaveGroup(groupId: string) {
    const { error: leaveGroupError } = await leaveGroup(groupId);

    if (leaveGroupError) {
      toast.error(
        leaveGroupError.status + ": " + leaveGroupError.value.message,
      );
      return;
    }

    toast.success("Gruppe verlassen!");
    queryClient.invalidateQueries({ queryKey: ["groups"] });
  }

  const memberCount = group.members.length;
  const rankedMembers = [...group.members].sort((a, b) => {
    if (a.id === group.leader.id) return -1;
    if (b.id === group.leader.id) return 1;
    return (b.rank?.points ?? 0) - (a.rank?.points ?? 0);
  });

  return (
    <div className="relative w-full rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <FavoriteGroupButton
        groupId={group.id}
        isFavorite={isFavorite}
        className="absolute top-5 right-11 z-10"
      />
      <Accordion type="single" collapsible>
        <AccordionItem value="group" className="border-none">
          <AccordionTrigger className="rounded-none px-4 py-3.5 hover:bg-muted/40 hover:no-underline transition-colors">
            <div className="flex flex-row items-center gap-3.5 w-full min-w-0 pr-10">
              <Avatar className="size-13 shrink-0">
                <AvatarImage
                  id="profile-picture"
                  src={imageUrl}
                  alt="Profilbild"
                />
                <AvatarFallback className="text-xl">
                  {group.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 gap-1">
                <span className="text-base font-semibold truncate">
                  {group.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {memberCount}{" "}
                    {memberCount === 1 ? "Mitglied" : "Mitglieder"}
                  </span>
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-0">
            <div className="flex flex-col gap-5 border-t border-border bg-muted/20 px-4 py-5">
              {group.description && (
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-sm font-semibold">Beschreibung</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap wrap-break-word">
                    {group.description}
                  </p>
                </div>
              )}

              <Accordion type="single" collapsible>
                <AccordionItem value="members" className="border-none">
                  <AccordionTrigger className="rounded-none py-0 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">Mitglieder</h3>
                      <span className="text-xs font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                        {memberCount}/16
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0 pt-2.5">
                    <div className="max-h-96 overflow-y-auto">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {rankedMembers.map((user) => {
                          const points: number = user.rank?.points ?? 0;
                          const isGroupLeader = user.id === group.leader.id;

                          return (
                            <div
                              key={user.id}
                              className={cn(
                                "flex items-center gap-2.5 rounded-lg border px-3 py-2 min-w-0 border-border bg-muted",
                              )}
                            >
                              <Avatar size="sm" className="shrink-0">
                                <AvatarImage
                                  src={user.image ?? undefined}
                                  alt={user.name}
                                />
                                <AvatarFallback className="text-xs">
                                  {user.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="truncate text-xs sm:text-sm font-medium">
                                    {user.name}
                                  </span>
                                  {isGroupLeader && (
                                    <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-huk-accent px-1.5 py-0.5 text-[10px] font-medium text-background">
                                      <Crown className="size-2.5" />
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground tabular-nums">
                                  {points} {points === 1 ? "Punkt" : "Punkte"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3.5 sm:justify-end">
        {isLeader && (
          <InviteMemberPopup groupId={group.id} groupName={group.name} />
        )}
        {isLeader && (
          <EditGroupPopup
            group={{
              id: group.id,
              name: group.name,
              description: group.description ?? "",
              imageUrl,
            }}
          />
        )}
        <Button
          size="lg"
          className="flex-1 sm:flex-none"
          onClick={() => {
            router.replace(`/groups/${group.id}`);
          }}
        >
          Statistiken anzeigen
          <MoveRight />
        </Button>
        <Button
          variant="destructive"
          size="lg"
          className="flex-1 sm:flex-none"
          disabled={isLeavingGroup}
          onClick={() => {
            setShowLeaveGroupConfirm(true);
          }}
        >
          {isLeavingGroup && <Spinner />}
          Gruppe verlassen
        </Button>
      </div>

      <ConfirmAlert
        message="Du bist dabei, die Gruppe zu verlassen und musst erneut eingeladen werden, um wieder beitreten zu können."
        open={showLeaveGroupConfirm}
        onOpenChange={setShowLeaveGroupConfirm}
        onConfirm={async () => {
          await handleLeaveGroup(group.id);
        }}
        title="Gruppe verlassen?"
      />
    </div>
  );
}
