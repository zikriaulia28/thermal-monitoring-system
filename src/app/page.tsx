import { redirect } from "next/navigation";

export default function Home() {
  // Redirect paksa ke halaman dashboard
  redirect("/dashboard");
}
