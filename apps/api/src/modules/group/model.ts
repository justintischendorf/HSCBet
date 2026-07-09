import { t, UnwrapSchema } from "elysia";

export namespace GroupModel {
  export const CreateNewGroup = t.Object({
    name: t.String({ maxLength: 20 }),
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
}

export type GroupModel = {
  [k in keyof typeof GroupModel]: UnwrapSchema<(typeof GroupModel)[k]>;
};
