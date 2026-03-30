import { Redirect } from "expo-router";

export default function GroupEditorRedirect() {
  return <Redirect href={"/task-group-editor" as never} />;
}
