import { GroupModel } from '@repo/database';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { apiClient } from '@/lib/api-client';
import { queryClient } from '@/lib/queryClient';
import { toast } from 'sonner';

type GroupWithUsers = GroupModel & {
  user: { id: string; name: string; image: string | null }[];
  files: { id: string }[];
};

export default function Group({ group }: { group: GroupWithUsers }) {
  const imageUrl = group.files?.[0]
    ? `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/media/${group.files[0].id}/image`
    : undefined;

  async function handleLeaveGroup(groupId: string) {
    const { error: leaveGroupError } =
      await apiClient.api.group.leaveGroup.patch({
        groupId,
      });

    if (leaveGroupError) {
      toast.error(
        leaveGroupError.status + ': ' + leaveGroupError.value.message,
      );
      return;
    }

    toast.success('Gruppe erfolgreich verlassen!');
    queryClient.invalidateQueries({ queryKey: ['groups'] });
  }

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full border border-border rounded-xl bg-card px-4 h-full shadow-sm"
    >
      <AccordionItem value="backup" className="border-none">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex flex-row gap-5 items-center w-full">
            <Avatar className="transition-all duration-300 ease-out group-aria-expanded/accordion-trigger:size-16 sm:group-aria-expanded/accordion-trigger:size-20">
              <AvatarImage
                id="profile-picture"
                src={imageUrl}
                alt="Profilbild"
              />
              <AvatarFallback className="text-md font-medium transition-all duration-300 ease-out group-aria-expanded/accordion-trigger:text-3xl sm:group-aria-expanded/accordion-trigger:text-4xl">
                {group.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="sm:text-base text-sm font-semibold">
              {group.name}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-6">
            <section>
              <p className="text-sm font-medium mb-1.5">Beschreibung</p>
              <p className="sm:text-sm text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap wrap-break-word">
                {group.description || 'Keine Beschreibung vorhanden.'}
              </p>
            </section>

            <Separator />

            <section>
              <div className="flex flex-row items-center justify-between mb-2">
                <p className="text-sm font-medium">Mitglieder</p>
                <span className="sm:text-sm text-xs text-muted-foreground">
                  {group.user.length}/16
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                {group.user.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 rounded-lg bg-muted/50 px-2 py-1.5 min-w-0"
                  >
                    <Avatar size="sm">
                      <AvatarImage
                        src={user.image ?? undefined}
                        alt={user.name}
                      />
                      <AvatarFallback>
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate text-xs sm:text-sm">
                      {user.name}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <Separator className="my-4" />
          <div className="flex">
            <Button
              size={'lg'}
              variant="destructive"
              className="w-full sm:w-auto sm:ml-auto"
              onClick={(e) => {
                e.preventDefault();
                handleLeaveGroup(group.id);
              }}
            >
              Gruppe verlassen
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
