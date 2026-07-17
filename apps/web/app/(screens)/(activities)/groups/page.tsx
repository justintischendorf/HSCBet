"use client";

import { EmptyGroups } from "@/components/empty-groups";
import Group from "@/components/group";
import { NewGroupPopup } from "@/components/new-group-popup";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useGroups } from "@/hooks/use-groups";

export default function GroupsScreen() {
  const { data: groupsResponse, isLoading } = useGroups();
  const groups = groupsResponse?.data?.group;

  return (
    <main className="w-full sm:py-16 py-8 px-4 md:px-12 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">Meine Gruppen</h1>
        <div className="flex sm:flex-row flex-col items-end justify-between gap-4">
          <p className="text-base flex-1 min-w-0">
            Hier findest du eine Übersicht über alle Gruppen, in denen du
            Mitglied bist. Außerdem kannst du neue Gruppen erstellen oder
            bestehenden Gruppen beitreten.
          </p>
          <div className="shrink-0 sm:w-auto w-full">
            <NewGroupPopup />
          </div>
        </div>
        <Separator className="sm:my-8 my-6" />
        <div className="w-full items-center flex flex-col gap-4">
          {isLoading ? (
            <div className="flex flex-col gap-4 w-full">
              <Skeleton className="h-96 w-full" />
            </div>
          ) : groups?.length === 0 ? (
            <div className="mt-20">
              <EmptyGroups />
            </div>
          ) : (
            groups?.map((group) => {
              return <Group key={group.id} group={group} />;
            })
          )}
        </div>
      </div>
    </main>
  );
}
