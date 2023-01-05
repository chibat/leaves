
type Props = {
  users: { id: number; name: string; picture?: string }[];
};

export default function Users(props: Props) {

  return (
    <>
      {props.users.map(user =>
        <div className="mb-3" key={user.id}>
          {user.picture &&
            <img src={user.picture} alt="mdo" width="32" height="32" className="rounded-circle me-2" />
          }
          <a href={`/users/${user.id}`} className="noDecoration">{user.name}</a>
        </div>
      )}
    </>
  );
}
