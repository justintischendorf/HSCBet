import { Avatar, AvatarImage } from './ui/avatar';

export default function Group() {
  return (
    <div className="sm:w-[48%] w-full flex flex-col gap-2 border border-muted-200 rounded-lg p-4">
      <div className="flex sm:flex-row justify-between items-center">
        <div className="flex items-center flex-row gap-4">
          <Avatar>
            <AvatarImage
              id="profile-picture"
              src="https://api.dicebear.com/9.x/fun-emoji/svg?seed=Gruppe1"
              alt="Profilbild"
            />
          </Avatar>
          <p>Gruppe 1</p>
        </div>
        <span className="text-sm text-muted-foreground">1/5</span>
      </div>
    </div>
  );
}
