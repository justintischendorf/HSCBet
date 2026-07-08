import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { Avatar, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

export default function Group() {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full border border-border rounded-xl bg-card px-4 h-full shadow-sm"
    >
      <AccordionItem value="backup" className="border-none">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex flex-row gap-5 items-center w-full">
            <Avatar>
              <AvatarImage
                id="profile-picture"
                src="https://api.dicebear.com/9.x/fun-emoji/svg?seed=Gruppe1"
                alt="Profilbild"
              />
            </Avatar>
            <span className="sm:text-base text-sm font-semibold">Gruppe 1</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-row gap-4">
            <section className="w-[50%]">
              <label>Beschreibung</label>
              <Separator className="sm:my-2 my-1" />
              <p className="sm:text-sm text-xs text-muted-foreground">
                Hier können Informationen über die Gruppe, ihre Ziele und
                Aktivitäten geteilt werden.
              </p>
            </section>
            <section className="w-[50%]">
              <div className="flex flex-row justify-between">
                <label>Mitglieder</label>
                <label>1/8</label>
              </div>
              <Separator className="sm:my-2 my-1" />
              <ul className="sm:text-sm text-xs text-muted-foreground">
                <li>Mitglied 1</li>
                <li>Mitglied 2</li>
                <li>Mitglied 3</li>
                <li>Mitglied 4</li>
              </ul>
            </section>
          </div>
          <div className="flex flex-row gap-4 mt-4">
            <Button size={'sm'} variant="destructive">
              Gruppe verlassen
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
