import { trpc } from "~/client/trpc.ts";

export default function DeleteAccount(props: { userName: string }) {
  async function onClick() {
    if (confirm(`Delete Account "${props.userName}"`)) {
      await trpc.deleteUser.mutate();
      location.href = "/signout";
    }
  }
  return (
    <button class="btn btn-danger mt-3" type="submit" onClick={onClick}>Delete my account</button>
  );
}
