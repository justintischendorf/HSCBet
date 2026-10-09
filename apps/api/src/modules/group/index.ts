import Elysia from "elysia";

import { contextPlugin } from "../../context";
import { IdParams } from "../../global/models";
import { sessionPlugin } from "../auth";
import { GroupModel } from "./model";
import { GroupService } from "./service";

export const group = new Elysia({ prefix: "/group" })
  .use(contextPlugin)
  .use(sessionPlugin)

  // --------------------------------------------------------------------------> GET api/group
  //                                                                             - get all groups for user from the database
  .get("/", async ({ set, user }) => {
    set.status = 200;
    return {
      success: true,
      group: await GroupService.getAllGroupsForUser({ user }),
    };
  })

  // --------------------------------------------------------------------------> GET api/group/:id
  //                                                                             - get group by id
  .get(
    "/:id",
    async ({ set, params }) => {
      set.status = 200;
      return {
        success: true,
        group: await GroupService.getGroupById({ params }),
      };
    },
    {
      params: IdParams,
    },
  )

  // --------------------------------------------------------------------------> POST api/group
  //                                                                             - create a new group by a user
  .post(
    "/",
    async ({ set, user, body }) => {
      set.status = 200;
      return {
        success: true,
        group: await GroupService.createNewGroup({ user, body }),
      };
    },
    {
      body: GroupModel.CreateNewGroup,
    },
  )

  // --------------------------------------------------------------------------> POST api/group/:id/invite
  //                                                                             - invite a player to the group by id (leader only)
  .post(
    "/:id/invite",
    async ({ set, user, params, body, store }) => {
      await GroupService.inviteToGroup({
        user,
        params,
        body,
        queueManager: store.queueManager,
      });

      set.status = 200;
      return { success: true };
    },
    {
      params: IdParams,
      body: GroupModel.InviteToGroup,
    },
  )

  // --------------------------------------------------------------------------> PATCH api/group/leaveGroup
  //                                                                             - leave a group, deleting it if it becomes empty
  .patch(
    "/leaveGroup",
    async ({ set, user, body, store }) => {
      const { s3Manager } = store;

      set.status = 200;
      return {
        success: true,
        group: await GroupService.leaveGroup({ user, body, s3Manager }),
      };
    },
    {
      body: GroupModel.LeaveGroup,
    },
  )

  // --------------------------------------------------------------------------> PATCH api/group/editGroup
  //                                                                             - edit a group, only leader can edit
  .patch(
    "/editGroup",
    async ({ set, user, body, store }) => {
      const { s3Manager } = store;

      set.status = 200;
      return {
        success: true,
        group: await GroupService.editGroup({ user, body, s3Manager }),
      };
    },
    {
      body: GroupModel.EditGroup,
    },
  );
