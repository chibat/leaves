import { useEffect, useState } from "preact/hooks";
import Users from "~/components/Users.tsx";
import { User } from "~/server/trpc/procedures/getFollowingUsers.ts";
import { trpc } from "~/client/trpc.ts";

export function LikeUsersModal(props: { postId: number, setModal: (modal: boolean) => void }) {

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  function closeModal() {
    props.setModal(false);
  }
  useEffect(() => {
    setLoading(true);
    trpc.getLikeUsers.query({ postId: props.postId }).then(a => {
      setLoading(false);
      setUsers(a);
    });
  }, []);

  return (
    <div class="d-block modal" tabIndex={-1}>
      <div class="modal-dialog" style={{ boxShadow: "0 0.5rem 1rem rgb(0 0 0 / 15%)" }}>
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
