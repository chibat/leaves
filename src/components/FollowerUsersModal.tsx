
import { useEffect, useState } from "react";
import Users from '~/components/Users.tsx'
import { api } from "~/client/api.ts";
import type { User } from "~/common/types.ts";

export default function FollowerUsersModal(props: { userId: number, setModal: (modal: boolean) => void }) {

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  function closeModal() {
    props.setModal(false);
  }

  useEffect(() => {
    setLoading(true);
    api.getFollowerUsers({ userId: props.userId }).then(results => {
      setLoading(false);
      setUsers(results);
    });
  }, []);

  return (
    <div className="d-block modal" tabIndex={-1}>
      <div className="modal-dialog" style={{ boxShadow: "0 0.5rem 1rem rgb(0 0 0 / 15%)" }}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Follower</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={closeModal}></button>
          </div>
          <div className="modal-body">
            {loading &&
              <div className="d-flex justify-content-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            }
            <Users users={users} />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={closeModal}>Close</button>
          </div>
        </div>
      </div>
    </div>);
}
