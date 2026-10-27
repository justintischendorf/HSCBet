import { t, type UnwrapSchema } from "elysia";

export namespace GroupModel {
  export const CreateNewGroup = t.Object({
    name: t.String({ maxLength: 18 }),
    description: t.String({ maxLength: 64 }),
    fileId: t.Optional(t.String()),
    user: t.Object({
      id: t.String(),
      name: t.String(),
      email: t.String(),
    }),
  });

  export const LeaveGroup = t.Object({
    groupId: t.String(),
  });

  export const SetFavoriteGroup = t.Object({
    groupId: t.String(),
  });

  export const InviteToGroup = t.Object({
    playerId: t.String(),
  });

  export const EditGroup = t.Object({
    groupId: t.String(),
    name: t.String({ maxLength: 18 }),
    description: t.String({ maxLength: 64 }),
    // undefined = keep current picture, null = remove picture, string = replace picture
    fileId: t.Optional(t.Nullable(t.String())),
  });
}

export type GroupModel = {
  [k in keyof typeof GroupModel]: UnwrapSchema<(typeof GroupModel)[k]>;
};
