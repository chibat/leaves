import { action } from "@void/react";

export default function DeleteAccount(props: { userName: string }) {
  async function onClick() {
    if (confirm(`Delete Account "${props.userName}"`)) {
      const result = await action("/settings?deleteAccount", {});
      if (!result.ok) throw result.error;
    }
  }
  return (
    <button className="btn btn-danger mt-3" type="submit" onClick={onClick}>Delete my account</button>
  );
}
