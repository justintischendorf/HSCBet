import type { GroupModel, Position } from "@repo/database";
import { MoveRight } from "lucide-react";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/queryClient";
import { toast } from "sonner";
import { ConfirmAlert } from "./confirm-alert";
import React from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

type GroupWithUsers = GroupModel & {
  user: {
    id: string;
    name: string;
    image: string | null;
    rank: { points: number; position: Position } | null;
  }[];
  files: { id: string }[];
};

const POSITION_LABELS: Record<Position, string> = {
  BRONZE: "Bronze",
  SILVER: "Silber",
  GOLD: "Gold",
  PLATINUM: "Platin",
  DIAMOND: "Diamant",
  DEFAULT: "Kein Rang",
};

const POSITION_ICONS: Record<Position, string> = {
  BRONZE: "/assets/images/rank-bronze.svg",
  SILVER: "/assets/images/rank-silver.svg",
  GOLD: "/assets/images/rank-gold.svg",
  PLATINUM: "/assets/images/rank-platinum.svg",
  DIAMOND: "/assets/images/rank-diamond.svg",
  DEFAULT: "/assets/images/rank-none.svg",
};

export default function Group({ group }: { group: GroupWithUsers }) {
  const router = useRouter();
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

  const memberCount = group.user.length;
  const rankedMembers = [...group.user].sort(
    (a, b) => (b.rank?.points ?? 0) - (a.rank?.points ?? 0),
  );

  return (
    <div className="w-full rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <Accordion type="single" collapsible>
        <AccordionItem value="group" className="border-none">
          <AccordionTrigger className="rounded-none px-4 py-3.5 hover:bg-muted/40 hover:no-underline transition-colors">
            <div className="flex flex-row items-center gap-3.5 w-full min-w-0">
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
                          const position: Position =
                            user.rank?.position ?? "DEFAULT";

                          return (
                            <div
                              key={user.id}
                              className="flex items-center gap-2.5 rounded-lg border border-border bg-muted px-3 py-2 min-w-0"
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
                                <span className="truncate text-xs sm:text-sm font-medium">
                                  {user.name}
                                </span>
                                <span className="text-xs text-muted-foreground tabular-nums">
                                  {points} {points === 1 ? "Punkt" : "Punkte"}
                                </span>
                              </div>
                              <Image
                                src={POSITION_ICONS[position]}
                                alt={POSITION_LABELS[position]}
                                title={POSITION_LABELS[position]}
                                width={40}
                                height={42}
                                className="h-10 w-auto shrink-0"
                              />
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

      <div className="flex items-center gap-2 border-t border-border px-4 py-3.5 sm:justify-end">
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
      </div>

      <ConfirmAlert
        message="Du bist dabei, die Gruppe zu verlassen und musst erneut eingeladen werden, um wieder beitreten zu können."
        open={showLeaveGroupConfirm}
        onOpenChange={setShowLeaveGroupConfirm}
        onConfirm={async () => {
          await handleLeaveGroup(group.id);
        }}
      />
    </div>
  );
}
