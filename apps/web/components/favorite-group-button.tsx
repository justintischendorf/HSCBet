import { useMutation } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { toast } from "sonner";

import { groupsQueryKey } from "@/hooks/use-groups";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

import { Button } from "./ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";

export function FavoriteGroupButton({
  groupId,
  isFavorite,
  className,
}: {
  groupId: string;
  isFavorite: boolean;
  className?: string;
}) {
  const { mutateAsync: setFavorite, isPending } = useMutation({
    mutationFn: async () => {
      return apiClient.api.group.favorite.patch({ groupId });
    },
  });

  async function handleSetFavorite() {
    if (isFavorite) return;

    const { error } = await setFavorite();

    if (error) {
      toast.error(error.status + ": " + error.value.message);
      return;
    }

    toast.success(
      "Favorit gesetzt! Die Gruppe wird auf deinem Dashboard angezeigt.",
    );
    await queryClient.invalidateQueries({ queryKey: groupsQueryKey });
  }

  return (
    <HoverCard openDelay={150} closeDelay={50}>
      <HoverCardTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("shrink-0", className)}
          disabled={isPending}
          aria-pressed={isFavorite}
          aria-label={
            isFavorite ? "Favorisierte Gruppe" : "Als Favorit markieren"
          }
          onClick={handleSetFavorite}
        >
          <Star
            className={cn(
              "size-5",
              isFavorite
                ? "fill-huk-accent text-foreground dark:text-huk-accent"
                : "text-muted-foreground",
            )}
          />
        </Button>
      </HoverCardTrigger>
      <HoverCardContent side="top" className="w-60 text-xs">
        {isFavorite ? (
          <>
            <span className="font-semibold">Favorit</span> – diese Gruppe wird
            auf deinem Dashboard angezeigt.
          </>
        ) : (
          <>
            <span className="font-semibold">Als Favorit markieren</span> – die
            Gruppe wird dann auf deinem Dashboard angezeigt.
          </>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
