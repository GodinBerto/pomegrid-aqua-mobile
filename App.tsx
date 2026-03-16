import { StatusBar } from "expo-status-bar";
import { AppRoot } from "@/core/AppRoot";
import "./global.css";

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <AppRoot />
    </>
  );
}
