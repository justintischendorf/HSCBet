import Elysia, { t } from "elysia";
import { sessionPlugin } from "../auth";
import { GroupService } from "./service";
import { GroupModel } from "./model";
import { contextPlugin } from "../../context";
import { IdParams } from "src/global/models";

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
  );
