import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="h-screen mbg-p-center">
      <SignIn />
    </div>
  );
}
