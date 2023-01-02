import { useEffect, useState } from "preact/hooks";
import { request } from '~/lib/request.ts'

import type { RequestType as LikeUsersRequest, ResponseType as LikeUsersResponse } from "~/routes/api/get_like_users.ts";
import Users from "~/components/Users.tsx";
import { createRef } from "preact";

export function LikeUsersModal(props: { postId: number, setModal: (modal: boolean) => void }) {

  const [users, setUsers] = useState<LikeUsersResponse>([]);
  const [loading, setLoading] = useState<boolean>(false);

  function closeModal() {
    props.setModal(false);
  }
  useEffect(() => {
    console.log("useEffect LikeUsersModal");
    setLoading(true);
    request<LikeUsersRequest, LikeUsersResponse>("get_like_users", { postId: props.postId }).then(a => {
      console.log(users);
      setLoading(false);
      setUsers(a);
    });
  }, []);

  return (
    <div class="d-block modal" tabIndex={-1}>
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Likes</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={closeModal}></button>
          </div>
          <div class="modal-body">
            {loading &&
              <div class="d-flex justify-content-center">
                <div class="spinner-border" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
            }
            <Users users={users} />
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onClick={closeModal}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
