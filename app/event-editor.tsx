import { Redirect } from "expo-router";

export default function EventEditorRedirect() {
  return <Redirect href={"/task-editor" as never} />;
}
