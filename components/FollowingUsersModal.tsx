import Users from '~/components/Users.tsx'
import { request } from '~/lib/request.ts'
import type { RequestType, ResponseType } from "~/routes/api/get_following_users.ts";
import { useState, useEffect } from "preact/hooks";

export default function FollowingUsersModal(props: { userId: number, setModal: (modal: boolean) => void }) {

  const [users, setUsers] = useState<ResponseType>([]);
  const [loading, setLoading] = useState<boolean>(false);

  function closeModal() {
    props.setModal(false);
  }

  useEffect(() => {
    setLoading(true);
    request<RequestType, ResponseType>("get_following_users", { userId: props.userId }).then(results => {
      setLoading(false);
      setUsers(results);
    });
  }, []);

  return (
    <div class="d-block modal" tabIndex={-1}>
      <div class="modal-dialog" style={{ boxShadow: "0 0.5rem 1rem rgb(0 0 0 / 15%)" }}>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Following</h5>
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
      </div></div>
  );
}
