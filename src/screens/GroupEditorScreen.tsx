import { Redirect } from "expo-router";

export default function GroupEditorScreen() {
  return <Redirect href={"/task-group-editor" as never} />;
}
