import { Redirect } from "expo-router";

export default function EventEditorScreen() {
  return <Redirect href={"/task-editor" as never} />;
}
